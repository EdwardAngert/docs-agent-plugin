---
description: Audit documentation for quality issues, gaps, and improvement opportunities
argument-hint: [path]
---

# Audit documentation

Perform a systematic documentation audit on the specified path: `$ARGUMENTS`

## Your role

Focus on content and strategy, the things that require judgment:

- Is this the right content type for the user's goal?
- Does the information architecture match how users think?
- Are there gaps in documentation coverage?
- Does content make assumptions about prerequisite knowledge?
- Is related information consolidated or scattered?
- Are docs serving users or just describing features?
- Does each doc's reader journey actually work?
  Outline the user stories each doc serves and walk them through it: arrival, entry, path, exit.
  See `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/user-stories.md`.

Leave mechanical checks to linters (Vale, markdownlint, cspell).
This is an operation, not just a principle: see step 0 below.
Do not reimplement `MD022`, `MD032`, `MD040`, or Vale's prose rules by reading files by hand; a linter finds every instance in seconds where a manual pass misses several per file.
Running the linters clean is the floor, not the audit.
It confirms the docs are well-formed; it says nothing about whether they're still true.
Your primary value is the two things a linter cannot do: understanding the documentation holistically to serve users better, and tracing what the docs claim out to the code that should back it (see "Trace claims to the code" under Content Issues below).
A pass that stops at a clean lint run has not audited the content yet.

Resolve `.docs-assist/config.yml` and `style.md` first if they exist, and audit against them.
When they do not exist, do not stop to ask about conventions: the docs set's own internal consistency is the standard.
Hold the set to the rigor of a full documentation team reviewing a solo writer's work: example values that drift between docs, the same concept under different terms, stale cross-references, and structural inconsistencies between sibling docs.

## Audit process

Match the depth of the audit to the target.
A full documentation set, a single directory, a handful of changed files, and a diff are different jobs.
Do not run whole-set steps against a few files.

When the target is a set of changed files or a diff, audit the change and its blast radius rather than the files in isolation.
The edit scope is small, but the impact scope follows dependency edges out from it: classify each change, follow the edges it implicates, and report what you checked.
See `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/impact-analysis.md`.

### 0. Run the mechanical checks first

Before reading a single file for structure or style, check `.docs-assist/config.yml`'s `lint.tools`:

