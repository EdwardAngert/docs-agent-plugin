# Documentation Templates

This reference explains how Docs Assist suggests and applies external documentation templates, so a contributor gets a proven starting structure instead of a blank page.

The built-in catalog is The Good Docs Project, a widely used, openly licensed template set.
Templates supplement the canonical content types in `content-types.md`; they do not replace them.
Suggesting a template is always available and offline; fetching one happens only when the contributor accepts.

## The Core Idea: Suggest, Do Not Impose

A template is a head start, never a requirement.
The support lead who keeps closing the same ticket should be able to say what is happening in plain words and get the right skeleton back, without knowing template names.

The flow is always: the contributor describes the problem, you suggest a template, they accept it, pick another, or decline and use the built-in structure.
Picking a template is one option in the conversation, not a gate in front of it.

## Index Here, Body Fetched Live

The plugin ships a catalog, not the templates.

- The catalog (`${CLAUDE_PLUGIN_ROOT}/assets/templates/gooddocs-catalog.yml`) is an index: for each template it lists a description, the content type and user need it serves, the signals that hint at it, and the URLs for the skeleton and its fill-in guide.
- The template body is fetched live from its URL only when the contributor picks it.

The catalog is what lets you suggest a template without holding every template in context.
The live fetch is what keeps the body current without vendoring a copy that goes stale.

## Suggest Freely, Fetch on Yes

Suggesting a template and fetching one are two different acts with two different costs.

- **Suggesting is free and offline.** The catalog ships with the plugin, so you can always name a fitting template as part of a normal drafting conversation. No configuration is required to offer one.
- **Fetching needs the contributor's yes.** Pulling a body is a network call, so it only happens when they accept the suggestion. Their acceptance is the consent.

This is how the feature stays discoverable without ever fetching something the contributor did not ask for.

Read `.docs-assist/templates.yml` to decide how forward to be:

- **Absent or `enabled: false`:** still offer a template once when it fits, because offering is free. If they accept, fetch it (the yes is consent), then offer to save `enabled: true` so the team is not asked every time.
- **`enabled: true`:** treat templates as a normal part of drafting. Suggest and fetch on acceptance without a separate confirmation step.
- **`fetch: off`:** never pull a body. You may still describe the template's shape from the catalog and draft from `content-types.md`.

Never fetch without an explicit yes. The full schema lives in `config-resolution.md`.

## Select a Template

There are two selection models, set by `selection_model` in `templates.yml`.

### Content-Type Model (Default)

You have already chosen a content type for the doc (see `content-types.md`).
Match it to a catalog entry by the `content_type` field, and suggest that template.
When several entries share a content type (for example `reference` covers reference, API reference, glossary, and release notes), use the `signals` and the contributor's own words to pick the closest one.

### Seven-Action Model

When `selection_model: seven-action`, lead with what the reader needs to do rather than the content type.
This is [Fabrizio Ferri Benedetti's seven-action model](https://passo.uno/seven-action-model/).
Ask what the reader is trying to accomplish, map the answer to an action, then suggest the templates for that action.

| Action | The reader wants to | Typical templates |
|---|---|---|
| Appraise | Judge whether the product fits | readme, release-notes |
| Understand | Grasp how or why it works | concept, glossary |
| Explore | Try it with a low barrier | quickstart, api-getting-started |
| Practice | Carry out a task | how-to, tutorial, installation-guide |
| Remember | Look a detail up | reference, api-reference |
| Develop | Extend or integrate | api-reference, api-getting-started |
| Troubleshoot | Diagnose and fix a problem | troubleshooting, contact-support |

The `seven_action` field in the catalog carries this mapping.
After the action narrows the field, use `signals` to land on one template.

### Suggest From Signals

Whichever model is set, use the `signals` in the catalog to recognize intent from how the contributor talks.
"People keep opening tickets about the same timeout" is a troubleshooting signal.
Name the template you are suggesting and why in one sentence, then let them accept or redirect.

## Fetch the Template

When the contributor accepts a suggestion:

1. Fetch the `template_url`. Read the `guide_url` too when you need to understand how a section is meant to be filled.
1. Use the skeleton as the document's structure. Fill it with the contributor's knowledge following the normal drafting workflow and the standards in `tone-and-voice.md`.
1. Adapt, do not transcribe. Drop sections that do not apply, and keep the plugin's formatting rules over the template's (heading case, list markers, no em dashes).

## Fall Back by Asking

If a fetch fails (offline, the source is down, a rate limit), do not silently drop to the built-in structure.
Tell the contributor what happened and offer the choice:

- Retry the fetch.
- Proceed with the built-in structure from `content-types.md`.
- Cancel and come back to it.

If no template fits the contribution, say so and draft from the built-in content type instead.
A missing template is never a reason to stop.

## Record the Template in Frontmatter

`content-type` stays canonical: one of the six values in `content-types.md`.
When a doc was seeded from a template, also set the optional `template` field to the catalog `id`, so the origin is traceable.

```yaml
content-type: troubleshooting
template: troubleshooting
```

See `frontmatter-spec.md` for the field definition.

## Attribute the Source

Add the `attribution` line from `templates.yml` to a doc seeded from a fetched template.
The default source, The Good Docs Project, is MIT-0 and requires no attribution; the line acknowledges it as good practice.
The repository-level notice lives in `THIRD-PARTY-NOTICES.md`.

## Where This Plugs In

- **Draft** (`/docs-assist:draft`): after the content type is chosen, suggest a template and, if accepted, draft on its skeleton.
- **Plan** (`/docs-assist:plan`): note the suggested template for each planned doc, so the plan and the eventual drafts line up.
- **Template** (`/docs-assist:template`): scaffold a chosen template on demand, and turn the feature on for a project.
