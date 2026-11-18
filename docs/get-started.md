---
title: "Get started with Docs Assist"
description: "Install the plugin, set it up so it writes like your project, and make sure it shows up when it should."
content-type: doc
audience: contributor
---

# Get started with Docs Assist

Three things, in order: install it, set it up so it writes like your project, and make sure it gets asked in the first place.

The last one is the step people skip, and it is the one that decides whether the plugin is ever used.
It turns out to be two separate problems: requests that are documentation-shaped but don't say so, which the plugin already matches on its own, and requests that never mention documentation at all, which need a line in `CLAUDE.md` to fix.

## Before you start

- Claude Code, recent enough to have `/plugin` and `/reload-plugins`.
- **Run this from inside the project you want documented.** Install works anywhere; setup writes into the repository you are sitting in, so starting from your home directory produces config for nothing.
- A git repository, if you want the pre-commit hook or anything committed.
- Some existing documentation, even rough.
  Setup reads it to detect your conventions, and a repo with none gets defaults instead.
- Node, for the deterministic checks.
  Nothing else is needed to draft, plan, or audit.

Vale and markdownlint are installed by the linting stage if you accept it, so you do not need them beforehand.

## Install the plugin

1. Open Claude Code:

   ```bash
   claude
   ```

1. Add this repository as a [plugin marketplace](https://code.claude.com/docs/en/plugin-marketplaces):

   ```text
   /plugin marketplace add EdwardAngert/docs-agent-plugin
   ```

1. Install the plugin:

   ```text
   /plugin install docs-assist@docs-assist-marketplace
   ```

1. See where your docs stand:

   ```text
   /docs-assist:health
   ```

   You get a thirty-second scorecard covering coverage, freshness, consistency, and findability, the single highest-leverage fix, and an offer to make it now.

If step 4 comes back "unknown command", the session has not picked the plugin up yet.
Run `/reload-plugins`, and if the commands still do not appear, run `/plugin` and check that `docs-assist` is listed and enabled.

Prefer a shell to the in-session commands?
`claude plugin marketplace add EdwardAngert/docs-agent-plugin` and `claude plugin install docs-assist@docs-assist-marketplace` do the same two steps.

## Set up your project

Installing gives you the plugin.
Setting it up is what makes it write like your project instead of like its defaults.

Ask for it in plain words, or run the command:

```text
/docs-assist:setup
```

It walks six stages, and every one is opt-in with nothing written until you say yes.

The minimum worth doing is stages 1 and 5: conventions, so the plugin writes like your project, and reachability, so it gets asked at all.
The other four are worth reading, but skippable on a first pass.

To run one stage on its own, name it as an argument:

```text
/docs-assist:setup linting
```

The stages, in the order setup offers them:

1. **Conventions.** Reads your existing docs for heading case, list markers, ordered-list style, frontmatter field names, and whether lines break at sentences, then proposes a `.docs-assist/config.yml` and `style.md` that match.
   It arrives as a summary to correct, not a questionnaire, and it never prescribes what your repo already decided.
   When your project has a site, it also offers a markdown reference: how your docs handle images, links, callouts, lists, indentation, and components, with one way recommended wherever they use several, kept in `style.md`.
1. **Linting.** Generates Vale and markdownlint config from that config, so one source of truth drives both how the plugin writes and how the linter checks.
1. **Hooks and CI.** Offers a git pre-commit lint, an in-session doc lint, and CI checks for docs impact, the reference registry, and claims.
   Every one is default off and installed only on an explicit choice.
1. **Personas.** Only when the project will use the authoring loop: a short per-project brief for the chairs that write and review.
1. **Reachability.** Offers the `CLAUDE.md` lines described below, adjusted to your layout.
1. **Site navigation.** Only when the project already has a site generator, and only on a yes.
   Generates navigation from the docs' own metadata rather than a hand-maintained list, so a new page cannot be silently omitted.
   Docusaurus and MkDocs are covered.

Everything it writes lives in your project rather than in the plugin, so it survives plugin updates.
The rules from stages 1 and 4 stay on your machine unless you choose to share them with your team; setup asks.

## What setup writes, and how to remove it

Every row is opt-in, nothing is written before you say yes, and the plugin commits none of it: committing is yours to do.

| Stage        | Path                                        | Visible to git       | To remove                     |
| ------------ | ------------------------------------------- | -------------------- | ----------------------------- |
| Conventions  | `.docs-assist/config.yml`                   | Only if you share it | Delete the file               |
| Conventions  | `.docs-assist/style.md`                     | Only if you share it | Delete the file               |
| Conventions  | `.docs-assist/reference.yml`                | Only if you share it | Delete the file               |
| Linting      | `.vale.ini` and `styles/`                   | Yes                  | Delete both                   |
| Linting      | `.markdownlint-cli2.jsonc`                  | Yes                  | Delete the file               |
| Hooks and CI | `.git/hooks/pre-commit`                     | No                   | Delete the hook               |
| Hooks and CI | `scripts/*.mjs`                             | Yes                  | Delete the scripts you took   |
| Hooks and CI | `.github/workflows/*.yml`                   | Yes                  | Delete the workflows you took |
| Personas     | `.docs-assist/personas/*.md`                | Only if you share it | Delete the directory          |
| Reachability | A `## Documentation` section in `CLAUDE.md` | Yes                  | Delete the section            |
| Site nav     | Your generator's nav config                 | Yes                  | Revert the file               |

Three things this table is telling you.

The rules under `.docs-assist/` stay on your machine by default: setup adds a `.docs-assist/.gitignore` that hides the folder from git.
Sharing them means your team and your CI checks work from the same rules; tell setup to share them, or delete that file, and commit the rules.

Nothing here is load-bearing for your documents.
Delete all of it and your docs are unchanged plain markdown; you lose the conventions the plugin writes by and the checks that enforce them, and nothing else.

The git pre-commit hook is the one row git never sees.
It lives in `.git/hooks/`, which git does not track, so it is per-clone: a teammate who clones the repo does not get it, and deleting your clone takes it with you.

Uninstalling the plugin itself is Claude Code's job rather than this plugin's: `/plugin` lists what you have installed and removes it.
That is a separate step from this table, on purpose; see [How to remove the plugin from Claude Code](#how-to-remove-the-plugin-from-claude-code) at the end of this page.

## Make sure it shows up

The plugin has four ways in, and only one of them starts without anyone asking:

| Surface  | How it starts                                          | Needs someone to ask |
| -------- | ------------------------------------------------------ | -------------------- |
| Skill    | Matched against what you said                          | Yes                  |
| Command  | Invoked as `/docs-assist:...`                          | Yes                  |
| Subagent | Started by a workflow that is already running          | Yes                  |
| Hook     | Fired by the event itself                              | No                   |

Skills, commands, and subagents only start when someone asks, so they cannot notice anything you did not bring up.
The plugin's built-in notices, described [below](#what-the-plugin-notices-on-its-own), cover part of that gap: they catch a broken link or a changed file that docs describe, while you work on something else.
For anything beyond that, someone has to ask.

Two different problems hide behind "it didn't fire", and they have different fixes.

**Your request was documentation-shaped but not phrased as documentation** ("write the PR body", "update the changelog").
That is a matching problem, and the second skill, `writing-task`, exists for it: a wider net that routes to the capability that fits, and that is allowed to find nothing and say so, which is what keeps it from becoming noise.
Nothing to configure.

**You never mentioned it at all.** That is a push problem, and no skill description can solve it.
Fix it in this order.

### Add three lines to `CLAUDE.md`

If you already ran the setup command's reachability stage, this is done; skip to [Share your rules, if your team should use them](#share-your-rules-if-your-team-should-use-them).

The highest-leverage fix, and the cheapest.
`CLAUDE.md` is always in context where a skill description is only matched, so a standing instruction there outranks anything the plugin can say about itself:

```markdown
## Documentation

This repo uses the Docs Assist plugin. When work touches anything under `docs/`,
the README, a release note, or a pull request description, use it rather than
writing prose directly. Start with `/docs-assist:health` if the state is unclear.
If finishing it surfaces something else that blocks it, fix that first and say
so, rather than stopping to ask.
```

Keep it short and specific about where.
A vague instruction competes with everything else in that file and loses.
The last line earns its place despite that: `CLAUDE.md` loads on every turn where a skill description only has to be matched, so it is the cheapest place to make a mid-task judgment call reliable rather than left to chance.

### Share your rules, if your team should use them

A `.docs-assist/` directory does not trigger anything by itself, and it changes what happens once the plugin is running: the conventions are yours rather than inferred.
Setup keeps it on your machine unless you choose to share it.
When teammates should write to the same rules, share and commit it alongside the `CLAUDE.md` lines.
One gets the plugin invoked, the other makes the invocation behave like your project.

### What the plugin notices on its own

The plugin ships two hooks that are on as soon as it is installed.
A hook is a check that Claude Code runs on an event, such as a file being edited, without anyone asking for it.

After Claude edits a file, the first hook checks it, with no model and no tokens:

- In a markdown file, links to other files and headings that no longer exist, and links elsewhere in your docs that pointed at a heading this edit removed.
- In any other file, which of your docs name it by path, since those docs may describe what just changed.

When you next send a prompt, the second hook re-checks the broken links it found, drops any already fixed, and passes the rest to Claude once.
Claude mentions it only if it bears on what you are doing, offers to fix it, and drops it if you decline.
Most of the time there is nothing to say, and you see nothing.

It skips files git ignores, and anything outside a git repository.
To turn it off for a project, add `notices: false` to `.docs-assist/config.yml`.
To turn it off for yourself everywhere, set `DOCS_ASSIST_NOTICES=0` in your environment.

### The notes the plugin keeps

While it works on a branch, the plugin keeps notes the way a writer does beside an expert: what people told it that the code can't confirm, the questions and their answers, the decisions and why, and what it ran.
When an answer or a correction arrives, the plugin updates what it replaces, so the notes don't hold two versions of one thing.
They name people by role, never by name.

The notes are memory, not evidence.
When you say something that disagrees with them, or the code has changed since, the plugin goes by what is true now: it reads the code again or asks you, then fixes the note.

When the branch is ready for review, the plugin offers to write the pull request description from the notes, and to add a section per doc if you want one.
It checks every claim against the code again before calling it verified, and shows you the description before posting anything.

### What stays out of your repository

The plugin delivers documentation, and nothing else lands in your repository unless you ask for it.
Its notes, drafts, plans, reports, and check output live under `.docs-assist/` in directories git ignores, so `git status` stays clean.
It leaves no comments, markers, or metadata of its own in your docs, and writes only the frontmatter fields your docs already use.
The rules setup writes stay out of git too, unless you choose to share them; the rest of what setup adds is yours to commit or not.

To turn the notes off for a project, add `journal: false` to `.docs-assist/config.yml`.
To turn them off for yourself everywhere, set `DOCS_ASSIST_JOURNAL=0` in your environment.

### Add more hooks, if you want them

Setup offers further hooks one at a time, and they are off until you accept each one: a lint run after every doc edit, a git pre-commit check, and CI checks for pull requests.
Setup says what each one does and where it goes when it offers it.

A hook can put information in front of Claude and nothing more.
It cannot make Claude offer anything, so everything after that is judgment.
The rule the built-in notices follow is the one worth knowing before you add any: a layer that speaks whenever it can stops being read.

The full reasoning, including why the useful shape is two events rather than one, is in the plugin's own `skills/docs-assist/reference/triggering.md`, which you can read [on GitHub](https://github.com/EdwardAngert/docs-agent-plugin/blob/main/skills/docs-assist/reference/triggering.md) if you installed from the marketplace and have no checkout.

## Check that it worked

Three things, each with an answer you can see.

**Setup wrote what you accepted.**
`git status` shows the files from the table above, and only the ones you said yes to.

**The conventions took.**
Run `/docs-assist:health` again and compare it to the scorecard from the install step.
Consistency and findability are the dimensions most likely to move once the plugin is writing to your rules.

**The plugin gets asked.**
This is the one people skip, and it is the one worth testing, because it fails silently.
Say something documentation-shaped without using the word documentation:

```text
Write the pull request description for this branch.
```

If the reachability lines took, the plugin picks that up as writing worth helping with.
If you get a generic answer instead, `CLAUDE.md` is the first thing to check: the section has to be in the file Claude actually loads for this repo, and it has to name the paths your docs really live under.

## What to do next

- Not sure where your docs stand?
  Ask for a health check, or run `/docs-assist:health`.
- Ready to write something?
  Describe what you want to document in plain words.
  You do not need a command.
- Setting standards for a team?
  See [Set up documentation standards for your team](set-up-documentation-standards-for-your-team.md).
- Want the full surface?
  See the [command reference](command-reference.md).

## Keep it current

From a shell:

```bash
claude plugin update docs-assist@docs-assist-marketplace
```

An update does not reach the session that is already running.
Either restart Claude Code, or run `/reload-plugins` in the open session; you do not need both.
Skipping it leaves you on the old commands and skill instructions even though the update installed cleanly.

Installed at more than one scope?
Each is updated separately, and `claude plugin list` shows the version and scope of each, which is also how you find the version number the changelog is asking you for.

Check the [changelog](../CHANGELOG.md) for what changed since your version.
Read it before upgrading from 0.9.x: seven commands were removed outright rather than deprecated, so anything you pinned or scripted against them is worth re-reading.

## How to remove the plugin from Claude Code

```bash
claude plugin uninstall docs-assist@docs-assist-marketplace
```

This removes the plugin from the default `user` scope.
If you installed to a different scope, pass it explicitly: `--scope project` or `--scope local`.
`--keep-data` preserves `~/.claude/plugins/data/docs-assist/` if you plan to reinstall later; without it, that directory goes too.

This does not touch anything setup wrote into your project.
[What setup writes, and how to remove it](#what-setup-writes-and-how-to-remove-it) lists every file it can add, whether git sees it, and how to remove it: uninstalling the plugin and removing its footprint from a project are two separate steps, on purpose.
The plugin stops running the moment it's uninstalled, but the config it wrote is yours, and safe to keep even without the plugin installed.
