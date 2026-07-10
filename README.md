# Docs Assist

> Turn what your team knows into documentation. No one has to become a technical writer.

A Claude Code plugin that coaches people through writing documentation.

You have subject matter experts with knowledge in their heads: engineers who built the feature, support leads who know every edge case, PMs who understand the workflow.
They don't need to be good at documentation.
They just need to share what they know.

This plugin is the documentation expertise layer.
It extracts their knowledge, picks the right structure, applies writing standards, and produces a draft they can review.
Think of it as having a technical writer in every Claude Code session, one who asks the right questions and handles the formatting so contributors can focus on what they know.

**Who it's for:** engineers, support leads, PMs, and repo owners who have knowledge to share but don't want to become documentation experts.

## What It Looks Like

This section came out of one such session. Documenting this very plugin, it went like this:

**You:**

> Help me update the README with great docs about this plugin. Where do I start?

**Docs Assist:**

> Let me read it back first. The README is solid, but it tells more than it shows, it opens with a rename note that only old users care about, and the file tree has drifted from the code (it's missing two files). Start with one thing: a short "What it looks like" example near the top, because that's what turns a scroller into someone who tries it. Then move the rename note down and fix the tree. I'll ship those three now.

It added this section, moved the rename note, and corrected the tree.
The rest of this README is the result.
Its own linter caught a formatting slip in the draft and flagged it, so it fixed that too.
You review for accuracy. The formatting is already handled.

## Install

1. Open Claude Code:

   ```bash
   claude
   ```

1. Add this repository as a [plugin marketplace](https://code.claude.com/docs/en/plugin-marketplaces):

   ```bash
   /plugin marketplace add EdwardAngert/docs-agent-plugin
   ```

1. Install the plugin:

   ```bash
   /plugin install docs-assist@docs-assist-marketplace
   ```

1. Restart Claude Code.

1. See where your docs stand:

   ```text
   /docs-assist:health
   ```

   You get a thirty-second scorecard (coverage, freshness, consistency, findability), the single highest-leverage fix, and an offer to make it now.

## Documentation

- [Set Up Documentation Standards for Your Team](docs/set-up-documentation-standards-for-your-team.md): for docs leads and devrel. Why to install, what changes for contributors, and how to customize.
- [Write Docs With Docs Assist](docs/write-docs-with-docs-assist.md): for individual contributors. What the plugin does, and how to get the most out of it.
- [Command reference](docs/command-reference.md): every command with its argument and an example.

## How It Works

The plugin activates automatically when you ask for documentation help.
You don't need to learn any special syntax or documentation theory.

The simplest path is to tell Claude what you want to document:

```text
I need to document how to set up SSO for our enterprise customers.
```

Claude gathers what you know, connects it to your existing docs, and produces a structured draft.
You review for accuracy, Claude handles the rest.
The full rhythm is in [Gather Before You Structure](#gather-before-you-structure) below.

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

## Gather Before You Structure

The plugin works the way a technical writer does: it gathers before it structures.
When you document something new, it opens with "tell me everything you know" and takes your brain dump in any order.
Then it reflects it back, situates it against your existing docs and how people use the product, and digs into the gaps before it shapes anything.

Starting from scratch with a pile of raw material, like tickets, a PRD, notes, or old docs?
It reads the pile in an isolated pass and hands back a content inventory (clusters, gaps, duplication), then turns that into a documentation plan.

Documenting a whole repo and not sure where to start?
It reads the codebase, tells you what it found and where it would start, and gets one good doc out the door (usually a README or quickstart) before planning the rest.
It plans to ship first and iterate, not to boil the ocean.

## Commands

You rarely need these: the plugin activates from plain conversation, and the commands are optional shortcuts.
For every command's argument and an example, see the [command reference](docs/command-reference.md).

### Write and Plan

- `/docs-assist:draft [topic]`: the primary workflow.
  Guides a contributor through turning their knowledge into a structured draft.
  Bring the expertise, the plugin handles the writing.
- `/docs-assist:plan [repo or description]`: plan a full documentation set.
  Reads the codebase, asks about users and goals, maps user journeys, and proposes a prioritized plan before writing anything.
  Once the plan is approved, docs whose material already exists draft in parallel across the `doc-drafter` subagent, and you review the queue instead of co-writing each one.
- `/docs-assist:make-examples [doc-path]`: add or improve copy-paste safe code examples in an existing doc.
- `/docs-assist:template [problem or topic]`: start from a proven structure (The Good Docs Project) instead of a blank page.
  Suggests a template from what you describe and fills the skeleton with what you know.

### Review and Maintain

- `/docs-assist:health [docs dir]`: a fast docs health check, and the best first command to run.
  Scores coverage, freshness, consistency, and findability, names the highest-leverage fix, and offers to make it.
- `/docs-assist:audit [path]`: audit a directory or file for quality, structure, findability, and gaps.
  Produces a prioritized report.
- `/docs-assist:update [ref, PR, or path]`: find and update the docs affected by a code change.
  Reads the diff, locates the docs that reference what changed, and updates them for review.
- `/docs-assist:release-notes [range, tag, or version]`: turn a release's worth of changes into reader-facing release notes.
  Reads the commits and PRs, asks you for the why, and writes notes that lead with what readers must know.
- `/docs-assist:agent-ready [docs dir]`: make the docs legible to AI tools.
  Creates or repairs `llms.txt`, completes per-doc frontmatter, and records the repo's conventions where the next tool will find them.

### Configure

- `/docs-assist:init [docs dir]`: scaffold project-local configuration, pre-filled from the repo's existing conventions.
- `/docs-assist:setup-lint [tool]`: scaffold optional documentation linting, generated from your config.
- `/docs-assist:setup-hooks [hook]`: install opt-in git, in-session, and CI hooks, including the pull-request docs-impact check.
  Default off.
- `/docs-assist:setup-site [ssg]`: generate site navigation from the docs' own metadata (`llms.txt` order becomes sidebar order), scaffolding a minimal Docusaurus or MkDocs setup when no site exists.

## Configure for Your Team

Commit a `.docs-assist/` directory and the whole team writes to the same conventions:

- `.docs-assist/config.yml`: machine-readable settings (heading case, list markers, frontmatter field names, lint tools).
- `.docs-assist/style.md`: prose conventions (voice, terminology, banned phrases).
- `.docs-assist/templates.yml`: optional settings for documentation templates (selection model, source).
- `.docs-assist/example-variables.txt`: canonical placeholder values for code samples, so examples stay consistent across docs. The plugin maintains it.
- `.docs-assist/terms.txt`: canonical product terms and the variants to avoid, so the same concept never appears under different names. The plugin maintains it, and audits flag drift against it.

Run `/docs-assist:init` to generate them, pre-filled from what your docs already do.
Because this config is committed to your repo, it survives plugin updates and is shared across contributors, unlike editing the plugin's own files.

Writing solo? The same config is how the plugin acts as your second reader: it holds your docs to a consistent line and catches the drift in examples and terminology that a team would catch in review.

## Lint With the Same Rules You Write By

Linting is optional and never bundled.
Run `/docs-assist:setup-lint` to scaffold it, and the plugin generates the linter config from your `.docs-assist/config.yml`.
That means one source of truth: the same settings drive how the agent writes and how the linter checks, so they never drift.

- A Vale custom style encodes the prose rules (no em dashes, action-oriented headings, descriptive link text, banned weasel words).
- markdownlint covers the structural rules.
- cspell and a link checker cover spelling and links.
- MegaLinter is offered for teams that want one aggregated tool.
- An optional GitHub Actions workflow runs the checks on pull requests.

The command detects any linter you already use and extends it rather than replacing it.

## Start From a Proven Template

When you document something new, the plugin can start you from a proven structure instead of a blank page, using [The Good Docs Project](https://thegooddocsproject.dev/) templates.
Describe the problem in plain words, for example "people keep opening tickets about a login loop," and it suggests a matching template, then fills the skeleton with what you know.

Templates supplement the content types; they never replace them.
Suggesting one is free and offline, so the assistant offers a template in any drafting conversation, and only fetches it when you accept.
`/docs-assist:template` turns the feature on for a team or scaffolds a template directly.
The Good Docs templates are MIT-0; see `THIRD-PARTY-NOTICES.md`.

## Keep Docs in Sync With Code

When code changes, run `/docs-assist:update` with a git ref, a PR number, or a path.
The plugin reads the diff, summarizes what changed, finds the docs that reference it, and updates them for your review.
Large changes fan out across the `doc-updater` subagent so many docs update in parallel.

You can also put the watching on autopilot.
`/docs-assist:setup-hooks ci` installs a docs-impact check that runs on every pull request: a deterministic, token-free detector that flags diffs riding the change types that break docs (moved files, changed headings, changed code terms the docs mention, large silent source changes) and tells reviewers exactly which `/docs-assist:update` range to run.
Cheap detection in CI, expensive updating only when it is warranted.

## Make Your Docs Agent-Ready

Your docs' readers now include AI tools: coding agents, docs assistants, and search systems that read structure before prose.
Run `/docs-assist:agent-ready` to retrofit the docs set for them: it creates or repairs `llms.txt` (the map an AI tool reads first), completes per-doc frontmatter using your repo's own field names, and records your conventions where the next tool will find them.
The plugin then maintains all of it as part of its normal drafting and updating work.

## What's Inside

```text
docs-assist/
├── commands/                  # health, draft, plan, audit, make-examples, update, release-notes, agent-ready, template, init, setup-lint, setup-hooks, setup-site
├── agents/                    # doc-auditor, doc-updater, doc-intake, doc-recon, doc-drafter subagents
├── skills/docs-assist/
│   ├── SKILL.md               # core instructions and role definition
│   └── reference/
│       ├── intake.md              # gather-first intake loop and corpus inventory
│       ├── content-types.md       # canonical content types and frontmatter values
│       ├── tone-and-voice.md      # formatting, heading case, markdown style
│       ├── code-examples.md       # safe, consistent code samples and the variables registry
│       ├── terminology.md         # consistent product terms and the terms registry
│       ├── llms-txt.md            # the llms.txt format and maintenance contract
│       ├── frontmatter-spec.md    # per-doc metadata schema
│       ├── config-resolution.md   # how project-local config overrides defaults
│       ├── templates.md           # suggest and apply Good Docs templates
│       ├── impact-analysis.md     # scope a change-based audit or update
│       ├── documentation-patterns.md
│       ├── audit-methodology.md
│       ├── ia-methodology.md
│       └── style-guides.md
├── assets/                    # config templates, doc templates, lint scaffolds, CI, hook recipes
└── scripts/validate.mjs       # repository validator (run in CI)
```

To customize without committing project config, edit `skills/docs-assist/reference/tone-and-voice.md` and `SKILL.md` directly.
For team-wide, update-safe customization, prefer `/docs-assist:init`.

## Background

This plugin codifies methodologies from 10 years of technical writing experience: building doc practices from scratch for developer tools, managing documentation teams for enterprise platforms, API and SDK documentation, and docs-as-code workflows.

The core philosophy: I just want your knowledge, expertise, and steps.
I'll deal with putting it in the right order, getting the words right, and making it all work together.
This plugin brings that same approach to every Claude Code session.

## Renamed From documentation-agent

This plugin was `documentation-agent`.
It is now `docs-assist`, and commands are invoked as `/docs-assist:...`.
Update any saved references or aliases.

## Contribute

See the [contributing guidelines](CONTRIBUTING.md).

## License

Apache 2.0. See [LICENSE](LICENSE) for details.
