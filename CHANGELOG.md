# Changelog

All notable changes to this project are documented here.
The format is based on Keep a Changelog, and the project follows Semantic Versioning.

## 0.9.9 - 2026-09-16

The 1.0 overhaul, shipped as a release candidate under a 0.9.x number.
The content is what 1.0.0 will be; the version is deliberately short of it so this can be installed, run against real repositories, and corrected before the number stops being provisional.
Everything below describes that overhaul.

A comprehensive overhaul rather than an increment.
The plugin's doctrine survives almost intact; its architecture and surface do not.

The organizing idea: drafting and reviewing are one mechanism, run by three chairs in separate contexts, passing artifacts by path.
An authority chair emits a cold, prose-free packet of what is true.
A continuity chair reconciles it against the rest of the docs set.
An advocate chair shapes it into a document and declares, as a ledger, everything it added that the packet did not contain.
That ledger is the point: it is a diff between two artifacts, not a model's recollection of its own reasoning, and it is what a contributor reviews instead of a whole draft.

### Breaking changes

Fourteen commands became nine.
The old names are removed rather than deprecated, so typing one now does nothing.

| Removed                      | Use instead                                                 |
| ---------------------------- | ----------------------------------------------------------- |
| `/docs-assist:init`          | `/docs-assist:setup`                                        |
| `/docs-assist:setup-lint`    | `/docs-assist:setup`                                        |
| `/docs-assist:setup-hooks`   | `/docs-assist:setup`                                        |
| `/docs-assist:setup-site`    | `/docs-assist:setup`                                        |
| `/docs-assist:make-examples` | `/docs-assist:draft`, which covers examples while drafting  |
| `/docs-assist:template`      | `/docs-assist:draft`, which offers a template when one fits |
| `/docs-assist:agent-ready`   | `/docs-assist:merge-prep`                                   |

Each command that remains is something you set out to do, and the ones that went were steps inside something else.
The four setup commands were one job split four ways, and examples and templates are things you want mid-draft rather than separate errands.
Nothing else in the upgrade requires action from you.

- **The `doc-drafter` and `doc-auditor` subagents are removed**, replaced by the chairs.
  This affects you only if you named either one in your own `CLAUDE.md`, a hook, or a script.
- **The maintainer-facing docs are no longer part of the install.** The two planning docs, both files under `docs/reviews/`, and `docs/plan.md` moved to the `working-notes` branch, so a link into them breaks.
  They described a pre-1.0 command surface, which meant a reader arriving from `llms.txt` landed on a workflow that could not be run.
  `docs/plan.md` was also carrying three identities at once: the README linked it as a live backlog, `llms.txt` called it a superseded historical record, and the instruction files use that same path for the forward-looking content plan the plugin writes in your project.
  Its deferred backlog moved into the README's self-assessment, and the path now means only the last of those.
  What ships under `docs/` is four reader-facing pages.

### Added

- **An authoring loop whose output you review as a diff.** Drafting seats three chairs in separate contexts and hands back a ledger: everything the writing chair added that the source packet did not contain.
  You review the ledger rather than re-reading a whole draft.
  Chairs are cast per document on two axes: where the truth lives, and whether the reader needs to do something or understand something.
  A subject matter expert and a technical writer suit a procedure; a professor and an instructional designer suit a concept page, because that pair trades depth against learnability rather than truth against clarity.
  The mechanism is documented in `docs/how-the-loop-works.md`, which the loop wrote about itself, and specified across `reference/loop.md`, `casting.md`, `packet-procedure.md`, `packet-concept.md`, `ledger.md`, and the constitutions under `reference/chairs/`.
- **Three chairs as subagents**: `chair-authority`, `chair-advocate`, and `chair-continuity`, thin wrappers over the constitutions.
  The isolation is load-bearing rather than an optimization: a single context that produced the packet has already seen the reasoning behind it and cannot reliably tell which of its own claims came from where.
