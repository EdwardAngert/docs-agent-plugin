#!/usr/bin/env node
// Docs Assist bundle-drift checker.
//
// Deterministic, dependency-free: a hand-maintained concatenated bundle
// (llms-full.txt is the common case) drifts from the pages it duplicates, and
// the drift is silent. This catches four shapes of it.
//
//   Forward drift   A substantial source line that never made it to the bundle.
//                   Content added to a page and never synced.
//   Reverse drift   A bundle line that traces to no source and no declared
//                   scaffolding. This is the one that catches a duplicated
//                   block spliced into the middle of a fence, which is the bug
//                   that motivated the whole check: 645 lines, undetected,
//                   live on main, found by accident when badge counts stopped
//                   matching.
//   Marker parity   A per-page count that should match on both sides.
//   Element parity  Declared structural syntax, counted on both sides, to
//                   catch a convention applied by hand and applied wrong.
//
// It checks a bundle the project already keeps. It does not generate one:
// generation needs a per-stack transformation table (what is stripped, what is
// passed through, how raw imports inline, where page order comes from) and
// that is a per-site-generator design, not something to guess at. Drift
// detection is the portable half and helps whether or not the bundle is
// generated.
//
// Everything site-specific is declared in config. Nothing here knows what
// Starlight, Docusaurus, or MkDocs syntax looks like.
//
// Config, in .docs-assist/config.yml:
//
//   bundle:
//     file: public/llms-full.txt
//     sources:
//       - src/content/docs/guide
//     min_length: 70
//     page_header: "^# "
//     markers:
//       - source: "<Verified"
//         bundle: "[Verified:"
//     elements: [":::", "<Tabs>", "<Steps>"]
//     scaffolding:
//       - "^Source: "
//       - "^#"
//
// Usage: node bundle-drift.mjs [config path]
// Env:
//   DOCS_ASSIST_CONFIG      config path (default: .docs-assist/config.yml)
//   BUNDLE_DRIFT_STRICT     "1" exits nonzero when drift is found
//   GITHUB_STEP_SUMMARY     when set, the report is appended there too

import { readFileSync, existsSync, readdirSync, statSync, appendFileSync } from 'node:fs';
import { join, relative, basename } from 'node:path';

const configPath = process.argv[2] || process.env.DOCS_ASSIST_CONFIG || '.docs-assist/config.yml';

function report(text) {
  console.log(text);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, text + '\n');
}

function done(message) {
  report(`## Bundle drift\n\n${message}\n`);
  process.exit(0);
}

if (!existsSync(configPath)) done(`No config at \`${configPath}\`. Nothing to check.`);
// This check's argument is a config file, where the other deterministic checks
// take a docs directory. Handing it one crashes readFileSync with a raw EISDIR
// stack, which is the opposite of how every other bad input here is handled.
if (statSync(configPath).isDirectory()) {
  done(
    `\`${configPath}\` is a directory. This check takes the path to a config ` +
      `file (default \`.docs-assist/config.yml\`), not a docs directory.`,
  );
}

