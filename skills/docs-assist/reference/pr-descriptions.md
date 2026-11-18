# PR descriptions

A PR description's job is to tell a reviewer how to review, not to restate the diff.
`git log` and `git diff --stat` already give the reviewer the "what"; the description earns its place by adding what a diff can't show: why, what to scrutinize, what was deliberately left out, and how the author verified claims that aren't self-evident from reading code.

## Choose the shape: commit-by-commit or file-by-file

The default habit, one paragraph per commit in commit order, only works when the commits are independently reviewable: each one builds cleanly on the last, and a reviewer (or a future `git bisect`) could stop at any commit and find working, coherent state.

Docs work routinely breaks that assumption.
A content commit adds a page; a later commit fixes a heading collision or a stale claim the first commit introduced without meaning to.
Read in commit order, the second commit looks like noise (fixing something that "shouldn't" have been wrong); read as a diff against the base, it's just correct final state.
When commits don't hold up independently, restructure the description by file or area instead, and say so explicitly and near the top: don't make the reviewer discover the commit list isn't the review path by reading it first and getting confused.

Decide this before writing, not while writing:

- **Commits are bisectable** (each is a complete, working step): describe by commit, in order.
  The commit log is the review path; the description narrates it.
- **Commits aren't bisectable** (later commits fix earlier ones, or a docs pass and a drift-check pass happened to touch overlapping files): describe by file or area, and open with a one- or two-sentence note telling the reviewer why, and what the file/area grouping is for (review order, and the unit to revert or cherry-pick if only part of the change turns out to be wanted).

A PR can also legitimately need both shapes at different points in its life.
Rewrite the description once the shape of the change is settled and stops being what it looked like from the first commit; a body written when the branch was two commits deep does not have to survive being ten.
If you already have a rough description in place, rewriting it with the reviewer as the audience beats accreting more paragraphs onto a chronological account that no longer reflects what actually happened.

## Write for a reviewer whose first pass is automated

Assume a mechanical or AI first-pass reviewer (a linter, a bot, an in-house review tool) already caught, or will already catch, what's checkable without judgment: formatting, obvious lint, whether links resolve, whether the diff is internally consistent.
Don't spend the description's words re-deriving that.
Spend them on what only a human can approve:

- A judgment call and the reasoning behind it (why this doc doesn't get restructured in this PR, why a section stays out of scope).
- A correction the diff alone doesn't explain (a misattributed fact, a stale example that looked right until checked against something outside the diff).
- What was verified and how, when the verification isn't visible in the diff itself (checked a claim against a running binary, a live API, a source file outside the PR's own changed files).
- Which unit to revert or cherry-pick, when the PR bundles more than one logically separate change.

## Template

Use what fits; not every PR needs every section, and a small PR with no independent verification step doesn't need to invent a "How this was verified" section to fill a template.

```markdown
## Summary

What the PR does, as a current end-state description, not a chronological
"first I did X, then Y." Include enough context (a linked issue, a prior
attempt, why now) that a reviewer with no memory of the discussion can
orient in one read.

## How to review this

Only when commits aren't independently reviewable. State that plainly, and
name the review unit the sections below use (usually one file per entry).

### <Grouping: new files, modified files, or by area/feature>

- **`path/to/file`**: what changed and why. What specifically to check if you
  only have time to check one thing. Note any non-obvious source of truth
  used to verify a claim in this file (a binary, a live config, another
  file outside the diff).

## Known gaps

Deliberately out-of-scope things a careful reviewer would otherwise flag as
missing. Say why they're out of scope, not just that they are.

## How this was verified

Only when there's a distinct verification pass worth naming: what was
checked against what, and what it caught. Skip this section entirely for
a change with no verification step beyond normal review.

## Rests on someone's word

Only when a claim stays in the docs on an expert's word alone, with nothing
in the code to check it against. One line per claim, with whose word as a
role, so the reviewer knows exactly what they are taking on trust.

## Test plan

Checkable items: commands run, their results, what still needs a human to
confirm.
```

## Write it from the journal

When the branch has a journal (`journal.md`), it holds what was asked, answered, decided, corrected, and run, and the description is written from it rather than from memory of the session.
With no journal, write the description the usual way and say nothing about one.

1. Read the journal at `node ${CLAUDE_PLUGIN_ROOT}/hooks/journal.mjs path`, and only the notes for docs this branch changes: `git diff --name-only` against the base, plus uncommitted work.
1. Offer it once, in plain words, with the second option named:

   > I kept notes on what I checked on this branch.
   > Want me to write the PR description from them?
   > I can also add a section for each doc showing what was checked, what was run, and what's still open.
1. Check again, now, every claim about the code the description will present as verified.
   A note records what was true when it was written, and the code may have moved since: read the file, and when it no longer agrees, the description says the doc needs another look instead of calling it verified, and the note gets corrected (`journal.md`, "When things disagree").
   Never present a claim as checked because a note says it was.
1. Fill the template from the notes:
   - **How this was verified**: the corrections, each on its own line with the code that settled it, since a correction is what tells a reviewer the check was real; what ran and the result; and a count of the rest.
   - **Rests on someone's word**: what a person said that the code can't settle, by role.
   - **Known gaps**: questions still unanswered, and decisions that left something out of scope.
   - **Summary, or How to review this**: decisions that explain a choice the diff shows.
1. On the second yes, add the breakdown after the main body: one collapsible block per doc in the diff, in the order a reviewer should read them.

   ```markdown
   <details>
   <summary><code>docs/connect.md</code>: 4 claims checked, 1 corrected, 1 open question</summary>

   - Checked against `src/client.js`: the default timeout is 8000 ms.
   - Corrected: the retry ceiling is 5 seconds, not 10 (`src/retry.js`).
   - Open: whether the timeout applies per attempt or overall.
   - Fixed a broken link the edit introduced.

   </details>
   ```

   With the breakdown, the main body's "How this was verified" shrinks to the totals and the one or two corrections a reviewer most needs, and the detail lives only in the breakdown.
   A correction listed in both places is read twice and trusted less.
   GitHub and GitLab both render `<details>`.
   If the body would pass GitHub's 65,536-character limit, post the breakdown as the pull request's first comment and say so in the body.

Never put these in the body:

- The journal, its path, or that it exists: the reviewer sees verification, not the plugin's working notes.
- Command names.
- Approaches that were tried and dropped, unless one explains something in the diff.
- Anything under `.docs-assist/`.

Show the full body before posting it, every time.
Post only on a yes: `gh pr create` or `gh pr edit` on GitHub, `glab mr create` or `glab mr update` on GitLab.
Without either, write the body to a file outside the repository and say where it is.
