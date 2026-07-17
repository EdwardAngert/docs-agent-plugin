---
title: "Standalone CLI Packaging Plan"
description: "A plan for adding an npx-run CLI to this repository so Docs Assist reaches people who don't use Claude Code, without forking the plugin into a second codebase."
content-type: reference
audience: maintainers
keywords:
  - packaging
  - npx
  - cli
  - distribution
  - multi-tool
---

# Standalone CLI Packaging Plan

The goal is reach, not telemetry.
Right now Docs Assist only works inside Claude Code, because every command and skill is a markdown instruction that only Claude Code's runtime knows how to execute.
This plan adds an `npx`-run CLI to the same repository so people who use a different AI tool, or no AI tool at all for parts of the workflow, can still get value from it.
It does not propose moving anything out of this repository or replacing the Claude Code plugin.

## Goal and Non-Goals

- Goal: one repository, two entry points. Claude Code users keep installing the plugin exactly as today. Everyone else runs `npx docs-assist`.
- Goal: a single source of truth for the actual instructions (`commands/`, `skills/docs-assist/`), so a change to how `/docs-assist:audit` works doesn't need to be hand-copied into a second format.
- Non-goal (v1): a full multi-provider agent framework that reimplements Claude Code's tool-use loop. That's a real product, not a packaging change, and should stay out of scope unless explicitly decided otherwise.
- Non-goal: changing how the Claude Code plugin is distributed or versioned today.

## The Split That Drives Everything Else

Docs Assist's commands fall into two tiers, and the tiers need different amounts of new engineering.

**Tier 1: static scaffolding.**
No LLM required, just file detection and copying.
`init`, `setup-lint`, `setup-hooks`, and the scaffolding half of `setup-site` and `agent-ready` all work this way today: read some repo conventions, copy files from `assets/`, template a few values.
This tier ports to plain Node with no dependency on any AI tool.

**Tier 2: agentic coaching.**
`draft`, `plan`, `audit`, `health`, `update`, `release-notes`, and `make-examples` all rely on an LLM reading context, asking questions, and writing prose.
Some of them (`draft`) also depend on Claude Code's subagent fan-out to draft multiple docs in parallel.
This tier cannot become a plain Node script; it needs an LLM in the loop one way or another, which is the actual reason a full repackage is a bigger project than it first looks.

Any plan that treats these two tiers the same will either overbuild Tier 1 or underbuild Tier 2. Keep them as separate workstreams.

## Repository Layout

Keep everything that exists today untouched, and add a `cli/` package alongside it.

```text
docs-agent-plugin/
├── .claude-plugin/          # unchanged: Claude Code plugin manifest
├── skills/ commands/ agents/ # unchanged: source of truth for Tier 2 instructions
├── assets/                  # unchanged: source of truth for Tier 1 scaffolding
├── cli/                     # new: the npx package
│   ├── index.mjs            # bin entry
│   └── src/
│       ├── detect.mjs       # port of the convention-detection logic in commands/init.md
│       ├── scaffold.mjs     # copies/templates assets/* into the target repo
│       ├── prompts.mjs      # loads commands/*.md + skills/docs-assist/** as source text
│       └── adapters/        # per-tool converters for Tier 2, see below
│           ├── claude-code.mjs
│           └── agents-md.mjs
├── package.json              # new: root package, name + bin + files allowlist
└── ...
```

`assets/` and `skills/`/`commands/` do not move. The CLI reads from them; it does not duplicate them.

## What the CLI Actually Does

