# The Ledger

Everything in the draft that has no antecedent in the packet.

Written by the advocate chair to `.docs-assist/loop/<doc-slug>/ledger.md`, reviewed by the authority chair.

## It Is a Diff, Not a Self-Report

This is the distinction the whole loop rests on.

The advocate chair does not introspect about what it thinks it assumed.
It compares two artifacts: the packet it was given, and the prose it produced.
Any claim in the prose that cannot be traced back to a line in the packet is a ledger entry **by construction**.

Self-reporting would depend on a model accurately recalling its own reasoning, which is not reliable.
A diff does not.

This only works because the packet is prose-free. See `packet-procedure.md`.

## Entry Types

Additions are not equally risky, and an expert's attention should not be spent uniformly.

| Type                  | Example                                                  | Routes to authority |
| --------------------- | --------------------------------------------------------- | -------------------- |
| Connective prose       | Topic sentences, transitions, section bridges             | No                   |
| Pedagogical ordering   | Teaching A before B                                       | No                   |
| Link or relation       | "See also the authentication concept page"                | Low priority         |
| Audience calibration   | Assuming the reader already knows containers              | Yes                  |
| Structural claim       | "This is a prerequisite", "do this before that"           | Yes                  |
| Implied fact           | "Because the daemon restarts, you need to re-authorize"   | Always               |
| Analogy                | "Think of it like a mailbox"                              | Always               |
| Simplification         | A caveat dropped for clarity                              | Always               |

## The Four That Always Route

**Implied fact** is the dangerous category and the reason the ledger exists.
It is where a fluent writer fills a gap with something plausible, and it is invisible in a finished draft because it reads exactly like everything around it.

A worked example: a packet says "2 cups of rice" with a 1.25:1 water ratio, a 20 minute simmer, and a 15 minute rest.
Any competent writer writes "long-grain white rice," because the ratio demands it.
The expert never said it, it is almost certainly right, and a reader holding brown rice gets crunchy rice.

**Analogy** is a factual claim that two things are alike in some respect, wearing a teaching costume.
It is where conceptual writing goes wrong most often.
The authority chair signs off on every analogy, and specifically on **where it breaks**, which is the part that belongs in the document.

**Simplification** is a caveat dropped to reduce load.
The advocate chair will frequently be right to drop it. Putting it in the ledger turns a silent loss into an approved one.

**Structural claim** covers ordering and dependency the packet did not state.
"Drain the rice before adding it to hot oil" is a structural claim, it is correct, and nobody said it.

## Verdicts

The authority chair marks each routed entry:

1. **Confirmed.** True as written. Becomes prose, no further action.
1. **Corrected.** Wrong or imprecise, with the correction stated. Becomes a prose change on the next pass.
1. **Unknowable.** Cannot be settled from available evidence. Becomes either an explicit caveat in the document or an entry in `questions.md`.

**An uncited correction is not a correction.**
The authority chair must cite repository evidence, an external source, or explicitly mark the verdict as its own experience.
An unsupported assertion becomes a human question rather than an applied edit, because neither chair holds ground truth and two agents can agree confidently and both be wrong.

## What Does Not Belong Here

Style, word choice, heading case, and formatting.
Those are the advocate chair's own business, and routing them to the authority chair is how the loop turns into two agents arguing about commas.
