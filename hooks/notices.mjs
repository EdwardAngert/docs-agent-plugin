#!/usr/bin/env node
// The plugin's proactive layer: two hooks, one scratch file, no model.
//
//   node notices.mjs record    PostToolUse on Write|Edit|MultiEdit
//   node notices.mjs surface   UserPromptSubmit
//
// `record` runs a deterministic check against the file that just changed and
// appends anything it finds to a per-session scratch file, one JSON line per
// finding. Appending, never rewriting, is what keeps parallel edits safe:
// Claude Code runs one hook per tool call, concurrently, and a read-modify-write
// of a shared file keeps only the last writer's findings. It prints nothing, so
// an edit is never interrupted.
//
// `surface` runs when the contributor next sends a prompt. It re-checks what
// accumulated, drops anything already fixed or already raised this session,
// and hands the rest to the model as context, once. Nothing to say is the
// common case, and then it prints nothing at all.
//
// The design, and the restraint rules it implements, are in
// skills/docs-assist/reference/triggering.md.
//
// What `record` checks:
//
// - An edited markdown file: its own relative links and anchors, and links
//   elsewhere in the docs that point at an anchor it no longer has. Removing
//   or renaming a heading is the edit that silently breaks other pages.
// - An edited non-markdown file: which tracked docs name it by path, so the
//   next turn knows which docs describe what just changed.
//
// `record` also keeps the plugin's working material out of git: a write
// anywhere under .docs-assist/'s working directories gives that directory a
// `.gitignore` of `*` (hooks/journal.mjs). That runs even with notices off,
// because a draft that reaches a commit is a cost the contributor never chose.
//
// Off switch: `notices: false` in .docs-assist/config.yml, or
// DOCS_ASSIST_NOTICES=0 in the environment. Every failure is silent: a hook
// that breaks a session to report its own problem is worse than no hook.

import { execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, readFileSync, realpathSync, renameSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, isAbsolute, join, relative } from 'node:path';
import { brokenInbound, brokenLinks } from './links.mjs';
import { ignoreWorkingMaterial, WORKING_DIRS } from './journal.mjs';

const MAX_DOC_MENTIONS = 5;
const MAX_NOTICES = 8;

function main() {
  const mode = process.argv[2];
  let input = {};
  try { input = JSON.parse(readFileSync(0, 'utf8') || '{}'); } catch { return; }

  const cwd = input.cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const top = git(cwd, ['rev-parse', '--show-toplevel']);
  if (!top) return;
  const root = real(top);

  if (mode === 'record') keepOutOfGit(root, input);
  if (process.env.DOCS_ASSIST_NOTICES === '0' || configSaysOff(root)) return;

  const paths = statePaths(input.session_id);
  if (!paths) return;

  if (mode === 'record') record(root, input, paths);
  else if (mode === 'surface') surface(root, paths);
}

// --- record ------------------------------------------------------------------

function editedPath(root, input) {
  const file = input.tool_input && (input.tool_input.file_path || input.tool_input.notebook_path);
  if (!file) return null;
  // Resolve symlinks on both sides: git reports the real root, while the tool
  // reports the path the session opened, and on macOS the two differ for
  // anything under /tmp or /var, or any project opened through a link.
  const abs = real(isAbsolute(file) ? file : join(input.cwd || root, file));
  const doc = relative(root, abs).split('\\').join('/');
  if (!doc || doc.startsWith('..')) return null; // outside this repository
  if (isWorkingMaterial(root, doc)) return null;
  return doc;
}

function keepOutOfGit(root, input) {
  const file = input.tool_input && input.tool_input.file_path;
  if (!file) return;
  const abs = real(isAbsolute(file) ? file : join(input.cwd || root, file));
  const rel = relative(root, abs).split('\\').join('/');
  const [top, dir] = rel.split('/');
  if (top === '.docs-assist' && WORKING_DIRS.includes(dir)) {
    try { ignoreWorkingMaterial(root); } catch { /* silent by design */ }
  }
}

function record(root, input, paths) {
  const surfaced = loadSurfaced(paths.surfaced);
  const doc = editedPath(root, input);
  if (!doc) return;

  if (/\.mdx?$/i.test(doc)) {
    for (const f of linkFindings(root, doc)) add(paths, surfaced, f);
  } else {
    const mentions = docsMentioning(root, doc);
    if (mentions.length) {
      add(paths, surfaced, {
        key: `mentions:${doc}`,
        kind: 'mentions',
        file: doc,
        docs: mentions,
      });
    }
  }
}

function linkFindings(root, doc) {
  const text = read(join(root, doc));
  if (text === null) return [];
  const found = brokenLinks(root, doc, text);
  // Only docs that name this file's basename can link to it; let git find them.
  const others = git(root, ['grep', '-l', '-F', '-e', doc.split('/').pop(), '--', '*.md', '*.mdx'])
    .split('\n')
    .filter((p) => p && p !== doc && !isWorkingMaterial(root, p))
    .map((p) => [p, read(join(root, p))])
    .filter(([, t]) => t !== null);
  found.push(...brokenInbound(root, doc, text, others));
  return found.map((b) => ({
    key: `link:${b.doc}:${b.target}`,
    kind: 'link',
    source: doc,
    doc: b.doc,
    line: b.line,
    target: b.target,
    reason: b.reason,
  }));
}

