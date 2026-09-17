---
title: "How the authoring loop works"
description: "The three-reviewer authoring loop behind /docs-assist:draft: what a packet is, why the reviewers run in separate contexts, what a ledger declares, and why the real output is a short list of questions rather than the finished document."
content-type: concept
audience: contributors
keywords:
  - authoring loop
  - packet
  - ledger
  - draft command
  - documentation review
---

# How the authoring loop works

When you run `/docs-assist:draft`, the plugin does not write a document and hand it to you.
It splits the work across three isolated reviewers, each defined by what it produces and what it is forbidden to do, and the thing it hands you first is a list of what it had to guess.

This page explains that mechanism and why it is built this way.
You do not need any of it to use the plugin.
Read it if you want to know what a draft's assumptions list is worth before you trust one.

The plugin calls these reviewers **chairs** in its own files and in this page, because that is the word you will see if you open `agents/` or the reference material.
Reviewer and chair mean the same thing here.

## What has actually been run

The loop has been run end to end once: the run that produced this page.
Before that it was exercised twice by hand, in pieces.
One of those ran against documentation whose steps had already been tested; the other ran against a recipe.

Most of what follows is therefore design rather than measurement.
The shape of the mechanism is real and it is in the repository.
Its runtime behavior, including whether runs converge as quickly as the design expects and what a document actually costs to produce, is predicted and not yet observed.
The [self-assessment in the README](../README.md#what-would-improve-it-most) is the set's standing record of that gap, and this page sits on the same side of it.

## The three chairs

Each chair is a subagent with its own contract.
The contract says what the chair writes and what it may not do.
Both halves carry weight differently: a rule in a constitution is a request, and a tool the chair was never granted is a guarantee.

### The authority chair

Holds what is true about the subject.
It writes the **packet**: a cold, prose-free statement of the model, the claims, the causal chains, the constraints, the rationale, the misconceptions readers arrive with, and what is not known.

It may not comment on prose.
Not word choice, not structure, not heading case, not tone.

### The continuity chair

Represents the rest of the documentation set, which is the thing neither of the other two is looking at.
It changes example values, naming, and sequencing so a reader crossing several pages meets one coherent set, and it watches whether the set's stance holds.
It records every change in a substitution list.
On this page's own run, its largest finding was a naming collision: one word already meant something else to readers elsewhere in the docs.

It may not assert facts, and it may not shape prose, pick a content type, or decide architecture.
Any substitution that could change behavior goes back as a question instead of being applied, because harmonizing a value across two pages is a correctness loss when the two products genuinely differ, and that failure stays invisible until someone runs the commands.

### The advocate chair

Represents you, the reader.
It owns content type, information architecture, links, and style, and it turns the packet into the document.

It may not assert what is true, and it may not soften a limit into a suggestion.
If the packet says something cannot be done, the document says it cannot be done.

Two of the three are adversarial: authority and advocate pull against each other by design.
Continuity is not a third opinion on this document, and it is not adversarial with either.
Three chairs is not three opinions merged into a consensus, and resolving the tension would be the failure rather than the goal.

An expert working alone ships material that is correct and unreadable.
A writer working alone ships material that is clear and subtly wrong.
Pairing the two opposed failure modes is what catches what either would miss on its own, and a single reviewer asked to do both averages them into mush.

## Why they run apart

The obvious objection to this design is that one model wrote the thing and then graded its own work, so the check is theater.
The loop is built against exactly that objection.

The chairs run as separate subagents in separate contexts, and they communicate by writing files.
The advocate chair receives the packet and the substitution list.
It never receives the authority chair's reasoning, which is what guarantees that anything it adds originates with it: it had no other source to take it from.
The authority chair, in return, is shown only the ledger entries routed to it and never the draft, because reading prose pulls a reviewer toward commenting on it.

Sequential roleplay in one conversation was considered and rejected for this reason.
A context that produced the packet knows things it never wrote down, and it cannot reliably tell which of its own claims came from where.

Every artifact is a file, and the main conversation passes paths rather than contents.
That keeps the conversation's context flat no matter how large the document gets, and it makes a run resumable and every intermediate step inspectable after the session ends.
The working artifacts live under `.docs-assist/loop/`, alongside the plugin's other [bookkeeping](../README.md#what-it-writes).

## The packet

The packet is the authority chair's artifact, and it is deliberately not prose.

It contains no transitions, no motivation, no audience address, no hedges, no editorializing headings, and no analogies.
Analogies are excluded on purpose, from both packet schemas: an analogy is a factual claim that two things are alike, wearing a teaching costume, so it must be proposed by the advocate chair and approved by the authority chair, in that order, and never smuggled in as raw material.

A packet is closer to a parts list than to a first draft.
The comparison breaks in one important place: a parts list only inventories, while a packet also states causes, rationale, and what the reader probably believes that is wrong.

Warming the packet up into readable prose is the one reliable way to break the loop, because the ledger is defined against what the packet omits.

Two rows carry most of the weight:

1. **Known misconceptions.** What the reader arrives believing, then what is actually the case.
   This is the row only a teacher produces, and it is the highest-value row in a concept packet.
1. **Typed provenance.** Every claim group is labeled as a code reference, an external source, or subject matter expert experience.
   A required citation column was rejected, because it forces the authority chair to either fabricate a source or refuse to state material that has no citable one.

The packet is also designed to be filled in by a person.
A packet a human wrote and a packet the authority chair emitted are the same artifact, and nothing downstream can tell them apart.
`/docs-assist:draft` is the loop with you seated in the authority chair.

## The ledger

The ledger is everything in the draft that has no antecedent in the packet.

It is a set difference, not a self-report.
The advocate chair does not introspect about what it thinks it assumed.
It compares two artifacts and lists what appears in the prose and not in the packet, which means entries are produced by construction rather than by recall.
An earlier version of the design did ask the chair to report its own assumptions, and that was rejected as unreliable: language models are not accurate self-reporters.

Entries are typed, and the type decides whether an entry is worth an expert's attention.

| Entry type           | What it is                                      | Goes to the authority chair |
| -------------------- | ----------------------------------------------- | --------------------------- |
| Connective prose     | Topic sentences, transitions, bridges           | No                          |
| Pedagogical ordering | Teaching one thing before another               | No                          |
| Link or relation     | A pointer to another page                       | Low priority                |
| Audience calibration | Assuming what the reader already knows          | Yes                         |
| Structural claim     | Ordering or dependency the packet did not state | Yes                         |
| Implied fact         | A gap filled with something plausible           | Always                      |
| Analogy              | A teaching comparison                           | Always                      |
| Simplification       | A caveat dropped for clarity                    | Always                      |

Implied facts are the reason the ledger exists.
A fluent writer fills a gap with something that reads exactly like the sourced sentences around it, which is why nobody catches it in review.
Analogies always route as well, and the authority chair signs off specifically on **where the analogy breaks**, because that is the part that belongs in the document.
Simplifications always route so that a caveat dropped for clarity becomes an approved loss rather than a silent one.

Style, word choice, heading case, and formatting never enter the ledger.
Those belong to the advocate chair, and routing them would turn the loop into two agents arguing about commas.

The authority chair returns one of three verdicts on each routed entry: **confirmed**, **corrected**, or **unknowable**.
A correction must carry a citation: a file and line, a commit, an external source, or an explicit statement that it is the chair's own experience.
An uncited correction is not applied and becomes a question for you instead, because neither chair holds ground truth and two agents can agree confidently and both be wrong.

## What you actually review

The finished document is a by-product.
The stated deliverable is `questions.md`: a short list of what genuinely needs a person, with the context attached.

That choice is about your attention, not about the writing.
Four questions with context is a ten-minute task an expert will finish.
A full draft review is a task that sits in a tab.

This is the same division of labor the contributor guide describes when it says to [review for accuracy, not style](write-docs-with-docs-assist.md#review-for-accuracy-not-style).
The loop is what makes that division mechanical instead of aspirational: the questions reaching you are the ones the chairs could not settle between them.

## Passes, and when the loop stops

A pass is one round of the authority and advocate chairs.
Continuity is not on that cycle: it runs at pass 0 and again when you prepare to merge.
Each chair loads its shared rules, its own contract, and one rulebook for the current pass.

The pass number selects the rulebook, and that is the entire implementation of escalation.
Nothing about tone changes between passes.
Telling a model to be grouchier was proposed and rejected: a model told to be grouchy writes grouchy prose, it does not read more carefully.
Selecting a stricter rulebook produces finer findings instead, and it caps the cost of each spawn, because a pass-1 run never loads the pass-3 rules.

The loop ends on whichever of these comes first:

1. **An empty pass.** A pass that produces nothing at or above its threshold is a successful pass and ends the run.
   No minimum finding count, no target, and no quota apply, and a finding that exists only because someone was looking for it is not a finding.
   One bad finding costs more trust than silence, because a reader who gets one starts discounting the good ones.
1. **An oscillation.** A pass that reverses the previous pass's change stops the run immediately.
   A reversal is not a defect in the loop.
   It has located a judgment call neither chair can settle, which is precisely where your scarce attention belongs.
1. **The pass cap.** Three by default, four at maximum, and the fourth is off.

More passes do not produce a better document.
In the one by-hand run against documentation whose steps had already been tested, pass 1 found nothing, and that null result was read as the validating signal rather than as a wasted pass.

Shape is decided twice, at pass 0 and again at pass 1, and it is the only thing decided twice.
The first round of correctness verdicts can invalidate the original shape call, because a correction that removes half a procedure changes what the document should have been.

## Casting

Before the first pass, the document is cast on two axes: where the truth lives, and what the reader needs.
The cast selects which packet schema is loaded and which persona the chairs are briefed with, and nothing else.
The contracts do not change with the cast, and the casting matrix is not a content-type taxonomy: [content types](../skills/docs-assist/reference/content-types.md) are a separate thing, and the advocate chair owns the choice.

Exactly one re-cast is allowed per document.
The pass counter resets and the authority chair re-emits the packet in the new shape.
A second re-cast request goes to you.

Material that needs two casts is two documents.
That rule replaced a heuristic about size and story count, because it is falsifiable and the heuristic was not.

## What the loop is not

1. **Not a review step applied to a finished document.** Pass 0 is production.
   The loop writes the document.
1. **Not a prose polisher bolted on at the end.** The advocate chair owns the content type and the information architecture from the start.
1. **Not a linter.** Everything a script can decide runs before any chair and briefs it.
   The chairs are spent on what a script cannot decide.
1. **Not a way to remove you from documentation.** The output is a question list.
   The packet is built to be human-fillable, and `/docs-assist:draft` is the loop with a person in the authority chair.
1. **Not free.** Three passes at two or three chairs each is up to nine subagent runs for one document.
   Cost is the design's main practical objection to itself, and it is not settled.

Two things sit outside the pass sequence.
[`/docs-assist:merge-prep`](command-reference.md#docs-assistmerge-prep) is a separately invoked gate over the whole set rather than a step in any document's run, and the continuity chair runs at pass 0 and again there rather than on every pass.
`/docs-assist:audit` is the same mechanism pointed at an existing document instead of a new one.

## Related reading

1. [Write Docs With Docs Assist](write-docs-with-docs-assist.md): what using the plugin looks like from your side, including what to bring and what to check.
1. [Command reference](command-reference.md): every command, its argument, and an example.
1. [Docs Assist 1.0 release plan](1.0-release-plan.md): the maintainer-facing build order for this design, written in the future tense as a plan rather than a description of what runs today.
