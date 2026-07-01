# Project Documentation Style

The prose conventions Docs Assist follows for this repo, the `docs-assist` plugin.
The plugin reads this before drafting or reviewing docs here, and its guidance overrides the plugin defaults.

Machine-checkable settings live in `config.yml`. Judgment-based guidance lives here.

## Voice

- Direct, clear, and instructional. Address the reader as "you."
- Active voice. Say what to do, not what can be done.
- Contractions are fine.
- Explain the plugin's own concepts (content type, intake, subagent) the first time they appear on a page.

## Terminology

- Product name: "Docs Assist" in prose, `docs-assist` for the plugin id, package, and command namespace.
- The plugin was renamed from `documentation-agent`. Use the new name; mention the old one only in the migration note.
- One word: "subagent". Two words: "content type".
- Refer to commands as `/docs-assist:draft`, `/docs-assist:plan`, and so on.
- Banned phrases: "simply", "just", "easily", "obviously", "basically" (they weaken instructions), and "click here" (use descriptive link text).

## Conventions

- Reader-facing tutorials live in `docs/`. The skill's reference material lives under `skills/docs-assist/reference/`.
- No em dashes. Use a comma, a colon, parentheses, or rewrite the sentence.
- Reuse the placeholder values in `example-variables.txt` for code samples.
- Keep examples copy-paste safe: reserved example domains, documentation IP ranges, and fake credentials that cannot work.
