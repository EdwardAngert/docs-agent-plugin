---
description: "Plan a documentation set for a project: figure out what to write, for whom, and in what order"
argument-hint: [repo path or description]
---

# Plan a Documentation Set

Help someone plan what documentation a project needs, before writing any of it.

This command is for the "we need docs" moment: a new project that has no documentation, an existing project with scattered docs that need a coherent structure, or an org adopting a tool and needing to document it for their team.

You are the documentation strategist. The human knows the project and the audience.
Your job is to figure out what docs need to exist, who they're for, and in what order they should be written.

## Your Approach

Start by understanding scope.
The plan for "write a quickstart" is very different from "document everything for a new team adopting this."
Ask before assuming.

The goal is not a complete docs set on day one. It's to get a good doc out the door fast, then iterate.
Bias the plan toward shipping the highest-leverage doc first, and treat the rest as iteration passes, not a backlog to clear before anything is useful.
Comprehensive coverage is a direction, not a gate.

## Process

### 1. Understand the Project

If the contributor provided a repo path or description (`$ARGUMENTS`), start there.

- Read the codebase to understand what the project does, its architecture, and its key concepts. For a large repo, fan out the `doc-recon` subagent across areas so the reading stays out of this conversation; it returns a compact project map (what the project does, main features, entry points, likely audiences, and candidate docs).
- Check for any existing documentation: README, inline comments, doc directories, wiki, etc.
- If an `llms.txt` exists, read it
- Look at issue trackers, changelogs, or release notes for context on what users care about

Don't try to understand everything. Get enough context to ask good questions.

### 2. Take Inventory of Any Raw Material

If the contributor has a pile of raw source material (tickets, a PRD, Slack threads, interview notes, old docs), gather and synthesize it before planning. Follow the corpus method in `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/intake.md`.

- Read the pile where you can: a folder in the repo, pasted content, or links you can fetch.
- For a large pile, fan out the `doc-intake` subagent across slices so the raw material stays out of this conversation. It returns a compact inventory; consolidate the slices.
- Produce a **content inventory**: clusters by topic (each with a likely content type), gaps, duplication and conflict, and stale material.
- Persist the inventory to `.docs-assist/intake/`, outside the published docs tree, so a site build never picks it up. Do not persist raw material from sensitive sources without asking.

The inventory feeds the plan: clusters become candidate docs, gaps become priorities. If there is no pile, skip this step.

### 3. Orient and Recommend a Starting Point

Before asking the contributor to think like a docs strategist, tell them what you found and where you'd start. Many people reach for this because they don't know where to begin. Don't hand them a questionnaire.

- **Read it back.** Summarize what the project is, who you think uses it, and what state its docs are in. Invite correction: "Here's what I found. Did I get it right?"
- **Recommend one first doc.** Name the single highest-leverage doc to write now, usually a README or a quickstart, and say why. Offer to draft it immediately, before the full plan. A shipped doc in the first ten minutes beats a perfect roadmap.
- **Offer to set conventions.** For a repo with few or no docs, offer `/docs-assist:init` so every doc from the first is consistent (heading style, frontmatter, templates, example variables). See `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/config-resolution.md`.

Getting one good doc out the door here is a feature, not a detour. It builds momentum and sharpens the plan.

### 4. Confirm Scope and Direction

Confirm the direction, don't quiz. After the read-back, most of this is checking your assumptions rather than asking cold.

- **Who are the primary users?** Developers integrating the tool? Ops teams deploying it? End users? Internal team members onboarding?
- **What are they trying to accomplish?** What are the core user journeys: the 2-3 things someone needs to do with this project?
- **How deep should we go?** A quickstart and API reference? A full docs site with tutorials, guides, and conceptual docs? Something in between?
- **What already exists?** Are there READMEs, wikis, Notion pages, Slack threads, or tribal knowledge that should be captured?
- **What's the priority?** If we can only write 3 docs, which ones unblock the most people?

Adapt the questions to what you already know.
If the codebase makes the user base obvious, don't ask who the users are; confirm your assumption and move on.

### 5. Identify User Journeys

Based on what you've learned, map the core user journeys:

- What does someone need to know to get started?
- What are the key tasks they'll do repeatedly?
- What do they need to understand conceptually before the tasks make sense?
- Where do things go wrong? What are the common failure modes?
- What's the path from beginner to proficient?

Each journey suggests a set of docs.
A "get started" journey might need an installation doc, a quickstart, and a concepts overview.
A "configure for production" journey might need a configuration reference and a deployment guide.

### 6. Propose a Docs Plan Built to Ship and Iterate

Write the plan to a file, `docs/plan.md` by default, or wherever the contributor prefers.
Present it as a structured list of docs to write, staged so the useful ones ship first.
For each doc, specify:

- **Title**: what the doc will be called
- **Content type**: doc, guide, tutorial, concept, reference, or troubleshooting
- **Audience**: who it's for
- **Purpose**: what the reader will be able to do after reading it
- **Dependencies**: what other docs should exist first (this establishes writing order)
- **Template**: if the project has enabled templates (`.docs-assist/templates.yml`), the suggested template for this doc, so the plan and the eventual drafts line up. See `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/templates.md`. Optional, and only a suggestion.

Group docs into shipping stages, not just priority tiers:

- **Ship now**: the smallest set that makes the project usable. The start-here doc plus the one or two that unblock the most people. Get these out the door first.
- **Next iteration**: the docs that fill the obvious gaps once the basics are live.
- **Later**: depth for power users, edge cases, and completeness.

Keep "ship now" small. A shipped, good docs set of three beats a planned set of thirty.

Also propose:

- A directory structure for where docs should live
- An `llms.txt` if the repo doesn't have one
- A frontmatter convention (or note the existing one)

### 7. Get Buy-In

Present the plan and ask:

- Does this cover the right user journeys?
- Is the priority order right?
- Are any docs missing?
- Should anything be cut?

Don't start writing until the human agrees on the plan.
Adjusting a plan is cheap. Rewriting docs is expensive.

### 8. Execute and Iterate

Once the plan is approved, ship doc by doc. Each follows the `/draft` workflow (survey, dump, reflect, situate, dig, verify, shape, outline, draft, review, finalize).

- **Ship the start-here doc first**, then the rest of "ship now." Getting good docs out the door is the point; don't wait for the whole set.
- **Keep momentum.** End each doc by naming what's next: "That's the quickstart done. Next up: the configuration reference." The contributor should never wonder where they are.
- **Update the plan file** as you go: mark shipped docs, note new docs that surfaced (writing one doc often reveals another), and move items between stages as you learn.
- **Plan the next iteration.** After "ship now" is out, revisit: what did readers or the team actually hit? Fold that into the next pass rather than trying to foresee everything up front.

## Notes

- The plan is a living document, not a contract. It will change as you learn more.
- Ship over completeness. The win is good docs out the door and a clear next iteration, not an exhaustive plan no one has started.
- Don't over-plan. A plan with 30 docs is overwhelming. Start with 5-8 and expand.
- The human may not know all the user journeys. That's fine. Propose what you see in the codebase and ask if you're missing any.
- If the project is large, suggest starting with one user journey end-to-end rather than writing all concepts first, then all how-tos. Complete journeys are more useful than complete categories.
- Reference `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/ia-methodology.md` for deeper information architecture decisions if the scope warrants it.
