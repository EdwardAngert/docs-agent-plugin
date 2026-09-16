---
doc-slug: how-the-loop-works
pass: 0
chair: advocate
draft: docs/how-the-loop-works.md
updated: 2026-09-16
---

# Ledger Pass 0: `docs/how-the-loop-works.md`

Everything in the draft with no antecedent in `packet.md`.

Produced by comparing two artifacts, not by recalling intent.
Where a claim traces to `substitutions.md` or `questions.md` instead of the packet, it is marked **sourced elsewhere** and listed for completeness rather than routed.

Counts: 38 entries.

| Type                 | Count | Routes        |
| -------------------- | ----- | ------------- |
| Connective prose     | 5     | No            |
| Pedagogical ordering | 4     | No            |
| Link or relation     | 5     | Low priority  |
| Audience calibration | 3     | Yes           |
| Structural claim     | 7     | Yes           |
| Implied fact         | 6     | Always        |
| Analogy              | 1     | Always        |
| Simplification       | 7     | Always        |

Routed to the authority chair: 24, plus 5 link entries at low priority.
Three of the routed entries are flagged as the ones to read first: S6, T2, and I1.

## Analogy

Routes: always. The packet contains none by design, so this is entirely the advocate chair's invention.

### A1. "A packet is closer to a parts list than to a first draft."

**Draft:** the *The Packet* section.
**Packet antecedent:** none. Claim 63 and boundaries 3 and 4 say what the packet is not. No comparison is offered.
**Where I think it breaks, and I said so in the draft:** a parts list only inventories, while the packet also states causes, rationale, and the reader's likely wrong beliefs.
**Where it may also break, and I did not say so:** a parts list is complete by definition, and the packet has an Unknowns row, so a packet is explicitly allowed to be incomplete in a way a parts list is not. If the authority chair thinks that second break matters more than the first, the sentence should name it instead.
**Routed.**

## Implied Fact

Routes: always.

### I1. Both by-hand dry runs were against documentation whose steps had already been tested.

**Draft:** *What Has Actually Been Run*, "exercised twice by hand, in pieces, against documentation whose steps had already been tested."
**Packet antecedent:** misconception 18 says two by-hand runs. Misconception 6 says *one* real run was against tested documentation. I applied "tested" to both.
**Routed.** If only one was, the sentence is wrong.

### I2. "The most common objection to any AI review step is that one model wrote the thing and then graded its own work."

**Draft:** opening of *Why They Run Apart*.
**Packet antecedent:** misconception 1 calls it "the single misconception the design is most built against." That is a statement about this design, not about how common the objection is across the field.
**Routed.** I generalized a claim about this packet into a claim about readers in general.

### I3. "The forbidden moves matter more than the permissions."

**Draft:** *The Three Chairs*, opening.
**Packet antecedent:** entity 1 defines a chair by what it produces *and* what it is forbidden to do, with no ranking. Causal chain 6 and rationale 9 both lean toward the forbidden moves being load-bearing, which is why I wrote it, but the ranking is mine.
**Routed.**

### I4. The continuity chair's purpose is stated as "so a reader crossing several pages meets one coherent set of examples."

**Draft:** *The Continuity Chair*.
**Packet antecedent:** claim 60 says what it changes. Rationale 12 says no per-page review reaches a cross-page defect. Neither states the reader-facing outcome.
**Routed.** Plausible, and it is the sentence that makes the chair make sense, which is exactly the category the ledger exists for.

### I5. "Which is why nobody catches it in review."

**Draft:** *The Ledger*, about implied facts.
**Packet antecedent:** none. The packet says implied facts always route (claim 74). It does not claim they evade human review.
**Routed.**

### I6. "The loop is what makes that division mechanical instead of aspirational," and "the questions reaching you are the ones two separate contexts could not settle between them."

**Draft:** end of *What You Actually Review*.
**Packet antecedent:** partial. Causal chain 16 covers why a short question list is the right output. But `questions.md` also accumulates relation questions and unknowable verdicts, so "could not settle between them" is a narrower description than the artifact actually holds.
**Routed.** This may be a correction rather than a confirmation.

## Simplification

Routes: always. Each is a caveat I dropped on purpose.

