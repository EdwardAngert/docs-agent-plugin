---
description: Scaffold project-local Docs Assist configuration, pre-filled from the repo's existing conventions
argument-hint: [docs directory]
---

# Initialize Project Configuration

Set up a committed `.docs-assist/` configuration for this project so Docs Assist matches the project's house style, and so the linters share the same settings.
This earns its keep at every team size: for a team it makes every contributor write to the same conventions, and for a solo maintainer it gives the plugin a consistent line to hold their docs to, like a second reader.

The optional argument (`$ARGUMENTS`) is the docs directory to use. Detect it if not given.

## Process

### 1. Detect Existing Conventions

Do not ask the user what they could observe yourself. Survey the repo first:

- Find the docs directory (`docs/`, `documentation/`, `content/`, or the path in `$ARGUMENTS`). Check static-site config (`docusaurus.config.js`, `mkdocs.yml`, `astro.config.*`, `_config.yml`) if present.
- Read frontmatter from several existing docs to learn the field names in use (`tags` vs `keywords`, `type` vs `content-type`) and any required SSG fields.
- Sample headings to infer heading case (title vs sentence) and whether they are action-oriented.
- Check list markers (`-`, `*`, `+`) and whether docs use one sentence per line.
- Check ordered lists specifically: do they consistently use repeated `1.` or true sequential numbering, or is it mixed across files? Both are legitimate; only propose `ordered_list_style: repeated-one` when the corpus actually uses it consistently. If it's mixed, or the corpus has too few ordered lists to tell, say so and default to the more permissive `sequential`-and-repeated-one-both-allowed reading rather than locking in a style nothing in the repo demonstrated.
- Look for an existing linter (`.vale.ini`, `.markdownlint*`, `.mega-linter.yml`, `cspell.json`) and record which tool, if any.
- Check for `.docs-assist/example-variables.txt` or `.docs-assist/terms.txt`. These predate `.docs-assist/reference.yml` and the plugin no longer reads them; if either exists, plan to offer a one-time migration in step 4 rather than treating the project as having no registry.

### 2. Check Whether Detected Style Is a Real Decision

A survey only tells you what the corpus does, not whether anyone decided it. Heavy em-dash usage, for instance, is exactly the pattern a prior AI-assisted writing session leaves behind without anyone choosing it on purpose. Before folding a detected *stylistic* pattern (em dash usage, list style, prose voice) into the proposed config, ask whether the existing docs were written by a human, with AI assistance, or a mix. If AI-influenced or unknown, treat those patterns as provisional: surface them as "here's what I found, was this a deliberate choice?" rather than proposing them as settled fact. Structural patterns (heading hierarchy, file layout, frontmatter fields) don't need this check; they're conventions a team chose regardless of who typed the words.

### 3. Propose the Config

Show the user the `config.yml` you intend to write, pre-filled from what you detected, and explain the values you inferred. Use the template at `${CLAUDE_PLUGIN_ROOT}/assets/config/config.yml` as the base and adjust:

- Set `docs_dir`, `heading_case`, `list_marker`, and the `frontmatter` field names to match the repo.
- Set `lint.tools` to the linters you found (a list; a project can run several), otherwise leave it empty.

Confirm before writing. If a value is ambiguous, ask a focused question rather than guessing.

### 4. Write the Config

When the user approves:

- Write `.docs-assist/config.yml` with the agreed values.
- Write `.docs-assist/style.md` from `${CLAUDE_PLUGIN_ROOT}/assets/config/style.md`. Voice, the no-em-dash rule, and the banned-phrase list are already the Docs Assist opinionated defaults, not placeholders: keep them unless step 2 turned up a *confirmed* real convention that contradicts them (docs that already lean on em dashes throughout, and the contributor confirmed it was a deliberate choice, not an inherited AI habit). Terminology's product names and preferred terms, and the project-specific Conventions entries, have no sensible default: infer them from existing docs where you can, and leave the `[project-specific: fill in]` markers otherwise.
- Never overwrite an existing `.docs-assist/` file without showing the diff and confirming.

### 5. Offer Templates and Linting

Set the team up in one pass instead of leaving them to find commands:

- Offer to turn on documentation templates: a proven starting structure from The Good Docs Project, suggested during drafting. If they want it, scaffold `.docs-assist/templates.yml` from `${CLAUDE_PLUGIN_ROOT}/assets/config/templates.yml` with `enabled: true`. See `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/templates.md`. If they decline, do nothing: the assistant still offers a template when one fits and fetches only on their yes.
- Offer to generate matching linters from `config.yml` (the same workflow as `/docs-assist:setup-lint`).
- If you found `.docs-assist/example-variables.txt` or `.docs-assist/terms.txt` in step 1, offer the one-time migration first: read both, propose a `.docs-assist/reference.yml` with each `example-variables.txt` line as an `example-variable` entry and each `terms.txt` line as a `term` entry, and offer to delete the old files once the contributor confirms. Never delete them without that confirmation, and never invent entries beyond what the old files stated. See "Migrating" in `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/reference-registry.md`.
- Otherwise, offer to seed `.docs-assist/reference.yml` from `${CLAUDE_PLUGIN_ROOT}/assets/config/reference.yml`, pre-filled with the placeholder values and product terms already used across the docs (and any terminology drift you noticed while surveying, resolved to the dominant usage), so code samples and terms stay consistent. The plugin maintains it from then on. See `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/reference-registry.md`.

### 6. Point to Next Steps

After writing, tell the user:

- How the config changes the plugin's behavior (it now follows these settings; see `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/config-resolution.md`).
- To commit `.docs-assist/` so the whole team shares the same conventions.

If this is one stage in a broader pass (an `audit`, `plan`, or `setup-lint` run is coming next in the same sitting), say so now and offer the running `.docs-assist/session-log.md` for the whole engagement rather than waiting for a later stage to bring it up: see `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/session-log.md`.

## Notes

- The goal is a config the team can read, edit, and commit. Keep it minimal and accurate, not exhaustive.
- Prefer matching the repo's real conventions over imposing the plugin defaults. The defaults are a fallback, not a target.
- `config.yml` holds machine-checkable settings. `style.md` holds judgment-based guidance. Do not put prose rules in `config.yml`.
