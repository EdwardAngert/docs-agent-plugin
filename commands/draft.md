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

### 1 Through 5: Run the Intake Loop

Run the first five intake moves as `intake.md` defines them: survey quietly, ask for the dump, reflect it back, situate it, then dig at the gaps.

Draft-specific notes for those moves:

- **Survey**: note the frontmatter field names in use (`tags` vs `keywords`, `type` vs `content-type`) and any SSG fields you'll need to preserve, since this doc will carry frontmatter that matches.
- **Dump**: if they gave a topic or issue number (`$ARGUMENTS`), start from it and read the issue for context.
- **Dig**: this is also the natural moment to learn the contributor's context (writing for themselves, or setting standards others will follow) when it isn't already clear. Calibrate offers accordingly, per the skill's calibration guidance.
- **When the expert isn't in the session**: if the contributor is documenting someone else's knowledge, offer an intake packet (a portable questionnaire pre-loaded from the survey and code) instead of making them guess. See the async section of `intake.md`. Draft what the material supports now; fold the answers in when they arrive.

### 6. Verify Against the Code

Confirm the details the draft will state, so it's accurate. This is targeted verification, not a full codebase map.

- Read the specific code behind what you're documenting: the exact command names, flags, defaults, config keys, endpoints, and error messages the doc will mention.
- Reconcile the dump with the code. Where the contributor's memory and the code disagree, surface it and ask rather than guessing.
- Pull real values (defaults, limits, error strings) so the draft and its examples are correct.

### 7. Shape: One Doc, or Several?

Decide the structure with `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/content-types.md`, and check the scope honestly:

- A dump often holds more than one doc. If it mixes a task, an explanation, and failure modes, that's a how-to plus a concept plus troubleshooting. Say so, propose the small set in priority order, and offer to draft the first now and keep the rest as a short backlog.
- If it's genuinely ambiguous, default to a doc (task-oriented).
- Offer a starting template where one fits. Suggesting one is free and offline, so do it even if `.docs-assist/templates.yml` is absent; only fetch on the contributor's yes. See `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/templates.md`. A template is a head start, never a requirement.

### 8. Propose the Outline

For anything beyond a short entry, show the outline before writing the full draft. Changing an outline is cheap; rewriting a draft is not.

- Present the sections and headings, a line each on what goes in them, and where code samples will go.
- Confirm scope and order, and adjust before drafting.
- Skip it for a very short doc (a single troubleshooting entry). Offer it rather than forcing it.

### 9. Produce the Draft

Write the document, applying standards from `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/tone-and-voice.md` automatically:

- Clear, action-oriented headings
- Prerequisites section if there are any
- Numbered steps for procedures
- Code examples that are copy-paste safe and consistent with the rest of the docs. Follow `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/code-examples.md`: reuse variable names from related docs and the `.docs-assist/example-variables.txt` registry, and offer to create and maintain that registry.
- Notes or warnings where the contributor flagged gotchas
- Cross-references to related docs you found in the survey

**Do not** ask the contributor to review your formatting choices, heading case, or markdown conventions. Apply them. These are your department.

**Do** ask the contributor to review:

- Technical accuracy: did you capture the steps correctly?
- Completeness: is anything missing?
- Audience fit: would this make sense to the intended reader?

### 10. Refine

Based on their feedback:

- Fix any technical errors immediately
- If they say "this section is confusing," ask what's wrong rather than blindly rewording it
- If they want to add something, slot it into the right place in the structure
- If the doc is getting long, suggest splitting it and explain why

### 11. Finalize

When the contributor is satisfied:

- Write the file to the appropriate location (ask if unsure where it should live), with a filename that follows existing conventions.
- Generate frontmatter following `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/frontmatter-spec.md`. At minimum `title`, `description`, and `content-type`. Add `audience`, `keywords`, `prerequisites`, and `related` when you have the context, and after this conversation you almost certainly do. Match existing frontmatter conventions.
- If you drafted on a template, set the optional `template` field to the catalog `id` and add the `attribution` line from `templates.yml`.
- If the repo has an `llms.txt`, add an entry for the new doc.
- Update related docs to cross-reference this new content (or make the edits and show the contributor what you changed).
- In a git repo, when the work touched several files (the new doc plus cross-reference updates), offer to put the change set on a docs branch rather than leaving it on the default branch. Never commit to the default branch unless asked.
- Note remaining follow-ups: the backlog docs the dump revealed, images or diagrams that would help, or cross-references a subject matter expert should verify.

## Notes

- Never make the contributor feel like they're "doing it wrong." There's no wrong way to share knowledge.
- Messy, out-of-order information is normal and good. You sort it out.
- If they're unsure about something, note it as needing verification rather than skipping it.
- Match the technical depth to the audience. Don't oversimplify for developers; don't assume expertise for end users.
- Follow existing repo conventions (frontmatter fields, directory structure, naming).
