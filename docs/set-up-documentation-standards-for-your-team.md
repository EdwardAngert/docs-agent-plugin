---
title: "Set Up Documentation Standards for Your Team"
description: "Install and configure the Docs Assist plugin for your team: what changes for contributors, how to customize writing standards, and how to run your first audit."
content-type: doc
audience: docs-leads
keywords:
  - documentation standards
  - plugin setup
  - technical writing
  - team onboarding
---

# Set Up Documentation Standards for Your Team

You have people who know things.
Engineers who built the feature.
Support leads who've seen every edge case.
PMs who understand the workflow end to end.

They're already writing documentation, ad hoc, in their own style, scattered across the repo.
Each doc is fine on its own.
But put them all together and there's no consistency, no cross-referencing, no connective tissue.

This plugin fixes that without hiring a dedicated technical writer.

## What the Plugin Does

Docs Assist is a Claude Code plugin that gives every Claude Code session documentation expertise.
When a contributor asks Claude Code for help writing docs, the plugin shapes how Claude Code responds, guiding the conversation, picking the right structure, applying formatting standards, and connecting the new content to what already exists.

The contributor doesn't interact with the plugin directly.
They just talk to Claude Code, and Claude Code acts like a documentation coach instead of a generic assistant.

## What Changes for Your Contributors

**Before the plugin**, a contributor opens Claude Code and says "help me document how the deployment pipeline works."
Claude Code produces something technically accurate but flat: a markdown file that describes what happens, with no particular structure, no connection to related docs, and formatting that doesn't match anything else in the repo.

**With the plugin**, the same request triggers a different workflow.
Claude Code first looks at the existing documentation to understand what's already there.
Then it asks the contributor a few focused questions: who's the audience, what should they be able to do after reading this, what are the prerequisites.
It pulls out gotchas and decision points the contributor mentions casually.
It picks the right content type (a how-to doc, a conceptual explanation, a troubleshooting guide) without the contributor needing to know those categories.
It produces a draft that follows your team's formatting conventions, includes cross-references to related docs, and flags where existing content should link back to this new page.

The contributor reviews for technical accuracy.
Claude Code handles everything else.

## What Changes for You

You stop being the bottleneck.
Instead of reviewing every doc for style, structure, and consistency, the plugin enforces those standards at the point of creation.
Contributors produce docs that already follow your conventions.

You get to focus on the strategic work: information architecture, content gaps, audience research.
The plugin handles the tactical work of making sure individual docs are well-formed and connected.

You can also customize the standards.
The plugin ships with defaults (AP title case, action-oriented headings, specific markdown conventions), but you can edit the configuration files to match your team's style guide.

## Install the Plugin

1. Open Claude Code:

   ```bash
   claude
   ```

1. Add the marketplace:

   ```bash
   /plugin marketplace add EdwardAngert/docs-agent-plugin
   ```

1. Install the plugin:

   ```bash
   /plugin install docs-assist@docs-assist-marketplace
   ```

1. Restart Claude Code.

Once installed, the plugin activates automatically whenever someone asks for documentation help.
No special commands required.
A few commands are worth knowing:

- `/docs-assist:draft`: guided intake for a single document. Useful when a contributor wants a structured walkthrough: topic, audience, prerequisites, steps.
- `/docs-assist:plan`: for "we need docs for this project" moments. Reads the codebase, asks about users and goals, and produces a prioritized doc plan. Start here when rolling out documentation for a new project or team.
- `/docs-assist:init`: scaffold your team's configuration so everyone writes to the same conventions. Run this first.
- `/docs-assist:setup-lint`: add optional linting that checks the same rules the plugin writes by.
- `/docs-assist:update`: update the docs affected by a code change.

## Customize for Your Team

The recommended way to customize is project-local config you commit to your repo.
Run `/docs-assist:init` to scaffold a `.docs-assist/` directory:

- `.docs-assist/config.yml`: machine-readable settings (heading case, list markers, frontmatter field names, lint tool). This file also drives the linters, so your rules stay in one place.
- `.docs-assist/style.md`: prose conventions (voice, terminology, banned phrases).

Because this config is committed, it survives plugin updates and is shared across your whole team.

If you prefer, you can edit the plugin's own files directly: `skills/docs-assist/reference/tone-and-voice.md` for formatting and `skills/docs-assist/SKILL.md` for the coaching approach. Those edits do not survive a plugin update, so project-local config is the better default.

## Run a Documentation Audit

If you want to assess the state of your existing docs, the plugin includes an audit command:

```bash
/docs-assist:audit docs/
```

This produces a structured report covering content quality, structural issues, findability gaps, and prioritized recommendations.
It's a good starting point before rolling the plugin out to your team. It shows you what needs attention and helps you prioritize.

## What This Doesn't Replace

This plugin gives your contributors documentation expertise at the point of writing.
It doesn't replace the judgment calls a documentation lead makes about information architecture, content strategy, or what to document next.

Think of it as the tactical layer: consistent, well-structured, connected docs from every contributor.
You still provide the strategic layer: what gets documented, how it's organized, and where the gaps are.
