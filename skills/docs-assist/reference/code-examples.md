# Code examples

This is how Docs Assist writes code examples: safe, and consistent with the examples already in the docs.

Inconsistent examples are a quiet source of confusion.
When one doc uses `api.example.com` and `sk_test_123` and the next uses `myapi.io` and `YOUR_KEY`, a reader copying across pages has to stop and translate.
The fix is a shared set of example values that every doc reuses.

Load this whenever you add or improve code samples, from `/docs-assist:draft` or drafting.

## Reuse before you invent

Before you write a new example, look at what the docs already do.

- Search related docs for existing code samples, preferably ones on the same feature or flow.
  Match their variable names, paths, endpoints, and structure.
- Reuse a value that already appears rather than inventing a new one.
  The goal is that a reader moving between docs sees the same names throughout.
- Follow any example conventions the repo already has (a fixture project, a demo account, a standard region).

## Compose across the docs set

Matching values is not the same as a working path.
A reader who follows the quickstart, then the configuration guide, then the deployment guide should end up with one working deployment, not three disconnected snippets that each ran fine on their own.
When a set of docs forms a journey (install, then configure, then deploy, then integrate), their examples are one running example, not independent illustrations, and should be written and checked that way.

- **Name the scenario once, reuse it everywhere.** If the quickstart creates a project called `demo-widgets` in `us-east-1`, every later doc in that journey uses `demo-widgets` in `us-east-1`, not a fresh, differently named example that happens to look similar.
  A resource a later doc references should be a resource an earlier doc actually created.
- **Carry state forward deliberately.** A step that depends on a prior doc's output (a resource ID, a generated key, a config file's path) should say so and use the value that step actually produces, not a plausible-looking placeholder that silently diverges from it.
- **Verify the sequence, not just each doc.** `/docs-assist:verify` can run a journey's docs in one continuous workspace, in order, to prove the examples actually compose end to end; a single doc passing in isolation does not prove this.
  See "Verify a journey" in `commands/verify.md`.
- **Flag it when a set doesn't compose.** If two docs in the same journey use different project names, regions, or resource IDs for what is supposed to be the same thing, that is a Critical audit finding: a reader following the docs in order hits a wall the individual docs never showed.

## The reference registry

`.docs-assist/reference.yml` holds the canonical placeholder values for the project, as `example-variable` entries, alongside terminology and other registered facts.
Read it first, use its values, and keep it current.
The full format, including the other entry kinds, is single-sourced in `reference-registry.md`; this section only covers what's specific to code samples.

- **Read it first.** If an entry exists, its value is authoritative.
  Use it in every sample.
- **Offer to create it.** If the registry does not exist and you are about to write samples, offer to create it, seeded with the values already used across the existing docs (so you adopt the current convention, not a new one).
  Scaffold from `${CLAUDE_PLUGIN_ROOT}/assets/config/reference.yml`.
- **Maintain it.** When a sample needs a placeholder the registry does not have, add it: pick a safe value, use it, and add the entry with a short note.
  The registry is the plugin's responsibility to keep in sync, not the contributor's.
- **Keep it in sync.** If a doc changes an example value, update the registry and the other docs that repeat it (this is the repeated-value edge in `impact-analysis.md`).

An audit checks this too: `/docs-assist:audit` flags code samples whose values drift from the registry or from each other.

## Keep every example safe

Whether or not a registry exists, examples must be copy-paste safe.
This means two different things depending on what the example does, and they call for opposite defaults.

**A setup or tutorial example should work exactly as written.** Copy-paste-and-run is the point (this is what makes "Compose across the docs set" above possible at all).

- Use documentation IP ranges (`192.0.2.0/24`, `198.51.100.0/24`, `203.0.113.0/24`) and reserved example domains (`example.com`).
- Use clearly fake secrets that cannot work (`sk_test_EXAMPLE...`, `your-api-key`).
  Never a real-looking credential.

**A destructive, upgrade, or troubleshooting example must not run as literal copy-paste, on purpose.** A reader in an incident, following a troubleshooting doc or an upgrade guide, is exactly the reader most likely to paste first and read second.
A command that would delete, drop, overwrite, force-push, or otherwise act on whatever the reader already has must be written so blind copy-paste fails safe, not just carry a warning above it:

- **Show the real command, and break it where it is dangerous.** Put an unresolvable placeholder in the slot that would do the damage, so pasting it verbatim fails.
  `YOUR-PI-IP` and `YOUR-GATEWAY-IP` are the shape: screaming caps, hyphenated, obviously not a value, and invalid where they land.
  A plausible-looking `prod-cluster` is the failure mode, because it runs.
