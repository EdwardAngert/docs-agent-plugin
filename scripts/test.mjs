// Regression tests for the plugin's deterministic scripts and hooks.
// No dependencies. Run with: node --test scripts/test.mjs
//
// Each test builds a throwaway git repository, runs the real script against
// it, and checks the output. The cases are bugs that shipped or nearly did:
// a test here exists because the failure it pins down happened once.
//
// Model behavior is tested separately, by the eval suite in evals/.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, realpathSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { anchorsOf, brokenLinks, judgeable, slugify } from '../hooks/links.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function repo(files) {
  const dir = mkdtempSync(join(tmpdir(), 'docs-assist-test-'));
  for (const [p, body] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, p)), { recursive: true });
    writeFileSync(join(dir, p), body);
  }
  const git = (...a) => execFileSync('git', a, { cwd: dir, stdio: 'ignore' });
  git('init', '-q');
  git('add', '-A');
  git('-c', 'user.email=test@example.invalid', '-c', 'user.name=test', 'commit', '-qm', 'init');
  return dir;
}

function run(dir, script, args = [], { input, env = {} } = {}) {
  try {
    return execFileSync('node', [join(ROOT, script), ...args], {
      cwd: dir,
      input,
      encoding: 'utf8',
      env: { ...process.env, GITHUB_STEP_SUMMARY: '', DOCS_ASSIST_REPORT_FILE: '', ...env },
      stdio: ['pipe', 'pipe', 'pipe'],
    });
  } catch (e) {
    return (e.stdout || '') + (e.stderr || '');
  }
}

// --- links.mjs ---------------------------------------------------------------

test('slugify follows GitHub anchors', () => {
  assert.equal(slugify('/docs-assist:plan'), 'docs-assistplan');
  assert.equal(slugify('Customize for your team'), 'customize-for-your-team');
  assert.equal(slugify('What setup writes, and how to remove it'), 'what-setup-writes-and-how-to-remove-it');
  assert.equal(slugify('The `config.yml` file'), 'the-configyml-file');
});

test('repeated headings get numbered anchors; fenced headings do not count', () => {
  const a = anchorsOf('# Setup\n\n## Setup\n\n```md\n## Not a heading\n```\n<a id="custom"></a>\n');
  assert.ok(a.has('setup') && a.has('setup-1') && a.has('custom'));
  assert.ok(!a.has('not-a-heading'));
});

