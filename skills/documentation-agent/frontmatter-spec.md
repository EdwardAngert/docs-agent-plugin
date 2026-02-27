# Frontmatter Spec

This document defines the frontmatter schema the Documentation Agent generates when writing docs.
The schema is opinionated — it defines recommended fields and what they mean — but not strict.
Missing fields don't break anything.
The plugin works with whatever frontmatter exists and fills in what's missing when it writes new docs.

## Why Frontmatter Matters

Good frontmatter serves three audiences at once:

- **AI tools** can scan frontmatter to understand a doc without reading the body. This makes the plugin's "survey existing docs" step fast and accurate.
- **Search engines and docs site search** index frontmatter fields. Keywords, descriptions, and content types improve discoverability.
- **Human docs teams** can use frontmatter to filter, audit, and understand their content landscape. "Show me all troubleshooting docs aimed at admins" becomes a query, not a manual review.

## Schema

### Required Fields

These fields should appear on every doc.
When the plugin writes a doc via `/draft`, it generates all of them.

```yaml
---
title: "Configure Webhook Retries"
description: "Set up automatic retry logic for failed webhook deliveries, including backoff intervals and failure thresholds."
content-type: doc
---
```

**`title`**
The document title.
Should match the H1 heading in the body.

**`description`**
One or two sentences summarizing what the doc covers and what the reader will be able to do after reading it.
Write it the way you'd explain the doc to a coworker — not SEO filler, not marketing copy.

**`content-type`**
The document's structural category.
Use one of: `doc`, `guide`, `tutorial`, `concept`, `reference`, `troubleshooting`.
These map to the content types defined in `documentation-patterns.md`.

### Recommended Fields

These fields add significant value for AI tools, search, and docs teams.
The plugin generates them when it has enough context to do so.

```yaml
---
title: "Configure Webhook Retries"
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

**`audience`**
Who this doc is for.
Use terms that match how your team talks about users: `developers`, `admins`, `end-users`, `new-hires`, etc.
This isn't a controlled vocabulary — use what makes sense for your project.

**`keywords`**
Terms someone would use when looking for this content.
These should be words and phrases a person would actually search for, not abstract categories.
Include the specific technologies, features, or concepts the doc covers.

**`prerequisites`**
Docs the reader should read or understand before this one.
Use relative paths to other docs in the repo.
This makes dependency chains explicit and helps the plugin avoid the "assumption gap" antipattern.

**`related`**
Other docs that cover adjacent topics.
Use relative paths.
These become cross-references in the doc and help the plugin maintain connective tissue across the docs set.

### Optional Fields

Use these when they apply.
The plugin adds them when relevant context is available.

```yaml
---
last-verified: 2026-02-26
sdk: nodejs
languages:
  - javascript
  - typescript
---
```

**`last-verified`**
The date someone last confirmed the doc's technical accuracy.
This is not the same as the file's last-modified date — a doc can be edited for formatting without being verified for accuracy.

**`sdk`**
The SDK or tool this doc relates to.
Use when a doc is specific to one SDK in a multi-SDK project.

**`languages`**
Programming languages covered in the doc's examples.
Helps AI tools and search filter by language.

## How the Plugin Uses Frontmatter

### Write Docs with `/draft`

In step 7 (Finalize), the plugin generates frontmatter for the new doc:

- `title` and `description` come from the content
- `content-type` was determined in step 4
- `audience` comes from the intake conversation (step 2)
- `keywords` are extracted from the doc's content — terms the plugin identifies as significant
- `prerequisites` and `related` come from the survey step (step 1) — the plugin already knows what other docs exist

### Survey Existing Docs

In step 1 of any workflow, the plugin scans existing docs.
If docs have frontmatter, the plugin reads it instead of reading full doc bodies.
This is faster, uses fewer tokens, and gives the plugin a structured understanding of the docs landscape.

Specifically, the plugin uses:

- `content-type` to understand what kinds of docs exist
- `keywords` to find related content
- `related` and `prerequisites` to understand how docs connect
- `description` to understand what each doc covers without reading it

### Audit with `/audit`

The audit command checks frontmatter as part of its review:

- Missing required fields are flagged
- Stale `last-verified` dates are noted
- Broken `prerequisites` and `related` paths are reported
- Inconsistent `content-type` usage is identified

## Adapt to Existing Repos

Most repos already have some frontmatter.
SSGs like Docusaurus, Hugo, Jekyll, and Astro each have their own conventions and required fields.
The plugin must work with what's there, not fight it.

### How the Plugin Detects Existing Conventions

During the survey step, the plugin reads frontmatter from multiple existing docs (not just one) to identify patterns:

- What fields are consistently present?
- What field names does the repo use? (`tags` vs `keywords`, `type` vs `content-type`, `category` vs `content-type`)
- What values appear? (Are content types free-text or from a fixed set? Are audiences standardized?)
- Are there SSG-specific fields? (`sidebar_position`, `slug`, `draft`, `weight`, `layout`, etc.)

This survey produces a mental model of the repo's frontmatter conventions that the plugin uses for all subsequent work in the session.

### Rules for Conflict Resolution

1. **Never overwrite existing fields.** If a doc already has `title`, `description`, `tags` — they stay as they are. The contributor or SSG config put them there for a reason.
2. **Match existing field names.** If the repo uses `tags`, the plugin uses `tags` — not `keywords`. If it uses `type`, the plugin uses `type` — not `content-type`. The repo's convention wins.
3. **Preserve SSG-required fields.** Fields like the following are there because the build system needs them. Never remove or reorder them.
   - Docusaurus: `sidebar_position`, `sidebar_label`, `slug`
   - Hugo: `weight`, `layout`, `draft`
   - Jekyll: `layout`, `permalink`, `published`, `categories`
   - Astro: `draft`, `pubDate`, `heroImage`
4. **Add missing fields alongside existing ones.** If a doc has `title` and `description` but no content type or keywords equivalent, the plugin adds those using the repo's naming convention (or its own defaults if no convention exists).
5. **Don't duplicate semantics.** If the repo already has `tags` and the plugin would add `keywords`, it uses `tags`. One field per concept.

### Document the Mapping

If the repo uses non-standard field names, note the mapping in `llms.txt` so the next session (or a different AI tool) doesn't have to re-derive it.
For example:

```markdown
> This repo uses `tags` for keywords, `type` for content type, and `category` for audience.
> Frontmatter follows Hugo conventions with additional metadata fields.
```

## Relationship to llms.txt

The per-doc frontmatter and the repo-level `llms.txt` work together:

- `llms.txt` is the map — it tells AI tools what docs exist, what they cover, and what conventions the repo uses
- Frontmatter is the detail — it tells AI tools about a specific doc without reading the body
- The plugin updates both: when it writes a new doc, it adds frontmatter to the doc and adds an entry to `llms.txt`

See the repo's `llms.txt` for the manifest format.
