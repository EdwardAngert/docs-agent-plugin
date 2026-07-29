#!/usr/bin/env node
// Docs Assist docs-decay detector.
//
// Deterministic, dependency-free: ranks every doc by accumulated staleness
// risk, the drift the per-PR docs-impact check cannot see because it built
// up across many changes. Signals per doc:
//   - age: days since the doc itself last changed
//   - verification: days since its `last-verified` frontmatter (or never),
//     or — where section-verification.mjs found markers for this doc — days
//     since its stalest section, which is a truer read of a doc whose parts
//     decay unevenly than a single page-level date
//   - churn: commits that touched related source files since the doc last
//     changed, where "related" means files that mention the identifiers the
//     doc uses in inline code
//   - attested: open entries in the doc's `sme-attested` ledger
// Output is a ranked re-verification queue, worst first. It reports; it
// never edits. /docs-assist:health runs it for the Freshness dimension, and
// it works standalone.
//
// Usage: node docs-decay.mjs [docsDir]
// Env:
//   DOCS_DIR                docs directory (default: docs_dir from
//                           .docs-assist/config.yml, else "docs")
//   DOCS_DECAY_TOP          rows to show (default: 10)
//   DOCS_DECAY_STRICT       "1" exits nonzero when any doc scores at or
//                           above DOCS_DECAY_THRESHOLD (default: 10)
//   DOCS_DECAY_THRESHOLD    score that counts as decayed (default: 10)
//   GITHUB_STEP_SUMMARY     when set, the report is appended there too
//
// Section-level verification (opt-in; see reference/section-verification.md)
// is read from .docs-assist/verification/sections.json when present, written
// by section-verification.mjs. Its absence changes nothing: every doc falls
// back to page-level `last-verified`, which is the default for every project
// that hasn't run the extractor or has no markers.

import { execSync } from 'node:child_process';
import { readFileSync, existsSync, readdirSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';

const sh = (cmd) => {
  try { return execSync(cmd, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim(); }
  catch { return ''; }
};

function docsDir() {
  if (process.argv[2]) return process.argv[2];
  if (process.env.DOCS_DIR) return process.env.DOCS_DIR;
  try {
    const m = readFileSync('.docs-assist/config.yml', 'utf8').match(/^docs_dir:\s*(\S+)/m);
    if (m) return m[1];
  } catch { /* no config */ }
  return 'docs';
}

const DOCS = docsDir();
const TOP = Number(process.env.DOCS_DECAY_TOP || 10);
const THRESHOLD = Number(process.env.DOCS_DECAY_THRESHOLD || 10);
const NOW = Date.now();
const DAY = 24 * 60 * 60 * 1000;

function mdFiles(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...mdFiles(p));
    else if (/\.mdx?$/.test(e.name)) out.push(p);
  }
  return out;
}

const docs = mdFiles(DOCS);
if (existsSync('README.md')) docs.push('README.md');

// Section-level verification index, if section-verification.mjs has been
// run for this repo. Keyed by doc path, each entry an array of
// { heading, date (YYYY-MM), method, line }. Absent entirely for most
// projects, which is the expected default.
let sectionIndex = {};
const SECTIONS_FILE = process.env.SECTION_VERIFICATION_OUT
  ? `${process.env.SECTION_VERIFICATION_OUT}/sections.json`
  : '.docs-assist/verification/sections.json';
if (existsSync(SECTIONS_FILE)) {
  try { sectionIndex = JSON.parse(readFileSync(SECTIONS_FILE, 'utf8')); }
  catch { /* malformed or empty; treat as no section data */ }
}

// Per-method staleness thresholds are opt-in, read from
// `.docs-assist/config.yml`'s `verification-tiers:` map, e.g.:
//   verification-tiers:
//     tested: 180
//     community: 60
// A method value on a marker is matched against these keys by substring
// (case-insensitive); the first match wins. No config, or a marker with no
// method, falls back to DEFAULT_VERIFY_THRESHOLD (90), same as today. This
// stays conditional on a project opting into method tags at all — most
// verification dates in the wild carry no method field to tier by.
const DEFAULT_VERIFY_THRESHOLD = 90;
let verifyTiers = {};
try {
  const cfg = readFileSync('.docs-assist/config.yml', 'utf8');
  const block = cfg.match(/^verification-tiers:\n((?:[ \t]+.+\n?)*)/m);
  if (block) {
    for (const line of block[1].split('\n')) {
      const m = line.match(/^\s+([\w.-]+):\s*(\d+)/);
      if (m) verifyTiers[m[1].toLowerCase()] = Number(m[2]);
    }
  }
} catch { /* no config, or no tiers section; flat default applies */ }

function verifyThreshold(method) {
  if (!method) return DEFAULT_VERIFY_THRESHOLD;
  const lower = method.toLowerCase();
  for (const [key, days] of Object.entries(verifyTiers)) {
    if (lower.includes(key)) return days;
  }
  return DEFAULT_VERIFY_THRESHOLD;
}

function report(text) {
  console.log(text);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, text + '\n');
}

if (!docs.length) {
  report(`## Docs decay\n\nNo docs found under \`${DOCS}\`. Nothing to rank.\n`);
  process.exit(0);
}

