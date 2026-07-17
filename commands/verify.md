---
description: "Verify procedural docs by executing them: run each step in an isolated workspace and report where the doc diverges from reality"
argument-hint: [doc path or directory]
---

# Verify Docs by Running Them

A tutorial whose step 3 no longer works is worse than no tutorial: the reader followed instructions, hit a wall, and now distrusts the rest of the docs. Nothing catches that by reading; the steps have to actually run. This command executes procedural docs in an isolated workspace, the way CI executes tests, and reports where the documented path and the real path diverge.

The argument (`$ARGUMENTS`) is a doc path or a directory. If omitted, survey the docs set and propose the procedural docs worth verifying, most-load-bearing first (the quickstart before the appendix).

## Process

### 1. Scope the Run

- Resolve `.docs-assist/` config if present (`${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/config-resolution.md`).
- Identify the procedural docs in scope: docs whose content type is task-oriented (doc, guide, tutorial, troubleshooting) and that contain executable fenced commands. A concept doc with no commands has nothing to verify; say so rather than reporting it as clean.
- Tell the user what will run and what will not before running anything: the verifier executes workspace-scoped commands only, and steps needing credentials, privilege escalation, or real services are reported as `unverified`, never run. If the doc set's procedures are mostly in that category, say so up front so the user can calibrate expectations.

### 2. Prepare the Workspace

- Create a scratch directory outside the repo working tree for each doc's run, so a verification can never dirty the user's checkout. A temp directory is right; the repo itself is not, unless the doc's procedure is explicitly about operating on this repo, and then work on a disposable copy.
- Note the environment honestly in the report: OS, tool versions the doc's steps depend on. A step that fails here but works on the doc's assumed platform is a platform-assumption finding, not necessarily a broken doc.

### 3. Run the Verifier

- One doc: launch the `doc-verifier` subagent with the doc path and the workspace path.
- A set: fan out, one `doc-verifier` per doc, each with its own workspace, in parallel. Procedures are independent across docs but stateful within one, which is exactly the subagent boundary.
- The verifier never edits files; every result comes back as a report.

### 4. Consolidate and Triage

Present one prioritized result across the set:

- **Divergences and failures first**: the step that fails, what the doc says, what actually happened. These are Critical findings in audit terms; a reader following instructions hits them.
- **Missing prerequisites** the verifier had to supply: the assumption gap, made concrete. Usually the fix is a sentence in the doc's prerequisites section, and it's cheap.
- **Unverified steps**, with reasons, so nobody mistakes a partial pass for a full one.
- Offer to fix what the run proved wrong, through the normal drafting flow: update the command, the documented output, or the prerequisites to match reality. When the code is what's wrong (the doc describes intended behavior the code no longer delivers), surface it and ask rather than rewriting the doc to match a bug; offer to record it the way the reconcile move does.

### 5. Record the Verification

- On a clean pass (every executable step green), offer to bump the doc's `last-verified` frontmatter to today. After this command, that date means a machine ran the procedure, the strongest freshness signal the plugin has.
- On a partial pass, do not bump `last-verified`; note in the report which steps stand between the doc and a clean run.
- The decay detector (`docs-decay.mjs`) reads `last-verified`, so verified docs drop down the re-verification queue and the queue stays focused on what actually needs attention.
- The conversation is for triage, per the skill's feedback guidance: offer to save the full run report under `.docs-assist/reports/verify-<date>.md`, and end by naming the natural next step.

## Notes

- Never run against production anything. The safety tiers in the `doc-verifier` agent are the contract: workspace-scoped execution, `unverified` for everything requiring credentials, privileges, or real services.
- Stateful means ordered. Never verify a procedure's steps out of order or in parallel within one doc.
- An environment mismatch is a finding about the doc's stated prerequisites, not automatically a broken doc. Report what platform the run assumed.
- Verification is the expensive, high-trust end of the freshness spectrum: `docs-decay.mjs` ranks cheaply, an audit reads carefully, this command actually runs the steps. Point the queue's worst offenders here, not the whole set on every run.
- If a doc's procedure cannot be verified at all (all steps need real services), say so plainly. An honest `unverified` beats an implied pass.
