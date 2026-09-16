---
topic: "write docs with docs-assist"
cast: procedure
status: ready-to-shape
updated: 2026-09-16
filled-by: chair-authority
mode: audit
---

# Packet: Write Docs With Docs Assist

Reconstructed from the finished document rather than written fresh, per the audit
mode in `audit-methodology.md`. 24 claims reconstructed: 18 confirmed, 6
corrected, 0 unknowable.

Persisted by the orchestrator. The chair could not write it: this run used a
subagent granted `Read, Grep, Glob`, and the real `chair-authority` holds
`Write`. It reported the blocker rather than working around it.

## Corrected

1. **Lines 120-127, "Add Examples to Existing Docs."** The capability does not
   exist. `commands/draft.md:3` declares `argument-hint: [topic or issue
   number]`, and the body handles `$ARGUMENTS` only as a topic or issue. Nothing
   in it identifies sections needing examples or edits an existing doc. A reader
   following this gets the new-doc intake loop pointed at a path.
1. **Line 99** says draft is for starting from scratch "rather than improving
   something that already exists", which contradicts 120-127 directly. Line 99
   is the true one.
1. **Lines 92 and 98.** Two errors. Commands are not "a more structured
   experience" than conversation: `SKILL.md:66` calls them "optional shortcuts
   into these same workflows, not a required interface." And the question
   sequence described is the Dig move, which runs sixth, after the dump.
   Intake is dump-first per `commands/draft.md:19` and `reference/intake.md:24`.
1. **Line 109**, plan proposes a list "before writing any of them."
   `commands/plan.md:56` now does the opposite deliberately: name the single
   highest-leverage doc and offer to draft it immediately. `plan.md:59` calls
   shipping one doc there "a feature, not a detour."
1. **Line 131**, "doesn't make decisions about what to document," is
   contradicted by `commands/plan.md:8`. The nav-placement half is correct.
1. **Line 3**, frontmatter promises coverage of the audit command. It is
   registered in `.claude-plugin/plugin.json` and never appears in the body.

## Confirmed

Every behavioral claim in "What the Plugin Does Behind the Scenes" still holds:
survey, dump-and-reflect, situate-and-reconcile, outline-before-draft, the
template offer, and cross-reference updates. So do "Give Messy Input", "Review
for Accuracy, Not Style", the Good Docs Project offer, the plan fan-out with the
contributor as reviewer, and "won't write the file without you reviewing."

The chair's synthesis, worth keeping: **the 1.0 overhaul did not invalidate the
doc's spine, it invalidated its command surface.**

## From the cold reader, same document, no repository access

Disjoint from the above except on two items, which is the result that matters.

1. **No install instructions anywhere.** "This page tells me what to say to the
   tool but never how to get the tool." A dead stop at step one.
1. `/draft` in prose against `/docs-assist:draft` in the example.
1. Line 116's parallel drafting appears to conflict with line 134's "won't write
   the file without you reviewing the draft first."
1. The Good Docs Project is named with no link.
1. Overlap: the `draft docs/webhooks.md` ambiguity, and the unexplained audit
   promise in the frontmatter.

## Provenance

Code reference throughout. Every correction cites a repository file and line.
No claim required an external source, and none went unresolved.
