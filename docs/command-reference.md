---
title: "Docs Assist command reference"
description: "Every Docs Assist command in one place: what it does, its argument, and an example. Covers health, draft, plan, audit, verify, update, release-notes, setup, and merge-prep."
content-type: reference
audience: users
keywords:
  - command reference
  - slash commands
  - docs-assist
  - draft
  - plan
---

# Docs Assist command reference

Every Docs Assist command, with its argument and an example.

You rarely need these.
The plugin activates from plain conversation ("help me document X"), and the commands are optional shortcuts into the same workflows.
Every command also works with no argument: it asks for what it needs.

## At a glance

| Command                      | What it does                                  | Argument                        |
| ---------------------------- | --------------------------------------------- | ------------------------------- |
| `/docs-assist:health`        | Fast docs health scorecard and first fix      | `[docs directory]`              |
| `/docs-assist:draft`         | Write a document through the authoring loop   | `[topic or issue number]`       |
| `/docs-assist:plan`          | Plan a documentation set, built to ship first | `[repo path or description]`    |
| `/docs-assist:audit`         | Review existing docs by reconstructing claims | `[path]`                        |
| `/docs-assist:verify`        | Execute a procedural doc's steps and report   | `[doc path or directory]`       |
| `/docs-assist:update`        | Update the docs affected by a code change     | `[git ref, PR number, or path]` |
| `/docs-assist:release-notes` | Write reader-facing notes for a release       | `[range, tag, or version]`      |
| `/docs-assist:setup`         | Conventions, linting, hooks, and navigation   | `[stage]`                       |
| `/docs-assist:merge-prep`    | Ready a docs change to merge                  | `[branch or path]`              |

## Write and plan

### /docs-assist:draft

`/docs-assist:draft [topic or issue number]`

Draft one document with guided help.
It opens by asking you to share everything you know, reflects it back, connects it to your existing docs, checks the details against the code, confirms an outline, then writes.
Use it when you want to document a single topic and would like a structured walkthrough.
For a topic that will take more than one sitting, it can offer to keep a running notes file so you can pick back up later without re-explaining everything.

```text
/docs-assist:draft how to configure webhook retries
```

### /docs-assist:plan

`/docs-assist:plan [repo path or description]`

Plan a documentation set for a project.
It reads the codebase, tells you what it found and where to start, recommends a single first doc to ship now, and stages the rest into next-iteration and later.
Use it for a new project with no docs, a project with scattered docs, or onboarding a team to a tool.

```text
/docs-assist:plan
```

## Review and maintain

### /docs-assist:health

`/docs-assist:health [docs directory]`

Check documentation health in one command: a thirty-second scorecard across coverage, freshness, consistency, and findability, the single highest-leverage fix, and an offer to make that fix now.
The best first command after installing the plugin, and the periodic pulse check afterward.
Use `/docs-assist:audit` when you want the full findings list instead of a scorecard.

```text
/docs-assist:health
```

### /docs-assist:audit

`/docs-assist:audit [path]`

Audit documentation for quality, structure, findability, and gaps, and produce a prioritized report.
Point it at a directory, a file, or a set of changed files.
For a change or a diff, it audits the change and its blast radius rather than the files in isolation.
Use it to assess a docs set before a cleanup, or to review the ripple of a change.

```text
/docs-assist:audit docs/
```

### /docs-assist:update

`/docs-assist:update [git ref, PR number, or path]`

Find and update the docs affected by a code change.
It reads the diff, summarizes what changed, locates the docs that reference it, and updates them for your review.
Use it after a code change so the docs keep pace.

```text
/docs-assist:update 42
```

### /docs-assist:verify

`/docs-assist:verify [doc path or directory]`

Verify a procedural doc by executing it.
It runs the doc's steps in order in an isolated workspace, compares actual output against what the doc shows, and reports every divergence, failure, and missing prerequisite.
Steps needing credentials, privilege escalation, or real services are reported as unverified, never run.
On a clean pass it offers to set `last-verified`, so the date means a machine ran the procedure.
Use it on quickstarts and tutorials, the docs where a broken step costs the most trust.

```text
/docs-assist:verify docs/quickstart.md
```

### /docs-assist:release-notes

`/docs-assist:release-notes [range, tag, or version]`

Turn a release's worth of changes into reader-facing release notes.
It reads the commits and merged PRs in the range, asks you for the why, and writes notes that lead with breaking changes and upgrade steps, matching the project's changelog convention.
Use it when cutting a release, so the notes describe outcomes readers care about instead of repeating commit messages.

```text
/docs-assist:release-notes v0.8.0..HEAD
```

## Configure your project

### /docs-assist:setup

`/docs-assist:setup [stage]`

Conventions, linting, hooks, and site navigation, in one pass with one set of questions.
Every stage is opt-in and nothing is written without a yes.
The plugin also offers this inline at the moment it would help, so you rarely need to type it.

With no argument, it offers the full pass:

```text
/docs-assist:setup
```

Name a stage to run that one alone.
The stages are `conventions`, `linting`, `hooks`, `personas`, `reachability`, and `site`, matched loosely:

```text
/docs-assist:setup linting
```

### /docs-assist:merge-prep

`/docs-assist:merge-prep [branch or path]`

Everything expensive that scales with the whole docs set: whole-set continuity, `llms.txt` and `llms-full.txt`, bundle drift, the deterministic checks, the configured linters, and link checking.
Routine workflows never do this, so a single content fix does not trigger a full regenerate-and-diff pass.

```text
/docs-assist:merge-prep
```