// Minimal nested-YAML read, scoped to the `bundle:` block. The plugin controls
// this file's shape, so a small parser beats a dependency.
function readBundleConfig(src) {
  const lines = src.split('\n');
  const start = lines.findIndex((l) => /^bundle:\s*$/.test(l));
  if (start === -1) return null;

  const cfg = { sources: [], elements: [], scaffolding: [], markers: [] };
  let key = null;
  let pending = null;

  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i];
    if (/^\S/.test(line) && line.trim()) break;
    if (!line.trim() || /^\s*#/.test(line)) continue;

    const scalar = line.match(/^\s{2}([a-z_]+):\s*(.*)$/);
    if (scalar) {
      const [, name, rawValue] = scalar;
      key = name;
      const value = rawValue.trim().replace(/\s+#.*$/, '');
      if (!value) { pending = null; continue; }
      if (/^\[.*\]$/.test(value)) {
        cfg[name] = value.slice(1, -1).split(',').map((v) => v.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
      } else {
        cfg[name] = value.replace(/^["']|["']$/g, '');
      }
      continue;
    }

    const item = line.match(/^\s{4}-\s*(.*)$/);
    if (item && key) {
      const value = item[1].trim();
      const inlinePair = value.match(/^([a-z_]+):\s*(.*)$/);
      if (inlinePair) {
        pending = { [inlinePair[1]]: inlinePair[2].trim().replace(/^["']|["']$/g, '') };
        if (!Array.isArray(cfg[key])) cfg[key] = [];
        cfg[key].push(pending);
      } else {
        if (!Array.isArray(cfg[key])) cfg[key] = [];
        cfg[key].push(value.replace(/^["']|["']$/g, ''));
        pending = null;
      }
      continue;
    }

    const cont = line.match(/^\s{6}([a-z_]+):\s*(.*)$/);
    if (cont && pending) pending[cont[1]] = cont[2].trim().replace(/^["']|["']$/g, '');
  }

  return cfg;
}

const cfg = readBundleConfig(readFileSync(configPath, 'utf8'));
if (!cfg) done('No `bundle:` section in config. Nothing to check.');
if (!cfg.file) done('`bundle.file` is not set. Nothing to check.');
if (!existsSync(cfg.file)) done(`No bundle at \`${cfg.file}\`. Nothing to check.`);
if (!cfg.sources?.length) done('`bundle.sources` is empty. Nothing to check.');

const minLength = Number(cfg.min_length || 70);
const DOC_EXT = /\.(md|mdx|markdown)$/i;

// Substring match, not glob: a bundle's exclusions are usually a directory
// ("one-pagers") or a filename convention ("_"), and substrings express both
// without pulling in a matcher.
const excludes = cfg.exclude || [];

function isExcluded(path) {
  return excludes.some((e) => path.includes(e) || basename(path).startsWith(e));
}

function walk(target, out = []) {
  if (!existsSync(target)) return out;
  if (!statSync(target).isDirectory()) {
    if (DOC_EXT.test(target) && !isExcluded(target)) out.push(target);
    return out;
  }
  for (const entry of readdirSync(target)) {
    if (entry.startsWith('.') || entry === 'node_modules') continue;
    walk(join(target, entry), out);
  }
  return out;
}

const sourceFiles = [];
for (const s of cfg.sources) walk(s, sourceFiles);
if (!sourceFiles.length) done('No source docs matched `bundle.sources`. Nothing to check.');

// Frontmatter never survives into a bundle: every transformation table strips
// it. Comparing it produces a forward-drift finding on every single page.
function bodyOf(src) {
  const lines = src.split('\n');
  if (lines[0]?.trim() !== '---') return lines;
  const close = lines.indexOf('---', 1);
  return close === -1 ? lines : lines.slice(close + 1);
}

// Normalize away the differences a bundle is expected to introduce, so only
// real divergence remains: whitespace, link targets, and quote style.
function normalize(line) {
  return line
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[`*_~]/g, '')
    .replace(/["'`‘’“”]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

const bundleRaw = readFileSync(cfg.file, 'utf8').split('\n');
const bundleNorm = new Set(bundleRaw.map(normalize).filter(Boolean));

const scaffolding = (cfg.scaffolding || []).map((p) => new RegExp(p));
const sourceNorm = new Map();

for (const file of sourceFiles) {
  for (const line of bodyOf(readFileSync(file, 'utf8'))) {
    const n = normalize(line);
    if (n) sourceNorm.set(n, relative(process.cwd(), file));
  }
}

// Forward: substantial source prose missing from the bundle.
const forward = [];
for (const file of sourceFiles) {
  const rel = relative(process.cwd(), file);
  const lines = bodyOf(readFileSync(file, 'utf8'));
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (/^\s*`{3,}/.test(raw)) { inFence = !inFence; continue; }
    if (inFence) continue;
    if (/^\s*(import|export)\s/.test(raw)) continue;
    if (/^\s*</.test(raw)) continue;
    const n = normalize(raw);
    if (n.length < minLength) continue;
    if (!bundleNorm.has(n)) forward.push({ rel, line: i + 1, text: raw.trim().slice(0, 100) });
  }
}

// Reverse: bundle content that traces nowhere. The splice catcher.
const reverse = [];
for (let i = 0; i < bundleRaw.length; i++) {
  const raw = bundleRaw[i];
  const n = normalize(raw);
  if (n.length < minLength) continue;
  if (sourceNorm.has(n)) continue;
  if (scaffolding.some((p) => p.test(raw))) continue;
  reverse.push({ line: i + 1, text: raw.trim().slice(0, 100) });
}

// Marker parity, per page when the bundle can be segmented, total otherwise.
const markerFindings = [];
const pageHeader = cfg.page_header ? new RegExp(cfg.page_header) : null;

function countOccurrences(haystack, needle) {
  if (!needle) return 0;
  return haystack.split(needle).length - 1;
}

for (const marker of cfg.markers || []) {
  if (!marker.source || !marker.bundle) continue;
  const bundleText = bundleRaw.join('\n');
  let sourceTotal = 0;
  const perFile = [];
  for (const file of sourceFiles) {
    const c = countOccurrences(bodyOf(readFileSync(file, 'utf8')).join('\n'), marker.source);
    sourceTotal += c;
    if (c) perFile.push({ rel: relative(process.cwd(), file), count: c });
  }
  const bundleTotal = countOccurrences(bundleText, marker.bundle);
  if (sourceTotal !== bundleTotal) {
    markerFindings.push({ marker, sourceTotal, bundleTotal, perFile, segmented: Boolean(pageHeader) });
  }
}

// Element parity: declared structural syntax, counted on both sides.
const elementFindings = [];
for (const element of cfg.elements || []) {
  const bundleText = bundleRaw.join('\n');
  let sourceTotal = 0;
  for (const file of sourceFiles) sourceTotal += countOccurrences(bodyOf(readFileSync(file, 'utf8')).join('\n'), element);
  const bundleTotal = countOccurrences(bundleText, element);
  if (sourceTotal !== bundleTotal) elementFindings.push({ element, sourceTotal, bundleTotal });
}

const out = ['## Bundle drift', ''];
out.push(`Bundle \`${cfg.file}\` against ${sourceFiles.length} source file${sourceFiles.length === 1 ? '' : 's'}.`, '');

const total = forward.length + reverse.length + markerFindings.length + elementFindings.length;

if (!total) {
  out.push('No drift. Every substantial source line is in the bundle, every bundle line traces back, and all declared counts match.', '');
} else {
  if (reverse.length) {
    out.push(`### Reverse drift: ${reverse.length} bundle line${reverse.length === 1 ? '' : 's'} trace to nothing`, '');
    out.push('Content in the bundle that is in no source file and matches no declared scaffolding. A run of these usually means a duplicated block was spliced in.', '');
    for (const r of reverse.slice(0, 15)) out.push(`- \`${cfg.file}:${r.line}\`: ${r.text}`);
    if (reverse.length > 15) out.push(`- ...and ${reverse.length - 15} more`);
    out.push('');
  }
  if (forward.length) {
    out.push(`### Forward drift: ${forward.length} source line${forward.length === 1 ? '' : 's'} missing from the bundle`, '');
    out.push('Content added to a page and never synced.', '');
    for (const f of forward.slice(0, 15)) out.push(`- \`${f.rel}:${f.line}\`: ${f.text}`);
    if (forward.length > 15) out.push(`- ...and ${forward.length - 15} more`);
    out.push('');
  }
  if (markerFindings.length) {
    out.push('### Marker parity', '');
    for (const m of markerFindings) {
      out.push(`- \`${m.marker.source}\` appears ${m.sourceTotal}x in source, \`${m.marker.bundle}\` appears ${m.bundleTotal}x in the bundle`);
      for (const p of m.perFile) out.push(`  - \`${p.rel}\`: ${p.count}`);
    }
    out.push('');
  }
  if (elementFindings.length) {
    out.push('### Element parity', '');
    for (const e of elementFindings) out.push(`- \`${e.element}\`: ${e.sourceTotal}x in source, ${e.bundleTotal}x in the bundle`);
    out.push('');
  }
}

report(out.join('\n'));

if (total && process.env.BUNDLE_DRIFT_STRICT === '1') process.exit(1);
