# Markdown reference for a site

A site's docs pick a form for the same few things over and over: an image, a link, a callout, a list, an indent, a component.
When the docs pick differently from page to page, every new page has to guess, and the plugin guesses too.
A markdown reference writes down the form the site uses for each, and picks one where it uses several, so the next page matches without anyone deciding again.

It goes in the project's `.docs-assist/style.md`, under a `## Markdown` heading, where every step that writes or edits already reads the project's style.
That file stays out of git unless the contributor chose at setup to share the project's rules.

## When to offer it

Only when the project has a site: a site generator, MDX, or custom components.
`node ${CLAUDE_PLUGIN_ROOT}/assets/ci/markdown-patterns.mjs` says whether it does, on its second line.
Plain markdown done two ways is the conventions stage's business (`commands/setup.md`), not this.

Offer it once, the first time it would help:

- At setup's conventions stage.
- The first time the plugin works on a project whose `style.md` has no `## Markdown` section: at the survey before a draft, a plan, or a health check.

In plain words:

> "Want me to create a markdown reference for this site?
> It writes down how your docs handle images, links, callouts, lists, indentation, and components, and picks one way wherever they use several, so new pages match."

On a no, don't offer again in this session, and note the decline under `## This branch` in the journal so a later session on the branch doesn't ask either.

## How to build it

1. Run `markdown-patterns.mjs` against the docs directory.
   It reads only the docs git tracks, skips code blocks, and lists every form it found for each kind, with counts and examples.
   It counts; it doesn't choose.
1. For each kind done one way, that is the convention: one line, with the form.
1. For each kind done more than one way, list the forms with their counts and recommend one.
   Recommend, in this order of weight:
   1. **What the site renders.**
      A callout the generator turns into a styled box beats a bold "Note:" that renders as a sentence; check the generator's config or a rendered page when unsure.
   1. **What still reads where the docs are read raw**, when the site renders more than one form well: on GitHub, in an editor, or by a model reading the source.
   1. **What most pages already use**, so the fewest pages change.
   1. **What a reader needs**: alt text on every image, link text that says where it goes.
1. For each custom component, read one or two uses and write down what it is for and the props the docs pass it.
   That inventory is what a writer needs to use it the way the rest of the site does.
1. Show the contributor the whole reference at once, recommendations marked, and ask them to correct it.
   One read-back, not a question per kind.
1. Write it into `.docs-assist/style.md` under `## Markdown`.
   Create `style.md` from `${CLAUDE_PLUGIN_ROOT}/assets/config/style.md` when the project has none, and keep the project's rules local or shared, whichever setup recorded (`journal.mjs rules`).

Don't rewrite existing docs to match.
Offer once, separately, to bring the pages that use another form in line, as its own change.

## The section

```markdown
## Markdown

How this site writes the things every page uses.
Where the docs used more than one form, the first is the standard and the rest are being phased out.

- **Callouts**: `:::note`, `:::tip`, `:::warning` (Docusaurus renders them).
  Not `> **Note:**` (12 pages) or `**Note:**` (3 pages), which render as plain text.
- **Images**: `![Alt text](./img/name.png)`, beside the page; alt text always.
- **Internal links**: relative, with the extension: `[Install](install.md)`.
- **Unordered lists**: `-`.
- **Ordered lists**: `1.` on every item.
- **Indentation**: spaces, two per nesting level; no tabs.
- **Components**:
  - `<Tabs>` with `<TabItem value="..." label="...">`, one per platform, `groupId="os"` so the choice carries across pages.
  - `<CodeBlock title="path/to/file">` for a file the reader edits.
```

Keep it short.
It is the forms, not a tutorial on them: a writer reads it in a minute, and a model loads it on every write.
