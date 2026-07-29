# Changelog

All notable changes to this project are documented here.
The format is based on Keep a Changelog, and the project follows Semantic Versioning.

## Unreleased

Grounded in a same-day research trace, verification pass, and site implementation on a real docs site (`drafts-research/pi-hole-ai-provenance-study.md`), generalized here for a docs set the plugin has never seen: legible verification that reaches what an AI retriever actually fetches, not just what lives in frontmatter.

### Added

- Section-level verification (`reference/section-verification.md`): a plain-text marker (`**Verified 2026-07.**`) placed after a heading, rendering as visible body text so it survives to the HTML a retriever fetches, unlike frontmatter. Page-level `last-verified` stays the default every doc gets; section markers are a prompted, opt-in enhancement offered only when a doc mixes decay-heterogeneous content (a stable core section next to one making third-party or version-pinned claims), not a convention every project adopts. Date-only by default, no plugin-defined method vocabulary — a method is free text a project opts into, only where its docs already carry genuine provenance ambiguity. `/docs-assist:draft` and `/docs-assist:audit` (and `doc-auditor`) now detect the shape and offer it.
- `assets/ci/section-verification.mjs`: a deterministic, dependency-free extractor for the marker above, in the style of `check-claims.mjs`. `docs-decay.mjs` reads its output for any doc that has markers, ranking by the doc's stalest section instead of a single page-level date; strictly additive, and a doc with no markers is unaffected.
- `reference/external-verification.md` and a new opt-in mode on `/docs-assist:verify`: verifying a claim about the outside world (a vendor's behavior, a third party's API) rather than the local codebase, which `claim-verification.md` has no reach into. Off by default, since it requires real web access. Two rules single-sourced there: when a claim names a specific product or brand, search its generic or underlying form too (not instead); and always exclude the doc set under verification from its own search results, since a well-ranking doc can otherwise be returned as corroboration for itself.
- The llms.txt altitude test (`reference/llms-txt.md`): a three-way check (too specific, too vague, right altitude) for descriptions and entries, plus a two-axis rule for whether an entry should carry a conclusion inline or stay a pointer — inline only when a conclusion is both short and durable, since a short-but-volatile fact inlined into `llms.txt` just relocates the staleness problem into a second file.
- `agent-ready.md`'s survey step now checks whether the target SSG renders frontmatter into page output at all before recommending a field for external-facing reach, and redirects to `llms.txt` or visible body text where it doesn't.
- `setup-site.md` can optionally emit `schema.org` `BreadcrumbList` and `dateModified` JSON-LD from the same navigation hierarchy and git-derived last-touched signal it already computes, skipped where the target SSG already emits an equivalent.

### Version Policy

- Nothing above is bumped past 0.9.5 by an agent; a version number is the maintainer's call, made by hand.

## 0.9.8 - 2026-07-21

### Added

- `reference/pr-descriptions.md`: when a PR's commits aren't independently reviewable (a later commit fixes something an earlier one touched, common in docs work), restructure the description by file or area instead of by commit, say so explicitly near the top, and write for a human reviewer whose first pass is already automated (spend words on judgment calls and verification, not on what a linter or bot first-pass already covers). Cross-linked from `SKILL.md`'s "Deliver on a Branch" and `/docs-assist:update`'s own-PR path.

### Version Policy

- Bumped to 0.9.8 on the maintainer's explicit call, the same policy as 0.9.6 and 0.9.7: agent-driven work caps at 0.9.5 by default, and a version bump past that is always the maintainer's decision, not the agent's.

## 0.9.7 - 2026-07-20

`check-facts.mjs` verifies the curated `.docs-assist/reference.yml` registry deterministically; this release extends the same approach, cold, to the whole doc set.

### Added

