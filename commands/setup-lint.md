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

- `heading_case`, `list_marker`, `ordered_list_style`, `no_em_dashes`, `no_ai_voice`, and the `frontmatter` fields all map to specific rules.
- If `.docs-assist/config.yml` does not exist, offer to run `/docs-assist:init` first. You can proceed with the defaults, but tell the user the linter will encode defaults, not their conventions.

Also read `.docs-assist/reference.yml` if it exists. Its `term` entries (canonical value plus variants) become a generated Vale rule in step 4; the other entry kinds (`example-variable`, `fact`, `pointer`) have no linter equivalent and stay agent-checked.

### 2. Detect Existing Linters First

Never clobber what is already there. Look for:

- `.vale.ini` and a `styles/` directory.
- `.markdownlint.jsonc`, `.markdownlint.json`, `.markdownlint.yaml`, or `.markdownlint-cli2.*`.
- `.mega-linter.yml`.
- `cspell.json` or `cspell.config.*`.
- `.markdown-link-check.json`.
- Lint scripts in `package.json`, a `.pre-commit-config.yaml`, and existing workflows in `.github/workflows/`.

Report what you found. If a linter already exists, extend it (add the DocsAssist Vale style, merge missing markdownlint rules) rather than replacing it. If an existing `.vale.ini` already declares its own `Packages`, merge `Google`, `write-good`, and `alex` into that list rather than overwriting it; a project may already be using other packages this plugin doesn't know about. Show a diff and confirm before changing an existing config.

### 3. Choose the Approach

If `$ARGUMENTS` did not specify, ask two short questions:

- **Individual tools or aggregator?** Individual tools (Vale for prose, markdownlint for structure, cspell for spelling, markdown-link-check for links) give fine control. MegaLinter runs them as one tool, which some teams prefer for CI.
- **Add a CI workflow?** Offer the GitHub Actions workflow that runs the checks on pull requests.

### 4. Generate the Config From `config.yml`

Copy the templates from `${CLAUDE_PLUGIN_ROOT}/assets/lint/` and adjust them to the resolved config. Do not ship rules the config turns off:

- **Vale** (`${CLAUDE_PLUGIN_ROOT}/assets/lint/vale/`): copy `.vale.ini` and `styles/DocsAssist/` to the repo root, then run `vale sync` to download the `Google`, `write-good`, and `alex` packages the config declares. General prose quality (weasel words, passive voice, wordiness, clichés, inclusive language, punctuation and heading conventions) is a managed problem now, not something this plugin keeps its own copy of; `DocsAssist` stays small on purpose, covering only AI voice and this plugin's own opinionated defaults. Adjust the copied `.vale.ini` to the resolved config:
  - If `heading_case` is `title` instead of the default `sentence`, flip `Google.Headings` from `YES` to `NO`: Google's own rule assumes sentence case and would fight a project that has chosen title case on purpose.
  - If `no_em_dashes` is false, leave `Google.EmDash` at its default (`NO` in the template only because `DocsAssist.EmDash` already bans em dashes outright); when there's no house ban, Google's formatting-only check is worth keeping, so flip it to `YES`.
  - Drop `HeadingGerund.yml` if the project does not use action-oriented headings.
  - Drop `MarketingLanguage.yml`, `FillerPhrase.yml`, and `FalseContrast.yml` if `no_ai_voice` is false.
  - `vale sync` needs network access; if it isn't available in the current environment, still write the config and tell the user to run `vale sync` themselves before the first lint.
- **Terminology, generated, not copied**: if `.docs-assist/reference.yml` has `term` entries, generate `styles/DocsAssist/Terminology.yml` yourself, a Vale `substitution` rule with one `swap` line per variant pointing at its canonical term:

  ```yaml
  extends: substitution
  message: "Use '%s' instead of '%s'."
  level: warning
  ignorecase: true
  swap:
    DocsAssist: Docs Assist
    docs assist: Docs Assist
    sub-agent: subagent
  ```

  This file has no static template in `assets/lint/`, since its content is entirely project-specific. Regenerate it whenever `reference.yml`'s `term` entries change, the same way markdownlint's config regenerates when `config.yml` changes.
