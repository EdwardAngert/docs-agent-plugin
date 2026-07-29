#!/usr/bin/env node
// Docs Assist section-verification extractor.
//
// Deterministic, dependency-free: regexes the plain-text section-verification
// marker (see reference/section-verification.md) out of every doc in scope
// and writes a section-level index per doc. docs-decay.mjs reads that index,
// where one exists, to rank a doc by its stalest section instead of a single
// page-level `last-verified` date. A doc with no markers is untouched by this
// script and falls back to `last-verified` exactly as it does today — this is
// strictly additive, never a requirement.
//
// The marker itself:
//   ### Configuring the retry queue
//
//   **Verified 2026-07.**
//   **Verified 2026-07 — confirmed against the vendor's own API docs.**
//
// A full YYYY-MM-DD is accepted and truncated to the month; nothing here
// requires (or enforces) day precision, since most evidence backing a claim
// like this can't support one.
//
// Usage: node section-verification.mjs [docsDir] [outDir]
// Env:
//   DOCS_DIR                    docs directory (default: docs_dir from
//                                .docs-assist/config.yml, else "docs")
//   SECTION_VERIFICATION_OUT    output directory (default:
//                                ".docs-assist/verification")
//   GITHUB_STEP_SUMMARY         when set, the report is appended there too

import { readFileSync, existsSync, appendFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

function sh(args) {
  try { return execFileSync(args[0], args.slice(1), { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim(); }
  catch (e) { return e.stdout ? String(e.stdout).trim() : ''; }
}

function docsDir() {
  if (process.argv[2]) return process.argv[2];
  if (process.env.DOCS_DIR) return process.env.DOCS_DIR;
  try {
    const m = readFileSync('.docs-assist/config.yml', 'utf8').match(/^docs_dir:\s*(\S+)/m);
    if (m) return m[1];
  } catch { /* no config */ }
  return 'docs';
}

function mdFiles(dir) {
  const out = [];
  const entries = sh(['git', 'ls-files', '--', dir]);
  for (const f of entries.split('\n')) if (/\.mdx?$/.test(f)) out.push(f);
  return out;
}

const DOCS_DIR = docsDir();
const OUT_DIR = process.argv[3] || process.env.SECTION_VERIFICATION_OUT || '.docs-assist/verification';

const docs = mdFiles(DOCS_DIR);

function report(text) {
  console.log(text);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, text + '\n');
}

if (!docs.length) {
  report(`## Section verification\n\nNo docs found under \`${DOCS_DIR}\`. Nothing to extract.\n`);
  process.exit(0);
}

// A heading line, immediately or near-immediately followed by a marker line.
// Blank lines between the two are allowed (Markdown requires at least one);
// anything else interposed and the marker no longer describes that heading.
const HEADING = /^(#{2,6})\s+(.+?)\s*$/;
const MARKER = /^\*\*Verified\s+(\d{4}-\d{2})(?:-\d{2})?(?:\s*[—-]\s*(.+?))?\.\*\*\s*$/;

const NOW = Date.now();
const DAY = 24 * 60 * 60 * 1000;

const index = {};
let totalMarkers = 0;

for (const doc of docs) {
  const lines = readFileSync(doc, 'utf8').split('\n');
  const sections = [];

  for (let i = 0; i < lines.length; i++) {
    const h = lines[i].match(HEADING);
    if (!h) continue;

    // Look ahead through blank lines for the marker; stop at the next
    // non-blank, non-marker line.
    let j = i + 1;
    while (j < lines.length && lines[j].trim() === '') j++;
    const m = j < lines.length ? lines[j].match(MARKER) : null;
    if (!m) continue;

    sections.push({
      heading: h[2],
      level: h[1].length,
      date: m[1],
      method: m[2] || null,
      line: i + 1,
    });
    totalMarkers++;
  }

  if (sections.length) index[doc] = sections;
}

if (!totalMarkers) {
  report(`## Section verification\n\nNo section-level markers found under \`${DOCS_DIR}\`. Every doc falls back to page-level \`last-verified\`.\n`);
  process.exit(0);
}

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(`${OUT_DIR}/sections.json`, JSON.stringify(index, null, 2) + '\n');

// Report: stalest section per doc that has markers, oldest first. This is a
// summary for a human; docs-decay.mjs reads sections.json directly for the
// ranking that actually feeds the decay queue.
const rows = [];
for (const [doc, sections] of Object.entries(index)) {
  let stalest = sections[0];
  for (const s of sections) {
    if (Date.parse(`${s.date}-01`) < Date.parse(`${stalest.date}-01`)) stalest = s;
  }
  const ageDays = Math.floor((NOW - Date.parse(`${stalest.date}-01`)) / DAY);
  rows.push({ doc, count: sections.length, stalest, ageDays });
}
rows.sort((a, b) => b.ageDays - a.ageDays);

let out = `## Section verification\n\n`;
const docCount = Object.keys(index).length;
out += `${docCount} doc${docCount === 1 ? '' : 's'} ${docCount === 1 ? 'carries' : 'carry'} section-level markers, ${totalMarkers} marker${totalMarkers === 1 ? '' : 's'} total. Written to \`${OUT_DIR}/sections.json\`.\n\n`;
out += `| Doc | Sections marked | Stalest section | Verified |\n| --- | ---: | --- | --- |\n`;
for (const r of rows) {
  out += `| \`${r.doc}\` | ${r.count} | ${r.stalest.heading} | ${r.stalest.date} (${r.ageDays}d ago) |\n`;
}
out += `\n\`docs-decay.mjs\` reads this index for any doc listed here, ranking by its stalest section rather than \`last-verified\` alone. Docs not listed have no section markers and are unaffected.\n`;

report(out);
