#!/usr/bin/env node
// Docs Assist repository validator.
// No dependencies. Run with: node scripts/validate.mjs
//
// Checks:
//   1. Both manifests parse and their versions agree.
//   2. Every command, agent, and skill referenced by the manifest exists.
//   3. Command, agent, and skill files have the required frontmatter.
//   4. docs/ files carry the required frontmatter (title, description, content-type).
//   5. Relative links in llms.txt resolve, and each docs/ entry's title
//      matches the title that doc declares in its frontmatter.
//   6. Prose does not name an agent or command that no longer exists, in any
//      of its forms: a /docs-assist: reference, a bare code span, or a bold
//      run-in heading. Scoped to tracked files.
//   7. Every chair has a contract and a rulebook per threshold.
//   8. A reference file named inside another reference file resolves.
//   9. Every tracked path is on the shipping allowlist.
//  10. Prose keeps one sentence per line, per .docs-assist/config.yml.
//  11. Prose does not use bold or italics to stress a word.
//  12. Ordered lists repeat `1.`, per .docs-assist/config.yml.
//  13. Shell examples chain commands with `&& \\` and a line break, not inline.
//  14. A script that enumerates documents consults the git index.
//  15. A fact with a named owner is not restated outside it.

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const rel = (p) => join(root, p);

const errors = [];
let checks = 0;
function check(cond, msg) {
  checks++;
  if (!cond) errors.push(msg);
}

function frontmatter(path) {
  if (!existsSync(rel(path))) return null;
  const text = readFileSync(rel(path), 'utf8');
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  return m ? m[1] : null;
}
function hasKey(fm, key) {
  return !!fm && new RegExp('^' + key + '\\s*:', 'm').test(fm);
}

// 1. Manifests parse and versions agree.
const plugin = JSON.parse(readFileSync(rel('.claude-plugin/plugin.json'), 'utf8'));
const market = JSON.parse(readFileSync(rel('.claude-plugin/marketplace.json'), 'utf8'));
const marketEntry = (market.plugins || []).find((p) => p.name === plugin.name) || (market.plugins || [])[0];
check(!!marketEntry, 'marketplace.json has no plugin entry');
check(
  marketEntry && plugin.version === marketEntry.version,
  `version mismatch: plugin.json ${plugin.version} vs marketplace.json ${marketEntry && marketEntry.version}`
);

// 2 + 3. Referenced files exist and have required frontmatter.
for (const f of plugin.commands || []) {
  check(existsSync(rel(f)), `command file missing: ${f}`);
  const fm = frontmatter(f);
  check(hasKey(fm, 'description'), `command missing description frontmatter: ${f}`);
}
for (const f of plugin.agents || []) {
  check(existsSync(rel(f)), `agent file missing: ${f}`);
  const fm = frontmatter(f);
  check(hasKey(fm, 'name') && hasKey(fm, 'description'), `agent missing name/description frontmatter: ${f}`);
}
for (const s of plugin.skills || []) {
  const skillFile = join(s, 'SKILL.md');
  check(existsSync(rel(skillFile)), `skill missing SKILL.md: ${s}`);
  const fm = frontmatter(skillFile);
  check(hasKey(fm, 'name') && hasKey(fm, 'description'), `SKILL.md missing name/description frontmatter: ${s}`);
}

// What git tracks. Every prose check below scopes to this rather than to the
// working tree: the archived working notes (`reports/`, `docs/plan.md`, the two
// planning docs) are gitignored but still sit on a maintainer's disk, and a
// validator that reports on files the plugin does not ship is reporting noise.
let tracked = [];
try {
  tracked = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' })
    .split('\0')
    .filter(Boolean);
} catch {
  // Not a git checkout (a published plugin cache, for instance). Skip.
}
const isTracked = new Set(tracked);

