# llms.txt

`llms.txt` is the map an AI tool reads first, and maintaining it is core Docs Assist functionality, not a side effect.
An agent answering questions about a project does it well or badly depending on whether it can find the right doc without reading all of them.
This file single-sources the format, the ordering, and the maintenance contract; every workflow that touches docs follows it.

## The Format

Follow the llms.txt convention ([llmstxt.org](https://llmstxt.org/)): a Markdown file at the repo root, structured so both humans and machines can parse it.

1. An H1 with the project name. The only required element.
1. A blockquote summarizing what the project is and does, in one or two sentences.
1. Optionally, short prose paragraphs with context a tool needs before diving in (including the field-mapping note below).
1. H2 sections containing link lists, each entry as `- [title](relative/path.md): one-line description`.

```markdown
# Acme Deploy

> A CLI that deploys containerized apps to your own infrastructure.

## Docs

- [Quickstart](docs/quickstart.md): Install the CLI and ship a first deploy in ten minutes. Start here.
- [Configuration reference](docs/configuration.md): Every config key, its default, and when to change it.
```

One section name is reserved by the convention: a section titled `Optional` marks content a tool may skip when context is short.
Use it for genuinely skippable depth, and use descriptive names (`For Docs Leads`, `Internals`) for everything else, so the skip signal keeps its meaning.

## Ordering and Descriptions

- **Order by reader priority, not alphabetically.** The start-here doc leads. Within a section, the order answers "what should someone (or something) read first?"
- **Descriptions say what the doc covers and who it serves**, in the voice you would use to point a coworker at it. Honest beats complete: a wrong description misleads every agent that reads it.
- **Every doc is listed or intentionally excluded.** Working artifacts (`.docs-assist/intake/`, `.docs-assist/reports/`) stay out; published docs go in.

## The Mapping Note

When the repo uses nonstandard frontmatter field names, record the mapping as prose near the top so no tool has to re-derive it:

```markdown
> This repo uses `tags` for keywords and `type` for content type.
> Code samples use the canonical values in `.docs-assist/example-variables.txt`; product terms follow `.docs-assist/terms.txt`.
```

Pointing at the registries tells an agent which values and terms are canonical, which makes its answers consistent with the docs.

## The Maintenance Contract

`llms.txt` is only useful while it is true. Each workflow holds up its part:

- **Draft** adds an entry for every new doc it finalizes, placed by reader priority.
- **Update** reconciles entries whenever its edits add, remove, rename, move, or re-describe a doc.
- **Audit** and **health** flag drift: entries whose files are gone, docs with no entry, and titles, descriptions, or paths that no longer match.
- **Agent-ready** creates the file when missing and repairs it wholesale.
- **Setup-site** reads it as the source of navigation order.
- **Fan-out subagents never edit it.** Parallel writers would collide, so `doc-drafter` reports its proposed entry and the main conversation writes them all.

## llms-full.txt

For a small docs set, a companion `llms-full.txt` (the full content of every listed doc, concatenated) lets a tool ingest everything in one read.
Offer it when the whole set fits comfortably in a model's context; skip it for large sets, where the map plus selective reading serves better.
It is generated, never hand-edited: regenerate it whenever the docs change, or skip it rather than let it drift.
