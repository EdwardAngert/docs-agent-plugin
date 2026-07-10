---
description: "Make the docs legible to AI tools: create or repair llms.txt, complete the frontmatter, and record the repo's conventions"
argument-hint: [docs directory]
---

# Make the Docs Agent-Ready

Make this repository's documentation legible to AI tools: coding agents, docs assistants, and search systems that read structure before prose.

Readers are no longer only human.
An agent answering questions about this project will do it well or badly depending on whether the docs have a map (`llms.txt`), per-doc metadata (frontmatter), and consistent conventions it can rely on.
This command retrofits all three onto an existing docs set.
The optional argument (`$ARGUMENTS`) is the docs directory. Detect it if not given.

## Process

### 1. Survey the Docs Set

- Resolve `.docs-assist/` config if present.
- Inventory the docs: paths, titles, and what frontmatter each already carries.
- Learn the repo's frontmatter field names and any SSG-required fields, per `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/frontmatter-spec.md`. The repo's conventions win; never fight the build system.

### 2. Create or Repair llms.txt

`llms.txt` is the map an AI tool reads first.

- **Missing**: generate one. Lead with a one-line project summary and a blockquote of what the project does, then list every doc with a link and a one-line description of what it covers and who it serves. Group by purpose when the set is large.
- **Present**: reconcile it against the docs. Add missing entries, remove entries whose files are gone, and fix titles, descriptions, and paths that drifted.
- Order entries by reader priority (start-here first), not alphabetically.

### 3. Complete the Frontmatter

For each doc missing required metadata, add it using the repo's field names:

- `title`, `description`, and the content-type field at minimum; `audience` and keywords where the content makes them clear.
- **Never overwrite an existing field**, and never remove or reorder SSG-required fields.
- Derive values from the doc's own content. Where a doc is too ambiguous to describe honestly, flag it for its owner instead of inventing a description.

### 4. Record the Conventions

If the repo uses nonstandard field names (`tags` for keywords, `type` for content type), note the mapping in `llms.txt` so the next AI tool does not re-derive it.
If the project has `.docs-assist/terms.txt` or `example-variables.txt`, mention them in the note: they tell an agent which values and terms are canonical.

### 5. Verify and Report

- Check every `llms.txt` link resolves and every doc in the set is either listed or intentionally excluded (say which).
- Report what changed and what an AI tool can now do that it could not before: find the right doc without reading all of them, and trust the metadata it finds.
- The branch delivery rule applies: this pass touches many files, so offer a docs branch.

## Notes

- This is retrofitting, not rewriting. Do not restructure content or rename files here; recommend `/docs-assist:audit` when the survey shows deeper problems.
- Honest metadata beats complete metadata. A wrong description misleads every agent that reads it.
- Re-run after large docs changes, or let `/docs-assist:update` maintain `llms.txt` incrementally as it already does.
