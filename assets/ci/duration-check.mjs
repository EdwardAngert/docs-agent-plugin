#!/usr/bin/env node
// Docs Assist duration checker.
//
// Deterministic, dependency-free: when a doc promises a total time, check it
// against the waits the doc itself asks for. A quickstart that says five
// minutes and then tells the reader to wait twenty is making a promise the
// procedure cannot keep, and the reader finds out at minute six.
//
// The only thing flagged is an arithmetic contradiction: a stated total, and
// explicit step durations that already exceed it. That needs no judgment.
//
// Everything softer is reported as context and never as a finding:
//   - unquantified waits ("a few minutes", "some time")
//   - a doc with no stated total at all
// Both are worth a writer's attention and neither is a defect, so neither
// fails the check. A doc with no total is not broken, it is just quiet.
//
// Frequencies ("every 5 minutes", "twice an hour") and timeouts ("within 30
// seconds", "times out after 2 minutes") are excluded: they are not elapsed
// time the reader spends, and counting them produced nonsense totals.
//
// Usage: node duration-check.mjs [docs dir]
// Env:
//   DOCS_ASSIST_DOCS_DIR      docs root (default: docs)
//   DURATION_CHECK_STRICT     "1" exits nonzero when a contradiction is found
//   GITHUB_STEP_SUMMARY       when set, the report is appended there too

import { readFileSync, existsSync, readdirSync, statSync, appendFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const docsDir = process.argv[2] || process.env.DOCS_ASSIST_DOCS_DIR || 'docs';

function report(text) {
  console.log(text);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, text + '\n');
}

if (!existsSync(docsDir)) {
  report(`## Duration check\n\nNo docs directory at \`${docsDir}\`. Nothing to check.\n`);
  process.exit(0);
}

const DOC_EXT = /\.(md|mdx|markdown)$/i;

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith('.') || entry === 'node_modules') continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (DOC_EXT.test(entry)) out.push(full);
  }
  return out;
}

const UNIT_MINUTES = { second: 1 / 60, seconds: 1 / 60, sec: 1 / 60, secs: 1 / 60, minute: 1, minutes: 1, min: 1, mins: 1, hour: 60, hours: 60, hr: 60, hrs: 60 };

// A total has to claim the WHOLE document, not one step. "This can take 10 to
// 20 minutes" about an `apt upgrade` is a step; "this guide takes 45 minutes"
// is a promise. Requiring a whole-doc subject, an explicit "total", or "from
// start to finish" is what separates them, and without it every long wait in a
// procedure reads as a broken promise.
const TOTAL_UNIT = '(second|seconds|sec|secs|minute|minutes|min|mins|hour|hours|hr|hrs)';
const TOTAL = new RegExp(
  [
    `\\bthis\\s+(?:\\w+\\s+){0,2}?(?:guide|recipe|tutorial|walkthrough|page|article|process|procedure|setup|quickstart)\\s+(?:takes?|needs?|requires?|runs?)\\s*(?:about\\s+|around\\s+|roughly\\s+|approximately\\s+|~\\s*)?(\\d+)(?:\\s*(?:to|-|–)\\s*(\\d+))?\\s*${TOTAL_UNIT}\\b`,
    `\\btotal\\s+time\\s*[:=]?\\s*(?:about\\s+|around\\s+|~\\s*)?(\\d+)(?:\\s*(?:to|-|–)\\s*(\\d+))?\\s*${TOTAL_UNIT}\\b`,
    `\\b(?:takes?|needs?)\\s*(?:about\\s+|around\\s+|roughly\\s+|approximately\\s+|~\\s*)?(\\d+)(?:\\s*(?:to|-|–)\\s*(\\d+))?\\s*${TOTAL_UNIT}\\s+(?:from\\s+start\\s+to\\s+finish|end\\s+to\\s+end|in\\s+total|overall)\\b`,
    `\\b(\\d+)[-\\s](minute|hour)\\s+(?:quickstart|tutorial|guide|walkthrough|setup)\\b`,
  ].join('|'),
  'i',
);

// A duration the reader actually spends waiting or doing.
const STEP = /\b(?:wait|waits|waiting|takes?|taking|for|allow|give it|leave it|runs? for|sleep)\s+(?:another\s+|about\s+|around\s+|up to\s+)?(\d+)(?:\s*(?:to|-|–)\s*(\d+))?\s*(second|seconds|sec|secs|minute|minutes|min|mins|hour|hours|hr|hrs)\b/gi;

