# Working journal

The journal is the plugin's scratch pad for a branch: the notes a good writer keeps beside an expert.
What people said, the questions and their answers, the decisions and why, and what ran.
It lives on the contributor's machine, never in a commit, and nobody reads it but the plugin and the contributor.

It is not a deliverable and not a log.
It is the one place the plugin keeps what it would otherwise forget between sessions, between steps, and between people: an expert drafts on Monday, and the writer who picks it up on Thursday starts from the notes, not from a guess.

## Where it lives

`.docs-assist/journal/<branch>.md`, one file per branch.
`node ${CLAUDE_PLUGIN_ROOT}/hooks/journal.mjs path` prints the path and creates the directory.
Run it before the first note on a branch; it also makes sure git ignores every working directory under `.docs-assist/` (see "Nothing is committed unasked" below).

Read the journal at the start of any work on a branch that already has one.
It is what earlier sessions learned, and the reason to keep it at all.

## What it holds

Notes, in plain sentences, under a heading per doc:

```markdown
# restore-docs

## docs/restore-a-snapshot.md

- For on-call ops who didn't set snapkeep up: they know a terminal, not snapkeep. (the on-call lead)
- Retention: the lead first said 7 days; `src/config.js` has 14, but nothing reads that setting. Pruning is a nightly cron job on the backup host, outside this repo. (the on-call lead)
- Does the cron job prune at 14 days? Yes: the lead read the cron config. (the on-call lead)
- Restoring into a new, empty directory and swapping it in is the main path, because `--force` merges instead of replacing.
- The doc said an unlisted id means the snapshot was pruned; `bin/snapkeep:33` gives the same error for a typo or the wrong store. Fixed.
- Ran steps 1 to 5 in a scratch copy (macOS, node 24): all pass after one fix, since `mv data data-old` nests the directory when `data-old` exists. The `sudo systemctl` lines didn't run.
- What does a file-count mismatch mean when the source changed after the snapshot? (with the on-call lead)
```

What belongs:

- **What a person said that the code can't settle**: intent, history, what happens outside the repo, what goes wrong in practice.
  Say whose word it is, by role.
- **Questions**, including the new ones an answer raises.
  The questions are how the doc gets better, so they are worth keeping even when the answer is another question.
- **Answers**, wherever they read best: on the question's line, or as a note of their own.
- **Decisions and why**: who the doc is for, the recommended path, what was left out, a structure a reviewer might question.
- **Disagreements and how they settled**: where a person's memory, the doc, or the code disagreed, and what turned out to be true.
- **What ran**: one line per doc, saying where it ran and what failed or was missing; a rerun replaces it.

What does not belong:

- **Anything the draft or the doc already says.**
  The draft is the source while it is being written; after the write-up, the doc is.
  A note that repeats either one is a second copy waiting to disagree with it.
- **Plain confirmations.**
  "The `--target` flag exists, matches" tells nobody anything.
  A claim that was wrong is worth a line; a claim that was right is what the doc is for.
- **Bookkeeping**: which step ran, how it went (rounds, passes, sections, counts of checks), file paths of working material, status changes.

Branch-wide notes (a decision about the whole change) go under a `## This branch` heading.
A doc that has no path yet goes under `## Draft: <working title>`; the write step renames the heading to the doc's path when it places the doc.

## Keep it from disagreeing with itself

The one thing that matters is that the notes never hold two versions of one fact.
How they get there is a judgment call, not a procedure: there is no need to match every new note against every line.

- **An answer** can go on its question's line or in a note of its own, whichever reads better; once a question is answered, it shouldn't still read as open.
- **A revision** replaces what it revises, when you know the earlier note exists.
  Keep the earlier version only when a reviewer would want it ("the lead first said 7 days").
- **A question that turned out not to matter** is deleted, not marked.

Edit the file directly.
When you read the notes at the start of a step and find two that disagree, settle it the way the next section says and leave one.

