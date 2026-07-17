# Code Examples

This is how Docs Assist writes code examples: safe, and consistent with the examples already in the docs.

Inconsistent examples are a quiet source of confusion. When one doc uses `api.example.com` and `sk_test_123` and the next uses `myapi.io` and `YOUR_KEY`, a reader copying across pages has to stop and translate. The fix is a shared set of example values that every doc reuses.

Load this whenever you add or improve code samples, from `/docs-assist:draft` or `/docs-assist:make-examples`.

## Reuse Before You Invent

Before you write a new example, look at what the docs already do.

- Search related docs for existing code samples, preferably ones on the same feature or flow. Match their variable names, paths, endpoints, and structure.
- Reuse a value that already appears rather than inventing a new one. The goal is that a reader moving between docs sees the same names throughout.
- Follow any example conventions the repo already has (a fixture project, a demo account, a standard region).

## Compose Across the Docs Set

Matching values is not the same as a working path. A reader who follows the quickstart, then the configuration guide, then the deployment guide should end up with one working deployment, not three disconnected snippets that each ran fine on their own. When a set of docs forms a journey (install, then configure, then deploy, then integrate), their examples are one running example, not independent illustrations, and should be written and checked that way.

- **Name the scenario once, reuse it everywhere.** If the quickstart creates a project called `demo-widgets` in `us-east-1`, every later doc in that journey uses `demo-widgets` in `us-east-1`, not a fresh, differently-named example that happens to look similar. A resource a later doc references should be a resource an earlier doc actually created.
- **Carry state forward deliberately.** A step that depends on a prior doc's output (a resource ID, a generated key, a config file's path) should say so and use the value that step actually produces, not a plausible-looking placeholder that silently diverges from it.
- **Verify the sequence, not just each doc.** `/docs-assist:verify` can run a journey's docs in one continuous workspace, in order, to prove the examples actually compose end to end; a single doc passing in isolation does not prove this. See "Verifying a Journey" in `verify.md`.
- **Flag it when a set doesn't compose.** If two docs in the same journey use different project names, regions, or resource IDs for what is supposed to be the same thing, that is a Critical audit finding: a reader following the docs in order hits a wall the individual docs never showed.

## The Reference Registry

`.docs-assist/reference.yml` holds the canonical placeholder values for the project, as `example-variable` entries, alongside terminology and other registered facts. Read it first, use its values, and keep it current. The full format, including the other entry kinds, is single-sourced in `reference-registry.md`; this section only covers what's specific to code samples.

- **Read it first.** If an entry exists, its value is authoritative. Use it in every sample.
- **Offer to create it.** If the registry does not exist and you are about to write samples, offer to create it, seeded with the values already used across the existing docs (so you adopt the current convention, not a new one). Scaffold from `${CLAUDE_PLUGIN_ROOT}/assets/config/reference.yml`.
- **Maintain it.** When a sample needs a placeholder the registry does not have, add it: pick a safe value, use it, and add the entry with a short note. The registry is the plugin's responsibility to keep in sync, not the contributor's.
- **Keep it in sync.** If a doc changes an example value, update the registry and the other docs that repeat it (this is the repeated-value edge in `impact-analysis.md`).

An audit checks this too: `/docs-assist:audit` flags code samples whose values drift from the registry or from each other.

## Keep Every Example Safe

Whether or not a registry exists, examples must be copy-paste safe. This means two different things depending on what the example does, and they call for opposite defaults.

**A setup or tutorial example should work exactly as written.** Copy-paste-and-run is the point (this is what makes "Compose Across the Docs Set" above possible at all).

- Use documentation IP ranges (`192.0.2.0/24`, `198.51.100.0/24`, `203.0.113.0/24`) and reserved example domains (`example.com`).
- Use clearly fake secrets that cannot work (`sk_test_EXAMPLE...`, `your-api-key`). Never a real-looking credential.

**A destructive, upgrade, or troubleshooting example must not run as literal copy-paste, on purpose.** A reader in an incident, following a troubleshooting doc or an upgrade guide, is exactly the reader most likely to paste first and read second. A command that would delete, drop, overwrite, force-push, or otherwise act on whatever the reader already has must be written so blind copy-paste fails safe, not just carry a warning above it:

- Use a placeholder that cannot resolve to anything real if pasted as-is (angle brackets the shell will reject, `<YOUR_CLUSTER_NAME>`, not a plausible real-looking value like `prod-cluster`) rather than a fake-but-syntactically-valid one.
- Prefer showing the dry-run or read-only form by default (`--dry-run`, a status or diff command) and naming the real flag in prose, rather than showing the destructive form and warning about it.
- When the destructive form must be shown directly, break it: a comment line the reader must delete first, an intentionally invalid token in place of the real target, or split across a "first confirm this is what you mean to affect" step and a separate "then run this" step.
- State what the command does and what it affects before showing it, but treat that as backup, not the safeguard. A warning a copy-paste skips past protects nobody; a command that fails when pasted verbatim protects everyone.
- `doc-verifier` already refuses to run anything in this category (see its safety tiers); this rule is the same discipline applied for the human reader, who has no safety tier at all.

## Formatting

- A language tag on every fenced code block.
- Combine related commands with `&&`; do not put several unrelated commands in one block.
- Show expected output where it helps, and an error case for troubleshooting docs.
- Keep the plugin's formatting rules (`tone-and-voice.md`) over any convention copied from an external source.
