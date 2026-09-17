# The authoring loop

The loop is how a document gets written and reviewed.
Three chairs, each in its own context, passing artifacts by path.

Load this when orchestrating: casting a document, running a pass, deciding whether to stop, or handing something back to the contributor.
The chairs themselves do not load this file. They load their own contract, the shared rules, and the one rulebook for the current pass.

## The three chairs

| Chair          | Produces                     | Never does                              |
| -------------- | ---------------------------- | ---------------------------------------- |
| **Authority**   | The packet, then ledger verdicts | Comments on prose                        |
| **Continuity**  | Substitutions and reuse pointers | Asserts facts, or shapes prose          |
| **Advocate**    | The document and the ledger  | Asserts what is true                     |

Two of them are adversarial and one is not.
The authority and advocate chairs are in productive tension over the same document.
The continuity chair is not arguing with either: it represents everything outside the document, which neither of the other two is looking at.

## Why they run in separate contexts

This is the load-bearing decision, not an optimization.

If the chairs are sequential roleplay inside one conversation, the ledger is theater.
A context that produced the packet has already seen the reasoning behind it, so "this claim has no antecedent in the packet" becomes unverifiable: the model knows things it never wrote down and cannot reliably tell which of its own claims came from where.

Separate contexts make the boundary real.
The advocate chair genuinely receives only the packet, so anything it adds genuinely originates with it.

## Artifacts are files

Chairs read and write files. The orchestrator passes paths, never content.

```text
.docs-assist/loop/<doc-slug>/
  packet.md          authority chair
  substitutions.md   continuity chair
  draft.md           advocate chair
  ledger.md          advocate chair
  review.md          authority chair's verdicts
  questions.md       accumulated, for the human
```

If every artifact came back as a return value, the orchestrator would accumulate all of them in the main conversation, which defeats having isolated the work.
Paths keep main-thread context flat regardless of document size, make the loop resumable across sessions, and make every intermediate step inspectable, which is most of how anyone debugs this.

The packet is the durable artifact.
Prose gets rewritten; steps, commands, and citations survive. Keep it after the document ships.

## The order of a run

1. **Cast.** Place the document on the two axes and seat the chairs. See `casting.md`.
1. **Run the deterministic checks first.** Anything a script can decide should not cost a chair a pass. Brief the chairs with what the scripts found so they spend their passes on judgment.
1. **Pass 0, authority.** Emit the packet. Cold, cited, prose-free. See `packet-procedure.md` or `packet-concept.md`.
1. **Pass 0, continuity.** Reconcile the packet against the rest of the set. Emit substitutions and reuse pointers.
1. **Pass 0, advocate.** Shape it. Emit the draft and the ledger.
1. **Pass N, authority.** Review the ledger entries that route to it. Confirm, correct, or mark unknowable.
1. **Pass N, advocate.** Apply corrections, re-emit.
1. Repeat until a stopping condition.

Continuity acts at pass 0 and again at the preparation gate, not on every pass.

## Escalation is rulebook selection

Each pass lowers the threshold for what counts as worth raising.
That is implemented by which file the chair loads, not by telling it to be stricter.

| Pass | Authority loads          | Advocate loads          |
| ---- | ------------------------ | ------------------------ |
| 0    | a packet schema          | `pass-1-shape.md`        |
| 1    | `pass-1-correctness.md`  | `pass-1-shape.md`        |
| 2    | `pass-2-assumptions.md`  | `pass-2-clarity.md`      |
| 3    | `pass-3-misleading.md`   | `pass-3-precision.md`    |

Every chair also loads its own `contract.md` and `chairs/shared-rules.md`, every pass.

Pass 0 is production, not review, which is why the two columns disagree there.
The authority chair has nothing to review yet, so it loads a packet schema instead of a rulebook.
The advocate chair is making shape decisions for the first time, so it loads the shape rulebook and loads it again at pass 1, when it revisits those decisions against the authority chair's first verdicts.

That repetition is deliberate.
Shape is the only thing decided twice, because it is the only thing where the first pass of feedback can invalidate the original call: a correction that removes half a procedure changes what the document should have been.

"More keen-eyed" is a fact about which rules are in context, never a personality instruction.
A model told to be grouchy writes grouchy prose and does not read more carefully.

## Stopping

Three conditions, all required.

1. **Hard cap.** Three passes by default, four maximum.
1. **Convergence.** Stop as soon as a pass produces nothing at or above its threshold. Most documents should stop at pass one or two.
1. **Oscillation.** If a pass reverses a change the previous pass made, stop immediately and hand it to the human.

Oscillation is not a bug. It is the loop correctly detecting a judgment call neither chair can settle, which is exactly where a person's scarce attention belongs.
Apply a materiality threshold so a word swapped back and forth does not trigger it.

Report what the run cost and let the contributor halt it at any pass boundary.

## The real output

Not the polished document. **A short list of what genuinely needs the human.**

`questions.md` accumulates the unknowables, the oscillations, and the relation questions the chairs could not settle.
That is the deliverable: it turns "please review this draft" into "please answer these four questions," and the second is a ten-minute task an expert will actually do.

## Cost

Three passes at two or three chairs each is up to nine subagent runs per document.
Control it in this order:

1. Deterministic checks first, so no pass is spent on mechanical findings.
1. Convergence, which should end most runs early.
1. A single-pass mode for short documents.
1. Fan-out across documents. The loop is sequential within a document and parallel across them.
