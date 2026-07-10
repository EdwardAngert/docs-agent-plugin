---
title: "Write Docs With Docs Assist"
description: "How to use the Docs Assist plugin as a contributor: sharing what you know, starting from a template, reviewing for accuracy, and using the draft, plan, and make-examples commands."
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

If the Docs Assist plugin is installed in your Claude Code setup, Claude Code has documentation expertise built in.
You don't need to learn any special syntax or documentation theory.
Ask for help writing docs the way you normally would, and Claude Code guides you through it.

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

For a new doc, Claude Code can start from a proven structure instead of a blank page, using The Good Docs Project templates.
Describe the problem in plain words, like "people keep opening tickets about a login loop," and it suggests a matching template and fills it with what you know.
Take the suggestion, pick another, or decline. It's a head start, not a requirement.

### Use the Draft Command for Guided Walkthroughs

If you want a more structured experience, use the `/draft` command:

```text
/docs-assist:draft how to configure webhook retries
```

This walks you through a step-by-step intake: what you're documenting, who it's for, what the reader should be able to do, prerequisites, steps, gotchas.
It's useful when you're starting from scratch on a topic rather than improving something that already exists.

### Plan a Full Documentation Set

If you need to document a whole project, not only one page, use the plan command:

```text
/docs-assist:plan
```

Claude will read the codebase, ask you about your users and their goals, map out the user journeys, and propose a prioritized list of docs to write before writing any of them.
Use this for:

- New projects that have no documentation yet
- Existing projects with scattered docs that need a coherent structure
- Onboarding a team to a tool and needing to document it for them

Once you agree on the plan, Claude works through it doc by doc, and drafts the docs whose material already exists in parallel while you review the queue.

### Add Examples to Existing Docs

If a doc already exists but is missing code examples, use:

```text
/docs-assist:make-examples docs/webhooks.md
```

Claude Code will identify sections that need examples, write safe copy-paste ready code, and ask before inserting them.
It reuses the variable names already in your docs so examples stay consistent.

## What It Won't Do

The plugin doesn't make decisions about *what* to document or *where* it should live in your docs site's navigation.
It'll suggest a filename and location based on existing conventions in the repo, but if your team has a specific process for that (like a docs review board or a content calendar), you still follow that.

It also won't write the file without you reviewing the draft first.
