# CLAUDE.md

## Documentation

This repo is the Docs Assist plugin, and it runs on itself.
Use the plugin for anything under `docs/`, the README, the changelog, release notes, or a pull request description, rather than writing prose directly.
Start with `/docs-assist:health` when the state is unclear.

Two decisions to apply without re-deriving them:

- The documentation set is what `git ls-files` returns.
  A file on disk that git ignores is working material, not a document: never audit, lint, count, or rank it.
- Before changing a fact, grep for every place it appears and fix them together.
  Several facts here live in more than one file, and fixing only the first occurrence has produced self-contradicting pages.

`.docs-assist/decisions.md` has the rest, including which file owns which repeated fact.
Read it before auditing, drafting, or restructuring docs here.

## Conventions

The prose rules live in `.docs-assist/style.md` and the machine-checkable ones in `.docs-assist/config.yml`.
Both are enforced: `node scripts/validate.mjs` plus Vale, markdownlint, and cspell.
Run them before calling documentation work done, and treat a clean run as the floor rather than the finish.
