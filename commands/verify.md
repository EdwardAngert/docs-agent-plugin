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
- When more than one doc is in scope, decide whether they are independent or a journey: do they share a user story (`user-stories.md`), does a plan or a guide lay out an order, does one doc's prerequisites point at another's outcome? Say which you concluded before running anything; this decision sets the workspace boundary in step 3.
- Tell the user what will run and what will not before running anything: the verifier executes workspace-scoped commands only, and steps needing credentials, privilege escalation, or real services are reported as `unverified`, never run. If the doc set's procedures are mostly in that category, say so up front so the user can calibrate expectations.

### 1.5. Choose the Execution Engine

`.docs-assist/config.yml`'s `verify.tool` can force `doc-detective`, `docs-assist`, or the default `auto`. On `auto` (or when the key is absent), detect [Doc Detective](https://docs.doc-detective.com/) before falling back:

- Look for `.doc-detective.json` / `doc-detective.config.json` at the repo root, a `doc-detective` entry in `package.json`'s dependencies, or `doc-detective` resolving on `PATH` (`doc-detective --version`) or via `npx doc-detective --version`.
- If found and `verify.tool` isn't set to `docs-assist`, default to it: it is a purpose-built execution engine for exactly this job, including link validation as part of the same run rather than a separate pass. Point it at the doc or docs in scope, translate its per-step results into this command's classification vocabulary (`pass`, `divergence`, `fail`, `blocked`, `unverified`, `skipped`), and continue through steps 3 to 5 the same way regardless of engine, so the report, the journey handling, and the `last-verified` bump behave identically to a `doc-verifier` run. Doc Detective can also drive browser and HTTP steps beyond what `doc-verifier` attempts; say so as part of the "what will run" framing in step 1, since it broadens what "workspace-scoped" means.
- If not found, or `verify.tool: docs-assist` is set, use the `doc-verifier` subagent as described below. Don't ask the user to install Doc Detective; it's a nice-to-have, not a requirement, and `doc-verifier` covers the same core job without it.

### 2. Prepare the Workspace

- Create a scratch directory outside the repo working tree for each doc's run, so a verification can never dirty the user's checkout. A temp directory is right; the repo itself is not, unless the doc's procedure is explicitly about operating on this repo, and then work on a disposable copy.
- Note the environment honestly in the report: OS, tool versions the doc's steps depend on. A step that fails here but works on the doc's assumed platform is a platform-assumption finding, not necessarily a broken doc.

### 3. Run the Verifier

First decide whether the target is independent docs or a journey (see "Verifying a Journey" below): docs a reader follows in sequence to reach one outcome, per their shared user stories or the order a guide or plan lays out. This decision changes the workspace boundary, not just the run.

If step 1.5 chose Doc Detective, run it against the scoped doc or docs with the workspace as its working directory instead of launching `doc-verifier`, then skip to step 4 with its translated results. Otherwise:

- **One doc**: launch the `doc-verifier` subagent with the doc path and the workspace path.
- **Independent docs** (unrelated procedures that happen to be verified in the same pass): fan out, one `doc-verifier` per doc, each with its own workspace, in parallel.
- **A journey** (docs meant to compose into one outcome): one `doc-verifier` call, given the ordered doc list and a single shared workspace. Never fan a journey out into independent workspaces; that proves each doc works alone, which is not the claim a journey makes.
- The verifier never edits files; every result comes back as a report.
- `doc-verifier` also spot-checks links it encounters in an executable step's surrounding prose (not a full link-check pass, just what the run already touches), the same unified-pass idea Doc Detective's detected tests use for links, so a verify run doesn't skip the links closest to what it just proved works or broke.

### Verifying a Journey

A quickstart, a configuration guide, and a deployment guide that share a user story ("arrives from the quickstart," per `user-stories.md`) are not independent procedures verified in the same batch; they are one procedure split across files. Verify them as such:

