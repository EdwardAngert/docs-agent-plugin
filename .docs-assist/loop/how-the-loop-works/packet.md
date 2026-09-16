---
topic: "how the loop works"
cast: concept
status: ready-to-shape
updated: 2026-09-16
filled-by: chair-authority
mode: drafting
---

# Packet: How the Loop Works

Concept packet, per `packet-concept.md`.
Subject: the three-chair authoring loop, for a contributor who wants to understand what happens when the plugin drafts for them.

## The Model

### Entities

1. **Chair.** A role in the loop, implemented as a subagent, defined by what it produces and what it is forbidden to do.
1. **Authority chair.** Holds the truth about the subject. Agent file `agents/chair-authority.md`.
1. **Advocate chair.** Represents the reader and shapes the material. Agent file `agents/chair-advocate.md`.
1. **Continuity chair.** Represents the documentation set outside this document. Agent file `agents/chair-continuity.md`.
1. **Orchestrator.** The main conversation. Casts the document, spawns chairs, passes paths, applies stopping conditions.
1. **Packet.** The cold artifact of what is true, at `.docs-assist/loop/<doc-slug>/packet.md`.
1. **Substitution list.** Every example value the continuity chair changed, with what it was and why, at `substitutions.md`. Reuse pointers are appended to the same file under `## Reuse`.
1. **Draft.** The shaped document, at `draft.md`.
1. **Ledger.** Everything in the draft with no antecedent in the packet, at `ledger.md`.
1. **Review.** The authority chair's verdicts on routed ledger entries, at `review.md`.
1. **Questions.** Accumulated items for the human, at `questions.md`.
1. **Cast.** The pair of roles seated for a document, chosen on two axes.
1. **Packet schema.** `packet-procedure.md` or `packet-concept.md`. One is loaded per run, selected by the cast.
1. **Constitution.** Shipped reference files: `chairs/shared-rules.md` plus each chair's `contract.md`.
1. **Persona overlay.** Project file under `.docs-assist/personas/`, holding repo vocabulary, assumed reader baseline, and voice.
1. **Brief.** Runtime input: this document, this cast, these artifact paths, this pass number.
1. **Pass rulebook.** One file per chair per pass, under `chairs/authority/` and `chairs/advocate/`.
1. **Deterministic check.** A script under `assets/ci/` that runs before the chairs and briefs them.
1. **Cold reader.** A separate subagent, `agents/cold-reader.md`, granted `Read` only, given one document path and nothing else.

### Relationships

1. The orchestrator spawns each chair and passes file paths, never artifact content.
1. The authority chair writes `packet.md` and `review.md`.
1. The continuity chair edits example values in `packet.md` in place and writes `substitutions.md`.
1. The advocate chair writes `draft.md` and `ledger.md`, and appends relation questions to `questions.md`.
1. The advocate chair receives the packet as continuity left it, plus the substitution list and reuse pointers.
1. The advocate chair does not receive the authority chair's reasoning.
1. The authority chair receives only the ledger entries routed to it, not the draft.
1. The ledger is a set difference: draft claims minus packet lines.
1. The cast selects the packet schema and the persona brief, and nothing else.
1. A chair loads, every pass: `shared-rules.md`, its own `contract.md`, and the one rulebook for the current pass.
1. Pass number selects the rulebook; the rulebook defines the threshold.
1. The continuity chair is not cast and has one contract with no variants.

## Claims

