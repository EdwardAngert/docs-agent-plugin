---
title: "Write Docs With Docs Assist"
description: "How to use the Docs Assist plugin as a contributor: installing it, sharing what you know, reviewing for accuracy, and when to reach for draft, plan, or audit."
content-type: guide
audience: contributors
keywords:
  - documentation
  - contributor guide
  - draft command
  - plan command
  - technical writing
---

# Write Docs With Docs Assist

With the Docs Assist plugin installed, Claude Code has documentation expertise built in.
You don't need to learn any special syntax or documentation theory.
Ask for help writing docs the way you normally would, and Claude Code guides you through it.

## Install It First

```text
/plugin marketplace add EdwardAngert/docs-agent-plugin
/plugin install docs-assist
```

Then ask Claude Code for documentation help in plain words. Nothing else is required.

Two optional things make it work better in your repo, and `/docs-assist:setup` offers both:

- **Committed conventions** in `.docs-assist/`, so the plugin holds your docs to your heading style, your terminology, and your example values instead of inferring them each time.
- **Three lines in `CLAUDE.md`** telling Claude Code to reach for the plugin when work touches your docs. This matters more than it looks: the plugin activates when something matches what you *said*, so work that never mentions documentation never reaches it. A standing instruction in `CLAUDE.md` closes that gap.

## What the Plugin Does Behind the Scenes

When you ask Claude Code to help with documentation, the plugin:

- Looks at your repo's existing docs to understand what's already there
- Asks you to share everything you know, in any order, then reflects it back so you can correct it
- Connects what you told it to your existing docs and how people use the product, and checks the details against the code
- Proposes an outline for anything beyond a short doc, so you approve the shape before it writes
- Picks the right document structure (how-to, concept, troubleshooting, and so on), and can start you from a proven template
- Applies formatting standards so you don't have to think about them, and keeps code examples consistent with the rest of the docs
- Adds cross-references to related docs and flags where existing content should link to the new page

You focus on the content.
The plugin handles the structure and polish.

## Get the Most Out of It

### Start Talking

You don't need to know what "content type" your doc should be, or whether it's a "guide" or a "tutorial."
Tell Claude Code what you want to document, and it opens by asking you to share everything you know:

```text
I need to document how to set up SSO for enterprise customers.
```

```text
I just fixed a bug where the webhook retry logic was dropping events. Can we add troubleshooting docs?
```

```text
Help me write up how the deployment pipeline works for new engineers.
```

Claude Code will figure out the right structure.

### Give Messy Input

If you have a rough brain dump, paste it in.
If your steps are out of order, that's fine.
If you're not sure about one part, say so. Claude Code will mark it for verification instead of skipping it.

The plugin is designed to work with how people actually share knowledge, not how finished docs look.

### Mention What Goes Wrong

When Claude Code asks you about a process, don't only describe the happy path.
The most valuable parts of documentation are often the gotchas: what breaks, what's confusing, what everyone gets wrong the first time.

If Claude Code asks "what do people commonly get wrong here?", that's the plugin prompting you.
Your answer often becomes the note or warning that saves someone an hour of debugging.

### Review for Accuracy, Not Style

When Claude Code shows you a draft, your job is to check whether it's technically correct and complete.
You don't need to worry about heading case, markdown formatting, or whether the tone is right.
That's the plugin's job.

Focus on:

- Did it capture the steps correctly?
- Is anything missing?
- Would this make sense to the intended reader?

### Start From a Proven Template

For a new doc, Claude Code can start from a proven structure instead of a blank page, using [The Good Docs Project](https://www.thegooddocsproject.dev/) templates.
Describe the problem in plain words, like "people keep opening tickets about a login loop," and it suggests a matching template and fills it with what you know.
Take the suggestion, pick another, or decline. It's a head start, not a requirement.

### Use the Draft Command to Start Somewhere Specific

Plain conversation reaches everything the plugin does.
The commands are shortcuts into those same workflows, not a more structured alternative, so use one when you already know where you want to start:

```text
/docs-assist:draft how to configure webhook retries
```

It opens the same way a conversation does, by asking you to dump what you know.
The sharp questions (prerequisites, decision points, what goes wrong) come after that, once there is something to ask about.
A narrow question asked first gets a narrow answer, which is why it waits.

Use it when you're starting from scratch on a topic rather than improving something that already exists.

### Plan a Full Documentation Set

If you need to document a whole project, not only one page, use the plan command:

```text
/docs-assist:plan
```

Claude will read the codebase, ask about your users and their goals, and map out the user journeys.

Expect it to name the single highest-leverage doc (usually a README or a quickstart) and offer to draft it right away, before the full plan is finished.
That is deliberate: one good doc shipped in the first ten minutes beats a perfect roadmap nobody has started.

Use this for:

- New projects that have no documentation yet
- Existing projects with scattered docs that need a coherent structure
- Onboarding a team to a tool and needing to document it for them

Once you agree on the plan, Claude works through it doc by doc.
Docs whose material already exists are drafted in parallel, and you review the queue instead of co-writing each one.
You still see every draft before anything is final; parallel means they are written at the same time, not that they skip your review.

### Review Docs You Already Have

To check existing docs rather than write new ones:

```text
/docs-assist:audit docs/
```

This reconstructs what each doc claims and checks those claims against your code.
A claim nobody can source is the finding, and it is the kind that survives ordinary review: in finished prose it sits next to twenty sourced claims and reads exactly like them.

For a procedure specifically, `/docs-assist:verify` goes further and runs the steps in an isolated workspace, so you find out whether the doc still works rather than whether it still reads well.

## What It Won't Do

The plugin won't decide *where* a doc belongs in your site's navigation.
It suggests a filename and location from the conventions already in your repo, but if your team has a process for that (a docs review board, a content calendar), you still follow it.

It will happily help decide *what* to document: that is most of what `/docs-assist:plan` does.

It also won't write the file without you reviewing the draft first.
