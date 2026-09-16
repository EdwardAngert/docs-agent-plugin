---
doc-slug: how-the-loop-works
pass: 1
chair: authority
rulebook: pass-1-correctness.md
updated: 2026-09-16
---

# Review Pass 1: `docs/how-the-loop-works.md`

Verdicts on the ledger entries routed to the authority chair.
Threshold: `pass-1-correctness.md`. Raised only what is wrong, not what is unclear or improvable.

Counts: 29 entries ruled (24 routed, plus the 5 low-priority link entries).
**Confirmed 21. Corrected 7. Unknowable 1.**

The draft was opened for six entries: I1, I3, I4, I6, S1, and S2.
Each turned on how a claim was worded rather than on whether the underlying fact is true, which is the exception the contract allows.
While open it also settled S4, S6, T2, T3, T5, and T7 more cheaply than a second pass would have.

## Corrected

### I1. Corrected. Only one of the two by-hand dry runs was against tested documentation.

`docs/how-the-loop-works.md:29` applies "documentation whose steps had already been tested" to both.

`reports/loop-dry-run-pihole-2026-09-16.md:3-6` — "real, tested, already-good documentation", both source pages carrying `<Verified date="2026-08" method="tested" />`.
`reports/loop-dry-run-pihole-2026-09-16.md:14` — "The recipe was unpolished by design."
`reports/loop-dry-run-rice-2026-09-16.md:4` — the rice source is a LinkedIn post, not tested documentation.

Packet misconception 6 says "one real run against tested documentation" for exactly this reason.
The draft states it correctly at line 173 and incorrectly at line 29, so the page currently contradicts itself.

Correction: the by-hand runs were two, one against tested documentation and one against an untested recipe.

### I3. Corrected. The ranking of forbidden moves above permissions inverts the design's own stance.

`docs/how-the-loop-works.md:39` — "the forbidden moves matter more than the permissions."

`reports/ideal-plugin-design-2026-09-16.md:716-723` — agent frontmatter grants tool types, not path scopes, so "a constitution saying you never edit files is a request, and withholding `Write` is a guarantee."
Packet rationale 9 states the same: a forbidden move is expressed as a missing tool wherever it can be.

Both halves are true and the ranking is the wrong half to assert.
The forbidden moves are what define each chair (packet entity 1, causal chain 6).
The permissions are what make any of them a guarantee rather than a request.
On a page whose argument is that the isolation is real rather than asserted, ranking the request above the guarantee weakens the claim it is trying to make.

Correction: state both without ranking them.

### S1. Corrected. The one end-to-end run is the run that produced this page.

`docs/how-the-loop-works.md:28` — "The loop has been run end to end once."

On which artifact is authoritative: `questions.md` Q5 is the orchestrator's answer and postdates the packet, so it supersedes packet unknown 1 and my own persona file at `.docs-assist/personas/authority.md:31-34`.
The newer fact is the right one to write.

The wording is what is wrong.
`.docs-assist/loop/` holds two slugs: `how-the-loop-works/` with packet, substitutions, ledger, and questions, and `write-docs-with-docs-assist/` with `packet.md` alone.
No prior run reached a ledger, which packet unknown 2 also states.
A reader meets "has been run end to end once" near the top of the page and reasonably concludes an independent run validated the mechanism before this page existed.
It did not: the run is this one, and it is at pass 1 as I write this.

Correction: name the run. The loop has been run end to end once, and this page is what that run produced.

### T2. Corrected. A pass is one round of the authority and advocate chairs.

`docs/how-the-loop-works.md:159` — "A pass is one round of chairs."

`skills/docs-assist/reference/loop.md:58-62` — pass N is authority then advocate, and "Continuity acts at pass 0 and again at the preparation gate, not on every pass."
Packet claim 93 and continuity's own contract at `chairs/continuity/contract.md:12-16` say the same.

The advocate chair's proposed correction is right.
The draft already states the true version at line 200, so this is a local inconsistency rather than a misunderstanding.

### I2. Corrected. The claim is about this design, not about AI review steps generally.

`docs/how-the-loop-works.md:75` — "The most common objection to any AI review step..."

Packet misconception 1 supports "the single misconception this design is most built against" and nothing wider.
I cannot ratify a frequency claim about the field: `.docs-assist/personas/authority.md:31-36` scopes my knowledge to this plugin and its author.

Correction: narrow to this design, which the packet does support, rather than to readers in general.

### I6. Corrected. It is three chairs, not two contexts.

`docs/how-the-loop-works.md:155` — "the ones two separate contexts could not settle between them."

