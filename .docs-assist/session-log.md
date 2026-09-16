# Session Log

Append-only. Newest last. See `skills/docs-assist/reference/session-log.md` for what belongs here.

## 2026-09-16: the 1.0 overhaul

Twenty-one commits on `1.0-overhaul`, tagged `v1.0.0`. **Nothing is pushed.** The branch, the tag, and the pull request are all still local.

### Where it stands

Phases 1 through 5 of `docs/1.0-release-plan.md` are complete. Phase 6 is partly done: the loop has been run, and the release is cut and gated, but it has not shipped.

Every check passes locally, including the two that CI runs and an earlier gate of mine did not: `validate.mjs` (3,523), markdownlint, Vale, cspell, the four deterministic checks across `docs`, `skills`, `commands`, and `agents`, `check-facts`, `check-claims`, and a link check over every tracked markdown file.

### Calls worth not revisiting

- **1.0 is one overhaul, not staged increments.** Edward's call. All open pull requests closed; PR #13's salvage is noted on its thread.
- **Commands went 14 to 9, not to "roughly four."** The design said four. Building it showed that collapses draft, plan, audit, and release-notes into one door and loses real differences in *input*. The useful cut is doors against plumbing, not a target number.
- **Intake and the packet are one artifact.** The claim that they already were was in the docs and false in the build.
- **An audit is the loop pointed at a finished doc.** Pass 0 reconstructs the packet from what the document claims. There is no second audit mechanism.
- **Vale excludes `reports/` and `.docs-assist/`.** A packet is deliberately cold prose written by an agent for an agent. Linting it against a human prose style is a category error. Published prose and instruction files are still linted.
- **`claims.json` is gitignored**, and separately, the plugin's whole working tree is excluded from claim evidence *by rule*. Those are two different fixes and both are needed.
- **The tag is inert.** No workflow fires on tags; `ci.yml` runs on push to main and on pull requests only. Cutting the release stays a deliberate step.

### Bugs found by using the thing rather than reading it

- `check-claims.mjs` confirmed claims against its own cached output. Findings went 20 to 0 between two runs with nothing fixed. **A check that silently stops finding things looks exactly like a check with nothing to find.**
- A bulk rename produced "the the drafting subagent (retired) subagent" three times in `docs/plan.md`. Vale's repetition rule caught it; I never read what my own replace produced.
- The first `example-continuity.mjs` guessed roles from syntax and returned four findings on its first real corpus, essentially all false. Rewritten to check only what a project declares.
- A proposed language-tag check fired on a deliberate accommodation (`sshd_config` highlighted as `java`) and was cut. Same lesson `leverage` and `just` already taught the Vale styles.

### Open questions

1. **Push and open the pull request.** Waiting on an explicit go-ahead. Twenty-one commits and a `v1.0.0` tag landing on the repo is not something to do unasked.
1. **Delete the stale branches.** Twelve carry no unique work and most exist on `origin`. Shared refs, so this needs its own yes.
1. **Harvest consent.** Building the authority persona means reading Edward's issue replies, pull request comments, and commit bodies. Asked twice, never answered. It blocks nothing: the capability ships gated and has not been pointed at anything.
1. **A second dogfooding target.** Everything is still over-fitted to `edwardangert.github.io`, one Astro site documenting one subject.

### What a next session should know

The loop has been run end to end **once**, the run that produced `docs/how-the-loop-works.md`. Cost, convergence, and false-positive rates are unmeasured. Four subagent runs for one 207-line document is the only cost datum that exists.

The chairs are not registered as subagent types in a session that predates them; a plugin reload is needed, and every run so far used an existing type carrying a chair's brief. That is why the authority chair had no `Write` tool on its first run and reported the blocker instead of working around it.

Two failures were mine and are the same failure twice: I trusted recall over checking. The advocate persona claimed `docs/` uses sentence case, contradicting `config.yml` and every file in `docs/`. And I nearly dismissed the continuity chair's best finding because I truncated my own grep with `head -4`. Both were caught by an agent reading the files.
