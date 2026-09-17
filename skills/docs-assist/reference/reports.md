# Reports

What a run leaves behind, and what it puts on the screen.

Load this when a workflow or a check produces more than a few findings, or when anything writes to `.docs-assist/reports/`.

## The split

**The screen gets the judgment.** What was found, what it means, what to do next, and where the detail lives.
Short enough to read without scrolling.

**The file gets the detail.** Every finding, with evidence, addressable and complete.

A long run that ends in a wall of terminal output has buried its own result.
The person scrolls past it and the next agent never sees it at all, because it was never written down.

## Write for the next agent

A report is read twice: once by the person who ran it, and once by whoever picks the work up, which is increasingly another agent in another session.

The test is concrete.
Hand the report and nothing else to an agent and ask it to act on finding four.
If it has to re-run the check to understand what finding four means, the format failed.

That means each finding carries its own evidence rather than pointing at a run that no longer exists.

Three rules make the difference between a finding that can be acted on and one that sends the reader back to the source.
Each was found by handing a report to an agent that had no access to the repository and watching where it got stuck.

**Quote the literal text, never a paraphrase.**
A finding that says the doc claims "retries default to 5" has told the reader what the line means, not what it says.
If the line actually reads "The default is 5 retries", a search for the paraphrase finds nothing and the fix is either missed or applied to the wrong place.
Quote the line as it is, so the change can be made without opening the file.

**A gap finding carries the material that fills it.**
"Add a step running `acme --version`" is not actionable, because the step needs the output and the report does not have it.
When the fix is to add something, the thing to add goes in the report: the command's real output, the missing value, the sentence that should be there.
Otherwise the reader has to run the tool to write the fix, which is the round-trip this format exists to prevent.

**Say the order.**
A reader should not infer which finding to do first from the identifiers, even though the letters carry the priority.
Name the order, or say that the findings are independent.

## The shape

```markdown
# <What ran>: <what it ran against>

**When**: <date> · **Scope**: <paths, named or listable> · **Ran**: <commands or passes>
**Mechanics**: <which linters ran and what they found, even when clean>

<One or two sentences. Is this in good shape, and what most needs attention.
If nothing does, say that.>

## Findings

### T1. <One line, the claim itself>

**Where**: `path/to/file.md:42`
**Evidence**: <what was checked and what came back, quoted or cited>
**Do**: <the specific change>

### R1. <One line>
...

## Where I looked

<The paths, globs, or commands this run covered, and what it did not.
An absence claim is only as good as its search.

Name the files, or give the glob that lists them. A count is not a scope: a
reader who knows four files were reviewed still cannot tell which four, or
whether the one they care about was among them.

Say which direction a trace ran. Checking that every claim in the docs is
backed by code is a different pass from checking that every behavior in the
code is documented, and a report that does one reads exactly like a report
that did both.>

## Reproduce

<The command that regenerates this.>
```

## Identifiers

Each finding gets a kind letter and a number: `T1`, `R2`, `P3`, `M1`.

The letters are the audit's order, and they carry the priority with them:

| Letter | Kind | |
| ------ | ------------------------------------ | ----------------------- |
| `T`    | Is it true                           | Correctness |
| `R`    | Can a reader get what they came for  | Reachability and cohesion |
| `P`    | Does it read well                    | Prose |
| `M`    | Mechanics                            | Lint, formatting |

An identifier means someone can say "T3 is still open" in a commit message, a pull request, or a handoff, and the next reader knows what that is without opening anything.

Number within a kind, in the order they appear.
Do not renumber across runs to make them line up; a report is a record of one run, and a finding that persists gets discussed by its text rather than by pretending the identifier is stable forever.

## Where reports go

`.docs-assist/reports/<what>-<date>.md`, so a later run can compare against an earlier one.

They are working material.
Commit them for a shared record, or add `.docs-assist/reports/` to `.gitignore` to keep them local.
Either is correct; the plugin offers and does not decide.

Never write one without offering first.

## Deterministic checks

A check that prints a table is already most of the way there.

- Print the summary line and the findings to stdout, because a short check is easier to read inline than to open.
- Write the full report to a file when `DOCS_ASSIST_REPORT_FILE` is set, so a long run has somewhere to put the detail.
- Append to `GITHUB_STEP_SUMMARY` when that is set, which is the same content in the place CI shows it.

A check that finds nothing says so in one line and writes no file.
An empty report is worse than no report, because it looks like a run that failed to record anything.

## What not to do

**Do not transcribe a linter.** If markdownlint found twelve issues, the report says the linters found twelve issues and names the command that lists them. Copying its output into a report turns a mechanical result into what looks like an audit finding.

**Do not omit the mechanics line when it is clean.** A report that lists the linters it ran and then says nothing about them leaves the reader unable to tell whether they passed or whether their output was dropped. One line either way.

**Do not pad.** A report with three findings is a three-finding report. Sections exist to be omitted when empty, and "nothing to flag" is a complete answer.

**Do not report a score.** A number invites comparison it cannot support, and it hides whether the run found something worth acting on. Say what was found.
