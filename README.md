# Documentation Agent

A Claude Code plugin that coaches people through writing documentation.

You have subject matter experts with knowledge in their heads — engineers who built the feature, support leads who know every edge case, PMs who understand the workflow.
They don't need to be good at documentation.
They just need to share what they know.

This plugin is the documentation expertise layer.
It extracts their knowledge, picks the right structure, applies writing standards, and produces a draft they can review.
Think of it as having a technical writer in every Claude Code session — one who asks the right questions and handles the formatting so contributors can focus on what they know.

## Install

1. Open Claude Code:

   ```bash
   claude
   ```

1. Add this repository as a [plugin marketplace](https://code.claude.com/docs/en/plugin-marketplaces):

   ```bash
   /plugin marketplace add EdwardAngert/documentation-agent-skill
   ```

1. Install the plugin:

   ```bash
   /plugin install EdwardAngert/documentation-agent-skill
   ```

1. Restart Claude Code.

## How It Works

The plugin activates automatically when you ask for documentation help.
You don't need to learn any special syntax or documentation theory.

**The simplest path**: Just tell Claude what you want to document.

```text
I need to document how to set up SSO for our enterprise customers.
```

Claude will ask you a few questions to understand the audience and scope, walk you through getting the details down, then produce a structured draft. You review for accuracy, Claude handles the rest.

**Other prompts that work:**

```text
Help me document feature X for issue #123
```

```text
I just fixed a tricky bug — can we add troubleshooting docs so others don't hit it?
```

```text
Review this README for clarity and completeness
```

## Commands

### `/documentation-agent:draft [topic]`

The primary workflow.
Guides you through contributing documentation — bring your expertise, the plugin handles the writing.

Claude will:

- Ask what you're documenting and who it's for
- Pull out your knowledge through conversational prompts
- Pick the right document structure automatically
- Produce a formatted draft you can review for accuracy
- Refine based on your feedback and write the final file

### `/documentation-agent:plan [repo or description]`

Plan a full documentation set for a project.
Use when you need to document something from scratch or reorganize existing docs into a coherent structure.

Claude will:

- Read the codebase to understand the project
- Ask about your users, their goals, and how deep to go
- Map user journeys and identify what docs need to exist
- Propose a prioritized plan with content types, audiences, and writing order
- Execute the plan doc by doc once you approve it

### `/documentation-agent:audit [path]`

Run a documentation audit on a directory or file:

```bash
/documentation-agent:audit docs/
```

Evaluates content quality, structure, findability, and gaps.
Produces a prioritized report with actionable recommendations.

### `/documentation-agent:make-examples [doc-path]`

Add or improve code examples in a documentation file:

```bash
/documentation-agent:make-examples docs/setup.md
```

Identifies sections that need examples, creates safe copy-paste ready code, and asks before inserting.

## What's Inside

The plugin includes writing standards and methodologies that Claude applies automatically.
You can customize any of these to match your team's conventions:

```text
skills/documentation-agent/
├── SKILL.md                    # Core instructions and role definition
├── frontmatter-spec.md         # Per-doc metadata schema and how the plugin uses it
├── tone-and-voice.md           # Formatting rules, heading case, markdown style
├── documentation-patterns.md   # Content types, examples, SEO, accessibility
├── content-audit-framework.md  # Audit methodology
├── ia-design-methodology.md    # Information architecture design
└── style-guides.md             # Style guide selection and enforcement
```

**What to customize first:**

- `tone-and-voice.md` — Change heading case, list style, or add your company's conventions
- `SKILL.md` — Adjust the coaching approach or add project-specific instructions

## Background

This plugin codifies methodologies from 10 years of technical writing experience — building doc practices from scratch for developer tools, managing documentation teams for enterprise platforms, API and SDK documentation, and docs-as-code workflows.

The core philosophy: I just want your knowledge, expertise, and steps.
I'll deal with putting it in the right order, getting the words right, and making it all work together.
This plugin brings that same approach to every Claude Code session.

## Contribute

See the [contributing guidelines](CONTRIBUTING.md).

## License

Apache 2.0 — see [LICENSE](LICENSE) for details.
