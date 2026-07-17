# Knowledge Intake

This is how Docs Assist gathers before it structures.

A good technical writer does not open with a form.
They get everything out of the expert's head first, reflect it back, connect it to the rest of the product, and only then decide what to write.
This file is that method, so the plugin works the way a writer at the contributor's side works.

Load this whenever someone asks to document something new, whether it is one topic with one expert or a from-scratch pile of raw material.

## The Intake Loop

The same eight moves serve one doc or a whole set. Later moves lean on earlier ones, so do not skip ahead.

1. **Survey** what already exists, quietly.
1. **Dump**: invite everything they know, unstructured.
1. **Reflect** it back so they know they were heard.
1. **Situate** it against the existing docs, the product, and how people use it.
1. **Reconcile**: offer to fact-check the dump against the code and the existing docs. This is the preflight checkpoint: the offer is always made before anything is shaped, and the contributor decides.
1. **Dig** at the gaps the dump left.
1. **Shape**: pick the content type, and notice when it is really several docs.
1. **Draft**, review, finalize.

The value is in gathering first. A narrow question asked too early gets a narrow answer and buries the good material. The dump surfaces it.

## 1. Survey First, Quietly

Before you say anything, build context so your later questions are sharp, not generic.

- Read `llms.txt` if it exists, then scan the docs directory and read frontmatter from related docs. You are looking for what this topic touches, not reading everything.
- Note light feature signals from the repo: names, commands, config, and routes that relate to the topic. Do not do a deep code analysis; you want enough to connect the dots, not a source audit.
- Check for `.docs-assist/example-variables.txt` or `.docs-assist/terms.txt`. These are the pre-`reference.yml` format; the plugin no longer reads them. If either exists, offer a one-time migration into `.docs-assist/reference.yml` (see "Migrating" in `reference-registry.md`) rather than silently drafting or auditing as if no registry existed.
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

## 5. Reconcile: Fact-Check the Dump

Expert memory is honest and unreliable at the same time: defaults change, behavior shifts between releases, and secondhand knowledge arrives with the same confidence as firsthand.
Reconcile before you dig, so your questions build on what is true.

The fact-check is the contributor's choice, offered before it starts.
Make the offer once the dump is in hand ("want me to check this against the code before we go further?"), say what it costs (a short read of the relevant source), and respect a no.
The preflight rule is about the offer, not the outcome: do not shape or draft until the contributor has accepted or declined.
When they decline, proceed normally, note in the final review that the dump's claims were taken as given, and let the draft flow's verify step still confirm the specifics the doc states.

Sort the dump's claims into three buckets, and treat each differently:

- **Checkable against the code** (commands, flags, defaults, error text, behavior): check them. The scope is tiered: every claim the eventual doc will state gets hard verification (the draft flow deepens this later); the rest of the dump gets a scan for contradictions, not an exhaustive audit. When a notes file is in use (see "Persist as You Go"), record what you confirm here in its Reconcile section, so the draft flow's verify step and second-opinion pass build on it instead of re-reading the same source to re-derive it.
- **Checkable against the existing docs**: flag where the dump contradicts something already published. One of them is wrong, and it matters which.
- **Unverifiable** (intent, history, tribal knowledge, external systems): mark as SME-attested and move on. These are often the most valuable content. Never demand proof for a gotcha; record who attested it instead (see the ledger below).

Deliver the reconciliation as a short read-back, folded into the dig when that flows better:

> "Confirmed against the code: X and Y. One conflict: you said the retry default is 3, but `config.ts` sets 5. Which is right?"

When the dump and the code disagree, **ask, never assume**. The contributor misremembering and the contributor having just found a bug look identical from here.
If they say the code is wrong, offer to record it (a `gh issue` when the repo uses GitHub, a follow-up note otherwise), and write the doc to the intended behavior with the discrepancy flagged.

After the reconcile runs, offer the ledger: claims that survive into a doc on the expert's word alone can be recorded in the doc's `sme-attested` frontmatter (see `frontmatter-spec.md`), so a future reviewer verifies specific claims instead of re-reviewing everything.
This is a separate yes: not every pipeline accepts unapproved frontmatter fields, and a strict SSG schema can reject a build over one.
When they decline, keep the attested-claims list in the conversation's review notes (or the saved report) instead of the frontmatter.

This move guards every door, not only the conversational dump: `doc-intake` reports code conflicts in its inventory, so corpus piles and returned intake packets arrive pre-reconciled, and the consolidator resolves what they flag.

## 6. Dig: Ask the Sharp Questions Now

Only now, with the dump and the survey in hand, ask the targeted questions. They land because they are specific. Aim at the gaps, not the basics.

- **Prerequisites** the expert takes for granted (the assumption gap).
- **Decision points** where the path forks by context, role, or setup.
- **Failure modes**: what breaks, what is confusing, what people get wrong the first time. Often the most valuable content.
- **Usage and audience**: who this is for and what they should be able to do afterward.
- **Verification**: how a reader knows it worked.