`skills/docs-assist/reference/loop.md:105` — `questions.md` accumulates the unknowables, the oscillations, and the relation questions the chairs could not settle.
This run's own `questions.md` is the demonstration: Q1 through Q5 came from the continuity chair and R1 through R6 from the advocate chair.

The advocate chair's suspicion in the ledger entry is correct.
The substance holds; the count does not.

Correction: "the chairs," not "two separate contexts."

### I4. Corrected. The continuity chair's remit is wider than examples.

`docs/how-the-loop-works.md:52` — "so a reader crossing several pages meets one coherent set of examples."

`skills/docs-assist/reference/chairs/continuity/contract.md:3-6` states the purpose as whether a reader working straight through meets something coherent and whether the page is recognizably part of the same body of work.
Lines 40-43 of the same file add sequencing, canonical bindings, and stance, and packet rationale 15 records stance being added after a real run.

The sentence is the right kind of sentence and it undersells the chair by one axis that the page's own run exercised: continuity's largest pass-0 finding here was a naming collision, not an example value.

Correction: examples, naming, and sequencing, so that a reader crossing several pages meets one coherent body of work.

## Unknowable

### T1. Unknowable. Whether the question list reaches the reader before the draft does.

`docs/how-the-loop-works.md:17` — "the thing it hands you first is a list of what it had to guess."

The substance is already promised to readers elsewhere: `README.md:167` says draft "declares every assumption it had to make," and reuse pointer 1 makes that sentence this page's inbound link, so the page is consistent with the set.

What I cannot settle is "first."
No artifact states an order of delivery to the reader.
Packet unknown 1 and `loop.md` are both silent on it, and the one end-to-end run has not reached the point where anything is handed back.
Routed to `questions.md` rather than corrected, because guessing at it is exactly what the citation rule exists to prevent.

## Confirmed

### A1. Confirmed, and the named break is the right one to name.

The comparison holds and the break the draft states is accurate.

