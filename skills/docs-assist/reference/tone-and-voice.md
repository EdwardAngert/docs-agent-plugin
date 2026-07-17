# Tone and Voice

- Use a **direct, clear, and instructional tone**
- Assume a **developer or technical admin** as your reader when nothing more specific is known; calibrate below that floor for a beginner-facing doc and above it for an expert one, per each doc's own user story (see `user-stories.md`)
- Jargon and term explanations follow the same calibration: an expert-audience doc uses the field's own vocabulary without apology; a beginner-audience doc explains a term the first time it appears. Explaining what the calibrated reader already knows is the expert tax, the same failure as skipping what they don't
- Prioritize **user actions** and outcomes

## Avoid AI Voice

Documentation states and instructs; it does not hedge, sell, or perform confidence. The patterns below are the reliable tells of generated-sounding prose. Cut them on sight, the same way an em dash gets cut, and rewrite what was there into a direct statement rather than leaving a gap.

- **False contrast** (`it's not X, it's Y`, `this isn't just X, it's Y`): state the fact instead of the frame. `The retry queue processes in order` beats `It's not random, it's ordered`. If the contrast is itself the useful information, a reader's common misconception, say why the wrong answer is wrong once, then move on. Don't repeat the not-X-it's-Y shape sentence after sentence.
- **Hedging**: `should work in most cases`, `generally speaking`, `in most scenarios`. A step either works under a stated condition or it doesn't. Replace the qualifier with the actual condition: `this works when X; for Y, see Z`.
- **Marketing language**: `powerful`, `seamless`, `robust`, `cutting-edge`, `effortless`, `unlock`, `elevate`, `empower`, `game-changing`, `revolutionize`, `best-in-class`. Documentation describes what something does, not how impressed the reader should be. A word can be a legitimate technical term in one project's vocabulary and marketing filler in another (this plugin's own docs use "leverage" as a compound noun, "highest-leverage fix," not the verb cliché); judge usage in context rather than banning by word alone.
- **Throat-clearing openers**: `it's worth noting that`, `it's important to understand`, `let's dive into`, `needless to say`. Cut the preamble and start with the instruction or fact it was stalling in front of.
- **Stacked inflated transitions**: `furthermore`, `moreover`, `that said`, used as connective tissue between every sentence rather than where a real logical turn exists. A period is usually enough.

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

Surround headings and lists with blank lines (markdownlint rules MD022 and MD032).

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

Use the same term for the same concept in every doc.
When the project has `term` entries in `.docs-assist/reference.yml`, its canonical terms are authoritative; see `terminology.md`.
For general style questions beyond this file, `style-guides.md` covers choosing and applying an external guide such as the [Google developer documentation style guide](https://developers.google.com/style/).

## Document Hygiene

- Avoid TODOs or placeholders in merged docs
- Check anchor links if you rename headings or move files
- Break lines after each period.
Markdown renders it as a single line, but line breaks help human editors scan content.

> [!NOTE]
> Line breaks after periods is a style choice.
> It improves diff readability and editing, but some teams prefer reflowed paragraphs.
