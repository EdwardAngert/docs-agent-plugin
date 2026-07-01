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

// 4. docs/ frontmatter.
if (existsSync(rel('docs'))) {
  for (const f of readdirSync(rel('docs')).filter((f) => f.endsWith('.md'))) {
    const fm = frontmatter(join('docs', f));
    check(!!fm, `docs/${f} missing frontmatter`);
    for (const key of ['title', 'description', 'content-type']) {
      check(hasKey(fm, key), `docs/${f} missing frontmatter field: ${key}`);
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

if (errors.length) {
  console.error(`validate: ${errors.length} problem(s) across ${checks} checks:`);
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}
console.log(`validate: OK (${checks} checks passed)`);
