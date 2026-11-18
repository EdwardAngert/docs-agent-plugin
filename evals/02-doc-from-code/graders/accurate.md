---
type: llm
focus: trace
weight: 2
---

Find the markdown file the agent wrote under `docs/` in the trace, and grade its final content against these facts from `src/retry.js` and `src/client.js`:

- A request is tried at most 4 times in total: the first try plus up to three retries.
- The first retry waits 200 milliseconds, and each later retry doubles the wait.
- No wait exceeds 5000 milliseconds (5 seconds).
- Only HTTP 429 and 5xx responses are retried; any other response is returned at once.

PASS when the doc states the retry behavior and every number it gives matches the facts above.
A doc may leave out the 5-second cap and still pass, because with four attempts the cap is never reached.

FAIL when any of these is true:

- It gives a wrong number of attempts or retries, a wrong delay, or a wrong set of retried statuses.
- It describes behavior the code does not have: jitter, a configurable retry count, retrying on network errors or timeouts, a `Retry-After` header, or per-request overrides.
- No doc was written.
