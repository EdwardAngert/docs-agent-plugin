# User Story Outlines

A doc serves a reader on a journey, and most doc defects are invisible until you name that reader: a "complete" reference that strands a beginner, a polished tutorial nobody can find from where they actually start, a troubleshooting entry that resolves the error but not the task the reader was in the middle of. The story outline makes the reader explicit so drafting can aim at them and audits can test against them.

This is the quick, per-doc version. It is not the plan-level journey map (`/docs-assist:plan` builds that across the whole set) and not persona research (`audit-methodology.md` defers that to work with real users). One to three lines, written in minutes, kept with the working material.

## The Shape of a Story

One line per story, four parts:

> **A [role, with what they already know] arrives [from where] to [do what], and is done when [observable outcome].**

- A backend developer who has API keys already, arriving from the quickstart, wants to configure webhook retries, and is done when a failed delivery visibly retries.
- A support engineer mid-incident, arriving from a search for the error text, wants to identify which retry setting is misfiring, and is done when they can name the fix or escalate with specifics.

Most docs carry one to three stories. More than three is the "one doc or several?" signal from the shape move: each extra reader is diluting every other reader's doc.

## Calibrate the Baseline, Don't Assume It

"With what they already know" is the part of the story that goes wrong by default, in both directions: explaining a terminal to someone who already runs one all day is the expert tax, and skipping a step because "everyone knows that" is the assumption gap. Neither comes from thinking about the reader; both come from writing at a fixed posture (always beginner-friendly, or always assuming fluency) instead of reading the actual signals.

Read the baseline from evidence, in order of how reliable it is:

- **What the project's own docs already assume.** If the README shows `cargo add x` with no explanation of Cargo, or `kubectl apply -f` with no explanation of kubectl, the project has already drawn the line: match it, don't redraw it lower. An existing docs set's assumed baseline is the strongest signal available, because it is the convention the contributor already chose.
- **What the tool is.** An SDK, an API, a CLI plugin, an infrastructure or platform tool implies a practitioner audience before a single word is written: they installed a language toolchain, a package manager, a cloud CLI, or all three, just to get this far. A consumer application, a tool explicitly aimed at non-engineers, or a first-touch onboarding flow implies otherwise. The tool's own nature is evidence; use it before defaulting to anything.
- **What the surrounding ecosystem assumes.** A doc for a Rust crate inherits Rust's own baseline (ownership, `cargo`, `crates.io`); a doc for a Kubernetes operator inherits Kubernetes' baseline (`kubectl`, manifests, namespaces). Do not re-teach the ecosystem the reader already had to learn to get here.
- **What the dig actually revealed.** The intake loop's dig already asks "usage and audience" (`intake.md`); when the project offers no signal and the dig didn't resolve it, that is the moment to ask, not to guess or to default to teaching the basics "just in case."

Calibration is not a single global setting for the whole project (`tone-and-voice.md`'s "developer or technical admin" is a floor, not a ceiling): a platform's admin CLI and its embeddable widget can have entirely different baselines in the same repo. Set it per doc, from that doc's own story.

Once set, the baseline does two concrete things to the draft, not just the tone:

- **Prerequisites list only what sits outside the baseline, but a version or compatibility fact is never padding.** An SDK for backend engineers doesn't need "install Node" (how to get the runtime is inside their baseline); it does need "requires Node 18+" (that specific fact is not something the baseline implies, and getting it wrong breaks the reader). The line is teaching versus stating: don't teach what the baseline covers, but never drop a fact the reader has no other way to know just because it's short.
- **Failure modes anticipate what that reader actually hits.** The dig's failure-modes question (`intake.md`) should be answered for the calibrated reader, not a generic one: an expert audience trips on edge cases, version mismatches, and interactions with other advanced tools; a beginner audience trips on setup and terminology. The same tool can need both, in different docs, for different stories.

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