1. There are three chairs: authority, continuity, advocate.
1. The authority chair may not comment on prose, including word choice, structure, heading case, and tone.
1. The advocate chair may not assert what is true.
1. The continuity chair may not assert facts and may not shape prose, pick a content type, or decide architecture.
1. The continuity chair changes example values, naming, and sequencing, and nothing else.
1. Two chairs are adversarial: authority and advocate.
1. The continuity chair is not adversarial with either; it represents what neither is looking at.
1. The packet contains no transitions, motivation, audience address, analogies, hedges, or editorializing headings.
1. Analogies are excluded from the packet specifically, for both packet schemas.
1. An analogy is proposed by the advocate chair and approved by the authority chair, in that order.
1. The authority chair signs off on every analogy and specifically on where it breaks.
1. The concept packet's rows are: the model, claims, causal chains, invariants and constraints, boundaries, rationale, known misconceptions, typed provenance, and unknowns and contested points.
1. The procedure packet's rows are: prerequisites and environment, steps, code and commands and configuration, typed provenance, limits, flat statements, and unknowns.
1. Known misconceptions is the highest-value row of the concept packet and the one only a teacher produces.
1. Provenance has three legitimate types: code reference, external source, SME experience.
1. Claims typed as SME experience route to the attested-claims ledger in `.docs-assist/state/docs.yml`.
1. Ledger entries are typed, and type determines whether an entry routes to the authority chair.
1. Connective prose and pedagogical ordering do not route to the authority chair.
1. Implied facts, analogies, and simplifications always route to the authority chair.
1. Style, word choice, heading case, and formatting never enter the ledger.
1. The authority chair returns one of three verdicts per routed entry: confirmed, corrected, unknowable.
1. An uncited correction is not applied; it becomes a human question.
1. Casting uses two axes: where the truth lives, and what the reader needs.
1. The casting matrix has four cells and produces four pairings from two agent definitions.
1. Exactly one re-cast is allowed per document; the pass counter resets and the authority chair re-emits the packet in the new shape.
1. A second re-cast request goes to the human.
1. Material that needs two casts is two documents.
1. Reference material is the content type where the loop earns least.
1. The default hard cap is three passes; the maximum is four.
1. Pass 4 is off by default.
1. A pass that produces nothing at or above its threshold is a successful pass and ends the loop.
1. A pass that reverses the previous pass's change is an oscillation and stops the loop immediately.
1. Oscillation detection needs a materiality threshold.
1. The stated deliverable is `questions.md`, not the polished document.
1. The packet is durable and is kept after the document ships.
1. A packet filled by a human and a packet emitted by the authority chair are the same artifact, and nothing downstream distinguishes them.
1. `/docs-assist:draft` runs the loop with a person in the authority chair.
1. The continuity chair runs at pass 0 and at the preparation gate, `/docs-assist:merge-prep`, and not on every pass.
1. Deterministic checks run before the chairs and brief them.
1. `assets/ci/example-continuity.mjs` runs before the continuity chair.
1. The escalation across passes is implemented by which rulebook file is in context.
1. Three passes at two or three chairs each is up to nine subagent runs per document.
1. The loop is sequential within a document and parallel across documents.
1. The cold reader is granted `Read` only and is not part of the three-chair loop.
1. The advocate chair holds `Read, Write, Edit, Grep, Glob`.
1. The authority chair holds `Read, Grep, Glob, Write, WebFetch, WebSearch`.
1. The continuity chair holds `Read, Grep, Glob, Write`.
1. Agent frontmatter grants tool types, not path scopes.
1. Write boundaries per artifact are a prompt-level contract, not an enforced one.
1. The orchestrator checking after each pass that only the expected path changed is the mitigation for the unenforceable write boundary.
1. `pass-3-precision.md` forbids replacing an observable or sensory cue with a numeric one unless the authority chair confirms the number holds across the reader's likely conditions.
1. The advocate chair may not soften a limit into a suggestion.
1. Relation questions belong to the advocate chair, not to the continuity chair.
1. Absence claims require naming where the chair looked.
1. A hypothesis carried in from another document is not evidence in this one.

## Causal Chains