- **Configured**: run each listed tool against the audit scope (`npx markdownlint-cli2`, `vale`, `npx cspell`, per what's listed).
  Their output belongs on the Mechanics line of the report, which is one line.
  It does not become a section: a clean lint run is a precondition for the audit, not a result of it.
  A heading-level skip, a missing blank line, an untagged fence, a weasel word: these are findings the linter already found, not things to re-derive by reading.
- **Not configured**: say so explicitly in the report, and offer `/docs-assist:setup` before doing any manual mechanical checking.
  Do one-off ad hoc runs only if the user wants findings now and declines setup (`npx --yes markdownlint-cli2 <scope>` is enough for a single pass; no config to generate first).
- Either way, mechanical findings are not optional to skip: a hand-checked pass that substitutes for actually running the tool is the failure mode this step exists to prevent.

### 1. Take inventory

Scale this step to the target.
For a full set or a directory, take the full inventory below.
For a few files or a diff, skip the whole-set inventory and work from the edit scope plus the edges in `impact-analysis.md`.

Check the fan-out threshold now, from the inventory you just took: more than 5 files or roughly 2,000 lines total means fanning out across `chair-authority` and `chair-advocate` slices (see the Notes section), not auditing inline.
Decide this here, before starting content analysis, not partway through.

For a full set, explore the documentation structure:

- List all documentation files (`*.md`, `*.mdx`, `*.rst`, etc.)
- Identify documentation directories
- Note any configuration files (docusaurus.config.js, mkdocs.yml, etc.)
- List all image assets (`*.png`, `*.jpg`, `*.gif`, `*.svg`, `*.webp`)
- Check which images are referenced in documentation files
- Flag orphaned images (images not linked from any doc)

### 2. Check external links

Docs rot silently when a linked repo, page, or account is renamed, moved, or deleted elsewhere: nothing in the doc itself changes, so content review alone will not catch it.
This is mechanical, so use an existing tool rather than re-implementing it, in this order:

1. **Already wired up**: if `.markdown-link-check.json` exists, or `.docs-assist/config.yml` sets `lint.link_check`, or `.github/workflows/` already runs a link check, it's owned by the linter, the same way Vale/markdownlint are.
   Don't re-check by hand; note its last CI result and move on.
   If it's failing or hasn't run recently, flag that as the finding instead of the individual links.
1. **No CI yet, but the repo has GitHub Actions**: recommend `/docs-assist:setup` to wire the link-check step into `.github/workflows/docs-lint.yml` (it scaffolds `markdown-link-check` with the right config) so this runs on every PR instead of once per audit.
   Still do a one-off pass this run (step 3) so the current audit isn't empty-handed.
1. **No tooling at all, or a one-off scoped audit**: run `npx --yes markdown-link-check --quiet <files>` directly (add `--config .markdown-link-check.json` if present) rather than hand-rolling requests with `curl`/`WebFetch`.
   Treat its dead-link findings as Critical.

A redirect that `markdown-link-check` still counts as alive can hide a rename (`github.com/OWNER/REPO` resolving to a different owner or repo name is the common case).
If a link looks suspicious (an org/repo name that doesn't match the project, a host that redirects), spot-check that one URL's effective destination (`curl -sIL -o /dev/null -w '%{url_effective}\n' <url>`) and propose the corrected URL; don't do this for every link, only ones flagged as worth a second look.

- For a change-based audit, check only the links touched by or added in the diff, not the whole set (see `impact-analysis.md`).
- For a large full-set audit, this step runs once against the deduped file list, not per subagent slice: running it inside the chair fan-out described in the Notes below would just duplicate the same network calls.

### 3. Analyze content

For each document, evaluate:

Analyze in the order you will report in, so nothing has to be re-sorted later.

#### Is it true

- **Trace claims to the code.** This is not optional for a full-set or directory audit, and it is the highest-value part of the audit, not a nice-to-have layered on top of the mechanical checks: for every doc, walk each command, flag, config key, default value, endpoint, version requirement, and described behavior out to the actual source and confirm it still matches.
  Run `node ${CLAUDE_PLUGIN_ROOT}/assets/ci/check-claims.mjs` first: it resolves the identifier-shaped claims (paths, flags, function/class names, config keys) deterministically across the whole set in one pass, so the trace below spends judgment only on what a lookup can't settle (described behavior, numeric assertions).
  See `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/claim-verification.md` for the full method, what counts as a claim, and how to classify what you find (matches, drifted, missing, needs `/docs-assist:verify`).
  A pass that runs the mechanical linters, gets them clean, and stops there has finished the cheaper half of the audit and skipped the half a reader depends on.
- Outdated information (check dates and version references; for a full-set audit in a git repo, `node ${CLAUDE_PLUGIN_ROOT}/assets/ci/docs-decay.mjs` ranks every doc by staleness risk in one deterministic pass, prioritizing which docs get the claim trace above first)
- Unverified claims: docs whose `sme-attested` frontmatter ledger is large or old.
  Surface the specific claims so a reviewer can verify and delete entries (the ledger exists to shrink; see `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/frontmatter-spec.md`)
- Incomplete instructions (missing steps).
  Reading can only catch so much here: for a load-bearing procedural doc, recommend `/docs-assist:verify`, which executes the steps in an isolated workspace and finds the break a read-through misses
- Broken reader journeys: a story whose arrival, entry, path, or exit fails when walked through the doc, and docs whose intended reader cannot be inferred at all.
  See `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/user-stories.md`
- Assumption gaps (undefined terms, missing prerequisites)
- Duplicated content

#### Can a reader get what they came for: structure

- Multiple H1 headings
- Heading hierarchy violations (skipping levels)
- Missing introductory context
- No clear content type (tutorial vs how-to vs reference vs explanation)

#### Can a reader get what they came for: findability

- Missing navigation entries
- Poor link text (`click here`)
- No cross-references to related content
- Stale or missing `llms.txt`: if the repo has one, check its entries against the current docs (titles, descriptions, paths, and reader-priority order) per the contract in `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/llms-txt.md`, and note a missing one when the docs would benefit

#### Does it read well

- Inconsistent formatting
- Missing code block language tags
- Broken internal links
- Broken or redirecting external links: dead pages, and links that 301/302 to a different URL than the one in the doc (a common sign the target repo, page, or account was renamed or moved).
  See "Check external links" above.
- Missing alt text on images
- TODOs or placeholders
- Inconsistent example values: code samples that use different placeholder values for the same thing across docs, or values that do not match an `example-variable` entry in `.docs-assist/reference.yml` when it exists.
  See `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/code-examples.md`
- A `fact` entry whose value no longer matches its `source`, or a `pointer` entry whose `ref` no longer resolves.
  See `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/reference-registry.md`
- A destructive, upgrade, or troubleshooting example that would run against a real-looking target if copy-pasted verbatim, instead of failing safe.
  Critical: this is where a reader gets hurt, not just confused.
  See `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/code-examples.md`'s "Keep Every Example Safe"
- For a full-set audit, whether the docs set's guided journeys (per `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/user-stories.md`) actually compose: the same resource, project, or identifier used consistently across every doc in the sequence, not just similar-looking examples.
  Recommend `/docs-assist:verify` on the journey to prove it, not just read it
- Terminology drift: prose that uses a variant listed against a `term` entry in `.docs-assist/reference.yml` instead of the canonical term, or the same concept under different terms across docs when no registry exists (flag the outliers against the dominant usage, and offer to record the winner).
  See `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/terminology.md`
- AI voice: hedging, marketing language, false-contrast framing (`it's not X, it's Y`), and throat-clearing openers.
  See `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/tone-and-voice.md`'s "Avoid AI Voice" section

### 4. Assess information architecture

Evaluate overall structure:

- Does organization match user mental models?
- Are related topics grouped together?
- Is hierarchy appropriate (3-4 levels max)?
- Is navigation intuitive?

### 5. Format output

The order below is the point, not a preference.
It is how technical writing ranks: a wrong doc is worse than an ugly one, and a doc nobody can find is worse than one that reads awkwardly.
Report in this order even when the interesting findings are further down, because a reader who stops after the first section should still have the answer that matters most.

Lead with a verdict, in one or two sentences, that says whether this set is in good shape.
Say so plainly when it is.
An audit that finds nothing is a successful audit, and a list of manufactured findings is the failure mode, not a sign of thoroughness.

```markdown
## Audit summary

**Scope**: [path audited] · **Files**: [count] · **Date**: [today]

[One or two sentences: is this set in good shape, and what is the single thing
that most needs attention. Not a list. If nothing needs attention, say that.]

## Is it true

[Findings as `T1`, `T2`, each with where it is, the evidence, and the fix.

Claims traced to the code that should back them: commands, flags, defaults,
config keys, endpoints, version requirements, described behavior. A claim
nobody can source is the finding, and in finished prose it is invisible because
it reads exactly like the twenty sourced claims around it.

Also: examples that would not run, destructive examples that do not fail safe,
and anything stated as shipped that is designed and unbuilt.

This section is first because everything below it is cosmetic by comparison.]

## Can a reader get what they came for

[Findings as `R1`, `R2`.

Information architecture, findability, and whether the set coheres.

Reader journeys that break: arrival, entry, path, exit. Prerequisites the
reader cannot satisfy. A missing verification step, so nobody knows whether it
worked. Pages nothing links to. The same fact told differently in two places.
Docs a reader needs that do not exist.

This is where an audit earns most of its keep after correctness, and it is the
part a linter cannot reach at all.]

## Does it read well

[Findings as `P1`, `P2`.

Prose: ambiguity that costs the reader, terms used before they are defined,
an analogy standing where the fact belongs, the wrong reader level, AI voice.

Secondary to both sections above. A confusing sentence in a true, findable doc
is a smaller problem than a false sentence or an unreachable page.]

## Mechanics

[One line. Which linters ran and what they found, or that none are configured
and `/docs-assist:setup` would wire them up.

A clean lint run is a precondition, not a result. Do not expand this into a
section: if the linters found something, the fix is to run them, not to
transcribe their output here.]

## What I did not check

[Only when something was out of scope: a change-based audit's unfollowed edges,
links that could not be reached, files skipped and why. Omit when the pass
covered everything.]

## What to do first

[The smallest number of actions that move this set the most, in order. Each
names the file and what to change. Prefer one real fix over ten suggestions.]
```

Give every finding an identifier: `T1`, `R2`, `P3`, `M1`, numbered within its
section, so it can be referred to in a commit, a pull request, or a handoff
without quoting it.
Attach the evidence to the finding rather than to the run, so a reader who has
only the report can act on it.

Three things make a finding actionable, and leaving any one out sends the
reader back to the source:

- **Quote the literal text**, not what it means.
  A search for a paraphrase finds nothing.
- **Carry the material that fills a gap.** If the fix is to add a verification
  step, the report contains the command's actual output, not just the
  observation that it is missing.
- **Say which to do first**, rather than leaving it to be inferred from the
  identifiers.
`reference/reports.md` is the full contract, and it applies whether this goes on
the screen or into a file.

Rank findings by that hierarchy before ranking them by severity.
A correctness finding outranks a prose finding at the same severity, and the report should already be in that order rather than leaving a reader to sort it.

Where a section has nothing, say so in one line and move on.
Empty sections are a valid and common result.

### 6. Prioritize issues

Rank by kind first, then by cost within a kind.

The kinds are the report's own order: something untrue, then something a reader
cannot reach or follow, then something that reads poorly, then mechanics.
A false claim outranks an awkward sentence even when the sentence is cheaper to
fix, because effort is a tiebreaker and not a ranking.

Within a kind, prefer what hurts more readers, more often, for less work.

Resist the pull of the cheap fix.
A list led by typo corrections reads as thorough and leaves the expensive,
important findings at the bottom where they do not get done.

### 7. Deliver the report by scope

The conversation is for triage; end with a persist offer, per the skill's feedback guidance.

- A change-based audit of a PR: offer to post the report as a sticky PR comment (`gh pr comment`), summary first with detail collapsed in a `details` element.
  Update the existing comment on a re-run rather than adding another.
- A full-set or directory audit: offer to save it to `.docs-assist/reports/audit-<date>.md`, so the next audit can be compared against it.
  Follow `reference/reports.md` for the shape: identifiers per finding, evidence attached to each, and a record of where you looked.
- Either way, present the findings here first and let the user choose.
  Never persist without the offer.
- If `.docs-assist/session-log.md` is in use (check for it if this audit is one stage of a broader pass), append what this stage found and decided rather than letting that narrative dissolve into the audit report.
  See `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/session-log.md`.

## Notes

- Be specific: cite file paths and line numbers
- Be actionable: explain how to fix each issue
- Be proportional: don't overwhelm with minor issues
- Report clean sections as clean: do not invent a finding to fill a heading.
  An empty section is a valid result
- For a change-based target, follow `impact-analysis.md` and report residual risk rather than auditing the changed files in isolation
- An audit reports; it does not edit.
  When `llms.txt` is stale or missing, flag it as a finding and recommend `/docs-assist:update` to apply the fix
- Consider context: some "issues" may be intentional choices
- External link checking prefers, in order: an existing linter/CI setup already in the repo, wiring one up via `/docs-assist:setup` when CI exists, then an ad hoc `npx markdown-link-check` run.
  It needs `Bash` (for `npx`) or `WebFetch`; if neither is available, skip the check and say so rather than reporting links as clean
- For large repositories, ask how to handle the files list before outputting
- Fan out when the scope crosses a concrete threshold, not a feeling: more than 5 files or roughly 2,000 lines total in one audit.
  Below that, review inline.
  At or above it, run the loop's review passes in parallel across slices of the set: `chair-authority` for whether the docs are true, `chair-advocate` for whether a reader can follow them.
  Then consolidate the findings into one prioritized report.
  The loop is the audit; see `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/loop.md`.
  Include the resolved conventions in each subagent's brief (the relevant `.docs-assist/config.yml` settings and `style.md` rules, or the inferred conventions when no config exists), so every slice audits against the same standard.
  Check the threshold explicitly at the start of Take Inventory (step 1), not only when it feels large partway through a long session: a qualitative trigger is easy to talk yourself out of once already deep in the work
