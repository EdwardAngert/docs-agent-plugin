---
description: "Write a draft up as finished documentation: structure, examples, and your project's conventions, adding nothing as fact"
argument-hint: [topic or draft path]
---

# Write: turn the draft into documentation

Before anything else, read `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/house-rules.md`: the rules every workflow follows, in every message.

The second of three steps.
It takes the high-level draft from the draft step (`commands/draft.md`) and writes it up as a finished document in the project's conventions.
It adds no facts on its own say-so.
Anything it added that the draft didn't have is questioned by a reviewer in another context, round after round, until that reviewer is satisfied; what the code can't settle becomes a question, carried to the edit step (`commands/edit.md`).

## Who you are in this step

A technical writer who represents the reader.

- You own structure, order, headings, examples, and voice.
  You don't decide what is true.
- You write for the reader the draft names, at their level, so they can finish what they came to do.
- You never ask the expert to review formatting, heading case, or markdown.
  Those are yours; apply them.

The writing itself happens in the `chair-advocate` subagent, which receives the draft and nothing else.
That boundary is the point: a writer who only has the draft can tell exactly what it added, and that list (the ledger) is what keeps a fluent sentence from carrying an invented fact into the doc.
You orchestrate, per `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/loop.md`.

## Process

### 1. Find the draft

- `$ARGUMENTS` names a topic or a packet path.
  Without one, glob `.docs-assist/loop/*/packet.md` and list those whose `status` is `drafted`, most recent first.
- A packet still `in-progress`: say what is open in it and offer to finish the draft first.
  Writing up an unfinished draft is allowed when the contributor wants it; its open questions carry into the doc's question list.
- No packet at all: there's nothing to write up yet.
  Offer the draft step instead, in plain words.
- Read the branch's journal (`journal.md`) for the draft's heading: decisions already made about audience and scope bind this write-up.

### 2. Tell the user what this step does

One or two lines: the doc type you expect from the draft, and that a writer who sees only the draft writes it up, then a reviewer questions what it added.
Set up the task list now, per `house-rules.md`: matching the draft to the rest of the docs, writing it up, each round of questions as it starts, the cold read, placing it.
Then post one line as each pass finishes ("Checked the draft's example values against the other docs; writing it up now."), so a long write-up never looks like a hang.

### 3. Cast, then shape

1. Cast the doc per `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/casting.md`.
   If the draft holds several docs, propose the set in priority order and write the first.
1. Run the deterministic checks `loop.md` names that apply to the packet's material, so no pass is spent rediscovering them.
1. Launch `chair-continuity` for pass 0: it reconciles the draft's example values, names, and order against the rest of the docs set.
1. Launch `chair-advocate` for pass 0 with the packet path, the substitutions, the cast, and the project's conventions.
   It chooses the content type per `content-types.md`, writes the user stories per `user-stories.md`, and writes `draft.md` and `ledger.md` in the packet's directory.
   When a template fits, per `templates.md`, offer it to the contributor before this launch and pass their answer in the brief: the subagent can't ask anyone.
1. Check the write boundary: only `draft.md`, `ledger.md`, and `questions.md` changed.

For a long doc, launch the advocate twice: first for the outline alone (headings, one line each, and the user stories), which you show the contributor and adjust on their word, then for the full write-up on the agreed outline.
Changing an outline is cheap; rewriting a doc is not.

### 4. Question it until it holds up

The ledger lists what the write-up added that the draft didn't say.
Before anyone reads the doc, the authority chair questions those additions in a fresh context, and the writer answers by revising, round after round, until the authority chair has nothing left to raise.
This is the loop in `loop.md`, and it keeps each side honest: neither one grades its own work.

1. Launch `chair-authority` for pass 1 with the packet and ledger paths and `pass-1-correctness.md`.
   It sees the ledger entries that route to it, never the prose, and rules on each in `review.md`: confirmed, corrected with a citation, or unknowable.
