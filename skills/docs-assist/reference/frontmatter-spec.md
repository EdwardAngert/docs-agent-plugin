# Frontmatter spec

This document defines the frontmatter schema Docs Assist offers when writing docs, and how it reads frontmatter a project already keeps.

## Frontmatter is offered, never required

**No plugin behavior depends on frontmatter.**

Three reasons, and they compound:

- **Site generators disagree.** Docusaurus, MkDocs, Starlight, Hugo, and Jekyll each accept a different schema, and a field one renders is a field another prints into the page body or rejects at build time.
- **A site generator cannot be assumed at all.** Plenty of documentation is plain markdown in a repository, read on the code host, with no build step to interpret anything.
- **Frontmatter pays off late.** It helps once a reader has landed on the page, and by then the page itself is in view and more useful than its metadata.

The plugin follows one rule: it writes only the frontmatter fields a project's docs already use, in the shape they already use them.
A doc in a project without frontmatter gets none.
Nothing the plugin needs for itself goes in a doc, in frontmatter or anywhere else: its working notes stay in the journal, outside git (`journal.md`).

When a team asks to set frontmatter up, the plugin offers the schema below and explains what each field buys.
It is a service the team asks for, not a convention imposed on files the plugin does not own.

## Why frontmatter still helps

When a project does keep it, good frontmatter serves three audiences at once:

- **AI tools** can scan frontmatter to understand a doc without reading the body, which makes the plugin's "survey existing docs" step fast and accurate.
- **Search engines and docs site search** index frontmatter fields.
  Keywords, descriptions, and content types improve discoverability.
- **Human docs teams** can filter, audit, and understand their content landscape.
  "Show me all troubleshooting docs aimed at admins" becomes a query, not a manual review.

## Schema

### Recommended fields

These are the fields worth having on every doc in a project that keeps frontmatter, and the ones the plugin offers when a team asks to set frontmatter up.

```yaml
---
title: "Configure webhook retries"
description: "Set up automatic retry logic for failed webhook deliveries, including backoff intervals and failure thresholds."
content-type: doc
---
```

**`title`** The document title.
Should match the H1 heading in the body.

**`description`** One or two sentences summarizing what the doc covers and what the reader will be able to do after reading it.
Write it the way you'd explain the doc to a coworker, not SEO filler, not marketing copy.

**`content-type`** The document's structural category.
Use one of: `doc`, `guide`, `tutorial`, `concept`, `reference`, `troubleshooting`.
These map to the content types defined in `content-types.md`.

### Fields worth adding

These fields add significant value for AI tools, search, and docs teams.
The plugin offers them to a team setting frontmatter up, and fills them on new docs once the project uses them.

```yaml
---
title: "Configure webhook retries"
description: "Set up automatic retry logic for failed webhook deliveries, including backoff intervals and failure thresholds."
content-type: doc
audience: developers
keywords:
  - webhooks
  - retries
  - error handling
  - backoff
prerequisites:
  - "docs/webhooks/setup.md"
related:
  - "docs/webhooks/troubleshooting.md"
  - "docs/api/error-codes.md"
---
```

**`audience`** Who this doc is for.
Use terms that match how your team talks about users: `developers`, `admins`, `end-users`, `new-hires`, etc. This isn't a controlled vocabulary.
Use what makes sense for your project.

**`keywords`** Terms someone would use when looking for this content.
These should be words and phrases a person would actually search for, not abstract categories.
Include the specific technologies, features, or concepts the doc covers.

**`prerequisites`** Docs the reader should read or understand before this one.
Use relative paths to other docs in the repo.
This makes dependency chains explicit and helps the plugin avoid the "assumption gap" antipattern.

**`related`** Other docs that cover adjacent topics.
Use relative paths.
These become cross-references in the doc and help the plugin maintain connective tissue across the docs set.

### Optional fields

Use these when they apply, in a project that uses them.

```yaml
---
sdk: nodejs
languages:
  - javascript
  - typescript
---
```

**`sdk`** The SDK or tool this doc relates to.
Use when a doc is specific to one SDK in a multi-SDK project.

**`languages`** Programming languages covered in the doc's examples.
Helps AI tools and search filter by language.

### Verification dates

The plugin writes no verification date into a doc.
Site generators treat a field like `last-verified` differently or not at all, and the date would be the plugin's note left in the project's file.
When the plugin runs a doc's steps, it tells the contributor whether the doc runs clean, and notes the run in the journal.