- **A cold-read check on whether a document actually teaches.** The new `cold-reader` subagent is granted only `Read`, sees one document with no repository and no conversation, and reports what it would do and what it expects to happen.
  Where that diverges from what the document intended, the gap names the paragraph at fault.
- **Drafts proposed from what maintainers already wrote.** The new `doc-harvester` subagent and `reference/harvest.md` mine issue replies, pull request comments, and commit message bodies.
  One corpus, three uses: propose a draft from existing material, build the authority persona's voice, and supply real reader language.
  Opt-in, with privacy rules stricter than the plugin's defaults.
- **`/docs-assist:setup`**: conventions, linting, hooks, and site navigation in one pass, each stage opt-in and nothing written without a yes.
  Naming a stage (`/docs-assist:setup linting`) runs that one alone.
  This is the command the four removed setup commands became, and it is new rather than a rename: it reads the repo's existing conventions first and proposes config that matches them, instead of asking you to answer the same questions four times.
- **`/docs-assist:merge-prep`**: the one place anything expensive runs.
  Whole-set continuity, `llms.txt` regeneration, bundle drift, link checking, and full linting happen here when you ask, so a single content fix never triggers a regenerate-and-diff pass over your whole docs tree.
- **A wider net for writing that nobody called documentation.** The `writing-task` skill routes pull request descriptions, release notes, runbooks, and READMEs to the capability that fits, and says plainly when the plugin has nothing for the task rather than stretching.
- **Per-project chair personas.** `reference/personas.md`: a chair resolves through three layers, the same order `config-resolution.md` already defines, from constitution to a project overlay in `.docs-assist/personas/` to the runtime brief.
- **Four deterministic checks** you can run without a model: `file-path-check.mjs`, `example-continuity.mjs`, `duration-check.mjs`, and `bundle-drift.mjs`.
- **Claim checking against sources you do not vendor.** `reference/external-verification.md`, salvaged from the closed PR #13, with the self-citation exclusion promoted from opt-in to always-on.
- **`reference/triggering.md`**: what makes the plugin show up and why it sometimes does not.
  The highest-leverage fix is not a mechanism: three lines in `CLAUDE.md`, which is always in context where a skill description is only matched.
- **The escalation gradient as rulebook selection.** Each pass loads a different file, so "more keen-eyed" is a fact about which rules are in context rather than an instruction to be stricter.
  A model told to be grouchy writes grouchy prose and does not read more carefully.

### Changed

- **Frontmatter is no longer load-bearing, and the plugin's own state moved out of your files.** Site generators disagree about what they accept, a site generator cannot be assumed at all, and frontmatter only pays off once a reader has already landed on the page.
  Plugin bookkeeping now lives in `.docs-assist/state/docs.yml`, shaped by the new `assets/config/state.yml` scaffold.
  Frontmatter you already keep is still read and respected, and where both carry a value the store wins, so no migration is needed and nothing is rewritten in your documents.
- **Verification markers are a suggestion, not a mechanic.** Offered with the benefit stated, added on a yes, never written unasked.
- **An audit is the loop pointed at a finished document.** Pass 0 reconstructs the packet from what the document claims rather than writing one.
  A claim nobody can source is the finding, and in finished prose it is invisible: it sits next to twenty sourced claims and reads exactly like them.
- **Intake and the packet are one artifact.** The intake loop is pass 0 with a person in the authority chair, so a packet a human filled and one a chair emitted are interchangeable.
- **Code examples are written for the reader who pastes first and reads after.** `reference/code-examples.md` gains the formatting half of the safety rule its destructive-example section already covered: one step per block, two unrelated commands in two blocks, and a step's commands chained with `&& \` and a line break rather than inline, so the halves can be seen and copied apart.
  A block that edits an existing file now has to show its surrounding context or mark the omission with `...`, rather than leaving the reader to guess where it goes.
  The rule ships in `assets/config/style.md` as a default your project inherits, and `validate.mjs` gates the `&&` half, which is the only part a regex can judge.
  The repo's own illustrative block was `npm install && npm run build`, the shape the rule warns about.
