# External Verification

`claim-verification.md` traces a doc's claims to the code: does the flag exist, does the config key still default to what the doc says. That method has no reach into a claim about something outside the repo — a vendor's API behavior, a third party's protocol, a described limitation of a system the project doesn't control. Those claims dominate any docs set that integrates with, wraps, or explains something outside itself, and nothing checks them by default. This file covers how to check them when `/docs-assist:verify`'s external-claim mode is invoked (opt-in, off by default; see `verify.md`).

## When a Claim Names a Specific Thing, Search Its General Form Too

When a claim names a specific product, brand, or implementation, ask whether it sits on top of a more general technology, protocol, or class of thing, and search that too — not instead of the specific search, alongside it.

- A brand and its generic name (a drug's brand name and its generic compound).
- A product and the protocol it implements (a mesh-networking tool and the tunneling protocol underneath it).
- A specific device or platform and its general category, when the claim is really about the category (a claim about one TV model's DNS behavior is often a claim about how smart TVs handle DNS generally).

Run both searches. Don't drop the specific one: plenty of claims are genuinely implementation-specific, and a generic-only search misses vendor quirks that only show up in the specific product's own documentation or community. A negative or positive result at the general level is still informative even when the specific product was never named in a source — it just isn't dispositive on its own.

This is judgment, not a mechanical lookup. Recognizing that a claim has a useful general form takes reading the claim, not pattern-matching a keyword; some claims genuinely have no broader form worth searching; treat this as a search you should think to run, not a step a script can perform for you.

## Exclude the Doc Set Under Verification From Its Own Results

Always, regardless of which form is searched. A well-ranking doc can be returned by its own search and quoted back as if it were independent corroboration of itself — this gets *more* likely as the doc set's own search ranking improves, not less, so it is exactly the case where the guard matters most and is easiest to skip because the doc looks credible. Treat any result whose URL matches the repo, site, or project under verification as disqualified, not as a confirming source.

## Recording the Result

Every claim checked gets one of three outcomes, and all three are legitimate — a pass isn't the only acceptable one:

- **Confirmed**: an independent source (general or specific form, excluding self-citation) supports the claim. Record a date, the source link, and its access date.
- **Contradicted**: an independent source disagrees. Report it as a finding; don't silently correct the doc without surfacing what changed and why.
- **No independent source found**: say so directly rather than leaving the claim unmarked or implying it passed. This is the default-honest outcome a doc's author should not have to remember to write down by hand.

None of these is a page-level `last-verified` bump. Record the result the way `section-verification.md` describes, on the specific claim or section it applies to.