- `check-claims.mjs` and `claim-briefs.mjs`: a deterministic, dependency-free pair that mechanizes the first half of `claim-verification.md`'s method across the whole doc set. `check-claims.mjs` extracts identifier-shaped claims (CLI commands/flags, config/env keys, function or class names, file paths, version requirements) from every doc and resolves each against the code with `git grep`/`git ls-files`, no agent involved; `claim-briefs.mjs` turns what's left (described-behavior and numeric claims a lookup can't settle) into one self-contained brief per doc for the `doc-auditor` fan-out.
  `/docs-assist:audit` and `claim-verification.md` now point at it as the recommended first pass before tracing claims by hand.
  `/docs-assist:setup-hooks` gained a CI claim check (`assets/ci/github/check-claims.yml`), the same sticky-PR-comment pattern as the reference-registry check, non-strict by default since a "missing" result can also mean the claim's target is real but gitignored.
  Born from a real cross-project run: extracted and mechanically resolved 453 candidate claims from a 14-doc corpus in seconds, fanned the 192 that needed judgment out to 14 parallel agents, and found 6 real drifted or inconsistent claims a lint pass alone would have missed.

### Version Policy

- Bumped to 0.9.7 on the maintainer's explicit call, the same policy as 0.9.6: agent-driven work caps at 0.9.5 by default, and a version bump past that is always the maintainer's decision, not the agent's.

## 0.9.6 - 2026-07-19

This release asks whether the docs actually work, not just whether they read well.
A new `/docs-assist:verify` executes a procedural doc's steps in an isolated workspace and reports where reality diverges, the same way CI executes tests instead of reading the code and guessing; a clean pass is what gives `last-verified` real evidence behind it for the first time.
Every doc now carries a quick user story (who arrives, from where, to do what, done when what), calibrated from evidence instead of a fixed posture, so drafting can write to a reader instead of a guess and audits can walk the journey end to end.
Two registries that used to duplicate each other's territory (`example-variables.txt`, `terms.txt`) merge into one `reference.yml`, with two new entry kinds: facts tied to a real source, and pointers to a worked example instead of a rewritten one.
And general prose quality stops being something this plugin maintains its own copy of: `Google`, `write-good`, and `alex` are now the managed Vale packages doing that work, actively maintained upstream, with the plugin's own style stripped down to only what they do not cover.
A field report from a real end-to-end run (`docs/reviews/0.9.5-field-report-reformatters-session.md`) then closed the gap between what this plugin claims by default and what it actually does: mechanical checks are now wired into `audit` and `health` instead of stated as a principle, `setup-lint` runs and triages its first pass instead of stopping at scaffolding, and a mandatory claim-to-code trace (`reference/claim-verification.md`) makes "improve the docs" reach further than a clean lint run.
`/docs-assist:verify` also now defers to [Doc Detective](https://docs.doc-detective.com/) when it's present in the target repo, since it's a purpose-built execution engine for the same job; the plugin's own `doc-verifier` remains the default otherwise.
The staged plan behind this release is committed at `docs/plan.md`.

<details>
<summary>All changes in this release</summary>

### Added

- `/docs-assist:verify` and a new `doc-verifier` subagent (the plugin's first with Bash): executes a procedural doc's steps in an isolated workspace and classifies each one (pass, divergence, fail, blocked, unverified, skipped).
  Safety is conservative and workspace-scoped; anything needing credentials, privilege escalation, real services, or out-of-workspace writes is reported as `unverified`, never run.
  A journey mode runs an ordered sequence of docs in one shared workspace instead of independent ones, so a guide's docs are verified as the one continuous procedure a reader actually experiences, not proven to work alone and nothing more.
  A clean pass offers the `last-verified` bump; a partial one does not.
- User story outlines (`reference/user-stories.md`): a one-line-per-reader contract (role and prior knowledge, arrival point, goal, done-state) written at the drafting shape move and walked by audits (arrival, entry, path, exit) as a sixth per-doc dimension.
  `doc-auditor` infers a doc's stories cold, which doubles as an audience-clarity test: a doc whose reader cannot be inferred is a finding in itself.
- Reader-baseline calibration from evidence (what the project's docs already assume, what kind of tool this is, the ecosystem it lives in) instead of a fixed writing posture.
  Prerequisites list only what sits outside the calibrated baseline; failure modes anticipate what that specific reader trips on.
- `.docs-assist/reference.yml`, replacing `example-variables.txt` and `terms.txt` with one registry and two new entry kinds: `fact` (a value tied to a `source`, so drift from the source gets caught, not just drift between docs) and `pointer` (a link to an existing worked example, reused instead of rewritten).
  `term` entries compile into a generated Vale `substitution` rule, so terminology consistency also runs as a deterministic lint.
  A one-time migration is offered wherever the old files are found; the plugin no longer reads them.
- AI-voice detection: hedging, marketing language, false-contrast framing ("it's not X, it's Y"), and throat-clearing openers, named in `tone-and-voice.md` and checked by every drafting workflow's second-opinion pass.
- A silent second-opinion pass, run cold by `doc-auditor` before `/docs-assist:draft`, `/docs-assist:plan`'s fan-out, `/docs-assist:update`, and `/docs-assist:release-notes` show their output.
  Mechanical findings apply themselves; judgment findings fold into the workflow's own review questions.
  Briefed with settled facts (a notes file's reconciled claims, a drafter's SME-attested list) so it spends its pass on what only a fresh, cross-file read catches instead of re-deriving what already happened.
- An opt-in running notes file (`.docs-assist/intake/notes/`) for a draft that outlasts one sitting, offered at the natural pause rather than mid-dump, so a later session can resume instead of starting over.
- Cross-doc example composition (`reference/code-examples.md`): a named requirement that a reader following every example across a guided journey reaches one working result, not several individually plausible snippets that silently diverge.
  A destructive, upgrade, or troubleshooting example must now fail safe if copy-pasted verbatim (an unresolvable placeholder, not a plausible real-looking target), the opposite rule from a setup example, which must work exactly as pasted.
- `docs-decay.mjs`: a deterministic, dependency-free detector that ranks every doc by accumulated staleness risk (related-source churn, `last-verified` age, doc age, open `sme-attested` claims), run by `/docs-assist:health` for the Freshness dimension.
- `check-facts.mjs`: a deterministic, opt-in (via `/docs-assist:setup-hooks`) checker for `reference.yml`'s mechanical parts: does a `fact`'s source still contain its identifier, does a `pointer`'s target still resolve.
- External link checking in both audit paths: prefers existing CI tooling, then `/docs-assist:setup-lint`, then an ad hoc `markdown-link-check` run, with a spot-check for redirects that hide a rename.
- A standalone `npx` CLI packaging plan (`docs/standalone-cli-plan.md`), deferred pending a maintainer decision on naming and which adapters ship first.
- `reference/claim-verification.md`: the method for tracing a doc claim (a command, flag, config key, default, endpoint, version requirement, or described behavior) to its source and classifying the result. Mandatory for a full-set `/docs-assist:audit`, named by `health.md`'s Freshness dimension, and routed to by default from a vague "improve the docs" request in `SKILL.md`, rather than something a contributor has to ask for by name.
- `reference/session-log.md` and an opt-in `.docs-assist/session-log.md`: an append-only, backward-looking narrative log for a multi-stage engagement, distinct from `docs/plan.md`'s forward-looking content plan.
- Doc Detective detection in `/docs-assist:verify`: if a target repo has Doc Detective configured or installed, the command defers to it as the execution engine (including its unified link validation) instead of the `doc-verifier` subagent; a `verify.tool` config key can force either engine. `doc-verifier` also now spot-checks the links immediately around each step it runs, the one piece of that idea worth keeping even without the dependency.
- A shared fan-out threshold ("more than 5 files or roughly 2,000 lines") applied consistently across `audit`, `plan`, and `update`, and a closing re-lint gate after a fix pass in `draft`, `update`, and the skill's own multi-stage flow, so an edit made in the session doesn't become the next check's finding.

### Changed

- `Google`, `write-good`, and `alex` are now the default managed Vale packages (fetched with `vale sync`), covering weasel words, passive voice, wordiness, clichés, and inclusive language.
  `DocsAssist`'s own style is stripped to only what those packages do not cover (AI voice, no em dashes, descriptive link text, imperative headings); `Weasel.yml` is retired, superseded by write-good's more complete version of the same rule.
- `heading_case`'s default changes from `title` to `sentence`, matching what the new default managed package (Google's developer documentation style guide) itself recommends.
  Title case stays fully supported for a project whose own convention already uses it, and a project's detected convention always wins over the default.
- The shipped markdownlint config now decides every rule explicitly (MD001 through MD060) instead of relying on unstated defaults.
- `/docs-assist:setup-lint` also generates a root `.markdownlint-cli2.jsonc` for the target project, so a bare `npx markdownlint-cli2` matches what CI actually checks instead of falling back to markdownlint's stock defaults.

### Fixed

- `Weasel.yml`'s `just` token was flagging ordinary restrictive or contrastive English ("not just X," "just enough") in a dozen-plus files, never the weakening sense the rule meant to catch; removed before the packages adopted above ultimately replaced the file entirely.
- `MarketingLanguage.yml`'s `leverage` token collided with this plugin's own vocabulary ("highest-leverage fix"); removed with a comment explaining why, a live example of why bare-word bans need contextual judgment.
- `scripts/validate.mjs` now checks that the shipped Vale styles do not fire on the plugin's own docs, catching both of the above during review instead of after merge, and checks that every registered command is discoverable from `llms.txt`, `docs/command-reference.md`, and `README.md`.

### Version Policy

- Bumped to 0.9.6 on the maintainer's explicit call. Agent-driven work otherwise caps at 0.9.5; the version bump is always the maintainer's decision, not the agent's.

</details>

## 0.9.5 - 2026-07-10

One person now operates like a docs team.
Drafting was the last workflow that scaled linearly: a fifteen-doc plan meant fifteen sequential conversations, while audits and updates already ran in parallel.
This release closes that gap and the ones around it.
Approved plan stages now fan out across a new `doc-drafter` subagent, turning the writer into a reviewer of a draft queue.
Experts who are not in the session get intake packets: portable questionnaires pre-loaded from the code, whose answers flow back into drafting.
Feedback now lands where it lives instead of dying with the conversation: change-scoped results go to a sticky pull-request comment, repo-scoped reports to dated files that the next run compares against.
A new `/docs-assist:setup-site` turns the metadata the plugin already maintains into site navigation.
And because surfacing docs for AI readers is core functionality, the llms.txt rules are now single-sourced in their own reference, with every workflow holding up a named part of the maintenance contract.
The staged plan behind this release is committed at `docs/plan.md`.

<details>
<summary>All changes in 0.9.5</summary>

### Added

- A `doc-drafter` subagent and a fan-out path in `/docs-assist:plan`: docs whose material already exists (intake inventory, code, existing docs) draft in parallel, each flagging what needs subject matter expert verification (`needs-sme` markers) instead of inventing it.
  Docs needing fresh human knowledge stay conversational.
  Subagents never edit `llms.txt`; they propose entries and the main conversation writes them, so parallel drafts cannot collide on the map.
- Intake packets, in the intake reference and offered from `/docs-assist:draft` and `/docs-assist:plan`: a portable questionnaire pre-loaded with what the survey and code already reveal, written to `.docs-assist/intake/packets/`, sent to the expert over any channel, and ingested back through `doc-intake`.
- A feedback-delivery principle in `SKILL.md`, applied across the workflows: change-scoped results offer a sticky, upserted PR comment (summary first, detail collapsed); repo-scoped results offer a dated report file under `.docs-assist/reports/`; the conversation is for triage, and every workflow ends with the persist offer.
  The CI docs-impact check now posts its report as a sticky PR comment (one comment, updated in place on every push), `/docs-assist:health` compares against the previous saved scorecard and reports the trend, and `/docs-assist:update` offers a summary comment when its target was a PR.
- `/docs-assist:setup-site [docusaurus | mkdocs]`: generates site navigation from the docs' own metadata (`llms.txt` reader-priority order becomes sidebar order, frontmatter titles become labels), scaffolds a minimal generator setup when none exists, and never silently overwrites curated navigation.
  Deliberately not a site builder.
- `reference/llms-txt.md`: the llms.txt format (per the llms.txt convention, including the reserved `Optional` section), reader-priority ordering, description rules, the frontmatter mapping note, the `llms-full.txt` companion, and the maintenance contract naming which workflow holds up which part.
  `/docs-assist:agent-ready`, the audit, and the frontmatter spec now point at it instead of describing the format piecemeal.
- The staged 1.0 product plan, committed at `docs/plan.md` per the plugin's own persist-the-plan convention, with shipped items marked and the deferred list (CI auto-update, docs-impact noise knobs, more generators) recorded.
- An opt-in fact-check in the intake loop: the new reconcile move offers to check the dump against the code and the existing docs, before anything is shaped and always as the contributor's choice.
  When accepted, confirmed claims are read back and contradictions are asked about rather than assumed (a wrong memory and a found bug look identical, and the plugin offers to record the bug when it is the code that is wrong).
  Afterward, a second, separate offer: record unverifiable claims in a new `sme-attested` frontmatter ledger, specific claims a reviewer verifies and deletes instead of a doc-wide review request. The field is never added without the yes, because strict frontmatter schemas can reject unknown fields; declined, the list lives in the review notes.
  The check guards every door: `doc-intake` reports code conflicts in its inventory, so corpus piles and returned intake packets arrive pre-reconciled, `doc-drafter` records attested claims in the ledger only when the project approved the field, and audits surface docs whose ledgers are large or old.

### Changed

- Both manifests to 0.9.5. The 1.0.0 bump is reserved for the maintainer.

</details>

## 0.9.0 - 2026-07-10

This release makes the plugin guide, watch, and speak agent.
Guide: `/docs-assist:health` is the new front door (install, run one command, get a thirty-second scorecard and the single highest-leverage fix), and a new skill principle, guide-never-gate, means a contributor never needs to know a command name: vague requests route through the health check, and every workflow ends by offering the next step.
Watch: an opt-in CI docs-impact check runs a deterministic, token-free detector on every pull request and flags the diffs that ripple into docs (moved files, changed headings, changed code terms the docs mention, large silent source changes), so `/docs-assist:update` runs when it is warranted instead of when someone remembers.
Speak agent: `/docs-assist:agent-ready` retrofits a docs set for AI readers with an `llms.txt` map, complete frontmatter, and recorded conventions.
Rounding out the release: a terminology registry (`.docs-assist/terms.txt`) gives the 0.8.0 solo-with-team-rigor reviewer a canonical vocabulary to check prose against, and `/docs-assist:release-notes` writes the reader-facing notes for a release from its diff.

<details>
<summary>All changes in 0.9.0</summary>

### Added

- `/docs-assist:health [docs directory]`: the orientation command and recommended first run.
  It samples the repo (fanning out `doc-recon` on large ones), scores coverage, freshness, consistency, and findability with evidence for each rating, names the one fix to start with, and offers to make it in the same session.
  It reports honestly: a healthy set is told it is healthy, and a repo with no docs gets a starting point, not a failing grade.
- `/docs-assist:agent-ready [docs directory]`: make the docs legible to AI tools.
  Creates or repairs `llms.txt` (reconciling entries against the real docs), completes per-doc frontmatter using the repo's own field names without overwriting anything, and records nonstandard conventions where the next tool will find them.
- A CI docs-impact check, installable via `/docs-assist:setup-hooks ci`: a dependency-free detector (`assets/ci/docs-impact.mjs` plus a GitHub Actions workflow) that classifies every pull request's diff against the impact-analysis change types and reports which docs are implicated, with the exact `/docs-assist:update` range to run.
  Deterministic and token-free by design: cheap detection on every PR, expensive updating only when the detector trips.
  Tunable via `DOCS_IMPACT_LINE_THRESHOLD`, `DOCS_IMPACT_STRICT`, and `DOCS_DIR`.
- A guide-never-gate principle in `SKILL.md`: vague requests ("our docs are a mess") route through the health check instead of failing to parse, every workflow ends by naming and offering the next step, and a lost contributor gets the plugin's doors in plain words, never command names.
- A terminology registry, in a new `reference/terminology.md` and `.docs-assist/terms.txt`: canonical product terms and the variants to avoid, in the same human-editable format as the example-variables registry.
  The plugin writes with the canonical terms, `/docs-assist:audit` and the `doc-auditor` subagent flag prose that drifts from them (and the same concept under different names even without a registry), `/docs-assist:init` offers to seed the file from the terms the docs already use, and the term-rename edge in `reference/impact-analysis.md` now includes it.
  This repo dogfoods one at `.docs-assist/terms.txt`.
- `/docs-assist:release-notes [range, tag, or version]`: turn a release's worth of changes into reader-facing release notes.
  It resolves the range, reads commits and merged PRs for what a reader can observe, asks the contributor for the why, and writes notes that lead with breaking changes and upgrade steps, matching the project's changelog convention (or offering the Good Docs release-notes template when starting fresh).

### Changed

- `reference/tone-and-voice.md`: folded a stray markdownlint citation into the rule it supports, and the terminology section now points at the terms registry and `style-guides.md` instead of two bare external links.
- `llms.txt`: the "Optional" section is now "For Docs Leads", naming who those references serve.

</details>

## 0.8.0 - 2026-07-10

One plugin, every team size.
A full product review (`docs/reviews/0.8.0-findings.md`) found that team framing had leaked into paths that should serve a solo maintainer equally, that the core intake loop was duplicated across three files, and that the plugin wrote docs straight to whatever branch the user was on while teaching branch-based review as the docs-as-code workflow.
This release fixes all three: the plugin now calibrates to the contributor's context inside the conversation instead of assuming a team, a cold command invocation defaults to a solo writer held to full-documentation-team rigor, and docs work is offered on a branch by default.
The review's remaining recommendations are preserved in the findings report.

<details>
<summary>All changes in 0.8.0</summary>

### Added

- A "Calibrate to the Contributor's Context" section in `SKILL.md`: the plugin learns whether it is serving one maintainer or a team during existing discovery moments (never via a flag or mode), and calibrates what it offers.
  When a command runs cold, with no `.docs-assist/` config and no prior conversation, it defaults to acting as a solo writer held to the rigor of a full documentation team, using the docs set's own internal consistency as the standard.
- A "Deliver on a Branch" convention in `SKILL.md`, applied in `/docs-assist:draft` and `/docs-assist:update`: in a git repository, multi-file docs work is offered on a docs branch, and the plugin never commits to the default branch unless asked.
- A root `NOTICE` file, so attribution to the author travels with every copy and derivative under Apache 2.0 section 4(d).
- The 0.8.0 product review findings, committed at `docs/reviews/0.8.0-findings.md`, including the prioritized recommendations that did not ship in this release (a terminology registry, a release-notes workflow, audit-file consolidation).

### Changed

- `/docs-assist:draft` no longer restates the intake loop.
  It defers the shared moves (survey, dump, reflect, situate, dig) to `reference/intake.md`, the single source of truth, and keeps only what is specific to drafting one doc.
- `/docs-assist:audit` fan-outs now pass the resolved project conventions into every `doc-auditor` subagent brief, and the agent reads `.docs-assist/config.yml` and `style.md` when present, so no slice of a parallel audit flags style the project explicitly allows.
- `/docs-assist:init` and the README now present committed config as valuable at every team size: shared conventions for a team, a consistency-holding second reader for a solo maintainer.
- The shipped markdownlint config allows the `details` and `summary` HTML elements, so long changelogs and reference sections can collapse detail behind a summary.
  This changelog entry is the first use.
- The changelog format itself: each release now leads with a plain-language summary of what changed and why, with the itemized changes collapsed below it.

### Fixed

- `reference/frontmatter-spec.md` referenced `/draft` step numbers that the 0.7.0 rebuild had renumbered (finalize was "step 7", now step 11).
  It now references steps by name, which survives renumbering.
- `reference/documentation-patterns.md` duplicated the example-safety and consistency rules that `reference/code-examples.md` owns.
  It now points at the canonical file.
- `scripts/validate.mjs` only checked frontmatter on files directly in `docs/`, so docs in subdirectories escaped validation.
  The check now recurses.

</details>

## 0.7.0 - 2026-07-01

### Added

- An intake-led workflow, in a new `reference/intake.md`.
  Documenting something new now leads with a knowledge dump ("tell me everything you know") instead of narrow questions, then reflects it back, situates it against the existing docs and the product, digs at the gaps, and only then shapes the doc.
  It works like a technical writer at the contributor's side, gathering before structuring.
- From-scratch corpus support: a `doc-intake` subagent reads a pile of raw material (tickets, a PRD, notes, old docs) in an isolated context and returns a compact content inventory (clusters, gaps, duplication, staleness), which feeds the planning workflow.
  The raw pile never bloats the main conversation, and the synthesized inventory is persisted outside the published docs tree.
- A code-verification step and an outline checkpoint in the draft flow: before writing, the plugin confirms the specifics the doc will state (commands, flags, defaults, errors) against the code, then proposes an outline for confirmation on anything beyond a short entry.
- Consistent code examples, in a new `reference/code-examples.md`. Before writing a sample the plugin reuses variable names from related docs, anchored to a plugin-maintained `.docs-assist/example-variables.txt` registry so placeholder values stay the same across the docs. `/docs-assist:init` can seed it from existing docs.
- A consolidated command reference (`docs/command-reference.md`) covering all nine commands with their arguments and examples.
- A ship-first path for "document this whole repo, where do I start?": `/docs-assist:plan` now orients before it quizzes (reads the project back and recommends a single first doc to draft now), stages the plan into ship-now, next-iteration, and later, and plans the next iteration from what readers hit. A new `doc-recon` subagent reads a large codebase in isolation and returns a compact project map, so orientation does not flood the main conversation.

### Changed

- Rebuilt `/docs-assist:draft` around the intake loop (survey, dump, reflect, situate, dig, shape, draft), and added a leading corpus-inventory step to `/docs-assist:plan`.
- Reframed the skill's guiding principles around gathering first, reflecting, situating, and recognizing when one request is really several docs.
- `config.yml`'s `lint.tool` is now `lint.tools`, a list, so a project can declare several linters at once (this repo runs Vale and markdownlint).
- `/docs-assist:audit` now flags code-sample values that drift from the `.docs-assist/example-variables.txt` registry or from each other.

## 0.6.0 - 2026-07-01

### Added

- Documentation templates from The Good Docs Project, via a new `/docs-assist:template` command and `reference/templates.md`.
  The plugin suggests a template from what the contributor is trying to write, then fetches the skeleton live so a support lead, engineer, or PM starts from a proven structure instead of a blank page.
  Templates supplement the existing content types rather than replacing them: `content-type` stays canonical and a new optional `template` frontmatter field records the origin.
  Suggesting a template is free and offline, so the assistant offers one whenever it fits; it fetches a body only when the contributor accepts, so nothing is pulled without a yes.
  `.docs-assist/templates.yml` records auto-use and the selection model (content-type or seven-action). On a fetch failure the assistant prompts to retry, use the built-in structure, or cancel.
  The Good Docs templates are MIT-0; `THIRD-PARTY-NOTICES.md` records the acknowledgement.
- Template suggestions offered during `/docs-assist:draft` and `/docs-assist:plan`, and `/docs-assist:init` now offers to enable templates as part of setup.

### Changed

- Framed the skill as a single conversational assistant: contributors describe what they want and the right workflow runs, with the `/docs-assist:*` commands as optional shortcuts rather than a required interface. Setup (config, templates, linting) is offered inline.

### Fixed

- `frontmatter-spec.md` pointed `content-type` at `documentation-patterns.md`; it now points at the canonical `content-types.md`.
- Refreshed the reader tutorials in `docs/` to match the current workflow (the intake dump, templates, and the ship-first plan). This repo now dogfoods its own tool: it commits a `.docs-assist/` config, and the README leads with a real session.
- Reconciled the templates docs with the shipped behavior. Suggesting a template is always available and offline, and only fetching one needs the contributor's yes; some copy still described the feature as off by default.

## 0.5.0 - 2026-07-01

This release reorganizes the plugin around a single source of truth.
It adds a project-local config system, optional linting, an update-on-change workflow, change-based review scoping, subagents, and opt-in hooks.

### Added

- Project-local configuration in `.docs-assist/`: `config.yml` (machine-readable, shared with the linters) and `style.md` (prose conventions).
  The new `/docs-assist:init` command scaffolds it from the repo's existing conventions.
- Optional linting via `/docs-assist:setup-lint`: a Vale custom style that encodes the prose rules (including no em dashes), plus markdownlint, MegaLinter, cspell, and link-check scaffolds, generated from `config.yml`, with existing-linter detection.
  Nothing is bundled or forced.
- Update-on-change via `/docs-assist:update`: finds and updates the docs affected by a diff, a PR, or changed files.
- Change-based scoping for `/docs-assist:audit` and `/docs-assist:update`, in a new `reference/impact-analysis.md`.
  It separates edit scope (the files that changed) from impact scope (the docs those changes can break), maps each change type to the edges it implicates (anchor links, terminology and casing, repeated values, prerequisites), and follows them with a traversal budget instead of trusting the file count.
- Subagents `doc-auditor` and `doc-updater`, used to fan out large audits and updates in parallel.
- Opt-in hooks via `/docs-assist:setup-hooks`: a git pre-commit doc linter and an in-session lint hook.
  Default off.
- Self-CI: `scripts/validate.mjs` validates the manifests, references, and frontmatter, and `.github/workflows/ci.yml` dogfoods the shipped linters against the plugin's own docs.

### Changed

- Renamed the plugin from `documentation-agent` to `docs-assist`.
  Commands are now `/docs-assist:draft`, `/docs-assist:plan`, `/docs-assist:audit`, and `/docs-assist:make-examples`.
  Update any saved references or aliases.
- Renamed the skill directory to `skills/docs-assist/` and moved the methodology files into `skills/docs-assist/reference/`.
- Single-sourced the content-type definitions into `reference/content-types.md`.
  The skill and the commands now point to it instead of redefining the types.
- Rewrote `SKILL.md` as a lean router that loads reference files on demand.
- Restructured the audit, IA, and style-guide references to lead with agent-actionable steps and mark human-only research as reference.
- Removed product-specific examples from the references.
- `/docs-assist:audit` now matches its depth to the target: it scales the inventory step, adds a change-based path that audits a diff and its blast radius, reports residual risk, and reports clean sections without manufacturing findings.
- `/docs-assist:update` now traces the ripple of its own doc edits, beyond the code-to-docs edge it already followed.
- `/docs-assist:audit` and `/docs-assist:update` now account for `llms.txt`: the audit flags an `llms.txt` that has drifted from the docs, and the update brings it back in sync.

### Removed

- `docs/code-review.md`: an internal one-time review artifact whose findings were all applied.

## 0.2.0

### Changed

- Reoriented the plugin from a standards enforcer to a subject matter expert coach.

## 0.1.0

- Initial release: documentation skill plus `draft`, `plan`, `audit`, and `make-examples` commands.