Ask two or three at a time, conversationally. Never run down the list like a checklist.

## 7. Shape: One Doc, or Several?

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

## Capture Knowledge Asynchronously

The knowledge often lives with someone who is not in the session: the engineer who built it, the support lead who fields the tickets.
Do not make the writer choose between waiting and guessing. Send the questions to the knowledge instead.

- **Generate an intake packet**: a Markdown file of targeted questions the expert can answer in minutes, in any order, as messily as they like. It is the dig step, made portable.
- **Pre-load it from the survey and the code**, so the questions are sharp, not generic: "The retry default is 3; when should someone change it, and to what?" beats "describe the retry behavior." Include what you already know so the expert corrects instead of dictating.
- **Write it to `.docs-assist/intake/packets/<topic>.md`**, with `<topic>` a kebab-case slug of the doc's working title, and hand it to the writer to send over whatever channel they use. The packet states, at the top, that order and polish do not matter.
- **Ingest the returned answers** as a pile slice: `doc-intake` reads them into the inventory, and drafting proceeds from there, conversationally or via the fan-out.
- **Never block on a packet.** Draft what the material already supports and flag the rest; fold the answers in when they arrive.

## Persist as You Go (Opt In)

A single-doc dump normally lives in conversation, not a file (see below). But some drafts are not a single sitting: a long or many-part dump, a contributor who says "let me check and get back to you," or a Shape call that reveals several docs all mean the work will outlast this conversation.

**Offer, don't default.** Once a signal like that shows up, ask once: "This looks like it'll take a few sittings. Want me to keep a running notes file as we go, so we can pick this back up without you re-explaining everything?" A repo can set a standing preference in `.docs-assist/config.yml` (see `config-resolution.md`) for a team that always wants this, but the per-session offer is what runs by default.

When accepted, write to `.docs-assist/intake/notes/<topic>.md` (the same kebab-case topic slug convention as an intake packet) and keep it current after every move from Dump onward:

```markdown
---
topic: "webhook retry configuration"
status: in-progress   # in-progress | ready-to-draft | complete
updated: 2026-07-17
---

# Notes: Webhook Retry Configuration

## Status

- [x] Survey
- [x] Dump
- [x] Reflect
- [ ] Situate
- [ ] Reconcile
- [ ] Dig
- [ ] Shape

## Dump

- Cleaned into bullets, not a transcript.

## Reflected Summary

## Situate

Connections to other docs and features found.

## Reconcile

- Confirmed against the code: ...
- Conflicts: ...
- SME-attested: ...

## Dig

- Open: ...
- Answered: ...

## Shape and Outline

Content type, whether this is one doc or several, and the outline once decided.
```

The `status` frontmatter field is what the Survey move's resume check reads; keep it current so a glob over `.docs-assist/intake/notes/` can tell an unfinished note from a completed one without opening every file.

If Shape reveals more than one doc, this file keeps tracking the one being drafted now; list the rest under Shape and Outline as the backlog, per the usual "draft the first, backlog the rest" rule, rather than forking a notes file per doc.

Once this file exists, later drafting moves (proposing the outline, producing the draft) read it as their source instead of relying on conversation memory.

**Resuming across a session boundary needs an explicit trigger; nothing carries this awareness on its own.** A new conversation does not know a notes file exists unless something looks for it. The Survey move already scans the docs directory and `llms.txt` before anything else: extend that scan to glob `.docs-assist/intake/notes/*.md` for a file matching the topic, or list what is in progress when the topic is unclear, and offer to resume from it rather than starting the intake loop over. This runs whenever a drafting command is invoked, so the contributor does not need to remember the file exists.

A team that wants a new session to open already aware of unfinished notes, without the contributor asking, can add that same check to a `SessionStart` hook via `/docs-assist:setup-hooks` (default off, like every hook that command installs).

## Persist the Synthesis, Not the Raw Pile

Keep what is reusable; do not hoard raw material.

- **Persist the inventory or plan**, the synthesized artifact a team can resume from. Write it to `.docs-assist/intake/`, outside the published docs tree, so a static-site build never picks it up. These are working artifacts: commit them if the team wants a shared, resumable record, or add `.docs-assist/intake/` to `.gitignore` to keep them local.
- **Hold a single-doc dump in the conversation by default.** Persist it mid-loop only on the contributor's opt-in (see Persist as You Go, above) or once the dump turns out to hold more than one doc.
- **Do not persist raw dumps from sensitive sources** (support tickets, customer data, security details) without asking. Git history is permanent and shareable. When in doubt, ask before writing, and summarize rather than paste.
- **Give it a lifecycle.** An intake artifact is working material. Offer to archive or delete it once the docs it seeded exist.
