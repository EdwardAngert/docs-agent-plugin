#!/usr/bin/env node
// The working journal: the plugin's scratch pad for a branch. Notes on what
// people said, the questions and their answers, the decisions, and what ran,
// kept where git never sees it.
//
//   node journal.mjs path              print this branch's journal path, creating
//                                      its directory, and keep working material
//                                      out of git
//   node journal.mjs merged            journals whose branch is merged into the default branch
//   node journal.mjs clear BRANCH      delete one branch's journal
//
// Claude calls these from the plugin's instructions; nobody types them. What
// goes in a journal, and how it is kept true, is in
// skills/docs-assist/reference/journal.md. Claude edits the file directly:
// it is notes, not a log, and a line changes when what it says changes.
//
// One file per branch, at .docs-assist/journal/<branch>.md.
//
// Nothing the plugin works with is ever committed unless someone asks:
// every working directory under .docs-assist/ (the journal, drafts, reports,
// intake material, claim-check output) gets a `.gitignore` containing `*`,
// which also hides that `.gitignore` itself, so the project's own .gitignore
// never changes and `git status` stays clean.
//
// Off switch: `journal: false` in .docs-assist/config.yml, or
// DOCS_ASSIST_JOURNAL=0 in the environment.

import { execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, realpathSync, rmSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

// --- where things are ----------------------------------------------------------

export function git(cwd, args) {
  try {
    return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 5000 }).trim();
  } catch {
    return '';
  }
}

// Where `git` itself cannot run (a sandbox that blocks it, a host without it),
// the repository is still on disk: find it and read HEAD directly, so the
// journal still lands in the branch's file.
function findGitDir(cwd) {
  let dir = cwd;
  for (;;) {
    if (existsSync(join(dir, '.git'))) return dir;
    const up = dirname(dir);
    if (up === dir) return null;
    dir = up;
  }
}

function headFromDisk(root) {
  try {
    const head = readFileSync(join(root, '.git', 'HEAD'), 'utf8').trim();
    const prefix = 'ref: refs/heads/';
    if (head.startsWith(prefix)) {
      const branch = head.slice(prefix.length);
      let sha = '';
      try { sha = readFileSync(join(root, '.git', 'refs', 'heads', branch), 'utf8').trim(); } catch { /* packed */ }
      return { branch, sha: sha.slice(0, 7) };
    }
    return /^[0-9a-f]{40}$/.test(head) ? { branch: null, sha: head.slice(0, 7) } : null;
  } catch {
    return null;
  }
}

export function rootOf(cwd) {
  const top = git(cwd, ['rev-parse', '--show-toplevel']) || findGitDir(cwd) || cwd;
  try { return realpathSync(top); } catch { return top; }
}

export function branchOf(root) {
  const name = git(root, ['rev-parse', '--abbrev-ref', 'HEAD']);
  if (name === 'HEAD') return `detached-${git(root, ['rev-parse', '--short', 'HEAD']) || 'unknown'}`;
  if (name) return name;
  const disk = headFromDisk(root);
  if (disk && disk.branch) return disk.branch;
  if (disk && disk.sha) return `detached-${disk.sha}`;
  return 'local'; // no repository at all
}

// A branch name becomes a path under the journal directory: keep its slashes,
// drop anything that could climb out.
function safeBranch(branch) {
  return branch
    .split('/')
    .map((part) => part.replace(/[^A-Za-z0-9._-]/g, '-').replace(/^\.+/, ''))
    .filter(Boolean)
    .join('/') || 'local';
}

export function journalDir(root) {
  return join(root, '.docs-assist', 'journal');
}

export function journalPath(root, branch = branchOf(root)) {
  return join(journalDir(root), `${safeBranch(branch)}.md`);
}

// Directories under .docs-assist/ that hold working material. The rules a
// project set up (config.yml, style.md, reference.yml, personas/) sit beside
// them; whether git sees those is the contributor's choice at setup, made with
// a .docs-assist/.gitignore, never by this list.
export const WORKING_DIRS = ['journal', 'loop', 'plan', 'reports', 'intake', 'claims', 'state'];

// Give every working directory that exists a `.gitignore` containing `*`.
// Returns the directories it had to cover, so a caller can say so once.
export function ignoreWorkingMaterial(root) {
  const covered = [];
  for (const name of WORKING_DIRS) {
    const dir = join(root, '.docs-assist', name);
    if (!existsSync(dir)) continue;
    const ignore = join(dir, '.gitignore');
    if (existsSync(ignore)) continue;
    try { writeFileSync(ignore, '*\n'); covered.push(name); } catch { /* read-only checkout */ }
  }
  return covered;
}

function ensureDir(root, path) {
  mkdirSync(dirname(path), { recursive: true });
  ignoreWorkingMaterial(root);
}

export function isOff(root) {
  if (process.env.DOCS_ASSIST_JOURNAL === '0') return true;
  try {
    const text = readFileSync(join(root, '.docs-assist', 'config.yml'), 'utf8');
    return /^journal:\s*["']?(false|off|no)["']?\s*(#.*)?$/m.test(text);
  } catch {
    return false;
  }
}

// --- the project's rules: local unless the contributor shares them ------------

// A `.docs-assist/.gitignore` holding `*` hides the whole folder, the ignore
// file included. Working directories carry their own, so sharing the rules is
// removing this one file, and working material stays hidden either way.
const LOCAL_MARK = '*\n';

export function rulesShared(root) {
  return git(root, ['ls-files', '--', '.docs-assist']).split('\n').some((f) => f && !f.endsWith('/.gitignore'));
}

export function keepRulesLocal(root) {
  if (rulesShared(root)) return 'shared';
  const dir = join(root, '.docs-assist');
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, '.gitignore'), LOCAL_MARK);
  return 'local';
}

