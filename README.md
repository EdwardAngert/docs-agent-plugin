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

Two things reach outside your repo, both on an explicit yes: fetching a template, and checking a claim about something your project does not vendor.

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

1. Run `/reload-plugins` so the session picks up the new commands and skills.

1. See where your docs stand:

   ```text
   /docs-assist:health
   ```

   You get a thirty-second scorecard (coverage, freshness, consistency, findability), the single highest-leverage fix, and an offer to make it now.

If step 5 comes back "unknown command", the session is still running the plugin list it started with.
Run `/reload-plugins` again, and if the commands still do not appear, run `/plugin` and check that `docs-assist` is listed and enabled.

Prefer the terminal to the in-session commands?
`claude plugin marketplace add EdwardAngert/docs-agent-plugin` and `claude plugin install docs-assist@docs-assist-marketplace` do the same two steps from a shell.

## Set up your project

Installing gives you the plugin.
Setting up is what makes it write like your project instead of like its defaults, and makes it show up when it should.

One command walks all of it, and every stage is opt-in with nothing written until you say yes:

```text
/docs-assist:setup
```

It runs six stages, and you can name one to run it alone (`/docs-assist:setup linting`):

1. **Conventions.** Reads your existing docs and proposes a `.docs-assist/config.yml` and `style.md` that match what they already do, as a summary to correct rather than a questionnaire.
   See [Configure for your team](#configure-for-your-team).
1. **Linting.** Generates Vale, markdownlint, and cspell config from that config, so one source of truth drives both how the plugin writes and how the linter checks.
   See [Lint with the same rules you write by](#lint-with-the-same-rules-you-write-by).
1. **Hooks and CI.** Offers a git pre-commit lint, an in-session doc lint, and CI checks for docs impact, the reference registry, and claims.
   Every one default off, installed only on an explicit choice.
1. **Personas.** Only when the project will use the authoring loop: a short per-project brief for the chairs that write and review.
1. **Reachability.** Offers the `CLAUDE.md` line described in [Make it show up](#make-it-show-up), adjusted to your layout.
1. **Site navigation.** Generates nav from your docs' own metadata for Docusaurus or MkDocs, and scaffolds a minimal setup when no site exists.

The minimum worth doing is stages 1 and 5: conventions so the plugin writes like your project, and the `CLAUDE.md` line so it gets asked in the first place.

Everything it writes is committed to your repo, so it survives plugin updates and is shared across contributors, unlike editing the plugin's own files.

## Update

Claude Code doesn't auto-update installed plugins.

To update the plugin, open Claude Code, then:

1. Run `/plugin`, select `docs-assist`, and choose the update option.
   `/plugin` also tells you if you're already on the latest version, so this is safe to run just to check.

1. Run `/reload-plugins` so the running session picks up the new version.
   Skipping this step leaves the session on the old commands and skill instructions even though the update installed cleanly.

Check `CHANGELOG.md` for what changed since your version.

## Documentation

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
[Make it show up](#make-it-show-up) covers the two ways to close that gap.

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

## Gather before you structure

The plugin works the way a technical writer does: it gathers before it structures.
When you document something new, it opens with "tell me everything you know" and takes your brain dump in any order.
Then it reflects it back, situates it against your existing docs and how people use the product, and digs into the gaps before it shapes anything.

Starting from scratch with a pile of raw material, like tickets, a PRD, notes, or old docs?
It reads the pile in an isolated pass and hands back a content inventory (clusters, gaps, duplication), then turns that into a documentation plan.

Documenting a whole repo and not sure where to start?
It reads the codebase, tells you what it found and where it would start, and gets one good doc out the door (usually a README or quickstart) before planning the rest.
It plans to ship first and iterate, not to boil the ocean.

## Make it show up

The plugin has four ways in, and only one of them can start on its own:

| Surface  | Who pulls the trigger                                  | Starts on its own |
| -------- | ------------------------------------------------------ | ----------------- |
| Skill    | The model, matching your request against a description | No                |
| Command  | You, typing `/docs-assist:...`                         | No                |
| Subagent | The model, when a workflow fans work out               | No                |
| Hook     | The event itself                                       | Yes               |

That table has one consequence worth stating plainly: the plugin cannot notice anything you did not bring up.
Someone editing `install.mdx` who never says "docs" gets no help, not because the plugin is unable, but because nothing asked it to look.

Two different problems hide behind "it didn't fire", and they have different fixes.

**Your request was documentation-shaped but not phrased as documentation** ("write the PR body", "update the changelog").
That is a matching problem, and the second skill, `writing-task`, exists for it: a wider net that routes to the capability that fits, and that is allowed to find nothing and say so, which is what keeps it from becoming noise.
Nothing to configure.

**You never mentioned it at all.** That is a push problem, and no skill description can solve it.
Fix it in this order.

### Add three lines to `CLAUDE.md`

The highest-leverage fix, and the cheapest.
`CLAUDE.md` is always in context where a skill description is only matched, so a standing instruction there outranks anything the plugin can say about itself:

```markdown
## Documentation

This repo uses the Docs Assist plugin. When work touches anything under `docs/`,
the README, a release note, or a pull request description, use it rather than
writing prose directly. Start with `/docs-assist:health` if the state is unclear.
```

Keep it short and specific about where.
A vague instruction competes with everything else in that file and loses.
`/docs-assist:setup` offers to add it, adjusted to your layout.

### Commit your configuration

A `.docs-assist/` directory does not trigger anything by itself, and it changes what happens once the plugin is running: the conventions are yours rather than inferred.
Pair it with the `CLAUDE.md` line.
One gets the plugin invoked, the other makes the invocation behave like your project.

### Add hooks, if you want a genuine push

Hooks are the only surface that fires without anyone asking, and they are default off.
`/docs-assist:setup` offers them one at a time.

A hook can put information in front of the model and nothing more; it cannot make the model offer anything, so everything after that is judgment.
The plugin holds that judgment to one rule: a proactive layer that speaks whenever it can stops being read.
At most one notice per turn, once per task, and declined means dropped for the session.
Nothing to say is the common case, and saying nothing is the correct behavior rather than a missed opportunity.

The full reasoning, including why the useful hook shape is two events rather than one, is in [`reference/triggering.md`](skills/docs-assist/reference/triggering.md).

## Commands

You rarely need these: the plugin activates from plain conversation, and the commands are optional shortcuts.
For every command's argument and an example, see the [command reference](docs/command-reference.md).

### Write and plan

- `/docs-assist:draft [topic]`: the primary workflow.
  Guides a contributor through turning their knowledge into a structured draft.
  Bring the expertise, the plugin handles the writing.
  Behind it, the work is split across three isolated reviewers: one that holds what is true, one that keeps examples coherent across the whole docs set, and one that writes and then declares every assumption it had to make to write it.
  That last list is what you review, instead of the whole draft.
- `/docs-assist:plan [repo or description]`: plan a full documentation set.
  Reads the codebase, asks about users and goals, maps user journeys, and proposes a prioritized plan before writing anything.
  Once the plan is approved, docs whose material already exists draft in parallel, and you review the queue instead of co-writing each one.

### Review and maintain

- `/docs-assist:health [docs dir]`: a fast docs health check, and the best first command to run.
  Scores coverage, freshness, consistency, and findability, names the highest-leverage fix, and offers to make it.
- `/docs-assist:audit [path]`: review existing docs by reconstructing what each one claims and ruling on it.
  A claim nobody can source is the finding, and in finished prose it is invisible: it sits next to twenty sourced claims and reads exactly like them.
- `/docs-assist:update [ref, PR, or path]`: find and update the docs affected by a code change.
  Reads the diff, locates the docs that reference what changed, and updates them for review.
- `/docs-assist:verify [doc path or directory]`: verify a procedural doc by executing it.
  Runs the steps in an isolated workspace, reports every divergence and missing prerequisite, and records a fresh verification date on a clean pass.
- `/docs-assist:release-notes [range, tag, or version]`: turn a release's worth of changes into reader-facing release notes.
  Reads the commits and PRs, asks you for the why, and writes notes that lead with what readers must know.
- `/docs-assist:merge-prep [branch]`: get a docs change ready to merge.
  Whole-set continuity, `llms.txt`, bundle drift, the deterministic checks, linting, and link checking, in one pass you ask for.
  Nothing expensive runs without being asked.

### Configure

- `/docs-assist:setup [stage]`: conventions, linting, hooks, and site navigation in one pass.
  Every stage opt-in.
  Default off.

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
- MegaLinter is offered for teams that want one aggregated tool.
- An optional GitHub Actions workflow runs the checks on pull requests.

The command detects any linter you already use and extends it rather than replacing it.

## Start from a proven template

When you document something new, the plugin can start you from a proven structure instead of a blank page, using [The Good Docs Project](https://thegooddocsproject.dev/) templates.
Describe the problem in plain words, for example "people keep opening tickets about a login loop," and it suggests a matching template, then fills the skeleton with what you know.

Templates supplement the content types; they never replace them.
Suggesting one is free and offline, so the assistant offers a template in any drafting conversation, and only fetches it when you accept.
Templates are offered during drafting; `/docs-assist:setup` turns the feature on for a team.
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

Version 1.0.0.
The command surface and the drafting mechanism both changed substantially in this release, so anything you pinned against 0.9.x is worth re-reading.
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