- One workspace for the whole sequence, not one per doc. State a step in doc two produces has to exist for step one in doc three to consume it, the same as within a single doc.
- Run the docs in the sequence a reader would actually follow (the journey's order, not file order or alphabetical order).
- Attribute every divergence to the doc and step where it actually happened, even though the workspace is shared; a reader hits the wall in doc three, not in some averaged position across the set.
- A journey that passes proves what `code-examples.md`'s "Compose Across the Docs Set" asks for: the examples do not just match each other's values, they produce a working result end to end. A journey that fails on a resource-name or state mismatch between docs (not a broken command) is exactly the composition failure that per-doc verification and per-doc auditing both miss.

### 4. Consolidate and Triage

Present one prioritized result across the set:

- **Divergences and failures first**: the step that fails, what the doc says, what actually happened. These are Critical findings in audit terms; a reader following instructions hits them.
- **Missing prerequisites** the verifier had to supply: the assumption gap, made concrete. Usually the fix is a sentence in the doc's prerequisites section, and it's cheap.
- **Unverified steps**, with reasons, so nobody mistakes a partial pass for a full one.
- Offer to fix what the run proved wrong, through the normal drafting flow: update the command, the documented output, or the prerequisites to match reality. When the code is what's wrong (the doc describes intended behavior the code no longer delivers), surface it and ask rather than rewriting the doc to match a bug; offer to record it the way the reconcile move does.
- Once a step or a claim has a recorded verdict, drop the raw evidence that produced it (command output, search results, fetched pages) from working context; keep only the citation and the verdict. This matters more as the run scales across many steps or docs — a whole-set verify pass accumulates tool output past the point of usefulness once each item is settled.

### 5. Record the Verification

- On a clean pass (every executable step green), offer to bump the doc's `last-verified` frontmatter to today. After this command, that date means a machine ran the procedure, the strongest freshness signal the plugin has.
- On a partial pass, do not bump `last-verified`; note in the report which steps stand between the doc and a clean run.
- For a journey, bump only the docs the run actually reached clean: a doc after the point of failure was never really executed against live state, only reported as `blocked`, and bumping it would claim evidence the run doesn't have.
- The decay detector (`docs-decay.mjs`) reads `last-verified`, so verified docs drop down the re-verification queue and the queue stays focused on what actually needs attention.
- The conversation is for triage, per the skill's feedback guidance: offer to save the full run report under `.docs-assist/reports/verify-<date>.md`, and end by naming the natural next step.

### 6. External Claim Verification (opt-in, on request)

Everything above verifies a doc against the environment it runs commands in. It has no bearing on a claim about the outside world — a third party's behavior, a vendor's API, a protocol's guarantees — that no local command can settle. This mode covers that case. It is a distinct, heavier tier, not something a routine verify run does on its own: it requires real web access, which is a materially bigger action than anything else this command does, so it stays opt-in and off by default. Offer it when a doc's claims are clearly about an external system; run it only when asked.

- **Input**: the non-code assertions `claim-briefs.mjs` already isolates as claims a lookup can't settle (see `claim-verification.md`), or a specific claim/section the user names directly.
- **Method**: for each claim, follow `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/external-verification.md` — when the claim names a specific product or brand, search its generic or underlying form too, not instead, and always exclude the doc set under verification from its own search results.
- **Output per claim**: a date, a source link with an access date, and the verdict. Where no independent source turns up, say so explicitly — `no independent source found` is a real, expected result, not a failure of the pass. Firsthand testing isn't available to this mode by construction, since it never touches the reader's own environment.
- **Recording it**: offer the section-level marker from `section-verification.md` for a claim this pass confirmed or corrected, not a page-level `last-verified` bump — this mode verifies individual claims, and a page-level bump would overstate what was actually checked.

## Notes

- Never run against production anything. The safety tiers in the `doc-verifier` agent are the contract: workspace-scoped execution, `unverified` for everything requiring credentials, privileges, or real services.
- Be honest about what the tiers are: instructions to an agent, not an operating-system sandbox. They are conservative and the verifier is told to skip anything it cannot classify, but a project that needs hard isolation guarantees should run this command inside a container or a disposable VM, and it is fine to say exactly that when the stakes warrant it.
- Stateful means ordered. Never verify a procedure's steps out of order or in parallel within one doc.
- An environment mismatch is a finding about the doc's stated prerequisites, not automatically a broken doc. Report what platform the run assumed.
- Verification is the expensive, high-trust end of the freshness spectrum: `docs-decay.mjs` ranks cheaply, an audit reads carefully, this command actually runs the steps. Point the queue's worst offenders here, not the whole set on every run.
- If a doc's procedure cannot be verified at all (all steps need real services), say so plainly. An honest `unverified` beats an implied pass.
