# Harvesting What Was Already Explained

The dump-first loop is the best thing this plugin does and it still requires the expert to sit down and dump.

Meanwhile they have already explained the thing, three times, in pull request review comments, issue replies, and commit message bodies.
Harvesting mines that and brings it back.

**Opt-in, always.** This reads a ticket tracker. See the privacy rules below, and never run it without a yes.

## Three Uses, One Corpus

The same read serves three purposes, which is why it is one capability rather than three.

1. **Propose a draft.** "You explained this in three issues last month. Here is a draft. Is it right?" Reacting to a wrong draft is vastly easier than facing a blank page, and this inverts who does the work. It is the largest single lever on the reason docs do not get written.
1. **Build the authority persona.** The maintainers' own words are where a repo-specific voice comes from. See `personas.md`.
1. **Supply real reader language.** What people actually ask, in the words they actually use, which is the evidence `ia-methodology.md` asks for and has never had a method for gathering.

## What to Mine

In rough order of value:

1. **Issue replies from maintainers.** Especially long ones, and especially answers to "how do I", "why does", and "is it possible to." A maintainer writing four paragraphs into an issue has written a doc and filed it where nobody will find it again.
1. **Pull request review comments.** Where the reasoning behind a decision gets recorded, and the single richest source of rationale for a concept page.
1. **Commit message bodies.** Not subjects. A body that explains *why* is packet material.
1. **Closed issues marked as questions or documentation.** Often a complete question-and-answer pair.
1. **Recurring questions.** The same thing asked three times is a coverage gap with evidence attached, which is a stronger finding than any audit heuristic.

## What It Produces

A compact inventory, never raw content:

```markdown
## Explained but undocumented

- **Token refresh behavior.** Explained by a maintainer in 3 issues over 4 months,
  most completely in #412. No doc covers it. Suggested: a concept page.
- **Why the dispatcher drops duplicate jobs.** One long PR review comment, #388.
  The rationale exists nowhere else.

## Recurring questions

- "Why does the first request take 30 seconds?" 5 occurrences. Covered only in a
  troubleshooting aside that does not name the symptom.

## Reader language

- People say "stuck" and "hangs", the docs say "blocked" and "unresponsive".
- People search for the literal error string, not the feature name.

## Voice notes

- Maintainers answer in 2 to 4 lines and link to a file and line.
- They explain mechanism before behavior, and rarely use analogies.
```

## Privacy Rules

These are stricter than the rest of the plugin's defaults because the source is stricter.

1. **Opt-in, always, per project.** Never as a default, never folded into another workflow's confirmation.
1. **Summarize, never paste.** The inventory records what was explained and where, not the text of it. `intake.md`'s rule applies in full: git history is permanent and shareable.
1. **Public sources only, unless told otherwise.** A public repository's issues are public. A private tracker, a support desk, and customer correspondence are not, and each needs its own yes.
1. **Never persist customer identifiers.** No names, no email addresses, no account numbers, no organization names. Refer to people by role.
1. **Security content stays out.** An issue discussing an unpatched vulnerability is not documentation material, and an inventory entry pointing at it is a pointer to a vulnerability.
1. **Drop the corpus when done.** The inventory is the artifact. The raw read is not kept.

## Cost

An issue tracker is large and most of it is not worth reading.

Scope the read before running it: a time window, a label, or the highest-traffic areas of the docs. A full-history scan of a busy repository is expensive and mostly returns noise, and the recent tail is where the useful material is anyway.

Run it through the `doc-harvester` subagent so the raw corpus stays out of the main conversation. The inventory comes back; the reading does not.

## What This Is Not

Not a replacement for talking to the expert.

A harvested draft is a starting point with the expert's own words in it, which makes the conversation better and shorter. It does not make the conversation unnecessary, and a draft proposed from harvested material still goes through the loop like any other.
