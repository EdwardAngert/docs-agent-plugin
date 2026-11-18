#!/usr/bin/env node
// Docs Assist docs-decay detector.
//
// Deterministic, dependency-free: ranks every doc by accumulated staleness
// risk, the drift the per-PR docs-impact check cannot see because it built
// up across many changes. Signals per doc:
//   - age: days since the doc itself last changed
//   - verification: days since it was last verified, when the project
//     records that in its docs and declares how (verified_body_pattern)
//   - churn: commits that touched related source files since the doc last
//     changed, where "related" means files that mention the identifiers the
//     doc uses in inline code
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
// Docs carry no plugin metadata: no frontmatter field, no sidecar file the
// plugin writes. Site generators disagree on frontmatter, many docs have no
// generator at all, and nothing the plugin works with is committed unasked.
// A project that already records verification in its docs (a frontmatter
// field, a rendered component, a footer) declares one pattern in config.yml,
// and the verification signal reads that; without one, the signal is off.

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

// One YAML scalar, as a person would write it: single-quoted (the form the
// docs show, since a regex is full of backslashes), double-quoted, or bare
// with an optional trailing comment. Not general YAML; just enough that the
// ordinary ways of writing one value all read the same.
function yamlScalar(v) {
  v = v.trim();
  if (v.startsWith("'")) {
    // '' is an escaped quote; the first lone ' closes the string.
    let out = '';
    for (let i = 1; i < v.length; i++) {
      if (v[i] !== "'") { out += v[i]; continue; }
      if (v[i + 1] === "'") { out += "'"; i++; continue; }
      return out;
    }
    return out;
  }
  if (v.startsWith('"')) {
    const m = v.match(/^"((?:[^"\\]|\\.)*)"/);
    if (m) { try { return JSON.parse(`"${m[1]}"`); } catch { return m[1]; } }
    return v.slice(1);
  }
  return v.replace(/\s+#.*$/, '');
}

// Returns { pattern, problem }. A configured pattern that cannot work is
// reported in the output rather than swallowed: silently degrading to "no
// pattern" reproduces the exact symptom the setting exists to fix, every doc
// called never-verified, with nothing saying why.
function verifiedBodyPattern() {
  let raw = process.env.DOCS_DECAY_VERIFIED_PATTERN;
  let source = 'DOCS_DECAY_VERIFIED_PATTERN';
  if (!raw) {
    try {
      const m = readFileSync('.docs-assist/config.yml', 'utf8').match(/^verified_body_pattern:[ \t]*(.+)$/m);
      if (m) { raw = yamlScalar(m[1]); source = 'verified_body_pattern in .docs-assist/config.yml'; }
    } catch { /* no config */ }
  }
  if (!raw) return { pattern: null, problem: null };
  let pattern;
  try { pattern = new RegExp(raw); }
  catch (e) { return { pattern: null, problem: `${source} is not a valid regular expression (${e.message}), so it was ignored.` }; }
  if (new RegExp(`${raw}|`).exec('').length < 2) {
    return { pattern: null, problem: `${source} has no capture group, so it cannot say which date a doc was verified on. Wrap the YYYY-MM-DD part in parentheses.` };
  }
  return { pattern, problem: null, source };
}

const DOCS = docsDir();
const { pattern: VERIFIED_BODY_PATTERN, problem: VERIFIED_PATTERN_PROBLEM, source: VERIFIED_PATTERN_SOURCE } = verifiedBodyPattern();
let bodyPatternMatches = 0;
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

const rows = [];
for (const doc of docs) {
  const text = readFileSync(doc, 'utf8');

  // Age: days since the doc's last commit. Untracked or uncommitted docs
  // are brand new by definition.
  const lastCommit = sh(`git log -1 --format=%ct -- "${doc}"`);
  const ageDays = lastCommit ? Math.floor((NOW - Number(lastCommit) * 1000) / DAY) : 0;

  // Verification: days since last verified, read with the project's own
  // pattern; null when the project records none.
  const bodyMatch = VERIFIED_BODY_PATTERN ? text.match(VERIFIED_BODY_PATTERN) : null;
  const bodyVerified = bodyMatch && /^\d{4}-\d{2}-\d{2}/.test(bodyMatch[1] || '') ? bodyMatch[1].slice(0, 10) : null;
  if (bodyVerified) bodyPatternMatches += 1;
  const verifiedOn = bodyVerified;
  const verifiedDays = verifiedOn ? Math.floor((NOW - Date.parse(verifiedOn)) / DAY) : null;

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
  // doc age accrue slowly. A project that records no verification gets no
  // verification term at all, rather than every doc marked never verified. The
  // weights are documented here so the ranking is explainable, not magic.
  const score =
    churn * 3 +
    Math.min(ageDays / 30, 12) +
    (!VERIFIED_BODY_PATTERN ? 0 : verifiedDays === null ? 2 : Math.min(verifiedDays / 30, 12));

  const reasons = [];
  if (churn) reasons.push(`${churn} commit${churn === 1 ? '' : 's'} to related source since last doc change`);
  if (ageDays > 90) reasons.push(`doc untouched for ${ageDays} days`);
  if (VERIFIED_BODY_PATTERN && verifiedDays === null) reasons.push('never verified');
  else if (verifiedDays > 90) reasons.push(`last verified ${verifiedDays} days ago`);

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
if (VERIFIED_PATTERN_PROBLEM) {
  out += `\n**Verification pattern not used**: ${VERIFIED_PATTERN_PROBLEM}\n`;
} else if (VERIFIED_BODY_PATTERN && !bodyPatternMatches) {
  out += `\n**Verification pattern matched nothing**: ${VERIFIED_PATTERN_SOURCE} is set, but no doc contains a match with a YYYY-MM-DD date in its first capture group. If your docs do record verification in the body, the pattern does not match how they write it.\n`;
}
out += `\n**Suggested follow-up**: work the queue from the top. Ask Claude to bring a doc in line with the code that changed under it, or, for a procedural doc, to run its steps and confirm they still work.\n`;

report(out);
if (decayed.length && process.env.DOCS_DECAY_STRICT === '1') process.exit(1);
