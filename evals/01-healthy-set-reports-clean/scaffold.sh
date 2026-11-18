#!/usr/bin/env bash
# A small documentation set that is genuinely healthy: two pages, consistent
# example values, each linking to the other, every claim backed by the code
# beside it. The case asks whether an audit says so, or invents findings to
# fill its report.
set -euo pipefail
git init -q -b main
mkdir -p docs src

# A README, so the set has a real entry point. Without one, "no entry point" is
# a legitimate finding and the case would punish the audit for being right.
cat > README.md <<'EOF'
# Example client

A tiny client library.
Start with [Connect to the service](docs/quickstart.md).
EOF

cat > src/client.js <<'EOF'
export const DEFAULT_TIMEOUT_MS = 5000;
export function connect(url, { timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  return { url, timeoutMs };
}
EOF

cat > docs/quickstart.md <<'EOF'
# Connect to the service

Create a client for the service.
`connect` returns a client object holding the URL and its timeout.

```js
import { connect } from './src/client.js';

const client = connect('https://api.example.com');
```

The client gets a default timeout of 5000 milliseconds.
To change it, see [Configure the timeout](configure-timeout.md).
EOF

cat > docs/configure-timeout.md <<'EOF'
# Configure the timeout

The default timeout is 5000 milliseconds.
Pass `timeoutMs` to override it.

```js
import { connect } from './src/client.js';

const client = connect('https://api.example.com', { timeoutMs: 10000 });
```

To get started, see [Connect to the service](quickstart.md).
EOF

git add -A
git -c user.email=eval@example.invalid -c user.name=eval commit -qm "Initial client and docs"
