---
description: Audit documentation for quality issues, gaps, and improvement opportunities
argument-hint: [path]
---

# Audit Documentation

Perform a systematic documentation audit on the specified path: `$ARGUMENTS`

## Your Role

Focus on **content and strategy**, the things that require judgment:

- Is this the right content type for the user's goal?
- Does the information architecture match how users think?
- Are there gaps in documentation coverage?
- Does content make assumptions about prerequisite knowledge?
- Is related information consolidated or scattered?
- Are docs serving users or just describing features?

Leave mechanical checks to linters (Vale, markdownlint, cspell).
You can note obvious style issues, but your primary value is understanding the documentation holistically and identifying opportunities to better serve users.

Resolve `.docs-assist/config.yml` and `style.md` first if they exist, and audit against them.
When they do not exist, do not stop to ask about conventions: the docs set's own internal consistency is the standard.
Hold the set to the rigor of a full documentation team reviewing a solo writer's work: example values that drift between docs, the same concept under different terms, stale cross-references, and structural inconsistencies between sibling docs.

## Audit Process

Match the depth of the audit to the target. A full documentation set, a single directory, a handful of changed files, and a diff are different jobs. Do not run whole-set steps against a few files.

When the target is a set of changed files or a diff, audit the change and its blast radius rather than the files in isolation. The edit scope is small, but the impact scope follows dependency edges out from it: classify each change, follow the edges it implicates, and report what you checked. See `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/impact-analysis.md`.

### 1. Take Inventory

Scale this step to the target. For a full set or a directory, take the full inventory below. For a few files or a diff, skip the whole-set inventory and work from the edit scope plus the edges in `impact-analysis.md`.

For a full set, explore the documentation structure:

- List all documentation files (`*.md`, `*.mdx`, `*.rst`, etc.)
- Identify documentation directories
- Note any configuration files (docusaurus.config.js, mkdocs.yml, etc.)
- List all image assets (`*.png`, `*.jpg`, `*.gif`, `*.svg`, `*.webp`)
- Check which images are referenced in documentation files
- Flag orphaned images (images not linked from any doc)

### 2. Check External Links

Docs rot silently when a linked repo, page, or account is renamed, moved, or deleted elsewhere — nothing in the doc itself changes, so content review alone will not catch it. This is mechanical, so use an existing tool rather than re-implementing it, in this order:

1. **Already wired up**: if `.markdown-link-check.json` exists, or `.docs-assist/config.yml` sets `lint.link_check`, or `.github/workflows/` already runs a link check, it's owned by the linter, the same way Vale/markdownlint are. Don't re-check by hand — note its last CI result and move on. If it's failing or hasn't run recently, flag that as the finding instead of the individual links.
2. **No CI yet, but the repo has GitHub Actions**: recommend `/docs-assist:setup-lint` to wire the link-check step into `.github/workflows/docs-lint.yml` (it scaffolds `markdown-link-check` with the right config) so this runs on every PR instead of once per audit. Still do a one-off pass this run (step 3) so the current audit isn't empty-handed.
3. **No tooling at all, or a one-off scoped audit**: run `npx --yes markdown-link-check --quiet <files>` directly (add `--config .markdown-link-check.json` if present) rather than hand-rolling requests with `curl`/`WebFetch`. Treat its dead-link findings as Critical.

A redirect that `markdown-link-check` still counts as alive can hide a rename (`github.com/OWNER/REPO` resolving to a different owner or repo name is the common case). If a link looks suspicious — an org/repo name that doesn't match the project, a host that redirects — spot-check that one URL's effective destination (`curl -sIL -o /dev/null -w '%{url_effective}\n' <url>`) and propose the corrected URL; don't do this for every link, only ones flagged as worth a second look.

- For a change-based audit, check only the links touched by or added in the diff, not the whole set (see `impact-analysis.md`).
- For a large full-set audit, this step runs once against the deduped file list, not per subagent slice — running it inside the `doc-auditor` fan-out described in the Notes below would just duplicate the same network calls.

### 3. Analyze Content

For each document, evaluate:

#### Structure Issues

- Multiple H1 headings
- Heading hierarchy violations (skipping levels)
- Missing introductory context
- No clear content type (tutorial vs how-to vs reference vs explanation)

#### Style Issues