1. The chairs run in separate contexts, which makes the ledger verifiable, because a context that produced the packet knows things it never wrote down and cannot reliably tell which of its own claims came from where.
1. The packet is prose-free, which makes the ledger a mechanical diff, because everything the packet omits is by definition a writer's decision and therefore attributable to the advocate chair.
1. The ledger is defined as a diff rather than a self-report, which removes a dependency on accurate introspection, because language models are not reliable self-reporters.
1. The advocate chair is denied the authority chair's reasoning, which guarantees that anything it adds originates with it, because it has no other source to have taken it from.
1. The authority chair is shown only routed ledger entries and not the draft, which keeps it from reviewing prose, because reading prose pulls a reviewer toward commenting on it.
1. Each chair has forbidden moves, which preserves the tension between them, because a chair that does everything converges with the others and produces a confident average.
1. Opposed failure modes are paired, which catches what either alone would miss, because an expert alone ships correct and unreadable material and a writer alone ships clear and subtly wrong material.
1. Artifacts are files and the orchestrator passes paths, which keeps main-thread context flat regardless of document size, because no artifact is ever returned into the orchestrator's context.
1. Artifacts are files, which makes the loop resumable and every intermediate step inspectable, because state survives the end of a session.
1. Escalation is implemented as rulebook selection, which produces finer findings rather than a worse tone, because a model told to be grouchy writes grouchy prose and does not read more carefully.
1. Escalation is implemented as rulebook selection, which also caps per-spawn cost, because a pass-1 spawn never loads the pass-3 rules.
1. An empty pass is declared successful, which prevents manufactured findings, because a reviewer that believes finding nothing means failing will promote trivia to defects.
1. One bad finding costs more trust than silence, because a reader who receives one starts discounting the good ones.
1. An uncited correction becomes a human question, which guards against two agents agreeing confidently and both being wrong, because neither chair holds ground truth.
1. Any substitution that could change behavior goes back as a question rather than being applied, because harmonizing a value across pages is a correctness loss when the two products genuinely differ, and that failure is invisible until someone runs the commands.
1. Shape is decided at pass 0 and again at pass 1, because the first round of correctness verdicts can invalidate the original shape call: a correction that removes half a procedure changes what the document should have been.
1. The prerequisites row exists because without it a hard requirement lands inside whichever step first needs it, and the reader discovers it after committing.
1. Deterministic checks run first, because a chair that rediscovers a mechanical finding has spent a pass on something a script already decided.
1. An oscillation stops the loop, because a reversal identifies a judgment call neither chair can settle, and that is where a person's scarce attention belongs.
1. The real output is a short question list, because four questions with context attached is a ten-minute task an expert will do, and a full draft review is one that sits in a tab.
1. Chairs are subagents rather than sequential roleplay, because isolation is what makes the mechanism sound rather than what makes it cheap.

## Invariants and Constraints

1. A chair writes only the artifacts its contract names.
1. The continuity chair's in-place edit of packet example values is the single exception to that rule, and it touches nothing else in the packet.
1. Every correction carries a citation: a file and line, a commit, an external source, or an explicit statement that it is the chair's own experience.
1. Every gap the advocate chair fills becomes a ledger entry.
1. No pass has a minimum finding count, a target, or a quota.
1. Severity is never inflated to make a finding worth reporting.
1. A packet never contains an analogy.
1. A step that modifies a file carries that file's full path, on the step, in the procedure packet.
1. Absence is never reported without naming where the chair looked; presence can be established from one file and absence cannot.
1. External verification excludes the doc set under verification from its own search results.
1. The chairs never load `loop.md`; the orchestrator does.
1. The contracts do not change with the cast.
1. Two chairs never settle a disagreement between themselves by reversal; a reversal ends the run.

## Boundaries

1. The loop is not a review step applied to a finished document; pass 0 is production.
1. The advocate chair is not a prose polisher applied at the end; it owns content type, information architecture, links, and style.
1. The packet is not a draft.
1. The packet is not a template for the document's shape.
1. The ledger is not a changelog and not a list of edits; it is the set of claims without antecedents.
1. The ledger is not a style review.
1. The continuity chair is not a third opinion on this document.
1. The cold reader is not a chair and does not participate in a pass.
1. The loop is not a linter; the deterministic checks are, and they run first.
1. The casting matrix is not a content-type taxonomy; `content-types.md` is, and the advocate chair owns it.
1. The authority chair is not an editor and holds no opinion about commas.
1. The escalation gradient is not a personality setting.
1. `/docs-assist:merge-prep` is not part of a document's pass sequence; it is a separately invoked whole-set gate.
1. The audit is the same mechanism pointed at an existing document rather than a new one.