- **The destructive-example rule stops asking readers to edit commands in their head.** It used to say to show the dry-run form and name the real flag in prose, which leaves the reader retyping a command they cannot see, and a flag swap is easy to mistype on a keyboard laid out differently from the author's.
  The rule now follows the pattern these docs' sibling pi-hole guide already uses: show the real command with an unresolvable placeholder in the slot that would do the damage, say in prose that it is set to fail on purpose and what the failure saves the reader from, name what replaces each placeholder and where to find it, and say how to recover if it goes wrong anyway.
  A dry run became a step of its own with its own block, rather than a mode of the real command.
- Each command in a chain starts flush, with indentation reserved for the wrapped arguments of a single command, so the two cases stay visually distinct.
- **A code block says which file it is and where it runs.** A reader working through a multi-step page loses track of which file they are in and which machine they are on, and every wrong guess costs them a step.
  The portable carrier is a path comment at the top of the block; a language with no comment syntax, JSON being the common case, uses the renderer's filename feature instead, and prose naming the exact path when neither exists.
  Syntax highlighting, line numbers, and line highlighting get the same treatment: use what the project's stack supports, and never let a rendering feature be the only thing carrying something the reader needs.
  It reaches the drafting path rather than only the review one: `tone-and-voice.md` carries the essentials, which the advocate chair loads on every pass, and the chair now picks up `code-examples.md` when the document will carry commands.
- **The style template the plugin scaffolds bans emphasis inside prose.** `assets/config/style.md` now carries the rule as a default your project inherits: bold is for run-in headings and UI labels, a term being defined leads its bullet instead, and a literal value belongs in a code span.
  GitLab's rule is the one followed: "Do not use bold for keywords or emphasis."
- **The Vale scaffold declares a vocabulary** at `styles/config/vocabularies/DocsAssist/accept.txt`, so proper nouns survive a sentence-case heading rule instead of being the reason to switch it off.
  Declaring one also enables `Vale.Terms`, which fired only on literal file names, URLs, and id-like values, so it ships off with the reasoning recorded.
- **Two editorial rules the plugin enforced nowhere.** Phantom negation (ruling out an option that was never live) and an analogy standing in for the fact it should illustrate both now appear in `reference/tone-and-voice.md` and in the style template the plugin scaffolds.
  The analogy rule also joins the advocate chair's clarity pass, where a draft is actually read for whether a reader can follow it.
  Both were caught by a reader on this release's own notes, which described a command cut as "doors against plumbing, not a target number": a figure of speech carrying the criterion, and a negation of a target number nobody had proposed.
- **`DocsAssist.FalseContrast` reads both word orders.** It matched `not X, it's Y` and missed the inverted `Y, not X`, which is the more common form and the one that shipped past it.
  The inverted token matches about forty-five times on this repository, most of them legitimate contrasts, so it stays a suggestion and the rule now says so: whether the negated alternative was ever real is a judgment no regex makes.
- **Automatic close-out linting is gone**, moved to `/docs-assist:merge-prep`.
  Any operation whose cost scales with the whole docs set now runs at that gate and nowhere else.

### Fixed

- **Instruction files still pointed at commands 1.0 removed.** `reference/llms-txt.md` assigned the `llms.txt` maintenance contract to `Agent-ready` and `Setup-site`, and `reference/templates.md` still listed the standalone `Template` command.
  They survived the surface reduction because they were written as bold prose names rather than `/docs-assist:` references, which is the only form the stale-command check could see.
  All three are corrected, the whole list now uses command references, and `validate.mjs` reads a bold run-in heading that names a command too.
