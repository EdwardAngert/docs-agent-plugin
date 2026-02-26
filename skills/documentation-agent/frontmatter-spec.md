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

### When Writing (the `/draft` workflow)

In step 7 (Finalize), the plugin generates frontmatter for the new doc:

- `title` and `description` come from the content
- `content-type` was determined in step 4
- `audience` comes from the intake conversation (step 2)
- `keywords` are extracted from the doc's content — terms the plugin identifies as significant
- `prerequisites` and `related` come from the survey step (step 1) — the plugin already knows what other docs exist

### When Surveying Existing Docs

In step 1 of any workflow, the plugin scans existing docs.
If docs have frontmatter, the plugin reads it instead of reading full doc bodies.
This is faster, uses fewer tokens, and gives the plugin a structured understanding of the docs landscape.

Specifically, the plugin uses:

- `content-type` to understand what kinds of docs exist
- `keywords` to find related content
- `related` and `prerequisites` to understand how docs connect
- `description` to understand what each doc covers without reading it

### When Auditing (`/audit`)

The audit command checks frontmatter as part of its review:

- Missing required fields are flagged
- Stale `last-verified` dates are noted
- Broken `prerequisites` and `related` paths are reported
- Inconsistent `content-type` usage is identified

## Adapting to Existing Repos

If a repo already has frontmatter conventions, the plugin adapts:

- It reads existing docs to identify what fields are in use
- It preserves all existing fields when editing docs
- It adds its recommended fields alongside existing ones
- It never removes or renames fields it didn't create

If the existing frontmatter uses different field names for the same concept (e.g., `type` instead of `content-type`, `tags` instead of `keywords`), the plugin matches the existing convention.

## Relationship to llms.txt

The per-doc frontmatter and the repo-level `llms.txt` work together:

- `llms.txt` is the map — it tells AI tools what docs exist and what they cover
- Frontmatter is the detail — it tells AI tools about a specific doc without reading the body
- The plugin updates both: when it writes a new doc, it adds frontmatter to the doc and adds an entry to `llms.txt`

See the repo's `llms.txt` for the manifest format.
