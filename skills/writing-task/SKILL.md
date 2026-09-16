---
name: writing-task
description: "Invoke when a task involves writing or revising prose that other people will read, even when nobody called it documentation: a pull request description, release notes, a changelog entry, a README, a runbook, a migration guide, an error message, or any doc. Routes to the Docs Assist capability that fits, and says plainly when the plugin has nothing useful to offer for this particular kind of writing."
---

# This Looks Like a Writing Task

Docs Assist is installed. This skill exists to notice that, and to point at the part of it that fits.

It is a routing table, not a workflow. Read it, take the one line that applies, and go.

## Why This Exists Separately

The main `docs-assist` skill describes itself in terms of *technical documentation*, so a request like "write the PR body" or "update the changelog" does not match it. The plugin then sits there, fully able to help, and never loads.

That is a phrasing problem, not a capability problem. This skill is the wider net.

## Where to Go

| The task | What to use |
| --- | --- |
| Write or revise a doc | Load `docs-assist` and run the authoring loop. `reference/loop.md`. |
| Review docs that already exist | `/docs-assist:audit`. An audit is the loop pointed at a finished doc. |
| Check a procedure still works | `/docs-assist:verify`. It executes the steps rather than reading them. |
| A pull request description | `docs-assist`, `reference/pr-descriptions.md`. Includes when to structure by file or area instead of by commit. |
| Release notes or a changelog entry | `/docs-assist:release-notes`. Leads with breaking changes and upgrade steps. |
| A README | The authoring loop, cast as a procedure. Usually also the highest-leverage first doc for a bare repo. |
| A runbook or an incident procedure | The authoring loop, then `/docs-assist:verify` to prove the steps run. |
| Docs the code change just broke | `/docs-assist:update`. |
| Getting a docs change ready to merge | `/docs-assist:merge-prep`. |
| "Where do our docs even stand" | `/docs-assist:health`. |

Whatever the task, two things always apply: the style stack in `docs-assist`'s `reference/style-stack.md`, and the rule that a file the reader must edit is named by full path on the block itself.

## What This Plugin Does Not Cover

Say so. Do not stretch.

Nothing here helps with commit message subjects, docstrings or in-source API reference, architecture decision records, or user interface copy. Those are writing, they are adjacent, and the plugin has no method for them. Offering a documentation workflow for a docstring wastes the contributor's turn and spends the credibility that makes the real catches land.

**Finding nothing is a successful outcome.** If the task is writing but none of the rows above fit, say the plugin has nothing for this and get out of the way. The same rule the chairs work under, for the same reason: a router that needs to route will route badly.

## How Loudly to Say It

Once, in one line, inside whatever you were already going to say. Not a banner, not a separate turn, not a second time in the same session for the same task.

If the contributor declines, drop it for the session. A suggestion made twice is an interruption.
