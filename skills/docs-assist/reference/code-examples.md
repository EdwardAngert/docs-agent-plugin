# Code Examples

This is how Docs Assist writes code examples: safe, and consistent with the examples already in the docs.

Inconsistent examples are a quiet source of confusion. When one doc uses `api.example.com` and `sk_test_123` and the next uses `myapi.io` and `YOUR_KEY`, a reader copying across pages has to stop and translate. The fix is a shared set of example values that every doc reuses.

Load this whenever you add or improve code samples, from `/docs-assist:draft` or `/docs-assist:make-examples`.

## Reuse Before You Invent

Before you write a new example, look at what the docs already do.

- Search related docs for existing code samples, preferably ones on the same feature or flow. Match their variable names, paths, endpoints, and structure.
- Reuse a value that already appears rather than inventing a new one. The goal is that a reader moving between docs sees the same names throughout.
- Follow any example conventions the repo already has (a fixture project, a demo account, a standard region).

## The Example Variables Registry

`.docs-assist/example-variables.txt` is the canonical set of placeholder values for the project. Read it first, use its values, and keep it current.

- **Read it first.** If the file exists, its values are authoritative. Use them in every sample.
- **Offer to create it.** If it does not exist and you are about to write samples, offer to create it, seeded with the values already used across the existing docs (so you adopt the current convention, not a new one). Scaffold from `${CLAUDE_PLUGIN_ROOT}/assets/config/example-variables.txt`.
- **Maintain it.** When a sample needs a placeholder the registry does not have, add it: pick a safe value, use it, and append it to the file with a short comment. The registry is the plugin's responsibility to keep in sync, not the contributor's.
- **Keep it in sync.** If a doc changes an example value, update the registry and the other docs that repeat it (this is the repeated-value edge in `impact-analysis.md`).

### Format

Simple `key = value` lines, with `#` comments. Human-editable, machine-parseable.

```text
# Docs Assist example variables. Canonical placeholder values for code samples.
base_url   = https://api.example.com
api_key    = sk_test_EXAMPLE0123456789   # fake, never a real key
project_id = proj_example_42
region     = us-east-1
```

An audit checks this too: `/docs-assist:audit` flags code samples whose values drift from the registry or from each other.

## Keep Every Example Safe

Whether or not a registry exists, examples must be copy-paste safe.

- Use documentation IP ranges (`192.0.2.0/24`, `198.51.100.0/24`, `203.0.113.0/24`) and reserved example domains (`example.com`).
- Use clearly fake secrets that cannot work (`sk_test_EXAMPLE...`, `your-api-key`). Never a real-looking credential.
- Never include a destructive command without a guard, and say what a command does before a reader runs it.

## Formatting

- A language tag on every fenced code block.
- Combine related commands with `&&`; do not put several unrelated commands in one block.
- Show expected output where it helps, and an error case for troubleshooting docs.
- Keep the plugin's formatting rules (`tone-and-voice.md`) over any convention copied from an external source.
