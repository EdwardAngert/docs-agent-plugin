---
title: "Docs Assist 1.0 Plan"
description: "The staged product plan toward 1.0: fan-out drafting, async SME capture, feedback surfaces, and a publishing scaffold, with what has shipped and what remains."
content-type: reference
audience: maintainers
keywords:
  - roadmap
  - product plan
  - solo writer
  - fan-out drafting
---

# Docs Assist 1.0 Plan

The goal for 1.0: a single person or small team should feel like they can get a documentation team's worth of work done with this plugin.
The contributor-documents-a-feature path is already complete; this plan closes the gaps in the solo-writer-does-a-whole-repo path.
This file follows the plugin's own convention: the plan is a living document, updated as items ship.

## Workstream 1: Fan-Out Drafting

Drafting scaled linearly (a 15-doc plan meant 15 sequential conversations) while audit and update already fanned out.

- Shipped in 0.9.5: the `doc-drafter` subagent drafts one planned doc from a plan entry plus persisted intake material, in parallel with its siblings, flagging what needs subject matter expert verification instead of inventing it.
- Shipped in 0.9.5: `/docs-assist:plan` execution offers to fan out the ship-now stage. Only docs whose material already exists (inventory, code, existing docs) are fanned out; docs needing fresh knowledge stay conversational. The writer becomes the reviewer of a draft queue.
- Shipped in 0.9.5: subagents report their `llms.txt` entries instead of editing the file, and the main conversation writes them, so parallel drafts never collide on the map.
- Added: a silent second-opinion pass on every drafted doc (single or fanned-out), before the contributor sees it. The `doc-auditor` subagent reviews the draft cold, reading only the file and the repo, not the conversation that produced it, the same independence a fresh reviewer in a new session would have. Mechanical findings apply themselves; anything needing judgment folds into the normal review questions instead of surfacing as a separate report. Skipped for very short single-entry docs, and run once per draft rather than after every refinement, so it stays cheap. Briefed with what reconcile already confirmed (from the notes file, when one exists, or a drafter's report in a fan-out) so it spends its pass on what only a fresh, cross-file read catches (structure, cross-doc consistency, voice) rather than re-deriving fact-checks that already happened.
- Added: AI-voice detection alongside the em-dash rule. Hedging (`should work in most cases`), marketing language (`seamless`, `powerful`), false-contrast framing (`it's not X, it's Y`), and throat-clearing openers (`it's worth noting`) are now named in `tone-and-voice.md`, checked by the second-opinion pass, and backed by three new Vale styles (`MarketingLanguage.yml`, `FillerPhrase.yml`, `FalseContrast.yml`) that `/docs-assist:setup-lint` ships alongside the existing `EmDash.yml` and `Weasel.yml`. `leverage` stayed out of the enforced token list: this plugin's own docs use it as a compound noun ("highest-leverage fix"), a reminder that word-level bans need contextual judgment.
- Added: the second-opinion pass extended to `/docs-assist:update` and `/docs-assist:release-notes`, the two workflows most likely to land with no contributor conversation to catch drift (`update` in particular can run entirely off a diff with nobody reviewing until the PR).
- Added: `scripts/validate.mjs` checks that the shipped Vale styles do not fire on the plugin's own docs. Building this surfaced two real, pre-existing bugs: `leverage` collided with this plugin's own vocabulary (already fixed), and `just` was pulled from `Weasel.yml` entirely after the check showed it flagging ordinary restrictive or contrastive English ("not just X", "just enough") in over a dozen files, never the weakening sense the rule means to catch. A bare-word existence match cannot tell the two apart, and `just` is common enough that banning it created more noise than it caught, the same lesson `leverage` already taught `MarketingLanguage.yml`.
- Added: `check-facts.mjs`, a deterministic checker (opt-in via `/docs-assist:setup-hooks`) for the mechanical half of `.docs-assist/reference.yml`: does a `fact` entry's source still contain the identifier it names, and does a `pointer` entry's target file and heading anchor still resolve. Comparing a fact's actual value against its source stays an agent-side check; that needs understanding the source language, which a deterministic script can't do generically.
- Added: `/docs-assist:setup-lint` now also generates a root `.markdownlint-cli2.jsonc` for the target project, extending the rules config with the same glob CI uses. Without it, a bare `npx markdownlint-cli2` falls back to markdownlint's stock defaults and a different scope than CI checks, exactly the trap this plugin's own repo fell into before fixing it on itself.
- Added: `docs-decay.mjs`, a deterministic detector that ranks every doc by accumulated staleness risk: related-source churn since the doc last changed, `last-verified` age, doc age, and open `sme-attested` claims, with the scoring weights documented in the script so the ranking is explainable. The per-PR docs-impact check catches drift one change at a time; this catches what built up across many. `/docs-assist:health` runs it for the Freshness dimension (no installation needed; it runs from the plugin's assets), and full-set audits use it for the outdated-information pass.

## Workstream 2: Async SME Capture

The solo writer's other bottleneck is knowledge in other people's heads, and the SME had to be in the session.

- Shipped in 0.9.5: intake packets. The plugin generates a targeted questionnaire as a Markdown file, pre-loaded with what the code already reveals, that the writer sends to the expert over any channel. Returned answers are ingested through `doc-intake` into `.docs-assist/intake/`, where drafting picks them up.
- Added: an opt-in running notes file for single-doc drafts that outlast one sitting. Offered when a dump is long, many-part, or the contributor needs to step away, it persists every intake move to `.docs-assist/intake/notes/<topic>.md` so a later session (or `/docs-assist:draft` run again) can resume instead of starting over. See "Persist as You Go" in `skills/docs-assist/reference/intake.md`.

## Workstream 3: Feedback Surfaces

Feedback that lives only in the conversation dies with the session. A solo writer has no teammate holding state between sessions.

- Shipped in 0.9.5: feedback is delivered by scope. Change-scoped results (docs-impact, change-based audits, PR updates) go to a sticky, upserted pull-request comment, summary first with detail collapsed. Repo-scoped results (full audits, health scorecards) are offered as report files under `.docs-assist/reports/`. The conversation is for triage, and every workflow ends with a persist offer.
- Shipped in 0.9.5: the CI docs-impact check upserts its report as a sticky PR comment, and `/docs-assist:health` compares against the previous saved scorecard when one exists.

## Workstream 4: Publishing Scaffold

The plugin wrote rich frontmatter and `llms.txt` but never helped stand up the site.

- Shipped in 0.9.5: `/docs-assist:setup-site` detects an existing static site generator and generates navigation from the metadata the plugin already maintains (`llms.txt` order becomes sidebar order), or scaffolds a minimal Docusaurus or MkDocs setup when none exists. Deliberately not a site builder.

## Cross-Cutting: Verified Docs

Everything above makes the docs better written; none of it knew whether the docs actually work. A tutorial whose step 3 broke two releases ago reads perfectly.

- Added: `/docs-assist:verify` and the `doc-verifier` subagent, the first in the plugin with Bash. It executes a procedural doc's steps, in order, in an isolated workspace, and reports per step: pass, divergence (documented vs. actual output shown), fail, blocked, unverified, or skipped. Safety is tiered and conservative: workspace-scoped commands run; anything needing credentials, privilege escalation, real services, or out-of-workspace writes is reported as `unverified`, never run. A missing prerequisite the verifier had to supply is a top-value finding (the assumption gap, made concrete), and a doc whose critical steps are all unrunnable is reported as unverifiable rather than implied-green.
- Added: `last-verified` now has an evidence-backed meaning. A clean verify pass offers the bump, so the date can mean "a machine ran this procedure" rather than "someone eyeballed it." The decay detector reads the field, so verified docs sink down the re-verification queue and the freshness loop closes: `docs-decay.mjs` ranks cheaply, an audit reads carefully, verify actually runs the steps, and each feeds the next.
- Wired in where procedures surface: draft's finalize offers verification before a procedural doc ships, audits recommend it for load-bearing procedures instead of trusting a read-through, and health routes the decay queue's worst procedural docs to it.

## Cross-Cutting: User Stories as the Reader Contract

Journeys existed at the set level (`/docs-assist:plan` maps them) but dissolved into a file list by the time individual docs were drafted or audited; nothing carried "who is this for, arriving from where, done when what" down to the doc.

- Added: `reference/user-stories.md`, the quick per-doc story outline: one line per reader, one to three per doc, written in minutes at the shape move. Drafting lets the stories earn the structure (each section serves a named story; the prerequisites are what the least-prepared reader is missing), plan entries carry their docs' stories into fanned-out drafter briefs, and more than three stories is the one-doc-or-several signal made countable.
- Added: audits walk each story through the doc (arrival, entry, path, exit) as a sixth per-doc dimension, and `doc-auditor` infers the stories cold, which doubles as the audience-clarity test: a doc whose reader cannot be inferred is a finding before any walking starts. The second-opinion pass inherits the check for free, since it runs on `doc-auditor`.
- Added: the reader's baseline is calibrated from evidence, not asserted from a fixed posture. `tone-and-voice.md`'s "developer or technical admin" became a floor rather than a rule; each doc reads its own baseline from what the project's docs already assume, what kind of tool it is, and the ecosystem it lives in, per "Calibrate the Baseline" in `user-stories.md`. Once set, it does two concrete things: prerequisites list only what sits outside it, and failure modes anticipate what that specific reader trips on, not a generic list. `doc-drafter` (which cannot ask a contributor) and `doc-auditor` (which reads cold) both infer it from the same evidence and report the inference so a wrong guess can be corrected.

## Cross-Cutting: Examples That Compose, and Examples That Fail Safe

Two different failure modes were sharing one vague rule ("never include a destructive command without a guard"), and neither had a real mechanism behind it.

- Added: `code-examples.md`'s "Compose Across the Docs Set" makes cross-doc example cohesion a named requirement, not an implication of value consistency. A reader who follows every example across a journey's docs should reach one working result; the same resource named and reused across docs, not just the same-looking placeholder values. `/docs-assist:verify` gained a journey mode: an ordered sequence of docs verified in one shared workspace instead of independent ones, so composition is proven by execution, not just read for plausibility. A journey that fails on a resource-name mismatch between docs, with every individual doc passing alone, is exactly the failure per-doc checks were structurally blind to.
- Added: destructive, upgrade, and troubleshooting examples now have a concrete, opposite rule from setup examples. Setup examples must work exactly as copy-pasted; a destructive example must not, on purpose, because the reader most likely to paste first and read second is the one mid-incident. A warning above a real-looking `prod-cluster` protects nobody who skips it; an unresolvable `<YOUR_CLUSTER_NAME>` protects everyone. `doc-verifier` already refused to run this category; it now also reports a real-looking target as a doc safety finding even when it can't execute to check, and `doc-auditor` and the full audit checklist flag it as Critical, since this is where a reader gets hurt rather than merely confused.

## Cross-Cutting: Managed Vale Packages, Not a Comprehensive House Style

General prose quality (weasel words, passive voice, wordiness, clichés, inclusive language, heading and punctuation conventions) was being hand-maintained in `DocsAssist`'s own Vale style, duplicating what Vale's own actively maintained package ecosystem already covers, and covers better: write-good's `Weasel.yml` alone is more complete than this plugin's version ever was.

- Added: `.vale.ini` now declares `Packages = Google, write-good, alex`, fetched with `vale sync`. `DocsAssist` is stripped down to only what those packages do not cover: AI voice (hedging, marketing language, false-contrast framing, throat-clearing openers) and this plugin's own opinionated defaults (no em dashes, descriptive link text, imperative headings). `Weasel.yml` is retired outright, superseded by write-good's own, more complete version of the same rule.
- Added: two coordination points where a managed package would otherwise fight a project's own config, handled in the generated `.vale.ini`: `Google.Headings` (assumes sentence case) is toggled against `heading_case`, and `Google.EmDash` (a formatting check, not a ban) is disabled when `DocsAssist.EmDash`'s harder ban is already active via `no_em_dashes`, so a project never gets two conflicting findings on the same em dash.
- Changed: `heading_case`'s default flipped from `title` to `sentence`, matching what the new default managed package (Google's developer documentation style guide) itself recommends. Title case (AP or Chicago) stays a fully supported alternative for a project whose own convention already uses it; `/docs-assist:init`'s detect-before-default rule is unaffected; this repo's own docs keep their already-established title case, since a real detected convention still wins over the plugin default.
- Added: both CI templates (this repo's own `ci.yml` and the shipped `docs-lint.yml`) gained an explicit `vale sync` step. Vale never fetches declared packages on its own outside its LSP mode; without the sync step, the next CI run would have started failing the moment the packages were declared but never downloaded.

## Cross-Cutting: llms.txt as Core Functionality

Surfacing docs for AI readers is core, so its rules are single-sourced.

- Shipped in 0.9.5: `reference/llms-txt.md` defines the format (per the llms.txt convention), entry ordering, description rules, the mapping note, and the maintenance contract every workflow follows.

## Cross-Cutting: The Reference Registry

Example values, verified facts, worked-example pointers, and terminology used to live in two separate files (`example-variables.txt`, `terms.txt`), checked only by the agent. Consolidated into one, with a real deterministic check for the part of it that's checkable that way.

- Added: `.docs-assist/reference.yml` replaces both files, single-sourced in `reference/reference-registry.md`. Four entry kinds: `example-variable` (a placeholder value), `fact` (a value tied to a `source` so drift from the source gets caught, not just drift between docs), `pointer` (a link to where a good worked example already lives, so it's reused instead of rewritten), and `term` (canonical word plus variants, the direct successor to `terms.txt`).
- Added: `/docs-assist:setup-lint` compiles every `term` entry into a generated Vale `substitution` rule (`styles/DocsAssist/Terminology.yml`), so terminology consistency also runs as a deterministic lint. The other three kinds stay agent-only: Vale doesn't check inside code blocks by default, ruling out `example-variable` and `fact`, and it can't follow a link to resolve a `pointer`.
- Clean break, not a dual-read: the plugin no longer reads `example-variables.txt` or `terms.txt`. Pre-1.0, and every adopter is using a plugin, not a stable file format, so the simpler path won over a permanent compatibility shim. The survey step in every workflow (draft, audit, init) checks for the old files and offers a one-time migration into `reference.yml` rather than silently ignoring them.

This repo's own `.docs-assist/reference.yml` is migrated from its former `example-variables.txt` and `terms.txt`, dogfooding the same migration a real adopter would run.

## Later

Deliberately deferred, in rough priority order:

- A standalone `npx` CLI so the plugin reaches people who don't use Claude Code, without forking the instructions into a second codebase. See [Standalone CLI Packaging Plan](standalone-cli-plan.md) for the tiered scope (static scaffolding vs. agentic coaching) and the phased rollout. Blocked on a maintainer decision on npm naming and which Tier 2 adapters ship first.
- Auto-running `/docs-assist:update` from CI on detector hits, committing docs changes to the PR. The trust cliff: the sticky-comment loop should earn confidence first.
- Docs-impact noise knobs: a per-repo ignore list in `.docs-assist/config.yml`, and requiring term matches in code-ish doc contexts (inline backticks) rather than anywhere in prose.
- Navigation generation for Astro, Hugo, and Jekyll (0.9.5 covers Docusaurus and MkDocs).
- Audit and audit-methodology consolidation (duplication is partly load-bearing; see `reviews/0.8.0-findings.md`).

## Version Policy

Work in this plan ships no higher than 0.9.5.
The 1.0.0 bump is the maintainer's call, made by hand.
