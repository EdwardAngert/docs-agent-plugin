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
- Set `lint.tools` to the linters you found (a list; a project can run several), otherwise leave it empty.

Confirm before writing. If a value is ambiguous, ask a focused question rather than guessing.

### 3. Write the Config

When the user approves:

- Write `.docs-assist/config.yml` with the agreed values.
- Write `.docs-assist/style.md` from `${CLAUDE_PLUGIN_ROOT}/assets/config/style.md`, pre-filling the voice and terminology sections with anything you can infer from existing docs (leave clear placeholders for what you cannot).
- Never overwrite an existing `.docs-assist/` file without showing the diff and confirming.

### 4. Offer Templates and Linting

Set the team up in one pass instead of leaving them to find commands:

- Offer to turn on documentation templates: a proven starting structure from The Good Docs Project, suggested during drafting. If they want it, scaffold `.docs-assist/templates.yml` from `${CLAUDE_PLUGIN_ROOT}/assets/config/templates.yml` with `enabled: true`. See `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/templates.md`. If they decline, do nothing: the assistant still offers a template when one fits and fetches only on their yes.
- Offer to generate matching linters from `config.yml` (the same workflow as `/docs-assist:setup-lint`).
- Offer to seed `.docs-assist/example-variables.txt` from `${CLAUDE_PLUGIN_ROOT}/assets/config/example-variables.txt`, pre-filled with any placeholder values already used across the docs, so code samples stay consistent. The plugin maintains it from then on. See `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/code-examples.md`.

### 5. Point to Next Steps

After writing, tell the user:

- How the config changes the plugin's behavior (it now follows these settings; see `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/config-resolution.md`).
- To commit `.docs-assist/` so the whole team shares the same conventions.

## Notes

- The goal is a config the team can read, edit, and commit. Keep it minimal and accurate, not exhaustive.
- Prefer matching the repo's real conventions over imposing the plugin defaults. The defaults are a fallback, not a target.
- `config.yml` holds machine-checkable settings. `style.md` holds judgment-based guidance. Do not put prose rules in `config.yml`.
