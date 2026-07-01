# Changelog

All notable changes to this project are documented here.
The format is based on Keep a Changelog, and the project follows Semantic Versioning.

## 0.7.0 - 2026-07-01

### Added

- An intake-led workflow, in a new `reference/intake.md`.
  Documenting something new now leads with a knowledge dump ("tell me everything you know") instead of narrow questions, then reflects it back, situates it against the existing docs and the product, digs at the gaps, and only then shapes the doc.
  It works like a technical writer at the contributor's side, gathering before structuring.
- From-scratch corpus support: a `doc-intake` subagent reads a pile of raw material (tickets, a PRD, notes, old docs) in an isolated context and returns a compact content inventory (clusters, gaps, duplication, staleness), which feeds the planning workflow.
  The raw pile never bloats the main conversation, and the synthesized inventory is persisted outside the published docs tree.
- A code-verification step and an outline checkpoint in the draft flow: before writing, the plugin confirms the specifics the doc will state (commands, flags, defaults, errors) against the code, then proposes an outline for confirmation on anything beyond a short entry.
- Consistent code examples, in a new `reference/code-examples.md`. Before writing a sample the plugin reuses variable names from related docs, anchored to a plugin-maintained `.docs-assist/example-variables.txt` registry so placeholder values stay the same across the docs. `/docs-assist:init` can seed it from existing docs.
- A ship-first path for "document this whole repo, where do I start?": `/docs-assist:plan` now orients before it quizzes (reads the project back and recommends a single first doc to draft now), stages the plan into ship-now, next-iteration, and later, and plans the next iteration from what readers hit. A new `doc-recon` subagent reads a large codebase in isolation and returns a compact project map, so orientation does not flood the main conversation.

### Changed

- Rebuilt `/docs-assist:draft` around the intake loop (survey, dump, reflect, situate, dig, shape, draft), and added a leading corpus-inventory step to `/docs-assist:plan`.
- Reframed the skill's guiding principles around gathering first, reflecting, situating, and recognizing when one request is really several docs.

## 0.6.0 - 2026-07-01

### Added

- Documentation templates from The Good Docs Project, via a new `/docs-assist:template` command and `reference/templates.md`.
  The plugin suggests a template from what the contributor is trying to write, then fetches the skeleton live so a support lead, engineer, or PM starts from a proven structure instead of a blank page.
  Templates supplement the existing content types rather than replacing them: `content-type` stays canonical and a new optional `template` frontmatter field records the origin.
  Suggesting a template is free and offline, so the assistant offers one whenever it fits; it fetches a body only when the contributor accepts, so nothing is pulled without a yes.
  `.docs-assist/templates.yml` records auto-use and the selection model (content-type or seven-action). On a fetch failure the assistant prompts to retry, use the built-in structure, or cancel.
  The Good Docs templates are MIT-0; `THIRD-PARTY-NOTICES.md` records the acknowledgement.
- Template suggestions offered during `/docs-assist:draft` and `/docs-assist:plan`, and `/docs-assist:init` now offers to enable templates as part of setup.

### Changed

- Framed the skill as a single conversational assistant: contributors describe what they want and the right workflow runs, with the `/docs-assist:*` commands as optional shortcuts rather than a required interface. Setup (config, templates, linting) is offered inline.

### Fixed

- `frontmatter-spec.md` pointed `content-type` at `documentation-patterns.md`; it now points at the canonical `content-types.md`.
- Refreshed the reader tutorials in `docs/` to match the current workflow (the intake dump, templates, and the ship-first plan). This repo now dogfoods its own tool: it commits a `.docs-assist/` config, and the README leads with a real session.

## 0.5.0 - 2026-07-01

This release reorganizes the plugin around a single source of truth.
It adds a project-local config system, optional linting, an update-on-change workflow, change-based review scoping, subagents, and opt-in hooks.

### Added

- Project-local configuration in `.docs-assist/`: `config.yml` (machine-readable, shared with the linters) and `style.md` (prose conventions).
  The new `/docs-assist:init` command scaffolds it from the repo's existing conventions.
- Optional linting via `/docs-assist:setup-lint`: a Vale custom style that encodes the prose rules (including no em dashes), plus markdownlint, MegaLinter, cspell, and link-check scaffolds, generated from `config.yml`, with existing-linter detection.
  Nothing is bundled or forced.
- Update-on-change via `/docs-assist:update`: finds and updates the docs affected by a diff, a PR, or changed files.
- Change-based scoping for `/docs-assist:audit` and `/docs-assist:update`, in a new `reference/impact-analysis.md`.
  It separates edit scope (the files that changed) from impact scope (the docs those changes can break), maps each change type to the edges it implicates (anchor links, terminology and casing, repeated values, prerequisites), and follows them with a traversal budget instead of trusting the file count.
- Subagents `doc-auditor` and `doc-updater`, used to fan out large audits and updates in parallel.
- Opt-in hooks via `/docs-assist:setup-hooks`: a git pre-commit doc linter and an in-session lint hook.
  Default off.
- Self-CI: `scripts/validate.mjs` validates the manifests, references, and frontmatter, and `.github/workflows/ci.yml` dogfoods the shipped linters against the plugin's own docs.

### Changed

- Renamed the plugin from `documentation-agent` to `docs-assist`.
  Commands are now `/docs-assist:draft`, `/docs-assist:plan`, `/docs-assist:audit`, and `/docs-assist:make-examples`.
  Update any saved references or aliases.
- Renamed the skill directory to `skills/docs-assist/` and moved the methodology files into `skills/docs-assist/reference/`.
- Single-sourced the content-type definitions into `reference/content-types.md`.
  The skill and the commands now point to it instead of redefining the types.
- Rewrote `SKILL.md` as a lean router that loads reference files on demand.
- Restructured the audit, IA, and style-guide references to lead with agent-actionable steps and mark human-only research as reference.
- Removed product-specific examples from the references.
- `/docs-assist:audit` now matches its depth to the target: it scales the inventory step, adds a change-based path that audits a diff and its blast radius, reports residual risk, and reports clean sections without manufacturing findings.
- `/docs-assist:update` now traces the ripple of its own doc edits, beyond the code-to-docs edge it already followed.
- `/docs-assist:audit` and `/docs-assist:update` now account for `llms.txt`: the audit flags an `llms.txt` that has drifted from the docs, and the update brings it back in sync.

### Removed

- `docs/code-review.md`: an internal one-time review artifact whose findings were all applied.

## 0.2.0

### Changed

- Reoriented the plugin from a standards enforcer to a subject matter expert coach.

## 0.1.0

- Initial release: documentation skill plus `draft`, `plan`, `audit`, and `make-examples` commands.
