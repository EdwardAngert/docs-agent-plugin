---
description: "Draft a new document with guided help: bring your expertise, the plugin handles the writing"
argument-hint: [topic or issue number]
---

# Draft a Document

Help a subject matter expert turn their knowledge into a well-structured document.

You are the documentation expert. The human has the domain knowledge.
Your job is to get what they know out of their head and into a clear draft. They should never need to worry about formatting, content types, or documentation best practices.

## Your Approach

Be conversational and low-pressure.
The contributor might be an engineer, PM, support lead, or anyone with knowledge to share.
They may not write docs often. That's fine. You're here to make it easy.

Gather before you structure. Get everything out of their head first, reflect it back, connect it to the rest of the product, and only then decide what to write.
The full method is in `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/intake.md`. Read it and follow it; this file adds only what is specific to drafting one doc.

## Process

### 1-6. Run the Intake Loop

Run the first six intake moves as `intake.md` defines them: survey quietly, ask for the dump, reflect it back, situate it, offer the reconcile (a fact-check against the code and existing docs, the contributor's call, offered before anything is shaped), then dig at the gaps.

Draft-specific notes for those moves:

- **Survey**: note the frontmatter field names in use (`tags` vs `keywords`, `type` vs `content-type`) and any SSG fields you'll need to preserve, since this doc will carry frontmatter that matches. Also glob `.docs-assist/intake/notes/*.md` for a file matching this topic, or list any with `status: in-progress` if the topic is unclear. If one exists, offer to resume from it instead of starting the loop over.
- **Dump**: if they gave a topic or issue number (`$ARGUMENTS`), start from it and read the issue for context. If the dump runs long, is many-part, or the contributor signals they'll need to step away, offer the running notes file at the Reflect read-back, never mid-dump (see "Persist as You Go" in `intake.md`). On yes, write and keep updating `.docs-assist/intake/notes/<topic>.md` through every remaining move.
- **Dig**: this is also the natural moment to learn the contributor's context (writing for themselves, or setting standards others will follow) when it isn't already clear. Calibrate offers accordingly, per the skill's calibration guidance.
- **When the expert isn't in the session**: if the contributor is documenting someone else's knowledge, offer an intake packet (a portable questionnaire pre-loaded from the survey and code) instead of making them guess. See the async section of `intake.md`. Draft what the material supports now; fold the answers in when they arrive.

### 7. Verify Against the Code

Confirm the details the draft will state, so it's accurate. This is targeted verification, not a full codebase map.

- If a notes file exists, start from its Reconcile section instead of re-deriving from scratch: it already holds what move 5 confirmed against the code. Read code again only for what's new since Dig, or what the Shape/Outline steps pulled in that Reconcile never saw. Re-reading a file you already reconciled wastes a pass for no new information.
- Read the specific code behind what you're documenting: the exact command names, flags, defaults, config keys, endpoints, and error messages the doc will mention.
- Reconcile the dump with the code. Where the contributor's memory and the code disagree, surface it and ask rather than guessing.
- Pull real values (defaults, limits, error strings) so the draft and its examples are correct.
- Record anything newly verified here back to the notes file's Reconcile section, if one is in use, so later moves inherit it too.

### 8. Shape: One Doc, or Several?

Decide the structure with `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/content-types.md`, and check the scope honestly:

- Write the quick user story outline first, per `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/user-stories.md`: one line per reader this doc serves (who, arriving from where, to do what, done when what), built from what the dump and the dig already told you. More than three stories is itself the several-docs signal below.

- A dump often holds more than one doc. If it mixes a task, an explanation, and failure modes, that's a how-to plus a concept plus troubleshooting. Say so, propose the small set in priority order, and offer to draft the first now and keep the rest as a short backlog.
- If it's genuinely ambiguous, default to a doc (task-oriented).
- Offer a starting template where one fits. Suggesting one is free and offline, so do it even if `.docs-assist/templates.yml` is absent; only fetch on the contributor's yes. See `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/templates.md`. A template is a head start, never a requirement.

### 9. Propose the Outline

For anything beyond a short entry, show the outline before writing the full draft. Changing an outline is cheap; rewriting a draft is not.

- If a notes file exists for this topic, base the outline on it rather than on conversation scrollback: it's had every move folded in, including any that happened in an earlier session.
- Present the user stories with the outline, and let them earn the structure: each section should serve a named story, and the prerequisites section is whatever the least-prepared story's reader is missing. Stories are cheap to correct here and expensive to discover wrong after publication.
- Present the sections and headings, a line each on what goes in them, and where code samples will go.
- Confirm scope and order, and adjust before drafting.
- Skip it for a very short doc (a single troubleshooting entry). Offer it rather than forcing it.
- Record the shape decision and outline back to the notes file, if one is in use.

### 10. Produce the Draft

Write the document, applying standards from `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/tone-and-voice.md` automatically. If a notes file exists, write from it: it already holds the reconciled facts, the SME-attested claims, and the answered dig questions.

- Clear, action-oriented headings
- Prerequisites section listing only what sits outside the calibrated reader's baseline (per the story's "what they already know"; see `user-stories.md`), not everything the doc happens to touch
- Numbered steps for procedures
- Code examples that are copy-paste safe and consistent with the rest of the docs. Follow `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/code-examples.md`: reuse variable names from related docs and the `.docs-assist/reference.yml` registry, and offer to create and maintain it.
- Notes or warnings where the contributor flagged gotchas
- Cross-references to related docs you found in the survey

