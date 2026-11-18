#!/usr/bin/env bash
# The code's default timeout changed on this branch; the docs still say the
# old value. Nothing in the prompt mentions notes, a journal, or a PR.
set -euo pipefail
git init -q -b main
c() { git -c user.email=eval@example.invalid -c user.name=eval commit -qm "$1"; }
mkdir -p src docs
cat > src/client.js <<'JS'
export const DEFAULT_TIMEOUT_MS = 5000;
JS
cat > docs/connect.md <<'MD'
# Connect to the service

The client waits 5000 milliseconds before giving up.
MD
git add -A && c "Initial client and docs"
git checkout -q -b longer-timeout
cat > src/client.js <<'JS'
export const DEFAULT_TIMEOUT_MS = 8000;
JS
git add -A && c "Raise the default timeout"