## Rationale

1. Three chairs rather than one reviewer: a single reviewer averages two opposed failure modes into mush.
1. Separate contexts rather than sequential roleplay in one conversation: rejected because the ledger-as-diff becomes theater when one context holds both sides.
1. The ledger as a diff: an earlier version of the design had the advocate chair report what it thought it had assumed, and that self-report was rejected as unreliable.
1. Files and paths rather than return values: returning artifacts was rejected because the orchestrator would accumulate all of them, defeating the isolation.
1. Rulebook selection rather than a strictness instruction: telling a model to be grouchier was proposed, tested against reasoning, and rejected as tone rather than rigor. The surviving part of the idea is permission to be pedantic, granted by which rules are loaded.
1. Two agent definitions rather than four: the casting matrix suggests four authority and advocate variants, but the contract is identical across casts and only the schema and persona differ, so the variants are briefing-level inputs.
1. One skill with reference files rather than five skills: a chair is loaded by path because the orchestrator already decided to seat it, and giving each constitution its own trigger description would add mis-routing surface for no benefit.
1. Three layers per chair (constitution, persona overlay, brief): a personality built for a repo cannot be one file, because part of it ships and part cannot exist until a repo does. The layering reuses the existing config-resolution order.
1. The tool grant as the enforceable boundary: a constitution saying "you never edit files" is a request, and withholding `Write` is a guarantee, so a forbidden move is expressed as a missing tool wherever it can be.
1. Typed provenance rather than a required citation row: a required citation row makes the authority chair either fabricate or refuse on material that has no citable source.
1. Typed ledger entries rather than a flat list: an expert's attention should not be spent uniformly, because additions are not equally risky.
1. Three stopping conditions rather than a fixed pass count alone: an adversarial loop can always find something.
1. Continuity as its own chair rather than a responsibility of the other two: within one page nothing is wrong, so no per-page review reaches a cross-page defect.
1. The continuity chair's name is taken from the film continuity supervisor role, stated in `continuity/contract.md`.
1. Stance added to the continuity remit: a piped-installer finding from a real run fit none of values, naming, or sequencing, and had the same shape as every other continuity finding.
1. The prerequisites row added to the procedure packet: two independent dry runs produced the same failure, one in a recipe and one in a software journey.
1. A language-tag check was proposed, fired on a deliberate accommodation on the first real document, and was rescoped to the two unambiguous cases: no tag at all, and a tag the configured highlighter does not recognize.
1. The cue-protection rule in `pass-3-precision.md` exists because a precision pass left to itself trades a working sensory cue for a number that is wrong more often, and the trade looks like an improvement in review.
1. "If the material needs two casts, it is two documents" replaced a size-and-story-count heuristic, because it is falsifiable.

## Known Misconceptions

Each row: what the reader arrives believing, then what is actually the case.