// Not elapsed time the reader spends.
const EXCLUDE = /\b(every|per|each|twice|once)\b[^.]{0,20}$|\bwithin\b|\btimes? out\b|\btimeout\b|\bexpires?\b|\binterval\b|\bfrequency\b/i;

const VAGUE = /\b(?:a\s+few|several|some|a\s+couple\s+of)\s+(seconds|minutes|hours)\b/gi;

function toMinutes(low, high, unit) {
  const factor = UNIT_MINUTES[unit.toLowerCase()] ?? 1;
  const n = high ? Number(high) : Number(low);
  return n * factor;
}

const contradictions = [];
const context = [];

for (const file of walk(docsDir)) {
  const rel = relative(process.cwd(), file);
  const src = readFileSync(file, 'utf8');

  // Strip fenced code so command examples do not contribute durations.
  const prose = src.replace(/^```[\s\S]*?^```/gm, '');

  const totalMatch = prose.match(TOTAL);
  const vague = [...prose.matchAll(VAGUE)].length;

  // The sentence stating the total is not also a step. Without this the
  // promise counts against itself and every doc with a total looks broken.
  const totalSpan = totalMatch
    ? [totalMatch.index, totalMatch.index + totalMatch[0].length]
    : null;

  let stepTotal = 0;
  const steps = [];
  for (const m of prose.matchAll(STEP)) {
    if (totalSpan && m.index < totalSpan[1] && m.index + m[0].length > totalSpan[0]) continue;
    const before = prose.slice(Math.max(0, m.index - 60), m.index + m[0].length + 20);
    if (EXCLUDE.test(before)) continue;
    const minutes = toMinutes(m[1], m[2], m[3]);
    stepTotal += minutes;
    steps.push({ text: m[0].trim(), minutes });
  }

  if (!totalMatch) {
    if (steps.length >= 3 || vague >= 2) {
      context.push({ rel, kind: 'no-total', steps: steps.length, vague, stepTotal });
    }
    continue;
  }

  // The alternation gives four possible capture triples; take whichever fired.
  let stated = null;
  for (let g = 1; g + 2 <= totalMatch.length; g += 3) {
    if (totalMatch[g] && totalMatch[g + 2]) { stated = toMinutes(totalMatch[g], totalMatch[g + 1], totalMatch[g + 2]); break; }
  }
  if (stated === null) continue;

  if (stepTotal > stated) {
    contradictions.push({ rel, stated, stepTotal, steps, vague, quote: totalMatch[0].trim() });
  } else if (vague) {
    context.push({ rel, kind: 'vague', stated, stepTotal, vague });
  }
}

const out = ['## Duration check', ''];

if (!contradictions.length) {
  out.push('No doc promises a total shorter than the waits it asks for.', '');
} else {
  out.push(`Found ${contradictions.length} doc${contradictions.length === 1 ? '' : 's'} promising less time than its own steps require.`, '');
  for (const c of contradictions) {
    out.push(`- \`${c.rel}\`: says "${c.quote}" (${round(c.stated)} min), steps already total ${round(c.stepTotal)} min`);
    for (const s of c.steps.slice(0, 6)) out.push(`  - "${s.text}" (${round(s.minutes)} min)`);
    if (c.vague) out.push(`  - plus ${c.vague} unquantified wait${c.vague === 1 ? '' : 's'}, not counted`);
  }
  out.push('');
}

if (context.length) {
  out.push('### Context, not findings', '');
  for (const c of context) {
    if (c.kind === 'no-total') {
      out.push(`- \`${c.rel}\` has ${c.steps} timed step${c.steps === 1 ? '' : 's'}${c.vague ? ` and ${c.vague} unquantified wait${c.vague === 1 ? '' : 's'}` : ''} (${round(c.stepTotal)} min counted) and states no total. A reader cannot tell whether to start it now.`);
    } else {
      out.push(`- \`${c.rel}\` states ${round(c.stated)} min and has ${c.vague} unquantified wait${c.vague === 1 ? '' : 's'} the total may not cover.`);
    }
  }
  out.push('');
}

function round(n) {
  return Math.round(n * 10) / 10;
}

report(out.join('\n'));

if (contradictions.length && process.env.DURATION_CHECK_STRICT === '1') process.exit(1);