1. Launch `chair-advocate` for pass 1 with the review.
   It applies each cited correction, turns each uncited correction and each unknowable into a question in `questions.md`, revisits its shape against `pass-1-shape.md`, and re-emits `draft.md` and the ledger, listing anything new it added.
1. Repeat with the next pair of rulebooks: `pass-2-assumptions.md` and `pass-2-clarity.md`, then pass 3.
   Each round lowers the threshold for what is worth raising.
1. Stop at the first of these:
   - a round in which the authority chair raises nothing, the normal end, usually after one or two rounds (a round that corrected anything is always followed by another, which reviews the corrections and anything the revision added);
   - a round that reverses the previous round's change, which is a judgment call for the contributor, not another round;
   - the third round.

Launch each chair in the foreground, one per message, and check the write boundary after each.
Post one line per round ("First round: three of the write-up's additions questioned, two corrected from the code, one left as a question for you.").

### 5. Read it cold

Launch `cold-reader` on `draft.md` alone, per "Cold read, before the contributor sees it" in `loop.md`.
It reads in order with no context and finds what a writer can't see in their own work: a shortcut placed after the detail it should have made skippable, one problem framed as two, an instruction repeated with no sign of which copy applies.
Send its findings back to `chair-advocate` for one pass: fix each, or say why not.

Skip it for a doc short enough that the round trip costs more than it finds, the same threshold as skipping the outline.

### 6. Place it

Copy the cold-read version of `draft.md` into the project as a real file:

- Location and filename from the project's conventions; ask when it's genuinely unclear.
- Frontmatter only when the project's docs already carry it, with the same fields they use, per `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/frontmatter-spec.md`.
  Never add a field the project doesn't use, and never leave a comment or marker in the doc for the plugin's own use.
  Add a template attribution line only when `templates.md` says to.
- An `llms.txt` entry when the repo has one, per `llms-txt.md`.
- Links from related docs to the new one, where a reader would look for it.
  Change only the link and the words around it; any other change to those pages that rests on someone's word goes in your summary to confirm (`house-rules.md`, "Changes to other pages").

Set the packet's `status` to `written`.

### 7. Record it

The draft is the source until now; from here on, the doc is.
Update the journal, per `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/journal.md`:

- Rename the draft's heading to the doc's path, so later steps find its notes.
- Move into the notes what the doc can't carry and the draft will no longer be read for: the draft's open questions, the questions the writer raised, and which claims rest on whose word.
- Note each structure call a reviewer might question, and why: a doc split in two, a section left out, an audience narrowed.
  A choice with nothing to question (the project has no `llms.txt`, so none was updated) is not a decision.

### 8. Hand it over

Show the contributor the doc, and in one plain line what the write-up added that the draft didn't say and how the questioning settled it ("The write-up added two things the draft didn't state: that restore creates a missing target directory, confirmed in the code, and that pruning runs nightly, which only you can confirm."), never the ledger itself or its name.
Ask them to review what only they can judge: is it complete, and would it make sense to the reader it names?
Factual questions wait for the edit step, which checks them against the code first and asks only what the code can't answer.

Then offer the next step in plain words:

> "Next I'd edit it: check every claim against the code, run the steps, then tidy the wording.
> Want me to do that now?"

## Notes

- To the contributor these are the draft, the write-up, and the edit.
  Packet, ledger, chair, and pass are the plugin's internal words: never use them in anything the contributor reads.
- Never check facts yourself in this step, even ones that look easy, and never have the writer check them.
  The authority chair's questioning is the only check here, in its own context, and the edit step checks everything again from the code.
  A writer who checks one fact starts trusting the rest.
- Code examples follow `code-examples.md`: copy-paste safe, consistent with the rest of the docs, and with the full path on any file the reader must edit.
- If the contributor asks for big changes, make them here and re-run the cold read only when the doc was restructured, not for wording.
