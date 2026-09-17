---
description: "Get a docs change ready to merge: whole-set generation, linting, link and drift checks, in one deliberate pass you ask for"
---

# Get the docs ready to merge

Everything expensive that scales with the whole docs set runs here, and nowhere else.

Routine workflows do not do this.
A single content fix should not trigger a regenerate-and-diff pass over an eleven-file bundle, and a plugin that spends a project's money without being asked is a plugin people turn off.

Run this when the contributor says some version of "let's get this ready to merge."
Offer it when a multi-file change is finishing and they have not asked, once, in one line.

## What runs here

Skip any step the project has not set up. Say what you skipped and why.

1. **Whole-set continuity.** Run `chair-continuity` over the changed set, not one document: examples that cohere across a journey, values that match the registry, and stance that holds. See `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/chairs/continuity/contract.md`. A page can be perfectly consistent the day it ships and be the odd one out a month later, which is why this runs on the set rather than on what changed.
1. **`llms.txt` and `llms-full.txt`.** Bring them current with the docs as they now stand. `reference/llms-txt.md` has the format, the ordering, and the altitude test for what belongs inline against what belongs behind a link. Only the link list and ordering are derivable: the authored conclusions are editorial judgment and stay authored.
1. **Bundle drift**, when the project keeps a hand-maintained bundle: `node ${CLAUDE_PLUGIN_ROOT}/assets/ci/bundle-drift.mjs`. Reverse drift is the one that catches a duplicated block spliced into a fence.
1. **The deterministic checks**, across the set rather than the diff: `example-continuity.mjs`, `file-path-check.mjs`, `duration-check.mjs`, `check-facts.mjs`, `check-claims.mjs`.
1. **The configured linters**, per `lint.tools` in `.docs-assist/config.yml`.
1. **Link check**, internal and external, when the project has it configured.
1. **Site metadata**, when the project has a site generator: navigation generated from the docs' own metadata, and structured data where the generator renders it. Offered, never imposed.
1. **Open questions.** Read `.docs-assist/loop/*/questions.md` and `.docs-assist/state/docs.yml`. Anything unresolved that the change depends on is a merge blocker; anything unresolved that it does not is a note for the pull request description.

## Trust signals

If the changed docs carry claims about things that decay (a vendor's behavior, a version, an external service), this is the moment to offer a freshness signal, with the benefit stated plainly: it is how a reader decides whether to trust the page, and how a retrieval system decides whether to cite it.

Offer it. Add it on a yes. Never write it unasked, and never make it a step the contributor has to decline.

## Report

One summary, in this order:

1. What was regenerated.
1. What the checks found, or that they were clean. A clean run reported as clean is the useful outcome, not a missing finding.
1. What is blocking, if anything.
1. What was skipped, and why.

Then offer the pull request description, per `reference/pr-descriptions.md`.

## What this is not

Not a quality gate that has to pass before anything else can happen.
Not something that runs automatically at the end of an unrelated workflow.
Not a substitute for the loop: this checks that a set is consistent and current, and says nothing about whether any document in it is true.