## When things disagree

A person says something that doesn't match a note.
A note says the code does one thing and the code now does another.
An earlier turn of this conversation said something the current one contradicts.
Resolve it by what is true now, never by what was written down or said first.

Each source settles different things:

| Source                                   | Settles                                                                      |
| ---------------------------------------- | ---------------------------------------------------------------------------- |
| The code, read now                       | What the software does: commands, flags, defaults, error text, behavior      |
| A person                                 | Intent, practice, history, and anything that happens outside the repository |
| The notes, and earlier in a conversation | Nothing on their own: they record what someone believed when it was written |

So:

1. **The notes are memory, not evidence.**
   Before relying on a note about what the code does, read the code again.
   A note that says a claim was checked is a pointer to where to look, not a reason to skip looking.
1. **When the code settles it, check now and say what it shows.**
   If the note was wrong or the code has changed, fix the note, and fix the doc if it relied on it.
1. **When a person settles it, ask once, with both versions:**

   > "My notes say 7 days, from earlier.
   > You're saying 14 now.
   > Go with 14?"

   A person correcting their own earlier word is the normal case: take the newer answer, and ask only when the change is surprising or the earlier word came from someone else.
1. **When a person and the code disagree, ask, and never overrule.**
   Bring the evidence: the person may know about a bug, or be remembering how it used to work.
1. **Then rewrite the line to what is true**, and carry the change to the draft or the doc if they say otherwise.

Do it in a sentence, without apology or a history of who said what when.
The point is the right answer, not a record of having been wrong.

## Who writes it

You do, from the main conversation.
Subagents don't: brief them to end their report with anything worth noting (a correction, a question, a decision), and you note it.
One writer keeps the file coherent, and you are the one who can tell when a new note revises an old one.

Write as you go: after the expert answers, after a check finds something, after a run, after a decision.
A session can end without warning, and notes reconstructed at the end are the guesswork this replaces.

## Rules

- **Roles, never names.**
  Write "the platform lead" or "the support engineer who reported it," never a person's name or handle, even when the contributor uses one.
- **Write for the next session.**
  A note should make sense to someone who wasn't there, including a later you with none of this conversation.
- **Never quote the journal in anything that ships.**
  A pull request description is written from it, in its own words, without its path or its existence.

## Nothing is committed unasked

The plugin delivers documentation and otherwise stays out of the repository.
The journal, drafts, plans, reports, intake material, and claim-check output all live under `.docs-assist/` in directories git ignores: each one holds a `.gitignore` containing `*`, which hides the directory and the ignore file itself, so the project's own `.gitignore` never changes and `git status` stays clean.
`journal.mjs path` and the plugin's edit hook both add those files.

The project's rules (`config.yml`, `style.md`, `reference.yml`, `personas/`) sit beside them, and stay out of git too unless the contributor chose at setup to share them (`journal.mjs rules shared`).

The same rule covers the docs themselves: the plugin never leaves notes in them.
No metadata it invented, no commented-out reminders, no markers for its own use.
The one comment worth committing is the one a maintainer needs, saying that a section is duplicated in another doc and that a change here belongs there too.

## After the branch merges

Merge-prep also offers to clear the working drafts behind docs the branch placed (`journal.mjs drafts`, then `journal.mjs clear-draft <name>`), since the docs are the source from then on.

When a health check or merge-prep runs, `journal.mjs merged` lists journals whose branches are merged into the default branch.
Offer once to clear them, and clear each with `journal.mjs clear <branch>` on a yes.
Never clear the current branch's journal, and never clear one unasked.

## Turning it off

`journal: false` in `.docs-assist/config.yml`, or `DOCS_ASSIST_JOURNAL=0` in the environment.
With it off, keep no notes and say nothing about it.
Working material stays out of git either way.

## Limits

- Each contributor's journal holds only their own work.
  Two people on one branch keep two journals on two machines.
- Without git, the journal still works under the name `local`.
