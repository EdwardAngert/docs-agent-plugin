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

## Relation questions (advocate, pass 0)

What this material implies should exist. Routed to the authority chair; what it cannot answer goes to Edward.

### R1. A worked example of a packet, a ledger, and a `questions.md`, somewhere in the published set

The continuity chair established that none exists: not in `README.md`, not in `docs/*.md`, and `.docs-assist/loop/` holds two `packet.md` files and no other artifact.

This page describes three artifacts a contributor never sees and asks them to trust the mechanism on the description alone.
One short real example of each would do more for that trust than any paragraph on this page.
The obvious candidate is this run: the packet, ledger, and question list for this very document exist and were produced by the loop.
Whether a worked example belongs inline here, on its own page, or nowhere is a real decision, and it is downstream of whether `.docs-assist/loop/` artifacts stay in the repository after a document ships. Packet claim 90 says the packet is durable and kept, which suggests they do.

### R2. A reference page for ledger entry types

Ledger entry types are typed material with fixed values and routing rules, which is reference content, not concept content.
I reproduced the table on this page because a reader cannot follow the ledger without it, and reproducing it means it will drift from `skills/docs-assist/reference/ledger.md`.
Ledger entry T7 records that I took three of the table's rows from the shipped reference rather than from the packet.
Either the reference file becomes reader-facing and this page links to it, or the table needs to live in exactly one contributor-facing place.

### R3. The reviewer-facing half: what a `questions.md` asks you for, and what answering one looks like

This page says the question list is the real output and then stops.
`docs/write-docs-with-docs-assist.md` covers reviewing a draft for accuracy, which is adjacent but not the same task.
Answering a question list is the one action the whole design asks a contributor to take, and nothing in the set describes it.
This is the strongest candidate for a new doc, and it would be a `doc` rather than a `concept`.

### R4. Where `/docs-assist:audit` is explained as the same mechanism

Packet boundary 14 says the audit is this loop pointed at an existing document.
`README.md` describes audit in terms of reconstructing claims, which is the same idea in different words and never connects the two.
If they are the same mechanism, the audit's description should say so, and this page is currently the only place it is stated.

### R5. Does the README's Documentation list gain a fourth entry?

`README.md:90-92` lists three pages and is the set's index.
This page is contributor-facing and is the deeper version of the sentence at `README.md:167`, which reuse pointer 1 says should be its inbound link.
Without an entry in that list, or a link from line 167, this page is reachable only by knowing it exists.
I did not edit `README.md`, because it is not my artifact.

### R6. A troubleshooting or FAQ entry for "the loop asked me something I cannot answer"

Packet unknown 10 says what happens when `questions.md` is never answered is not specified.
That is a real failure mode for the one action this design depends on, and it currently has no answer anywhere.
Raising it as a relation question rather than writing around it.

## Authority chair, pass 1

One unknowable. Everything else routed at pass 1 was confirmed or corrected in `review.md`.

### A1. Does the question list actually reach the contributor before the draft does?

`docs/how-the-loop-works.md:17` tells a reader that the first thing the plugin hands back is the list of what it had to guess.

The substance is already the set's promise: `README.md:167` says draft "declares every assumption it had to make."
What no artifact states is the order. Nothing in `skills/docs-assist/reference/loop.md` or in the packet says what the orchestrator presents first when a run finishes, and the one end-to-end run has not reached that point.

Three ways to settle it, and the choice is yours:

1. It is true and intended, in which case it belongs in `loop.md` as a stated behavior and the sentence stands.
1. It is aspirational, in which case the sentence should describe what the deliverable *is* rather than when it arrives.
1. It is undecided, in which case this is a design question about the end of a run, not a wording question about this page.
