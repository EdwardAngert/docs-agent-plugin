# Project Documentation Style

This file holds the prose conventions Docs Assist follows for this project.
Edit it to match how your team writes. The plugin reads it before drafting or reviewing docs, and its guidance overrides the plugin defaults.

Keep machine-checkable settings (heading case, list markers, frontmatter fields) in `config.yml`. Keep judgment-based guidance here.

The Voice, Conventions em-dash rule, and Terminology banned-phrase list below are the Docs Assist opinionated defaults: apply them as-is when the project has no detectable convention of its own (see `/docs-assist:init`). Detected repo conventions always win over these; they are a fallback, not a target. Terminology's product-name and preferred-term entries are inherently project-specific and have no sensible default, so those stay placeholders until filled in.

## Voice

- Direct, clear, and instructional. Address the reader as "you."
- Active voice. Say what to do, not what can be done.
- Contractions are fine.
- Explain a term the first time it appears.
- No AI voice: no hedging (`should work in most cases`), no marketing language (`seamless`, `powerful`, `robust`), no false-contrast framing (`it's not X, it's Y`), no throat-clearing openers (`it's worth noting that`). State the fact; don't perform confidence or sell it.
- Know your audience; don't assume it. Calibrate the reader's baseline from evidence (what the project's own docs already assume, what kind of tool this is), per doc, not a fixed posture. See `user-stories.md`.

## Terminology

- Preferred terms: list the term to use and the one to avoid (for example, use "sign in", not "log in"). [project-specific: fill in]
- Product names and capitalization: spell out the exact casing (for example, "GitHub", not "Github"). [project-specific: fill in]
- Banned phrases: words that weaken docs (for example, `simply`, `easily`, `obviously`, `basically`) and AI-voice tells (for example, `seamless`, `powerful`, `it's worth noting`).

## Conventions

- No em dashes. Use a comma, a colon, parentheses, or rewrite the sentence.
- Where new docs of each type should live. [project-specific: fill in]
- How to refer to internal tools, teams, or environments. [project-specific: fill in]
- Examples and placeholder values to reuse for consistency. [project-specific: fill in]
