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
1. **Linting.** Generates Vale and markdownlint config from that config, so one source of truth drives both how the plugin writes and how the linter checks.
1. **Hooks and CI.** Offers a git pre-commit lint, an in-session doc lint, and CI checks for docs impact, the reference registry, and claims.
   Every one is default off and installed only on an explicit choice.
1. **Personas.** Only when the project will use the authoring loop: a short per-project brief for the chairs that write and review.
1. **Reachability.** Offers the `CLAUDE.md` lines described below, adjusted to your layout.
1. **Site navigation.** Only when the project already has a site generator, and only on a yes.
   Generates navigation from the docs' own metadata rather than a hand-maintained list, so a new page cannot be silently omitted.
   Docusaurus and MkDocs are covered.

Everything it writes is committed to your repo, so it survives plugin updates and is shared across contributors, unlike editing the plugin's own files.

## What setup writes, and how to remove it

Every row is opt-in, nothing is written before you say yes, and everything lands in your repository rather than in the plugin.

| Stage        | Path                                        | Committed | To remove                     |
| ------------ | ------------------------------------------- | --------- | ----------------------------- |
| Conventions  | `.docs-assist/config.yml`                   | Yes       | Delete the file               |
| Conventions  | `.docs-assist/style.md`                     | Yes       | Delete the file               |
| Conventions  | `.docs-assist/reference.yml`                | Yes       | Delete the file               |
| Linting      | `.vale.ini` and `styles/`                   | Yes       | Delete both                   |
| Linting      | `.markdownlint-cli2.jsonc`                  | Yes       | Delete the file               |
| Hooks and CI | `.git/hooks/pre-commit`                     | No        | Delete the hook               |
| Hooks and CI | `scripts/*.mjs`                             | Yes       | Delete the scripts you took   |
| Hooks and CI | `.github/workflows/*.yml`                   | Yes       | Delete the workflows you took |
| Personas     | `.docs-assist/personas/*.md`                | Yes       | Delete the directory          |
| Reachability | A `## Documentation` section in `CLAUDE.md` | Yes       | Delete the section            |
| Site nav     | Your generator's nav config                 | Yes       | Revert the file               |

Two things this table is telling you.

Nothing here is load-bearing for your documents.
Delete all of it and your docs are unchanged plain markdown; you lose the conventions the plugin writes by and the checks that enforce them, and nothing else.

The git pre-commit hook is the one row that is not committed.
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

That has one consequence worth stating plainly: the plugin cannot notice anything you did not bring up.
Someone editing `install.mdx` who never says "docs" gets no help, not because the plugin is unable, but because nothing asked it to look.

Two different problems hide behind "it didn't fire", and they have different fixes.

**Your request was documentation-shaped but not phrased as documentation** ("write the PR body", "update the changelog").
That is a matching problem, and the second skill, `writing-task`, exists for it: a wider net that routes to the capability that fits, and that is allowed to find nothing and say so, which is what keeps it from becoming noise.
Nothing to configure.

**You never mentioned it at all.** That is a push problem, and no skill description can solve it.
Fix it in this order.

### Add three lines to `CLAUDE.md`

If you already ran the setup command's reachability stage, this is done; skip to [Commit your configuration](#commit-your-configuration).

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

### Commit your configuration

A `.docs-assist/` directory does not trigger anything by itself, and it changes what happens once the plugin is running: the conventions are yours rather than inferred.
Pair it with the `CLAUDE.md` lines.
One gets the plugin invoked, the other makes the invocation behave like your project.

### Add hooks, if you want a genuine push

Hooks are the only surface that fires without anyone asking, and they are default off.
Setup offers them one at a time.

A hook can put information in front of the model and nothing more.
It cannot make the model offer anything, so everything after that is judgment.

What ships today is one recipe: a check that runs against a markdown file right after it is written or edited.
The wider proactive layer, where findings accumulate quietly and surface once on your next prompt, is designed and not yet built.
The design holds it to one rule, which is the rule worth knowing before you turn any of this on: a layer that speaks whenever it can stops being read.
At most one notice per turn, once per task, and declined means dropped for the session.

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
[What setup writes, and how to remove it](#what-setup-writes-and-how-to-remove-it) lists every file it can add, whether it is committed, and how to remove it: uninstalling the plugin and removing its footprint from a project are two separate steps, on purpose.
The plugin stops running the moment it's uninstalled, but the config it wrote is yours, committed to your repo, and safe to keep even without the plugin installed.