**Before showing it to the contributor**, run the second-opinion pass on the draft file, per `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/second-opinion.md`. Draft-specific notes:

- The skip threshold is the same as skipping the outline in step 9: a very short single-entry doc gets no round trip.
- Brief it with the notes file's Reconcile section when one exists; that is this workflow's record of settled facts.
- Judgment findings fold into the **Do** list below, as your own read of the draft.

**Do not** ask the contributor to review your formatting choices, heading case, or markdown conventions. Apply them. These are your department.

**Do** ask the contributor to review:

- Technical accuracy: did you capture the steps correctly?
- Completeness: is anything missing?
- Audience fit: would this make sense to the intended reader?

### 11. Refine

Based on their feedback:

- Fix any technical errors immediately
- If they say "this section is confusing," ask what's wrong rather than blindly rewording it
- If they want to add something, slot it into the right place in the structure
- If the doc is getting long, suggest splitting it and explain why

### 12. Finalize

When the contributor is satisfied:

- Write the file to the appropriate location (ask if unsure where it should live), with a filename that follows existing conventions.
- Generate frontmatter following `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/frontmatter-spec.md`. At minimum `title`, `description`, and `content-type`. Add `audience`, `keywords`, `prerequisites`, and `related` when you have the context, and after this conversation you almost certainly do. Match existing frontmatter conventions.
- If you drafted on a template, set the optional `template` field to the catalog `id` and add the `attribution` line from `templates.yml`.
- If any claims made it in on the expert's word alone (marked SME-attested during the reconcile), offer to record them in the `sme-attested` frontmatter ledger so a future reviewer verifies specific claims, not the whole doc. A separate yes: not every pipeline accepts unapproved frontmatter fields. If declined, keep the list in the review notes instead.
- If the repo has an `llms.txt`, add an entry for the new doc.
- Update related docs to cross-reference this new content (or make the edits and show the contributor what you changed).
- In a git repo, when the work touched several files (the new doc plus cross-reference updates), offer to put the change set on a docs branch rather than leaving it on the default branch. Never commit to the default branch unless asked.
- For a procedural doc (a task, tutorial, or troubleshooting entry with executable steps), offer to run `/docs-assist:verify` on it before it ships: the `doc-verifier` subagent executes the steps in an isolated workspace and catches the step that works in the author's head but not in a fresh environment. On a clean pass, set `last-verified` with real evidence behind it.
- If `.docs-assist/config.yml` sets `lint.tools`, run them against the new file before calling it finished, and fix what they find. A fresh draft is the easiest time to catch a missing blank line or untagged fence, before it ships and needs a separate pass to find.
- Note remaining follow-ups: the backlog docs the dump revealed, images or diagrams that would help, or cross-references a subject matter expert should verify.
- If a notes file seeded this doc, offer to archive or delete it now that the doc it was tracking exists (per `intake.md`'s lifecycle rule for intake artifacts).

## Notes

- Never make the contributor feel like they're "doing it wrong." There's no wrong way to share knowledge.
- Messy, out-of-order information is normal and good. You sort it out.
- If they're unsure about something, note it as needing verification rather than skipping it.
- Match the technical depth to the calibrated baseline, not a fixed posture: read it from the project's own docs, what the tool is, and the ecosystem it lives in before defaulting to anything (see "Calibrate the Baseline" in `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/user-stories.md`). An SDK for experienced engineers doesn't need a terminal explained; a first-touch onboarding doc for non-engineers does. Both are correct for their reader; the failure is applying either posture to the wrong one.
- Follow existing repo conventions (frontmatter fields, directory structure, naming).
