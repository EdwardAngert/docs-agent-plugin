#!/usr/bin/env node
// Docs Assist example-continuity checker.
//
// Deterministic, dependency-free: the mechanical half of the continuity
// chair's job. A reader working straight through a set of guides should meet
// the same values and the same placeholder spelling every time. When page four
// switches from `pi-admin` to `pi`, the commands stop composing and the reader
// translates as they go.
//
// It checks what the project has DECLARED, and infers nothing.
//
//   1. `example-variable` entries with a `variants` list: an exact declared
//      wrong value appearing in a code block. Vale does not look inside fences
//      by default, so this is the half the linter structurally cannot reach.
//   2. Placeholder spelling: YOUR-PI-IP against YOUR_PI_IP against
//      <your-pi-ip>. Same token, different conventions.
//
// `term` entries are deliberately NOT checked here. A term's code form often
// differs from its prose form on purpose, and this repo's own registry says so:
// the `docs-assist-name` entry notes that the plugin id "stays docs-assist in
// code, commands, and file paths" while the prose canonical is "Docs Assist".
// Checking term variants inside fences would flag the correct form. Terms stay
// with Vale, in prose, where their rule actually applies.
//
// An earlier version guessed roles from syntax, clustering `ssh user@host`
// targets and example domains. On its first real corpus it reported four
// findings, essentially all false: `ads.example.com` and `pi-hole.local` are
// different referents, a placeholder in host position is not drift, and
// `$USER` against `${USER}` is ordinary shell syntax. Role cannot be inferred
// from a literal, and guessing produced exactly the noise that gets a check
// switched off. This is the lesson `leverage` and `just` already taught the
// Vale styles, so the guessing is gone rather than tuned.
//
// No registry means nothing to check, and that is correct: declaring the
// canonical values is agent work during init or an audit, and enforcing them
// mechanically is this script's work.
//
// Usage: node example-continuity.mjs [docs dir]
// Env:
//   DOCS_ASSIST_DOCS_DIR        docs root (default: docs)
//   DOCS_ASSIST_REFERENCE       registry path (default: .docs-assist/reference.yml)
//   EXAMPLE_CONTINUITY_STRICT   "1" exits nonzero when anything is flagged
//   GITHUB_STEP_SUMMARY         when set, the report is appended there too

import { execSync } from 'node:child_process';
import { readFileSync, existsSync, readdirSync, statSync, appendFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const docsDir = process.argv[2] || process.env.DOCS_ASSIST_DOCS_DIR || 'docs';
const registryPath = process.env.DOCS_ASSIST_REFERENCE || '.docs-assist/reference.yml';

function report(text) {
  console.log(text);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, text + '\n');
}

if (!existsSync(docsDir)) {
  report(`## Example continuity\n\nNo docs directory at \`${docsDir}\`. Nothing to check.\n`);
  process.exit(0);
}

// Same minimal line-based parse check-facts.mjs uses: the file's shape is
// controlled by the plugin, so a small parser beats a YAML dependency.
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
      let value = rawValue.trim();
      if (/^\[.*\]$/.test(value)) {
        entries[current][key] = value.slice(1, -1).split(',')
          .map((v) => v.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
      } else {
        entries[current][key] = value.replace(/\s+#.*$/, '').replace(/^["']|["']$/g, '').trim();
      }
    }
  }
  return entries;
}

const registry = existsSync(registryPath) ? parseEntries(readFileSync(registryPath, 'utf8')) : {};

const declared = [];
for (const [name, entry] of Object.entries(registry)) {
  const variants = Array.isArray(entry.variants) ? entry.variants : (entry.variants ? [entry.variants] : []);
  if (!variants.length) continue;
  if (entry.kind !== 'example-variable') continue;
  declared.push({ name, kind: entry.kind, canonical: entry.value || '', variants });
}

const DOC_EXT = /\.(md|mdx|markdown)$/i;

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

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith('.') || entry === 'node_modules') continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (DOC_EXT.test(entry)) out.push(full);
  }
  return out;
}

// A placeholder a human is meant to replace. Shell variables ($USER, ${USER})
// are deliberately excluded: brace syntax is ordinary shell, not drift.
const PLACEHOLDER = /(<[a-z][a-z0-9]*(?:[-_][a-z0-9]+)+>|\b(?:YOUR|MY|REPLACE|CHANGE|EXAMPLE)[-_][A-Z0-9]+(?:[-_][A-Z0-9]+)*\b|\b[A-Z0-9]+(?:[-_][A-Z0-9]+)*[-_](?:HERE|GOES_HERE|PLACEHOLDER)\b)/g;

const variantHits = [];
const placeholders = new Map();

for (const file of keepTracked(walk(docsDir))) {
  const rel = relative(process.cwd(), file);
  const lines = readFileSync(file, 'utf8').split('\n');

  let inFence = false;
  let fenceMark = '';

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const fence = raw.trim().match(/^(`{3,})(.*)$/);
    if (fence) {
      if (!inFence) { inFence = true; fenceMark = fence[1]; }
      else if (raw.trim() === fenceMark) { inFence = false; fenceMark = ''; }
      continue;
    }
    if (!inFence) continue;

    for (const d of declared) {
      for (const variant of d.variants) {
        if (!variant) continue;
        const pattern = new RegExp(`(^|[^A-Za-z0-9_-])${variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^A-Za-z0-9_-]|$)`);
        if (pattern.test(raw)) {
          variantHits.push({ ...d, variant, where: `${rel}:${i + 1}` });
        }
      }
    }

    for (const m of raw.matchAll(PLACEHOLDER)) {
      const token = m[1];
      const key = token.replace(/^<|>$/g, '').replace(/[-_]/g, '').toLowerCase();
      if (!placeholders.has(key)) placeholders.set(key, new Map());
      const forms = placeholders.get(key);
      if (!forms.has(token)) forms.set(token, []);
      if (forms.get(token).length < 6) forms.get(token).push(`${rel}:${i + 1}`);
    }
  }
}

const spelling = [];
for (const [, forms] of placeholders) {
  if (forms.size > 1) spelling.push([...forms.entries()]);
}

const out = ['## Example continuity', ''];

if (!declared.length && !existsSync(registryPath)) {
  out.push(`No registry at \`${registryPath}\`, so there are no declared values to enforce.`, '');
  out.push('Declaring canonical example values is part of `/docs-assist:init` or an audit. This check enforces them once they exist.', '');
}

if (!variantHits.length && !spelling.length) {
  out.push('Declared values and placeholder spellings are consistent across the set. Nothing to flag.', '');
} else {
  if (variantHits.length) {
    out.push('### Declared variants used in code blocks', '');
    out.push('The registry names these as the wrong form. Vale does not look inside fences, so this is the half it cannot reach.', '');
    for (const h of variantHits) {
      out.push(`- \`${h.variant}\` at \`${h.where}\`${h.canonical ? ` (registry says \`${h.canonical}\`, entry \`${h.name}\`)` : ` (entry \`${h.name}\`)`}`);
    }
    out.push('');
  }
  if (spelling.length) {
    out.push('### Placeholders spelled more than one way', '');
    out.push('Same placeholder, different conventions. Pick one and use it everywhere.', '');
    for (const forms of spelling) {
      out.push(`- ${forms.map(([t]) => `\`${t}\``).join(' / ')}`);
      for (const [token, where] of forms) out.push(`  - \`${token}\` at ${where.map((w) => `\`${w}\``).join(', ')}`);
    }
    out.push('');
  }
}

report(out.join('\n'));

if ((variantHits.length || spelling.length) && process.env.EXAMPLE_CONTINUITY_STRICT === '1') process.exit(1);
