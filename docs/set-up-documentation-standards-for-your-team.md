---
title: "Set up documentation standards for your team"
description: "Install and configure the Docs Assist plugin for your team: what changes for contributors, how to customize writing standards, and how to run your first audit."
content-type: doc
audience: docs-leads
keywords:
  - documentation standards
  - plugin setup
  - technical writing
  - team onboarding
---

# Set up documentation standards for your team

You have people who know things.
Engineers who built the feature.
Support leads who've seen every edge case.
PMs who understand the workflow end to end.

They're already writing documentation, ad hoc, in their own style, scattered across the repo.
Each doc is fine on its own.
But put them all together and there's no consistency, no cross-referencing, no connective tissue.

This plugin fixes that without hiring a dedicated technical writer.

## What the plugin does

Docs Assist is a Claude Code plugin that gives every Claude Code session documentation expertise.
When a contributor asks Claude Code for help writing docs, the plugin shapes how Claude Code responds, guiding the conversation, picking the right structure, applying formatting standards, and connecting the new content to what already exists.

The contributor doesn't interact with the plugin directly.
They talk to Claude Code, and it acts like a documentation coach instead of a generic assistant.

## Before you start

You need a repository with some documentation already in it, and permission to commit to it.
Setup reads what your docs already do and proposes conventions that match, so a repo with no docs yet gets defaults rather than detected conventions: start with [Plan a documentation set](command-reference.md#docs-assistplan) instead.

You do not need every contributor to install anything yet.
The configuration you commit is what carries the standards; the plugin reads it on every run, for everyone who has it.

## Roll it out

1. **Install it yourself first**, and see where the docs stand.
   [Get started with Docs Assist](get-started.md) has the three steps, the failure worth knowing about, and what each stage of setup writes into your repo.

1. **Run `/docs-assist:setup` and commit what it proposes.**
   This is the step that makes it a team standard rather than your personal preference.
   It reads your existing docs for heading case, list markers, frontmatter fields, and sentence breaks, then hands you a summary to correct.
   Correct it: detected conventions are a proposal, and the ones you change are the ones your team actually argued about.

1. **Take the reachability stage.**
   It adds a short section to `CLAUDE.md` telling Claude to use the plugin for documentation work in this repo.
   Do not skip it.
   A skill is matched against what someone says, so a contributor who never uses the word "documentation" gets no help; `CLAUDE.md` is always in context and closes that gap.
   [Make sure it shows up](get-started.md#make-sure-it-shows-up) explains why this is the highest-leverage part of the rollout.

1. **Tell your contributors one sentence.**
   They do not need a command or this page.
   "Ask Claude Code for help writing docs, the way you already would" is the whole instruction; [Write docs with Docs Assist](write-docs-with-docs-assist.md) is the page to send anyone who wants more.

1. **Run an audit to get a baseline**, so the next one has something to compare against.

   ```text
   /docs-assist:audit docs/
   ```

## You are done when

- `.docs-assist/` is committed and your team is working from it.
- `CLAUDE.md` has the documentation section, and a contributor who asks for docs help in plain words gets the plugin rather than a generic assistant.
- You have one audit on record.

If a contributor asks for documentation help and nothing changes about the answer, reachability is the thing to check first.

## What changes for your contributors

**Before the plugin**, a contributor opens Claude Code and says "help me document how the deployment pipeline works." Claude Code produces something technically accurate but flat: a markdown file that describes what happens, with no particular structure, no connection to related docs, and formatting that doesn't match anything else in the repo.

**With the plugin**, the same request triggers a different workflow.
Claude Code first looks at the existing documentation to understand what's already there.
Then it asks the contributor to share everything they know, reflects it back, and connects it to the existing docs and how people use the product before digging into the gaps.
It pulls out the prerequisites, gotchas, and decision points the contributor mentions casually, and confirms an outline before writing.
It picks the right content type (a how-to, a concept, a troubleshooting guide) without the contributor needing to know those categories, and can start from a proven template.
It produces a draft that follows your team's formatting conventions, keeps code examples consistent, includes cross-references to related docs, and flags where existing content should link back to this new page.

The contributor reviews for technical accuracy.
Claude Code handles everything else.

## What changes for you

You stop being the bottleneck.
Instead of reviewing every doc for style, structure, and consistency, the plugin enforces those standards at the point of creation.
Contributors produce docs that already follow your conventions.

You get to focus on the strategic work: information architecture, content gaps, audience research.
The plugin handles the tactical work of making sure individual docs are well-formed and connected.

You can also customize the standards.
The plugin ships with defaults (sentence-case headings, action-oriented headings, specific markdown conventions), but you can edit the configuration files to match your team's style guide.

## Customize for your team

Customization is project-local config you commit, which is what makes it survive plugin updates and reach everyone.
`/docs-assist:setup` scaffolds it, and [what setup writes](get-started.md#what-setup-writes-and-how-to-remove-it) lists every file, whether it is committed, and how to remove it.

The two you will edit by hand:

- `.docs-assist/config.yml` for machine-checkable settings, which also generates the linter config so your rules live in one place.
- `.docs-assist/style.md` for the judgment calls: voice, terminology, the phrases you ban.

This repo runs on the same setup.
Its committed `.docs-assist/` is a real worked example, including a `decisions.md` recording the calls that were not obvious.

## What this doesn't replace

This plugin gives your contributors documentation expertise at the point of writing.
It doesn't replace the judgment calls a documentation lead makes about information architecture, content strategy, or what to document next.

Think of it as the tactical layer: consistent, well-structured, connected docs from every contributor.
You still provide the strategic layer: what gets documented, how it's organized, and where the gaps are.
