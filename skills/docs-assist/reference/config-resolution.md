# Project Configuration Resolution

Docs Assist ships sensible defaults, but every team writes a little differently.
A project can commit its own configuration so the plugin matches the house style without anyone editing the plugin's own files.
This config also feeds the linters, so the agent and the deterministic checks never drift apart.

## Where Config Lives

A configured project has a `.docs-assist/` directory at its root:

- `.docs-assist/config.yml`: machine-readable settings (heading case, list markers, frontmatter field names, lint tool). Shared with the linters.
- `.docs-assist/style.md`: prose conventions (voice, terminology, banned phrases) that need human judgment.
- `.docs-assist/templates.yml`: optional. Opt-in settings for external documentation templates (enable flag, selection model, source, attribution). Absent means the feature is off. See `templates.md`.

`/docs-assist:init` scaffolds `config.yml` and `style.md`, pre-filled from the repo's existing conventions. `/docs-assist:template` scaffolds `templates.yml` when a project opts into templates.

## Resolution Order

At the start of any workflow (draft, plan, audit, make-examples, update), resolve settings in this order. Later sources win:

1. **Plugin defaults**: the rules in `tone-and-voice.md`, `content-types.md`, and `frontmatter-spec.md`.
1. **Inferred repo conventions**: what the existing docs actually do (heading case, list markers, frontmatter field names). Detected during the survey step.
1. **Project config**: `.docs-assist/config.yml` and `.docs-assist/style.md` when present. These are explicit and authoritative.

If `.docs-assist/` is absent, run on defaults plus inferred conventions, and offer to scaffold config with `/docs-assist:init` when it would help (for example, before a team adopts the plugin).

## How Settings Map to Behavior

When `config.yml` is present, apply it directly:

- `heading_case`, `title_case_style`, `action_oriented_headings`: how you format every heading.
- `list_marker`, `ordered_list_style`: list formatting.
- `one_sentence_per_line`, `no_em_dashes`: line and punctuation rules.
- `frontmatter.*`: the field names to write and the allowed `content-type` values. Honor the repo's names over the plugin's defaults.
- `docs_dir`: where to look and where new docs go.
- `lint.*`: which linter the project uses, so you can recommend running it and avoid re-flagging what the linter already covers.

`style.md` is prose: read it and follow it the way you would a team style guide. When it conflicts with a plugin default, `style.md` wins.

## Shared Source of Truth With Linters

`config.yml` is also what `/docs-assist:setup-lint` reads to generate Vale and markdownlint configuration.
That means a change to `heading_case` or `no_em_dashes` updates both how you write and how the linter checks.
When you edit config for a project, note that the linter config may need regenerating, and point the user to `/docs-assist:setup-lint`.
