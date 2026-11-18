// Relative-link and anchor resolution for markdown, with no dependencies.
//
// Shared by the in-session notice hook (hooks/notices.mjs) and this repo's own
// validator (scripts/validate.mjs), so the check that catches a broken anchor
// while someone edits is the same check CI runs.
//
// Deliberately conservative, because a check that fires on a legitimate link
// gets turned off. It only judges links it can resolve without knowing the
// site generator:
//
// - A same-page `#anchor`.
// - A relative path with a file extension. `.md` and `.mdx` targets also get
//   their `#anchor` checked against the target's headings.
//
// Inline links and reference definitions both count. Code, fenced or indented,
// does not.
//
// It skips everything else: absolute URLs, site-rooted paths (`/guides/x/`),
// extensionless routes (`../install/`), and anything templated. Those resolve
// through a generator's routing, which a file check cannot see.

import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, normalize, relative } from 'node:path';

// GitHub's heading-to-anchor rule: lowercase, drop punctuation other than
// hyphens and underscores, spaces become hyphens. `### /docs-assist:plan`
// becomes `docs-assistplan`.
export function slugify(heading) {
  return heading
    .replace(/<[^>]+>/g, '')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/`/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .replace(/\s/g, '-');
}

const LIST_ITEM = /^\s{0,3}(?:[-*+]|\d+[.)])\s/;

// Lines outside code blocks, fenced or indented, with their 1-based line
// numbers. An indented block is four spaces or a tab after a blank line, unless
// the nearest less-indented line above it is a list item: then the indent is
// the item's continuation, which is prose.
function proseLines(text) {
  const out = [];
  let fence = null;
  let prevBlank = true;
  let inIndented = false;
  let lastShallow = '';
  text.split('\n').forEach((line, i) => {
    const m = line.match(/^\s*(`{3,}|~{3,})/);
    if (m) {
      if (!fence) fence = m[1][0];
      else if (m[1][0] === fence) fence = null;
      prevBlank = false;
      inIndented = false;
      return;
    }
    if (fence) return;
    const blank = !line.trim();
    if (blank) { prevBlank = true; out.push({ line: i + 1, text: line }); return; }
    const deep = /^(?: {4}|\t)/.test(line);
    if (deep && (inIndented || (prevBlank && !LIST_ITEM.test(lastShallow)))) {
      inIndented = true;
      prevBlank = false;
      return;
    }
    inIndented = false;
    prevBlank = false;
    if (!deep) lastShallow = line;
    out.push({ line: i + 1, text: line });
  });
  return out;
}

// Every anchor a page exposes: heading slugs (with GitHub's -1, -2 suffixes
// for repeats), explicit `{#id}` heading ids, and HTML `id`/`name` attributes.
export function anchorsOf(text) {
  const anchors = new Set();
  const seen = new Map();
  for (const { text: line } of proseLines(text)) {
    const h = line.match(/^\s{0,3}#{1,6}\s+(.+?)\s*#*\s*$/);
    if (h) {
      const explicit = h[1].match(/\{#([^}]+)\}\s*$/);
      if (explicit) anchors.add(explicit[1]);
      const base = slugify(h[1].replace(/\{#[^}]+\}\s*$/, ''));
      const n = seen.get(base) || 0;
      anchors.add(n ? `${base}-${n}` : base);
      seen.set(base, n + 1);
    }
    for (const m of line.matchAll(/\b(?:id|name)=["']([^"']+)["']/g)) anchors.add(m[1]);
  }
  return anchors;
}

// Inline links and images outside code, and reference definitions
// (`[label]: target`), as { line, target }. A definition's target is checked
// whether or not anything uses the label: a broken one is broken either way.
export function linksOf(text) {
  const links = [];
  for (const { line, text: raw } of proseLines(text)) {
    const prose = raw.replace(/`[^`]*`/g, (s) => ' '.repeat(s.length));
    for (const m of prose.matchAll(/\]\(\s*<?([^)\s>]+)>?(?:\s+["'][^)]*["'])?\s*\)/g)) {
      links.push({ line, target: m[1] });
    }
    const def = prose.match(/^\s{0,3}\[[^\]]+\]:\s*<?([^\s>]+)>?(?:\s+["'(].*)?\s*$/);
    if (def) links.push({ line, target: def[1] });
  }
  return links;
}

const SKIP = /^(?:[a-z][a-z0-9+.-]*:|\/|\{|\$|%)/i;

// Splits a link target into what a file check can judge, or null to skip it.
export function judgeable(target) {
  if (SKIP.test(target)) return null;
  const hash = target.indexOf('#');
  let path = hash === -1 ? target : target.slice(0, hash);
  try { path = decodeURI(path); } catch { /* keep it as written */ }
  path = path.replace(/\?.*$/, '');
  const anchor = hash === -1 ? null : target.slice(hash + 1);
  if (!path) return anchor ? { path: '', anchor } : null;
  if (!/\.[A-Za-z0-9]+$/.test(path)) return null;
  return { path, anchor };
}

const isMarkdown = (p) => /\.mdx?$/i.test(p);

// Every link in one document that does not resolve.
// `root` is the repository root; `doc` is the document's path relative to it.
// `readText(relPath)` returns a file's text or null, so a caller can serve
// files from the index or from disk. `exists(relPath)` decides whether a
// target counts as present; CI passes one that rejects files git ignores,
// since those never ship.
export function brokenLinks(root, doc, text, readText = (p) => readFromDisk(root, p), exists = (p) => existsSync(join(root, p))) {
  const broken = [];
  const anchorCache = new Map();
  const anchorsFor = (p) => {
    if (!anchorCache.has(p)) {
      const t = p === doc ? text : readText(p);
      anchorCache.set(p, t === null ? null : anchorsOf(t));
    }
    return anchorCache.get(p);
  };
  for (const { line, target } of linksOf(text)) {
    const j = judgeable(target);
    if (!j) continue;
    const resolved = j.path ? normalize(join(dirname(doc), j.path)) : doc;
    if (resolved.startsWith('..')) continue; // outside the repository
    if (j.path && !exists(resolved)) {
      broken.push({ doc, line, target, reason: `${resolved} does not exist` });
      continue;
    }
    if (j.anchor && isMarkdown(resolved) && isFile(join(root, resolved))) {
      const anchors = anchorsFor(resolved);
      if (anchors && !anchors.has(j.anchor) && !anchors.has(decodeURIComponent(j.anchor))) {
        broken.push({
          doc,
          line,
          target,
          reason: `${resolved === doc ? 'this page' : resolved} has no heading or id for #${j.anchor}`,
        });
      }
    }
  }
  return broken;
}

// Links elsewhere in the set that point at an anchor `doc` no longer has.
// `others` is a list of [path, text] pairs to search.
export function brokenInbound(root, doc, text, others) {
  const anchors = anchorsOf(text);
  const broken = [];
  for (const [from, body] of others) {
    if (from === doc) continue;
    for (const { line, target } of linksOf(body)) {
      const j = judgeable(target);
      if (!j || !j.path || !j.anchor) continue;
      if (normalize(join(dirname(from), j.path)) !== doc) continue;
      if (!anchors.has(j.anchor) && !anchors.has(decodeURIComponent(j.anchor))) {
        broken.push({ doc: from, line, target, reason: `${doc} has no heading or id for #${j.anchor}` });
      }
    }
  }
  return broken;
}

function isFile(p) {
  try { return statSync(p).isFile(); } catch { return false; }
}

function readFromDisk(root, p) {
  try { return readFileSync(join(root, p), 'utf8'); } catch { return null; }
}

export const rel = (root, p) => relative(root, p).split('\\').join('/');
