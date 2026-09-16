# Unshipped improvement ideas for docs-agent-plugin

Survey of this repo's local branches, the sibling `drafts-research/` and
`edwardangert.github.io/` repos, and open PRs, for improvements to the
plugin's core job: helping an SME get what they know written down and out to
readers. Written 2026-09-16.

## Method and what was ruled out

Every local branch was compared against `main` (`git merge-base`, `git diff
--stat`). Ten of thirteen branches turned out to be **stale**, their merge-base
predates recent main history by weeks to months, and the diffs are almost
entirely deletions (branch missing what main has since gained), not
additions. These carry no unshipped ideas and are candidates for deletion:
`overhaul-1.0`, `reorient-sme-coaching`, `commands-assets`,
`add-external-link-check-and-cli-plan`, `intake-led`,
`intake-notes-persistence`, `product-review-0.8.0`, `solo-writer-0.9.5`,
`terminology-release-notes-0.9.0`, `docs/pr-description-guidance`.

Two branches (`feat/claim-check-tooling`, `field-report-fixes-0.9.5`) have
unique commits by `git log`, but their content already shipped to `main`
under the same commit messages (see `CHANGELOG.md` 0.9.6/0.9.7), the branch
pointers are just orphaned, not sources of new work.

That leaves one branch with real unshipped content, plus a second-order find
in the sibling repos that turned out to be the more important result.

## 1. PR #13 (`legible-verification`), open, unmerged, needs a decision

