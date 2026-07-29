# Section Verification

`last-verified` (`frontmatter-spec.md`) says something on a page was checked, once, at the page level, and it lives in frontmatter, so it never reaches the rendered page a retriever fetches. Most docs need nothing more than that. This file covers the narrower case: a page whose sections decay at genuinely different rates, where one page-level date either overstates the stale parts or understates the fresh ones, and where the claim needs to survive to the rendered HTML, not just the source file.

## When a Doc Earns Section Markers

Not every doc, and not by default. Per-section tagging is authoring ceremony, and on a page that decays roughly evenly, it doesn't pay for itself — the page-level date already tells the whole story.

Section markers earn their place on a page that mixes:

- A stable, structural section (a core workflow, an architectural explanation) next to a section making claims about a third-party system, a specific vendor, or anything outside the project's own control.
- A section pinned to a version or a value likely to change on its own schedule, next to sections that aren't.
- A section whose subject is a level removed from the rest of the page's main topic (a page about configuring a tool that has one section on integrating with an external service).

**Detect the shape, then prompt; don't mandate it up front.** During drafting or audit, when a page shows this kind of mix, ask whether the author wants section-level markers on the sections that stand apart, rather than defaulting every project into per-section tagging. A page with no such signal gets the page-level date and nothing else. This is deliberately the opposite of a blanket convention: the site this pattern was generalized from earned its section badges by being one page mixing a stable core workflow with a table of rot-prone, vendor-specific claims, and that shape does not describe most doc sets or even most pages within one.

## The Marker

A single visible line immediately after the heading it describes, in a fixed, greppable, plain-text shape:

```markdown
### Configuring the retry queue

**Verified 2026-07.**
```

Plain bold text, not an HTML comment and not a code comment. An HTML comment survives to the raw HTML but is routinely stripped by the text-extraction and readability passes many ingestion pipelines apply before an LLM ever sees a page; a comment fails the one property that makes this marker worth adding, which is that it arrives in the same fetch, at the same position, as the claim it qualifies. Visible text is the only form guaranteed to survive every downstream step between the source file and a retriever, on every SSG Docs Assist supports.

**Month precision (`YYYY-MM`), not day.** Most of the evidence backing a claim like this can't support a day-level date, and writing one anyway invents precision the evidence doesn't have. Accept a full `YYYY-MM-DD` if an author writes one and truncate it rather than rejecting it; the point is normalizing what gets rendered, not policing what gets typed.

**Date-only by default. No method label.** Read against a project's own docs, "Verified 2026-07" already implies "we verified it" — a method tag there reads as confusing overhead, not information. Don't add one unprompted.

A method is worth offering only where a project's own docs already carry genuine provenance ambiguity: a community-maintained set aggregating claims from outside contributors, or a page whose claims are sourced from multiple outside vendors rather than the project's own testing. Even then, it's free text the project chooses for itself (`from vendor docs`, `community-reported`, whatever fits how that project already talks about its sources), never a fixed vocabulary the plugin imposes. If a project wants one, it goes after the date in the same line:

```markdown
**Verified 2026-07 — confirmed against the vendor's own API docs.**
```

## Component Form

Where the target SSG supports MDX or an equivalent component system (Astro, Docusaurus MDX), a small component can render the same information with more visual weight than bold text — offered by `/docs-assist:setup-site` or `/docs-assist:agent-ready` as an enhancement, never a requirement. Same contract as the plain-text form: date-only by default, same optional free-text method field, and it must degrade to the plain-text marker (or fail the doc's build cleanly) rather than becoming a silent dependency every contributor has to know about. Nothing in this convention requires a component; Jekyll, Hugo, MkDocs, and non-MDX Astro or Docusaurus projects get the plain-text form and lose nothing structurally by it.

## Extraction and Staleness

A standalone script, not a build hook — Docs Assist can't assume access to an arbitrary target repo's build pipeline. `assets/ci/section-verification.mjs` regexes the plain-text marker (and the component form's props, where used) out of markdown/MDX source and reports a section-level index per doc. `docs-decay.mjs` reads that index for any doc that has one, ranking by the doc's stalest section instead of a single page-level number; a doc with no markers falls back to `last-verified` exactly as it does today. This is strictly additive — a repo that never adopts section markers sees no change in behavior.

The staleness threshold stays the same flat default `docs-decay.mjs` already applies to page-level dates. It only tiers by method where a project has opted into the free-text method field, and even then the tiering is a per-project convention, not something the plugin infers unprompted from what an author typed in that field.

## What Not To Do

- Don't derive a marker's date from git history. A commit is not a verification of anything.
- Don't roll section dates up into a page-level `last-verified`. Taking the oldest looks like the honest choice and backfires: a page whose load-bearing claim was checked this morning ends up advertising itself as however old its stalest, least-important section is, which erases the exact signal this convention exists to provide. `frontmatter-spec.md` states this rule for `last-verified` directly; it's restated here because it's the mistake most likely to seem obviously correct.
- Don't fail a build or a CI check on a stale or missing marker. This feeds `docs-decay.mjs`'s ranking; it never gates anything.
- Don't invent a date, or a method, that the evidence doesn't support. An absent marker, flagged for the author, is always better than a fabricated one that reads as confident.
- Don't add section markers to every page in a set just because one page in it earned them. Each page's case is its own; a set with one heterogeneous page and nine uniform ones should end up with one marked page.
