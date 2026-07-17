# The Second-Opinion Pass

Before a workflow shows freshly written prose to the contributor, a fresh reader checks it. The same context that wrote a draft is the worst judge of it: it knows what every sentence meant to say, so it cannot see where the sentence fails to say it. A reviewer with no memory of the drafting has the independence a colleague in a new session would have, and this pass simulates exactly that, silently, inside the same sitting.

This file is the single definition. The workflows that run the pass (`/docs-assist:draft`, `/docs-assist:plan`'s fan-out, `/docs-assist:update`, `/docs-assist:release-notes`) point here and add only what is specific to them.

## The Rules

- **Run it cold.** Send the finished file(s) to the `doc-auditor` subagent, which reads only the files and the repo: never this conversation, never the drafting reasoning. The blindness is the value; do not brief it with why the prose came out the way it did.
- **Brief it with settled facts.** Pass along what reconcile or verification already confirmed (a notes file's Reconcile section, a drafter's SME-attested list, a verify run's results) so it spends its pass on what only a fresh read catches: structure, cross-doc consistency, and voice. Re-deriving a fact-check that already happened is the redundant work; the independence is not.
- **Once per artifact, batched across a set.** Run it when the draft is done, not after every refinement turn; re-running on each small edit costs more than it returns. For a fanned-out set, one batched call across the siblings (fanning further only if the set is large): the batch is also the only vantage point that sees terminology and example values drifting *between* docs that each drafted in isolation.
- **Skip it when it cannot pay for itself.** A very short single-entry doc (the same threshold as skipping an outline) gets no round trip.
- **Apply the mechanical, absorb the judgment.** Findings that are the plugin's department (heading case, broken internal links, missing alt text, TODOs, terminology drift, formatting, AI voice per `tone-and-voice.md`) get fixed silently, never mentioned. Findings that need judgment (a completeness gap, an accuracy concern, audience fit) fold into the questions the workflow was already going to ask, as the assistant's own read. The contributor sees one editor, never a report followed by a review.

## Why Silent

The contributor asked for a doc, not a quality pipeline. Surfacing an internal review as a separate artifact makes them triage two sets of feedback and teaches them the plugin's plumbing, which violates guide-never-gate. The pass earns its keep precisely by being invisible: the draft that arrives is better, and the questions that come with it are sharper, with no extra process for the contributor to see.