- **`SKILL.md` still routed to two commands 1.0 removed.** Its multi-stage batching section named `init` and `setup-lint` as stages to run, and `reference/session-log.md` opened on the same chain.
  These are bare code spans, the one form neither the `/docs-assist:` check nor the bold run-in heading check could see, so the flagship skill shipped telling the model to run commands that no longer exist.
  Both now name live commands, and `validate.mjs` reads a bare code span too.
- **`llms.txt` misnamed every doc it lists.** All four `docs/` entries carried the title-case names they had before this release re-cased every heading, so the map an AI tool reads first named four documents that no longer existed under those titles.
  `reference/llms-txt.md` already put title drift on the audit's list; nothing checked the repo's own file, and `validate.mjs` now does.
- **The heading sweep renamed sections and left the pointers behind.** Nine cross-references still quoted pre-1.0 section names: "Verifying a Journey", "Calibrate the Baseline", "Migrating", "Check External Links", and "Compose Across the Docs Set".
  A quoted section name is a claim that the section exists under that name, and each one sent a reader or a chair looking for a heading that had been renamed.
- **The shipped report templates emitted title case.** The audit report and the health scorecard the plugin tells a model to produce carried ten title-case headings between them, against the sentence case this repo configures and the release re-cased everything else to.
  The example document titles in `reference/content-types.md` and `reference/frontmatter-spec.md` did the same, modeling the form `reference/tone-and-voice.md` gives as its bad example.
- **`reference/intake.md` contradicted itself on its own page.** It stated that no separate directory exists and that everything lands in the loop's packet, two moves after writing the async questionnaire to `.docs-assist/intake/packets/`, and it called that questionnaire a packet, which is the name collision this release set out to clear.
  The questionnaire is now named as an instrument that collects answers rather than a packet, and the claim says what is actually true: one home for a filled packet, with the questionnaire and the corpus inventory as the two instruments beside it.
- `SKILL.md` sent content inventories to `.docs-assist/inventory/`, a path no other file uses; the inventory lives in `.docs-assist/intake/`.
- A bulk rename left `reference/config-resolution.md` with a sentence starting in lower case.
- **`bundle-drift.mjs` crashed on a docs directory.** It is the one deterministic check whose argument is a config file rather than a docs directory, so handing it what the other three take died on a raw `EISDIR` stack instead of the graceful message every other bad input there produces.
  It now says what it wanted.
- **`check-claims.mjs` confirmed claims against its own output.** Its cache records the text of every claim found, so tracking that directory made each claim resolve by finding itself: 20 findings became 0 between two runs with nothing fixed.
  The plugin's working tree is now excluded by rule rather than by the coincidence of a markdown filter.
- **The README documented `[stage]` for `/docs-assist:setup` and the command never read an argument.** Every other command resolves `$ARGUMENTS`; this one did not, so `/docs-assist:setup linting` ran the full pass.
  The stage argument is implemented now, and the command reference names the six stages rather than showing one example and leaving the rest to guesswork.
- **The README named all nine commands, and CI required it to.** `SKILL.md` says a contributor never needs to know a command and to "offer the doors in plain words, not command names", while `validate.mjs` failed the build unless the README listed every one.
  The catalogue is gone, the reference that owns argument shapes is the only place that carries them, and the check no longer treats the README as a command surface.
  This also closed the `merge-prep` argument drift by removing the second place it was written down.
- **Install, setup, and triggering moved to `docs/get-started.md`.** They were the README's spine and four other sections sat between the last two, including a maintenance task.
  The README answers whether the plugin is worth adopting; the new page owns the path from nothing to working.
- **The README described a feature that does not exist, in the present tense.** Its triggering section stated the proactive layer's restraint rules as shipped behavior, and the Known limits section of this entry says that layer is designed and unbuilt.
  What actually ships is one hook recipe, and the page now says so.
