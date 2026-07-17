#!/usr/bin/env node
// Docs Assist docs-decay detector.
//
// Deterministic, dependency-free: ranks every doc by accumulated staleness
// risk, the drift the per-PR docs-impact check cannot see because it built
// up across many changes. Signals per doc:
//   - age: days since the doc itself last changed
//   - verification: days since its `last-verified` frontmatter (or never)
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

  // Verification: days since last-verified, or null when the field is absent.
  const lv = text.match(/^last-verified:\s*["']?(\d{4}-\d{2}-\d{2})/m);
  const verifiedDays = lv ? Math.floor((NOW - Date.parse(lv[1])) / DAY) : null;

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
    for (const t of tokens) {
      const hits = sh(`git grep -l -F -- ${JSON.stringify(t)} -- ':!*.md' ':!*.mdx'`);
      for (const f of hits.split('\n')) if (f) churnFiles.add(f);
      if (churnFiles.size >= 50) break;
    }
    if (churnFiles.size) {
      const files = [...churnFiles].map((f) => JSON.stringify(f)).join(' ');
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
  else if (verifiedDays > 90) reasons.push(`last verified ${verifiedDays} days ago`);
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
