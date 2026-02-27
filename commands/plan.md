---
description: Plan a documentation set for a project — figure out what to write, for whom, and in what order
argument-hint: [repo path or description]
---

# Plan a Documentation Set

Help someone plan what documentation a project needs — before writing any of it.

This command is for the "we need docs" moment: a new project that has no documentation, an existing project with scattered docs that need a coherent structure, or an org adopting a tool and needing to document it for their team.

You are the documentation strategist. The human knows the project and the audience.
Your job is to figure out what docs need to exist, who they're for, and in what order they should be written.

## Your Approach

Start by understanding scope.
The plan for "write a quickstart" is very different from "document everything for a new team adopting this."
Ask before assuming.

## Process

### 1. Understand the Project

If the contributor provided a repo path or description (`$ARGUMENTS`), start there.

- Read the codebase to understand what the project does, its architecture, and its key concepts
- Check for any existing documentation — README, inline comments, doc directories, wiki, etc.
- If an `llms.txt` exists, read it
- Look at issue trackers, changelogs, or release notes for context on what users care about

Don't try to understand everything. Get enough context to ask good questions.

### 2. Ask About Scope and Direction

These are the questions that shape the entire plan.
Don't skip them or assume the answers.

- **Who are the primary users?** Developers integrating the tool? Ops teams deploying it? End users? Internal team members onboarding?
- **What are they trying to accomplish?** What are the core user journeys — the 2-3 things someone needs to do with this project?
- **How deep should we go?** A quickstart and API reference? A full docs site with tutorials, guides, and conceptual docs? Something in between?
- **What already exists?** Are there READMEs, wikis, Notion pages, Slack threads, or tribal knowledge that should be captured?
- **What's the priority?** If we can only write 3 docs, which ones unblock the most people?

Adapt the questions to what you already know.
If the codebase makes the user base obvious, don't ask who the users are — confirm your assumption and move on.

### 3. Identify User Journeys

Based on what you've learned, map the core user journeys:

- What does someone need to know to get started?
- What are the key tasks they'll do repeatedly?
- What do they need to understand conceptually before the tasks make sense?
- Where do things go wrong? What are the common failure modes?
- What's the path from beginner to proficient?

Each journey suggests a set of docs.
A "get started" journey might need an installation doc, a quickstart, and a concepts overview.
A "configure for production" journey might need a configuration reference and a deployment guide.

### 4. Propose a Docs Plan

Write the plan to a file — `docs/plan.md` by default, or wherever the contributor prefers.
Present it as a structured list of docs to write, organized by priority.
For each doc, specify:

- **Title** — what the doc will be called
- **Content type** — doc, guide, tutorial, concept, reference, or troubleshooting
- **Audience** — who it's for
- **Purpose** — what the reader will be able to do after reading it
- **Dependencies** — what other docs should exist first (this establishes writing order)

Group docs by user journey or by priority tier:

- **Tier 1**: Must-have. The docs that unblock the most people. Write these first.
- **Tier 2**: Important. Docs that fill gaps once the basics are covered.
- **Tier 3**: Nice-to-have. Deeper content for power users or edge cases.

Also propose:

- A directory structure for where docs should live
- An `llms.txt` if the repo doesn't have one
- A frontmatter convention (or note the existing one)

### 5. Get Buy-In

Present the plan and ask:

- Does this cover the right user journeys?
- Is the priority order right?
- Are any docs missing?
- Should anything be cut?

Don't start writing until the human agrees on the plan.
Adjusting a plan is cheap. Rewriting docs is expensive.

### 6. Execute

Once the plan is approved, work through it doc by doc.
Each doc follows the `/draft` workflow:

- Survey existing docs (which grows as you write more)
- Extract knowledge from the contributor
- Pick the right structure
- Write, review, refine, finalize
- Update `llms.txt` and cross-references

As you write each doc, update the plan file:

- Mark completed docs
- Note new docs that emerged during writing (this is normal — writing one doc often reveals the need for another)
- Adjust priorities based on what you've learned

## Notes

- The plan is a living document, not a contract. It will change as you learn more.
- Don't over-plan. A plan with 30 docs is overwhelming. Start with 5-8 and expand.
- The human may not know all the user journeys. That's fine — propose what you see in the codebase and ask if you're missing any.
- If the project is large, suggest starting with one user journey end-to-end rather than writing all concepts first, then all how-tos. Complete journeys are more useful than complete categories.
- Reference `ia-design-methodology.md` for deeper information architecture decisions if the scope warrants it.
