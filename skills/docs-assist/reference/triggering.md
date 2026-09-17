# How this plugin gets triggered

What makes the plugin show up, why it sometimes does not, and what a project can add to change that.

Load this when a contributor asks why the plugin did not notice something, or when setting up a project that wants it to be more forward.

## Four surfaces, one of them proactive

| Surface | Who pulls the trigger | Proactive |
| --- | --- | --- |
| Skill | The model, matching the request against a `description` | No |
| Command | The contributor, typing `/docs-assist:...` | No |
| Subagent | The model, via the Agent tool | No |
| Hook | The event itself | Yes |

A skill activates when the model judges that what the contributor *said* matches what the skill says it is for.

This has a consequence worth stating plainly: **the plugin cannot notice anything the contributor did not bring up.** Someone editing `install.mdx` who never says "docs" gets no help, not because the plugin is unable, but because nothing asked it to look.

## The two fixes are different problems

**A request that is documentation-shaped but not phrased as documentation** ("write the PR body", "update the changelog") is a matching problem. The `writing-task` skill exists for exactly this: a wider net, cheap to load, that routes to the right capability. No new mechanism needed.

**Activity the contributor never mentioned at all** is a push problem, and only a hook can reach it.

## What a project can add

In order of leverage.

### 1. A line in `CLAUDE.md`

The highest-leverage thing, and the cheapest.

`CLAUDE.md` is always in context. A skill description is only *matched*. A standing instruction in `CLAUDE.md` therefore outranks any description this plugin can write, and it works with no hooks, no configuration, and no mechanism at all.

Three lines is enough:

```markdown
## Documentation

This repo uses the Docs Assist plugin. When work touches anything under `docs/`,
the README, a release note, or a pull request description, use it rather than
writing prose directly. Start with `/docs-assist:health` if the state is unclear.
```

Keep it short and specific about *where*. A vague instruction competes with everything else in the file and loses.

### 2. Committed configuration

`.docs-assist/config.yml` does not trigger anything on its own, and it changes what happens once the plugin is running: the conventions are the project's rather than inferred, and its presence signals the project opted in rather than tolerating a default.

Pair it with the `CLAUDE.md` line. One gets the plugin invoked; the other makes the invocation behave like this project.

### 3. Hooks

The only genuine push. A plugin can ship hooks that are active as soon as it is enabled, and a project can add its own to `.claude/settings.json`.

The useful shape is two events rather than one:

1. **On the edit**, a `PostToolUse` or `FileChanged` hook runs a deterministic check against the file that changed and records any finding to a scratch file. No model, no tokens.
1. **On the next prompt**, a `UserPromptSubmit` hook reads what accumulated, surfaces it once, and clears it.

Splitting it is not a workaround. It is what keeps the plugin from interrupting: at most one notice per contributor turn no matter how many files were touched, arriving at a moment they were already going to read something.

**A hook cannot make the model offer anything.** It can put information in front of the model and nothing more. Everything after that is the model's judgment, which means a hook's payload has to be worth acting on rather than merely true.

## The restraint that makes it work

A proactive layer that speaks whenever it *can* stops being read.

- Once per turn, at most.
- Once per task. A suggestion made twice is an interruption.
- Declined means dropped for the session.
- **Nothing to say is the common case**, and saying nothing is the correct behavior, not a missed opportunity.

The failure mode is not missing a chance to help. It is becoming the thing people turn off.
