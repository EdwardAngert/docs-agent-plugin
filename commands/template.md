---
description: "Suggest and scaffold a documentation template for a healthy start, from The Good Docs Project"
argument-hint: [problem, topic, or template name]
---

# Scaffold a Documentation Template

Give the contributor a proven starting structure instead of a blank page.
Built for the moment a support lead, engineer, or PM says "people keep asking about this and we should just write it down."

Templates supplement the content types in `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/content-types.md`; they never replace them.
The full method, including the catalog, selection models, fetch, and fallback, is in `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/templates.md`. Read it before you run this.

## Process

### 1. Turn the Feature On if Needed

Read `.docs-assist/templates.yml`.

- If it is missing, offer to scaffold it from `${CLAUDE_PLUGIN_ROOT}/assets/config/templates.yml` into the project's `.docs-assist/` directory, and set `enabled: true`. Explain that it is opt-in and fetches template bodies from The Good Docs Project (MIT-0) only when a template is picked.
- If it exists but `enabled: false`, ask before proceeding, and offer to flip it on.

### 2. Understand What They Need

Use `$ARGUMENTS` if given: a problem ("users keep hitting a login loop"), a topic, or a template name ("troubleshooting").
If nothing was passed, ask one question: what is the problem or topic, and what should the reader be able to do afterward.

Do not make them learn template names.
Their words are enough.

### 3. Suggest a Template

Follow the selection model in `templates.yml` (content-type by default, seven-action if set), using the catalog at `${CLAUDE_PLUGIN_ROOT}/assets/templates/gooddocs-catalog.yml`.

- Match their intent to a catalog entry using its `content_type`, `seven_action`, and `signals`.
- Name the one you suggest and why, in a sentence. Offer the closest alternative when it is a near tie.
- Let them accept, pick another, or decline and use the built-in structure.

### 4. Fetch and Scaffold

When they accept:

- Fetch the entry's `template_url`. Read its `guide_url` when you need to understand how a section is meant to be filled.
- Produce the doc on that skeleton, filled with what they know, applying `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/tone-and-voice.md`. Adapt the skeleton: drop sections that do not apply, and keep the plugin's formatting rules over the template's.
- If the fetch fails, tell them and offer to retry, use the built-in structure, or cancel. Never stop silently.

### 5. Finalize

- Set `content-type` to the canonical value and add the optional `template` field with the catalog `id` (see `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/frontmatter-spec.md`).
- Add the `attribution` line from `templates.yml` to the doc.
- Place the file, update `llms.txt` and cross-references, and hand off for a technical-accuracy review, the same as `/docs-assist:draft`.

## Notes

- Suggest, do not impose. A template is a head start, not a requirement.
- Opt-in and offline-safe. Nothing is fetched unless the feature is on and the contributor picks a template.
- For a full drafting conversation, `/docs-assist:draft` already offers a template at the right moment. Use this command to enable templates for a project or to scaffold one directly.
