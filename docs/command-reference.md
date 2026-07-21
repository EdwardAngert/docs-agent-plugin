---
title: "Docs Assist Command Reference"
description: "Every Docs Assist command in one place: what it does, its argument, and an example. Covers health, draft, plan, template, make-examples, audit, update, verify, release-notes, agent-ready, init, setup-lint, setup-hooks, and setup-site."
content-type: reference
audience: users
keywords:
  - command reference
  - slash commands
  - docs-assist
  - draft
  - plan
---

# Docs Assist Command Reference

Every Docs Assist command, with its argument and an example.

You rarely need these. The plugin activates from plain conversation ("help me document X"), and the commands are optional shortcuts into the same workflows.
Every command also works with no argument: it asks for what it needs.

## At a Glance

| Command                      | What it does                                  | Argument                             |
| ---------------------------- | --------------------------------------------- | ------------------------------------ |
| `/docs-assist:draft`         | Draft a single document from what you know    | `[topic or issue number]`            |
| `/docs-assist:plan`          | Plan a documentation set, built to ship first | `[repo path or description]`         |
| `/docs-assist:template`      | Start a doc from a proven template            | `[problem, topic, or template name]` |
| `/docs-assist:make-examples` | Add or improve code examples in a doc         | `[doc-path]`                         |
| `/docs-assist:health`        | Fast docs health scorecard and first fix      | `[docs directory]`                   |
| `/docs-assist:audit`         | Audit docs for quality, gaps, and structure   | `[path]`                             |
| `/docs-assist:update`        | Update the docs affected by a code change     | `[git ref, PR number, or path]`      |
| `/docs-assist:verify`        | Execute a procedural doc's steps and report   | `[doc path or directory]`            |
| `/docs-assist:release-notes` | Write reader-facing notes for a release       | `[range, tag, or version]`           |
| `/docs-assist:agent-ready`   | Make the docs legible to AI tools             | `[docs directory]`                   |
| `/docs-assist:init`          | Scaffold project-local configuration          | `[docs directory]`                   |
| `/docs-assist:setup-lint`    | Scaffold optional documentation linting       | `[tool]`                             |
| `/docs-assist:setup-hooks`   | Install opt-in git, in-session, and CI hooks  | `[hook]`                             |
| `/docs-assist:setup-site`    | Generate site navigation from docs metadata   | `[docusaurus \| mkdocs]`             |

## Write and Plan

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

### /docs-assist:template

`/docs-assist:template [problem, topic, or template name]`

Start a doc from a proven structure instead of a blank page, using The Good Docs Project templates.
Describe the problem in plain words and it suggests a matching template, then fills the skeleton with what you know.
Use it to turn a recurring question into a doc, or to turn templates on for a project.

```text
/docs-assist:template people keep opening tickets about a login loop
```

### /docs-assist:make-examples

`/docs-assist:make-examples [doc-path]`

Add or improve code examples in an existing doc.
It writes copy-paste safe examples and reuses the variable names already in your docs so they stay consistent.
Use it when a doc is missing examples or its examples have drifted.

```text
/docs-assist:make-examples docs/webhooks.md
```

## Review and Maintain

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
Point it at a directory, a file, or a set of changed files. For a change or a diff, it audits the change and its blast radius rather than the files in isolation.
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

### /docs-assist:agent-ready

`/docs-assist:agent-ready [docs directory]`

Make the docs legible to AI tools.
It creates or repairs `llms.txt`, completes per-doc frontmatter using the repo's own field names (never overwriting what exists), and records nonstandard conventions where the next tool will find them.
Use it once to retrofit a docs set, and after large changes; day-to-day maintenance happens through the normal drafting and update workflows.

```text
/docs-assist:agent-ready docs
```

## Configure Your Project

### /docs-assist:init

`/docs-assist:init [docs directory]`

Scaffold project-local configuration in a committed `.docs-assist/` directory, pre-filled from the repo's existing conventions.
It writes `config.yml` and `style.md`, and offers to enable templates and seed the reference registry.
Run it first so every doc from the first follows the same conventions.

```text
/docs-assist:init docs
```

### /docs-assist:setup-lint

`/docs-assist:setup-lint [tool]`

Scaffold optional documentation linting, generated from `.docs-assist/config.yml`, so the linter checks the same rules the plugin writes by.
It sets up Vale, markdownlint, cspell, a link checker, or MegaLinter, and detects any linter you already use.
The argument names a tool: `vale`, `markdownlint`, `megalinter`, or `all`.

```text
/docs-assist:setup-lint all
```

### /docs-assist:setup-hooks

`/docs-assist:setup-hooks [hook]`

Install opt-in documentation hooks. Default off: nothing is installed without your choice.
It offers a git pre-commit doc linter, an in-session lint hook that runs after Claude edits a Markdown file, a CI docs-impact check that flags pull requests whose changes ripple into the docs, a CI reference-registry check that verifies `.docs-assist/reference.yml`'s facts and pointers still resolve, and a CI claim check that resolves identifier-shaped doc claims (paths, flags, function/class names, config keys) against the code with `git grep`.
The argument names a hook: `pre-commit`, `claude-code`, `ci`, `ci-facts`, `ci-claims`, or `all`.

```text
/docs-assist:setup-hooks pre-commit
```

### /docs-assist:setup-site

`/docs-assist:setup-site [docusaurus | mkdocs]`

Generate site navigation from the docs' own metadata: `llms.txt` reader-priority order becomes the sidebar order, and frontmatter titles become the labels.
When no static site generator exists, it scaffolds a minimal Docusaurus or MkDocs setup wired to your docs directory.
Deliberately not a site builder: theming, search, and deployment stay with your generator's own tooling.

```text
/docs-assist:setup-site mkdocs
```