test('indented code is code; an indented list continuation is prose', () => {
  const dir = repo({
    'a.md': [
      '# A', '',
      '    [in code](missing-code.md)', '',
      '1. Step one', '',
      '    [in the step](missing-step.md)', '',
    ].join('\n'),
  });
  try {
    const targets = brokenLinks(dir, 'a.md', readFileSync(join(dir, 'a.md'), 'utf8')).map((b) => b.target);
    assert.deepEqual(targets, ['missing-step.md']);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('reference definitions are checked', () => {
  const dir = repo({ 'a.md': '# A\n\nSee [it][r].\n\n[r]: gone.md\n[s]: <a.md#a> "Title"\n' });
  try {
    const broken = brokenLinks(dir, 'a.md', readFileSync(join(dir, 'a.md'), 'utf8'));
    assert.deepEqual(broken.map((b) => [b.line, b.target]), [[5, 'gone.md']]);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('generator routes are skipped, not judged', () => {
  assert.equal(judgeable('/guides/install/'), null);
  assert.equal(judgeable('../install/'), null);
  assert.equal(judgeable('https://example.com/x.md'), null);
  assert.deepEqual(judgeable('install.md#step-2'), { path: 'install.md', anchor: 'step-2' });
});

test('a removed heading breaks inbound links, and only those', () => {
  const dir = repo({
    'README.md': '# Tool\n\n## Status\n',
    'docs/a.md': '[ok](../README.md#status)\n[gone](../README.md#what-would-improve-it-most)\n[route](/guides/x/)\n',
  });
  try {
    const broken = brokenLinks(dir, 'docs/a.md', '[ok](../README.md#status)\n[gone](../README.md#what-would-improve-it-most)\n[route](/guides/x/)\n');
    assert.equal(broken.length, 1);
    assert.match(broken[0].target, /what-would-improve-it-most/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

// --- check-claims.mjs: the reader's environment ------------------------------

test('check-claims: an operating-system variable is not drift, a missing repo key still is', () => {
  const dir = repo({
    'docs/a.md': 'Add `bin/` to your `PATH`, then set `SNAPKEEP_STORE`.\n',
    'src/x.js': 'const x = 1;\n',
  });
  try {
    const out = run(dir, 'assets/ci/check-claims.mjs', ['docs']);
    assert.match(out, /SNAPKEEP_STORE/);
    assert.doesNotMatch(out, /`PATH`|'PATH'/);
    assert.equal(gitIn(dir, 'status', '--porcelain', '--untracked-files=all'), '', 'its output stays out of git');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

// --- check-claims.mjs: the not-a-claim marker ---------------------------------

test('not-a-claim hides only the marked path', () => {
  const dir = repo({
    'docs/a.md': [
      'Old `scripts/gone.mjs`<!-- docs-assist:not-a-claim --> was removed.',
      'Spaced `scripts/gone2.mjs` <!-- docs-assist:not-a-claim --> too.',
      'Real `scripts/missing.mjs` is missing.',
      'Two on a line: `scripts/x1.mjs`<!-- docs-assist:not-a-claim --> and `scripts/x2.mjs`.',
      '',
    ].join('\n'),
  });
  try {
    const out = run(dir, 'assets/ci/check-claims.mjs', ['docs']);
    assert.match(out, /scripts\/missing\.mjs/);
    assert.match(out, /scripts\/x2\.mjs/);
    assert.doesNotMatch(out, /scripts\/gone\.mjs|scripts\/gone2\.mjs|scripts\/x1\.mjs/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

// --- docs-decay.mjs: verified_body_pattern ------------------------------------

const decayDocs = {
  'docs/a.md': '---\ntitle: A\n---\nBody.\n\n<Verified date="2026-11-01" method="ran it" />\n',
  'docs/b.md': '---\ntitle: B\n---\nNo marker.\n',
};

function decay(configLine) {
  const dir = repo({ ...decayDocs, '.docs-assist/config.yml': `${configLine}\n` });
  try { return run(dir, 'assets/ci/docs-decay.mjs', ['docs']); }
  finally { rmSync(dir, { recursive: true, force: true }); }
}

const verifiedA = (out) => /`docs\/a\.md` \| no decay signals/.test(out);
const neverB = (out) => /`docs\/b\.md` \| never verified/.test(out);

test('verified_body_pattern: every ordinary way of writing it works', () => {
  for (const line of [
    `verified_body_pattern: '<Verified date="(\\d{4}-\\d{2}-\\d{2})"'`,
    `verified_body_pattern: '<Verified date="(\\d{4}-\\d{2}-\\d{2})"'  # trailing comment`,
    `verified_body_pattern: "<Verified date=\\"(\\\\d{4}-\\\\d{2}-\\\\d{2})\\""`,
    `verified_body_pattern: <Verified date="(\\d{4}-\\d{2}-\\d{2})" # bare`,
  ]) {
    const out = decay(line);
    assert.ok(verifiedA(out), `doc a should read as verified for: ${line}\n${out}`);
    assert.ok(neverB(out), `doc b should stay never verified for: ${line}`);
  }
});

test('verified_body_pattern: a pattern that cannot work says so', () => {
  assert.match(decay(`verified_body_pattern: '<Verified date="\\d{4}'`), /no capture group/);
  assert.match(decay(`verified_body_pattern: '(['`), /not a valid regular expression/);
  assert.match(decay(`verified_body_pattern: '<Checked on="(\\d{4}-\\d{2}-\\d{2})"'`), /matched nothing/);
});

test('docs-decay report names no slash command', () => {
  assert.doesNotMatch(decay('docs_dir: docs'), /\/docs-assist:/);
});

// --- hooks/notices.mjs --------------------------------------------------------

function hook(dir, mode, payload, env) {
  return run(dir, 'hooks/notices.mjs', [mode], { input: JSON.stringify({ cwd: dir, ...payload }), env });
}

const sid = () => `test-${process.pid}-${Math.random().toString(36).slice(2)}`;

test('notices: a broken inbound anchor surfaces once, then never again', () => {
  const dir = repo({
    'README.md': '# Tool\n\n## Status\n',
    'docs/a.md': '# A\n\nSee [the old section](../README.md#what-would-improve-it-most).\n',
  });
  try {
    const s = sid();
    assert.equal(hook(dir, 'record', { session_id: s, tool_input: { file_path: join(dir, 'README.md') } }), '');
    const first = JSON.parse(hook(dir, 'surface', { session_id: s }));
    const ctx = first.hookSpecificOutput.additionalContext;
    assert.match(ctx, /docs\/a\.md line 3/);
    assert.match(ctx, /what-would-improve-it-most/);
    assert.doesNotMatch(ctx, /\/docs-assist:/);
    assert.equal(hook(dir, 'surface', { session_id: s }), '');
    hook(dir, 'record', { session_id: s, tool_input: { file_path: join(dir, 'README.md') } });
    assert.equal(hook(dir, 'surface', { session_id: s }), '', 'a finding already raised stays dropped');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('notices: parallel edits keep every finding', async () => {
  // Claude Code runs one PostToolUse hook per tool call, concurrently.
  const files = {};
  for (let i = 0; i < 8; i++) files[`docs/d${i}.md`] = `# D${i}\n\n[x](missing-${i}.md)\n`;
  const dir = repo(files);
  try {
    const s = sid();
    const once = (i) => new Promise((done) => {
      const child = spawn('node', [join(ROOT, 'hooks/notices.mjs'), 'record'], { cwd: dir, stdio: ['pipe', 'ignore', 'ignore'] });
      child.on('close', done);
      child.stdin.end(JSON.stringify({ cwd: dir, session_id: s, tool_input: { file_path: `docs/d${i}.md` } }));
    });
    await Promise.all([...Array(8).keys()].map(once));
    const ctx = JSON.parse(hook(dir, 'surface', { session_id: s })).hookSpecificOutput.additionalContext;
    for (let i = 0; i < 8; i++) assert.match(ctx, new RegExp(`missing-${i}\\.md`), `finding ${i} kept`);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('notices: a link fixed before the next prompt is not mentioned', () => {
  const dir = repo({ 'docs/a.md': '# A\n\n[x](b.md)\n' });
  try {
    const s = sid();
    hook(dir, 'record', { session_id: s, tool_input: { file_path: 'docs/a.md' } });
    writeFileSync(join(dir, 'docs/b.md'), '# B\n');
    assert.equal(hook(dir, 'surface', { session_id: s }), '');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('notices: a changed source file names the docs that mention it', () => {
  const dir = repo({
    'src/client.js': 'export const TIMEOUT = 5000;\n',
    'docs/config.md': 'The default lives in `src/client.js`.\n',
    'CHANGELOG.md': 'Changed `src/client.js`.\n',
  });
  try {
    const s = sid();
    hook(dir, 'record', { session_id: s, tool_input: { file_path: join(dir, 'src/client.js') } });
    const ctx = JSON.parse(hook(dir, 'surface', { session_id: s })).hookSpecificOutput.additionalContext;
    assert.match(ctx, /src\/client\.js changed, and docs\/config\.md names it/);
    assert.doesNotMatch(ctx, /CHANGELOG/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('notices: silent with nothing to say, when turned off, and outside git', () => {
  const dir = repo({ 'docs/a.md': '# A\n\n[x](missing.md)\n', 'docs/ok.md': '# OK\n' });
  try {
    const s = sid();
    hook(dir, 'record', { session_id: s, tool_input: { file_path: 'docs/ok.md' } });
    assert.equal(hook(dir, 'surface', { session_id: s }), '', 'nothing to say');

    const off = sid();
    hook(dir, 'record', { session_id: off, tool_input: { file_path: 'docs/a.md' } }, { DOCS_ASSIST_NOTICES: '0' });
    assert.equal(hook(dir, 'surface', { session_id: off }, { DOCS_ASSIST_NOTICES: '0' }), '', 'env off');

    mkdirSync(join(dir, '.docs-assist'), { recursive: true });
    writeFileSync(join(dir, '.docs-assist/config.yml'), 'notices: false  # quiet please\n');
    const cfg = sid();
    hook(dir, 'record', { session_id: cfg, tool_input: { file_path: 'docs/a.md' } });
    assert.equal(hook(dir, 'surface', { session_id: cfg }), '', 'config off');
  } finally { rmSync(dir, { recursive: true, force: true }); }

  const bare = mkdtempSync(join(tmpdir(), 'docs-assist-nogit-'));
  try {
    writeFileSync(join(bare, 'a.md'), '[x](missing.md)\n');
    const s = sid();
    hook(bare, 'record', { session_id: s, tool_input: { file_path: 'a.md' } });
    assert.equal(hook(bare, 'surface', { session_id: s }), '', 'outside git');
  } finally { rmSync(bare, { recursive: true, force: true }); }
});

test('notices: ignored files are working material, not docs', () => {
  const dir = repo({ '.gitignore': 'notes/\n', 'notes/n.md': '[x](missing.md)\n' });
  try {
    const s = sid();
    hook(dir, 'record', { session_id: s, tool_input: { file_path: 'notes/n.md' } });
    assert.equal(hook(dir, 'surface', { session_id: s }), '');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('notices: malformed input never breaks the session', () => {
  const out = execFileSync('node', [join(ROOT, 'hooks/notices.mjs'), 'record'], { input: 'not json', encoding: 'utf8' });
  assert.equal(out, '');
});

// --- markdown-patterns.mjs ---------------------------------------------------

const survey = (dir) => JSON.parse(run(dir, 'assets/ci/markdown-patterns.mjs', ['--json']));
const forms = (r, cat) => Object.fromEntries((r.categories.find((c) => c.name === cat)?.variants || []).map((v) => [v.name, v.count]));

test('markdown-patterns: every way a site does a thing is counted, code blocks are not', () => {
  const dir = repo({
    'mkdocs.yml': 'site_name: x\n',
    'docs/a.md': [
      '# A', '', '!!! note', '    Hi', '', '**Note:** label.', '',
      '![](a.png) <img src="b.png">', '',
      '[B](b.md) [C](/c)', '',
      '1. a', '1. b', '', 'Para.', '', '1. x', '2. y', '',
      '```md', ':::note', '[[skip]](x.md)', '```', '',
    ].join('\n'),
    'docs/b.md': '# B\n\n> [!TIP]\n> Hi\n\n- one\n* two\n',
    'notes/ignored.md': '# not in docs\n\n:::note\n',
  });
  try {
    const r = survey(dir);
    assert.equal(r.generator, 'MkDocs');
    assert.equal(r.warranted, true);
    assert.deepEqual(forms(r, 'Callouts'), { 'Admonition `!!! note`': 1, 'Bold label paragraph `**Note:**`': 1, 'GitHub alert `> [!NOTE]`': 1 }, 'the fenced :::note is an example, not a use');
    assert.deepEqual(forms(r, 'Images'), { 'Markdown image `![alt](path)`': 1, 'HTML `<img>`': 1 });
    assert.deepEqual(forms(r, 'Internal link targets'), { 'Relative with the file extension `page.md`': 1, 'Site-absolute `/path`': 1 });
    assert.deepEqual(forms(r, 'Ordered list numbering'), { 'Every item `1.`': 1, 'Counted `1. 2. 3.`': 1 });
    assert.deepEqual(forms(r, 'Unordered list markers'), { '`-`': 1, '`*`': 1 });
    assert.equal(r.emptyAlt.length, 1);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('markdown-patterns: plain markdown with no site is not offered a reference, even when mixed', () => {
  const dir = repo({ 'docs/a.md': '# A\n\n- one\n* two\n' });
  try {
    const r = survey(dir);
    assert.equal(r.warranted, false);
    assert.deepEqual(r.mixed, ['Unordered list markers']);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('markdown-patterns: MDX components are inventoried by name', () => {
  const dir = repo({ 'docs/a.mdx': '# A\n\n<Tabs>\n<TabItem value="x">x</TabItem>\n</Tabs>\n\n<Aside>careful</Aside>\n' });
  try {
    const r = survey(dir);
    assert.equal(r.warranted, true);
    assert.deepEqual(r.components.map((c) => c.name).sort(), ['<Aside>', '<TabItem>', '<Tabs>']);
    assert.deepEqual(forms(r, 'Callouts'), { 'Component `<Aside>`': 1 });
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

// --- journal.mjs -------------------------------------------------------------

function journal(dir, args, input, env) {
  return run(dir, 'hooks/journal.mjs', args, { input, env: { CLAUDE_PROJECT_DIR: dir, ...env } });
}
const gitIn = (dir, ...a) => execFileSync('git', a, { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
const note = (dir, text, env) => {
  const path = journal(dir, ['path'], undefined, env).trim();
  writeFileSync(path, text);
  return path;
};

test('journal: path nests branch names, and git sees nothing of it', () => {
  const dir = repo({ 'docs/a.md': '# A\n' });
  try {
    gitIn(dir, 'checkout', '-qb', 'feature/retry-docs');
    const path = journal(dir, ['path']).trim();
    assert.equal(path, join(realpathSync(dir), '.docs-assist/journal/feature/retry-docs.md'));
    assert.ok(existsSync(join(dir, '.docs-assist/journal')), 'path makes the directory');
    note(dir, '# feature/retry-docs\n\n- Does X change per region? (the platform lead)\n');
    assert.equal(gitIn(dir, 'check-ignore', path), path, 'git ignores the journal');
    assert.equal(gitIn(dir, 'status', '--porcelain'), '', 'and nothing in it shows as untracked');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('journal: every working directory stays out of git, settings stay in', () => {
  const dir = repo({ 'docs/a.md': '# A\n' });
  try {
    for (const d of ['loop/restore', 'plan', 'reports', 'intake', 'claims', 'state']) mkdirSync(join(dir, '.docs-assist', d), { recursive: true });
    writeFileSync(join(dir, '.docs-assist/loop/restore/packet.md'), 'draft\n');
    writeFileSync(join(dir, '.docs-assist/reports/audit.md'), 'report\n');
    writeFileSync(join(dir, '.docs-assist/plan/plan.md'), 'plan\n');
    writeFileSync(join(dir, '.docs-assist/claims/claims.json'), '{}\n');
    writeFileSync(join(dir, '.docs-assist/config.yml'), 'docs_dir: docs\n');
    journal(dir, ['path']);
    assert.equal(gitIn(dir, 'status', '--porcelain', '--untracked-files=all'), '?? .docs-assist/config.yml', 'only the rules are left for the contributor to decide about');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('journal: the rules stay local by default, sharing them leaves working material hidden', () => {
  const dir = repo({ 'docs/a.md': '# A\n' });
  try {
    mkdirSync(join(dir, '.docs-assist/loop/restore'), { recursive: true });
    writeFileSync(join(dir, '.docs-assist/config.yml'), 'docs_dir: docs\n');
    writeFileSync(join(dir, '.docs-assist/style.md'), '# Style\n');
    writeFileSync(join(dir, '.docs-assist/loop/restore/packet.md'), 'draft\n');
    journal(dir, ['rules', 'local']);
    assert.equal(gitIn(dir, 'status', '--porcelain', '--untracked-files=all'), '', 'nothing under .docs-assist shows, the ignore file included');
    journal(dir, ['path']);
    journal(dir, ['rules', 'shared']);
    assert.equal(gitIn(dir, 'status', '--porcelain', '--untracked-files=all'), '?? .docs-assist/config.yml\n?? .docs-assist/style.md', 'only the rules show once shared');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('journal: keeping rules local leaves a project that already shares them alone', () => {
  const dir = repo({ 'docs/a.md': '# A\n', '.docs-assist/config.yml': 'docs_dir: docs\n' });
  try {
    journal(dir, ['rules', 'local']);
    assert.ok(!existsSync(join(dir, '.docs-assist/.gitignore')), 'no ignore file over tracked rules');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('journal: drafts whose doc is placed are listed for clearing, unfinished ones never', () => {
  const dir = repo({ 'docs/a.md': '# A\n' });
  try {
    for (const [slug, status] of [['restore', 'written'], ['rotate', 'edited'], ['backup', 'drafted'], ['prune', 'in-progress']]) {
      mkdirSync(join(dir, '.docs-assist/loop', slug), { recursive: true });
      writeFileSync(join(dir, '.docs-assist/loop', slug, 'packet.md'), `---\nstatus: ${status}\n---\n`);
    }
    assert.equal(journal(dir, ['drafts']).trim(), 'restore\nrotate');
    journal(dir, ['clear-draft', 'restore']);
    assert.ok(!existsSync(join(dir, '.docs-assist/loop/restore')), 'cleared');
    assert.ok(existsSync(join(dir, '.docs-assist/loop/backup')), 'an unfinished draft is left alone');
    journal(dir, ['clear-draft', '../..']);
    assert.ok(existsSync(join(dir, 'docs/a.md')) && existsSync(join(dir, '.docs-assist/loop/backup')), 'a name that leaves the loop directory is refused');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('journal: the hook hides a working directory the moment something is written there, even with notices off', () => {
  const dir = repo({ 'docs/a.md': '# A\n', '.docs-assist/config.yml': 'notices: false\n' });
  try {
    mkdirSync(join(dir, '.docs-assist/loop/restore'), { recursive: true });
    writeFileSync(join(dir, '.docs-assist/loop/restore/draft.md'), 'draft\n');
    hook(dir, 'record', { session_id: sid(), tool_input: { file_path: '.docs-assist/loop/restore/draft.md' } }, { CLAUDE_PROJECT_DIR: dir });
    assert.equal(gitIn(dir, 'status', '--porcelain', '--untracked-files=all'), '');
    hook(dir, 'record', { session_id: sid(), tool_input: { file_path: 'docs/a.md' } }, { CLAUDE_PROJECT_DIR: dir });
    assert.ok(!existsSync(join(dir, '.docs-assist/journal')), 'a doc edit writes no journal entry');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('journal: the off switch keeps no notes but still hides working material', () => {
  const dir = repo({ 'docs/a.md': '# A\n', '.docs-assist/config.yml': 'journal: false\n' });
  try {
    mkdirSync(join(dir, '.docs-assist/loop'), { recursive: true });
    assert.match(journal(dir, ['path']), /turned off/);
    assert.ok(!existsSync(join(dir, '.docs-assist/journal')));
    assert.ok(existsSync(join(dir, '.docs-assist/loop/.gitignore')));
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('journal: merged branches are listed for clearing, never the current one', () => {
  const dir = repo({ 'docs/a.md': '# A\n' });
  try {
    gitIn(dir, 'branch', '-M', 'main');
    gitIn(dir, 'checkout', '-qb', 'done');
    note(dir, '- x\n');
    gitIn(dir, 'checkout', '-q', 'main');
    note(dir, '- y\n');
    assert.equal(journal(dir, ['merged']).trim(), 'done');
    assert.match(journal(dir, ['clear', 'main']), /Not clearing the current branch/);
    assert.match(journal(dir, ['clear', 'done']), /Removed \.docs-assist\/journal\/done\.md/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('journal: without a working git, the branch still comes from .git/HEAD', () => {
  const dir = repo({ 'docs/a.md': '# A\n' });
  try {
    gitIn(dir, 'checkout', '-qb', 'no-git-here');
    const fakeBin = mkdtempSync(join(tmpdir(), 'docs-assist-nogitbin-'));
    writeFileSync(join(fakeBin, 'git'), '#!/bin/sh\nexit 1\n', { mode: 0o755 });
    try {
      const env = { PATH: `${fakeBin}:${process.env.PATH}` };
      assert.match(journal(dir, ['path'], undefined, env), /journal\/no-git-here\.md/);
    } finally { rmSync(fakeBin, { recursive: true, force: true }); }
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
