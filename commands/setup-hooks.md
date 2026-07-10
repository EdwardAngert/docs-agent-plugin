---
description: Install opt-in documentation hooks (git pre-commit lint, in-session doc lint, CI docs-impact check). Default off, nothing is installed without your choice
argument-hint: [pre-commit | claude-code | ci | all]
---

# Set Up Documentation Hooks

Install hooks that keep documentation in shape automatically. Hooks are opt-in: this command installs only what you choose, and it never turns anything on by itself. The optional argument (`$ARGUMENTS`) names a hook to skip the selection question.

## Available Hooks

- **Git pre-commit hook** (`${CLAUDE_PLUGIN_ROOT}/assets/hooks/pre-commit`): lints staged Markdown with the repo's configured linter and reminds you to run `/docs-assist:update` when you commit source changes without touching docs. Fails the commit only on lint errors. The reminder never blocks.
- **Claude Code post-edit lint** (`${CLAUDE_PLUGIN_ROOT}/assets/hooks/claude-code-hooks.json`): a `PostToolUse` hook that lints a Markdown file right after Claude writes or edits it, so style issues surface in the session. Requires `jq` and `npx`.
- **CI docs-impact check** (`${CLAUDE_PLUGIN_ROOT}/assets/ci/docs-impact.mjs` and `${CLAUDE_PLUGIN_ROOT}/assets/ci/github/docs-impact.yml`): a deterministic detector that runs on every pull request and reports when a diff rides the change types that ripple into docs: moved or renamed docs, changed headings, changed code terms the docs mention, or a large source change with no docs touched. It costs no agent tokens; it tells reviewers when `/docs-assist:update` is worth running, and can be made blocking with `DOCS_IMPACT_STRICT`.

## Process

### 1. Detect Existing Hooks

Look before you install:

- `.git/hooks/pre-commit` and whether a manager owns it (Husky in `.husky/`, or `.pre-commit-config.yaml`).
- Existing `hooks` entries in `.claude/settings.json`.

If a hook manager is present, integrate with it rather than overwriting `.git/hooks/pre-commit` directly. For Husky, add the doc-lint step to the existing pre-commit script. For the pre-commit framework, add a local hook entry.

### 2. Confirm What to Install

If `$ARGUMENTS` did not specify, ask which hooks the user wants. Default to installing nothing until they choose. Explain that hooks can be removed at any time and that the pre-commit hook is bypassable with `git commit --no-verify`.

### 3. Install the Git Pre-Commit Hook

When chosen:

- If no hook manager: copy `${CLAUDE_PLUGIN_ROOT}/assets/hooks/pre-commit` to `.git/hooks/pre-commit` and make it executable (`chmod +x`).
- If Husky or pre-commit is present: add the lint and reminder steps to the existing configuration instead. Show the change and confirm.
- If `.git/hooks/pre-commit` already exists, show a diff and confirm before changing it. Never silently overwrite.

### 4. Install the Claude Code Hook

When chosen:

- Merge the `hooks` block from `${CLAUDE_PLUGIN_ROOT}/assets/hooks/claude-code-hooks.json` into `.claude/settings.json` (create the file if absent).
- If a `PostToolUse` hook already exists, merge into the array rather than replacing it. Show the merged result and confirm.
- Tell the user it requires `jq` and that the linter runs via `npx`.

### 5. Install the CI Docs-Impact Check

When chosen:

- Copy `${CLAUDE_PLUGIN_ROOT}/assets/ci/docs-impact.mjs` to `scripts/docs-impact.mjs` and `${CLAUDE_PLUGIN_ROOT}/assets/ci/github/docs-impact.yml` to `.github/workflows/docs-impact.yml`.
- If either destination exists, show a diff and confirm. Never silently overwrite.
- Explain the tuning knobs: `DOCS_IMPACT_LINE_THRESHOLD` (source lines that count as a large silent change, default 100), `DOCS_IMPACT_STRICT` (fail the check instead of reporting), and `DOCS_DIR` (defaults to `docs_dir` from `.docs-assist/config.yml`).
- Tell the user the check reports; it does not run `/docs-assist:update` itself. The report names the range to pass when they do.

### 6. Confirm and Explain

After installing, tell the user:

- What each hook does and when it fires.
- How to remove it (delete the hook file, or remove the `hooks` entry from settings).
- That the hooks use the configs from `/docs-assist:setup-lint`, so run that first if it has not been run.

## Notes

- Default off. Install only what the user explicitly selects.
- Keep hooks suggestive where possible. The source-without-docs reminder must not block a commit.
- Respect existing hook managers. Do not fight Husky or the pre-commit framework.
- Hooks depend on the linter config. If `/docs-assist:setup-lint` has not run, offer to run it first.
