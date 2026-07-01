# Docs Assist

A Claude Code plugin that coaches people through writing documentation.

You have subject matter experts with knowledge in their heads: engineers who built the feature, support leads who know every edge case, PMs who understand the workflow.
They don't need to be good at documentation.
They just need to share what they know.

This plugin is the documentation expertise layer.
It extracts their knowledge, picks the right structure, applies writing standards, and produces a draft they can review.
Think of it as having a technical writer in every Claude Code session, one who asks the right questions and handles the formatting so contributors can focus on what they know.

> **Renamed**: this plugin was `documentation-agent`.
> It is now `docs-assist`, and commands are invoked as `/docs-assist:...`.
> Update any saved references.

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

## How It Works

The plugin activates automatically when you ask for documentation help.
You don't need to learn any special syntax or documentation theory.

The simplest path is to tell Claude what you want to document:

```text
I need to document how to set up SSO for our enterprise customers.
```

Claude asks a few questions to understand the audience and scope, walks you through getting the details down, then produces a structured draft.
You review for accuracy, Claude handles the rest.

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

## Commands

### Write and Plan

- `/docs-assist:draft [topic]`: the primary workflow.
  Guides a contributor through turning their knowledge into a structured draft.
  Bring the expertise, the plugin handles the writing.
- `/docs-assist:plan [repo or description]`: plan a full documentation set.
  Reads the codebase, asks about users and goals, maps user journeys, and proposes a prioritized plan before writing anything.
- `/docs-assist:make-examples [doc-path]`: add or improve copy-paste safe code examples in an existing doc.
- `/docs-assist:template [problem or topic]`: start from a proven structure (The Good Docs Project) instead of a blank page.
  Suggests a template from what you describe and fills the skeleton with what you know.

### Review and Maintain

- `/docs-assist:audit [path]`: audit a directory or file for quality, structure, findability, and gaps.
  Produces a prioritized report.
- `/docs-assist:update [ref, PR, or path]`: find and update the docs affected by a code change.
  Reads the diff, locates the docs that reference what changed, and updates them for review.

### Configure

- `/docs-assist:init [docs dir]`: scaffold project-local configuration, pre-filled from the repo's existing conventions.
- `/docs-assist:setup-lint [tool]`: scaffold optional documentation linting, generated from your config.
- `/docs-assist:setup-hooks [hook]`: install opt-in git and in-session hooks.
  Default off.

## Configure for Your Team

Commit a `.docs-assist/` directory and the whole team writes to the same conventions:

- `.docs-assist/config.yml`: machine-readable settings (heading case, list markers, frontmatter field names, lint tool).
- `.docs-assist/style.md`: prose conventions (voice, terminology, banned phrases).

Run `/docs-assist:init` to generate both, pre-filled from what your docs already do.
Because this config is committed to your repo, it survives plugin updates and is shared across contributors, unlike editing the plugin's own files.

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

## What's Inside

```text
docs-assist/
├── commands/                  # draft, plan, audit, make-examples, update, template, init, setup-lint, setup-hooks
├── agents/                    # doc-auditor, doc-updater subagents
├── skills/docs-assist/
│   ├── SKILL.md               # core instructions and role definition
│   └── reference/
│       ├── content-types.md       # canonical content types and frontmatter values
│       ├── tone-and-voice.md      # formatting, heading case, markdown style
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

## Contribute

See the [contributing guidelines](CONTRIBUTING.md).

## License

Apache 2.0. See [LICENSE](LICENSE) for details.
