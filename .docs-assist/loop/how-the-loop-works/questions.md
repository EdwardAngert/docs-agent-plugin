# Open questions

Routed by the continuity chair at pass 0, answered by the orchestrator.

## Q1. "Chair" or "reviewer" in contributor-facing prose? (blocking, everything else depends on it)

**Answer: lead with reviewer, introduce chair once.**

`README.md:167` says "three isolated reviewers" deliberately: a cold read of the README
flagged "three chairs" as jargon used before it was defined, and that was the fix.

This document is different. A reader who opens a page called "how the loop works" has
chosen to go deeper, so naming the internal term once is a service rather than a leak.
Lead with reviewer, say that the plugin calls them chairs internally, then use either.

`README.md:167` does not change.

## Q2. Does `/docs-assist:draft` still keep a running notes file?

**Answer: no. It fills the packet.** Phase 4 merged the two.

The question found a real bug rather than an ambiguity: `commands/draft.md` still said
"notes file" at two steps, and `reference/intake.md` at two more, residue from an
incomplete fix. Both are corrected. `docs/command-reference.md:44` describes the
behavior without naming the artifact, so it stands.

## Q3. Is the attested-claims ledger still live?

**Answer: yes, and `1.0-release-plan.md:68` was ambiguous about what it subsumed.**

The ledger is live, in `.docs-assist/state/docs.yml`. What the loop's `questions.md`
subsumed was the separate `open-questions.md` *convention* proposed in the field report,
never the ledger itself. Two different things; the plan's wording blurred them.

## Q4. Is "authoring loop" canonical?

**Answer: yes.** "The loop" on later mentions. Not "review loop", not "three-chair loop"
outside maintainer prose.

## Q5. Where does the stance go?

**Answer: early, and in the document's own voice.**

The published set is candid about what is unproven, and this page describes a mechanism
that has now been run end to end exactly once. Say so near the top rather than in a
footnote. A page explaining why the design is trustworthy that oversells its maturity
undercuts itself.

## Also resolved: the "packet" collision

The continuity chair found the word already meant something else to readers, at
`README.md:292` and `docs/plan.md:45`: an "intake packet" sent to an expert.

Renamed across five files to **intake questionnaire**, which is what `docs/plan.md:45`
already called it in the same sentence. Cheaper than renaming the loop artifact, and it
removes the collision rather than documenting around it.
