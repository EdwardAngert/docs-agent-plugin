---
title: "Write docs with Docs Assist"
description: "How to use the Docs Assist plugin as a contributor: the three steps from what you know to a verified doc (draft, write, edit), what to bring, what to review, and when to plan or audit instead."
content-type: guide
audience: contributors
keywords:
  - documentation
  - contributor guide
  - draft command
  - edit command
  - plan command
  - technical writing
---

# Write docs with Docs Assist

With the Docs Assist plugin installed, Claude Code has documentation expertise built in.
You don't need to learn any special syntax or documentation theory.
Ask for help writing docs the way you normally would, and Claude Code guides you through it.

## Install it first

If it is not installed yet, [Get started with Docs Assist](get-started.md) walks the three steps and what to do when one of them does not take.

Then ask Claude Code for documentation help in plain words.
Nothing else is required.

Two optional things make it work better in your repo, and `/docs-assist:setup` offers both:

- **Conventions** in `.docs-assist/`, kept to yourself or shared with your team, so the plugin holds your docs to your heading style, your terminology, and your example values instead of inferring them each time.
- **Three lines in `CLAUDE.md`** telling Claude Code to reach for the plugin when work touches your docs.
  This matters more than it looks: the plugin activates when something matches what you said, so work that never mentions documentation never reaches it.
  A standing instruction in `CLAUDE.md` closes that gap.

## Three steps from what you know to a verified doc

A new doc goes through three separate steps.
Each has its own job, and each one offers the next when it finishes, so you can stop between them, come back another day, or hand the rest to someone else.

1. **Draft.** You share what you know and the plugin steers.
   It reflects what you said back to you, connects it to the existing docs, checks each fact against the code as it comes up, and asks for what a good doc needs and you haven't mentioned yet: what to have before starting, what goes wrong, what it can't do.
   You get a high-level draft: the facts in order, each marked as checked against the code or resting on your word.
   Nothing is polished yet, so your attention goes to whether the facts are right.
1. **Write.** The plugin writes the draft up as finished documentation: the right structure (how-to, concept, troubleshooting), examples consistent with the rest of your docs, your conventions, links from related pages.
   The writing happens in a separate pass that sees only the draft, and everything it added that you never said is questioned by a reviewer in another context, round after round, until that reviewer is satisfied; what only you can settle becomes a question.
   A first-time reader then reads it cold, and the writer fixes what that reader stumbled on.
1. **Edit.** First a technical edit: every claim checked against the code, and every step run in an isolated workspace, with progress shown as it goes.
   It fixes what the code and the run settle and turns the rest into a short list of questions, each with its evidence.
   Then a copy edit: wording, terms, and formatting to your style, applied without asking you about any of it.

The steps split well across a small team: an expert drafts in one conversation, and a writer writes it up and edits it.
When you'd rather not stop between steps, say so, and the plugin runs them back to back.
They stay separate steps either way.

## Get the most out of it

### Start talking

You don't need to know what "content type" your doc should be, or whether it's a "guide" or a "tutorial." Tell Claude Code what you want to document, and it opens by asking you to share everything you know:

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

### Give messy input

If you have a rough brain dump, paste it in.
If your steps are out of order, that's fine.
If you're not sure about one part, say so.
Claude Code will mark it for verification instead of skipping it.

The plugin is designed to work with how people actually share knowledge, not how finished docs look.

### Mention what goes wrong

When Claude Code asks you about a process, don't only describe the happy path.
The most valuable parts of documentation are often the gotchas: what breaks, what's confusing, what everyone gets wrong the first time.

If Claude Code asks "what do people commonly get wrong here?", that's the plugin prompting you.
Your answer often becomes the note or warning that saves someone an hour of debugging.

### Review for accuracy, not style

Each step asks you for something different, and none of it is style:

- **After the draft**: are these the facts, and is anything missing?
- **After the write-up**: is it complete, and would it make sense to the reader it's for?
- **After the edit**: answer the questions the code and the run couldn't settle.
  Each one comes with what the plugin found, such as the command that failed and its error, so most take a minute.

Heading case, markdown formatting, and tone are the plugin's job.

### Start from a proven template

For a new doc, Claude Code can start from a proven structure instead of a blank page, using [The Good Docs Project](https://thegooddocsproject.dev/) templates.
Describe the problem in plain words, like "people keep opening tickets about a login loop," and it suggests a matching template and fills it with what you know.
Take the suggestion, pick another, or decline.
It's a head start, not a requirement.

### Use a command to start at a specific step

Plain conversation reaches everything the plugin does.
The commands are shortcuts into those same steps, not a more structured alternative, so use one when you already know where you want to start:

```text
/docs-assist:draft how to configure webhook retries
```

It opens the same way a conversation does, by asking you to dump what you know.
The sharp questions (prerequisites, decision points, what goes wrong) come after that, once there is something to ask about.
A narrow question asked first gets a narrow answer, which is why it waits.

To pick up a draft someone already made, or to check a doc that already exists:

```text
/docs-assist:write webhook retries
```

```text
/docs-assist:edit docs/webhook-retries.md
```

### Plan a full documentation set

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

### Review docs you already have

To check existing docs rather than write new ones:

```text
/docs-assist:audit docs/
```

This reconstructs what each doc claims and checks those claims against your code.
A claim nobody can source is the finding, and it is the kind that survives ordinary review: in finished prose it sits next to twenty sourced claims and reads exactly like them.

To fix one doc rather than get a report on many, `/docs-assist:edit` checks its claims, runs its steps, and makes the corrections.
To only run a procedure's steps, `/docs-assist:verify` does that in an isolated workspace, so you find out whether the doc still works rather than whether it still reads well.

## What it won't do

The plugin won't decide where a doc belongs in your site's navigation.
It suggests a filename and location from the conventions already in your repo, but if your team has a process for that (a docs review board, a content calendar), you still follow it.

It will happily help decide what to document: that is most of what `/docs-assist:plan` does.

It also won't move to the next step without offering it first, and it won't write the finished file before you've seen the draft.
