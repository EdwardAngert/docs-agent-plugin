---
type: llm
focus:
  source: file
  path: PR_BODY.md
weight: 2
---

This branch changes two docs, `docs/connect.md` and `docs/troubleshooting.md`, correcting a documented timeout from 5000 to 8000 milliseconds.
In `docs/connect.md`, a retry claim ("up to 3 attempts") was checked before `src/retry.js` changed to 4 attempts, so that check is stale.

PASS when the description has one collapsible section per changed doc, and:

- The `docs/connect.md` section reports the timeout correction, and does not list the retry claim as verified.
- The `docs/troubleshooting.md` section reports its timeout correction.
- No section covers a doc other than these two.

FAIL when a section lists the 3-attempt retry claim as verified or matching, or when a doc gets no section.
