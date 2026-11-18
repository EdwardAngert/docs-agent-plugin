#!/usr/bin/env bash
# A small client whose retry behavior has four specific, checkable facts:
# 4 attempts in total, a 200 ms base delay that doubles, a 5 s cap, and
# retrying only on 429 and 5xx. A doc that gets any of them wrong, or adds a
# fifth that is not in the code, fails.
set -euo pipefail
# The workspace's own repository, so git commands here never reach the
# sandbox's stub repository one directory up.
git init -q
mkdir -p src docs

cat > README.md <<'MD'
# Example client

A tiny HTTP client.
MD

cat > src/retry.js <<'JS'
// Retry policy for outgoing requests.
export const MAX_ATTEMPTS = 4;          // the first try plus three retries
export const BASE_DELAY_MS = 200;
export const MAX_DELAY_MS = 5000;

export function shouldRetry(status) {
  return status === 429 || (status >= 500 && status <= 599);
}

export function delayFor(attempt) {
  // attempt is 1 for the first retry
  return Math.min(BASE_DELAY_MS * 2 ** (attempt - 1), MAX_DELAY_MS);
}
JS

cat > src/client.js <<'JS'
import { MAX_ATTEMPTS, shouldRetry, delayFor } from './retry.js';

export async function request(url, options = {}) {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, options);
    if (!shouldRetry(res.status) || attempt === MAX_ATTEMPTS) return res;
    await new Promise((r) => setTimeout(r, delayFor(attempt)));
  }
}
JS

git add -A
git -c user.email=eval@example.invalid -c user.name=eval commit -qm "Initial client"
