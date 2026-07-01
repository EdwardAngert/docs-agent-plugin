# Knowledge Intake

This is how Docs Assist gathers before it structures.

A good technical writer does not open with a form.
They get everything out of the expert's head first, reflect it back, connect it to the rest of the product, and only then decide what to write.
This file is that method, so the plugin works the way a writer at the contributor's side works.

Load this whenever someone asks to document something new, whether it is one topic with one expert or a from-scratch pile of raw material.

## The Intake Loop

The same seven moves serve one doc or a whole set. Later moves lean on earlier ones, so do not skip ahead.

1. **Survey** what already exists, quietly.
1. **Dump**: invite everything they know, unstructured.
1. **Reflect** it back so they know they were heard.
1. **Situate** it against the existing docs, the product, and how people use it.
1. **Dig** at the gaps the dump left.
1. **Shape**: pick the content type, and notice when it is really several docs.
1. **Draft**, review, finalize.

The value is in gathering first. A narrow question asked too early gets a narrow answer and buries the good material. The dump surfaces it.

## 1. Survey First, Quietly

Before you say anything, build context so your later questions are sharp, not generic.

- Read `llms.txt` if it exists, then scan the docs directory and read frontmatter from related docs. You are looking for what this topic touches, not reading everything.
- Note light feature signals from the repo: names, commands, config, and routes that relate to the topic. Do not do a deep code analysis; you want enough to connect the dots, not a source audit.
- Hold what you find. You will use it to situate the dump and to spot what the expert leaves out.

## 2. Dump: "Tell Me Everything You Know"

Open with an invitation, not an interrogation. Ask for the brain dump first.

> "Before we structure anything, tell me everything you know about this. How it works, why it exists, the steps, the edge cases, what people get wrong. Do not worry about order or polish. Dump it, and I will organize it."

- Take it in whatever form it arrives: a ramble, pasted notes, a wall of text, links.
- Do not correct, reorder, or interrupt while it is coming out. Let it all land.
- If they stall, prompt gently along one thread ("what happens right after that?"), not with a new form.

This is the SME-facing version of a writer's pile. It is where the real material lives.

## 3. Reflect: Play It Back

Show them you heard it. This is what makes the plugin feel like a person, not a form.

- Summarize the dump in a short, structured read-back: the shape you are hearing, the key steps, the parts that stood out.
- Invite correction: "Here is what I have got. What did I get wrong, and what is missing?"
- Let them add. The read-back almost always jogs more out of them.

## 4. Situate: Connect It Outward

Place the knowledge in the product, using the survey. This is where a writer earns their keep.

- **Against existing docs:** what this overlaps with, extends, or should link to. Flag duplication and prerequisites.
- **Against the product:** the feature or flow this belongs to, from the light signals you gathered.
- **Against usage:** who reaches this, when, and what they do right before and after. If you cannot tell, this is a question for the dig, not a guess.

Say the connections out loud. "This overlaps with your Webhooks doc, it is a prerequisite for Scheduled Exports, and users usually hit it right after first setup." It orients the contributor and confirms your model.

## 5. Dig: Ask the Sharp Questions Now

Only now, with the dump and the survey in hand, ask the targeted questions. They land because they are specific. Aim at the gaps, not the basics.

- **Prerequisites** the expert takes for granted (the assumption gap).
- **Decision points** where the path forks by context, role, or setup.
- **Failure modes**: what breaks, what is confusing, what people get wrong the first time. Often the most valuable content.
- **Usage and audience**: who this is for and what they should be able to do afterward.
- **Verification**: how a reader knows it worked.

Ask two or three at a time, conversationally. Never run down the list like a checklist.

## 6. Shape: One Doc, or Several?

Decide the structure using `content-types.md`, and check the scope honestly.

- A dump often holds more than one doc. If it mixes a task, an explanation, and a set of failure modes, that is a how-to plus a concept plus troubleshooting, not one page.
- When it is several, say so and propose the small set, in priority order. Offer to draft the first now and keep the rest as a short backlog.
- Offer a starting template where one fits (`templates.md`).

Do not force a pile into a single page. Splitting early is cheaper than untangling later.

## From-Scratch Corpus: Build an Inventory First

When the input is a heterogeneous pile rather than one expert's dump (tickets, a PRD, Slack threads, interview notes, old docs), lead with a content inventory before any plan.

- **Gather the pile** where you can read it: a folder in the repo, pasted content, or links you can fetch.
- **Isolate the read.** A large pile should go to the `doc-intake` subagent, which reads it in its own context and returns a compact inventory. This keeps the raw pile out of the main conversation. For a big pile, fan out several across slices and consolidate.
- **Produce the inventory**, not a rewrite of the pile:
  - Clusters by topic, each tagged with a likely content type.
  - Gaps: what readers will need that the pile does not cover.
  - Duplication and conflict: the same thing said several ways.
  - Staleness: material that looks out of date.
- **Hand off to the plan.** The inventory feeds `plan.md`: the clusters become candidate docs, the gaps become priorities.

## Persist the Synthesis, Not the Raw Pile

Keep what is reusable; do not hoard raw material.

- **Persist the inventory or plan**, the synthesized artifact a team can resume from. Write it to `.docs-assist/intake/`, outside the published docs tree, so a static-site build never picks it up. These are working artifacts: commit them if the team wants a shared, resumable record, or add `.docs-assist/intake/` to `.gitignore` to keep them local.
- **Hold a single-doc dump in the conversation.** Only offer to save leftover knowledge as a note when the dump clearly holds more than one doc.
- **Do not persist raw dumps from sensitive sources** (support tickets, customer data, security details) without asking. Git history is permanent and shareable. When in doubt, ask before writing, and summarize rather than paste.
- **Give it a lifecycle.** An intake artifact is working material. Offer to archive or delete it once the docs it seeded exist.
