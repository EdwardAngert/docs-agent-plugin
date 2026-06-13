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

## Audit Process

### 1. Take Inventory

First, explore the documentation structure:

- List all documentation files (`*.md`, `*.mdx`, `*.rst`, etc.)
- Identify documentation directories
- Note any configuration files (docusaurus.config.js, mkdocs.yml, etc.)
- List all image assets (`*.png`, `*.jpg`, `*.gif`, `*.svg`, `*.webp`)
- Check which images are referenced in documentation files
- Flag orphaned images (images not linked from any doc)

### 2. Analyze Content

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
- Missing alt text on images
- TODOs or placeholders

#### Content Issues

- Outdated information (check dates, version references)
- Incomplete instructions (missing steps)
- Assumption gaps (undefined terms, missing prerequisites)
- Duplicated content

#### Findability Issues

- Missing navigation entries
- Poor link text ("click here")
- No cross-references to related content

### 3. Assess Information Architecture

Evaluate overall structure:

- Does organization match user mental models?
- Are related topics grouped together?
- Is hierarchy appropriate (3-4 levels max)?
- Is navigation intuitive?

### 4. Format Output

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

### 5. Prioritize Issues

Rank all issues by:

- **User impact**: How much does this hurt users?
- **Effort**: How hard is it to fix?
- **Frequency**: How often do users encounter this?

Focus on issues that are high-impact and low-effort first.

## Notes

- Be specific: cite file paths and line numbers
- Be actionable: explain how to fix each issue
- Be proportional: don't overwhelm with minor issues
- Consider context: some "issues" may be intentional choices
- For large repositories, ask how to handle the files list before outputting
- For large documentation sets, fan out: launch the `doc-auditor` subagent in parallel across slices of the set, then consolidate the findings into one prioritized report
