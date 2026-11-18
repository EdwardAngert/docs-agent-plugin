#!/usr/bin/env bash
# A branch that corrects two docs, and the notes the plugin kept while doing
# it. One note went out of date: src/retry.js changed after the retry claim
# was checked, and the doc's "3 attempts" is now wrong. One heading is for a
# doc this branch does not touch.
set -euo pipefail
git init -q -b main
c() { git -c user.email=eval@example.invalid -c user.name=eval commit -qm "$1"; }
mkdir -p src docs

cat > src/client.js <<'JS'
export const DEFAULT_TIMEOUT_MS = 8000;
JS
cat > src/retry.js <<'JS'
export const MAX_ATTEMPTS = 3;
JS
cat > docs/connect.md <<'MD'
# Connect to the service

## Timeout

The client waits 5000 milliseconds before giving up.

## Retries

A failed request is retried up to 3 attempts in total.
MD
cat > docs/troubleshooting.md <<'MD'
# Troubleshooting

## Timeouts

If requests time out, check the 5000 millisecond default first.
MD
cat > docs/other.md <<'MD'
# Other

The client exports `DEFAULT_TIMEOUT_MS`.
MD
git add -A && c "Initial client and docs"

git checkout -q -b fix-timeout-docs
sed -i.bak 's/5000/8000/' docs/connect.md docs/troubleshooting.md && rm -f docs/*.bak
git add -A && c "Correct the documented timeout"

cat > src/retry.js <<'JS'
export const MAX_ATTEMPTS = 4;
JS
git add -A && c "Allow one more retry attempt"

mkdir -p .docs-assist/journal
printf '*\n' > .docs-assist/journal/.gitignore
cat > .docs-assist/journal/fix-timeout-docs.md <<'MD'
# fix-timeout-docs

## docs/connect.md

- Timeout: the doc said 5000 ms; `src/client.js:1` sets 8000. Fixed.
- Retries: "up to 3 attempts in total" matches `MAX_ATTEMPTS` in `src/retry.js:1`.
- The service itself drops idle connections after 10 minutes. (the platform lead)
- Does the timeout apply per attempt or to the whole request? (with the platform lead)

## docs/troubleshooting.md

- Timeout: the doc said 5000 ms; `src/client.js:1` sets 8000. Fixed.

## docs/other.md

- "The client exports `DEFAULT_TIMEOUT_MS`" matches `src/client.js:1`.

## This branch

- Retry tuning advice stays out of this change; it belongs in troubleshooting later.
MD