1. `npx docs-assist init` is the Tier 1 entry point. It detects the docs directory, frontmatter field names, heading case, and list style the way `commands/init.md` describes, then scaffolds `.docs-assist/config.yml`, `style.md`, lint configs, and CI workflows from `assets/`.
   It's fully deterministic and makes zero LLM calls, matching this repo's existing no-dependencies philosophy (see `scripts/validate.mjs`'s header comment).
1. `npx docs-assist check` runs the parts of `health.md` that are pure checks (missing frontmatter, broken relative links, stale-by-git-log docs) as plain Node and prints a scorecard.
   The narrative "here's the one fix, want me to make it" step stays Tier 2 and is explicitly out of scope for this command.
1. `npx docs-assist agent` is the Tier 2 entry point. It detects what's already installed (Claude Code plugin, Cursor, a generic `AGENTS.md` convention) and either points the user at the matching Claude Code command, or writes/refreshes an adapter file so another tool can use the same instructions.

## Tier 2 Adapter Strategy

This is the part that actually earns the phrase "more people can use it," and it's worth being explicit about what degrades.

- **Claude Code** (already works): no adapter needed.
- **Rules-file tools** (Cursor, Windsurf, GitHub Copilot custom instructions, Zed) load static markdown instructions the same way Claude Code loads skills.
  Write a converter that strips Claude-Code-only mechanics (`${CLAUDE_PLUGIN_ROOT}` asset paths, `$ARGUMENTS`, subagent `Task` invocations) and emits an instruction file those tools can load.
  This is the highest-leverage adapter to build first.
- **Bare terminal, no IDE at all** (stretch, likely a later phase): the CLI makes LLM calls itself, using a user-supplied API key and a small built-in tool set (read/write/grep). This is the "standalone agent" option raised earlier in scoping. It is a real commitment: you'd own an agent loop, not just a converter, and API cost falls on the user but support burden falls on you. Treat it as optional and defer it past the first release rather than blocking on it.

Whichever adapters ship, subagent fan-out (parallel drafting) has no equivalent outside Claude Code.
Document that as a known capability gap in each adapter's output rather than silently running sequentially and looking broken.

## Source-of-Truth Rule

`commands/*.md` and `skills/docs-assist/**` stay the only place Tier 2 instructions are written.
Adapters transform that content at generation time; they never fork a second hand-maintained copy.
Extend `scripts/validate.mjs` (it already checks that the two plugin manifests agree on version) to also confirm adapter output is regenerated from current source rather than committed and drifting.

## Packaging Details

- Add a root `package.json`: check `docs-assist` is available on npm before committing to the name, since a mismatch between the Claude Code plugin name and the npm package name would confuse install instructions.
- `"bin": {"docs-assist": "./cli/index.mjs"}`.
- Use `"files"` (or `.npmignore`) to limit the published tarball to `cli/`, `assets/`, `commands/`, `skills/`, `agents/`, `LICENSE`, `NOTICE`, `README.md`. `.claude-plugin/` is marketplace-only and doesn't need to ship in the npm tarball.
- Keep the new `package.json` version in sync with `.claude-plugin/plugin.json` and `marketplace.json`, and extend the existing manifest-version check in `scripts/validate.mjs` to include it.
- Apply the same version-bump discipline already in place for the plugin (Edward alone bumps to 1.0.0, agent-driven bumps cap at 0.9.5) to the npm package version too.

## Phased Rollout

**Phase 0.** Get these decisions from Edward before any code is written:

- Confirm the npm package name.
- Confirm which Tier 2 adapter(s) ship in v1. Recommendation: Claude Code (already done) plus the generic rules-file adapter only; defer the bare-API-key agent loop.
- Decide whether the CLI is announced as part of Docs Assist or as a separate-but-related tool, since it changes the README/install story.

**Phase 1.** Build the Tier 1 CLI: `package.json`, `cli/index.mjs`, ported detection and scaffolding logic, `npx docs-assist init` and `check` working end to end with no LLM dependency.

**Phase 2.** Build the generic Tier 2 adapter: the rules-file converter and `npx docs-assist agent` command, tested against at least one real non-Claude-Code tool.

**Phase 3 (optional, later).** Build the bare-API-key agent loop for people with no IDE integration at all.

**Phase 4.** Update the docs: update `README.md`'s install section with both paths, update or supersede `docs/plan.md`, and add a command reference entry for the CLI to `docs/command-reference.md`.

## Testing

- Extend `scripts/validate.mjs` to check the new `package.json` and confirm the `bin` path resolves.
- Add a fixture-repo smoke test that runs `npx docs-assist init` against a throwaway directory and asserts the expected files land, in the same no-dependencies spirit as the existing validator.
- Before release: confirm the Claude Code plugin path is unaffected, run `npm pack` and test the tarball locally with `npx`, and confirm at least one adapter's output loads cleanly in its target tool.

## Risks

- npm name collision: check early, before Phase 1 work starts.
- Prompt drift: writing instructions that must work unmodified for both Claude Code and a generic adapter risks making them vaguer to satisfy both.
  Prefer light per-target templating over a single file trying to fit every target.
- Scope creep into Phase 3: a standalone agent loop is a support and cost commitment, not a packaging detail.
  Keep it explicitly optional until Phases 1 and 2 are proven.
