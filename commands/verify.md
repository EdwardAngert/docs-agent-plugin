---
description: "Verify procedural docs by executing them: run each step in an isolated workspace and report where the doc diverges from reality"
argument-hint: [doc path or directory]
---

# Verify docs by running them

A tutorial whose step 3 no longer works is worse than no tutorial: the reader followed instructions, hit a wall, and now distrusts the rest of the docs.
Nothing catches that by reading; the steps have to actually run.
This command executes procedural docs in an isolated workspace, the way CI executes tests, and reports where the documented path and the real path diverge.

The argument (`$ARGUMENTS`) is a doc path or a directory.
If omitted, survey the docs set and propose the procedural docs worth verifying, most-load-bearing first (the quickstart before the appendix).

## Process

### 1. Scope the run

- Resolve `.docs-assist/` config if present (`${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/config-resolution.md`).
- Identify the procedural docs in scope: docs whose content type is task-oriented (doc, guide, tutorial, troubleshooting) and that contain executable fenced commands.
  A concept doc with no commands has nothing to verify; say so rather than reporting it as clean.
- When more than one doc is in scope, decide whether they are independent or a journey: do they share a user story (`user-stories.md`), does a plan or a guide lay out an order, does one doc's prerequisites point at another's outcome?
  Say which you concluded before running anything; this decision sets the workspace boundary in step 3.
- Tell the user what will run and what will not before running anything: the verifier executes workspace-scoped commands only, and steps needing credentials, privilege escalation, or real services are reported as `unverified`, never run.
  If the doc set's procedures are mostly in that category, say so up front so the user can calibrate expectations.

### 1.5. Choose the engine and prepare the workspace

Per `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/running-steps.md`, which this workflow shares with the edit step: the project's existing tool (Doc Detective, when detected) before `doc-verifier`, a scratch workspace outside the working tree, and the environment noted for the report.

### 3. Run the verifier

First decide whether the target is independent docs or a journey (see "Verify a journey" below): docs a reader follows in sequence to reach one outcome, per their shared user stories or the order a guide or plan lays out.
This decision changes the workspace boundary, not just the run.

If step 1.5 chose Doc Detective, run it against the scoped doc or docs with the workspace as its working directory instead of launching `doc-verifier`, then skip to step 4 with its translated results.
Otherwise, run each doc in chunks with a progress line after each, per "Show progress while it runs" in `running-steps.md`:

- **One doc**: launch the `doc-verifier` subagent with the doc path, the workspace path, and the chunk of steps to run.
- **Independent docs** (unrelated procedures that happen to be verified in the same pass): fan out, one `doc-verifier` per doc, each with its own workspace, in parallel.
- **A journey** (docs meant to compose into one outcome): one `doc-verifier` call, given the ordered doc list and a single shared workspace.
  Never fan a journey out into independent workspaces; that proves each doc works alone, which is not the claim a journey makes.
- The verifier never edits files; every result comes back as a report.
- `doc-verifier` also spot-checks links it encounters in an executable step's surrounding prose (not a full link-check pass, just what the run already touches), the same unified-pass idea Doc Detective's detected tests use for links, so a verify run doesn't skip the links closest to what it just proved works or broke.

### Verify a journey

A quickstart, a configuration guide, and a deployment guide that share a user story ("arrives from the quickstart," per `user-stories.md`) are not independent procedures verified in the same batch; they are one procedure split across files.
Verify them as such:

- One workspace for the whole sequence, not one per doc.
  State a step in doc two produces has to exist for step one in doc three to consume it, the same as within a single doc.
- Run the docs in the sequence a reader would actually follow (the journey's order, not file order or alphabetical order).
- Attribute every divergence to the doc and step where it actually happened, even though the workspace is shared; a reader hits the wall in doc three, not in some averaged position across the set.
- A journey that passes proves what `code-examples.md`'s "Compose Across the Docs Set" asks for: the examples do not just match each other's values, they produce a working result end to end.
  A journey that fails on a resource-name or state mismatch between docs (not a broken command) is exactly the composition failure that per-doc verification and per-doc auditing both miss.

### 4. Consolidate and triage

Present one prioritized result across the set:

- **Divergences and failures first**: the step that fails, what the doc says, what actually happened.
  These are Critical findings in audit terms; a reader following instructions hits them.
- **Missing prerequisites** the verifier had to supply: the assumption gap, made concrete.
  Usually the fix is a sentence in the doc's prerequisites section, and it's cheap.
- **Unverified steps**, with reasons, so nobody mistakes a partial pass for a full one.
- Offer to fix what the run proved wrong, through the edit step (`commands/edit.md`), which re-runs what the fix touches: update the command, the documented output, or the prerequisites to match reality.
  When the code is what's wrong (the doc describes intended behavior the code no longer delivers), surface it and ask rather than rewriting the doc to match a bug; offer to record it the way the reconcile move does.

### 5. Record the verification

- Say whether each doc runs clean, under the rule in `running-steps.md`: every step ran and passed except those not run for safety, and none left without anything to run.
  On a partial pass, say which steps stand between the doc and a clean run.
- For a journey, a doc after the point of failure was never really executed against live state, only reported as `blocked`: say so rather than counting it as run.
- Nothing is written into the doc to record the run.
  A project that already records verification in its docs in its own way can have that updated on the contributor's yes, in the project's format.
- Note in the branch's journal, per `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/journal.md`: what ran, where, and the result, one line per doc, and each divergence left unfixed, as a question for whoever can answer it.
- The conversation is for triage, per the skill's feedback guidance: offer to save the full run report under `.docs-assist/reports/verify-<date>.md`, and end by naming the natural next step.
  `reference/reports.md` has the shape; a verification run is the case where the detail matters most, because a divergence is only actionable with the step and the output that produced it.

## Notes

- Never run against production anything.
  The safety tiers in the `doc-verifier` agent are the contract: workspace-scoped execution, `unverified` for everything requiring credentials, privileges, or real services.
- Be honest about what the tiers are: instructions to an agent, not an operating-system sandbox.
  They are conservative and the verifier is told to skip anything it cannot classify, but a project that needs hard isolation guarantees should run this command inside a container or a disposable VM, and it is fine to say exactly that when the stakes warrant it.
- Stateful means ordered.
  Never verify a procedure's steps out of order or in parallel within one doc.
- An environment mismatch is a finding about the doc's stated prerequisites, not automatically a broken doc.
  Report what platform the run assumed.
- Verification is the expensive, high-trust end of the freshness spectrum: `docs-decay.mjs` ranks cheaply, an audit reads carefully, this command actually runs the steps.
  Point the queue's worst offenders here, not the whole set on every run.
- If a doc's procedure cannot be verified at all (all steps need real services), say so plainly.
  An honest `unverified` beats an implied pass.
