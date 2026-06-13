# Changelog

All notable changes to this project are documented here.
The format is based on Keep a Changelog, and the project follows Semantic Versioning.

## 1.0.0 - 2026-06-12

The 1.0 release reorganizes the plugin around a single source of truth and adds a project-local config system, optional linting, an update-on-change workflow, subagents, and opt-in hooks.

### Changed

- Renamed the plugin from `documentation-agent` to `docs-assist`. Commands are now `/docs-assist:draft`, `/docs-assist:plan`, `/docs-assist:audit`, and `/docs-assist:make-examples`. Update any saved references or aliases.
- Renamed the skill directory to `skills/docs-assist/` and moved the methodology files into `skills/docs-assist/reference/`.
- Single-sourced the content-type definitions into `reference/content-types.md`. The skill and the commands now point to it instead of redefining the types.
- Rewrote `SKILL.md` as a lean router that loads reference files on demand.
- Restructured the audit, IA, and style-guide references to lead with agent-actionable steps and mark human-only research as reference.
- Removed product-specific examples from the references.

### Added

- Project-local configuration in `.docs-assist/`: `config.yml` (machine-readable, shared with the linters) and `style.md` (prose conventions). The new `/docs-assist:init` command scaffolds it from the repo's existing conventions.
- Optional linting via `/docs-assist:setup-lint`: a Vale custom style that encodes the prose rules (including no em dashes), plus markdownlint, MegaLinter, cspell, and link-check scaffolds, generated from `config.yml`, with existing-linter detection. Nothing is bundled or forced.
- Update-on-change via `/docs-assist:update`: finds and updates the docs affected by a diff, a PR, or changed files.
- Subagents `doc-auditor` and `doc-updater`, used to fan out large audits and updates in parallel.
- Opt-in hooks via `/docs-assist:setup-hooks`: a git pre-commit doc linter and an in-session lint hook. Default off.
- Self-CI: `scripts/validate.mjs` validates the manifests, references, and frontmatter, and `.github/workflows/ci.yml` dogfoods the shipped linters against the plugin's own docs.

### Removed

- `docs/code-review.md`: an internal one-time review artifact whose findings were all applied.

## 0.2.0

### Changed

- Reoriented the plugin from a standards enforcer to a subject matter expert coach.

## 0.1.0

- Initial release: documentation skill plus `draft`, `plan`, `audit`, and `make-examples` commands.
