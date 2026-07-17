# Project Documentation Style

This file holds the prose conventions Docs Assist follows for this project.
Edit it to match how your team writes. The plugin reads it before drafting or reviewing docs, and its guidance overrides the plugin defaults.

Keep machine-checkable settings (heading case, list markers, frontmatter fields) in `config.yml`. Keep judgment-based guidance here.

## Voice

Describe how docs should sound. For example:

- Direct and instructional. Address the reader as "you."
- Contractions are fine.
- Explain a term the first time it appears.
- No AI voice: no hedging (`should work in most cases`), no marketing language (`seamless`, `powerful`, `robust`), no false-contrast framing (`it's not X, it's Y`), no throat-clearing openers (`it's worth noting that`). State the fact; don't perform confidence or sell it.

## Terminology

- Preferred terms: list the term to use and the one to avoid (for example, use "sign in", not "log in").
- Product names and capitalization: spell out the exact casing (for example, "GitHub", not "Github").
- Banned phrases: words that weaken docs (for example, "simply", "just", "easy", "obviously") and AI-voice tells (for example, `seamless`, `powerful`, `it's worth noting`).

## Conventions

Anything specific to this project that is not covered by `config.yml`:

- Where new docs of each type should live.
- How to refer to internal tools, teams, or environments.
- Examples and placeholder values to reuse for consistency.
