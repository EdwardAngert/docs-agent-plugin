---
description: Turn a release's worth of changes into reader-facing release notes
argument-hint: [range, tag, or version]
---

# Write Release Notes

Turn the changes in a release into notes a reader can act on: what changed, why it matters, and what they must do about it.

The argument (`$ARGUMENTS`) can be a git range (`v0.8.0..HEAD`), a tag, or the version being released. If omitted, use the range from the last tag to `HEAD`, and confirm it before writing.

Release notes are a reference content type (see `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/content-types.md`), but they are written for readers deciding whether and how to upgrade, not for maintainers reading history. Commit messages are the input, never the output.

## Process

### 1. Resolve the Range and the Convention

- Resolve `$ARGUMENTS` to a concrete range and confirm it.
- Find where this project publishes release notes: a `CHANGELOG.md` (note its format, such as Keep a Changelog or a summary-first layout), a `docs/releases/` directory, or GitHub releases (`gh release list`). Match the existing convention.
- Starting fresh with no convention? Offer the `release-notes` template from the catalog (see `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/templates.md`), or default to a summary-first entry: a short plain-language summary of what changed and why, with itemized changes below it.

### 2. Read the Changes

Gather what actually shipped: `git log` for the range, merged PR titles and bodies (`gh pr list --state merged`) when the repo uses them, and the diff for anything ambiguous.

Extract only what a reader can observe:

- New features and capabilities.
- Behavior changes, and especially **breaking changes and deprecations**.
- Fixes a user would have hit.
- Upgrade steps: migrations, config changes, new requirements.

Drop internal churn (refactors, CI, test-only changes) unless it changes something observable, like performance.

### 3. Ask for the Why

The diff says what changed; the contributor knows why it matters. One short dig, not a form: what should users notice first, what prompted the headline changes, and is there anything readers must do before or after upgrading? Fold their answer into the summary.

### 4. Write Reader-Facing Notes

- Lead with the story of the release in plain language, then the itemized changes.
- Breaking changes come first and include the migration step, never a bare "X was removed."
- Describe outcomes, not implementation: "audits now catch terminology drift," not "added terms.txt parsing."
- Link each feature to its documentation. A release note is often the reader's entry point into the docs.
- Apply the standards from `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/tone-and-voice.md` and the project's `.docs-assist/` config as usual.

### 5. Finalize

- Before placing the notes, run the second-opinion pass on them, per `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/second-opinion.md`. Release notes are the content most prone to the AI voice and inflation this workflow already warns against, so the fresh read earns its keep here; skip it only for a release small enough that the notes are a few lines. Fold judgment findings into the finalize checks below.
- Place the notes per the project's convention (prepend the changelog entry, add the release file, or output the GitHub release body).
- Flag shipped features that have no documentation yet, and offer `/docs-assist:draft` for each.
- The branch delivery rule applies: in a git repo, offer to land the notes on a branch rather than the default branch.

## Notes

- Be conservative about claims. If you cannot tell from the diff whether a change is breaking, ask rather than guessing either way.
- Do not inflate. A release with three small fixes deserves three lines, not a narrative.
- Versioning is the maintainer's call. Suggest a semver bump from what you found, but let them decide.
