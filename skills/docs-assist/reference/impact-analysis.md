# Impact Analysis

Most review work starts from a small change: a few edited files, a diff, a renamed heading. The files that changed are not the same as the files the change affects. This reference is how you tell the difference, so a scoped audit or update stays small without missing the damage a change does elsewhere.

This is the deeper reference behind the change-based paths of `/docs-assist:audit` and `/docs-assist:update`.

## Two Scopes

- **Edit scope**: the small set that changed. The files you were handed, or the files in the diff.
- **Impact scope**: what those changes can break or make inconsistent. Found by following dependency edges out from the edit scope. It can reach the whole documentation set.

Narrowing the edit scope does not narrow the impact scope. A three-file edit can break links across the entire site. You keep the work small by following only the edges a change rides, not by trusting the file count.

So the order is: classify what changed, follow the edges that change type implicates, then report which edges you walked.

## Classify the Change

For each change in the edit scope, name its type. The type decides which edges you follow.

| Change type | Follow these edges |
|---|---|
| Heading text or slug changed | Inbound anchor links (`path#slug`) from any doc, in-page tables of contents, cross-references that deep-link the heading |
| File renamed, moved, or slug changed | Every inbound link to the old route, redirects, `llms.txt`, navigation or sidebar config |
| Proper noun, product, or term renamed or re-cased | Every other occurrence of the term across the docs set, the glossary, terminology in `.docs-assist/style.md` |
| Heading or title case changed | The case convention across sibling docs. Decide whether this is a one-off fix or a convention shift the neighbors should match |
| Number, stat, price, or version edited | Every other surface that repeats the same value: landing pages, READMEs, release notes. Duplicated facts drift |
| Command, flag, endpoint, or config key changed | Other docs that reference the same symbol. This is the code-to-docs edge `/docs-assist:update` already follows |
| Prerequisite or step added or removed | Docs that link to this one as a prerequisite, and downstream steps that assumed the old flow |

When a change matches no row, it has no ripple edge. Note it and move on.

## Follow Edges With a Budget

Edges are transitive: a renamed heading breaks an anchor, which makes a second doc's link text inaccurate, which may affect that doc's navigation. You cannot chase every edge to its end on every run.

- Follow each implicated edge one hop, then judge whether the next hop is worth it.
- Use `grep` and `llms.txt` to find inbound references rather than reading every file.
- Check confident matches (a doc links the exact heading you renamed). Skip passing mentions, unless the change is a rename that affects meaning.
- When following an edge would fan out across a large set, say so and recommend the relevant subagent (`doc-auditor` or `doc-updater`) rather than doing it inline.

## Report Residual Risk

A scoped review is only trustworthy if it says what it did not check. Close with the edges you walked and the ones you did not.

- List the change types you found and the edges you followed for each.
- List edges you chose not to follow, and why: out of budget, low confidence, or out of scope.
- Never imply full coverage from a scoped pass.

This is also the guard against padding. Report a clean section as clean. Do not manufacture a finding to fill a heading. "No heading or slug changed, so there are no anchor links to check" is a complete and correct result.