- **Four more README claims did not survive tracing.** Setup was said to scaffold a site when none exists (`commands/setup.md` does the opposite), to generate `templates.yml` (no templates stage exists), and to detect and extend an existing linter (it detects conventions, not linters); MegaLinter was described as offered and appears in no command or skill.
- **`/docs-assist:setup` was listed three times as three different commands** in `docs/set-up-documentation-standards-for-your-team.md`, the page the README sends docs leads to: the old `template`, `init`, and `setup-lint` with the new name pasted over all three.
- `commands/setup.md` and `commands/merge-prep.md` were the only commands with no `argument-hint`, though both document an argument.
- **The heading sweep mangled nine command names.** `docs/command-reference.md` carried `### /Docs-assist:draft` and eight more, where sentence-casing capitalized a literal command that is spelled lower case everywhere it is typed.
- The README's file tree left out `skills/writing-task/`, one of the two skills this release ships.
- A language-tag check was proposed and cut after firing on a deliberate accommodation, the same lesson `leverage` and `just` already taught the Vale styles.

### Repository and CI

Maintainer-facing work, with no effect on an installed plugin except where noted above.

- **Working notes stopped shipping.** Claude Code has no plugin-level files allowlist: on install it copies the whole repository into `~/.claude/plugins/cache`, so every tracked file reached every user.
  The design records under `reports/` and the artifacts from the loop's one end-to-end run are archived on the `working-notes` branch and gitignored here, and an allowlist check fails CI if a new working directory appears.
  The dogfooding config stays: `config.yml`, `style.md`, `reference.yml`, and the personas are project configuration that the linters read.
- **Rules this repo declared and never enforced now fail CI**: one sentence per line, no prose emphasis, and a repeated `1.` for ordered lists.
  Each had decayed quietly, and each check names the config key it comes from.
  The cleanup behind them: 1208 lines reflowed across 75 files, all 82 mid-prose emphasis runs rewritten, and 486 headings moved to sentence case across 72 files after the repo had set `heading_case: title` while leaving `Google.Headings` enabled, which suppressed 97 findings in `docs/` alone.
  Eleven gerund headings became imperative; the nine that remain are noun section labels.
- **`scripts/validate.mjs` gained five checks**: prose naming an agent or command that no longer exists, every chair having a rulebook per threshold, reference files resolving, every tracked path sitting on the shipping allowlist, and one sentence per line.
  The first found 59 stale references on its first run.
  Its prose checks cover `assets/config/` too, so the style template this plugin ships follows the rules it describes.
- **markdownlint covers the shipped surface.** It linted `README.md`, `CHANGELOG.md`, and `docs/` while `commands/`, `agents/`, and `skills/` had no coverage, though they are the bulk of what installs into a user's plugin cache and Vale and cspell already scanned them.
  All 73 files already passed, so this closes the gate rather than fixing a backlog.
- **`check-claims.mjs`** now covers `skills/`, `commands/`, and `agents/`, scoped so an instruction file's examples are not read as claims about the repository.
- **Nothing checked the changelog's own prose.** `CHANGELOG.md` is rightly exempt from the stale-name check, because a dated record is allowed to name the dead, but it was also sitting outside the emphasis, sentence-per-line, and ordered-list checks, where it has no such excuse.
  It is the most-read file in a release and it was the one shipped file those rules did not cover.
  Gated now, which cost one split line in this entry.
- **Node 20 is out of support, and the workflows this plugin scaffolds still pinned it.** Four of the six pins are in the CI templates `/docs-assist:setup` writes into your repository, so the stale pin was being handed to every project that accepted them.
  All six now pin Node 24, the current long-term support line.
  The runner's deprecation warning turned out to be a separate thing: it comes from the actions themselves, whose own bundles ran on Node 20, not from the version those actions install.
  `actions/checkout` and `actions/setup-node` move to v7 and `actions/github-script` to v9, in this repo's workflow and in the shipped templates.
