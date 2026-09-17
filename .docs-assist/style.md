# Project documentation style

The prose conventions Docs Assist follows for this repo, the `docs-assist` plugin.
The plugin reads this before drafting or reviewing docs here, and its guidance overrides the plugin defaults.

Machine-checkable settings live in `config.yml`.
Judgment-based guidance lives here.

## Voice

- Direct, clear, and instructional.
  Address the reader as "you."
- Active voice.
  Say what to do, not what can be done.
- Contractions are fine.
- Explain the plugin's own concepts (content type, intake, subagent) the first time they appear on a page.

## Terminology

- Product name: "Docs Assist" in prose, `docs-assist` for the plugin id, package, and command namespace.
- The plugin was renamed from `documentation-agent`.
  Use the new name; mention the old one only in the migration note.
- One word: "subagent".
  Two words: "content type".
- Refer to commands as `/docs-assist:draft`, `/docs-assist:plan`, and so on.
- Banned phrases: `simply`, `easily`, `obviously`, `basically` (they weaken instructions), and `click here` (use descriptive link text).
  `just` is not banned: it's ordinary English far more often than it weakens an instruction.

## Conventions

- Reader-facing tutorials live in `docs/`.
  The skill's reference material lives under `skills/docs-assist/reference/`.
- No em dashes.
  Use a comma, a colon, parentheses, or rewrite the sentence.
- One sentence per line.
  `scripts/validate.mjs` enforces it, because the rule decayed silently while nothing did.
  It does not apply inside a table: a cell cannot hold a line break, so a multi-sentence cell stays one line.
  The check skips table rows for that reason, and so should you.
- Tables are column-aligned in the source, padded so the pipes line up.
  It costs nothing to write and keeps a one-cell edit legible in a diff.
- No emphasis inside prose.
  Bold is for run-in headings and UI labels, and nothing else, including a term being defined.
  GitLab's rule is the one followed here: "Do not use bold for keywords or emphasis."
  A glossary entry leads its bullet so the term is a run-in heading; if a sentence needs emphasis to land, rewrite the sentence.
  Google's style guide says "usually, your words can carry the emphasis without adding italics," and GitLab's bans emphasis outright in favor of "content that is clear enough that emphasis is not needed."
  A literal value belongs in a code span, not bold.
- Protect the reader who pastes without reading.
  One step per code block, and two unrelated commands belong in two blocks.
  When a step genuinely takes two commands, chain them with `&& \` and a line break rather than inline, so the reader can see and copy the halves.
  A block that edits an existing file shows its surrounding context, or marks the omission with `...`, so nobody has to guess where it goes.
  A destructive example must fail as written, with an unresolvable placeholder in the slot that would do the damage, and prose saying it is set to fail on purpose.
  Never ask the reader to edit a command in their head ("run it again with `-f`"); show the second command as its own block.
- Reuse the placeholder values in `reference.yml` for code samples.
- Keep examples copy-paste safe: reserved example domains, documentation IP ranges, and fake credentials that cannot work.
