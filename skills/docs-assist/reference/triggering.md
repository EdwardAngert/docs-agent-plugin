# How this plugin gets triggered

What makes the plugin show up, why it sometimes does not, and what a project can add to change that.

Load this when a contributor asks why the plugin did not notice something, or when setting up a project that wants it to be more forward.

## Four surfaces, one of them proactive

| Surface  | Who pulls the trigger                                   | Proactive |
| -------- | ------------------------------------------------------- | --------- |
| Skill    | The model, matching the request against a `description` | No        |
| Command  | The contributor, typing `/docs-assist:...`              | No        |
| Subagent | The model, via the Agent tool                           | No        |
| Hook     | The event itself                                        | Yes       |

A skill activates when the model judges that what the contributor said matches what the skill says it is for.

The first three share a consequence: they cannot notice anything the contributor did not bring up.
The plugin's own hooks, in the next section, cover the mechanical part of that gap; the judgment part still needs someone to ask.

## The two fixes are different problems

**A request that is documentation-shaped but not phrased as documentation** ("write the PR body", "update the changelog") is a matching problem.
The `writing-task` skill exists for exactly this: a wider net, cheap to load, that routes to the right capability.
No new mechanism needed.

**Activity the contributor never mentioned at all** is a push problem, and only a hook can reach it.

## What the plugin ships: the notice hooks

`hooks/hooks.json` registers two hooks that are active as soon as the plugin is enabled, both running `hooks/notices.mjs`:

1. **On the edit**, a `PostToolUse` hook on `Write`, `Edit`, and `MultiEdit` runs a deterministic check against the file that changed and records any finding to a per-session scratch file in the system temp directory.
   No model, no tokens, and no output, so the edit is never interrupted.
1. **On the next prompt**, a `UserPromptSubmit` hook re-checks the broken links that accumulated, drops any already fixed and anything already raised this session, and hands the rest to you as context, once.

The checks are the mechanical half of drift, the half a script can settle without a reader:

- An edited markdown file: its relative links and anchors, and links elsewhere in the set that point at an anchor it no longer has.
  Removing or renaming a heading is the edit that silently breaks other pages, and the one a contributor is least likely to check.
- An edited non-markdown file: which tracked docs name it by path.
  That is a lead, not a finding: read those docs against the change before saying they are wrong.

When the context arrives, the restraint rules below are yours to apply.
Raise it only if it bears on the contributor's current task, offer the fix in plain words rather than naming a command, and drop it for the session if they decline.

It skips files git ignores (working material, per the doc-set rule) and is silent outside a git repository.
A project turns it off with `notices: false` in `.docs-assist/config.yml`; a person turns it off everywhere with `DOCS_ASSIST_NOTICES=0`.

The edit hook also keeps the plugin's working material out of git: a write into one of the working directories under `.docs-assist/` gives that directory a `.gitignore` of `*`.
That runs even with the notices off, because a draft that reaches a commit is a cost the contributor never chose (`journal.md`).

The link resolver is `hooks/links.mjs`, shared with this repo's own validator, and it only judges links it can resolve without knowing the site generator: same-page anchors, and relative paths with a file extension.
Site-rooted paths and routes without a file extension resolve through a generator's routing, so it skips them rather than guess.

## What a project can add

In order of leverage.

### 1. A block in `CLAUDE.md` or `CLAUDE.local.md`

The highest-leverage thing, and the cheapest.

`CLAUDE.md` is always in context, and so is `CLAUDE.local.md`, its personal counterpart that stays out of git.
A skill description is only matched.
A standing instruction in `CLAUDE.md` therefore outranks any description this plugin can write, and it works with no hooks, no configuration, and no mechanism at all.

This is enough:

```markdown
## Documentation

This repo uses the Docs Assist plugin for anything under `docs/`, the README,
release notes, and pull request descriptions. Use it rather than writing prose directly:

- A new doc goes through three steps: draft it with whoever knows the subject
  (`/docs-assist:draft`), write it up (`/docs-assist:write`), then edit it
  (`/docs-assist:edit`). Never write a doc directly.
- To check or fix a doc that exists, use the edit step.
- When a code change leaves docs out of date, use `/docs-assist:update`.
- When the state of the docs is unclear, start with `/docs-assist:health`.

If finishing it surfaces something else that blocks it, fix that first and say
so, rather than stopping to ask.
```

Name the routes, not just the plugin: a trial without it saw a plain "write it up" answered by writing the page in the conversation, skipping the separate writer and the questioning.
Setup puts it in `CLAUDE.local.md` by default, hidden through `.git/info/exclude`, and in `CLAUDE.md` when the contributor wants the team to get it.

Keep it short and specific about where.
A vague instruction competes with everything else in the file and loses.
The last line is worth its cost anyway: it spends the same "always in context" leverage on a mid-task judgment call, the one place a skill description cannot reach because the task is already in progress by the time it would match.

### 2. Committed configuration

`.docs-assist/config.yml` does not trigger anything on its own, and it changes what happens once the plugin is running: the conventions are the project's rather than inferred, and its presence signals the project opted in rather than tolerating a default.

Pair it with the project instructions block.
One gets the plugin invoked; the other makes the invocation behave like this project.

### 3. More hooks

The only genuine push.
The plugin's notice hooks are already on; a project can add its own to `.claude/settings.json`, and setup offers a few.

The notice hooks are built to the shape any proactive hook here should follow, two events rather than one:

1. **On the edit**, a `PostToolUse` or `FileChanged` hook runs a deterministic check against the file that changed and records any finding to a scratch file.
   No model, no tokens.
1. **On the next prompt**, a `UserPromptSubmit` hook reads what accumulated, surfaces it once, and clears it.

Splitting it is not a workaround.
It is what keeps the plugin from interrupting: at most one notice per contributor turn no matter how many files were touched, arriving at a moment they were already going to read something.

**A hook cannot make the model offer anything.** It can put information in front of the model and nothing more.
Everything after that is the model's judgment, which means a hook's payload has to be worth acting on rather than merely true.

## The restraint that makes it work

A proactive layer that speaks whenever it can stops being read.

- Once per turn, at most.
- Once per task.
  A suggestion made twice is an interruption.
- Declined means dropped for the session.
- **Nothing to say is the common case**, and saying nothing is the correct behavior, not a missed opportunity.

The failure mode is not missing a chance to help.
It is becoming the thing people turn off.
