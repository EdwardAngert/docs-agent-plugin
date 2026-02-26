# Set Up Documentation Standards for Your Team

You have people who know things.
Engineers who built the feature.
Support leads who've seen every edge case.
PMs who understand the workflow end to end.

They're already writing documentation — ad hoc, in their own style, scattered across the repo.
Each doc is fine on its own.
But put them all together and there's no consistency, no cross-referencing, no connective tissue.

This plugin fixes that without hiring a dedicated technical writer.

## What the Plugin Does

The Documentation Agent is a Claude Code plugin that gives every Claude Code session documentation expertise.
When a contributor asks Claude Code for help writing docs, the plugin shapes how Claude Code responds — guiding the conversation, picking the right structure, applying formatting standards, and connecting the new content to what already exists.

The contributor doesn't interact with the plugin directly.
They just talk to Claude Code, and Claude Code acts like a documentation coach instead of a generic assistant.

## What Changes for Your Contributors

**Before the plugin**, a contributor opens Claude Code and says "help me document how the deployment pipeline works."
Claude Code produces something technically accurate but flat — a markdown file that describes what happens, with no particular structure, no connection to related docs, and formatting that doesn't match anything else in the repo.

**With the plugin**, the same request triggers a different workflow.
Claude Code first looks at the existing documentation to understand what's already there.
Then it asks the contributor a few focused questions: who's the audience, what should they be able to do after reading this, what are the prerequisites.
It pulls out gotchas and decision points the contributor mentions casually.
It picks the right content type — a how-to doc, a conceptual explanation, a troubleshooting guide — without the contributor needing to know those categories.
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
   /plugin marketplace add EdwardAngert/documentation-agent-skill
   ```

1. Install the plugin:

   ```bash
   /plugin install EdwardAngert/documentation-agent-skill
   ```

1. Restart Claude Code.

Once installed, the plugin activates automatically whenever someone asks for documentation help.
No special commands required — though `/documentation-agent:draft` walks through a more structured intake if you want it.

## Customize for Your Team

The plugin's standards live in editable files.
Start with these two:

- `skills/documentation-agent/tone-and-voice.md` — Heading case, list style, formatting conventions. Change AP title case to sentence case, swap `-` for `*` in unordered lists, add your company-specific conventions.
- `skills/documentation-agent/SKILL.md` — The core instructions. Add project-specific context, adjust the coaching approach, include terminology your team uses.

The other methodology files (`documentation-patterns.md`, `content-audit-framework.md`, `ia-design-methodology.md`, `style-guides.md`) contain deeper reference material.
Edit them if you need to, but the two above cover most customization needs.

## Run a Documentation Audit

If you want to assess the state of your existing docs, the plugin includes an audit command:

```bash
/documentation-agent:audit docs/
```

This produces a structured report covering content quality, structural issues, findability gaps, and prioritized recommendations.
It's a good starting point before rolling the plugin out to your team — it shows you what needs attention and helps you prioritize.

## What This Doesn't Replace

This plugin gives your contributors documentation expertise at the point of writing.
It doesn't replace the judgment calls a documentation lead makes about information architecture, content strategy, or what to document next.

Think of it as the tactical layer: consistent, well-structured, connected docs from every contributor.
You still provide the strategic layer: what gets documented, how it's organized, and where the gaps are.