### S1. The one-run reconciliation.

Packet unknown 1 says the loop has never been executed end to end and every runtime claim is designed, not observed. `questions.md` Q5 says it has now been run end to end exactly once. I wrote the newer fact and softened unknown 1 to "most of what follows is design rather than measurement."
**Routed.** The packet's own unknowns row is now partly stale, and which artifact is authoritative is the authority chair's call.

### S2. The concept packet's rows, listed incompletely.

**Draft:** *The Authority Chair* lists the model, claims, causal chains, constraints, rationale, misconceptions, and unknowns.
**Packet:** claim 67 lists nine rows. I dropped **boundaries** and folded **typed provenance** down into the packet section instead.
**Routed.**

### S3. SME-typed claims routing to the attested-claims ledger is not mentioned.

**Packet:** claim 71, and `questions.md` Q3 confirms the ledger at `.docs-assist/state/docs.yml` is live.
**Dropped because:** it introduces a second ledger on a page whose whole job is teaching one specific meaning of "ledger," and the collision costs more than the fact gains.
**Routed.** If that route is something a contributor needs to know about, it needs a different home.

### S4. The oscillation materiality threshold is undefined.

**Packet:** claim 88 and unknown 6. The draft presents oscillation detection as though it works.
**Routed.** This is the largest single gap between what the draft implies and what the packet says exists.

### S5. The casting matrix's four cells and two agent definitions.

**Packet:** claims 78 and 79, rationale 6. The draft says "two axes" and stops.
**Routed**, low priority. I believe this is correctly dropped for a contributor.

### S6. Tool grants, agent frontmatter, and the unenforceable write boundary.

**Packet:** claims 100 through 105, including that per-artifact write boundaries are a prompt-level contract rather than an enforced one, mitigated by the orchestrator checking the changed path.
**Dropped because:** it is implementation detail below this page's altitude.
**Routed, and I want a second opinion on this one.** This page argues the isolation between chairs is real rather than asserted. "The write boundary is not actually enforced" is a qualification on that argument, and the persona says overclaiming costs more here than vagueness does. Unknown 8 also says it is not established whether the orchestrator's check is implemented.

### S7. The cold reader is not mentioned at all.

**Packet:** entity 15, claim 99, boundary 8.
**Dropped because:** it is not part of the three-chair loop, and naming it to say it is not part of the loop adds a term for no reader gain.
**Routed**, low priority.

## Structural Claim

Routes: yes.

### T1. "The thing it hands you first is a list of what it had to guess."

**Draft:** opening paragraph.
**Packet:** claim 89 names `questions.md` as the deliverable and misconception 4 says the document is a by-product. Neither states an order of delivery to the reader.
**Routed.** Whether the question list actually reaches you before the draft does is a runtime behavior nobody has observed.

### T2. "A pass is one round of chairs."

**Draft:** *Passes, and When the Loop Stops*.
**Packet:** relationship 10 and claim 96 describe what a chair loads per pass. No definition of a pass is given, and claim 93 says continuity does not run every pass, which makes "one round of chairs" imprecise.
**Routed.** Likely wants correcting to something like "one round of the authority and advocate chairs."

### T3. The three stopping conditions are presented as "whichever comes first."

**Packet:** rationale 13 says three stopping conditions, claims 84 through 87 describe them. The precedence framing is mine.
**Routed.**

### T4. "Before the first pass, the document is cast."

**Packet:** entity 5 says the orchestrator casts. Claim 80 says a re-cast resets the pass counter. The packet never places casting before pass 0.
**Routed.**

### T5. Cost is placed in the *What the Loop Is Not* list as "Not free."

**Packet:** claim 97 (up to nine subagent runs) and contested point 1 are stated, but never as a boundary.
**Routed**, low priority. This is closer to a shaping call, logged because it presents a contested point as a settled framing.

### T6. Typed provenance is elevated to one of "two rows that carry most of the weight."

**Packet:** claim 69 says known misconceptions is the highest-value row. Nothing ranks typed provenance second.
**Routed.**

### T7. The entry-type table's rows beyond what the packet types.