export function shareRules(root) {
  const ignore = join(root, '.docs-assist', '.gitignore');
  try {
    if (readFileSync(ignore, 'utf8') === LOCAL_MARK) unlinkSync(ignore);
  } catch { /* nothing to remove */ }
  return 'shared';
}

// --- a file only this clone should see ------------------------------------------

// `.git/info/exclude` works like .gitignore but is never tracked, so a personal
// file (a CLAUDE.local.md) stays out of git without changing anything the team
// shares. Returns 'added', 'already', or '' outside a git repository.
export function excludeLocally(root, path) {
  const where = git(root, ['rev-parse', '--git-path', 'info/exclude']);
  if (!where) return '';
  const file = isAbsolute(where) ? where : join(root, where);
  const line = `/${path.replace(/^\/+/, '')}`;
  let text = '';
  try { text = readFileSync(file, 'utf8'); } catch { /* not there yet */ }
  if (text.split('\n').some((l) => l.trim() === line)) return 'already';
  mkdirSync(dirname(file), { recursive: true });
  appendFileSync(file, `${text && !text.endsWith('\n') ? '\n' : ''}${line}\n`);
  return 'added';
}

// --- housekeeping --------------------------------------------------------------

export function defaultBase(root) {
  const head = git(root, ['symbolic-ref', '--short', 'refs/remotes/origin/HEAD']);
  for (const ref of [head, 'origin/main', 'origin/master', 'main', 'master']) {
    if (ref && git(root, ['rev-parse', '--verify', '--quiet', ref])) return ref;
  }
  return null;
}

function journalsUnder(dir, prefix = '') {
  const out = [];
  let names = [];
  try { names = readdirSync(dir); } catch { return out; }
  for (const name of names) {
    const full = join(dir, name);
    let st;
    try { st = statSync(full); } catch { continue; }
    if (st.isDirectory()) out.push(...journalsUnder(full, `${prefix}${name}/`));
    else if (name.endsWith('.md')) out.push(`${prefix}${name.slice(0, -3)}`);
  }
  return out;
}

export function mergedJournals(root) {
  const base = defaultBase(root);
  if (!base) return [];
  const merged = new Set(
    git(root, ['branch', '--merged', base, '--format=%(refname:short)']).split('\n').filter(Boolean),
  );
  const current = safeBranch(branchOf(root));
  return journalsUnder(journalDir(root)).filter((b) => b !== current && merged.has(b));
}

// Drafts whose doc has been placed: from then on the doc is the source, and a
// draft left behind is a second copy of its facts that goes stale.
export function placedDrafts(root) {
  const loop = join(root, '.docs-assist', 'loop');
  let names = [];
  try { names = readdirSync(loop); } catch { return []; }
  return names.filter((name) => {
    try {
      const text = readFileSync(join(loop, name, 'packet.md'), 'utf8');
      return /^\s*status:\s*["']?(written|edited)\b/m.test(text);
    } catch { return false; }
  }).sort();
}

export function clearDraft(root, slug) {
  if (!slug || /[\\/]|^\.\.?$/.test(slug)) return false;
  const dir = join(root, '.docs-assist', 'loop', slug);
  if (!existsSync(dir)) return false;
  rmSync(dir, { recursive: true, force: true });
  return true;
}

// --- CLI -------------------------------------------------------------------------

function cli() {
  const [cmd, arg] = process.argv.slice(2);
  const root = rootOf(process.env.CLAUDE_PROJECT_DIR || process.cwd());

  if (cmd === 'path') {
    ignoreWorkingMaterial(root);
    if (isOff(root)) { console.log('The journal is turned off for this project: keep no notes.'); return 0; }
    const path = journalPath(root);
    ensureDir(root, path);
    console.log(path);
    return 0;
  }

  if (cmd === 'merged') { console.log(mergedJournals(root).join('\n')); return 0; }

  if (cmd === 'clear') {
    if (!arg) { console.error('clear needs a branch name'); return 1; }
    const path = journalPath(root, arg);
    if (safeBranch(arg) === safeBranch(branchOf(root))) { console.error('Not clearing the current branch\'s journal.'); return 1; }
    try { unlinkSync(path); console.log(`Removed ${relative(root, path)}`); return 0; }
    catch { console.error(`No journal at ${relative(root, path)}`); return 1; }
  }

  if (cmd === 'exclude') {
    if (!arg) { console.error('exclude needs a path'); return 1; }
    const done = excludeLocally(root, arg);
    if (!done) { console.error('Not a git repository: nothing to exclude from.'); return 1; }
    console.log(done === 'already' ? `${arg} was already hidden from git in this clone.` : `${arg} is hidden from git in this clone only.`);
    return 0;
  }

  if (cmd === 'drafts') { console.log(placedDrafts(root).join('\n')); return 0; }

  if (cmd === 'clear-draft') {
    if (!arg) { console.error('clear-draft needs a draft name'); return 1; }
    if (clearDraft(root, arg)) { console.log(`Removed the working draft for ${arg}`); return 0; }
    console.error(`No working draft named ${arg}`);
    return 1;
  }

  if (cmd === 'rules') {
    if (arg === 'local') {
      console.log(keepRulesLocal(root) === 'shared'
        ? 'The project already shares its rules in git: left as they are.'
        : 'The rules stay on this machine: git ignores .docs-assist/.');
      return 0;
    }
    if (arg === 'shared') { shareRules(root); console.log('The rules are visible to git now; committing them is up to you.'); return 0; }
    console.error('rules needs local or shared');
    return 1;
  }

  console.error('usage: journal.mjs path | merged | clear BRANCH | drafts | clear-draft NAME | rules local|shared | exclude PATH');
  return 1;
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  process.exitCode = cli();
}
