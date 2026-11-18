#!/usr/bin/env node
// Docs Assist markdown-pattern survey.
//
// Deterministic, dependency-free: reads the docs a project tracks and reports
// every way it does each of the things a writer has to choose a form for:
// images, links, callouts, list items, indentation, and custom components.
// Where a site does one thing more than one way, the report lists each way with
// its count and an example, so a person can pick one as the standard.
//
// It does not choose. The most-used form is not always the right one (a site
// generator's own callout renders; a bold "Note:" doesn't), so the
// recommendation is a judgment the plugin makes with the contributor, written
// into the project's style.md. See reference/markdown-reference.md.
//
// Code blocks and inline code are skipped: an example of a pattern is not a use
// of it.
//
// Usage: node markdown-patterns.mjs [docs dir] [--json]
// Env:
//   DOCS_ASSIST_DOCS_DIR      docs root (default: docs when it exists, else the whole repo)
//   DOCS_ASSIST_REPORT_FILE   when set, the full report is written there too
//   GITHUB_STEP_SUMMARY       when set, the report is appended there too

import { execSync } from 'node:child_process';
import { appendFileSync, existsSync, readdirSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const asJson = args.includes('--json');
const docsDir = args.find((a) => !a.startsWith('--')) || process.env.DOCS_ASSIST_DOCS_DIR || (existsSync('docs') ? 'docs' : '.');
const DOC_EXT = /\.(md|mdx|markdown)$/i;
const EXAMPLES = 2;

function report(text) {
  console.log(text);
  if (process.env.DOCS_ASSIST_REPORT_FILE) appendFileSync(process.env.DOCS_ASSIST_REPORT_FILE, text + '\n');
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, text + '\n');
}

// --- which files: the documentation set is what git tracks -------------------

