#!/usr/bin/env node
// Docs Assist repository validator.
// No dependencies. Run with: node scripts/validate.mjs
//
// Checks:
//   1. Both manifests parse and their versions agree.
//   2. Every command, agent, and skill referenced by the manifest exists.
//   3. Command, agent, and skill files have the required frontmatter.
//   4. docs/ files carry the required frontmatter (title, description, content-type).
//   5. Relative links in llms.txt resolve to real files.

import { readFileSync, existsSync, readdirSync } from 'node:fs';
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
  for (const f of mdFilesUnder('docs')) {
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

// 4c. Every registered command is discoverable: it must appear in llms.txt,
// docs/command-reference.md, and README.md. Catches the drift where a new
// command gets wired internally but never surfaced where users look
// (verify was missing from README when this check was written).
{
  const surfaces = ['llms.txt', 'docs/command-reference.md', 'README.md']
    .filter((f) => existsSync(rel(f)))
    .map((f) => ({ file: f, text: readFileSync(rel(f), 'utf8') }));
  for (const f of plugin.commands || []) {
    const cmd = '/docs-assist:' + f.replace(/^.*\//, '').replace(/\.md$/, '');
    for (const s of surfaces) {
      check(s.text.includes(cmd), `${s.file} does not mention registered command ${cmd}`);
    }
  }
}

// 5. llms.txt relative links resolve.
if (existsSync(rel('llms.txt'))) {
  const llms = readFileSync(rel('llms.txt'), 'utf8');
  for (const m of llms.matchAll(/\]\(([^)]+)\)/g)) {
    const link = m[1];
    if (/^https?:/.test(link) || link.startsWith('#')) continue;
    const path = link.split('#')[0];
    check(existsSync(rel(path)), `llms.txt broken relative link: ${link}`);
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
    const prose = stripCode(readFileSync(rel(f), 'utf8'));
    for (const { file: styleFile, token, re } of patterns) {
      check(!re.test(prose), `${f} contains "${token}" in plain prose, which the shipped ${styleFile} Vale style flags; wrap it in backticks or rephrase`);
    }
  }
}

if (errors.length) {
  console.error(`validate: ${errors.length} problem(s) across ${checks} checks:`);
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}
console.log(`validate: OK (${checks} checks passed)`);