function docsMentioning(root, file) {
  // A path has to be specific enough to be a real reference: a bare `index.js`
  // or `README` matches everything.
  if (!file.includes('/')) return [];
  const out = git(root, ['grep', '-l', '-F', '-e', file, '--', '*.md', '*.mdx']);
  if (!out) return [];
  return out
    .split('\n')
    .filter(Boolean)
    .filter((p) => p !== file && !/^CHANGELOG\.md$/i.test(p) && !isWorkingMaterial(root, p))
    .slice(0, MAX_DOC_MENTIONS);
}

// --- surface -----------------------------------------------------------------

function surface(root, paths) {
  const surfaced = loadSurfaced(paths.surfaced);
  const pending = takePending(paths.pending);
  if (!pending.length) return;

  // Re-check before speaking: a link fixed later in the same turn is not news.
  const stillTrue = [];
  const rechecked = new Map();
  for (const f of pending) {
    if (surfaced.includes(f.key)) continue;
    if (f.kind === 'link') {
      if (!rechecked.has(f.source)) {
        rechecked.set(f.source, new Set(linkFindings(root, f.source).map((x) => x.key)));
      }
      if (!rechecked.get(f.source).has(f.key)) continue;
    }
    stillTrue.push(f);
  }
  const shown = stillTrue.slice(0, MAX_NOTICES);
  if (!shown.length) return;

  surfaced.push(...shown.map((f) => f.key));
  try { writeFileSync(paths.surfaced, JSON.stringify(surfaced)); } catch { /* silent by design */ }

  const lines = shown.map((f) =>
    f.kind === 'link'
      ? `- Broken link in ${f.doc} line ${f.line}: \`${f.target}\`. ${f.reason}.`
      : `- ${f.file} changed, and ${f.docs.join(', ')} ${f.docs.length === 1 ? 'names' : 'name'} it. ` +
        `Those docs may describe the behavior that changed.`,
  );
  if (stillTrue.length > shown.length) lines.push(`- And ${stillTrue.length - shown.length} more of the same kind.`);

  const context = [
    'Docs Assist checked the files edited earlier in this session, mechanically and without a model, and found:',
    ...lines,
    '',
    'How to use this:',
    '- Raise it only if it bears on what the contributor is doing now; otherwise stay silent about it.',
    '- If you raise it, say what is wrong in plain words and offer to fix it. Do not tell the contributor to run a command.',
    '- A changed file that docs name is a lead, not a finding: check whether the docs still match before saying they do not.',
    '- If the contributor declines or moves on, drop it for the rest of the session.',
  ].join('\n');

  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: context },
  }));
}

// --- helpers -----------------------------------------------------------------

function add(paths, surfaced, finding) {
  if (surfaced.includes(finding.key)) return;
  // One write of one whole line: concurrent appends from parallel hooks land
  // as separate lines rather than overwriting each other.
  try { appendFileSync(paths.pending, JSON.stringify(finding) + '\n'); } catch { /* silent by design */ }
}

function git(cwd, args) {
  try {
    return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 5000 }).trim();
  } catch {
    return '';
  }
}


// The doc set is what git tracks, and a file git ignores is working material.
// A brand-new doc is not tracked yet but is not ignored either, so it counts.
function isWorkingMaterial(root, p) {
  if (p.startsWith('.docs-assist/')) return true;
  try {
    execFileSync('git', ['check-ignore', '-q', '--', p], { cwd: root, stdio: 'ignore', timeout: 5000 });
    return true; // exit 0: ignored
  } catch {
    return false;
  }
}

function configSaysOff(root) {
  const text = read(join(root, '.docs-assist', 'config.yml'));
  return !!text && /^notices:\s*["']?(false|off|no)["']?\s*(#.*)?$/m.test(text);
}

// Two files per session: findings waiting to be raised, appended by `record`,
// and the keys already raised, written only by `surface`, which runs once per
// prompt and never alongside another `surface`.
function statePaths(sessionId) {
  if (!sessionId) return null;
  const safe = String(sessionId).replace(/[^A-Za-z0-9_-]/g, '');
  if (!safe) return null;
  const dir = join(tmpdir(), 'docs-assist-notices');
  try { mkdirSync(dir, { recursive: true }); } catch { return null; }
  return { pending: join(dir, `${safe}.pending.jsonl`), surfaced: join(dir, `${safe}.surfaced.json`) };
}

function loadSurfaced(path) {
  try {
    const s = JSON.parse(readFileSync(path, 'utf8'));
    return Array.isArray(s) ? s : [];
  } catch {
    return [];
  }
}

// Move the pending file aside before reading it, so a `record` that appends
// while this runs starts a fresh file instead of being cleared unread.
// Later lines win for the same key, and order of first appearance is kept.
function takePending(path) {
  const taken = `${path}.${process.pid}`;
  try { renameSync(path, taken); } catch { return []; }
  const byKey = new Map();
  try {
    for (const line of readFileSync(taken, 'utf8').split('\n')) {
      if (!line.trim()) continue;
      try {
        const f = JSON.parse(line);
        if (f && f.key) byKey.set(f.key, f);
      } catch { /* a torn line is skipped, not fatal */ }
    }
  } catch { /* unreadable: treat as empty */ }
  try { unlinkSync(taken); } catch { /* silent by design */ }
  return [...byKey.values()];
}

function real(p) {
  try { return realpathSync(p); } catch { /* not created yet */ }
  try { return join(realpathSync(dirname(p)), basename(p)); } catch { return p; }
}

function read(p) {
  try { return existsSync(p) ? readFileSync(p, 'utf8') : null; } catch { return null; }
}

try { main(); } catch { /* silent by design */ }
