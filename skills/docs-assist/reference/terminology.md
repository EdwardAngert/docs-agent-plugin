# Terminology

This is how Docs Assist keeps product terms consistent across a docs set: the same fix `code-examples.md` applies to placeholder values, applied to words.

Terminology drift is the quietest documentation defect.
One doc says "workspace" and the next says "project" for the same thing, a product name appears in three casings, and every inconsistency makes a reader stop and wonder whether two terms mean two things.
A solo writer has no reviewer to catch it; a team catches it late, in review, one instance at a time.
The fix is the same as for example values: a small registry every doc is checked against.

Load this when writing or auditing docs in a project that has a registry, or when drift you find suggests a project needs one.

## The Reference Registry

`.docs-assist/reference.yml` holds the canonical vocabulary for the project, as `term` entries, alongside example values and other registered facts. Read it first, write with its terms, and keep it current. The full format, including the other entry kinds, is single-sourced in `reference-registry.md`; this section only covers what's specific to terminology.

Reading, creating, and maintaining entries, the `style.md` boundary, and the Vale compilation are all in `reference-registry.md` under `term`. They are not restated here, because two copies of a rule drift and this file already had the older wording.

What is specific to terminology, and lives only here:

- **A canonical form is authoritative in prose, not in code.** A `term` entry governs how a concept is named in sentences. Identifiers, file paths, command names, and config keys keep whatever the code calls them, even when that differs from the canonical prose term. This is why `example-continuity.mjs` checks `example-variable` variants inside code blocks and deliberately does not check `term` variants there.

## How the Audit Uses It

`/docs-assist:audit` treats `term` entries in the registry the way it treats `example-variable` entries:

- Flag prose that uses a listed variant instead of the canonical term.
- Flag the same concept appearing under different terms across docs, even when neither is in the registry yet, and suggest the pair to add.
- Without a registry, the docs set's own dominant usage is the standard: flag the outliers, and offer to record the winner.

## When a Term Changes

Renaming a term is a repeated-value change: it ripples.
Update the registry, then follow the term-rename edge in `impact-analysis.md` to every other occurrence, including `style.md` and the glossary if one exists.