- **`validate.mjs` gained two more checks and lost a blind spot.** A removed command named in a bare code span now fails, and an `llms.txt` entry whose title disagrees with the doc's own frontmatter now fails.
  Its stale-name check also walked the working tree rather than the index, so it reported on the archived working notes that are gitignored but still sit on a maintainer's disk; every prose check now scopes to what git tracks, which is what actually reaches a user's plugin cache.

### Known limits

- The loop has been run end to end once, the run that produced `docs/how-the-loop-works.md`.
  Cost, convergence, and false-positive rates are unmeasured.
- No coverage for docstrings and in-source reference, commit message bodies, or architecture decision records.
  `writing-task` names these rather than bluffing.
- The proactive layer in `triggering.md` is designed and unbuilt.

### Version policy

- Shipped as 0.9.9 on the maintainer's explicit instruction, holding 1.0.0 back until this has been installed and run against real repositories.
  The policy stands: a version bump past 0.9.5 is the maintainer's decision, and 1.0.0 especially so.

## 0.9.8 - 2026-07-21

### Added

- `reference/pr-descriptions.md`: when a PR's commits aren't independently reviewable (a later commit fixes something an earlier one touched, common in docs work), restructure the description by file or area instead of by commit, say so explicitly near the top, and write for a human reviewer whose first pass is already automated (spend words on judgment calls and verification, not on what a linter or bot first-pass already covers).
  Cross-linked from `SKILL.md`'s "Deliver on a Branch" and `/docs-assist:update`'s own-PR path.

### Version policy

- Bumped to 0.9.8 on the maintainer's explicit call, the same policy as 0.9.6 and 0.9.7: agent-driven work caps at 0.9.5 by default, and a version bump past that is always the maintainer's decision, not the agent's.

## 0.9.7 - 2026-07-20

`check-facts.mjs` verifies the curated `.docs-assist/reference.yml` registry deterministically; this release extends the same approach, cold, to the whole doc set.

### Added

- `check-claims.mjs` and `claim-briefs.mjs`: a deterministic, dependency-free pair that mechanizes the first half of `claim-verification.md`'s method across the whole doc set.
  `check-claims.mjs` extracts identifier-shaped claims (CLI commands/flags, config/env keys, function or class names, file paths, version requirements) from every doc and resolves each against the code with `git grep`/`git ls-files`, no agent involved; `claim-briefs.mjs` turns what's left (described-behavior and numeric claims a lookup can't settle) into one self-contained brief per doc for the `doc-auditor` fan-out.
  `/docs-assist:audit` and `claim-verification.md` now point at it as the recommended first pass before tracing claims by hand.
  `/docs-assist:setup-hooks` gained a CI claim check (`assets/ci/github/check-claims.yml`), the same sticky-PR-comment pattern as the reference-registry check, non-strict by default since a "missing" result can also mean the claim's target is real but gitignored.
  Born from a real cross-project run: extracted and mechanically resolved 453 candidate claims from a 14-doc corpus in seconds, fanned the 192 that needed judgment out to 14 parallel agents, and found 6 real drifted or inconsistent claims a lint pass alone would have missed.

### Version policy

- Bumped to 0.9.7 on the maintainer's explicit call, the same policy as 0.9.6: agent-driven work caps at 0.9.5 by default, and a version bump past that is always the maintainer's decision, not the agent's.

## 0.9.6 - 2026-07-19

