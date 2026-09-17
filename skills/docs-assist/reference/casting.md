# Casting the chairs

A subject matter expert and a technical writer are the right pair for a procedure.
They are the wrong pair for a page explaining why a system works the way it does.

Casting happens before pass 0 and decides which roles get seated.
Load this when starting a run, or when a chair reports that the cast looks wrong.

## The two axes

1. **Where does the truth live?** In the system's observable behavior, or in the domain's concepts.
1. **What does the reader need?** To complete a task, or to understand something.

|                     | Reader must do                 | Reader must understand               |
| ------------------- | ------------------------------ | ------------------------------------ |
| Truth in the system | SME and technical writer       | SME and instructional designer       |
| Truth in the domain | Professor and technical writer | Professor and instructional designer |

How-to and troubleshooting pages land top left.
Tutorials land top right, because a tutorial is a procedure in the service of learning.
Concept and explanation pages land bottom right.
The bottom left cell is real and uncommon: implement-this-correctly material, where the authority is theoretical and the output is still a task.

## What the pairs trade

The SME and writer pair trades truth against clarity.
The professor and instructional designer pair trades depth against learnability, which is not the same problem and is why reusing the first pair on a concept page fails.

A professor's failure mode is teaching at their own level and digressing into what is interesting rather than what is needed.
An instructional designer contributes prerequisite sequencing, cognitive load, and knowing when an analogy helps and when it quietly lies.

## What casting changes

Only two things:

1. **Which packet schema the authority chair uses.** `packet-procedure.md` or `packet-concept.md`.
1. **The persona brief both chairs are given.**

The contracts do not change.
A professor and an SME are the same role with a different brief: emit a cold packet, never touch prose.
An instructional designer and a technical writer are the same role with a different brief: shape the material, never assert facts.

This is why there are two chair definitions and not four.

The continuity chair is not cast at all.
It represents the rest of the documentation set, which does not change with the shape of one document, so it has one contract and no variants.

## Reference material is the exception

Reference pages (API tables, configuration keys, CLI flags) are where this loop earns least.
Their failure modes are completeness and consistency, which generation and mechanical checks serve better than two agents talking.

Cast reference material only when there is a specific reason to, and prefer the deterministic checks otherwise.

## Re-casting

The advocate chair may conclude at pass 1 that the cast was wrong.
The common case is something framed as a how-to that is really a concept page with steps attached.

Allow exactly one re-cast.
The authority chair re-emits its packet in the new shape, and the pass counter resets.
A second re-cast request goes to the human instead.

## Two casts means two documents

This is the falsifiable version of "know when one is many."

If the material needs two different casts, it is two documents.

A request to explain how authentication works and how to set it up wants a professor and an SME.
That is the signal to propose a concept page and a how-to rather than one page doing both badly, and it is a better test than counting user stories or judging the size of a dump.
