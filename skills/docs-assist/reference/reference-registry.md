# The Reference Registry

`.docs-assist/reference.yml` is the single canonical registry Docs Assist checks against when drafting or auditing: example values, verified facts, pointers to existing worked examples, and product terminology, in one file instead of scattered across several.

Load this whenever you read, write, or maintain the registry, from `/docs-assist:draft`, `/docs-assist:audit`, `/docs-assist:make-examples`, or `/docs-assist:setup-lint`.

## Why One File

Inconsistency across a docs set takes a few shapes, and they used to live in separate registries: a code sample using a different placeholder value than its neighbor, a value that quietly drifted from what the code actually does, a worked example rewritten from scratch instead of reused, and a product concept called two different things. They are the same underlying problem (nothing kept the docs checked against a shared source of truth) so they now share one file and one maintenance contract.

## The Four Kinds

Each entry is tagged with a `kind`, and the kind decides how it gets checked.

### `example-variable`

A safe, reusable placeholder value for code samples: a URL, a key, an ID, a region.

```yaml
base_url:
  kind: example-variable
  value: "https://api.example.com"

api_key:
  kind: example-variable
  value: "sk_test_EXAMPLE0123456789"
  note: "Fake, never a real key."
```

- **Read it first.** If an entry exists for what you need, use its value in every sample.
- **Add what's missing.** When a sample needs a placeholder the registry doesn't have, pick a safe value, use it, and add the entry. Keep values copy-paste safe: reserved example domains (`example.com`), documentation IP ranges (`192.0.2.0/24`, `198.51.100.0/24`, `203.0.113.0/24`), and fake credentials that cannot work.
- **Checked for**: consistency between docs. An audit flags a code sample whose value drifts from the registry or from another doc's use of the same thing.

See `code-examples.md` for the rest of writing safe, consistent code examples; this section only covers the registry entry itself.

### `fact`

A real value that should track its source, not just stay consistent between docs.

```yaml
retry_default:
  kind: fact
  value: 3
  source: "src/config/retry.ts:DEFAULT_RETRIES"
```

- **Use it like an example-variable**, plus one more check: the `source` field names where the real value lives (a code constant, a config default), so drift from the source itself gets caught, not only drift between docs that both quietly went stale together.
- **Checked for**: consistency between docs, and accuracy against `source` when you can read it. If the source has moved on and the registry hasn't, the registry is the finding, not the doc.

### `pointer`

A link to where a good worked example already lives, instead of duplicating it.

```yaml
webhook_retry_flow:
  kind: pointer
  ref: "docs/guides/webhooks.md#retry-configuration"
  note: "Best existing worked example of a full retry-config flow."
```

- **Resolve it by reading the link.** When a draft needs this kind of example, read what's at `ref` and follow its pattern rather than inventing a new one or copying it verbatim (the source doc might change; point readers there instead of forking a copy).
- **Checked for**: whether `ref` still resolves (an audit flags a pointer whose target moved or was deleted, the same way it flags a broken internal link).

### `term`

A canonical word or phrase and the variants to avoid, so the same concept never appears under different names.

```yaml
workspace:
  kind: term
  canonical: "workspace"
  variants: ["project", "environment"]
```

- **Write with the canonical term.** Use it in everything you draft.
- **Respect the boundary with `style.md`.** The registry holds machine-checkable pairs. Judgment-based language guidance (voice, banned phrases, when a term is appropriate) stays in `.docs-assist/style.md`. When the two disagree, `style.md` wins and the registry needs updating.
- **Checked for**: prose using a listed variant instead of the canonical term, and the same concept under different terms across docs even when neither is registered yet (flag the outliers against dominant usage, and offer to record the winner).
- **The only kind Vale also checks.** `/docs-assist:setup-lint` compiles every `term` entry into a generated Vale `substitution` rule, so the canonical-vs-variant check also runs as a deterministic lint, not only during a drafting or audit conversation. The other three kinds stay agent-only: Vale doesn't check inside code blocks by default (ruling out `example-variable` and `fact`), and it can't follow a link to resolve a `pointer`.

## Maintaining the Registry

- **Offer to create it.** If `.docs-assist/reference.yml` doesn't exist and you're about to write a sample, or you find terminology drift during an audit or survey, offer to create it seeded from what the existing docs already use. Scaffold from `${CLAUDE_PLUGIN_ROOT}/assets/config/reference.yml`.
- **Maintain it as you draft.** When you introduce a placeholder, a fact worth tracking, a worked example worth pointing to, or a term readers will see again, add the entry. This is the plugin's responsibility, not the contributor's.
- **Keep it in sync.** If a doc changes a value the registry holds, or a term gets renamed, update the registry and follow the repeated-value or term-rename edge in `impact-analysis.md` to every other occurrence.

## Migrating From `example-variables.txt` and `terms.txt`

Versions before this registry shipped two separate files: `.docs-assist/example-variables.txt` (`key = value` pairs) and `.docs-assist/terms.txt` (`canonical = variants` pairs). `reference.yml` replaces both; the plugin no longer reads the old two-file format.

If you find either file in a project (check during the survey step, before drafting or auditing), offer a one-time migration rather than silently ignoring it: read both files, propose a `reference.yml` with each `example-variables.txt` line as an `example-variable` entry and each `terms.txt` line as a `term` entry, and offer to delete the old files once the contributor confirms the new one looks right. Never delete them without that confirmation, and never invent entries beyond what the old files stated.
