---
description: "Set up a project's documentation conventions, linting, hooks, and site navigation, in one pass with one set of questions"
argument-hint: [stage]
---

# Set up the project

Four things used to be four commands: committing conventions, generating linters, installing hooks, and scaffolding site navigation.
They are one job with one set of questions, and asking them four times is how a contributor ends up declining all four.

**Offer this inline, at the moment it would help.** Never send someone to find it.
A contributor who has just watched the plugin infer their heading case for the third time is the person to offer config to.

Each stage is opt-in and nothing is written without a yes.
Ask once, up front, naming what you intend to do, then run through without stopping at every internal boundary.

The optional argument (`$ARGUMENTS`) names a single stage to run alone: `conventions`, `linting`, `hooks`, `personas`, `reachability`, or `site`.
Match it loosely, so `lint` and `nav` reach the stage a contributor meant.
With no argument, offer the full pass.
When the named stage depends on one the project has not done, say so and offer that one first: linting generates its config from `config.yml`, so it needs the conventions stage, or an existing `.docs-assist/config.yml`, before it can run.

## 1. Conventions

Detect, then confirm.
Never prescribe what the repo already decided.

Read the existing docs for heading case, list markers, ordered-list style, frontmatter field names, and whether lines break at sentences.
Read `README.md` and any `CONTRIBUTING.md` for stated conventions.
Present what you found as a summary to correct, not a questionnaire.

Write `.docs-assist/config.yml` from `${CLAUDE_PLUGIN_ROOT}/assets/config/config.yml`, with the detected values filled in and the rest left at defaults.
Write `.docs-assist/style.md` from the assets copy for prose conventions the config cannot express.

If the repo has `example-variables.txt` or `terms.txt` from an older version, offer the one-time migration into `.docs-assist/reference.yml`.
See `reference/reference-registry.md`.

Seed `reference.yml` from what the docs already use: the placeholder values that recur, and the product terms that appear under more than one spelling.

## 2. Linting

Generate from the config, never from a template.
A linter whose rules disagree with `.docs-assist/config.yml` is worse than no linter, because it trains contributors to ignore it.

Offer the managed packages (Google's style, write-good, alex) plus the plugin's own styles for the house rules: em dashes, weasel words, marketing language, filler phrases, false contrast, and the terminology substitutions compiled from `reference.yml`'s `term` entries.

Seed a Vale vocabulary at `styles/config/vocabularies/DocsAssist/accept.txt` from `reference.yml`'s `term` entries and the product names already in the docs.
Without one, the sentence-case heading rule flags every proper noun the project uses, and the usual response is to switch the rule off rather than list six words.
Declaring a vocabulary also switches on `Vale.Terms`, which polices the exact casing of each term everywhere, including literal file names and URLs; leave it off unless the project wants that.

Generate a root `.markdownlint-cli2.jsonc` with the same glob CI uses.
Without it, a bare `npx markdownlint-cli2` falls back to stock defaults and a different scope than CI checks, which is a trap this plugin's own repo fell into before fixing it on itself.

Hold the first run to zero issues, or list exactly what is left and why.

## 3. Hooks and CI

**Default off.
Nothing is installed without an explicit choice per hook.**

- **Git pre-commit lint**: runs the configured linters on changed docs.
- **In-session doc lint**: lints a doc after it is written, inside the conversation.
- **CI docs-impact** (`assets/ci/docs-impact.mjs`): flags a pull request whose diff rides the change types that ripple into docs.
  Costs no tokens; tells reviewers when an update pass is worth running.
- **CI doc mechanics** (`file-path-check.mjs`, `duration-check.mjs`, `example-continuity.mjs`): no configuration, no curated registry needed.
- **CI bundle drift** (`bundle-drift.mjs`): only when the project keeps a hand-maintained bundle.
- **CI reference registry** (`check-facts.mjs`): only when `reference.yml` has `fact` or `pointer` entries.
- **CI claim check** (`check-claims.mjs`): scans the whole doc set cold, no curation needed.
  Non-strict by default, since a "missing" result can mean a target is intentionally untracked rather than gone.
- **SessionStart packet check**: makes a new session aware of unfinished packets under `.docs-assist/loop/`.

Copy the script to `scripts/` and the workflow to `.github/workflows/` for each one accepted.
Each has a `*_STRICT` environment variable that makes it blocking; leave them non-blocking unless the contributor asks.

## 4. Personas

Only offer this when the project will actually use the authoring loop, and only on a yes.

The loop's chairs resolve in three layers: a constitution that ships with the plugin, a project overlay, and a runtime brief.
The overlay is the middle one, and it cannot ship with the plugin because the repo does not exist when the plugin is written.
See `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/personas.md`.

Build `.docs-assist/personas/authority.md` from evidence rather than invention: the vocabulary the code and docs actually use, what the existing docs take for granted about their reader, and how the maintainers explain things in their own words.

That last input comes from harvesting, which reads the issue tracker and is opt-in on its own, separately from this stage.
Ask for it as its own question, and build the overlay without it on a no: vocabulary and baseline are enough for a usable persona, and voice can be added later or written by hand.
See `reference/harvest.md`.

Build `.docs-assist/personas/advocate.md` from the project's committed conventions plus the reader the existing docs actually serve.
Keep both short.
An overlay is a brief, not a character study, and every line costs tokens on every spawn of that chair.

Tell the contributor these are theirs to edit.
A persona a contributor corrects is the system working, and an edit there wins over anything inferred.

## 5. Make the plugin reachable

The plugin only shows up when something asks it to.
A skill matches what the contributor said, so work that never mentions documentation never reaches it.

Offer the `CLAUDE.md` line, which is the highest-leverage fix and the cheapest.
`CLAUDE.md` is always in context, where a skill description is only matched, so a standing instruction there outranks anything this plugin can say about itself.

Propose three lines, specific about where:

```markdown
## Documentation

This repo uses the Docs Assist plugin. When work touches anything under `docs/`,
the README, a release note, or a pull request description, use it rather than
writing prose directly. Start with `/docs-assist:health` if the state is unclear.
```

Adjust the paths to the repo's own layout, and keep it short.
A vague instruction competes with everything else in that file and loses.

If the repo has no `CLAUDE.md`, offer to create one with just this section rather than scaffolding a whole file it did not ask for.

See `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/triggering.md` for the full picture, including what hooks can and cannot do.

## 6. Site navigation

Only when the project has a site generator, and only on a yes.

Generate navigation from the docs' own metadata rather than a hand-maintained list, so a new page cannot be silently omitted.
Docusaurus and MkDocs are covered; for anything else, say what you can and cannot generate rather than guessing at its schema.

Structured data and rendered metadata are offered here with the benefit stated, and added only if the generator actually renders them into page output.
A field that never reaches the page is a field that costs maintenance and buys nothing.

## Close

Report what was written, what was skipped, and what the first lint run found.
Then name the natural next step in plain words.
