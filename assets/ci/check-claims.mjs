#!/usr/bin/env node
// Docs Assist claim checker.
//
// Deterministic, dependency-free: extracts checkable claims (CLI commands and
// flags, config/env keys, function or class names, file paths, version
// requirements, numeric or described behavior, external links) from every doc
// in scope, then resolves the identifier-shaped ones (paths, flags, names,
// keys) against the code with `git grep` and `git ls-files`. This is the
// mechanical half of claim-verification.md's method, applied to the whole
// corpus instead of one claim at a time; `check-facts.mjs` does the same job
// for the curated `.docs-assist/reference.yml` registry, this does it for
// everything else, extraction included.
//
// What it cannot settle stays unsettled on purpose: described behavior
// ("retries three times", "commits atomically") and numeric/runtime claims
// need a reader, not a lookup. Those are written to claims-needs-judgment.json,
// grouped by doc, for claim-briefs.mjs to turn into one agent brief per doc.
//
// Usage: node check-claims.mjs [docsDir] [outDir]
// Env:
//   DOCS_DIR              docs directory (default: docs_dir from
//                          .docs-assist/config.yml, else "docs")
//   CHECK_CLAIMS_OUT       output directory (default: ".docs-assist/claims")
//   CHECK_CLAIMS_STRICT    "1" exits nonzero when any claim resolves "missing"
//   DOCS_ASSIST_REPORT_FILE    when set, the full report is written there too
//   GITHUB_STEP_SUMMARY    when set, the report is appended there too
//
// A claim that resolves "missing" means grep found nothing anywhere in the
// tracked tree, not that the doc is necessarily wrong: a generated-artifact
// filename or a doc-only placeholder token can look identical to real drift
// from a regex's point of view. Those are the two cases this script actively
// tries to rule out before calling something missing (see checkFilePath and
// checkConfigKey below); anything left over after that is worth a human or
// agent second look, not an auto-fix.
//
// A path that will never resolve on purpose (a removed file cited in a
// historical note, a placeholder illustrating a naming convention, a real
// path in a sibling repo) is not drift either, and no heuristic can tell it
// apart from real drift reliably. Mark it explicitly instead:
// `` `old/path.js`<!-- docs-assist:not-a-claim --> ``, immediately after the
// backtick-fenced claim, same line.

