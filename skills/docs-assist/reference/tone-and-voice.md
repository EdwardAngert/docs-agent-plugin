# Tone and Voice

- Use a **direct, clear, and instructional tone**
- Assume a **developer or technical admin** as your reader
- Avoid jargon unless necessary; explain new terms when introduced
- Prioritize **user actions** and outcomes

## Markdown Formatting Rules

### Headings

- Use `#`, `##`, `###`; avoid going deeper than `####`
- Top-level headings (H1) should only appear once per file
- Prefer heading structure over bold for organization
- **Do not use emojis in headings**
- Use **AP title case** for headings
  - Capitalize major words (nouns, verbs, adjectives, adverbs)
  - Lowercase articles (a, an, the), coordinating conjunctions (and, but, or), and short prepositions (in, on, for, to, with)
  - Always capitalize the first and last word
- Write **action-oriented headings**: use imperative verbs, not gerunds
  - Good: "Install the Plugin", "Configure Authentication"
  - Bad: "Installing the Plugin", "Configuring Authentication"
- Make headings **SEO-friendly**: use keywords users would search for
  - Good: "Troubleshoot Connection Errors"
  - Bad: "When Things Go Wrong"

> [!NOTE]
> AP title case is a style choice.
> Some teams prefer sentence case.
> Choose one and apply it consistently.

### Lists

- Use `1.` for **ordered lists** (Markdown auto-numbers)
- Use `-` for **unordered lists**
- Do not use emojis to start list items
- Keep list items as short as possible; use full sentences only when needed

> [!NOTE]
> The `1.` convention for ordered lists is a style choice.
> Some teams prefer explicit numbering (`1.`, `2.`, `3.`).
> The `1.` approach simplifies reordering and diffs.

### Code and Inline Elements

- Use backticks for:
  - File names (`manifest.json`)
  - CLI flags (`--debug`)
  - Inline code (`npm run build`)
  - Environment variables (`LOG_LEVEL`)
- Include a language tag on all code blocks (e.g., `bash`, `json`, `md`)
- Examples:

  ```bash
  npm install && npm run build
  ```

The separator `---` is for identifying YAML frontmatter only.
Do not use it to separate sections.

Per rule MD022: "Headings should be surrounded by blank lines"
And MD032: "Lists should be surrounded by blank lines"

### Links

- Use relative paths for internal links (e.g., `../admin/configure-firewall.md`)
- Avoid linking directly to headings, unless persistent
- Use link text that describes the destination purpose

## Visual Standards

### Alerts and Admonitions

- Use GitHub-flavored Markdown extensions:

  ```md
  > [!NOTE]
  > This feature requires version 2.1.0 or later.
  ```

## Terminology Consistency

Refer to:

- [Google style guide](https://developers.google.com/style/)
- [GitLab doc style](https://docs.gitlab.com/ee/development/documentation/styleguide/)

## Document Hygiene

- Avoid TODOs or placeholders in merged docs
- Check anchor links if you rename headings or move files
- Break lines after each period.
Markdown renders it as a single line, but line breaks help human editors scan content.

> [!NOTE]
> Line breaks after periods is a style choice.
> It improves diff readability and editing, but some teams prefer reflowed paragraphs.