1. **"One model wrote it and then graded its own work, so the check is worthless."** The chairs run in separate contexts and pass files. The advocate chair receives the packet and never the authority chair's reasoning, so the boundary is real rather than asserted. This is the single misconception the design is most built against.
1. **"The chair that checks the draft reports what it thinks it assumed."** It does not introspect. It compares two artifacts and lists what is in the prose and not in the packet. Entries are produced by construction, not by recall.
1. **"The loop exists to remove the human from documentation."** The stated deliverable is `questions.md`, a short list of what genuinely needs a person. The packet is designed to be fillable by a human, and `/docs-assist:draft` is the loop with a person seated in the authority chair.
1. **"The finished document is the output."** The polished document is a by-product. The design names the question list as the real output.
1. **"More passes produce a better document."** The cap is three by default and four maximum, and convergence is expected to end most runs at pass one or two. A pass that finds nothing ends the loop and is recorded as successful.
1. **"A pass that finds nothing means the run failed or the money was wasted."** An empty pass is a successful pass, stated in every chair's shared rules. In one real run against tested documentation, pass 1 found nothing, and that null result was treated as the validating signal rather than a failure.
1. **"Each pass makes the reviewer stricter by making it grouchier."** Nothing about tone changes. The pass number selects which rulebook file is loaded, and that is the entire implementation of escalation.
1. **"The chairs are personalities with backstories."** They are constrained roles defined by what each is forbidden to do. Persona material is repo vocabulary, assumed reader baseline, and voice, not character.
1. **"Three chairs means three opinions that get merged into a consensus."** Two are adversarial and one is orthogonal. The tension is the mechanism, and resolving it is the failure, not the goal.
1. **"Because a second agent checks the first, factual errors get caught."** Neither chair holds ground truth, and two agents can agree confidently and both be wrong. What guards against it is the citation requirement: an uncited correction is not applied and becomes a human question instead.
1. **"The expensive part is writing the prose."** Writing the draft is the easy half. The ledger is the part that carries the value, and the design says so in the advocate chair's own contract.
1. **"The packet is a rough first draft that gets polished."** It is deliberately not prose. Warming it up is described as the one way to break the loop, because it destroys the diff the ledger depends on.
1. **"The authority chair should explain everything carefully so the document is complete."** Its bias toward assuming too much is deliberate and it is told not to compensate. A chair that pre-empts its own assumptions returns an empty ledger and teaches nobody anything.
1. **"Making the docs consistent is always safe."** Continuity can lie. Harmonizing a value across pages is a correctness loss where the products genuinely differ, and the failure is invisible until someone runs the commands.
1. **"A disagreement between the chairs is a defect in the loop."** An oscillation is the loop working: it has located a judgment call neither chair can settle, which is exactly what should reach a person.
1. **"The loop is a fancy linter."** Everything a script can decide runs before any chair and briefs it. The chairs are spent on what a script cannot decide.
1. **"An AI reviewer's job is to find problems."** There is no minimum count, no target, and no quota, and a finding that exists only because someone was looking for it is not a finding.
1. **"The loop has been proven in production."** See Unknowns. It has been run by hand, in pieces, twice, and never end to end with a real ledger.
1. **"By-hand dry runs prove the mechanism is reliable."** One of the two dry runs produced two false positives out of seven findings, both traced to reporting what was expected rather than what was checked. The shared rules are written against that specific failure.
1. **"The document is written once and reviewed after."** Shape is decided twice, at pass 0 and again at pass 1, and it is the only thing decided twice.

## Provenance, Typed

Code reference is the dominant type here because the subject is this repository.

