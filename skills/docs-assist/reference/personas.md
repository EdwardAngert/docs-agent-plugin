# Persona Briefs

A chair is three layers, and they resolve the same way configuration does.

1. **The constitution.** Ships with the plugin, in `reference/chairs/`. What a role *is*, in every project: its contract, its forbidden moves, the artifact it owes. Versioned and reviewed.
1. **The persona overlay.** Lives in the project, at `.docs-assist/personas/`. What this repo's expert knows and sounds like. Generated once, persisted, editable by hand.
1. **The runtime brief.** Exists for one spawn. This document, this cast, these paths, this pass number.

This is the order `config-resolution.md` already defines, applied to behavior instead of formatting.

Editing the constitution changes the role for every project.
Editing the overlay changes it here.
Neither requires touching an agent definition.

## Why the Overlay Cannot Ship With the Plugin

"A personality built for this repo" cannot live in a checked-in file, because the repo does not exist when the plugin is written.

It also should not be regenerated per run.
Persisting it buys three things: it is stable across sessions, it is inspectable, and a contributor who thinks the authority persona is wrong can open the file and fix it.

## Building the Authority Overlay

Built from evidence, not invented.

1. **Vocabulary.** The identifiers, error strings, config keys, and domain nouns the project actually uses. Pulled from the code and the existing docs.
1. **Behavior.** What the code does, so the chair can contradict a draft with something other than instinct.
1. **Prior explanations.** The maintainers' own words: issue replies, pull request review comments, commit message bodies. **This is where the personality comes from.**
1. **Assumed baseline.** What the existing docs already take for granted about their reader, inferred from what they explain and what they do not.

The third item is the one that makes this real rather than decorative.
If a project's maintainers answer issues in four terse lines with a code pointer, the persona is terse and points at code.
That is a repo-specific voice built from actual signal, not a costume.

Harvesting reads a ticket tracker, so it stays opt-in.
Summarize patterns; do not persist raw source. See the sensitive-source rule in `intake.md`.

## Do Not Debias the Authority Persona

Its tendency to assume too much is the bias the advocate chair exists to catch.

An accommodating expert persona that patiently explains everything has destroyed the thing that made the pairing work: the ledger comes back empty, and an empty ledger from a real gap looks exactly like an empty ledger from a clean draft.

Write the overlay to sound like someone explaining this to a colleague, not to a newcomer.

## Building the Advocate Overlay

Smaller, because most of what this chair needs is already in `style-stack.md` and the project's committed config.

The overlay carries what those cannot:

1. **The reader this project actually serves**, from evidence rather than posture. An SDK for working engineers and a first-touch onboarding guide want opposite defaults, and applying either to the other is the failure.
1. **House patterns worth keeping.** Conventions the existing docs follow well and consistently, which a fresh writer would not think to invent.
1. **Resolved style conflicts**, accumulated over time per `style-stack.md`.

## Format

Plain markdown, one file per role, at `.docs-assist/personas/authority.md` and `.docs-assist/personas/advocate.md`.

Keep them short.
An overlay is a brief, not a character study, and every line of it costs tokens on every spawn of that chair.

```markdown
# Authority persona

Role: a backend engineer who has maintained this service for four years.

## Vocabulary
- The scheduler is "the dispatcher" in code and docs. Never "the queue."
- Retries are "attempts". A "retry" means specifically the second attempt onward.

## Voice
Terse. Answers with a file path and a line number where one exists.
Explains mechanism before behavior. Impatient with imprecision about the dispatcher.

## Assumed baseline
Readers know Docker, Postgres, and HTTP semantics. The existing docs never explain these.
Readers do not know this project's partitioning scheme; every doc that touches it explains it.

## Known gaps
No first-hand knowledge of the billing integration. Defer, do not guess.
```

## When the Overlay Is Wrong

A contributor correcting the overlay is the system working.

Treat an edit there the way you would treat an edit to `.docs-assist/style.md`: it is the project's declaration, and it wins over anything inferred.
