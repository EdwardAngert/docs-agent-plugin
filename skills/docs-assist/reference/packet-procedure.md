# The procedure packet

What the authority chair emits when the reader needs to do something.

Steps, code, and citations, with as little prose as it can manage.
Written to `.docs-assist/loop/<doc-slug>/packet.md`.

## Why it is cold

The packet is not a draft. It is the raw material a draft gets made from.

Everything left out of it is a *writer's* decision, and a packet that makes those decisions blurs the line between ground truth and framing before the advocate chair ever sees the material.
That line is what makes the ledger a clean diff instead of a self-report, so keeping the packet cold is what makes the whole mechanism work.

## The rows

### Prerequisites and environment

Everything the reader must already have before step one: tools, versions, access, accounts, hardware, anything that takes time to obtain.

**The rule is strict: anything the reader must obtain from outside the document belongs here, no matter which step first needs it.**

Without this row, a hard requirement lands inside whichever step first needs it and the reader discovers it after committing.
A router's gateway IP that first appears 480 lines into a guide is a prerequisite, not a step detail.

### Steps

Imperative and numbered, with no connective tissue.
"Run this. Expect that."

**Any step that modifies a file carries that file's full path.**
A reader who cannot tell which file to edit cannot complete the step, there is no workaround and no partial credit, and it is the cheapest documentation failure to prevent.
The path goes on the step, not in prose near it.

### Code, commands, and configuration

Verbatim, with real values or explicitly marked placeholders.
Use the values in `.docs-assist/reference.yml` when entries exist; the continuity chair will reconcile the rest.

### Provenance, typed

Where each claim comes from. Three legitimate values:

1. **Code reference.** A file and line, a commit, a constant.
1. **External source.** A vendor's documentation, a specification, an issue.
1. **SME experience.** The expert's own practice.

The type carries weight.
In a software procedure an uncitable claim is a warning sign worth investigating.
In a craft domain, or any procedure about something the project does not vendor, SME experience is the normal case and not a defect.
Claims marked SME experience route to the attested-claims ledger in `.docs-assist/state/docs.yml`.

### Limits

What cannot be done, and what looks like it should work and does not.

This row is underproduced everywhere, because "here is how" is more comfortable to write than "here is why you cannot," even when the second is what the reader needs.
Ask for it explicitly rather than hoping it arrives.

### Flat statements

When a concept has to be explained for the procedure to make sense, one declarative sentence per fact, plainly and coldly.
If this row grows past a few lines, the material may want a concept page too. Say so.

### Unknowns

Marked as such rather than smoothed over.

"I do not know what happens when the token expires mid-run" is a useful packet entry.
An invented answer is not.

## Not in the packet

Transitions, motivation, audience address, analogies, hedges, and editorializing headings.

These are the advocate chair's decisions. Supplying them here is the one way to break the loop.

## A human can fill this in

The packet is the one format an expert can produce or correct directly without pain.

Asking an expert to review a draft asks them to do a writer's job badly.
Asking them to check a list of steps, commands, and citations asks them to do their own job, which they will actually do.

Dump-first intake populates this same artifact. A human dump and the authority chair's packet are the same file filled in by different hands, and nothing downstream cares which.
