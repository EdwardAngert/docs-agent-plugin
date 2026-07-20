# Claim Verification

Every doc makes claims the code can confirm or refute: a flag exists and behaves as described, a default value matches, a config key is spelled right, an error message reads as documented, a version requirement still holds, a described behavior actually happens. Mechanical linting (Vale, markdownlint, cspell) cannot check any of this: it operates on the prose's surface, not its truth. Tracing claims to the code is the audit's highest-value pass, and the one most likely to get skipped, because the mechanical pass is easier to automate and produces a satisfying clean count that feels like the work is done. It is not; it just did the cheaper half.

## What Counts as a Claim

- A CLI command, subcommand, or flag, and what it does or defaults to.
- A config key, environment variable, or setting, and its default or accepted values.
- An API endpoint, method, request or response shape, or error code.
- A version or compatibility requirement ("requires Node 18+").
- A described behavior ("retries three times before failing," "runs on every push to `main`").
- A named resource: a file path, a function or class name, a script, a linked doc, or an external resource.

A doc with no such claims (pure narrative, a concept overview with no specifics) has nothing to trace here; say so rather than manufacturing a finding.

## How to Trace One

Before tracing by hand, run `node ${CLAUDE_PLUGIN_ROOT}/assets/ci/check-claims.mjs` (no setup needed; it auto-discovers docs from `docs_dir` plus README/AGENTS/CLAUDE.md). It's deterministic and dependency-free, the same philosophy as `check-facts.mjs` and `docs-decay.mjs`: it extracts every identifier-shaped claim (file paths, CLI flags, function or class names, config/env keys) across the whole doc set in one pass and resolves each against the code with `git grep`, instead of a reader re-deriving the same mechanical lookups one claim at a time. What it confirms or flags "missing" needs no further tracing; what it can't settle (described behavior, numeric assertions, runtime claims) it writes to `claims-needs-judgment.json`, grouped by doc, which is exactly what the fan-out below is for. A "missing" result still deserves a look before you report it: the target can be real but gitignored (a vendored asset, a build artifact) rather than actually gone, since the check only sees tracked content.

For each claim the script leaves unresolved, or when working a doc by hand without it:

1. Find where the code would prove or disprove it: grep for the flag name, the config key, the constant, the function. Read the actual definition, not just a usage site.
2. Compare what you find to what the doc states:
   - **Matches**: no finding, move on.
   - **Drifted**: the code exists but disagrees with the doc (a renamed flag, a changed default, an updated error string, a signature that gained or dropped a parameter). Report the specific doc line next to the specific code line; this is the finding, not "seems outdated."
   - **Missing**: nothing in the code backs the claim anymore, removed or renamed beyond recognition. Report as Critical: a reader will follow instructions that no longer resolve to anything.
3. When a static read cannot settle it, because the claim is about runtime behavior rather than a fixed value ("retries with exponential backoff," "starts within 30 seconds"), it is a candidate for `/docs-assist:verify`, not something to guess at from reading. Say so rather than marking it verified on inference.
4. If the claim is already a `fact` entry in `.docs-assist/reference.yml`, check its `source` field directly instead of re-deriving from scratch; see `reference-registry.md`. If it is not tracked yet and looks likely to drift again (a default that has already changed once, a value repeated across several docs), offer to add it, so the same claim gets caught automatically next time the source changes instead of needing a full manual retrace.

## Scope It Like Everything Else

- **Full-set audit**: run `check-claims.mjs` once for the whole set first, then fan out only what's left. Run `node ${CLAUDE_PLUGIN_ROOT}/assets/ci/claim-briefs.mjs` against its output to generate one self-contained brief per doc from `claims-needs-judgment.json` (the claim rows, the classification method, and instructions to report only Drifted/Missing/worth-a-second-look), and hand each brief to a `doc-auditor` slice as its claim-tracing task: this is exactly the per-doc work the fan-out threshold exists for (see the Notes in `${CLAUDE_PLUGIN_ROOT}/commands/audit.md`). A slice that only runs the mechanical checklist and skips this is an incomplete slice, not a fast one.
- **Change-based audit or update**: `impact-analysis.md`'s "Command, flag, endpoint, or config key changed" row already covers the diff-driven version of this: something changed, follow it to what it touches. This method is what to run when there is no diff, against the docs set as it already stands, which is the common case for "review our existing docs" rather than "review this PR."
- **Health check**: too deep for the fast scorecard. Health's Freshness dimension uses `docs-decay.mjs`'s churn heuristic to rank which docs are worth this trace, not to perform the trace itself. Point the full audit, or `/docs-assist:verify` for procedural claims, at what the ranking surfaces.

## Why This, Not Just the Linters

A linter confirms a doc is well-formed. This confirms a doc is true. Both matter and neither substitutes for the other. A pass that runs the linters, gets them clean, and reports the docs as "improved" has finished the cheaper half of the job and skipped the half a reader actually depends on: whether what the doc says still matches what the code does.