// 4. docs/ frontmatter, including subdirectories.
function mdFilesUnder(dir) {
  const out = [];
  for (const entry of readdirSync(rel(dir), { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...mdFilesUnder(path));
    else if (entry.name.endsWith('.md')) out.push(path);
  }
  return out;
}
if (existsSync(rel('docs'))) {
  // Tracked only: a gitignored planning note under docs/ is working material, and
  // holding it to the frontmatter contract audits a file no reader will see.
  for (const f of mdFilesUnder('docs').filter((f) => !tracked.length || isTracked.has(f))) {
    const fm = frontmatter(f);
    check(!!fm, `${f} missing frontmatter`);
    for (const key of ['title', 'description', 'content-type']) {
      check(hasKey(fm, key), `${f} missing frontmatter field: ${key}`);
    }
  }
}

// 4b. Template feature assets exist and the catalog looks well-formed.
const catalogPath = 'assets/templates/gooddocs-catalog.yml';
check(existsSync(rel(catalogPath)), `template catalog missing: ${catalogPath}`);
check(existsSync(rel('assets/config/templates.yml')), 'template config scaffold missing: assets/config/templates.yml');
check(existsSync(rel('skills/docs-assist/reference/templates.md')), 'templates reference missing');
check(existsSync(rel('THIRD-PARTY-NOTICES.md')), 'THIRD-PARTY-NOTICES.md missing');
if (existsSync(rel(catalogPath))) {
  const catalog = readFileSync(rel(catalogPath), 'utf8');
  // Every catalog entry needs a content_type and a fetch URL.
  const ids = (catalog.match(/^\s*-\s*id:/gm) || []).length;
  const contentTypes = (catalog.match(/^\s*content_type:/gm) || []).length;
  const urls = (catalog.match(/^\s*template_url:\s*https:\/\//gm) || []).length;
  check(ids > 0, 'template catalog has no entries');
  check(ids === contentTypes, `template catalog: ${ids} entries but ${contentTypes} content_type fields`);
  check(ids === urls, `template catalog: ${ids} entries but ${urls} template_url fields`);
}

// 4c. Every registered command is discoverable: it must appear in llms.txt and
// docs/command-reference.md. Catches the drift where a new command gets wired
// internally but never surfaced where users look (verify was missing from a
// surface when this check was written).
//
// README.md was a third surface here and is not one any more. Commands are a
// shortcut, not the interface: `SKILL.md` says a contributor never needs to
// know one, and "offer the doors in plain words, not command names". A README
// that had to name all nine to pass CI was enforcing the opposite, so the
// catalogue moved to the reference that owns it and the README links there.
{
  const surfaces = ['llms.txt', 'docs/command-reference.md']
    .filter((f) => existsSync(rel(f)))
    .map((f) => ({ file: f, text: readFileSync(rel(f), 'utf8') }));
  for (const f of plugin.commands || []) {
    const cmd = '/docs-assist:' + f.replace(/^.*\//, '').replace(/\.md$/, '');
    for (const s of surfaces) {
      check(s.text.includes(cmd), `${s.file} does not mention registered command ${cmd}`);
    }
  }
}

// 5. llms.txt relative links resolve, and each entry's title matches the title
// the doc itself declares. `reference/llms-txt.md` puts "titles, descriptions,
// or paths that no longer match" on the audit's drift list and says a wrong
// description misleads every agent that reads it, but nothing checked the
// repo's own file: all four `docs/` entries were still carrying the title-case
// names they had before 1.0 re-cased every heading, so llms.txt named four
// documents that no longer existed under those titles.
if (existsSync(rel('llms.txt'))) {
  const llms = readFileSync(rel('llms.txt'), 'utf8');
  for (const m of llms.matchAll(/\]\(([^)]+)\)/g)) {
    const link = m[1];
    if (/^https?:/.test(link) || link.startsWith('#')) continue;
    const path = link.split('#')[0];
    check(existsSync(rel(path)), `llms.txt broken relative link: ${link}`);
  }
  for (const m of llms.matchAll(/^- \[([^\]]+)\]\((docs\/[^)]+\.md)\)/gm)) {
    const [, entryTitle, path] = m;
    const fm = frontmatter(path);
    const declared = fm && fm.match(/^title\s*:\s*["']?(.*?)["']?\s*$/m);
    if (!declared) continue;
    check(
      declared[1] === entryTitle,
      `llms.txt lists ${path} as "${entryTitle}", but the doc's frontmatter ` +
        `title is "${declared[1]}". An entry that misnames its doc misleads ` +
        `every agent that reads the map.`,
    );
  }
}

// 6. The shipped Vale styles do not fire on the plugin's own docs.
// A style that bans a phrase and then explains itself using that phrase in
// plain prose flags itself; this happened for real (MarketingLanguage vs.
// this repo's own "highest-leverage fix", and every doc describing the new
// AI-voice rules quoting its own banned examples). Catch it here instead of
// by hand-grepping after the fact. Only the plain literal-token styles are
// checked this way; the two regex-based styles (HeadingGerund, FalseContrast)
// are heuristics reviewed by hand when they change, not automated here.
const styleTokens = [];
const styleDir = 'assets/lint/vale/styles/DocsAssist';
for (const f of ['EmDash.yml', 'ClickHere.yml', 'MarketingLanguage.yml', 'FillerPhrase.yml']) {
  const path = join(styleDir, f);
  if (!existsSync(rel(path))) continue;
  const src = readFileSync(rel(path), 'utf8');
  const tokensBlock = src.match(/^tokens:\n((?:\s+-.*\n?)+)/m);
  if (!tokensBlock) continue;
  for (const line of tokensBlock[1].split('\n')) {
    const m = line.match(/^\s*-\s*(.+)$/);
    if (!m) continue;
    const token = m[1].trim().replace(/^['"]|['"]$/g, '');
    if (token && !/^[\\^$.|?*+()[\]{}]/.test(token)) styleTokens.push({ file: f, token });
  }
}

function stripCode(md) {
  return md.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
}

function allMdFiles(dir) {
  const out = [];
  for (const entry of readdirSync(rel(dir), { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.git')) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...allMdFiles(path));
    else if (entry.name.endsWith('.md')) out.push(path);
  }
  return out;
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

if (styleTokens.length) {
  const patterns = styleTokens.map(({ file, token }) => ({
    file,
    token,
    // Word boundaries around the whole token, so "just" does not match
    // inside "adjust" or "justify", but "click here" still matches as a
    // phrase.
    re: new RegExp(`\\b${escapeRegex(token)}\\b`, 'i'),
  }));
  for (const f of allMdFiles('.')) {
    if (f.startsWith(join(styleDir))) continue; // the style files themselves, not markdown anyway
    if (tracked.length && !isTracked.has(f)) continue; // untracked working notes are not shipped prose
    const prose = stripCode(readFileSync(rel(f), 'utf8'));
    for (const { file: styleFile, token, re } of patterns) {
      check(!re.test(prose), `${f} contains "${token}" in plain prose, which the shipped ${styleFile} Vale style flags; wrap it in backticks or rephrase`);
    }
  }
}

// 6. Prose does not name an agent or command that no longer exists.
//
// Retiring doc-drafter and doc-auditor left seven stale references in
// docs/plan.md describing them as shipped features. Nothing caught it, because
// the existing link check only covers llms.txt. A name in prose is a claim
// that the thing exists, and this is the cheapest kind of claim to check.
const liveAgents = new Set(
  readdirSync(rel('agents')).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, '')),
);
const liveCommands = new Set(
  readdirSync(rel('commands')).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, '')),
);


// CHANGELOG records what was true at the time and is allowed to name the dead.
const HISTORY = new Set(['CHANGELOG.md']);
// Third-party tools whose names match the agent shape but are not ours.
const EXTERNAL = new Set(['doc-detective']);
// Commands 1.0 removed. Named here so prose that still calls them out as
// run-in headings fails, rather than reading as ordinary English.
const DEAD_COMMANDS = new Set([
  'agent-ready', 'setup-lint', 'setup-hooks', 'setup-site', 'make-examples',
]);
// Removed commands whose name in a bare code span is unambiguously a command
// claim rather than ordinary English or a third-party CLI. `init` is on this
// list: `git init` and `npm init` are two-token spans, so a lone `init` span
// in this repo's prose only ever meant the command 1.0 folded into `setup`.
// `template` is deliberately absent: it is a live frontmatter field name.
const DEAD_COMMAND_SPANS = new Set([
  'init', 'setup-lint', 'setup-hooks', 'setup-site', 'make-examples', 'agent-ready',
]);

for (const f of allMdFiles('.')) {
  // Dated records of what was true then: a changelog, a field report, a design
  // report. They are allowed to name the dead, because that is their job.
  if (HISTORY.has(f) || f.startsWith('reports/') || f.startsWith(join('docs', 'reviews'))) continue;
  // Untracked working notes never reach a user's plugin cache; see isTracked.
  if (tracked.length && !isTracked.has(f)) continue;
  const text = readFileSync(rel(f), 'utf8');

  for (const m of text.matchAll(/\/docs-assist:([a-z][a-z-]*)/g)) {
    check(liveCommands.has(m[1]), `${f} references removed command /docs-assist:${m[1]}`);
  }
  // Agent names are matched in backticks only: "cold reader" as prose is fine,
  // `cold-reader` is a claim about a file.
  for (const m of text.matchAll(/`(doc-[a-z-]+|chair-[a-z-]+|cold-reader)`/g)) {
    if (EXTERNAL.has(m[1])) continue;
    check(liveAgents.has(m[1]), `${f} references removed agent \`${m[1]}\``);
  }
  // A removed command named in a bare code span, which is the form that
  // carried `init` and `setup-lint` through 1.0's surface reduction and into
  // SKILL.md's routing instructions: neither the `/docs-assist:` check above
  // nor the run-in-heading check below could see them, so the flagship skill
  // shipped telling the model to run two commands that no longer exist.
  for (const m of text.matchAll(/`([a-z][a-z-]*)`/g)) {
    check(
      !DEAD_COMMAND_SPANS.has(m[1]),
      `${f} names removed command \`${m[1]}\` in a code span. ` +
        `Name a live command as \`/docs-assist:<name>\`, or rewrite the sentence.`,
    );
  }
  // A command named in prose as a bold run-in heading, which is how
  // `Agent-ready` and `Setup-site` outlived the commands they named: the check
  // above only saw the `/docs-assist:` form. Only hyphenated or known
  // single-word command names count, so a bullet leading with a normal English
  // word is not read as a command claim.
  for (const m of text.matchAll(/^- \*\*([A-Z][a-z]+(?:-[a-z]+)+)\*\*/gm)) {
    const name = m[1].toLowerCase();
    if (!liveCommands.has(name) && !DEAD_COMMANDS.has(name)) continue;
    check(
      liveCommands.has(name),
      `${f} names removed command "${m[1]}" as a run-in heading. ` +
        `Refer to a command as \`/docs-assist:<name>\` so this check can see it.`,
    );
  }
}

// 7. Every chair has a contract, and every pass rulebook a chair's contract
// names actually exists. The escalation gradient is implemented as file
// selection, so a missing rulebook is a chair with no rules at its threshold.
const chairsDir = 'skills/docs-assist/reference/chairs';
if (existsSync(rel(chairsDir))) {
  check(existsSync(rel(join(chairsDir, 'shared-rules.md'))), 'chairs/shared-rules.md is missing; every chair loads it on every pass');
  for (const entry of readdirSync(rel(chairsDir), { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const dir = join(chairsDir, entry.name);
    check(existsSync(rel(join(dir, 'contract.md'))), `${dir} has no contract.md`);
    const passes = readdirSync(rel(dir)).filter((f) => /^pass-\d/.test(f));
    if (entry.name !== 'continuity') {
      check(passes.length >= 3, `${dir} has ${passes.length} pass rulebooks; the escalation gradient needs one per threshold`);
    }
  }
}

// 8. A reference file named in prose resolves. The constitutions cross-link
// heavily and a dead pointer sends a chair looking for rules it will not find.
const refDir = 'skills/docs-assist/reference';
const refFiles = new Set(allMdFiles(refDir).map((p) => p.slice(refDir.length + 1)));
const ARTIFACTS = new Set(['questions.md', 'packet.md', 'ledger.md', 'draft.md', 'review.md', 'substitutions.md', 'plan.md', 'style.md', 'docs.yml']);
for (const f of allMdFiles(refDir)) {
  const text = readFileSync(rel(f), 'utf8');
  for (const m of text.matchAll(/`((?:chairs\/[a-z]+\/)?[a-z0-9-]+\.md)`/g)) {
    const name = m[1];
    if (ARTIFACTS.has(name)) continue;
    check(
      refFiles.has(name) || refFiles.has(name.split('/').pop()) || [...refFiles].some((r) => r.endsWith('/' + name)),
      `${f} names reference file \`${name}\`, which does not exist`,
    );
  }
}

// 9. Every tracked path is on the shipping allowlist.
// Claude Code has no plugin-level files allowlist: on install it copies the
// whole repository into ~/.claude/plugins/cache. Anything tracked here lands
// in every user's cache, so the allowlist below is the only thing standing
// between a new working directory and shipping it to everyone. Working notes
// are archived on the `working-notes` branch and gitignored here.
const SHIP_DIRS = [
  '.claude-plugin/',
  '.docs-assist/personas/',
  '.github/',
  'agents/',
  'assets/',
  'commands/',
  'docs/',
  'scripts/',
  'skills/',
];
const SHIP_FILES = new Set([
  '.cspell.json',
  'CLAUDE.md',
  '.docs-assist/config.yml',
  '.docs-assist/decisions.md',
  '.docs-assist/reference.yml',
  '.docs-assist/style.md',
  '.gitignore',
  '.markdownlint-cli2.jsonc',
  'CHANGELOG.md',
  'CONTRIBUTING.md',
  'LICENSE',
  'NOTICE',
  'README.md',
  'THIRD-PARTY-NOTICES.md',
  'llms.txt',
]);
for (const f of tracked) {
  check(
    SHIP_FILES.has(f) || SHIP_DIRS.some((d) => f.startsWith(d)),
    `${f} is tracked but not on the shipping allowlist in scripts/validate.mjs. ` +
      `It would be copied into every user's plugin cache. Add it to the allowlist ` +
      `if it belongs in the plugin, or gitignore it and archive it on \`working-notes\`.`,
  );
}

// 10. Prose keeps one sentence per line.
// `.docs-assist/config.yml` sets one_sentence_per_line, and nothing else
// checks it: Vale works a sentence at a time and markdownlint does not know
// what a sentence is. Without this the rule decays silently, which is exactly
// what happened before 1.0. Sentence-per-line keeps diffs to the sentence that
// actually changed instead of a reflowed paragraph.
const ABBREV = /(?:^|[\s("'`[])(?:e\.g|i\.e|etc|vs|cf|al|Mr|Mrs|Ms|Dr|Prof|Inc|Ltd|St|No|Fig|approx|ca|resp)\.$/i;
function sentenceCount(text) {
  let n = 1, buf = '', tick = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '`') tick = !tick;
    buf += c;
    if (tick || (c !== '.' && c !== '!' && c !== '?')) continue;
    if (!/^ (?=[A-Z"'`([]|\*\*)/.test(text.slice(i + 1))) continue;
    if (c === '.' && (ABBREV.test(buf) || /(?:^|\s)[A-Z]\.$/.test(buf) || /\.\.\.$/.test(buf))) continue;
    n++;
    buf = '';
  }
  return n;
}
const PROSE_DIRS = ['docs/', 'skills/', 'commands/', 'agents/', '.docs-assist/', 'assets/config/'];
// CHANGELOG.md is exempt from the stale-name check above, because a dated
// record is allowed to name the dead. It has no such excuse for the prose
// rules, and it was the one shipped file where emphasis, sentence-per-line,
// and ordered-list style went ungated.
const PROSE_FILES = ['README.md', 'CONTRIBUTING.md', 'CHANGELOG.md'];
for (const f of tracked) {
  if (!f.endsWith('.md')) continue;
  if (!PROSE_FILES.includes(f) && !PROSE_DIRS.some((d) => f.startsWith(d))) continue;
  const lines = readFileSync(rel(f), 'utf8').split('\n');
  let fence = false, fm = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (i === 0 && line.trim() === '---') { fm = true; continue; }
    if (fm) { if (line.trim() === '---') fm = false; continue; }
    if (/^\s*(```|~~~)/.test(line)) { fence = !fence; continue; }
    if (fence) continue;
    const body = line.replace(/^(\s*(?:>\s?)+)/, '');
    if (!body.trim() || /^\s*[#|]/.test(body) || /^\s*<[/a-zA-Z]/.test(body)) continue;
    if (/^\s{4,}\S/.test(line) && !/^\s*([-*+]|\d+[.)])\s/.test(body)) continue;
    const text = body.replace(/^\s*([-*+]\s+|\d+[.)]\s+)/, '');
    check(
      sentenceCount(text) === 1,
      `${f}:${i + 1} has more than one sentence on a line ` +
        `(one_sentence_per_line in .docs-assist/config.yml): "${text.slice(0, 70)}..."`,
    );
  }
}

// 11. Prose does not use bold or italics to stress a word.
// Google allows bold "only for UI elements and run-in headings"; GitLab bans
// emphasis outright in favor of prose clear enough not to need it. This is not
// a Vale rule because Vale masks inline code spans before a style sees the
// text, and the mask itself contains asterisks, which made the regex fire on
// `gh` and `git log`. Parsing the line here avoids that.
//
// Bold at the start of a line or list item is a run-in heading and always
// allowed. Nothing else is: GitLab permits bold only for "UI elements with a
// visible label" and navigation paths, and says plainly "Do not use bold for
// keywords or emphasis", pointing at a description list for a glossary
// instead. A term being defined is a keyword, so it leads its bullet as a
// run-in heading rather than sitting bold mid-sentence.
const EMPHASIS_OK = new Set([]);
for (const f of tracked) {
  if (!f.endsWith('.md')) continue;
  if (!PROSE_FILES.includes(f) && !PROSE_DIRS.some((d) => f.startsWith(d))) continue;
  const lines = readFileSync(rel(f), 'utf8').split('\n');
  let fence = false, fm = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (i === 0 && line.trim() === '---') { fm = true; continue; }
    if (fm) { if (line.trim() === '---') fm = false; continue; }
    if (/^\s*(```|~~~)/.test(line)) { fence = !fence; continue; }
    if (fence || /^\s*#{1,6}\s/.test(line) || /^\s*\|/.test(line)) continue;

    // Blank out inline code so asterisks inside it are not read as emphasis.
    const masked = line.replace(/`[^`]*`/g, (m) => ' '.repeat(m.length));
    const body = masked.replace(/^(\s*(?:>\s?)+)/, '');
    const after = body.replace(/^\s*([-*+]\s+|\d+[.)]\s+)/, '');
    const lead = masked.length - body.length + (body.length - after.length);

    for (const m of masked.matchAll(/\*\*([^*]+)\*\*/g)) {
      if (m.index === lead) continue; // run-in heading
      check(
        EMPHASIS_OK.has(`${f}::${m[1]}`),
        `${f}:${i + 1} uses bold to stress "${m[1]}" mid-sentence. ` +
          `Bold is for run-in headings, UI labels, and a term where it is defined; ` +
          `rewrite the sentence, use a code span for a literal, or add it to EMPHASIS_OK.`,
      );
    }
    for (const m of masked.matchAll(/(?<![*\w])\*([^*\s][^*]*)\*(?!\*)/g)) {
      check(
        EMPHASIS_OK.has(`${f}::${m[1]}`),
        `${f}:${i + 1} uses italics to stress "${m[1]}". ` +
          `Rewrite the sentence, or add it to EMPHASIS_OK if it is a word quoted as a word.`,
      );
    }
  }
}

// 12. Ordered lists repeat `1.`.
// `ordered_list_style: repeated-one` in config.yml. The shipped markdownlint
// template sets MD029 to `one_or_ordered`, because a project that numbers its
// lists explicitly is not wrong; only a generated per-project config narrows it
// to `one`. This repo lints itself with the unmodified template, so nothing
// caught its own rule being broken until this check existed.
for (const f of tracked) {
  if (!f.endsWith('.md')) continue;
  if (!PROSE_FILES.includes(f) && !PROSE_DIRS.some((d) => f.startsWith(d))) continue;
  const lines = readFileSync(rel(f), 'utf8').split('\n');
  let fence = false;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*(```|~~~)/.test(lines[i])) { fence = !fence; continue; }
    if (fence) continue;
    check(
      !/^[ ]*[2-9]\d*[.)] /.test(lines[i]),
      `${f}:${i + 1} numbers an ordered list item explicitly. ` +
        `Use a repeated \`1.\` (ordered_list_style in .docs-assist/config.yml): "${lines[i].trim().slice(0, 60)}"`,
    );
  }
}

// 13. A shell example chains commands with `&& \\` and a line break, never inline.
// `.docs-assist/style.md` and the shipped `assets/config/style.md` both carry
// this: a reader copies a block, pastes it, and reads afterward, and an inline
// `&&` reads as one long command whose halves cannot be seen or copied apart.
// Written down without a gate, this is the shape that decayed before 1.0, and
// the repo's one illustrative block was the anti-pattern it warns against.
//
// Only the formatting half is checked. Whether two commands are genuinely one
// step is a judgment no regex makes, and so is whether a partial-file block
// carries enough surrounding context.
const SHELL_LANG = /^(bash|sh|shell|console|zsh)$/i;
for (const f of tracked) {
  if (!f.endsWith('.md')) continue;
  const lines = readFileSync(rel(f), 'utf8').split('\n');
  let fence = false, lang = '';
  for (let i = 0; i < lines.length; i++) {
    const open = lines[i].match(/^\s*(?:```|~~~)(\S*)/);
    if (open) {
      if (!fence) { fence = true; lang = open[1]; } else { fence = false; lang = ''; }
      continue;
    }
    if (!fence || !SHELL_LANG.test(lang)) continue;
    if (lines[i].trim().startsWith('#')) continue;
    check(
      !/ && /.test(lines[i]) || / && \\\s*$/.test(lines[i]),
      `${f}:${i + 1} chains shell commands with an inline \`&&\`. ` +
        `End the line with \`&& \\\` and put the next command on its own line, ` +
        `so a reader can see and copy the halves: "${lines[i].trim().slice(0, 60)}"`,
    );
  }
}

// 14. A script that enumerates documents consults the git index.
// The doc set is what git tracks (see .docs-assist/decisions.md). Walking the
// filesystem instead gave four separate wrong answers in one day, in this file,
// in docs-decay.mjs, and twice in a chair's report, because the wrong call is
// correct in one of two contexts: outside a checkout there is no index and the
// whole tree is what shipped. That is why it never looks wrong locally.
//
// The rule is deliberately coarse. Any check script that walks directories must
// also mention the index, whether by calling git itself or by using a helper
// that does. It cannot verify the consult is wired to the right call site, so it
// is a tripwire against the next script repeating the pattern, not a proof.
{
  const checkScripts = [];
  for (const dir of ['scripts', 'assets/ci']) {
    if (!existsSync(rel(dir))) continue;
    for (const f of readdirSync(rel(dir))) {
      if (f.endsWith('.mjs')) checkScripts.push(join(dir, f));
    }
  }
  for (const f of checkScripts) {
    const src = readFileSync(rel(f), 'utf8');
    if (!/readdirSync|readdir\(/.test(src)) continue; // enumerates nothing
    // Count uses, not presence. Two earlier forms of this check passed a script
    // whose call site had been deleted: the helper's own definition leaves its
    // name behind, and the helper's body contains `ls-files`, so either token
    // alone is still there with nothing calling it. Both were caught by actually
    // deleting a call site and watching the check stay green.
    // Anchored to a real declaration. An unanchored match reads this file's own
    // regex literals as a definition, the same self-reference trap the shipped
    // Vale styles hit when a rule explained itself using the phrase it bans.
    const defines = /^function keepTracked\(/m.test(src);
    const uses = (src.match(/keepTracked\s*\(/g) || []).length;
    const consults = defines ? uses >= 2 : /ls-files/.test(src);
    check(
      consults,
      `${f} walks directories to find documents but does not consult the git index` +
        (defines ? ` (keepTracked is defined but never called)` : ``) + `. ` +
        `A file git ignores is working material, not a document. Filter the walk ` +
        `through \`git ls-files\`, falling back to the walk only outside a checkout.`,
    );
  }
}

// 15. A fact with a named owner is not restated outside it.
// .docs-assist/decisions.md carries the ownership map, and the machine-readable
// half of it drives this check, so the rule a reader sees and the rule CI
// enforces are the same text rather than two copies that drift.
//
// This is what keeps the consolidation from decaying. Install lived in five
// files and they disagreed about whether a restart or a reload applies an
// update; the copies were found by an agent reading, which does not scale and
// does not run on every change.
{
  const decisionsPath = '.docs-assist/decisions.md';
  if (existsSync(rel(decisionsPath)) && tracked.length) {
    const block = readFileSync(rel(decisionsPath), 'utf8').match(/```yaml\n(owners:[\s\S]*?)```/);
    if (block) {
      // Minimal parse of the shape this repo writes, not general YAML.
      const rules = [];
      let cur = null;
      for (const line of block[1].split('\n')) {
        const start = line.match(/^\s*-\s+fact:\s*(.+?)\s*$/);
        if (start) { cur = { fact: start[1], also: [] }; rules.push(cur); continue; }
        if (!cur) continue;
        const pat = line.match(/^\s+pattern:\s*"(.+)"\s*$/);
        if (pat) { cur.pattern = pat[1]; continue; }
        const own = line.match(/^\s+owner:\s*(\S+)\s*$/);
        if (own) { cur.owner = own[1]; continue; }
        const also = line.match(/^\s+also:\s*\[(.*)\]\s*$/);
        if (also) cur.also = also[1].split(',').map((x) => x.trim()).filter(Boolean);
      }
      for (const r of rules) {
        if (!r.pattern || !r.owner) continue;
        const allowed = new Set([r.owner, ...r.also, decisionsPath]);
        for (const f of tracked) {
          if (!/\.(md|txt)$/.test(f) || allowed.has(f)) continue;
          const text = readFileSync(rel(f), 'utf8');
          check(
            !text.includes(r.pattern),
            `${f} restates "${r.fact}", which ${r.owner} owns (matched \`${r.pattern}\`). ` +
              `Link to the owner instead, or add this file to that rule's \`also\` list ` +
              `in ${decisionsPath} with the reason it is a separate case.`,
          );
        }
      }
    }
  }
}

if (errors.length) {
  console.error(`validate: ${errors.length} problem(s) across ${checks} checks:`);
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}
console.log(`validate: OK (${checks} checks passed)`);
