#!/usr/bin/env bash
# Three pages with two real problems a careful look finds: a link to a page
# that was renamed, and a port that disagrees between two pages and the code.
# Everything else is fine.
set -euo pipefail
git init -q -b main
mkdir -p src docs

cat > src/server.js <<'JS'
import { createServer } from 'node:http';
export const PORT = 8080;
createServer((req, res) => res.end('ok')).listen(PORT);
JS
cat > package.json <<'JSON'
{ "name": "example-server", "private": true, "type": "module", "scripts": { "start": "node src/server.js" } }
JSON
cat > README.md <<'MD'
# Example server

Start with [Install](docs/install.md), then [Configure](docs/configure.md).
MD
cat > docs/install.md <<'MD'
# Install

Run `npm install`, then `npm start`.
The server listens on port 8080.
Next, see [Configure the server](configuration.md).
MD
cat > docs/configure.md <<'MD'
# Configure

The server listens on port 3000 by default.
MD
git add -A
git -c user.email=eval@example.invalid -c user.name=eval commit -qm "Initial server and docs"
