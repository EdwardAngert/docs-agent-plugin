---
doc-slug: how-the-loop-works
pass: 0
chair: continuity
updated: 2026-09-16
---

# Continuity Pass 0: `docs/how-the-loop-works.md`

## Substitutions Applied

None.

I edited nothing in `packet.md`.

Every path, filename, command, and artifact name the packet declares resolves and matches how the published set and the repo already spell it.
Checked by existence: `agents/chair-authority.md`, `agents/chair-advocate.md`, `agents/chair-continuity.md`, `agents/cold-reader.md`, `commands/draft.md`, `assets/ci/example-continuity.mjs`, `.docs-assist/state/docs.yml` (which does carry an `attested:` key), `.docs-assist/personas/authority.md`, `.docs-assist/loop/<doc-slug>/`, and every `skills/docs-assist/reference/` file the provenance table cites.
Checked against the registry: `.docs-assist/reference.yml` has four `term` entries, and the packet complies with all of them. It writes "subagent" closed (entities 1, claims 97 and 99 to 102, causal chain 15), "content type" as two words (relationships 9, boundaries 2 and 10), and never uses a listed variant.

The packet's relative-path convention is deliberate, not drift: entity 6 establishes `.docs-assist/loop/<doc-slug>/` once, and entities 7 through 11 name `substitutions.md`, `draft.md`, `ledger.md`, `review.md`, and `questions.md` relative to it. I left that alone.

## The Journey This Page Joins

Where it sits: the published set is `README.md` plus `docs/*.md`. The index is the **Documentation** section of `README.md` (lines 90 to 92), which currently lists exactly three pages: the standards doc for docs leads, the contributor guide, and the command reference.

What a reader arrives already having been told, and by which page:

| Already told                                                                                                         | By                                                 |
| -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Drafting is split across "three isolated reviewers," glossed one by one, and the assumption list is what you review    | `README.md:167`                                     |
| The plugin proposes and you accept; nothing is written without review                                                  | `README.md:40`, `docs/write-docs-with-docs-assist.md:163` |
| Working artifacts of a drafting run live in `.docs-assist/`                                                            | `README.md:42`                                      |
| `/docs-assist:draft` writes "through the authoring loop"                                                               | `docs/command-reference.md:26`                       |
| `/docs-assist:draft` opens by asking you to dump what you know, then reflects it back                                  | `docs/command-reference.md:41-44`, `docs/write-docs-with-docs-assist.md:105-118` |
| `/docs-assist:merge-prep` is the ask-for-it gate for everything that scales with the whole set                         | `README.md:184`, `docs/command-reference.md:139-147` |
| The plugin's claims carry an asterisk: structure is not behavior, and only parts have been exercised                   | `README.md:288`                                     |
| The full three-chair vocabulary, in maintainer register and future tense                                               | `docs/1.0-release-plan.md:29-39`                     |

What the reader has **not** been told anywhere in the published set: "packet," "ledger," "pass 0," "cast," or "chair" in any prose addressed to a contributor. See the vocabulary section for where I looked.

## Vocabulary, Reconciled Against the Published Set

I searched `README.md` and all seven `docs/*.md` files for each of the packet's terms. `docs/reviews/` and `reports/` were excluded per the set definition.

**`chair`.** Present in the set, but never in contributor-facing prose. It occurs in `README.md` only inside the What's Inside file tree (lines 253, 257, 258, 263, 265), and in `docs/1.0-release-plan.md` (frontmatter `audience: maintainers`) throughout. The one place `README.md` explains the mechanism to a reader, line 167, calls them **"three isolated reviewers"** and glosses each by function. Those three glosses map one to one onto the packet's authority, continuity, and advocate. So the set has two names for the same thing, split by audience, and which one a contributor meets first is an unmade decision. Routed as Q1.

**`authoring loop`.** Present and already reader-facing: `docs/command-reference.md:26` says "through the authoring loop," with no further explanation anywhere. `README.md:257` and `docs/1.0-release-plan.md:29` both use the longer "three-chair authoring loop." The packet says only "the loop." Proposed binding in Q4.

**`packet`.** In `README.md` only as file-tree comments (lines 259 to 261, 266) and once at line 292 meaning something else entirely, an "intake packet" sent to an expert. That collision is worth knowing before the new page uses the bare word. Also in `docs/plan.md:45`, again meaning the intake questionnaire. The loop sense appears reader-side nowhere.

**`ledger`.** `README.md:261` file tree, `docs/1.0-release-plan.md:33` and `:68`, `:131`. Never in reader prose. `README.md:167` describes the thing without naming it: "declares every assumption it had to make."

**`pass 0`.** Only `docs/1.0-release-plan.md:165` and `:170`. Nowhere else in the set.

**`cast` / `casting`.** `README.md:258` file tree ("which chairs to seat, on two axes") and `docs/1.0-release-plan.md:35`.

**`door` versus `plumbing`.** I searched `packet.md` and the term is not in it. In the published set it appears once, `docs/1.0-release-plan.md:167`, where it is a rule for cutting the *command surface*, not a statement about the loop. Flagging so it is not imported into this page on the strength of the brief alone.

## Reuse

For the advocate chair. Link these rather than restate them.

