# User Story Outlines

A doc serves a reader on a journey, and most doc defects are invisible until you name that reader: a "complete" reference that strands a beginner, a polished tutorial nobody can find from where they actually start, a troubleshooting entry that resolves the error but not the task the reader was in the middle of. The story outline makes the reader explicit so drafting can aim at them and audits can test against them.

This is the quick, per-doc version. It is not the plan-level journey map (`/docs-assist:plan` builds that across the whole set) and not persona research (`audit-methodology.md` defers that to work with real users). One to three lines, written in minutes, kept with the working material.

## The Shape of a Story

One line per story, four parts:

> **A [role, with what they already know] arrives [from where] to [do what], and is done when [observable outcome].**

- A backend developer who has API keys already, arriving from the quickstart, wants to configure webhook retries, and is done when a failed delivery visibly retries.
- A support engineer mid-incident, arriving from a search for the error text, wants to identify which retry setting is misfiring, and is done when they can name the fix or escalate with specifics.

Most docs carry one to three stories. More than three is the "one doc or several?" signal from the shape move: each extra reader is diluting every other reader's doc.

## How Drafting Uses It

Write the stories at the Shape move, from what the dump and the dig already surfaced (the audience and usage questions are the raw material), and show them with the outline: stories are cheap to correct at outline time and expensive to discover wrong after publication. Then let them earn the structure: each section justifies itself by serving a named story, the prerequisites section is whatever the least-prepared story's reader is missing, and the doc ends where its stories end (the "done when" plus the next step each reader takes). Record them in the notes file's Shape section when one is in use, and in a fan-out, the plan entry carries each doc's stories into the drafter's brief.

## How Audits Use It

Walk each story through the doc, end to end, and report where the journey breaks:

- **Arrival**: can this reader get here from where the story says they start? A search for the error text, a link from the doc upstream in the journey, a nav entry where they'd look.
- **Entry**: does the doc meet them at their stated knowledge, or does it assume what they don't have (the assumption gap) or re-teach what they do (the expert tax)?
- **Path**: can they follow it to the goal without leaving? Every fork they hit is either handled or explicitly routed elsewhere.
- **Exit**: does the doc tell them they succeeded (the observable outcome) and what comes next in their journey?

A doc whose stories cannot be inferred from the doc itself is a finding before any walking starts: if a cold reader cannot tell who a doc serves, neither can the reader it was written for. This makes the check natural for `doc-auditor`, which reads cold by design; infer the stories from the doc and the docs around it, walk each one, and flag both broken journeys and the un-inferable-reader case.

For a change-based audit, the walk is scoped: only the stories whose journeys pass through the changed docs, per `impact-analysis.md`.
