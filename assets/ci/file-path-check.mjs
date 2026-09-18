#!/usr/bin/env node
// Docs Assist file-path checker.
//
// Deterministic, dependency-free: finds places where a doc tells the reader
// to write or edit a file and never says which file.
//
// A reader who cannot tell which file to edit cannot finish the step. There
// is no workaround and no partial credit, which makes this one of the
// cheapest documentation failures to prevent and one of the most common.
//
// Precision over recall, deliberately. The signal is the *instruction*, not
// the shape of the block: prose in the lines just above a code block uses a
// write verb ("create", "add the following to", "edit", "save this as"), and
// no path appears on the block's title, in that prose, or in the block's own
// first lines. Blocks that only run commands are skipped, and so is anything
// with a path already in reach of the reader's eye.
//
// It does not check whether the path is correct, only whether one is given.
// It does not check language tags: "the tag does not match the content" fires
// on deliberate accommodations (`sshd_config` highlighted as `java` because
// the highlighter has no grammar for it), which is the lesson `leverage` and
// `just` already taught the Vale styles.
//
// Usage: node file-path-check.mjs [docs dir]
// Env:
//   DOCS_ASSIST_DOCS_DIR      docs root (default: docs)
//   FILE_PATH_CHECK_STRICT    "1" exits nonzero when anything is flagged
//   DOCS_ASSIST_REPORT_FILE    when set, the full report is written there too
//   GITHUB_STEP_SUMMARY       when set, the report is appended there too

import { execSync } from 'node:child_process';
import { readFileSync, existsSync, readdirSync, statSync, appendFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const docsDir = process.argv[2] || process.env.DOCS_ASSIST_DOCS_DIR || 'docs';

function report(text) {
  console.log(text);
  // The screen gets the judgment; a file gets the detail when a run is long
  // enough to scroll past. See reference/reports.md for the contract.
  if (process.env.DOCS_ASSIST_REPORT_FILE) {
    appendFileSync(process.env.DOCS_ASSIST_REPORT_FILE, text + '\n');
  }
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, text + '\n');
}

if (!existsSync(docsDir)) {
  report(`## File-path check\n\nNo docs directory at \`${docsDir}\`. Nothing to check.\n`);
  process.exit(0);
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

// A write instruction aimed at a file, in the prose above a block.
// "Run the following" and "install X" are deliberately absent: those are
// commands, and a command block needs no path.
const WRITE_VERB = /\b(creat(e|ing)|edit(ing)?|add(ing)?\s+(the\s+)?(following|this|these)|append(ing)?|save\s+(this|it|the)|paste\s+(this|it|the)|put\s+(this|the\s+following)|replace\s+the\s+contents|write\s+(this|the\s+following)|open\s+the\s+file|modif(y|ying))\b/i;

// Anything that reads as a filesystem location to a human eye.
const PATH_LIKE = /(^|[\s"'`(=])(~?\/[A-Za-z0-9._\/-]*[A-Za-z0-9._-]|[A-Za-z0-9._-]+\.(conf|cfg|ini|toml|ya?ml|json|env|properties|service|rules|list|local|example|sh|bashrc|zshrc|profile))/;

// A write verb aimed at a user interface is not aimed at a file. "Paste the
// allowlist" into a web form is correct as written and has no path to give.
const UI_TARGET = /\b(web\s+interface|dashboard|browser|admin\s+page|settings|preferences|the\s+\w+\s+field|text\s+box|form|console|portal|wizard|dialog|modal|sidebar|menu|clipboard)\b/i;

// Language tags that are never file contents.
const NON_FILE_LANG = /^(url|uri|text|output|console|http|log|diff|mermaid|csv|tsv)$/i;

// Shell-ish content: a block of commands needs no file path.
const COMMAND_LINE = /^\s*[$#>]?\s*(sudo|apt|apt-get|yum|dnf|brew|curl|wget|git|npm|npx|pnpm|yarn|docker|kubectl|systemctl|service|cd|ls|cat|grep|sed|awk|echo|mkdir|chmod|chown|ssh|scp|rsync|dig|ping|ip|nmcli|ufw|fail2ban-client|pihole|python3?|node|make|go|cargo)\b/;

function isCommandBlock(body) {
  const lines = body.split('\n').filter((l) => l.trim());
  if (!lines.length) return true;
  const commandish = lines.filter((l) => COMMAND_LINE.test(l)).length;
  return commandish / lines.length >= 0.5;
}

const findings = [];

for (const file of keepTracked(walk(docsDir))) {
  const lines = readFileSync(file, 'utf8').split('\n');

  for (let i = 0; i < lines.length; i++) {
    const open = lines[i].match(/^(\s*)```+\s*(.*)$/);
    if (!open) continue;

    const [, indent, info] = open;
    const fence = lines[i].trim().match(/^`+/)[0];

    // Find the closing fence.
    let end = i + 1;
    while (end < lines.length && !new RegExp(`^\\s*${fence}\\s*$`).test(lines[end])) end++;
    const body = lines.slice(i + 1, end).join('\n');

    // A path on the fence info string (```ini title="/etc/x" or ```ini /etc/x)
    // is the clearest possible declaration.
    if (PATH_LIKE.test(info)) { i = end; continue; }
    if (NON_FILE_LANG.test((info.split(/\s+/)[0] || '').trim())) { i = end; continue; }
    if (isCommandBlock(body)) { i = end; continue; }

    // The block's own first lines sometimes carry the path as a comment.
    const head = body.split('\n').slice(0, 3).join('\n');
    if (/^\s*[#;\/]{1,2}\s*.*/.test(head) && PATH_LIKE.test(head)) { i = end; continue; }

    // Prose window above the block, skipping blank lines.
    const window = [];
    for (let j = i - 1; j >= 0 && window.length < 4; j--) {
      if (!lines[j].trim()) { if (window.length) break; continue; }
      window.unshift(lines[j]);
    }
    const prose = window.join(' ');

    if (WRITE_VERB.test(prose) && !PATH_LIKE.test(prose) && !UI_TARGET.test(prose)) {
      findings.push({
        file: relative(process.cwd(), file),
        line: i + 1,
        lang: (info.split(/\s+/)[0] || '(none)').trim() || '(none)',
        prose: prose.trim().replace(/\s+/g, ' ').slice(0, 120),
      });
    }

    i = end;
  }
}

const lines = ['## File-path check', ''];

if (!findings.length) {
  lines.push('Every block that follows a write instruction names its file. Nothing to flag.', '');
} else {
  lines.push(
    `Found ${findings.length} block${findings.length === 1 ? '' : 's'} a reader is told to write, with no file path in reach.`,
    '',
    'The path belongs on the block itself, where the reader\'s eye and their copy-paste both land.',
    '',
  );
  for (const f of findings) {
    lines.push(`- \`${f.file}:${f.line}\` (\`${f.lang}\`)`);
    lines.push(`  - Instruction: "${f.prose}"`);
  }
  lines.push('');
}

report(lines.join('\n'));

if (findings.length && process.env.FILE_PATH_CHECK_STRICT === '1') process.exit(1);