On the second break the advocate chair raised: it is real and it is the more load-bearing of the two, because a parts list is complete by definition and a packet carries an Unknowns row (packet claim 67, and this packet's twelve unknowns).
A reader who takes "parts list" to imply completeness misreads the deliverable, since `questions.md` is largely what the Unknowns row becomes (packet claim 89).
Not raised as a correction: signing off on where an analogy breaks is my job under packet claim 66, and this is an addition rather than a fix.
Whether one break or two belongs in the prose is the advocate chair's call.

### I5. Confirmed.

`skills/docs-assist/reference/ledger.md:37-39` — an implied fact "is invisible in a finished draft because it reads exactly like everything around it."
The draft's sentence is the shipped reference's own claim.

### S2. Confirmed. The row list is a subset and nothing is lost.

`docs/how-the-loop-works.md:44` names seven of the nine rows in packet claim 67.
Typed provenance is restored at lines 102-105, so it is not dropped from the page.
Boundaries is the only row with no named presence, and its content is on the page anyway at lines 191-200 and 182.
Nothing stated is false.

### S3. Confirmed. Dropping the attested-claims route is correct for this page.

Packet claim 71 and `questions.md` Q3 both stand: the ledger at `.docs-assist/state/docs.yml:15` is live.
It is still right to leave it out.
A contributor reading this page needs one meaning of "ledger," and a second ledger introduced in passing would cost more than the fact gains.
Where it should be documented instead is a relation question, not a correctness finding.

### S4. Confirmed at this threshold, and it is real.

`docs/how-the-loop-works.md:169` states the oscillation rule exactly as packet claim 87 and `loop.md:94` state it.
Packet unknown 6 and `loop.md:97` ("Apply a materiality threshold") are both true and neither makes the draft's sentence wrong.
The page's stance section at lines 31-33 already covers runtime behavior as predicted rather than observed, which is the umbrella this sits under.

This is an assumptions finding, not a correctness one.
Flagged for pass 2 rather than raised here, because raising it at this threshold is how manufactured severity starts.

### S5. Confirmed. The casting matrix's four cells are correctly dropped.

Packet claims 78 and 79 and rationale 6 are maintainer material.
The page states the two axes, which is what a contributor needs.

### S6. Confirmed. The drop is approved, on the evidence, and the isolation argument does not depend on it.

This is the one I was asked to rule on and it is the ruling I would have reached unprompted.

The argument the page makes about isolation is at lines 78-88, and it rests entirely on separate contexts and file-passing.
It never claims a chair *cannot* write another chair's artifact.
Packet claim 104 qualifies something the page does not assert, so dropping it is not an overclaim.

The axis the persona warns about is touched by exactly one sentence, `docs/how-the-loop-works.md:39`, and that sentence is corrected above under I3.
Fix I3 and the honesty problem S6 is worried about goes away without adding a word about path scopes.

Two things that hold only while that stays true.
If a later pass adds any sentence claiming a chair is prevented from writing outside its own artifact, packet claims 104 and 105 and unknown 8 come back and must be stated.
And `reports/ideal-plugin-design-2026-09-16.md:720-723` names the orchestrator's after-each-pass path check as the mitigation, while packet unknown 8 says it is not established that the check is implemented, so that check must not be cited on this page as a guarantee either.

### S7. Confirmed. The cold reader is correctly absent.

Packet boundary 8 and `agents/cold-reader.md` put it outside the three-chair loop.
Naming it in order to say it is not part of the loop adds a term for no reader gain.

### T3. Confirmed. "Whichever comes first" is accurate.

`skills/docs-assist/reference/loop.md:88-94`.
"All required" there means all three conditions are always active, not that all three must fire.
The run ends at the first one that does, so the draft's framing is right and no precedence is implied.

### T4. Confirmed. Casting does precede pass 0.

`skills/docs-assist/reference/loop.md:53` — cast is step 1 of the order of a run, before the deterministic checks and before pass 0.

### T5. Confirmed. "Not free" is a fact and the contested point is not presented as settled.

`skills/docs-assist/reference/loop.md:110` and packet claim 97 give the nine-run arithmetic.
`docs/how-the-loop-works.md:197` says in the same breath that cost "is not settled," which is precisely what contested point 1 says.

### T6. Confirmed, part on citation and part as my own judgment.

Known misconceptions as the highest-value row: packet claim 69, and `packet-concept.md`.
Typed provenance as the second: this is my own experience and I am marking it as such.
Packet rationale 10 supports why the row exists at all, and the citation requirement it feeds (packet claims 76 and 77, causal chain 14) is what the whole page's trust argument rests on, so ranking it second is defensible and nothing in the packet contradicts it.
Nothing here is wrong; the ranking is a shaping call that I am willing to sign.

### T7. Confirmed. The table matches the shipped reference exactly.

`skills/docs-assist/reference/ledger.md:24-33` has all eight types with the same routing values, including "link or relation" at low priority and audience calibration and structural claim at yes.
The advocate chair's concern about drift between the shipped table and this page is a real one and it is R2, which is already raised as a relation question.
It is not a correctness finding today.

### C1. Confirmed. The unexplained terms are within the reader baseline.

`.docs-assist/personas/authority.md:23-26` sets the baseline at readers who know Claude Code's primitives, and nothing explains what a subagent is.
"Subagent," "context," "spawn," slash commands, and the `agents/` and `skills/` directories all sit inside that.
"Set difference" is the packet's own term (relationship 8) and the shipped reference's (`ledger.md:7`).

### C2. Confirmed as the intended journey, with a live dependency.

Reuse pointer 1 in `substitutions.md:63` makes `README.md:167` this page's inbound link, so assuming the reader arrived from the README is the designed path rather than an invention.
That link does not exist yet, which is R5 in `questions.md` and already routed.
No new question raised; the assumption is correct once R5 is answered.

### C3. Confirmed. The page is genuinely optional.

`README.md:40` gives the user-facing contract without any of this, and packet claim 92 keeps `/docs-assist:draft` usable by someone who never learns what a packet is.
The sentence sets the page's contract with its reader accurately.

### L1 through L5. Confirmed.

L4 checked directly: `grep -rn "](\.\./skills/\|](skills/" docs/*.md README.md` returns one hit, `docs/how-the-loop-works.md:182`.
It is the first link from `docs/` into `skills/` in the published set, as the advocate chair claimed.
Whether that precedent is wanted is an information-architecture call and belongs to the advocate chair.

L1, L2, L3, and L5 are pointer choices with no factual claim for me to settle.
The decision at L5 not to send a contributor into `docs/1.0-release-plan.md` for the two-agents-both-wrong guard, and to state it on the page instead, is the right one: that file is `audience: maintainers` and future-tense, and the guarantee is load-bearing here.

## What the Draft Gets Right

Two things worth naming, chosen for weight rather than visibility.

The stance section is at line 26, before the mechanism rather than after it.
`README.md` defers its asterisk a hundred and twenty lines below the sentence it qualifies, which works there and would not work here, since this page carries twelve unknowns behind it.
Placing it second means no reader gets a long unqualified stretch, and that was the right call on a page arguing for its own trustworthiness.

The seven corrections above are all one-sentence fixes, and four of them are inconsistencies with a true statement the draft already makes elsewhere on the same page.
A ledger that surfaced them is a ledger doing its job.