| Claim group                                     | Type           | Source                                                                             |
| ----------------------------------------------- | -------------- | ---------------------------------------------------------------------------------- |
| Chair roster, artifacts, run order, stopping     | Code reference | `skills/docs-assist/reference/loop.md:9-116`                                        |
| Separate contexts and why                        | Code reference | `skills/docs-assist/reference/loop.md:20-30`                                        |
| Escalation as rulebook selection                 | Code reference | `skills/docs-assist/reference/loop.md:64-86`                                        |
| Empty pass, no quota, absence claims             | Code reference | `skills/docs-assist/reference/chairs/shared-rules.md:5-34`                           |
| Write-to-your-artifact rule and its exception    | Code reference | `skills/docs-assist/reference/chairs/shared-rules.md:59-63`                          |
| Authority forbidden moves, verdicts, citation    | Code reference | `skills/docs-assist/reference/chairs/authority/contract.md:16-48`                    |
| Deliberate bias of the authority chair           | Code reference | `skills/docs-assist/reference/chairs/authority/contract.md:25-34`                    |
| Advocate ownership, forbidden moves, ledger      | Code reference | `skills/docs-assist/reference/chairs/advocate/contract.md:19-61`                     |
| Continuity remit, guard, journey rule, naming    | Code reference | `skills/docs-assist/reference/chairs/continuity/contract.md:8-64`                     |
| Ledger as diff, entry types, routing, verdicts   | Code reference | `skills/docs-assist/reference/ledger.md:7-69`                                        |
| Concept packet rows and exclusions               | Code reference | `skills/docs-assist/reference/packet-concept.md:8-69`                                |
| Procedure packet rows, cold rule, human-fillable | Code reference | `skills/docs-assist/reference/packet-procedure.md:8-85`                              |
| Casting axes, matrix, re-cast, two-casts rule    | Code reference | `skills/docs-assist/reference/casting.md:7-70`                                       |
| Tool grants per chair                            | Code reference | `agents/chair-authority.md:4`, `agents/chair-advocate.md:4`, `agents/chair-continuity.md:4` |
| Cold reader's isolation as its value             | Code reference | `agents/cold-reader.md:4-18`                                                         |
| Human in the authority chair                     | Code reference | `commands/draft.md:21-23`                                                            |
| Rejected alternatives and design reasoning       | Code reference | `reports/ideal-plugin-design-2026-09-16.md:77-99, 189-198, 585-628, 665-696`          |
| Unenforceable per-path write boundary            | Code reference | `reports/ideal-plugin-design-2026-09-16.md:716-723`                                  |
| Cost arithmetic and mitigations                  | Code reference | `reports/ideal-plugin-design-2026-09-16.md:725-734`                                  |
| Prerequisites row, confirmed twice               | External source | `reports/loop-dry-run-rice-2026-09-16.md:140-148`, `reports/loop-dry-run-pihole-2026-09-16.md:214-218` |
| Cue-protection rule's origin                     | External source | `reports/loop-dry-run-rice-2026-09-16.md:117-134`                                    |
| Pass 1 finding nothing on tested docs            | External source | `reports/loop-dry-run-pihole-2026-09-16.md:49-53`                                    |
| Two false positives out of seven, and their cause | External source | `reports/loop-dry-run-pihole-2026-09-16.md:250-267`                                  |
| Stance added to the continuity remit             | External source | `reports/loop-dry-run-pihole-2026-09-16.md:202-212`                                  |
| Language-tag check rescoped                      | External source | `reports/loop-dry-run-pihole-2026-09-16.md:137-150`                                  |
| The loop has never been executed end to end      | SME experience | `.docs-assist/personas/authority.md:31-36`                                            |

The two dry-run reports are typed external source rather than code reference because they record observations of runs, not the behavior of code in this repository.
Both were run by hand by this project's author.

## Unknowns and Contested Points

### Unknowns

1. The loop has never been executed end to end. Every claim about its runtime behavior is designed, not observed.
1. No real ledger has been produced by a `chair-advocate` spawn. Both existing ledgers were written by hand in dry runs.
1. Whether convergence actually ends most runs at pass one or two is a prediction with no measured support.
1. The observed per-document cost is unknown. Nine subagent runs is an upper bound from arithmetic, not a measurement.
1. Whether an advocate chair, given only a packet, produces a ledger that is honestly complete is untested. Under-reporting is anticipated in its contract and has never been measured.
1. The materiality threshold for oscillation detection is undefined. It is named as needed and no value is set.
1. The false-positive rate of any chair is unknown. The two-in-seven figure is from a by-hand run, not from a spawned chair.
1. Whether the orchestrator's after-each-pass check that only the expected path changed is implemented is not established by the material read here.
1. Whether a re-cast preserves anything from the first packet, or the authority chair starts clean, is not specified.
1. What happens when `questions.md` is never answered is not specified.
1. No knowledge of how the loop behaves for anyone but this plugin's author.
1. Whether the concept packet's rows hold up in a real run is untested. Both dry runs cast procedures; neither exercised `packet-concept.md`.

### Contested points

1. Whether the loop's cost is justified per document. The design names cost as the main practical objection to itself and does not settle it.
1. Whether a fourth pass is ever worth running. It exists, and it is off by default.
1. Whether persona overlays improve output or become theater. The design names the risk and asserts a mitigation without evidence.
1. Whether the explain-it-back test can be scored for a concept page. The design states the procedure case is clean and the concept case is harder, and proposes predicting behavior in an unmentioned case as the better and harder test.
1. Whether the chairs should be given web reach by default. External verification produced the one finding in a real run that was unreachable from inside a repository, and it also enlarges the surface for confabulation.
