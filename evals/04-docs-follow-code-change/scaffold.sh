#!/usr/bin/env bash
# The default timeout moves from 5000 ms to 8000 ms in the last commit.
# Three places state the old value: two in milliseconds, one as "5 seconds",
# which a search for "5000" misses. The retry count of 3 is unrelated and
# must survive untouched.
set -euo pipefail
git init -q -b main
c() { git -c user.email=eval@example.invalid -c user.name=eval commit -qm "$1"; }
mkdir -p src docs

cat > src/client.js <<'JS'
export const DEFAULT_TIMEOUT_MS = 5000;
export const RETRIES = 3;
export function connect(url, { timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  return { url, timeoutMs, retries: RETRIES };
}
JS
cat > README.md <<'MD'
# Example client

Connects with a 5000 ms timeout and retries 3 times.
See [Connect](docs/connect.md) and [Troubleshooting](docs/troubleshooting.md).
MD
cat > docs/connect.md <<'MD'
# Connect to the service

`connect(url)` uses a default timeout of 5000 milliseconds.
Pass `{ timeoutMs }` to change it.
MD
cat > docs/troubleshooting.md <<'MD'
# Troubleshooting

## Requests time out

A request that gets no response within 5 seconds fails with a timeout error.
The client retries 3 times before giving up.
MD
git add -A && c "Initial client and docs"

sed -i.bak 's/DEFAULT_TIMEOUT_MS = 5000/DEFAULT_TIMEOUT_MS = 8000/' src/client.js && rm src/client.js.bak
git add -A && c "Raise the default timeout to 8000 ms"
