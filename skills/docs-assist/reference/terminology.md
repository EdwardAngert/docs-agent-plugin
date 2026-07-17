# Terminology

This is how Docs Assist keeps product terms consistent across a docs set: the same fix `code-examples.md` applies to placeholder values, applied to words.

Terminology drift is the quietest documentation defect.
One doc says "workspace" and the next says "project" for the same thing, a product name appears in three casings, and every inconsistency makes a reader stop and wonder whether two terms mean two things.
A solo writer has no reviewer to catch it; a team catches it late, in review, one instance at a time.
The fix is the same as for example values: a small registry every doc is checked against.

Load this when writing or auditing docs in a project that has a registry, or when drift you find suggests a project needs one.

## The Reference Registry

`.docs-assist/reference.yml` holds the canonical vocabulary for the project, as `term` entries, alongside example values and other registered facts. Read it first, write with its terms, and keep it current. The full format, including the other entry kinds, is single-sourced in `reference-registry.md`; this section only covers what's specific to terminology.

- **Read it first.** If a `term` entry exists, its canonical form is authoritative in prose. Use it in everything you write.
- **Offer to create it.** When you find terminology drift (in an audit, or while surveying before a draft), offer to create the registry seeded with the canonical choices, so the decision is recorded instead of re-made every session. Scaffold from `${CLAUDE_PLUGIN_ROOT}/assets/config/reference.yml`.
- **Maintain it.** When a draft introduces a product term readers will see again, add a `term` entry with its variants to avoid. The registry is the plugin's responsibility to keep in sync, not the contributor's.
- **Respect the boundary with `style.md`.** The registry holds machine-checkable pairs: a canonical term and the variants to avoid. Judgment-based language guidance (voice, banned phrases, when a term is appropriate) stays in `.docs-assist/style.md`. When the two disagree, `style.md` wins and the registry needs updating.
- **The only kind Vale also checks.** `/docs-assist:setup-lint` compiles every `term` entry into a generated Vale substitution rule, so this check also runs as a deterministic lint, not only during a drafting or audit conversation.

## How the Audit Uses It

`/docs-assist:audit` treats `term` entries in the registry the way it treats `example-variable` entries:

- Flag prose that uses a listed variant instead of the canonical term.
- Flag the same concept appearing under different terms across docs, even when neither is in the registry yet, and suggest the pair to add.
- Without a registry, the docs set's own dominant usage is the standard: flag the outliers, and offer to record the winner.

## When a Term Changes

Renaming a term is a repeated-value change: it ripples.
Update the registry, then follow the term-rename edge in `impact-analysis.md` to every other occurrence, including `style.md` and the glossary if one exists.