**Draft:** the eight-row ledger table.
**Packet:** claim 72 says entries are typed and type determines routing. Claim 73 exempts connective prose and pedagogical ordering. Claim 74 routes implied facts, analogies, and simplifications always. Claim 75 excludes style.
**Not in the packet:** that there are exactly eight types, that "link or relation" routes at low priority, and that audience calibration and structural claim route at "yes." I took those from `reference/ledger.md`, which is constitution rather than packet.
**Routed.** If the shipped table and the packet's claims ever diverge, this page will be the visible one.

## Audience Calibration

Routes: yes.

### C1. Unexplained terms.

The draft uses **subagent**, **context**, **spawn**, and **set difference** without defining them, and assumes the reader knows what a slash command is and that `agents/` and `skills/` are directories in this repository.
**Packet:** no reader baseline is stated. `.docs-assist/personas/advocate.md` says the reader is a maintainer or an adopter evaluating the plugin, which is the floor I wrote to.
**Routed.**

### C2. The draft assumes the reader arrived from the README or the contributor guide.

It never re-explains what `/docs-assist:draft` does, and the opening sentence depends on knowing the command exists.
**Routed.**

### C3. The draft assumes a reader who wants the mechanism, not the workflow.

"You do not need any of it to use the plugin. Read it if you want to know what a draft's assumptions list is worth before you trust one."
**Packet:** nothing states who this page is for or that it is optional.
**Routed.** This sentence sets the page's entire contract with its reader, and I invented it.

## Pedagogical Ordering

Does not route.

### P1. Chairs before artifacts.

Roles are introduced before the packet, ledger, and questions list, though the packet's Entities row lists them intermixed.

### P2. Authority, then continuity, then advocate.

Production order, which matches the packet's entity order, but the packet does not state that the order is meaningful.

### P3. The stance section second, before the mechanism.

`questions.md` Q5 says "early, and in the document's own voice." Placing it as section two, before the chairs, is my reading of "early." **Sourced elsewhere.**

### P4. The packet before the ledger, and both before passes and casting.

Casting actually happens first in a run. I taught it last, after the reader knows what a packet and a cast would change.

## Link or Relation

Routes: low priority.

### L1. README self-assessment, from the stance section.

`../README.md#what-would-improve-it-most`. Reuse pointer 6 in `substitutions.md`. **Sourced elsewhere.**

### L2. README "What It Writes," for where run artifacts live.

`../README.md#what-it-writes`. My choice, not a listed pointer.

### L3. "Review for accuracy, not style," from *What You Actually Review*.

`write-docs-with-docs-assist.md#review-for-accuracy-not-style`. Reuse pointer 5. **Sourced elsewhere.** The anchor is a heading link, which house style discourages unless persistent. I judged this one persistent.

### L4. `content-types.md` under `skills/`, from the casting section.

The first link from `docs/` into `skills/` in the published set, as far as I can tell from the set definition in `substitutions.md`. Flagged as an information-architecture precedent rather than a fact.

### L5. Related reading: the contributor guide, the command reference, and the 1.0 release plan.

The release-plan link carries the caveat reuse pointer 2 asked for (maintainer audience, future tense, reads as a promise). I linked it rather than restating its compact summary of the loop, per the single-source-of-truth rule.

Not linked, deliberately: `/docs-assist:merge-prep` is linked to the command reference, and the two-agents-both-wrong guard (reuse pointer 3, `docs/1.0-release-plan.md:215`) is stated in this page's own voice instead, because sending a contributor into a maintainer build plan for a load-bearing guarantee is worse than repeating one sentence.

## Connective Prose

Does not route. Listed for completeness, not for review.

### N1. All topic sentences and section bridges.

Every paragraph opener in the draft. The packet contains no transitions by design (claim 63), so all of them are mine.

### N2. "Reviewer and chair mean the same thing here."

The lead-with-reviewer decision is `questions.md` Q1. The sentence is mine. **Sourced elsewhere.**

### N3. The second-person address throughout.

The packet contains no audience address (claim 63).

### N4. Section headings.

Every heading is an editorializing heading, which the packet excludes by rule.

### N5. Frontmatter title, description, and keywords.

None of the five fields has a packet antecedent. Style and metadata, mine by contract.