- Inconsistent formatting
- Missing code block language tags
- Broken internal links
- Broken or redirecting external links: dead pages, and links that 301/302 to a different URL than the one in the doc (a common sign the target repo, page, or account was renamed or moved). See "Check External Links" below.
- Missing alt text on images
- TODOs or placeholders
- Inconsistent example values: code samples that use different placeholder values for the same thing across docs, or values that do not match `.docs-assist/example-variables.txt` when it exists. See `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/code-examples.md`
- Terminology drift: prose that uses a variant listed in `.docs-assist/terms.txt` instead of the canonical term, or the same concept under different terms across docs when no registry exists (flag the outliers against the dominant usage, and offer to record the winner). See `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/terminology.md`

#### Content Issues

- Outdated information (check dates, version references)
- Unverified claims: docs whose `sme-attested` frontmatter ledger is large or old. Surface the specific claims so a reviewer can verify and delete entries (the ledger exists to shrink; see `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/frontmatter-spec.md`)
- Incomplete instructions (missing steps)
- Assumption gaps (undefined terms, missing prerequisites)
- Duplicated content

#### Findability Issues

- Missing navigation entries
- Poor link text ("click here")
- No cross-references to related content
- Stale or missing `llms.txt`: if the repo has one, check its entries against the current docs (titles, descriptions, paths, and reader-priority order) per the contract in `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/llms-txt.md`, and note a missing one when the docs would benefit

### 4. Assess Information Architecture

Evaluate overall structure:

- Does organization match user mental models?
- Are related topics grouped together?
- Is hierarchy appropriate (3-4 levels max)?
- Is navigation intuitive?

### 5. Format Output

Provide findings in this structure:

```markdown
## Audit Summary

**Scope**: [path audited]
**Files Reviewed**: [count]
**Date**: [today]

## Critical Issues

[High-impact problems that should be fixed immediately]

## Structural Issues

[Problems with organization, navigation, or IA]

## Content Issues

[Quality problems in individual documents]

## Style Issues

[Formatting and style guide violations]

## Quick Wins

[Low-effort fixes with good impact]

## Warnings

### Orphaned Images

The following images exist but are not linked from any documentation file.
These may be intentionally linked from external sources or may be unused.

- `path/to/image1.png`
- `path/to/image2.svg`

### Unverifiable Links

The following external links could not be checked (network error, timeout, or auth-gated).
Not reported as broken — just unconfirmed.

- `path/to/doc.md`: `https://example.com/page`

## Residual Risk

[For a scoped or change-based audit, state what you did not check: the change types found and the edges followed for each, plus the edges you did not follow and why. Omit this section for a full-set audit that covered everything.]

## Recommendations

[Prioritized list of suggested improvements]

## Files Reviewed

[Handle based on user preference - ask if not specified]

Options:
1. **Full list**: Show all files with notes
2. **Output to file**: Write to `audit-files.md` in the audited directory
3. **Critical only**: Show only files with critical issues
4. **Skip**: Omit this section entirely
```

### 6. Prioritize Issues

Rank all issues by:

- **User impact**: How much does this hurt users?
- **Effort**: How hard is it to fix?
- **Frequency**: How often do users encounter this?

Focus on issues that are high-impact and low-effort first.

### 7. Deliver the Report by Scope

The conversation is for triage; end with a persist offer, per the skill's feedback guidance.

- A change-based audit of a PR: offer to post the report as a sticky PR comment (`gh pr comment`), summary first with detail collapsed in a `details` element. Update the existing comment on a re-run rather than adding another.
- A full-set or directory audit: offer to save it to `.docs-assist/reports/audit-<date>.md`, so the next audit can be compared against it.
- Either way, present the findings here first and let the user choose. Never persist without the offer.

## Notes

- Be specific: cite file paths and line numbers
- Be actionable: explain how to fix each issue
- Be proportional: don't overwhelm with minor issues
- Report clean sections as clean: do not invent a finding to fill a heading. An empty section is a valid result
- For a change-based target, follow `impact-analysis.md` and report residual risk rather than auditing the changed files in isolation
- An audit reports; it does not edit. When `llms.txt` is stale or missing, flag it as a finding and recommend `/docs-assist:update` to apply the fix
- Consider context: some "issues" may be intentional choices
- External link checking prefers, in order: an existing linter/CI setup already in the repo, wiring one up via `/docs-assist:setup-lint` when CI exists, then an ad hoc `npx markdown-link-check` run. It needs `Bash` (for `npx`) or `WebFetch`; if neither is available, skip the check and say so rather than reporting links as clean
- For large repositories, ask how to handle the files list before outputting
- For large documentation sets, fan out: launch the `doc-auditor` subagent in parallel across slices of the set, then consolidate the findings into one prioritized report. Include the resolved conventions in each subagent's brief (the relevant `.docs-assist/config.yml` settings and `style.md` rules, or the inferred conventions when no config exists), so every slice audits against the same standard
