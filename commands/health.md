---
description: "One-command docs health check: coverage, freshness, consistency, and findability, with a scorecard and the single highest-leverage fix"
argument-hint: [docs directory]
---

# Check Documentation Health

Give the contributor a fast, honest read on the state of their documentation, and one clear place to start.

This is the orientation command: the first thing to run after installing the plugin, and the periodic pulse check afterward.
It is not the deep audit.
Health is fast and whole-repo, ends in a scorecard and a single recommendation, and should feel like a knowledgeable colleague skimming the docs and telling you what they'd fix first.
`/docs-assist:audit` is the follow-up when someone wants the full findings list.

The optional argument (`$ARGUMENTS`) is the docs directory. Detect it if not given.

## Process

### 1. Establish What the Project Is

Speed matters more than completeness here. Sample; do not read everything.

- Read the README and manifest to learn what the project does and who uses it.
- For a large repo, fan out the `doc-recon` subagent and work from its project map instead of reading inline.
- Resolve `.docs-assist/` config if present (`${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/config-resolution.md`).

### 2. Score Four Dimensions

Assess each dimension from samples and cheap signals, not an exhaustive pass. Rate each **solid**, **needs work**, or **missing**, with one line of evidence.

- **Coverage**: does a doc exist for each thing users need? Compare the project's main features and entry points against the docs that exist. A missing README, quickstart, or install doc outweighs any number of polish issues.
- **Freshness**: are the docs still true? Compare doc modification dates and `last-verified` frontmatter against the churn of the code they describe. A doc describing a heavily-changed area, untouched since, is the signal.
- **Consistency**: do the docs agree with each other? Spot-check example values against each other and `.docs-assist/example-variables.txt`, terms against `.docs-assist/terms.txt` (see `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/terminology.md`), and heading and frontmatter conventions across sibling docs.
- **Findability**: can a reader (or an AI tool) get to the right doc? Check for an `llms.txt` and whether it matches the docs, cross-references between related docs, and orphan docs nothing links to.

With no committed config, the standard is the set's own internal consistency, per the skill's cold-invocation default.

### 3. Deliver the Scorecard

Keep it small enough to read in thirty seconds:

```markdown
## Docs Health: <repo name>

| Dimension   | Rating     | Why                                            |
| ----------- | ---------- | ---------------------------------------------- |
| Coverage    | needs work | No quickstart; 3 of 5 core features undocumented |
| Freshness   | solid      | Docs track recent code changes                 |
| Consistency | needs work | Two API base URLs used across examples         |
| Findability | missing    | No llms.txt, no cross-references               |

**Start here**: <the single highest-leverage fix, and why it beats the others>
```

### 4. Offer to Fix the First Thing Now

End with an offer, not homework. Match the offer to the finding:

- Coverage gap: offer to draft the missing doc now (`/docs-assist:draft` flow).
- Freshness gap: offer to run the update pass against recent changes (`/docs-assist:update`).
- Consistency gap: offer `/docs-assist:init` to record the conventions, and the fix pass to apply them.
- Findability gap: offer to generate or repair `llms.txt` and the missing cross-references.
- Broad problems across dimensions: recommend the full `/docs-assist:audit` and offer to run it.

One offer, sized to ship in this session. Getting the first fix out the door is the point; the rest belongs in the next pulse check or the full audit.

## Notes

- Be honest and proportional. A healthy docs set gets told it is healthy; do not invent findings to justify the command.
- Prefer evidence over vibes: name the file, the feature, or the drifted value behind every rating.
- A repo with no docs at all is not a failing grade; it is a starting point. Say so, and lead with the first doc to write (usually the README), which is `/docs-assist:plan` territory.
- This command reports and recommends. It edits nothing until the contributor accepts an offer.