- **Say that it is set to fail, and what the failure saves the reader from.** "This example is intentionally set to fail if you don't adjust `YOUR-PI-IP` and `YOUR-GATEWAY-IP`.
  This way you're less likely to get locked out if you don't change the example first." The reader now knows the error is the doc working, not the doc being broken.
- **Name what replaces each placeholder, one by one, and where to find it.** A placeholder the reader cannot resolve is a dead end rather than a safeguard.
- **Do not ask the reader to edit a command in their head.** "Run it again, replacing `-n` with `-f`" makes the reader retype a command they cannot see, and a flag swap is easy to get wrong and easy to mistype on a keyboard laid out differently from yours.
  Show the second command as its own block, in full.
- **Say what to do if it goes wrong anyway.** The pi-hole static-IP step ends with how to recover from a lockout, on a monitor and keyboard, because the command it just gave you can cut off your own access.
- A dry run is a step of its own, not a mode of the real command: show `--dry-run` in one block, and the real invocation in the next, each with its own prose.
- State what the command does and what it affects before showing it, but treat that as backup, not the safeguard.
  A warning a copy-paste skips past protects nobody; a command that fails when pasted verbatim protects everyone.
- `doc-verifier` already refuses to run anything in this category (see its safety tiers); this rule is the same discipline applied for the human reader, who has no safety tier at all.

## Protect the reader who pastes without reading

Assume the reader copies the block, pastes it, and reads afterward.
Every rule below follows from that, and so does the destructive-example rule above: safety and formatting are the same concern seen from two angles.

**One step per block.** A block is a single thing the reader is doing, not a transcript of your terminal.
Two unrelated commands belong in two blocks, each under the prose that says why it is there.

**Chain a step's commands with `&& \` and a line break, never inline.** When a step genuinely takes two commands, `&&` is right, but written inline it reads as one long command and the reader cannot see, or copy, the halves.
Break the line so the shape of the step is visible:

```bash
mkdir -p demo-widgets && \
cd demo-widgets
```

Not `mkdir -p demo-widgets && cd demo-widgets`.
It still pastes as one working chain, and the reader can now see two commands, run them separately, or stop after the first.

Each new command in the chain starts flush.
Indentation means something else: the wrapped arguments of a single command, which is the one case where a continued line is not a command of its own.

```bash
sudo nmcli con mod "$CON" \
  ipv4.addresses YOUR-PI-IP/24 \
  ipv4.gateway YOUR-GATEWAY-IP
```

**Only chain what is genuinely one step.** "Create the directory and switch to it" is one step that would be pedantic as two.
"Install the dependencies" and "run the test suite" are two.
`&&` also means "and only if that succeeded", so do not use it for commands the reader should run regardless of each other: two linters chained with `&&` silently skip the second one whenever the first finds something.

**Show a partial file edit in place, not as a floating fragment.** A block that is part of an existing file must say where in that file it goes, or the reader guesses and appends.
In order of preference:

- Include the real surrounding context: the block above it, the enclosing key, the function signature.
  A reader who can see the anchor does not have to guess.
- Failing that, mark the omission with `...` on its own line before, after, or both, so the block is visibly an excerpt rather than the whole file.
- Never show a bare fragment whose position is implied only by the prose.

```yaml
# .docs-assist/config.yml
lint:
  tools: [vale, markdownlint]
  ...
  spelling: true
```

**Name the file, and name where the command runs.** A reader working through a multi-step page loses track of which file they are in and which machine they are on, and every wrong guess costs them a step.
Say both wherever they are not obvious from the step's prose.

Carry it wherever the reader will actually see it, in this order:

- A comment line at the top of the block holding the path, where the language has comments.
  This survives every renderer, plain markdown on a code host, and an agent reading the raw file, and it stays attached when someone copies the block.
- The renderer's own filename or title feature, where the project's stack has one.
  It is the tidiest option and the reader cannot paste it by accident, so prefer it for a language with no comment syntax: JSON is the common case, and a `json` block cannot carry its own path without becoming invalid.
- The line of prose immediately above, naming the exact path, when neither is available.

Use whichever the project already does rather than introducing a second convention.
Treat syntax highlighting, line numbers, and line highlighting the same way: use what the stack supports, and never let a rendering feature be the only thing carrying information the reader needs.

## Formatting

- A language tag on every fenced code block.
- Show expected output where it helps, and an error case for troubleshooting docs.
- Keep the plugin's formatting rules (`tone-and-voice.md`) over any convention copied from an external source.