const rows = [];
for (const doc of docs) {
  const text = readFileSync(doc, 'utf8');

  // Age: days since the doc's last commit. Untracked or uncommitted docs
  // are brand new by definition.
  const lastCommit = sh(`git log -1 --format=%ct -- "${doc}"`);
  const ageDays = lastCommit ? Math.floor((NOW - Number(lastCommit) * 1000) / DAY) : 0;

  // Verification: days since last-verified, or since the doc's stalest
  // section marker when section-verification.mjs found any for this doc —
  // a truer read than the page-level date for a doc whose parts decay
  // unevenly. Null when neither is present.
  let verifiedDays = null;
  let verifyThresholdDays = DEFAULT_VERIFY_THRESHOLD;
  let stalestSection = null;
  const sections = sectionIndex[doc];
  if (sections && sections.length) {
    for (const s of sections) {
      const days = Math.floor((NOW - Date.parse(`${s.date}-01`)) / DAY);
      if (stalestSection === null || days > verifiedDays) {
        verifiedDays = days;
        stalestSection = s;
      }
    }
    verifyThresholdDays = verifyThreshold(stalestSection.method);
  } else {
    const lv = text.match(/^last-verified:\s*["']?(\d{4}-\d{2}-\d{2})/m);
    verifiedDays = lv ? Math.floor((NOW - Date.parse(lv[1])) / DAY) : null;
  }

  // Attested: open sme-attested ledger entries.
  const fmBlock = (text.match(/^---\n([\s\S]*?)\n---/) || [])[1] || '';
  const attested = fmBlock.includes('sme-attested:')
    ? (fmBlock.match(/^\s+-\s+section:/gm) || []).length
    : 0;

  // Churn: commits touching related source files since the doc last changed.
  // Related = non-doc files that mention identifiers the doc uses in inline
  // code. Capped so a doc with a hundred backticked tokens stays cheap.
  let churn = 0;
  const churnFiles = new Set();
  if (lastCommit) {
    const tokens = [...new Set(
      [...text.matchAll(/`([A-Za-z][A-Za-z0-9_.-]{3,40})`/g)]
        .map((m) => m[1])
        .filter((t) => !/^(https?|true|false|null)/.test(t))
    )].slice(0, 20);
    if (tokens.length) {
      // One git grep per doc, all tokens OR'd, instead of one call per
      // token: /docs-assist:health runs this inline and promises a fast
      // scorecard, so the whole scan is two subprocess calls per doc.
      const patternArgs = tokens.map((t) => `-e ${JSON.stringify(t)}`).join(' ');
      const hits = sh(`git grep -l -F ${patternArgs} -- ':!*.md' ':!*.mdx'`);
      for (const f of hits.split('\n')) if (f) churnFiles.add(f);
    }
    if (churnFiles.size) {
      const files = [...churnFiles].slice(0, 50).map((f) => JSON.stringify(f)).join(' ');
      const log = sh(`git log --oneline --since=@${lastCommit} -- ${files}`);
      churn = log ? log.split('\n').length : 0;
    }
  }

  // Score: churn dominates (code moved under the doc), verification age and
  // doc age accrue slowly, open attested claims add steady pressure. The
  // weights are documented here so the ranking is explainable, not magic.
  const score =
    churn * 3 +
    Math.min(ageDays / 30, 12) +
    (verifiedDays === null ? 2 : Math.min(verifiedDays / 30, 12)) +
    attested * 2;

  const reasons = [];
  if (churn) reasons.push(`${churn} commit${churn === 1 ? '' : 's'} to related source since last doc change`);
  if (ageDays > 90) reasons.push(`doc untouched for ${ageDays} days`);
  if (verifiedDays === null) reasons.push('never verified');
  else if (verifiedDays > verifyThresholdDays) {
    reasons.push(stalestSection
      ? `stalest section ("${stalestSection.heading}") verified ${verifiedDays} days ago`
      : `last verified ${verifiedDays} days ago`);
  }
  if (attested) reasons.push(`${attested} open sme-attested claim${attested === 1 ? '' : 's'}`);

  rows.push({ doc, score: Math.round(score * 10) / 10, reasons });
}

rows.sort((a, b) => b.score - a.score);
const decayed = rows.filter((r) => r.score >= THRESHOLD);
const shown = rows.slice(0, TOP);

let out = `## Docs decay: re-verification queue\n\n`;
out += `${docs.length} docs ranked; ${decayed.length} at or above the decay threshold (${THRESHOLD}).\n\n`;
out += `| Score | Doc | Why |\n| ---: | --- | --- |\n`;
for (const r of shown) {
  out += `| ${r.score} | \`${r.doc}\` | ${r.reasons.join('; ') || 'no decay signals'} |\n`;
}
out += `\n**Suggested follow-up**: work the queue top-down with \`/docs-assist:update\` (when the related code changed) or \`/docs-assist:verify\` (for procedural docs, which it re-runs step by step, bumping \`last-verified\` on a clean pass).\n`;

report(out);
if (decayed.length && process.env.DOCS_DECAY_STRICT === '1') process.exit(1);
