---
title: "Code Review: reorient-sme-coaching Branch"
description: "Comprehensive code review of all changes on the reorient-sme-coaching branch — internal consistency, instruction quality, completeness, frontmatter spec, and style."
content-type: reference
audience: contributors
---

# Code Review: reorient-sme-coaching Branch

**Branch**: `reorient-sme-coaching`
**Scope**: All commits since `main` — SKILL.md, four commands, frontmatter spec, llms.txt, README, plugin.json, and docs/
**Date**: 2026-02-26

## Critical Issues

Issues that break feature coverage or leave users without information they need.

### 1. README File Tree Missing `frontmatter-spec.md`

**File**: `README.md`, lines 117–124
**What's wrong**: The "What's Inside" file tree lists six skill files but omits `frontmatter-spec.md`, which was added in a later commit.
A user reading the README to understand what's in the plugin won't know the frontmatter spec exists.
`llms.txt`, `SKILL.md`, and `commands/draft.md` all reference it.

**Fix**: Add `frontmatter-spec.md` to the file tree with a brief description.

### 2. Set-Up Doc Does Not Mention `/plan`

**File**: `docs/set-up-documentation-standards-for-your-team.md`, lines 71–72
**What's wrong**: The install section says "No special commands required — though `/documentation-agent:draft` walks through a more structured intake."
The `/plan` command exists and is the right entry point when someone needs to document a project from scratch — exactly the scenario this doc targets (docs leads setting up standards for a team).
A docs lead reading this doc has no idea `/plan` exists.

**Fix**: Add a list of both key commands after the install section, directing docs leads to `/plan` for planning a full documentation set.

### 3. Write-Docs Doc Does Not Mention `/plan`

**File**: `docs/write-docs-with-the-documentation-agent.md`
**What's wrong**: This doc covers `/draft` and `/make-examples` but not `/plan`.
A contributor reading it will know how to write a single doc but won't know there's a command for planning a full documentation set.
The "Get the Most Out of It" section has subsections for draft and make-examples — `/plan` needs one too.

**Fix**: Add a "Plan a Full Documentation Set" subsection explaining what `/plan` does and when to use it.

## High Issues

Style violations the plugin itself enforces — the plugin's own docs contradict the standards it applies to user docs.

### 4. SKILL.md: Gerund Heading "Drafting a Single Doc"

**File**: `skills/documentation-agent/SKILL.md`, line 18
**What's wrong**: The heading "### Drafting a Single Doc" uses a gerund.
SKILL.md and `tone-and-voice.md` both specify "use imperative verbs, not gerunds" for headings.

**Fix**: Change to `### Draft a Single Doc`

### 5. SKILL.md: Gerund Heading "Planning a Documentation Set"

**File**: `skills/documentation-agent/SKILL.md`, line 31
**What's wrong**: Same issue — gerund heading.

**Fix**: Change to `### Plan a Documentation Set`

### 6. SKILL.md: Non-Imperative Heading "Writing Standards You Apply Automatically"

**File**: `skills/documentation-agent/SKILL.md`, line 71
**What's wrong**: "Writing Standards You Apply Automatically" is neither imperative nor concise.
The "You Apply Automatically" clause is redundant — the section itself makes clear these are the standards applied automatically.

**Fix**: Change to `## Writing Standards`

### 7. SKILL.md: Gerund Heading "When Reviewing Existing Docs"

**File**: `skills/documentation-agent/SKILL.md`, line 144
**What's wrong**: "When Reviewing" uses a gerund where an imperative would be clearer.

**Fix**: Change to `## Review Existing Docs`

### 8. SKILL.md: Dangling Preposition "Antipatterns to Watch For"

**File**: `skills/documentation-agent/SKILL.md`, line 134
**What's wrong**: "## Antipatterns to Watch For" ends with a preposition and is inconsistent with `documentation-patterns.md`, which calls the same content "## Documentation Antipatterns."

**Fix**: Change to `## Documentation Antipatterns`

### 9. `frontmatter-spec.md`: Gerund Heading "When Writing (the `/draft` workflow)"

**File**: `skills/documentation-agent/frontmatter-spec.md`, line 117
**What's wrong**: "When Writing" uses a gerund.
Parallel headings in the same section were fixed ("When Surveying" → "Survey Existing Docs", "When Auditing" → "Audit with `/audit`") but this one was missed.

**Fix**: Change to `### Write Docs with \`/draft\``