import { readFileSync, existsSync, appendFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

function sh(args) {
  try { return execFileSync(args[0], args.slice(1), { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim(); }
  catch (e) { return e.stdout ? String(e.stdout).trim() : ''; }
}

function docsDir() {
  if (process.argv[2]) return process.argv[2];
  if (process.env.DOCS_DIR) return process.env.DOCS_DIR;
  try {
    const m = readFileSync('.docs-assist/config.yml', 'utf8').match(/^docs_dir:\s*(\S+)/m);
    if (m) return m[1];
  } catch { /* no config */ }
  return 'docs';
}

function mdFiles(dir) {
  const out = [];
  const entries = sh(['git', 'ls-files', '--', dir]);
  for (const f of entries.split('\n')) if (/\.mdx?$/.test(f)) out.push(f);
  return out;
}

const DOCS_DIR = docsDir();
const OUT_DIR = process.argv[3] || process.env.CHECK_CLAIMS_OUT || '.docs-assist/claims';
mkdirSync(OUT_DIR, { recursive: true });

const docs = mdFiles(DOCS_DIR);
for (const extra of ['README.md', 'AGENTS.md', 'CLAUDE.md', 'llms.txt']) {
  if (existsSync(extra)) docs.push(extra);
}

// Instruction files carry claims too, and a wrong one there fails silently.
// A bad path in a published doc misleads a reader who can recover; a bad path
// in a skill's reference file sends an agent looking for something that is not
// there, with no error anywhere. Scope defaults to the extra directories named
// in CHECK_CLAIMS_ALSO, or to the conventional plugin layout when it is unset.
const alsoDirs = (process.env.CHECK_CLAIMS_ALSO || 'skills,commands,agents')
  .split(',').map((d) => d.trim()).filter(Boolean);
const instructionFiles = new Set();
for (const dir of alsoDirs) {
  if (dir === DOCS_DIR || !existsSync(dir)) continue;
  for (const f of mdFiles(dir)) {
    if (!docs.includes(f)) docs.push(f);
    instructionFiles.add(f);
  }
}

// An instruction file's examples are not claims about this repository.
// `--dry-run`, `YOUR_KEY`, `config.ts`, and `package.json` in a reference file
// are showing a reader what a doc might contain. Only a path pointing into this
// repo is a real assertion there, so that is all that gets checked. Scoping
// this wrong turns one true finding into sixteen false ones, which is how a
// check gets switched off.
const repoRoots = new Set(sh(['git', 'ls-files']).split('\n')
  .map((f) => f.split('/')[0]).filter(Boolean));
function isRealClaimFor(file, claim) {
  if (!instructionFiles.has(file)) return true;
  // file-path only. A bare directory in an instruction file is almost always
  // one option among several ("a `docs/releases/` directory, or GitHub
  // releases"), while a path with an extension is a real pointer.
  if (claim.category !== 'file-path') return false;
  const v = String(claim.matched || '').replace(/^[`'"]+|[`'"]+$/g, '');
  return v.includes('/') && repoRoots.has(v.split('/')[0]);
}

function report(text) {
  console.log(text);
  // The screen gets the judgment; a file gets the detail when a run is long
  // enough to scroll past. See reference/reports.md for the contract.
  if (process.env.DOCS_ASSIST_REPORT_FILE) {
    appendFileSync(process.env.DOCS_ASSIST_REPORT_FILE, text + '\n');
  }
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, text + '\n');
}

if (!docs.length) {
  report(`## Claim check\n\nNo docs found under \`${DOCS_DIR}\`. Nothing to check.\n`);
  process.exit(0);
}

// (category, pattern): pattern's group 0 is the matched claim text.
const PATTERNS = [
  ['file-path', /`[\w./-]+\.(?:py|js|mjs|cjs|ts|tsx|jsx|go|rb|rs|java|kt|c|h|cpp|hpp|md|mdx|yml|yaml|json|jsonc|toml|ini|sh|Dockerfile)`/g],
  ['bare-path', /`(?:src|lib|scripts|docs|deploy|config|bin)\/[\w./-]+`/g],
  ['cli-command', /`[\w.-]+\s+(?:run|exec)\s+[\w.-]+(?:\s+[\w.<>-]+)*`/g],
  ['cli-flag', /`--[\w-]+(?:[= ][^`]*)?`|`-[a-zA-Z]\b[^`]*`/g],
  ['identifier-call', /`[A-Za-z_][\w.]*\(\)?`/g],
  ['env-or-config-key', /`[A-Z][A-Z0-9_]{2,}`/g],
  ['yaml-key', /`[a-z][a-z0-9_]*:\s*[\w./"'-]*`/g],
  ['version-requirement', /\b(?:Python|Node(?:\.js)?|Go|Ruby|Rust|npm|Docker|Kubernetes)\s+v?[\d.]+\+?\b/gi],
  ['external-link', /https?:\/\/[^\s)\]]+/g],
  ['numeric-behavior', /\b\d+(?:\.\d+)?\s*(?:x|%|seconds?|minutes?|hours?|days?|bits?|bytes?|retries|times?)\b/gi],
  ['described-behavior', /\b(?:always|never|must|defaults? to|retries?|returns?|raises?|throws?|rejects?|refuses?|guarantees?|atomically|silently|automatically)\b/gi],
  ['issue-reference', /#\d{3,}\b/g],
];

// Categories a lookup can settle without judgment.
const MECHANICAL = new Set(['file-path', 'bare-path', 'cli-flag', 'cli-command', 'identifier-call', 'env-or-config-key', 'yaml-key']);

// An author-declared suppression, immediately after the claim it excuses, in
// the same `docs-assist:` comment family as doc-verifier's `no-verify`
// (agents/doc-verifier.md). It exists because some backtick-fenced paths in
// prose are not claims about this repository's current state at all: a
// removed script cited as "recoverable from git history," a placeholder
// illustrating a naming convention, a real path in a sibling repo this
// checkout cannot see. No heuristic can tell those apart from real drift
// reliably enough to guess; the author already knows and says so explicitly,
// the same way a fenced block opts out of doc-verifier.
const SUPPRESS_MARKER = /^\s*<!--\s*docs-assist:not-a-claim\s*-->/;

function extractFromDoc(doc) {
  const claims = [];
  const lines = readFileSync(doc, 'utf8').split('\n');
  let inFence = false;
  lines.forEach((raw, i) => {
    const line = raw.trim();
    if (/^(```|~~~)/.test(line)) { inFence = !inFence; return; }
    if (inFence) return;
    const spans = [];
    for (const [category, pattern] of PATTERNS) {
      pattern.lastIndex = 0;
      let m;
      while ((m = pattern.exec(raw))) {
        const span = [m.index, m.index + m[0].length];
        if (spans.some(([s, e]) => span[0] < e && span[1] > s)) continue;
        spans.push(span);
        if (SUPPRESS_MARKER.test(raw.slice(span[1]))) continue;
        claims.push({ doc, line: i + 1, category, matched: m[0], context: line });
      }
    }
  });
  return claims;
}

const allClaims = docs.flatMap(extractFromDoc);

// --- Mechanical resolution ---------------------------------------------

// All tracked paths, for basename lookups. `git ls-files -- '**/foo'` looks
// like it should do this, but `**` needs `:(glob)` pathspec magic that isn't
// on by default, so it silently matches nothing; filtering the full listing
// in JS sidesteps the pathspec-magic footgun entirely.
const allTrackedFiles = sh(['git', 'ls-files']).split('\n').filter(Boolean);

const gitGrepCache = new Map();
function gitGrepHits(pattern) {
  if (gitGrepCache.has(pattern)) return gitGrepCache.get(pattern);
  // -e marks the pattern explicitly: without it, a pattern starting with
  // "-" (any CLI flag) is misparsed as a git-grep option and dumps usage.
  const out = sh(['git', 'grep', '-n', '-F', '-w', '-e', pattern, '--', ':!*.md', ':!*.mdx']);
  const hits = out ? out.split('\n').filter(Boolean) : [];
  gitGrepCache.set(pattern, hits);
  return hits;
}

// A literal (non-word-boundary) substring search, for filenames and flags
// that aren't standalone identifiers (e.g. "validation-summary.md", "--foo=bar").
function gitGrepLiteral(pattern) {
  const key = `lit:${pattern}`;
  if (gitGrepCache.has(key)) return gitGrepCache.get(key);
  // The plugin's own working tree is never evidence for the plugin's own
  // checks. claims.json records the text of every claim found, so tracking it
  // made each claim resolve by finding itself: 20 real findings silently became
  // 0 between two runs with nothing fixed. The same shape applies to every
  // artifact under .docs-assist/ — a reconstructed packet is a transcription of
  // a document's claims, and a report quotes them. Markdown artifacts happen to
  // be excluded by the *.md filter below, but that is accidental protection,
  // and a packet written as YAML or a report as JSON would poison this again.
  // Exclude the whole working tree by rule rather than by coincidence.
  const out = sh(['git', 'grep', '-n', '-F', '-e', pattern, '--',
    ':!*.md', ':!*.mdx', `:!${OUT_DIR}/*`, ':!.docs-assist/*']);
  const hits = out ? out.split('\n').filter(Boolean) : [];
  gitGrepCache.set(key, hits);
  return hits;
}

function checkFilePath(matched, context) {
  const pathStr = matched.replace(/`/g, '');
  if (existsSync(pathStr)) return ['confirmed', `exists at ${pathStr}`];
  const base = pathStr.split('/').pop();
  const byBasename = allTrackedFiles.find((f) => f === base || f.endsWith(`/${base}`));
  if (byBasename) return ['confirmed', `found at ${byBasename}`];
  // Not on disk doesn't settle it: a runtime-generated artifact (a report the
  // tool writes) is often named as a string literal in source without ever
  // being checked in. Confirm the name is real that way before calling it
  // missing, and only report "missing" outright when neither check backs it.
  const literalHits = gitGrepLiteral(pathStr.length > 3 ? pathStr : base);
  if (literalHits.length) return ['confirmed', `named as a generated-artifact filename in source: ${literalHits[0]}`];
  const generativeWords = ['writes', 'written', 'generates', 'generated', 'creates', 'created', 'produces', 'produced', 'output', 'outputs', 'saves', 'saved'];
  if (generativeWords.some((w) => context.toLowerCase().includes(w))) {
    return ['needs-judgment', `no file found for ${pathStr}, but context suggests a generated artifact: verify by running the tool, not by grep`];
  }
  return ['missing', `no file named ${pathStr} found on disk, by basename, or as a string literal in tracked source`];
}

function checkIdentifierCall(matched) {
  let name = matched.replace(/`/g, '').replace(/\(.*$/, '');
  name = name.split('.').pop();
  if (!name) return ['needs-judgment', 'empty identifier after normalization'];
  const hits = gitGrepHits(name);
  if (hits.length) return ['confirmed', `'${name}' found: ${hits[0]}`];
  return ['missing', `'${name}' not found anywhere in tracked non-doc source`];
}

function checkCliFlag(matched) {
  const flag = matched.replace(/`/g, '').split(/[ =]/)[0];
  if (!flag.startsWith('-')) return ['needs-judgment', 'not a real flag token'];
  const bare = flag.replace(/^-+/, '');
  if (bare.includes('_')) {
    return ['needs-judgment', 'underscore in a dashed flag suggests a placeholder, not a literal flag'];
  }
  let hits = gitGrepLiteral(flag);
  if (hits.length) return ['confirmed', `${flag} found as a literal: ${hits[0]}`];
  // Frameworks that derive a CLI flag from a parameter/field name (typer,
  // click, clap, cobra) often have no literal string for the dashed form at
  // all; check the underscore-normalized identifier too before giving up.
  const param = bare.replace(/-/g, '_');
  hits = gitGrepHits(param);
  if (hits.length) return ['confirmed', `${flag} inferred from parameter/field '${param}': ${hits[0]}`];
  return ['missing', `${flag} not found as a literal or as parameter/field '${param}'`];
}

function checkConfigKey(matched) {
  const key = matched.replace(/`/g, '').split(':')[0].trim();
  const hits = gitGrepHits(key);
  if (hits.length) return ['confirmed', `'${key}' found: ${hits[0]}`];
  // SCREAMING_SNAKE backtick tokens are also used as doc-only placeholders
  // for a CLI positional arg (`DATASET_URL` standing in for `<dataset-url>`);
  // a doc using it as `<KEY>` elsewhere confirms that reading, not drift.
  const placeholderHits = gitGrepLiteral(`<${key}>`);
  if (placeholderHits.length) {
    return ['needs-judgment', `'${key}' not found in code, but used as a <${key}> placeholder elsewhere: likely doc shorthand, not a real key`];
  }
  return ['missing', `'${key}' not found anywhere in tracked non-doc source`];
}

function checkCliCommand(matched) {
  const tokens = matched.replace(/`/g, '').split(/\s+/).filter((t) => !/^<.*>$/.test(t));
  const last = tokens.at(-1);
  if (!last) return ['needs-judgment', 'could not extract a command token'];
  const hits = gitGrepHits(last) || gitGrepHits(last.replace(/-/g, '_'));
  if (hits.length) return ['confirmed', `'${last}' found: ${hits[0]}`];
  return ['missing', `'${last}' not found anywhere in tracked non-doc source`];
}

const CHECKERS = {
  'file-path': (c) => checkFilePath(c.matched, c.context),
  'bare-path': (c) => checkFilePath(c.matched, c.context),
  'identifier-call': (c) => checkIdentifierCall(c.matched),
  'cli-flag': (c) => checkCliFlag(c.matched),
  'cli-command': (c) => checkCliCommand(c.matched),
  'env-or-config-key': (c) => checkConfigKey(c.matched),
  'yaml-key': (c) => checkConfigKey(c.matched),
};

let confirmed = 0, missing = 0, resolved = 0;
for (const c of allClaims) {
  const checker = CHECKERS[c.category];
  if (!checker) { c.status = 'needs-judgment'; c.evidence = ''; continue; }
  const [status, evidence] = checker(c);
  c.status = status;
  c.evidence = evidence;
  resolved++;
  if (status === 'confirmed') confirmed++;
  else if (status === 'missing') missing++;
}

writeFileSync(`${OUT_DIR}/claims.json`, JSON.stringify(allClaims, null, 2) + '\n');

const needsJudgment = allClaims.filter((c) => c.status === 'needs-judgment');
const byDoc = {};
for (const c of needsJudgment) (byDoc[c.doc] ??= []).push(c);
writeFileSync(`${OUT_DIR}/claims-needs-judgment.json`, JSON.stringify(byDoc, null, 2) + '\n');

const missingClaims = allClaims.filter((c) => c.status === 'missing' && isRealClaimFor(c.doc, c));
// Claims that resolved "missing" inside an instruction file, where a generic
// example is not a claim about this repository. They are suppressed from the
// table by isRealClaimFor, so they must not be counted as missing in the
// summary either: reporting eleven and showing one teaches a reader that the
// table is incomplete, and the next real finding gets discounted with it.
const suppressed = missing - missingClaims.length;

let out = `## Claim check\n\n`;
out += `${docs.length} docs, ${allClaims.length} candidate claims (${resolved} mechanically checkable: ${confirmed} confirmed, ${missingClaims.length} missing, ${resolved - confirmed - missingClaims.length} demoted to judgment`;
out += suppressed ? `, of which ${suppressed} are examples inside instruction files rather than claims about this repository). ` : `). `;
out += `${needsJudgment.length} require a reader, grouped by doc in \`${OUT_DIR}/claims-needs-judgment.json\`: hand those to \`claim-briefs.mjs\`.\n\n`;
if (missingClaims.length) {
  out += `### Missing (code doesn't back the claim anymore)\n\n`;
  out += `| Doc | Line | Category | Matched | Evidence |\n| --- | ---: | --- | --- | --- |\n`;
  for (const c of missingClaims) {
    out += `| \`${c.doc}\` | ${c.line} | ${c.category} | \`${c.matched}\` | ${c.evidence} |\n`;
  }
  out += '\n';
} else {
  out += `No claims resolved "missing" this run.\n\n`;
}
out += `Full claim set: \`${OUT_DIR}/claims.json\`.\n`;

report(out);
if (missingClaims.length && process.env.CHECK_CLAIMS_STRICT === '1') process.exit(1);