Branched directly off current `main` tip, `git diff main..legible-verification`
is pure addition (373 insertions), and it's already an
[open PR](https://github.com/EdwardAngert/docs-agent-plugin/pull/13). This is
the more actionable finding here: **it's not undiscovered, it's undecided.**

What it adds, all opt-in/additive per the PR's own description:

- **Section-level verification** (`reference/section-verification.md`,
  `assets/ci/section-verification.mjs`): a plain-text `**Verified
  2026-07.**` marker that survives to rendered HTML, unlike frontmatter.
  Page-level `last-verified` stays the default; section markers are offered
  only when a doc mixes decay-heterogeneous content. `docs-decay.mjs` reads
  the marker when present to rank by a doc's stalest section.
- **External-claim verification** (`reference/external-verification.md`, a
  new opt-in mode on `/docs-assist:verify`): closes the gap that
  `claim-verification.md` only traces claims to *local* code, anything that
  makes a claim about a vendor, protocol, or third party has no verification
  path today. Two rules: search both the specific product name and its
  generic/underlying form; always exclude the doc set under verification
  from its own search results (a well-ranking doc can get cited as
  corroboration for itself).
- **`llms.txt` altitude test**: a three-way test (too specific / too vague /
  right altitude) plus a two-axis inline-vs-pointer rule for whether a
  conclusion belongs in the file directly or behind a link.
- Minor: `agent-ready.md` checks whether the target SSG renders frontmatter
  into page output before recommending a field; `setup-site.md` can emit
  `schema.org` `BreadcrumbList`/`dateModified`.

**Assessment:** high value, low risk (nothing gates a build or requires
MDX), well-reasoned (the branch's own commit message documents design
corrections made during self-review). The PR's own "Known gaps" section
says it plainly: **unvalidated against a second real docs set.** That
dogfooding happened after the PR was opened, see below, and it both
validates and extends the design. Recommend: merge #13, informed by the
dogfooding findings in section 2.

## 2. The real find: a field report from dogfooding PR #13's ideas

`edwardangert.github.io` (Edward's own docs site, primarily Pi-hole guides)
is a live consumer of this plugin. A same-day research session
(`drafts-research/pi-hole-ai-provenance-study.md`) built and shipped exactly
this "verification metadata that survives rendering" idea *on that site*,
independent of and slightly before it was generalized into PR #13. A later
session then explicitly audited the plugin's own doctrine against how this
non-toy repo actually needed to use it, and wrote up the gaps:
`edwardangert.github.io/.docs-assist/reports/docs-assist-improvement-plan-2026-08-26.md`
(2026-08-26, updated 2026-08-28). These are genuinely new, not folded into
PR #13 or any other branch yet.

### 2.1 `llms-full.txt` should be a plugin-generated artifact, not hand-maintained

The plugin already prescribes this in principle
(`reference/llms-txt.md:80`: "generated, never hand-edited") but ships no
generator. The consuming repo hand-maintains an 11-file, ~4,700-line bundle
and hit two real bugs from it: a 645-line duplicate block spliced into the
middle of a code fence (silent, live on `main` for a while, caught only by
accident when badge counts stopped matching), and a hand-added admonition
block silently rendered wrong because the author didn't know the bundle
passes some syntax through verbatim and not other syntax.

A full generator spec already exists and was verified against the
committed file byte-for-byte:
`edwardangert.github.io/.docs-assist/reports/llms-generation-plan.md`. It
specifies the exact transformation table (what's stripped, what's passed
through, `<Verified>` → `[Verified: ...]`, link rewriting, `?raw` import
inlining), plus four drift checks worth keeping regardless of whether the
generator ships (forward drift, reverse drift, "the one that would have
caught the splice", badge parity, element parity).

The finding was updated after two more hand-edit bugs: this should **not**
be a repo-local script (`scripts/build-llms.mjs`) the consuming project
maintains and has to keep in sync with the plugin's own conventions by
hand, it should be a plugin capability, callable by any project with an
`llms-full.txt`. It also narrows the plugin's current trigger doctrine:
"regenerate whenever the docs change" is too frequent for a real project
(every small content fix would trigger an 11-file diff pass); the actual
working convention that emerged was a deliberate, human-initiated
merge-prep step, not an automatic one.

**Assessment:** high value, medium effort (the spec is already done; this
is "port a proven design into a portable command"). Two shippable pieces:
(a) an `llms-full.txt` generator as a plugin skill/command, using the
transformation table and drift checks in `llms-generation-plan.md` as a
working spec, and (b) a distinct, explicitly-invoked gate command (see 2.4)
rather than folding regeneration into every workflow's close-out.

### 2.2 `doc-auditor` has no web access, a structural gap for a whole class of docs sets

`agents/doc-auditor.md` ships with `tools: Read, Grep, Glob`, no
`WebFetch`, no `WebSearch`. That's fine for a project documenting its own
vendored code. It's a hard blocker for any project whose claims are
*primarily external*, a hardware setup guide, a wrapper/integration guide,
anything documenting a vendor's behavior rather than an in-repo API. The
consuming repo hit this concretely: every claim worth checking routes to
`external-verification.md` (PR #13's own addition), but that method is only
reachable through `/docs-assist:verify`'s opt-in external-claim mode, not
through `/docs-assist:audit`'s fan-out, and the fan-out agent is
structurally unable to run it regardless. An earlier session in the same
repo independently hit the same wall and worked around it with four ad hoc
full-tool-access forks instead of the plugin's own audit path.

**Suggested fix:** either grant `doc-auditor` `WebFetch`/`WebSearch`
conditionally (a `.docs-assist/config.yml` flag, or a heuristic like "few or
no source files outside `docs_dir`"), or add an explicit external-claim
fan-out mode to `/docs-assist:audit` itself, so a full audit of this shape
of project gets its highest-value check by default instead of requiring the
operator to already know to ask `/docs-assist:verify` for it separately.

**Assessment:** medium-high value (affects every "docs about something we
don't vendor" project, a large fraction of real-world docs, not a corner
case), medium effort (mostly a tool-grant and a routing decision; the
verification method itself already exists from PR #13).

### 2.3 `sme-attested` frontmatter has a documented opt-out, but no durable fallback location

Not a plugin bug, `frontmatter-spec.md` already anticipates a project
declining `sme-attested` frontmatter ("when declined, the attested-claims
list lives in the review notes instead"). But "review notes" has no
specified durable home, and the entire point of that ledger (surviving past
one sitting) is lost if it only lives in a chat transcript. The consuming
repo's own fix, a plain `.docs-assist/claims/open-questions.md` file, one
entry per claim in the same shape frontmatter would use (section, claim,
source, date), same shrink-to-empty discipline, is a reasonable default
convention worth naming in the plugin itself rather than reinventing per
project.

**Assessment:** low effort, closes a real gap for any project with a
documented policy against `sme-attested` frontmatter (not rare, anything
without vendored code has no natural home for it).

### 2.4 No documented way for a project to say "hold the finishing gate, ask me"

`skills/docs-assist/SKILL.md`'s "Batch Confirmations" step re-runs linters
and confirms zero issues before closing out any workflow that edited docs.
Right default. Wrong for a project where the closing step is expensive
enough (here: bidirectional drift verification across an 11-file bundle)
that it should be a deliberate, human-initiated final stage, not run
automatically at the end of every pass. There's currently no config surface
for this. The consuming repo's stopgap: a `finish_gate: prompt` field on
`.docs-assist/config.yml` that any workflow checks before its own
close-out step, asking instead of running, and, per the 2026-08-28 update
to the same finding, this might be sharper as a distinct, explicitly-named
command (a `/docs-assist:merge-prep` or similar) that a project invokes
deliberately, rather than a question tacked onto whatever workflow happens
to be running.

**Assessment:** low-medium effort, and it composes directly with 2.1, the
`llms-full.txt` generator's own trigger question ("regenerate now?") is the
concrete first user of this gate.

## 3. Track 1: reader-language coverage and "say the thing nobody else says", unstarted

`drafts-research/docs-assist-plugin-kickoff.md` frames PR #13's content as
"Track 2" of a two-track plan and explicitly marks **Track 1 as still
unstarted** as of 2026-08-28. Track 1 is arguably the more central item to
the "help an SME get their info out to users" mission than Track 2's
AI-legibility mechanics, because it's aimed squarely at the human reader:

- **1.1, Coverage and phrasing from real reader language.**
  `reference/ia-methodology.md` already gestures at this ("Validate With
  Real Users" says to feed analytics/support-ticket findings back into
  design, without defining how) and stops short. The proposal: when a
  project has *any* source of real reader language (support tickets,
  GitHub issues, forum threads, explicitly not assuming a citation export
  or search-console access, which most projects won't have), extract the
  actual phrasings people use, check whether doc headings match that
  phrasing or only the author's own mental model, and flag topics with
  real repeated demand and thin/absent coverage as a genuine content gap.
  Concrete example from the source research: a troubleshooting page scored
  well with both humans and AI retrieval by accident, because its headings
  happened to be literal error strings, "write the heading a frustrated
  person would type" is the generalizable lesson.
- **1.2, Negative results as their own finding category.** The
  highest-value paragraph found in the source research was a plain
  statement that something cannot be done, with the mechanism explained,
  on a page where competing sources confidently claimed otherwise. This is
  underproduced everywhere because "here's how" is more comfortable to
  write than "here's why you can't", even when the second is what the
  reader needs. Proposal: `/docs-assist:draft` and `/docs-assist:audit`
  should explicitly ask "does this doc set contain any hard limits,
  known-impossible cases, or 'looks like it should work and doesn't'
  content?" as its own finding category, not folded into generic coverage
  gaps.
- **1.3, Frame verification metadata for the human first.** Once Track
  2's verification badges exist, the human-facing copy in
  `/docs-assist:draft` and `/docs-assist:verify` should lead with "so your
  reader knows whether to trust this," not "so an AI tool can adjudicate
  this." Both are true; only the first motivates a solo writer to bother.
  This is a copy/framing fix, not new mechanics, cheap, and time-sensitive
  relative to whenever PR #13 merges (it names its own dependency: "as soon
  as A ships, while it's still fresh what the feature actually does").

**Assessment:** 1.1 is the highest-effort item in this whole report (real
NLP-adjacent work: extracting phrasings, matching against headings) but
plausibly the highest-value one too, since it's the one item here aimed
directly at whether an SME's docs reach the readers who need them, not at
metadata hygiene. 1.2 and 1.3 are both small, well-specified, and shippable
independent of 1.1.

## Prioritized recommendation

1. **Decide PR #13.** It's been open since July, unvalidated-against-a-second-project
   was its own stated caveat, and that validation has since happened
   (section 2) and surfaced fixes worth folding in before merge, not after.
   Low risk either way, nothing in it gates a build.
2. **Ship the `llms-full.txt` generator** (2.1). The spec is already
   written and verified byte-for-byte against a real file; this is
   packaging existing work, not designing new work, and it fixes a bug
   class (silent content duplication/corruption) that's already bitten
   twice.
3. **Grant `doc-auditor` external-claim reach** (2.2), paired with PR #13's
   `external-verification.md` once merged. Without it, external-claim
   verification exists in the plugin but isn't reachable from the audit
   path that would normally trigger it for the project shape that needs it
   most.
4. **Track 1.2** (negative-result findings) as a small, self-contained
   addition to `/docs-assist:draft` and `/docs-assist:audit`, no
   dependency on anything else in this list.
5. **Name the `open-questions.md` convention and a `finish_gate` config
   field** (2.3, 2.4), both small, both close gaps the plugin's own docs
   already half-anticipate.
6. **Track 1.1** (reader-language coverage) as a larger, separately-scoped
   effort once the above are settled, it's the biggest lift here and
   deserves its own design pass rather than being folded into a release
   already carrying five other changes.
7. **Delete the ten stale local branches** identified in "Method" above, to
   keep `git branch -a` reflecting real in-flight work.

## Sources

- This repo: `git branch -a`, `git log main..<branch>`, `git diff
  main..<branch> --stat`, `CHANGELOG.md`, `gh pr list` / `gh pr view 13`.
- `drafts-research/docs-assist-plugin-kickoff.md`,
  `drafts-research/docs-assist-plugin-plan.md`,
  `drafts-research/pi-hole-ai-provenance-study.md`, `drafts-research/blog-ideas.md`.
- `edwardangert.github.io/.docs-assist/reports/docs-assist-improvement-plan-2026-08-26.md`,
  `edwardangert.github.io/.docs-assist/reports/llms-generation-plan.md`.