1. **The three roles, already glossed for a non-maintainer.** `README.md:167`. One sentence that names all three by what they do, in the register this page needs. The new page is the deeper version of that sentence, so it should be the inbound link and should not be re-glossed differently.
1. **The compact statement of the loop and its real output.** `docs/1.0-release-plan.md:29-39`. The best existing prose in the set on what the three chairs are, how casting works, and that the output is the question list rather than the document. Caveat before linking: `audience: maintainers`, and it is written as a build plan in the future tense, so it reads as a promise rather than a description. Sending a contributor there is a shaping call.
1. **The two-agents-both-wrong guard.** `docs/1.0-release-plan.md:215`. Already states the citation requirement and the uncited-correction-becomes-a-question rule, matching packet claims 76, 77, and causal chain 14.
1. **What `/docs-assist:merge-prep` is.** `README.md:184` and `docs/command-reference.md:139-147`. Packet claim 93 and boundary 13 both lean on the preparation gate; the command reference already defines it, including the "nothing expensive runs without being asked" rationale.
1. **The "you review for accuracy, not style" contract.** `docs/write-docs-with-docs-assist.md:87-98`. This is the reader-facing half of packet misconception 4 ("the finished document is the output") and of the ledger's purpose. The new page can point at it instead of re-arguing what the reader reviews.
1. **The existing candor passage.** `README.md:283-296`. Already the set's place for what is unproven, and it is where a reader who follows the stance is expecting to find it.
1. **The registry's own definition**, for any mention of example values: `README.md:199` and `docs/set-up-documentation-standards-for-your-team.md:103`.

No worked example of a filled packet, ledger, or `questions.md` exists anywhere in the published set. I looked in `README.md`, all of `docs/*.md`, and `.docs-assist/loop/` (which holds two `packet.md` files and no other artifact). Whether this page needs one is a relation question and belongs to the advocate chair, not to me.

## Proposed Canonical Bindings

Proposed, not written. Every one of these depends on Q1, so binding them now would pre-empt the decision. I did not edit `.docs-assist/reference.yml`.

1. `authoring-loop`, kind `term`, canonical `authoring loop`, note that the first use on a page is "three-chair authoring loop."
1. `chair` or `reviewer`, kind `term`, canonical pending Q1, with the losing spelling listed as a variant so the set stops carrying both.
1. `packet`, kind `term`, canonical `packet`, note disambiguating it from the intake packet at `README.md:292` and `docs/plan.md:45`.
1. `ledger`, kind `term`, canonical `ledger`.

## Questions

Routed back. None applied as an edit.

**Q1. Does a contributor meet "chair" or "reviewer" first, and does `README.md:167` change?**
The published set names these three things twice, differently, split by audience: "three isolated reviewers" in the one reader-facing sentence (`README.md:167`), "chairs" in the file tree and in the maintainer-audience release plan. This page is contributor-facing, and its own working title is "how the loop works," so it is the page that settles it. Three options, and the choice is not mine: teach "chair" here and update `README.md:167` to match; keep "reviewer" for readers and confine "chair" to maintainer material, which means this page renames most of what the packet declares; or teach both, naming chairs as the term used in the repo's own files so a reader who opens `agents/` recognizes them. Whichever wins, the other spelling should become a registry variant.

**Q2. Does `/docs-assist:draft` still keep a running notes file?**
`docs/command-reference.md:44` tells readers that for a multi-sitting topic, draft "can offer to keep a running notes file so you can pick back up later." `docs/1.0-release-plan.md:165` says `.docs-assist/intake/notes/` is gone and everything lands in `packet.md`. Packet claim 91 says a human-filled packet and an emitted one are the same artifact, which reads as the replacement for that notes file. If so, the command reference is stale and this new page would be the first to contradict it. Behavior-affecting, so not substituted.

**Q3. Is the attested-claims ledger at `.docs-assist/state/docs.yml` still the route for SME-typed claims?**
Packet claim 71 says SME-experience claims route there. The key exists: `.docs-assist/state/docs.yml:15` has `attested:`. But `docs/1.0-release-plan.md:68` says the attested-claims fallback "is subsumed entirely" because `questions.md` is the durable ledger it was asking for, and that "no separate convention is needed." Both cannot be current. This is an authority-chair fact, and harmonizing it by picking one would be exactly the substitution my contract forbids.

**Q4. Confirm "authoring loop" as the canonical name, with "three-chair authoring loop" on first use.**
The packet says "the loop" throughout, which works inside a packet and not in a set where `docs/command-reference.md:26` already sends readers looking for "the authoring loop" and explains it nowhere. Naming is in my lane, but the full form contains "three-chair," so it is downstream of Q1 and I am not applying it.

**Q5. Where does the never-run-end-to-end fact sit on this page?**
Stance check, and the set is consistent so far: `README.md:288` is candid ("structure is not behavior... only parts of it have been exercised"), and the packet is candid in the same direction, at unknowns 1 through 12 and misconceptions 18 and 19. The difference is placement. `README.md` describes the mechanism at line 167 and defers the asterisk to line 288, a hundred and twenty lines below, under a separate heading. This page describes the mechanism at length and its packet carries twelve unknowns, so keeping the same deferred placement would leave a much larger unqualified stretch than `README.md` ever has. Where the qualification lands is a shaping call and belongs to the advocate chair; I am recording that the set's stance is candid-but-deferred so the choice is made knowingly rather than by default.

## What the Packet Does Well

Every provenance row carries a file and a line range, and every one of them resolves. The Unknowns section names twelve things that are not established, including the load-bearing one (the loop has never run end to end) and one scoped honestly to the reading that was done ("not established by the material read here," unknown 8). That is the hardest row to write and the one a set's credibility rests on.
