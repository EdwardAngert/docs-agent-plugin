---
description: Scaffold optional documentation linting (Vale, markdownlint, MegaLinter, cspell, link check) generated from the project's config
argument-hint: [tool: vale | markdownlint | megalinter | all]
---

# Set Up Documentation Linting

Add deterministic documentation linting to this repo. The linters encode the same rules the plugin writes by, so the agent and the checks stay in sync.

Linting is optional and is never bundled. This command only scaffolds it when asked, respects any linter the repo already has, and prefers `npx` so nothing needs a global install. The optional argument (`$ARGUMENTS`) names a tool to skip the selection question.

## Process

### 1. Resolve the Project Config

Read `.docs-assist/config.yml`. The linter config is generated from it, so the checks match how the plugin writes:

- `heading_case`, `list_marker`, `ordered_list_style`, `no_em_dashes`, and the `frontmatter` fields all map to specific rules.
- If `.docs-assist/config.yml` does not exist, offer to run `/docs-assist:init` first. You can proceed with the defaults, but tell the user the linter will encode defaults, not their conventions.

### 2. Detect Existing Linters First

Never clobber what is already there. Look for:

- `.vale.ini` and a `styles/` directory.
- `.markdownlint.jsonc`, `.markdownlint.json`, `.markdownlint.yaml`, or `.markdownlint-cli2.*`.
- `.mega-linter.yml`.
- `cspell.json` or `cspell.config.*`.
- `.markdown-link-check.json`.
- Lint scripts in `package.json`, a `.pre-commit-config.yaml`, and existing workflows in `.github/workflows/`.

Report what you found. If a linter already exists, extend it (add the DocsAssist Vale style, merge missing markdownlint rules) rather than replacing it. Show a diff and confirm before changing an existing config.

### 3. Choose the Approach

If `$ARGUMENTS` did not specify, ask two short questions:

- **Individual tools or aggregator?** Individual tools (Vale for prose, markdownlint for structure, cspell for spelling, markdown-link-check for links) give fine control. MegaLinter runs them as one tool, which some teams prefer for CI.
- **Add a CI workflow?** Offer the GitHub Actions workflow that runs the checks on pull requests.

### 4. Generate the Config From `config.yml`

Copy the templates from `${CLAUDE_PLUGIN_ROOT}/assets/lint/` and adjust them to the resolved config. Do not ship rules the config turns off:

- **Vale** (`${CLAUDE_PLUGIN_ROOT}/assets/lint/vale/`): copy `.vale.ini` and `styles/DocsAssist/` to the repo root. Drop `EmDash.yml` if `no_em_dashes` is false. Drop `HeadingGerund.yml` if the project does not use action-oriented headings.
- **markdownlint** (`${CLAUDE_PLUGIN_ROOT}/assets/lint/markdownlint/.markdownlint.jsonc`): set `MD004` from `list_marker`, `MD029` from `ordered_list_style`. If `heading_case` is sentence, leave heading case to Vale and the agent (markdownlint does not check case).
- **cspell** (`${CLAUDE_PLUGIN_ROOT}/assets/lint/cspell/cspell.json`) and **markdown-link-check** (`${CLAUDE_PLUGIN_ROOT}/assets/lint/linkcheck/.markdown-link-check.json`): copy as-is unless the user opts out.
- **MegaLinter** (`${CLAUDE_PLUGIN_ROOT}/assets/lint/megalinter/.mega-linter.yml`): copy when the user chose the aggregator.

Write configs to the repo root unless the repo keeps tool configs elsewhere. Never overwrite an existing file without showing the diff and confirming.

### 5. Wire CI and Record the Choice

- If the user wanted CI, copy `${CLAUDE_PLUGIN_ROOT}/assets/ci/github/docs-lint.yml` to `.github/workflows/docs-lint.yml`, keeping only the steps for the chosen tools.
- Update `.docs-assist/config.yml`: add the chosen linters to `lint.tools` (a list), and set `lint.spelling` / `lint.link_check` to match. This tells the agent which checks the linters now own, so it stops re-flagging them in reviews.

### 6. Show How to Run It

Give the user the `npx` commands for what you installed, for example:

```bash
npx markdownlint-cli2 "docs/**/*.md"
npx cspell "docs/**/*.md"
npx markdown-link-check docs/**/*.md
```

For Vale, point them at the install (Vale is a standalone binary; the CI workflow uses the official action). Note that re-running `/docs-assist:setup-lint` after editing `config.yml` regenerates the linter config.

## Notes

- Detect before you generate. An existing linter is a signal of the team's preference; work with it.
- Scope every linter to documentation (`*.md`, `*.mdx`, the `docs_dir` from config), not source code.
- Prefer `npx` invocations and the official Vale action so the repo needs no global installs.
- The configs are generated from `config.yml`. When the config changes, the linter config should be regenerated so the two never drift.
