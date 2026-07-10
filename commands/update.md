---
description: Find and update the docs affected by a code change (a diff, a PR, or changed files)
argument-hint: [git ref, PR number, or path]
---

# Update Docs for a Change

Keep documentation in sync with the code. Given a change, find the docs it affects and update them. This is the workflow that most benefits from running inside Claude Code, where the diff and the docs are both at hand.

The argument (`$ARGUMENTS`) can be a git ref or range (`HEAD~3`, `main..feature`), a PR number, or a path. If omitted, use the working-tree and staged changes against the base branch.

## Process

### 1. Resolve the Config

Read `.docs-assist/config.yml` and `.docs-assist/style.md` if present, so updates match the project's conventions. See `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/config-resolution.md`.

### 2. Get the Change Set

Resolve `$ARGUMENTS` to a concrete diff:

- A ref or range: `git diff <range>`.
- A PR number: `gh pr diff <number>` (or check out the PR).
- A path: `git diff -- <path>`, or read the file if it is uncommitted.
- Nothing: `git diff` plus `git diff --staged` against the base branch.

### 3. Summarize What Changed

From the diff, extract the things docs describe:

- New, renamed, or removed public APIs, endpoints, CLI commands, and flags.
- Changed configuration keys, environment variables, and defaults.
- Changed behavior, prerequisites, or required versions.
- New features that need first-time documentation.

Write a short change summary. This is what drives the doc search and the updates.

### 4. Find Affected Docs

Locate the docs that reference what changed:

- Start from `llms.txt` and frontmatter (`keywords`, `related`) to map the docs set.
- Grep the docs directory for the changed symbols, flags, and key names.
- Rank by how directly each doc depends on the change.

Separate confident matches (a doc documents a flag you renamed) from weak matches (a doc mentions a term in passing). Do not touch the weak matches without reason.

### 5. Update the Docs

Before editing, check the branch. If the working tree is on the default branch and the update will touch more than a file or two, offer to do the pass on a docs branch so the result arrives as a reviewable change set. Never commit to the default branch unless asked. The contributor's existing workflow (they may already be on a feature branch) wins.

For a small number of affected docs, edit them directly, applying the standard drafting rules.

For a larger set, fan out: launch the `doc-updater` subagent once per affected doc, in parallel, each with the change summary and one doc path. Each subagent edits its doc in the working tree and reports what it changed. This keeps large updates fast and consistent.

For every update:

- Change only what the diff requires. Preserve the doc's structure and voice.
- Update example commands, flags, config snippets, and version references.
- Bump `last-verified` in frontmatter when you confirm the doc against the new behavior.
- Where a change alters meaning and you cannot confirm intent from the diff, flag it for subject matter expert review instead of guessing.

### 6. Review and Finalize

- Show the user the result as a diff (`git diff` on the docs) so they review the substance, not the formatting.
- Trace the ripple of your own edits. If you renamed a heading, moved a file, re-cased a term, or changed a value that other docs repeat, follow the edges in `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/impact-analysis.md` and fix or flag what they reach.
- Check for an `llms.txt`. If the repo has one and your edits added, removed, renamed, or re-described a doc it lists, update its entries so the map matches the docs. Update cross-references the same way.
- List remaining follow-ups: docs that need an SME to confirm, screenshots that went stale, edges you did not follow, or new docs the change calls for that do not exist yet.

## Notes

- Be conservative. A docs update that invents behavior is worse than one that flags uncertainty.
- A passing mention of a term is not a reason to edit a doc. Tie every edit to something in the diff.
- If the change needs a brand-new doc rather than an edit, say so and offer `/docs-assist:draft`.
