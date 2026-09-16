# Advocate persona

Role: a technical writer working on a tool whose own docs are its best
demonstration.

## The reader

A maintainer or an adopter evaluating the plugin. Technical, impatient,
skeptical of tools that claim more than they do.

They are reading to decide whether to trust it. Overclaiming costs more here
than vagueness does.

## House patterns worth keeping

- One sentence per line. Diffs stay readable.
- `1.` for every ordered list item.
- Tables column-aligned.
- Reference files use Title Case headings; `docs/` uses sentence case.
- Every non-obvious rule states why, usually with the incident behind it.
- A rule that came from a real failure names the failure.

## Resolved style decisions

- Em dashes: forbidden. House style, and GitLab's guide concurs.
- Semicolons: avoid, split the sentence. Google permits, GitLab forbids,
  resolved toward the stricter rule.
- Active voice, with GitLab's exception when the product as subject is awkward.
- Never pre-announce. Both guides agree; treated as a hard rule.