- **markdownlint** (`${CLAUDE_PLUGIN_ROOT}/assets/lint/markdownlint/.markdownlint.jsonc`): set `MD004` from `list_marker`. Set `MD029` to `"one"` only when `ordered_list_style` is `repeated-one` *and* `init` actually verified the corpus uses it consistently (not just the plugin default); otherwise leave the template's `"one_or_ordered"`, which accepts either style as long as a single list is internally consistent. If `heading_case` is sentence, leave heading case to Vale and the agent (markdownlint does not check case).
- **markdownlint scope, generated, not copied**: also write a `.markdownlint-cli2.jsonc` at the repo root, extending the config above, with the same globs the CI workflow uses (`**/*.md`, excluding `node_modules`). Without this, a bare `npx markdownlint-cli2` with no arguments falls back to markdownlint's stock defaults (`MD013` line-length included, which this config likely turns off) and scans whatever the invoker happens to type, not what the project actually lints or what CI checks. This file makes the correct scope the default, and CI can then call the bare command instead of hardcoding the glob a second place it could drift from:

  ```jsonc
  {
    "config": { "extends": ".markdownlint.jsonc" },
    "globs": ["**/*.md", "!**/node_modules/**"]
  }
  ```

  If the project's own convention excludes some markdown from linting (generated files, vendored docs, agent/instruction files that aren't published documentation), adjust the globs to match; don't assume every project wants the same scope this plugin uses on itself.
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

For Vale, do not recommend `npx --yes @vvago/vale` or `npx --yes --package=@vvago/vale -- vale`: both are known to fail with `vale: command not found` (exit 127) even when the binary downloads correctly, an `npx` bin-resolution problem with that package's `bin` field, not a broken install, and it costs real time to rediscover per session. Instead:

- If Vale is already on `PATH` (a global install, or a devcontainer/CI image that provides it), just use `vale`.
- Otherwise, fetch the binary directly instead of going through `npx`: `gh release download --repo vale-cli/vale --pattern '*<platform>.tar.gz' --output vale.tar.gz --clobber && tar -xzf vale.tar.gz vale` (match the pattern to the user's OS, for example `*macOS_arm64.tar.gz` or `*Linux_64-bit.tar.gz`; `gh api repos/vale-cli/vale/releases/latest --jq '.assets[].name'` lists exact names if unsure), then run `./vale sync` and `./vale` from that path. This is the same mechanism the shipped CI template uses (`assets/ci/github/docs-lint.yml`) and is confirmed to resolve cleanly where the npm wrapper doesn't.

Either way, tell the user to run `vale sync` once before the first lint: Vale never fetches the `Google`, `write-good`, and `alex` packages on its own, and a lint run without syncing first will error that the styles are missing, not silently skip them. Note that re-running `/docs-assist:setup-lint` after editing `config.yml` or adding a `term` entry to `reference.yml` regenerates the linter config.

### 7. Run It Now and Triage the First Pass

Scaffolding and stopping leaves the first-run gap for the user to hit alone. Before finishing, actually run every tool just configured against the target scope (not just print the commands) and walk the findings to zero, or to an explicit, justified remainder:

- **A real defect** (a genuine heading skip, missing blank line, untagged fence, weasel word, broken link): fix it.
- **A false positive against a documented convention**: adjust the generated config to match (the same kind of override already documented in the shipped `.vale.ini`, for example `Google.Headings` versus `heading_case`) and note why in a comment, so the next run doesn't re-flag it.
- **A rule with no corresponding project convention at all** (fires on real, harmless content, like a table-alignment or fence-style rule with no house opinion either way): disable it explicitly with a one-line comment explaining the call, rather than leaving the user to re-triage the same noise on every future run.

Report the before/after count (`607 issues → 0`, or `607 → 12, listed below with why each stays`). A fresh `setup-lint` run should end at a clean baseline the user can trust, not a config they still have to test-drive themselves.

## Notes

- Detect before you generate. An existing linter is a signal of the team's preference; work with it.
- Scope every linter to documentation (`*.md`, `*.mdx`, the `docs_dir` from config), not source code.
- Prefer `npx` invocations for markdownlint, cspell, and markdown-link-check; for Vale, prefer a direct binary (already on `PATH`, or fetched via `gh release download`) over the `npx` wrapper packages, and the official `errata-ai/vale-action` in CI, so the repo needs no global installs.
- The configs are generated from `config.yml`, and the terminology rule from `reference.yml`'s `term` entries. When either changes, the linter config should be regenerated so they never drift.
- Scaffolding is not done until step 7's first real run is clean or its remainder is explained. Don't stop at "here are the commands to run."