function keepTracked(files) {
  let tracked;
  try {
    execSync('git rev-parse --git-dir', { stdio: 'ignore' });
    tracked = new Set(execSync('git ls-files -z', { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).split('\0').filter(Boolean));
  } catch {
    return files;
  }
  return files.filter((f) => tracked.has(f.replace(/^\.\//, '')));
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith('.') || entry === 'node_modules') continue;
    const full = join(dir, entry);
    let st;
    try { st = statSync(full); } catch { continue; }
    if (st.isDirectory()) walk(full, out);
    else if (DOC_EXT.test(entry)) out.push(relative('.', full));
  }
  return out;
}

// --- which site generator, if any ---------------------------------------------

function readIf(path) { try { return readFileSync(path, 'utf8'); } catch { return ''; } }
function anyOf(names) { return names.find((n) => existsSync(n)); }

export function detectGenerator() {
  if (anyOf(['docusaurus.config.js', 'docusaurus.config.ts', 'docusaurus.config.mjs', 'docusaurus.config.cjs'])) return 'Docusaurus';
  if (anyOf(['mkdocs.yml', 'mkdocs.yaml'])) return 'MkDocs';
  const astro = anyOf(['astro.config.mjs', 'astro.config.js', 'astro.config.ts']);
  if (astro) return /starlight/.test(readIf(astro)) ? 'Astro Starlight' : 'Astro';
  if (anyOf(['.vitepress', 'docs/.vitepress'])) return 'VitePress';
  if (anyOf(['mint.json', 'docs.json']) && /mintlify|"navigation"/.test(readIf(anyOf(['mint.json', 'docs.json'])))) return 'Mintlify';
  if (anyOf(['hugo.toml', 'hugo.yaml', 'hugo.json'])) return 'Hugo';
  if (existsSync('_config.yml')) return 'Jekyll';
  if (existsSync('conf.py') || existsSync('docs/conf.py')) return 'Sphinx';
  return null;
}

// --- the survey ----------------------------------------------------------------

const CALLOUT_WORDS = 'Note|Warning|Tip|Important|Caution|Info|Danger|Attention|Hint';
const CALLOUT_TAGS = new Set(['Aside', 'Callout', 'Admonition', 'Note', 'Warning', 'Tip', 'Info', 'Caution', 'Danger', 'Important', 'Check']);
const IMAGE_TAGS = new Set(['Image', 'Img', 'Figure', 'ThemedImage', 'Picture']);
const LINK_TAGS = new Set(['Link', 'LinkCard', 'CardLink']);

export function survey(files, read = (f) => readFileSync(f, 'utf8')) {
  const cats = {};
  const components = {};
  const notes = { emptyAlt: [] };
  const add = (cat, variant, where) => {
    const c = (cats[cat] ||= {});
    const v = (c[variant] ||= { count: 0, examples: [] });
    v.count += 1;
    if (v.examples.length < EXAMPLES && !v.examples.includes(where)) v.examples.push(where);
  };
  const addComponent = (name, where) => {
    const v = (components[name] ||= { count: 0, examples: [] });
    v.count += 1;
    if (v.examples.length < EXAMPLES && !v.examples.includes(where)) v.examples.push(where);
  };

  for (const file of files) {
    let text;
    try { text = read(file); } catch { continue; }
    const lines = text.split('\n');
    let fence = null;
    let inFrontmatter = lines[0] === '---';
    const ordered = new Map(); // indent -> { last, counted }
    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i];
      const where = `${file}:${i + 1}`;
      if (inFrontmatter) { if (i > 0 && raw === '---') inFrontmatter = false; continue; }
      const f = raw.match(/^\s*(`{3,}|~{3,})/);
      if (f) {
        if (!fence) fence = f[1][0];
        else if (f[1][0] === fence) fence = null;
        continue;
      }
      if (fence) continue;
      const line = raw.replace(/`[^`\n]*`/g, '``');

      // Indentation: what leads a line that is indented at all.
      if (/^\t/.test(line) && line.trim()) add('Indentation', 'Tabs', where);
      else if (/^ {2,}\S/.test(line)) add('Indentation', 'Spaces', where);

      // Images.
      for (const m of line.matchAll(/!\[([^\]]*)\]\(([^)]*)\)/g)) {
        add('Images', 'Markdown image `![alt](path)`', where);
        if (!m[1].trim()) notes.emptyAlt.push(where);
      }
      if (/!\[[^\]]*\]\[[^\]]*\]/.test(line)) add('Images', 'Reference-style image `![alt][ref]`', where);
      if (/<img\b/i.test(line)) add('Images', 'HTML `<img>`', where);
      if (/\{\{[<%]\s*figure\b/.test(line)) add('Images', 'Shortcode `{{< figure >}}`', where);

      // Links, with images taken out first.
      const noImages = line.replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/!\[[^\]]*\]\[[^\]]*\]/g, '');
      for (const m of noImages.matchAll(/\[[^\]]+\]\(([^)\s]+)[^)]*\)/g)) {
        add('Links', 'Inline `[text](target)`', where);
        const target = m[1];
        if (/^(https?:|mailto:|tel:|#)/i.test(target)) continue;
        const path = target.split('#')[0].split('?')[0];
        if (path.startsWith('/')) add('Internal link targets', 'Site-absolute `/path`', where);
        else if (DOC_EXT.test(path)) add('Internal link targets', 'Relative with the file extension `page.md`', where);
        else add('Internal link targets', 'Relative without an extension `page`', where);
      }
      if (/(^|[^!\]])\[[^\]]+\]\[[^\]]*\]/.test(noImages) || /^\s*\[[^\]]+\]:\s+\S/.test(noImages)) add('Links', 'Reference-style `[text][ref]`', where);
      if (/<https?:\/\/[^>]+>/.test(noImages)) add('Links', 'Autolink `<https://...>`', where);
      const bare = noImages.replace(/\[[^\]]*\]\([^)]*\)/g, '').replace(/<[^>]*>/g, '').replace(/^\s*\[[^\]]+\]:.*$/, '');
      if (/(^|[\s(])https?:\/\/\S+/.test(bare)) add('Links', 'Bare URL', where);
      if (/<a\s[^>]*href=/i.test(noImages)) add('Links', 'HTML `<a href>`', where);

      // Callouts.
      if (/^\s*>\s*\[!\w+\]/.test(line)) add('Callouts', 'GitHub alert `> [!NOTE]`', where);
      else if (new RegExp(`^\\s*>\\s*\\*\\*(${CALLOUT_WORDS})\\b`, 'i').test(line)) add('Callouts', 'Blockquote with a bold label `> **Note:**`', where);
      if (/^\s*:::\s*[a-z]+/i.test(line)) add('Callouts', 'Container `:::note`', where);
      if (/^\s*(!!!|\?\?\?\+?)\s+\w+/.test(line)) add('Callouts', 'Admonition `!!! note`', where);
      if (new RegExp(`^\\*\\*(${CALLOUT_WORDS})(:\\*\\*|\\*\\*:)`, 'i').test(line)) add('Callouts', 'Bold label paragraph `**Note:**`', where);
      if (new RegExp(`\\{\\{[<%]\\s*(notice|alert|callout|admonition|hint|note|warning|tip)\\b`, 'i').test(line)) add('Callouts', 'Shortcode `{{< notice >}}`', where);

      // Components, by name. Callout, image, and link components count under
      // their own kind, and also here, so the inventory is complete.
      for (const m of line.matchAll(/<([A-Z][A-Za-z0-9]*(?:\.[A-Z][A-Za-z0-9]*)*)\b/g)) {
        const name = m[1];
        if (CALLOUT_TAGS.has(name)) add('Callouts', `Component \`<${name}>\``, where);
        else if (IMAGE_TAGS.has(name)) add('Images', `Component \`<${name}>\``, where);
        else if (LINK_TAGS.has(name)) add('Links', `Component \`<${name}>\``, where);
        addComponent(`<${name}>`, where);
      }
      for (const m of line.matchAll(/\{\{[<%]\s*([\w-]+)/g)) if (!m[1].startsWith('/')) addComponent(`{{< ${m[1]} >}}`, where);
      for (const m of line.matchAll(/\{%-?\s*([\w-]+)/g)) if (!/^end/.test(m[1])) addComponent(`{% ${m[1]} %}`, where);
      if (/^===\s+"/.test(line)) addComponent('Content tabs `=== "Tab"`', where);

      // List items.
      const ul = line.match(/^(\s*)([-*+])\s+\S/);
      if (ul && !/^\s*[-*_](\s*[-*_]){2,}\s*$/.test(line)) {
        add('Unordered list markers', `\`${ul[2]}\``, where);
        if (ul[1].length) add('Nested list indent', ul[1].includes('\t') ? 'Tab' : `${ul[1].length} spaces`, where);
      }
      const ol = line.match(/^(\s*)(\d+)([.)])\s+\S/);
      if (ol) {
        const indent = ol[1].length;
        const n = Number(ol[2]);
        add('Ordered list delimiter', `\`1${ol[3]}\``, where);
        if (indent) add('Nested list indent', ol[1].includes('\t') ? 'Tab' : `${indent} spaces`, where);
        const prev = ordered.get(indent);
        if (prev && !prev.counted) {
          if (n === 1 && prev.last === 1) { add('Ordered list numbering', 'Every item `1.`', where); prev.counted = true; }
          else if (n === prev.last + 1) { add('Ordered list numbering', 'Counted `1. 2. 3.`', where); prev.counted = true; }
        }
        ordered.set(indent, { last: n, counted: prev ? prev.counted : false });
      } else if (/^#{1,6}\s/.test(line) || (/^\S/.test(line) && !ul)) {
        ordered.clear();
      }
    }
  }
  return { cats, components, notes };
}

// --- report ----------------------------------------------------------------------

const ORDER = ['Images', 'Links', 'Internal link targets', 'Callouts', 'Unordered list markers', 'Ordered list numbering', 'Ordered list delimiter', 'Nested list indent', 'Indentation'];

export function analyze(files, generator, read) {
  const { cats, components, notes } = survey(files, read);
  const categories = ORDER.filter((c) => cats[c]).map((name) => ({
    name,
    variants: Object.entries(cats[name]).map(([v, d]) => ({ name: v, ...d })).sort((a, b) => b.count - a.count),
  }));
  const mixed = categories.filter((c) => c.variants.length > 1).map((c) => c.name);
  const componentList = Object.entries(components).map(([n, d]) => ({ name: n, ...d })).sort((a, b) => b.count - a.count);
  const mdx = files.some((f) => /\.mdx$/i.test(f));
  // A site is what warrants a reference: a generator, MDX, or components a
  // reader's markdown has to match. Plain markdown done two ways is the
  // conventions stage's job, so mixed forms add a reason but never make one.
  const reasons = [];
  if (generator) reasons.push(`it builds with ${generator}`);
  if (mdx) reasons.push('it uses MDX');
  if (componentList.length) reasons.push(`it uses ${componentList.length} custom component${componentList.length === 1 ? '' : 's'}`);
  const warranted = reasons.length > 0;
  if (mixed.length) reasons.push(`it does ${mixed.length} thing${mixed.length === 1 ? '' : 's'} more than one way`);
  return { generator, files: files.length, warranted, reasons, mixed, categories, components: componentList, emptyAlt: notes.emptyAlt };
}

function render(r) {
  const out = ['## Markdown patterns', ''];
  out.push(`${r.files} doc${r.files === 1 ? '' : 's'} read${r.generator ? `, built with ${r.generator}` : ''}.`);
  out.push(r.warranted
    ? `Worth a markdown reference: ${r.reasons.join(', ')}.`
    : `Not worth a markdown reference: no site generator, MDX, or components to describe${r.mixed.length ? `, though ${r.mixed.length} thing${r.mixed.length === 1 ? ' is' : 's are'} done more than one way` : ''}.`);
  out.push('');
  for (const c of r.categories) {
    out.push(`### ${c.name}: ${c.variants.length === 1 ? 'one way' : `${c.variants.length} ways`}`, '');
    out.push('| Form | Uses | For example |', '| --- | --- | --- |');
    for (const v of c.variants) out.push(`| ${v.name} | ${v.count} | ${v.examples.join(', ')} |`);
    out.push('');
  }
  if (r.components.length) {
    out.push('### Custom components', '', '| Component | Uses | For example |', '| --- | --- | --- |');
    for (const v of r.components) out.push(`| \`${v.name.replace(/`/g, '')}\` | ${v.count} | ${v.examples.join(', ')} |`);
    out.push('');
  }
  if (r.emptyAlt.length) out.push(`${r.emptyAlt.length} image${r.emptyAlt.length === 1 ? ' has' : 's have'} no alt text, for example ${r.emptyAlt.slice(0, EXAMPLES).join(', ')}.`, '');
  out.push('This report counts; it does not choose. Where something is done more than one way, recommend one as the standard with the contributor.');
  return out.join('\n');
}

function main() {
  if (!existsSync(docsDir)) {
    report(`## Markdown patterns\n\nNo docs directory at \`${docsDir}\`. Nothing to read.\n`);
    return 0;
  }
  const files = keepTracked(walk(docsDir)).sort();
  const result = analyze(files, detectGenerator());
  if (asJson) console.log(JSON.stringify(result, null, 2));
  else report(render(result));
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) process.exit(main());