A project that already records verification in its docs, its own way (a frontmatter field, a rendered component, a footer), keeps doing so: the plugin updates that record on the contributor's yes, in the project's format.
To let the decay detector read it, the project declares a `verified_body_pattern` in `.docs-assist/config.yml`: a regex with one capture group holding a `YYYY-MM-DD` date, matched against the whole doc.

```yaml
# .docs-assist/config.yml
verified_body_pattern: '<Verified date="(\d{4}-\d{2}-\d{2})"'
```

Single quotes are the safe form, since they keep the backslashes intact; a double-quoted or bare value with a trailing comment reads the same.
When a pattern is set but cannot work (invalid, no capture group, or no match in any doc), the decay report says so in a line of its own, so a mistyped pattern does not pass for a set of unverified docs.

## How the plugin uses frontmatter

### Write docs

When the write step places a new doc in a project whose docs carry frontmatter, it fills the fields those docs use:

- `title` and `description` come from the content.
- A content-type field, under the project's own name for it, comes from the write step's choice of content type.
- An audience field comes from the draft's "who it's for."
- Keywords come from the terms the doc actually uses.
- Prerequisite and related links come from the survey: the plugin already knows what other docs exist.

It fills only the fields the project's docs already carry.

### Survey existing docs

During the survey step of any workflow, the plugin scans existing docs.
If docs have frontmatter, the plugin reads it instead of reading full doc bodies.
This is faster, uses fewer tokens, and gives the plugin a structured understanding of the docs landscape.

Specifically, the plugin uses:

- `content-type` to understand what kinds of docs exist
- `keywords` to find related content
- `related` and `prerequisites` to understand how docs connect
- `description` to understand what each doc covers without reading it

### Audit with `/audit`

The audit command checks frontmatter as part of its review:

- Fields the project's docs consistently carry and one doc lacks are flagged
- Broken `prerequisites` and `related` paths are reported
- Inconsistent `content-type` usage is identified

## Adapt to existing repos

Most repos already have some frontmatter.
SSGs like Docusaurus, Hugo, Jekyll, and Astro each have their own conventions and required fields.
The plugin must work with what's there, not fight it.

### How the plugin detects existing conventions

During the survey step, the plugin reads frontmatter from multiple existing docs (not just one) to identify patterns:

- What fields are consistently present?
- What field names does the repo use?
  (`tags` vs `keywords`, `type` vs `content-type`, `category` vs `content-type`)
- What values appear?
  (Are content types free-text or from a fixed set?
  Are audiences standardized?)
- Are there SSG-specific fields?
  (`sidebar_position`, `slug`, `draft`, `weight`, `layout`, etc.)

This survey produces a mental model of the repo's frontmatter conventions that the plugin uses for all subsequent work in the session.

### Rules for conflict resolution

1. **Never overwrite existing fields.** If a doc already has `title`, `description`, or `tags`, they stay as they are.
   The contributor or SSG config put them there for a reason.
1. **Match existing field names.** If the repo uses `tags`, the plugin uses `tags`, not `keywords`.
   If it uses `type`, the plugin uses `type`, not `content-type`.
   The repo's convention wins.
1. **Preserve SSG-required fields.** Fields like the following are there because the build system needs them.
   Never remove or reorder them.
   - Docusaurus: `sidebar_position`, `sidebar_label`, `slug`
   - Hugo: `weight`, `layout`, `draft`
   - Jekyll: `layout`, `permalink`, `published`, `categories`
   - Astro: `draft`, `pubDate`, `heroImage`
1. **Add only fields the project already uses.** If the project's docs carry a field and a new doc needs it, the plugin fills it with the project's name for it.
   A field no doc in the project uses is not added, however useful it would be; offer it to the team instead.
1. **Don't duplicate semantics.** If the repo already has `tags` and the plugin would add `keywords`, it uses `tags`.
   One field per concept.

### Document the mapping

If the repo uses non-standard field names, note the mapping in `llms.txt` so the next session (or a different AI tool) doesn't have to re-derive it.
For example:

```markdown
> This repo uses `tags` for keywords, `type` for content type, and `category` for audience.
> Frontmatter follows Hugo conventions with additional metadata fields.
```

## Relationship to llms.txt

The per-doc frontmatter and the repo-level `llms.txt` work together:

- `llms.txt` is the map: it tells AI tools what docs exist, what they cover, and what conventions the repo uses
- Frontmatter is the detail: it tells AI tools about a specific doc without reading the body
- The plugin updates both: when it writes a new doc, it adds frontmatter to the doc and adds an entry to `llms.txt`

The llms.txt format, entry ordering, and maintenance contract are defined in `llms-txt.md`.
