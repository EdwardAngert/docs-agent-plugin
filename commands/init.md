---
description: Scaffold project-local Docs Assist configuration, pre-filled from the repo's existing conventions
argument-hint: [docs directory]
---

# Initialize Project Configuration

Set up a committed `.docs-assist/` configuration for this project so Docs Assist matches the team's house style, and so the linters share the same settings.

The optional argument (`$ARGUMENTS`) is the docs directory to use. Detect it if not given.

## Process

### 1. Detect Existing Conventions

Do not ask the user what they could observe yourself. Survey the repo first:

- Find the docs directory (`docs/`, `documentation/`, `content/`, or the path in `$ARGUMENTS`). Check static-site config (`docusaurus.config.js`, `mkdocs.yml`, `astro.config.*`, `_config.yml`) if present.
- Read frontmatter from several existing docs to learn the field names in use (`tags` vs `keywords`, `type` vs `content-type`) and any required SSG fields.
- Sample headings to infer heading case (title vs sentence) and whether they are action-oriented.
- Check list markers (`-`, `*`, `+`) and whether docs use one sentence per line.
- Look for an existing linter (`.vale.ini`, `.markdownlint*`, `.mega-linter.yml`, `cspell.json`) and record which tool, if any.

### 2. Propose the Config

Show the user the `config.yml` you intend to write, pre-filled from what you detected, and explain the values you inferred. Use the template at `${CLAUDE_PLUGIN_ROOT}/assets/config/config.yml` as the base and adjust:

- Set `docs_dir`, `heading_case`, `list_marker`, and the `frontmatter` field names to match the repo.
- Set `lint.tool` to any linter you found, otherwise leave it `none`.

Confirm before writing. If a value is ambiguous, ask a focused question rather than guessing.

### 3. Write the Config

When the user approves:

- Write `.docs-assist/config.yml` with the agreed values.
- Write `.docs-assist/style.md` from `${CLAUDE_PLUGIN_ROOT}/assets/config/style.md`, pre-filling the voice and terminology sections with anything you can infer from existing docs (leave clear placeholders for what you cannot).
- Never overwrite an existing `.docs-assist/` file without showing the diff and confirming.

### 4. Point to Next Steps

After writing, tell the user:

- How the config changes the plugin's behavior (it now follows these settings; see `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/config-resolution.md`).
- That `/docs-assist:setup-lint` will generate linter config from `config.yml`.
- To commit `.docs-assist/` so the whole team shares the same conventions.

## Notes

- The goal is a config the team can read, edit, and commit. Keep it minimal and accurate, not exhaustive.
- Prefer matching the repo's real conventions over imposing the plugin defaults. The defaults are a fallback, not a target.
- `config.yml` holds machine-checkable settings. `style.md` holds judgment-based guidance. Do not put prose rules in `config.yml`.