### 10. `frontmatter-spec.md`: Gerund Heading "When Surveying Existing Docs"

**File**: `skills/documentation-agent/frontmatter-spec.md`, line 128
**What's wrong**: Gerund heading.

**Fix**: Change to `### Survey Existing Docs`

### 11. `frontmatter-spec.md`: Gerund Heading "When Auditing (`/audit`)"

**File**: `skills/documentation-agent/frontmatter-spec.md`, line 140
**What's wrong**: Gerund heading.

**Fix**: Change to `### Audit with \`/audit\``

### 12. `frontmatter-spec.md`: Gerund Heading "Adapting to Existing Repos"

**File**: `skills/documentation-agent/frontmatter-spec.md`, line 149
**What's wrong**: Gerund heading.

**Fix**: Change to `## Adapt to Existing Repos`

### 13. `frontmatter-spec.md`: Gerund Heading "Documenting the Mapping"

**File**: `skills/documentation-agent/frontmatter-spec.md`, line 174
**What's wrong**: Gerund heading.

**Fix**: Change to `### Document the Mapping`

### 14. `docs/code-review.md`: Uses `---` as Section Separators

**File**: `docs/code-review.md`, lines 7, 13, 24, 35, 46, 52, 63, 72, 82, 91, 100, 109, 118, 127, 133, 143, 153, 163, 169
**What's wrong**: The review doc uses `---` horizontal rules between sections and between individual issues.
`tone-and-voice.md` line 58 states: "The separator `---` is for identifying YAML frontmatter only. Do not use it to separate sections."
The plugin's own doc violates the plugin's own rule.

**Fix**: Remove all `---` separators. Use blank lines and heading structure for visual separation.

## Medium Issues

Incomplete content or minor inconsistencies that reduce accuracy or usefulness.

### 15. `documentation-patterns.md`: Heading "FAQ/Troubleshooting" Inconsistent with Canonical Value

**File**: `skills/documentation-agent/documentation-patterns.md`, line 49
**What's wrong**: The content type heading is "### FAQ/Troubleshooting" but SKILL.md, `commands/draft.md`, and `frontmatter-spec.md` all use `troubleshooting` as the canonical name and frontmatter value.
This creates ambiguity about whether the correct frontmatter value is `troubleshooting` or `faq/troubleshooting`.

**Fix**: Change the heading to `### Troubleshooting`

### 16. `frontmatter-spec.md`: SSG Coverage Names Jekyll and Astro Without Listing Their Fields

**File**: `skills/documentation-agent/frontmatter-spec.md`, lines 152–163
**What's wrong**: The intro paragraph names "Docusaurus, Hugo, Jekyll, and Astro" but conflict resolution rule 3 only lists fields from Docusaurus and Hugo.
Jekyll and Astro are named but their specific fields aren't covered, leaving Claude to guess when it encounters them.

**Fix**: Add Jekyll fields (`permalink`, `categories`, `published`) and Astro fields (`pubDate`, `heroImage`) to rule 3.

### 17. `commands/plan.md`: "Update the Plan" Is Ambiguous

**File**: `commands/plan.md`, line 108
**What's wrong**: Step 6 says "As you write each doc, update the plan" but doesn't specify where the plan lives.
Without an artifact to update, "update the plan" is unactionable.

**Fix**: Specify that the plan should be written to a file (`docs/plan.md` by default) in step 4, and that the file is updated as docs are completed.

### 18. All `docs/` Files Missing Frontmatter

**Files**: `docs/code-review.md`, `docs/set-up-documentation-standards-for-your-team.md`, `docs/write-docs-with-the-documentation-agent.md`
**What's wrong**: The frontmatter spec states "These fields should appear on every doc" for `title`, `description`, and `content-type`.
The plugin's own documentation files don't have frontmatter, contradicting the standard the plugin enforces for user docs.

**Fix**: Add required and relevant recommended frontmatter to all three docs/ files.

## Low Issues

Minor polish items.

### 19. `docs/write-docs-with-the-documentation-agent.md`: "Won't Commit Changes" Is Ambiguous

**File**: `docs/write-docs-with-the-documentation-agent.md`, line 95
**What's wrong**: "It also won't commit changes without you reviewing them" could be read as referring to git commits.
In a tool that also manages git commits, this phrasing will confuse some readers.

**Fix**: Change to "It also won't write the file without you reviewing the draft first."
