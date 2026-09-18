#!/usr/bin/env node
// Docs Assist docs-decay detector.
//
// Deterministic, dependency-free: ranks every doc by accumulated staleness
// risk, the drift the per-PR docs-impact check cannot see because it built
// up across many changes. Signals per doc:
//   - age: days since the doc itself last changed
//   - verification: days since it was last verified (or never)
//   - churn: commits that touched related source files since the doc last
//     changed, where "related" means files that mention the identifiers the
//     doc uses in inline code
//   - attested: open entries in the doc's attested-claims ledger
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
//   DOCS_DECAY_VERIFIED_PATTERN    a regex, one capture group holding a
//                           YYYY-MM-DD date, matched against the full doc
//                           body (default: verified_body_pattern from
//                           .docs-assist/config.yml, else none)
//   DOCS_ASSIST_REPORT_FILE    when set, the full report is written there too
//   GITHUB_STEP_SUMMARY     when set, the report is appended there too
//
// "Never verified" is a frontmatter- and sidecar-only reading by default,
// and a project that records verification some other way (a rendered
// component, a footer, a build-time badge) will see every doc it verified
// still called never-verified. That is a project's own established schema
// the plugin should extend rather than fight (frontmatter-spec.md), so a
// project can declare one pattern in config.yml instead of the plugin
// guessing at every site generator's own verification convention.

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

function verifiedBodyPattern() {
  const raw = process.env.DOCS_DECAY_VERIFIED_PATTERN || (() => {
    try {
      const m = readFileSync('.docs-assist/config.yml', 'utf8').match(/^verified_body_pattern:\s*(.+)$/m);
      return m ? m[1].trim().replace(/^["']|["']$/g, '') : null;
    } catch { return null; }
  })();
  if (!raw) return null;
  try { return new RegExp(raw); }
  catch { return null; } // a malformed project pattern degrades to "no pattern", not a crash
}

const DOCS = docsDir();
const VERIFIED_BODY_PATTERN = verifiedBodyPattern();
const TOP = Number(process.env.DOCS_DECAY_TOP || 10);
const THRESHOLD = Number(process.env.DOCS_DECAY_THRESHOLD || 10);
const NOW = Date.now();
const DAY = 24 * 60 * 60 * 1000;

// The documentation set is what git tracks. A file on disk that git ignores is
// working material: a report, an intake packet, a planning note. Ranking or
// auditing those produces confident findings about files no reader will ever
// see, which is a category error that has misfired here more than once.
//
// Outside a checkout there is no index to consult and the whole tree is what
// shipped (an installed plugin cache, an extracted tarball), so the walk stands
// unfiltered there.
function keepTracked(files) {
  let tracked;
  try {
    execSync('git rev-parse --git-dir', { stdio: 'ignore' });
    tracked = new Set(
      execSync('git ls-files -z', { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
        .split('\0')
        .filter(Boolean),
    );
  } catch {
    return files;
  }
  return files.filter((f) => tracked.has(f.replace(/^\.\//, '')));
}

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

const docs = keepTracked(mdFiles(DOCS));
if (existsSync('README.md')) docs.push('README.md');

function report(text) {
  console.log(text);
  // The screen gets the judgment; a file gets the detail when a run is long
  // enough to scroll past. See reference/reports.md for the contract.
  if (process.env.DOCS_ASSIST_REPORT_FILE) {
    appendFileSync(process.env.DOCS_ASSIST_REPORT_FILE, text + '\n');
  }
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, text + '\n');
}

if (!docs.length) {
  report(`## Docs decay\n\nNo docs found under \`${DOCS}\`. Nothing to rank.\n`);
  process.exit(0);
}

// Per-document state lives in the plugin's own store, so the docs stay
// portable plain markdown. Different site generators accept different
// frontmatter schemas, and assuming a site generator at all is already too
// much, so nothing the plugin depends on is written into the documents.
//
// Frontmatter is still read when a project keeps it. That is not a fallback
// shim: a project whose generator renders `last-verified` into the page should
// have that respected. The sidecar is where the plugin WRITES; frontmatter is
// something the plugin READS when the project already has it. The sidecar wins
// when both carry a value.
const STATE_PATH = process.env.DOCS_ASSIST_STATE || '.docs-assist/state/docs.yml';

function readState(path) {
  if (!existsSync(path)) return {};
  const state = {};
  let currentDoc = null;
  let currentList = null;
  for (const raw of readFileSync(path, 'utf8').split('\n')) {
    if (/^\s*#/.test(raw) || !raw.trim()) continue;
    const doc = raw.match(/^([^\s#][^:]*):\s*$/);
    if (doc) { currentDoc = doc[1].trim(); state[currentDoc] = { attested: 0 }; currentList = null; continue; }
    if (!currentDoc) continue;
    const field = raw.match(/^\s{2}([a-z-]+):\s*(.*)$/);
    if (field) {
      const [, key, value] = field;
      if (!value.trim()) { currentList = key; continue; }
      currentList = null;
      if (key === 'last-verified') state[currentDoc][key] = value.trim().replace(/^["']|["']$/g, '');
      continue;
    }
    if (currentList === 'attested' && /^\s{4}-\s/.test(raw)) state[currentDoc].attested += 1;
  }
  return state;
}

const docState = readState(STATE_PATH);

const rows = [];
for (const doc of docs) {
  const text = readFileSync(doc, 'utf8');
  const stateKey = doc.replace(/^\.\//, '');
  const sidecar = docState[stateKey] || {};

  // Age: days since the doc's last commit. Untracked or uncommitted docs
  // are brand new by definition.
  const lastCommit = sh(`git log -1 --format=%ct -- "${doc}"`);
  const ageDays = lastCommit ? Math.floor((NOW - Number(lastCommit) * 1000) / DAY) : 0;

  // Verification: days since last verified, or null when nothing records it.
  const fmVerified = text.match(/^last-verified:\s*["']?(\d{4}-\d{2}-\d{2})/m);
  const bodyVerified = VERIFIED_BODY_PATTERN ? text.match(VERIFIED_BODY_PATTERN) : null;
  const verifiedOn = sidecar['last-verified'] || (fmVerified ? fmVerified[1] : null) || (bodyVerified ? bodyVerified[1] : null);
  const verifiedDays = verifiedOn ? Math.floor((NOW - Date.parse(verifiedOn)) / DAY) : null;

  // Attested: open ledger entries, from the store or from frontmatter.
  const fmBlock = (text.match(/^---\n([\s\S]*?)\n---/) || [])[1] || '';
  const fmAttested = fmBlock.includes('sme-attested:')
    ? (fmBlock.match(/^\s+-\s+section:/gm) || []).length
    : 0;
  const attested = sidecar.attested || fmAttested;

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
  else if (verifiedDays > 90) reasons.push(`last verified ${verifiedDays} days ago`);
  if (attested) reasons.push(`${attested} open attested claim${attested === 1 ? '' : 's'}`);

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
out += `\n**Suggested follow-up**: work the queue top-down with \`/docs-assist:update\` (when the related code changed) or \`/docs-assist:verify\` (for procedural docs, which it re-runs step by step, recording a fresh verification date on a clean pass).\n`;

report(out);
if (decayed.length && process.env.DOCS_DECAY_STRICT === '1') process.exit(1);
