# House rules

Every workflow reads this before anything else, and these rules hold in every message it sends.
They live here, not in each workflow, because a workflow started by its command never sees `SKILL.md`.

## Run a step by its workflow

Drafting, writing up, and editing a doc are separate steps, each with its own workflow.
When the work is one of them, load that workflow with the Skill tool (`docs-assist:draft`, `docs-assist:write`, `docs-assist:edit`) and follow it, even when the contributor asked in plain words ("write it up", "check this page").
Never do a step inline.
A doc written inline skips the separate writer and the questioning of what it added, which is how invented details reach a page.

## Plain words in every message

What the contributor reads names no part of the plugin's machinery: not in the closing summary, and not in a one-line progress update either.

| Not this                                      | This                                                       |
| --------------------------------------------- | ---------------------------------------------------------- |
| packet                                        | the draft                                                  |
| ledger, ledger entries                        | what the write-up added                                    |
| authority chair, review                       | the reviewer                                               |
| advocate chair                                | the writer                                                 |
| continuity chair                              | a check against the rest of the docs                       |
| pass 0, pass 1, round 2                       | "writing it up", "the first round of questions"            |
| chair fan-out, slices                         | several reviewers, each reading part of the set            |
| `status` values, paths under `.docs-assist/` | nothing: say what happened, or that it's saved             |
| command names                                 | what you'll do: "want me to check it against the code?"   |
| house rules, journal, journal path            | nothing, or "my notes" when the contributor asks          |

## Show where the work is

Any workflow with more than three parts the contributor waits through (a write-up's rounds, an edit's claims and step runs, an audit's reviewers, a plan's stages) shows them as a task list when the session has a task tool (`TaskCreate` and `TaskUpdate`, or `TodoWrite` in older sessions): one task per part, in plain words ("Check the claims against the code", "Run the restore steps"), set up before the first one starts.
Mark each in progress when it starts and done when it finishes, with `TaskUpdate`: a list left unchecked reads as work that never finished.
Claude Code shows the list as a checklist with the current task marked, the nearest thing a workflow has to a progress bar, and shows a spinner while a foreground subagent runs.
Keep the one-line updates too: the list says where the work is, the line says what it found.

## Keep notes

When a workflow learns something a later session would need (a correction, a question, a decision, a failed step), run `node ${CLAUDE_PLUGIN_ROOT}/hooks/journal.mjs path` and note it there, per `journal.md`.
Write the notes before the closing summary, not after it: a session can end the moment the summary is sent.
When that command says the journal is off, keep no notes and say nothing about it.

## Use the project's patterns

Write only frontmatter fields, components, admonitions, data files, and formats the project already uses, or offer to establish a standard for the whole set.
Never introduce one into a single doc on your own judgment.

For a project with a site (a site generator, MDX, or custom components) whose `.docs-assist/style.md` has no `## Markdown` section, offer once, the first time it would help, to write those patterns down, per `markdown-reference.md`.

## Changes to other pages

Fixing one doc often touches another: a link, a renamed label, a corrected value.
When that change rests on someone's word rather than on something you checked, list it in your summary for the contributor to confirm ("I changed the menu label in `troubleshooting.mdx` from Disable to Disable blocking on your word; nothing here confirms it").

## Nothing reaches the repository unasked

Drafts, notes, plans, reports, and check output stay in the directories git ignores, and the docs carry nothing of the plugin's own.
See "Nothing is committed unasked" in `journal.md`.