This release asks whether the docs actually work, not just whether they read well.
A new `/docs-assist:verify` executes a procedural doc's steps in an isolated workspace and reports where reality diverges, the same way CI executes tests instead of reading the code and guessing; a clean pass is what gives `last-verified` real evidence behind it for the first time.
Every doc now carries a quick user story (who arrives, from where, to do what, done when what), calibrated from evidence instead of a fixed posture, so drafting can write to a reader instead of a guess and audits can walk the journey end to end.
Two registries that used to duplicate each other's territory (`example-variables.txt`, `terms.txt`) merge into one `reference.yml`, with two new entry kinds: facts tied to a real source, and pointers to a worked example instead of a rewritten one.
And general prose quality stops being something this plugin maintains its own copy of: `Google`, `write-good`, and `alex` are now the managed Vale packages doing that work, actively maintained upstream, with the plugin's own style stripped down to only what they do not cover.
A [field report from a real end-to-end run](https://github.com/EdwardAngert/docs-agent-plugin/blob/working-notes/docs/reviews/0.9.5-field-report-reformatters-session.md) then closed the gap between what this plugin claims by default and what it actually does: mechanical checks are now wired into `audit` and `health` instead of stated as a principle, `setup-lint` runs and triages its first pass instead of stopping at scaffolding, and a mandatory claim-to-code trace (`reference/claim-verification.md`) makes "improve the docs" reach further than a clean lint run.
`/docs-assist:verify` also now defers to [Doc Detective](https://docs.doc-detective.com/) when it's present in the target repo, since it's a purpose-built execution engine for the same job; the plugin's own `doc-verifier` remains the default otherwise.
The staged plan behind this release is archived on the [`working-notes` branch](https://github.com/EdwardAngert/docs-agent-plugin/blob/working-notes/docs/plan.md).

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
- A standalone `npx` CLI packaging plan, deferred pending a maintainer decision on naming and which adapters ship first.
  It is kept on the `working-notes` branch rather than shipped with the plugin.
- `reference/claim-verification.md`: the method for tracing a doc claim (a command, flag, config key, default, endpoint, version requirement, or described behavior) to its source and classifying the result.
  Mandatory for a full-set `/docs-assist:audit`, named by `health.md`'s Freshness dimension, and routed to by default from a vague "improve the docs" request in `SKILL.md`, rather than something a contributor has to ask for by name.
- `reference/session-log.md` and an opt-in `.docs-assist/session-log.md`: an append-only, backward-looking narrative log for a multi-stage engagement, distinct from `docs/plan.md`'s forward-looking content plan.
- Doc Detective detection in `/docs-assist:verify`: if a target repo has Doc Detective configured or installed, the command defers to it as the execution engine (including its unified link validation) instead of the `doc-verifier` subagent; a `verify.tool` config key can force either engine.
  `doc-verifier` also now spot-checks the links immediately around each step it runs, the one piece of that idea worth keeping even without the dependency.
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

### Version policy

- Bumped to 0.9.6 on the maintainer's explicit call.
  Agent-driven work otherwise caps at 0.9.5; the version bump is always the maintainer's decision, not the agent's.

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
The staged plan behind this release is archived on the [`working-notes` branch](https://github.com/EdwardAngert/docs-agent-plugin/blob/working-notes/docs/plan.md).

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
- The staged 1.0 product plan, persisted per the plugin's own persist-the-plan convention, with shipped items marked and the deferred list (CI auto-update, docs-impact noise knobs, more generators) recorded.
  It is archived on the [`working-notes` branch](https://github.com/EdwardAngert/docs-agent-plugin/blob/working-notes/docs/plan.md).
- An opt-in fact-check in the intake loop: the new reconcile move offers to check the dump against the code and the existing docs, before anything is shaped and always as the contributor's choice.
  When accepted, confirmed claims are read back and contradictions are asked about rather than assumed (a wrong memory and a found bug look identical, and the plugin offers to record the bug when it is the code that is wrong).
  Afterward, a second, separate offer: record unverifiable claims in a new `sme-attested` frontmatter ledger, specific claims a reviewer verifies and deletes instead of a doc-wide review request.
  The field is never added without the yes, because strict frontmatter schemas can reject unknown fields; declined, the list lives in the review notes.
  The check guards every door: `doc-intake` reports code conflicts in its inventory, so corpus piles and returned intake packets arrive pre-reconciled, `doc-drafter` records attested claims in the ledger only when the project approved the field, and audits surface docs whose ledgers are large or old.

### Changed

- Both manifests to 0.9.5.
  The 1.0.0 bump is reserved for the maintainer.

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
A full product review ([0.8.0 findings](https://github.com/EdwardAngert/docs-agent-plugin/blob/working-notes/docs/reviews/0.8.0-findings.md)) found that team framing had leaked into paths that should serve a solo maintainer equally, that the core intake loop was duplicated across three files, and that the plugin wrote docs straight to whatever branch the user was on while teaching branch-based review as the docs-as-code workflow.
This release fixes all three: the plugin now calibrates to the contributor's context inside the conversation instead of assuming a team, a cold command invocation defaults to a solo writer held to full-documentation-team rigor, and docs work is offered on a branch by default.
The review's remaining recommendations are preserved in the findings report.

<details>
<summary>All changes in 0.8.0</summary>

### Added

- A "Calibrate to the Contributor's Context" section in `SKILL.md`: the plugin learns whether it is serving one maintainer or a team during existing discovery moments (never via a flag or mode), and calibrates what it offers.
  When a command runs cold, with no `.docs-assist/` config and no prior conversation, it defaults to acting as a solo writer held to the rigor of a full documentation team, using the docs set's own internal consistency as the standard.
- A "Deliver on a Branch" convention in `SKILL.md`, applied in `/docs-assist:draft` and `/docs-assist:update`: in a git repository, multi-file docs work is offered on a docs branch, and the plugin never commits to the default branch unless asked.
- A root `NOTICE` file, so attribution to the author travels with every copy and derivative under Apache 2.0 section 4(d).
- The [0.8.0 product review findings](https://github.com/EdwardAngert/docs-agent-plugin/blob/working-notes/docs/reviews/0.8.0-findings.md), including the prioritized recommendations that did not ship in this release (a terminology registry, a release-notes workflow, audit-file consolidation).

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
- Consistent code examples, in a new `reference/code-examples.md`.
  Before writing a sample the plugin reuses variable names from related docs, anchored to a plugin-maintained `.docs-assist/example-variables.txt` registry so placeholder values stay the same across the docs.
  `/docs-assist:init` can seed it from existing docs.
- A consolidated command reference (`docs/command-reference.md`) covering all nine commands with their arguments and examples.
- A ship-first path for "document this whole repo, where do I start?": `/docs-assist:plan` now orients before it quizzes (reads the project back and recommends a single first doc to draft now), stages the plan into ship-now, next-iteration, and later, and plans the next iteration from what readers hit.
  A new `doc-recon` subagent reads a large codebase in isolation and returns a compact project map, so orientation does not flood the main conversation.

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
  `.docs-assist/templates.yml` records auto-use and the selection model (content-type or seven-action).
  On a fetch failure the assistant prompts to retry, use the built-in structure, or cancel.
  The Good Docs templates are MIT-0; `THIRD-PARTY-NOTICES.md` records the acknowledgement.
- Template suggestions offered during `/docs-assist:draft` and `/docs-assist:plan`, and `/docs-assist:init` now offers to enable templates as part of setup.

### Changed

- Framed the skill as a single conversational assistant: contributors describe what they want and the right workflow runs, with the `/docs-assist:*` commands as optional shortcuts rather than a required interface.
  Setup (config, templates, linting) is offered inline.

### Fixed

- `frontmatter-spec.md` pointed `content-type` at `documentation-patterns.md`; it now points at the canonical `content-types.md`.
- Refreshed the reader tutorials in `docs/` to match the current workflow (the intake dump, templates, and the ship-first plan).
  This repo now dogfoods its own tool: it commits a `.docs-assist/` config, and the README leads with a real session.
- Reconciled the templates docs with the shipped behavior.
  Suggesting a template is always available and offline, and only fetching one needs the contributor's yes; some copy still described the feature as off by default.

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
