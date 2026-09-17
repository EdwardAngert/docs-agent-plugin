# Docs Assist

A Claude Code plugin that coaches people through writing documentation.

You have subject matter experts with knowledge in their heads: engineers who built the feature, support leads who know every edge case, PMs who understand the workflow.
They don't need to be good at documentation.
They just need to share what they know.

This plugin is the documentation expertise layer.
It extracts their knowledge, picks the right structure, applies writing standards, and produces a draft they can review.
Think of it as having a technical writer in every Claude Code session, one who asks the right questions and handles the formatting so contributors can focus on what they know.

**Who it's for:** engineers, support leads, PMs, and repo owners who have knowledge to share but don't want to become documentation experts.

## What it looks like

This section came out of one such session.
Documenting this very plugin, it went like this:

**You:**

> Help me update the README with great docs about this plugin.
> Where do I start?

**Docs Assist:**

> Let me read it back first.
> The README is solid, but it tells more than it shows, it opens with a rename note that only old users care about, and the file tree has drifted from the code (it's missing two files).
> Start with one thing: a short "What it looks like" example near the top, because that's what turns a scroller into someone who tries it.
> Then move the rename note down and fix the tree.
> I'll ship those three now.

It added this section, moved the rename note, and corrected the tree.
The rest of this README is the result.
Its own linter caught a formatting slip in the draft and flagged it, so it fixed that too.
You review for accuracy.
The formatting is already handled.

## Requirements

- Claude Code.
- Node, for the deterministic checks and the repository validator.
  Nothing else is required to draft, plan, or audit.
- The linters are optional and scaffolded only if you ask: Vale, markdownlint, and cspell install when you accept them, and the plugin detects and extends an existing setup rather than replacing it.

## What it writes

The plugin proposes and you accept.
It shows you a draft before a file is written, and multi-file work is offered on a branch rather than committed to your default branch.

Its own bookkeeping lives in `.docs-assist/`: your conventions, the example registry, per-document verification dates, and the working artifacts of a drafting run.
Your documents stay portable plain markdown, and nothing the plugin needs is written into them.

A few things reach outside your repo, every one on an explicit yes: fetching a template, checking a claim about something your project does not vendor, mining your issue tracker for explanations maintainers already wrote, and the linters and link checkers you choose to install.

## Get started

```text
/plugin marketplace add EdwardAngert/docs-agent-plugin
/plugin install docs-assist@docs-assist-marketplace
```

Then ask for a health check, or run `/docs-assist:health`, and you get a thirty-second scorecard and the single highest-leverage fix.

[Get started with Docs Assist](docs/get-started.md) has the full path: installing, setting it up so it writes like your project, and making sure it shows up when it should.

## Documentation

- [Get started](docs/get-started.md): install, set up, and make sure it fires.
  Start here.
- [Set up documentation standards for your team](docs/set-up-documentation-standards-for-your-team.md): for docs leads and devrel.
  Why to install, what changes for contributors, and how to customize.
- [Write docs with Docs Assist](docs/write-docs-with-docs-assist.md): for individual contributors.
  What the plugin does, and how to get the most out of it.
- [Command reference](docs/command-reference.md): every command with its argument and an example.
- [How the authoring loop works](docs/how-the-loop-works.md): the three-chair mechanism behind drafting.
  You don't need it to use the plugin; read it to judge what a draft's assumptions list is worth.

## How it works

The plugin activates when you ask for documentation help, in plain words.
You don't need to learn any special syntax or documentation theory.

It activates on what you say, though, so work that never mentions documentation will not reach it on its own.
[Make sure it shows up](docs/get-started.md#make-sure-it-shows-up) covers the two ways to close that gap, and the three lines in `CLAUDE.md` that do most of the work.

The simplest path is to tell Claude what you want to document:

```text
I need to document how to set up SSO for our enterprise customers.
```

Claude gathers what you know, connects it to your existing docs, and produces a structured draft.
You review for accuracy, Claude handles the rest.
The full rhythm is in [Gather before you structure](#gather-before-you-structure) below.

Other prompts that work:

```text
Help me document feature X for issue #123
```

```text
I just fixed a tricky bug, can we add troubleshooting docs so others don't hit it?
```

```text
Review this README for clarity and completeness
```

Nine commands exist too, but they are a shortcut rather than the way in: anything they do, you can ask for in plain words.
The [command reference](docs/command-reference.md) lists them if you want the full surface.

## Gather before you structure

The plugin works the way a technical writer does: it gathers before it structures.
When you document something new, it opens with "tell me everything you know" and takes your brain dump in any order.
Then it reflects it back, situates it against your existing docs and how people use the product, and digs into the gaps before it shapes anything.

Starting from scratch with a pile of raw material, like tickets, a PRD, notes, or old docs?
It reads the pile in an isolated pass and hands back a content inventory (clusters, gaps, duplication), then turns that into a documentation plan.

Documenting a whole repo and not sure where to start?
It reads the codebase, tells you what it found and where it would start, and gets one good doc out the door (usually a README or quickstart) before planning the rest.
It plans to ship first and iterate, not to boil the ocean.

## Configure for your team

Commit a `.docs-assist/` directory and the whole team writes to the same conventions:

- `.docs-assist/config.yml`: machine-readable settings (heading case, list markers, frontmatter field names, lint tools).
- `.docs-assist/style.md`: prose conventions (voice, terminology, banned phrases).
- `.docs-assist/templates.yml`: optional settings for documentation templates (selection model, source).
- `.docs-assist/reference.yml`: the canonical registry of example values, verified facts, worked-example pointers, and product terms, so examples and terminology stay consistent across docs.
  The plugin maintains it, and audits flag drift against it.

Run `/docs-assist:setup` to generate them, pre-filled from what your docs already do.
Because this config is committed to your repo, it survives plugin updates and is shared across contributors, unlike editing the plugin's own files.

Writing solo?
The same config is how the plugin acts as your second reader: it holds your docs to a consistent line and catches the drift in examples and terminology that a team would catch in review.

## Lint with the same rules you write by

Linting is optional and never bundled.
Run `/docs-assist:setup` to scaffold it, and the plugin generates the linter config from your `.docs-assist/config.yml`.
That means one source of truth: the same settings drive how the agent writes and how the linter checks, so they never drift.

- Vale runs a small `DocsAssist` style for what's specific to this plugin (AI voice, no em dashes, descriptive link text, imperative headings), plus the managed `Google`, `write-good`, and `alex` packages for everything general-purpose (weasel words, passive voice, wordiness, clichés, inclusive language).
  General prose quality is a solved, maintained problem; this plugin doesn't keep its own copy of it.
- markdownlint covers the structural rules.
- cspell and a link checker cover spelling and links.
- An optional GitHub Actions workflow runs the checks on pull requests.

Setup reads the conventions your docs already follow and generates config to match, rather than prescribing a house style your repo already decided against.

## Start from a proven template

When you document something new, the plugin can start you from a proven structure instead of a blank page, using [The Good Docs Project](https://thegooddocsproject.dev/) templates.
Describe the problem in plain words, for example "people keep opening tickets about a login loop," and it suggests a matching template, then fills the skeleton with what you know.

Templates supplement the content types; they never replace them.
Suggesting one is free and offline, so the assistant offers a template in any drafting conversation, and only fetches it when you accept.
Templates are offered during drafting, and the settings file that records your choices is scaffolded then too.
The Good Docs templates are MIT-0; see `THIRD-PARTY-NOTICES.md`.

## Keep docs in sync with code

When code changes, run `/docs-assist:update` with a git ref, a PR number, or a path.
The plugin reads the diff, summarizes what changed, finds the docs that reference it, and updates them for your review.
Large changes fan out across the `doc-updater` subagent so many docs update in parallel.

You can also put the watching on autopilot.
`/docs-assist:setup` installs a docs-impact check that runs on every pull request: a deterministic, token-free detector that flags diffs riding the change types that break docs (moved files, changed headings, changed code terms the docs mention, large silent source changes) and tells reviewers exactly which `/docs-assist:update` range to run.
Cheap detection in CI, expensive updating only when it is warranted.

## Make your docs agent-ready

Your docs' readers now include AI tools: coding agents, docs assistants, and search systems that read structure before prose.

`/docs-assist:merge-prep` creates or repairs `llms.txt`, the map an AI tool reads first, along with everything else that scales with the whole set.
It runs when you ask for it and not at the end of every edit, because a single content fix should not trigger a regenerate-and-diff pass over your entire docs tree.

Nothing here depends on frontmatter.
Site generators disagree about what frontmatter they accept, plenty of documentation has no site generator at all, and frontmatter only pays off once a reader has already landed on the page.
The plugin keeps what it needs in `.docs-assist/`, reads your frontmatter when you have it, and offers to wire more up when you want it.

## What's inside

```text
docs-assist/
├── commands/                  # health, draft, plan, audit, verify, update, release-notes, setup, merge-prep
├── agents/                    # the three chairs, cold-reader, doc-harvester, doc-updater, doc-intake, doc-recon, doc-verifier
├── skills/docs-assist/
│   ├── SKILL.md               # core instructions and role definition
│   └── reference/
│       ├── loop.md                # the three-chair authoring loop
│       ├── casting.md             # which chairs to seat, on two axes
│       ├── packet-procedure.md    # the cold artifact, for a doc a reader acts on
│       ├── packet-concept.md      # the cold artifact, for a doc a reader learns from
│       ├── ledger.md              # what the writer added that the packet did not say
│       ├── style-stack.md         # project, house style, Google, GitLab, in that order
│       ├── personas.md            # the per-project overlay each chair resolves through
│       ├── harvest.md             # mine what maintainers already explained
│       ├── chairs/                # the constitutions, one per role plus shared rules
│       ├── intake.md              # gather-first intake, which fills the packet by hand
│       ├── content-types.md       # canonical content types
│       ├── tone-and-voice.md      # formatting, heading case, markdown style
│       ├── code-examples.md       # safe, consistent code samples
│       ├── external-verification.md  # checking claims about what you do not vendor
│       ├── claim-verification.md  # tracing a doc's claims out to the code
│       ├── llms-txt.md            # the llms.txt format and maintenance contract
│       ├── impact-analysis.md     # scope a change-based audit or update
│       └── ...                    # registry, config resolution, IA, patterns, style guides
├── skills/writing-task/       # routes writing that nobody called documentation
├── assets/ci/                 # deterministic checks: drift, continuity, paths, claims, decay
├── assets/                    # config templates, doc templates, lint scaffolds, CI, hook recipes
└── scripts/validate.mjs       # repository validator (run in CI)
```

To customize without committing project config, edit `skills/docs-assist/reference/tone-and-voice.md` and `SKILL.md` directly.
For team-wide, update-safe customization, prefer `/docs-assist:setup`.

## What would improve it most

An honest self-assessment, kept in the open on purpose.

The plugin encodes a real documentation methodology, and CI verifies its own structure on every change.
But structure is not behavior: most of what this plugin does is instructions to a model, instructions can be followed imperfectly under context pressure, and only parts of it have been exercised as an installed plugin.
The claims above should be read with that asterisk, and the list below is the roadmap for removing it, in priority order:

1. **An eval suite.** Claude Code ships a plugin eval harness (`claude plugin eval`), and the load-bearing behaviors deserve cases: does a cold audit catch planted example drift, does the drafter flag gaps instead of inventing facts, does a healthy docs set get told it is healthy?
1. **Live runs on messy repos.** Fan-out drafting, intake questionnaires, template fetching, and the CI comment flow have not yet run in anger, and this repo is too well-groomed to be a fair test.
1. **Real users.** A few solo maintainers running `/docs-assist:health`, a plan, and a fan-out, then reporting where it fell down, would outweigh any amount of self-assessment.
1. **The deferred backlog**, in rough priority order:
   - A standalone `npx` CLI, so the plugin reaches people who don't use Claude Code without forking the instructions into a second codebase.
     Blocked on a naming decision and on which adapters ship first; the [packaging plan](https://github.com/EdwardAngert/docs-agent-plugin/blob/working-notes/docs/standalone-cli-plan.md) is on the `working-notes` branch.
   - Auto-running `/docs-assist:update` from CI on detector hits, committing docs changes to the pull request.
     The trust cliff: the sticky-comment loop should earn confidence first.
   - Docs-impact noise knobs: a per-repo ignore list in `.docs-assist/config.yml`, and requiring term matches inside backticks rather than anywhere in prose.
   - Navigation generation for Astro, Hugo, and Jekyll.
     Docusaurus and MkDocs are covered.
   - Audit and audit-methodology consolidation, where some of the duplication is load-bearing.

If you try it and something falls short, [an issue](https://github.com/EdwardAngert/docs-agent-plugin/issues) with what you expected and what happened is the most valuable contribution this project can receive.

## Status

Version 0.9.9, which is the 1.0 overhaul shipped as a release candidate.
The content is what 1.0.0 will be; the number is short of it on purpose, so this can be run against real repositories and corrected first.
The command surface and the drafting mechanism both changed substantially, so anything you pinned against 0.9.x is worth re-reading.
`CHANGELOG.md` has the detail, including a Known limits section.

## Background

This plugin codifies methodologies from 10 years of technical writing experience: building doc practices from scratch for developer tools, managing documentation teams for enterprise platforms, API and SDK documentation, and docs-as-code workflows.

The core philosophy: I just want your knowledge, expertise, and steps.
I'll deal with putting it in the right order, getting the words right, and making it all work together.
This plugin brings that same approach to every Claude Code session.

## Renamed from documentation-agent

This plugin was `documentation-agent`.
It is now `docs-assist`, and commands are invoked as `/docs-assist:...`.
Update any saved references or aliases.

## Contribute

See the [contributing guidelines](CONTRIBUTING.md).

## License

Apache 2.0.
See [LICENSE](LICENSE) for details.
