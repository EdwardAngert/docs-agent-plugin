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
- Added: a silent second-opinion pass on every drafted doc (single or fanned-out), before the contributor sees it. The `doc-auditor` subagent reviews the draft cold, reading only the file and the repo, not the conversation that produced it, the same independence a fresh reviewer in a new session would have. Mechanical findings apply themselves; anything needing judgment folds into the normal review questions instead of surfacing as a separate report. Skipped for very short single-entry docs, and run once per draft rather than after every refinement, so it stays cheap.
- Added: AI-voice detection alongside the em-dash rule. Hedging ("should work in most cases"), marketing language ("seamless," "leverage"), false-contrast framing ("it's not X, it's Y"), and throat-clearing openers ("it's worth noting") are now named in `tone-and-voice.md`, checked by the second-opinion pass, and backed by three new Vale styles (`MarketingLanguage.yml`, `FillerPhrase.yml`, `FalseContrast.yml`) that `/docs-assist:setup-lint` ships alongside the existing `EmDash.yml` and `Weasel.yml`.

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

## Cross-Cutting: llms.txt as Core Functionality

Surfacing docs for AI readers is core, so its rules are single-sourced.

- Shipped in 0.9.5: `reference/llms-txt.md` defines the format (per the llms.txt convention), entry ordering, description rules, the mapping note, and the maintenance contract every workflow follows.

## Later

Deliberately deferred, in rough priority order:

- Auto-running `/docs-assist:update` from CI on detector hits, committing docs changes to the PR. The trust cliff: the sticky-comment loop should earn confidence first.
- Docs-impact noise knobs: a per-repo ignore list in `.docs-assist/config.yml`, and requiring term matches in code-ish doc contexts (inline backticks) rather than anywhere in prose.
- Navigation generation for Astro, Hugo, and Jekyll (0.9.5 covers Docusaurus and MkDocs).
- Audit and audit-methodology consolidation (duplication is partly load-bearing; see `reviews/0.8.0-findings.md`).

## Version Policy

Work in this plan ships no higher than 0.9.5.
The 1.0.0 bump is the maintainer's call, made by hand.
