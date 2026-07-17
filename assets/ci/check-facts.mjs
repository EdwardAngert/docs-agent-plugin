#!/usr/bin/env node
// Docs Assist reference-registry checker.
//
// Deterministic, dependency-free: checks the mechanical parts of
// .docs-assist/reference.yml that do not need agent judgment.
//   - fact entries: does `source`'s file exist, and does it still contain
//     the referenced identifier? Catches a renamed, moved, or deleted
//     constant. It does not compare values (that needs understanding the
//     source language's syntax); value drift stays an agent-side check
//     during drafting or an audit.
//   - pointer entries: does `ref`'s file, and heading anchor if given,
//     still exist? The same broken-link check the plugin already runs on
//     doc-to-doc links, applied to registry pointers.
// example-variable and term entries have no mechanical source to check
// against (consistency across docs is a judgment call about which value
// should win, not a pass/fail), so they stay agent-checked.
//
// Usage: node check-facts.mjs [reference.yml path]
// Env:
//   DOCS_ASSIST_REFERENCE   path to the registry (default: .docs-assist/reference.yml)
//   CHECK_FACTS_STRICT      "1" exits nonzero when any entry is stale
//   GITHUB_STEP_SUMMARY     when set, the report is appended there too

import { readFileSync, existsSync, appendFileSync } from 'node:fs';

const registryPath = process.argv[2] || process.env.DOCS_ASSIST_REFERENCE || '.docs-assist/reference.yml';

function report(text) {
  console.log(text);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, text + '\n');
}

if (!existsSync(registryPath)) {
  report(`## Reference registry check\n\nNo registry at \`${registryPath}\`. Nothing to check.\n`);
  process.exit(0);
}

// Minimal, schema-specific parse: top-level keys are entry names; each
// entry's fields are 2-space-indented \`field: value\` lines. This file's
// shape is controlled by the plugin itself, so a small line-based parser
// avoids adding a YAML dependency for one script.
function parseEntries(src) {
  const entries = {};
  let current = null;
  for (const raw of src.split('\n')) {
    if (/^\s*#/.test(raw) || !raw.trim()) continue;
    const top = raw.match(/^([A-Za-z0-9_-]+):\s*$/);
    if (top) { current = top[1]; entries[current] = {}; continue; }
    const field = raw.match(/^\s{2}([A-Za-z0-9_-]+):\s*(.*)$/);
    if (field && current) {
      const [, key, rawValue] = field;
      const value = rawValue.trim().replace(/\s+#.*$/, '').replace(/^["']|["']$/g, '').trim();
      entries[current][key] = value;
    }
  }
  return entries;
}

function slugify(heading) {
  return heading.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
}

const entries = parseEntries(readFileSync(registryPath, 'utf8'));
const stale = [];

for (const [name, entry] of Object.entries(entries)) {
  if (entry.kind === 'fact' && entry.source) {
    const [file, identifier] = entry.source.split(':');
    if (!file) continue;
    if (!existsSync(file)) {
      stale.push(`- \`${name}\`: source file \`${file}\` no longer exists`);
    } else if (identifier && !readFileSync(file, 'utf8').includes(identifier)) {
      stale.push(`- \`${name}\`: \`${identifier}\` no longer appears in \`${file}\` (renamed, moved, or removed)`);
    }
  }

  if (entry.kind === 'pointer' && entry.ref) {
    const [file, anchor] = entry.ref.split('#');
    if (!file) continue;
    if (!existsSync(file)) {
      stale.push(`- \`${name}\`: pointer target \`${file}\` no longer exists`);
    } else if (anchor) {
      const headings = [...readFileSync(file, 'utf8').matchAll(/^#{1,6}\s+(.+)$/gm)].map((m) => slugify(m[1]));
      if (!headings.includes(anchor)) {
        stale.push(`- \`${name}\`: heading \`#${anchor}\` no longer found in \`${file}\``);
      }
    }
  }
}

if (stale.length) {
  report(`## Reference registry check\n\n${stale.length} entr${stale.length === 1 ? 'y' : 'ies'} out of date in \`${registryPath}\`:\n\n${stale.join('\n')}\n\nUpdate the registry, or whatever it points to.\n`);
} else {
  report(`## Reference registry check\n\nEvery \`fact\` source and \`pointer\` target in \`${registryPath}\` still resolves.\n`);
}

if (stale.length && process.env.CHECK_FACTS_STRICT === '1') process.exit(1);
