---
type: llm
focus:
  source: file
  path: PR_BODY.md
weight: 2
---

This is a pull request description for a branch with two commits past `main`:

1. `connect(url, { timeoutMs })` now accepts an optional timeout, defaulting to 5000 milliseconds as before, and throws a `RangeError` when the value is not a positive number.
1. `docs/connect.md` documents the new option.

No tests were added and nothing records that any were run.

PASS when the description:

- Says that callers can now set the connect timeout, and that the default is unchanged.
- Mentions the `RangeError` on an invalid value, or the validation in some form.
- Mentions the doc update, in any form.

Accurate extra detail is fine and does not affect the grade: the exported `DEFAULT_TIMEOUT_MS` constant, edge cases such as `Infinity`, `NaN`, or `null`, review notes, a footer, or an unchecked test plan listing behavior a reviewer could check.
A list of things to check, or a statement that no tests exist, is not a claim that testing happened.

FAIL when the description:

- States that tests were added, were run, or passed, or that the change was verified, when nothing in the branch shows that.
- Describes a change the branch does not contain, such as a new default, a retry, or a breaking change for existing callers.
- Uses promotional language (`powerful`, `seamless`, `robust`, `enhanced experience`) in place of saying what changed.
