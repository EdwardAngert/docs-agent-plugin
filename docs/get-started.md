---
title: "Get started with Docs Assist"
description: "Install the plugin, set it up so it writes like your project, and make sure it shows up when it should."
content-type: doc
audience: contributor
---

# Get started with Docs Assist

Three things, in order: install it, set it up so it writes like your project, and make sure it gets asked in the first place.

The last one is the step people skip, and it is the one that decides whether the plugin is ever used.

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
Name a stage to run it alone:

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

The minimum worth doing is stages 1 and 5.
Conventions so the plugin writes like your project, and reachability so it gets asked at all.

Everything it writes is committed to your repo, so it survives plugin updates and is shared across contributors, unlike editing the plugin's own files.

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
The setup command's reachability stage offers to add it, adjusted to your layout.

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

The full reasoning, including why the useful shape is two events rather than one, is in [`reference/triggering.md`](../skills/docs-assist/reference/triggering.md).

## Keep it current

To update the plugin, run `/plugin`, select `docs-assist`, and choose the update option.
From a shell, `claude plugin update docs-assist@docs-assist-marketplace` does the same, and a restart applies it.

Then run `/reload-plugins` so the running session picks up the new version.
Skipping that leaves the session on the old commands and skill instructions even though the update installed cleanly.

Check the [changelog](../CHANGELOG.md) for what changed since your version.
Read it before upgrading from 0.9.x: seven commands were removed outright rather than deprecated, so anything you pinned or scripted against them is worth re-reading.

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
