#!/usr/bin/env node
// Docs Assist docs-impact detector.
//
// Deterministic, dependency-free, and cheap: classifies a diff against the
// change types that ripple into documentation (the same taxonomy as the
// plugin's impact-analysis reference) and reports which docs are implicated.
// It never calls an agent or the network. The expensive step, running
// /docs-assist:update, is a human or agent decision this report feeds.
//
// Usage: node docs-impact.mjs [baseRef]     (default: origin/main)
// Env:
//   DOCS_DIR                   docs directory (default: docs_dir from
//                              .docs-assist/config.yml, else "docs")
//   DOCS_IMPACT_LINE_THRESHOLD source lines changed that trigger the
//                              "large change, no docs touched" signal
//                              (default: 100)
//   DOCS_IMPACT_STRICT         "1" exits nonzero when signals fire
//   DOCS_IMPACT_REPORT_FILE    when set, the report is also written there
//                              (the workflow uses this to post a sticky
//                              PR comment)
//   GITHUB_STEP_SUMMARY        when set, the report is appended there too

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, readdirSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';

const base = process.argv[2] || 'origin/main';
const range = `${base}...HEAD`;
const sh = (cmd) => execSync(cmd, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

function docsDir() {
  if (process.env.DOCS_DIR) return process.env.DOCS_DIR;
  try {
    const cfg = readFileSync('.docs-assist/config.yml', 'utf8');
    const m = cfg.match(/^docs_dir:\s*(\S+)/m);
    if (m) return m[1];
  } catch { /* no config */ }
  return 'docs';
}
const DOCS = docsDir();
const LINE_THRESHOLD = Number(process.env.DOCS_IMPACT_LINE_THRESHOLD || 100);
const isDoc = (f) => /\.mdx?$/.test(f);

// Load every doc into memory once; docs sets are small and this avoids
// running grep per candidate term.
function loadDocs() {
  const files = [];
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (isDoc(e.name)) files.push(p);
    }
  };
  if (existsSync(DOCS)) walk(DOCS);
  for (const f of ['README.md', 'llms.txt']) if (existsSync(f)) files.push(f);
  return files.map((f) => ({ file: f, text: readFileSync(f, 'utf8') }));
}

// 1. Classify the changed files.
const nameStatus = sh(`git diff --name-status -M ${range}`).trim();
const changed = nameStatus ? nameStatus.split('\n').map((l) => l.split('\t')) : [];
const movedDocs = changed.filter(([s, , to]) => s.startsWith('R') && isDoc(to || ''));
const changedDocs = changed.filter(([s, f]) => !s.startsWith('R') && isDoc(f)).map(([, f]) => f);
const changedSrc = changed.filter(([, f]) => f && !isDoc(f)).map(([, f]) => f)
  .filter((f) => /\.(js|mjs|ts|jsx|tsx|py|go|rs|java|rb|sh|c|cpp|h|json|ya?ml|toml)$/.test(f));

// 2. Heading changes in docs (anchor-link risk). Renamed docs are scanned
// too: a move plus a heading edit rides both edges.
const headingChanges = [];
for (const f of [...changedDocs, ...movedDocs.map(([, , to]) => to)]) {
  let diff = '';
  try { diff = sh(`git diff -U0 ${range} -- "${f}"`); } catch { continue; }
  const hits = diff.split('\n').filter((l) => /^[-+]#{1,4} /.test(l));
  if (hits.length) headingChanges.push({ file: f, hits: hits.slice(0, 6) });
}

// 3. Changed identifiers and proper nouns from the source diff that the
// docs mention. This is the code-to-docs edge, approximated cheaply.
const docsSet = loadDocs();
const termHits = new Map();
if (changedSrc.length && docsSet.length) {
  let srcDiff = '';
  try { srcDiff = sh(`git diff -U0 ${range} -- ${changedSrc.map((f) => `"${f}"`).join(' ')}`); } catch { /* ignore */ }
  const tokens = new Set();
  for (const line of srcDiff.split('\n')) {
    if (!/^[-+][^-+]/.test(line)) continue;
    for (const t of line.slice(1).matchAll(/[A-Za-z][A-Za-z0-9_-]{3,}/g)) tokens.add(t[0]);
    if (tokens.size > 400) break;
  }
  const noise = /^(this|that|with|from|return|const|function|import|export|class|public|private|string|number|boolean|value|values|true|false|null|undefined|error|errors|test|tests|https?|about|which|would|should|there|these|those)$/i;
  const docsLower = docsSet.map((d) => ({ file: d.file, text: d.text.toLowerCase() }));
  for (const token of tokens) {
    if (noise.test(token)) continue;
    const needle = token.toLowerCase();
    const mentions = docsLower.filter((d) => d.text.includes(needle)).map((d) => d.file);
    if (mentions.length) termHits.set(token, mentions);
    if (termHits.size >= 20) break;
  }
}

// 4. Large source change with no docs touched.
let srcLines = 0;
try {
  for (const l of sh(`git diff --numstat ${range}`).trim().split('\n')) {
    const [add, del, f] = l.split('\t');
    if (f && !isDoc(f)) srcLines += (Number(add) || 0) + (Number(del) || 0);
  }
} catch { /* ignore */ }
const bigAndSilent = srcLines >= LINE_THRESHOLD && changedDocs.length === 0 && movedDocs.length === 0;

// 5. Report.
const signals = [];
if (movedDocs.length) signals.push(`**Docs moved or renamed** (inbound links, \`llms.txt\`, and navigation may break):\n${movedDocs.map(([, from, to]) => `- \`${from}\` -> \`${to}\``).join('\n')}`);
if (headingChanges.length) signals.push(`**Headings changed** (anchor links may break):\n${headingChanges.map((h) => `- \`${h.file}\``).join('\n')}`);
if (termHits.size) signals.push(`**Changed code terms that the docs mention**:\n${[...termHits].map(([t, files]) => `- \`${t}\`: ${[...new Set(files)].slice(0, 4).map((f) => `\`${f}\``).join(', ')}`).join('\n')}`);
if (bigAndSilent) signals.push(`**${srcLines} source lines changed with no docs touched** (threshold: ${LINE_THRESHOLD}). If this changes documented behavior, the docs are now behind.`);

let report;
if (signals.length) {
  report = `## Docs impact detected\n\n${signals.join('\n\n')}\n\n**Suggested follow-up**: run \`/docs-assist:update ${range}\` in Claude Code to bring the affected docs in line, or note in the PR why no docs change is needed.\n`;
} else {
  report = '## Docs impact: none detected\n\nNo doc moves, heading changes, documented-term changes, or large silent source changes in this diff.\n';
}
console.log(report);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, report + '\n');
if (process.env.DOCS_IMPACT_REPORT_FILE) writeFileSync(process.env.DOCS_IMPACT_REPORT_FILE, report);
if (signals.length && process.env.DOCS_IMPACT_STRICT === '1') process.exit(1);
