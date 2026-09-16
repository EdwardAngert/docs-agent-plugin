---
description: "Set up a project's documentation conventions, linting, hooks, and site navigation, in one pass with one set of questions"
---

# Set Up the Project

Four things used to be four commands: committing conventions, generating linters, installing hooks, and scaffolding site navigation. They are one job with one set of questions, and asking them four times is how a contributor ends up declining all four.

**Offer this inline, at the moment it would help.** Never send someone to find it. A contributor who has just watched the plugin infer their heading case for the third time is the person to offer config to.

Each stage is opt-in and nothing is written without a yes. Ask once, up front, naming what you intend to do, then run through without stopping at every internal boundary.

## 1. Conventions

Detect, then confirm. Never prescribe what the repo already decided.

Read the existing docs for heading case, list markers, ordered-list style, frontmatter field names, and whether lines break at sentences. Read `README.md` and any `CONTRIBUTING.md` for stated conventions. Present what you found as a summary to correct, not a questionnaire.

Write `.docs-assist/config.yml` from `${CLAUDE_PLUGIN_ROOT}/assets/config/config.yml`, with the detected values filled in and the rest left at defaults. Write `.docs-assist/style.md` from the assets copy for prose conventions the config cannot express.

If the repo has `example-variables.txt` or `terms.txt` from an older version, offer the one-time migration into `.docs-assist/reference.yml`. See `reference/reference-registry.md`.

Seed `reference.yml` from what the docs already use: the placeholder values that recur, and the product terms that appear under more than one spelling.

## 2. Linting

Generate from the config, never from a template. A linter whose rules disagree with `.docs-assist/config.yml` is worse than no linter, because it trains contributors to ignore it.

Offer the managed packages (Google's style, write-good, alex) plus the plugin's own styles for the house rules: em dashes, weasel words, marketing language, filler phrases, false contrast, and the terminology substitutions compiled from `reference.yml`'s `term` entries.

Generate a root `.markdownlint-cli2.jsonc` with the same glob CI uses. Without it, a bare `npx markdownlint-cli2` falls back to stock defaults and a different scope than CI checks, which is a trap this plugin's own repo fell into before fixing it on itself.

Hold the first run to zero issues, or list exactly what is left and why.

## 3. Hooks and CI

**Default off. Nothing is installed without an explicit choice per hook.**

- **Git pre-commit lint**: runs the configured linters on changed docs.
- **In-session doc lint**: lints a doc after it is written, inside the conversation.
- **CI docs-impact** (`assets/ci/docs-impact.mjs`): flags a pull request whose diff rides the change types that ripple into docs. Costs no tokens; tells reviewers when an update pass is worth running.
- **CI doc mechanics** (`file-path-check.mjs`, `duration-check.mjs`, `example-continuity.mjs`): no configuration, no curated registry needed.
- **CI bundle drift** (`bundle-drift.mjs`): only when the project keeps a hand-maintained bundle.
- **CI reference registry** (`check-facts.mjs`): only when `reference.yml` has `fact` or `pointer` entries.
- **CI claim check** (`check-claims.mjs`): scans the whole doc set cold, no curation needed. Non-strict by default, since a "missing" result can mean a target is intentionally untracked rather than gone.
- **SessionStart packet check**: makes a new session aware of unfinished packets under `.docs-assist/loop/`.

Copy the script to `scripts/` and the workflow to `.github/workflows/` for each one accepted. Each has a `*_STRICT` environment variable that makes it blocking; leave them non-blocking unless the contributor asks.

## 4. Site Navigation

Only when the project has a site generator, and only on a yes.

Generate navigation from the docs' own metadata rather than a hand-maintained list, so a new page cannot be silently omitted. Docusaurus and MkDocs are covered; for anything else, say what you can and cannot generate rather than guessing at its schema.

Structured data and rendered metadata are offered here with the benefit stated, and added only if the generator actually renders them into page output. A field that never reaches the page is a field that costs maintenance and buys nothing.

## Close

Report what was written, what was skipped, and what the first lint run found. Then name the natural next step in plain words.
