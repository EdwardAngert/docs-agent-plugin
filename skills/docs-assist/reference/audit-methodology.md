# Audit Methodology

Systematic evaluation of existing documentation to find gaps, inconsistencies, and improvement opportunities.
This file is the deeper reference behind the `/docs-assist:audit` command.

The first half is what you do in a session. The second half is research that needs real users, which you cannot run yourself: recommend it to the docs lead when the scope warrants it.

## Match the Audit to the Target

A full set, a directory, a few changed files, and a diff are different jobs. For a full set, work through the steps below. For changed files or a diff, audit the change and its blast radius: the edit scope is small, but the impact scope follows dependency edges out from it. See `impact-analysis.md` for the change-type-to-edge map, the traversal budget, and how to report residual risk.

## What You Do in a Session

### 1. Take Inventory

- List every documentation file (`*.md`, `*.mdx`, `*.rst`).
- Categorize each by content type using `content-types.md`.
- Note last-updated dates and any ownership signals.
- List image assets and flag ones not referenced by any doc.

### 2. Analyze Each Document

Evaluate against five dimensions:

- **Accuracy**: is it current? Check version references and dates.
- **Completeness**: are steps missing? Does it assume prerequisites without linking them?
- **Clarity**: are explanations confusing? Is the content type right for the goal?
- **Findability**: can a reader locate it through navigation, search, or cross-references?
- **Consistency**: does it match the style and terminology of its neighbors?

### 3. Evaluate Information Architecture

- Does the structure match how users think, not the org chart?
- Are related topics grouped together?
- Is the hierarchy three to four levels at most?
- Is navigation predictable across similar content?

See `ia-methodology.md` for deeper IA evaluation.

### 4. Identify Gaps

- Missing documentation for known user journeys.
- Outdated content and stale `last-verified` dates.
- Inconsistent terminology for the same concept.
- Duplicated content that should be single-sourced.

### 5. Prioritize

Rank every finding by user impact, effort to fix, and how often users hit it.
Lead with high-impact, low-effort fixes.

## Deliverables

- An audit report with prioritized findings.
- An improvement backlog grouped by tier.
- Proposed IA changes when structure is part of the problem.
- Content templates or style fixes where patterns repeat.

## Human-Led Research (Reference)

These methods produce the user understanding that makes an audit accurate, but they need real participants. You cannot run them in a session. Recommend them to the docs lead and use their results as input.

- **User personas**: capture each group's role, goals, skill level, primary tasks, and pain points.
- **Card sorting**: open (users group and label topics) or closed (users fit topics into existing categories). Tools include OptimalSort, Figma, and Miro.
- **User journey mapping**: how users discover docs, where they look first, the common paths, and where they get stuck.

When you have persona or journey data, fold it into steps 2 through 4 above.
When you do not, work from the codebase and the docs themselves, and flag that user research would sharpen the findings.
