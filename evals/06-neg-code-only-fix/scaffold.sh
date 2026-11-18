#!/usr/bin/env bash
set -euo pipefail
git init -q -b main
mkdir -p src
cat > src/range.js <<'JS'
// Inclusive range of integers from start to end.
export function range(start, end) {
  const out = [];
  for (let i = start; i < end; i++) out.push(i);
  return out;
}
JS
cat > README.md <<'MD'
# Utilities

Small helpers. Nothing documented yet.
MD
git add -A
git -c user.email=eval@example.invalid -c user.name=eval commit -qm "Add range"
