# External verification

`claim-verification.md` traces a doc's claims to the code: does the flag exist, does the config key still default to what the doc says.
That method has no reach into a claim about something outside the repo: a vendor's API behavior, a third party's protocol, a described limitation of a system the project does not control.

Those claims dominate any docs set that integrates with, wraps, or explains something outside itself.
For a docs set about hardware, a vendor, or a service the project does not vendor, they are nearly all of the claims worth checking.

The authority chair uses this method whenever its brief grants web access.
It also backs `/docs-assist:verify`'s external-claim mode.

## When a claim names a specific thing, search its general form too

When a claim names a specific product, brand, or implementation, ask whether it sits on top of a more general technology, protocol, or class of thing, and search that too.
Not instead of the specific search: alongside it.

1. A brand and its generic name (a drug's brand name and its generic compound).
1. A product and the protocol it implements (a mesh-networking tool and the tunneling protocol underneath it).
1. A specific device or platform and its general category, when the claim is really about the category. A claim about one TV model's DNS behavior is often a claim about how smart TVs handle DNS generally.

Run both.
Do not drop the specific search: plenty of claims are genuinely implementation-specific, and a generic-only search misses vendor quirks that only appear in the specific product's own documentation or community.
A result at the general level is informative even when the specific product was never named, and it is not dispositive on its own.

This is judgment, not a lookup.
Recognizing that a claim has a useful general form takes reading the claim rather than pattern-matching a keyword, and plenty of claims have no broader form worth searching.
Treat it as a search you should think to run, not a step a script can perform for you.

## Exclude the doc set under verification from its own results

**Always on.** Not a mode, not an option, and not something to remember.

A well-ranking doc can be returned by its own search and quoted back as though it were independent corroboration of itself.
This gets *more* likely as the doc set's search ranking improves, not less, so it is exactly the case where the guard matters most and is easiest to skip, because the doc looks credible.

Treat any result whose URL matches the repo, site, or project under verification as disqualified, not as a confirming source.

Name the rule when you apply it.
A habit that is never stated is a habit that lapses silently, and this one has already produced a real false confirmation: an AI search summary claimed a blocklist project's repository had vanished, sourced from a blend that included the doc set's own well-ranking content.

## Recording the result

Every claim checked gets one of three outcomes, and all three are legitimate.
A pass is not the only acceptable one.

1. **Confirmed.** An independent source supports the claim. Record the source link and the date you accessed it.
1. **Contradicted.** An independent source disagrees. Report it as a finding. Never silently correct the doc without surfacing what changed and why: a wrong claim and a stale claim look identical, and the difference matters to whoever wrote it.
1. **No independent source found.** Say so directly rather than leaving the claim unmarked or implying it passed.

That third outcome is the one a human author never remembers to write down by hand, and it is often the most useful of the three.

Results go to `.docs-assist/state/docs.yml`, against the document.
A contradicted or unverifiable claim is not a verification date; it is a finding, and in a loop run it belongs in the ledger review or `questions.md`.

## What this cannot settle

An external source can be wrong, out of date, or itself downstream of the doc under review.

When the only corroboration is a forum post of unknown age, or a summary with no primary source behind it, the honest outcome is "no independent source found."
Confidence that comes from a search result's ranking rather than its provenance is the failure this whole method exists to prevent.
