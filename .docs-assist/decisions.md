# Decisions of record

Settled decisions about documentation in this repo, so nobody re-derives them and gets them wrong.

Read this before auditing, drafting, or restructuring docs here.
It is short on purpose: it holds only decisions whose absence has actually caused a mistake, each with the reason, so a reader can tell whether a decision still applies when the situation changes.

Where things go:

| File | Holds | Read by |
| ---------------- | ----------------------------------------------- | -------------------- |
| `config.yml` | Machine-checkable settings | Agents and linters |
| `style.md` | Prose judgment: voice, terminology, emphasis | Agents |
| `reference.yml` | Machine-checkable pairs: values, facts, terms | Agents and linters |
| `decisions.md` | Settled calls that are none of the above | Agents |
| `session-log.md` | What happened, in order, and why | People, later |

A decision belongs here when getting it wrong costs real work and the answer is not derivable from the files themselves.
Anything provisional stays in the session log until it settles.

## The doc set is what git tracks

`git ls-files` defines the documentation set.
A file on disk that git ignores is working material, not a document: never audit it, lint it, count it, or rank it for staleness.

Why: this repo deliberately keeps working notes in ignored paths, and the plugin tells its users to do the same.
That makes the gap between "on disk" and "shipped" wide and permanent here.
Reading the filesystem instead of the index produced four separate wrong answers in one day, in `validate.mjs`, in `docs-decay.mjs`, and twice in a chair's report.

Walking the filesystem is correct in one place only: an installed plugin cache, which has no index, where the whole tree is what shipped.

## Every repeated fact has one owner

| Fact | Owner | Everyone else |
| ---------------------------- | ------------------------------------ | ------------- |
| Install steps | `docs/get-started.md` | Links |
| Command arguments | `docs/command-reference.md` | Links |
| What `/docs-assist:setup` writes | `docs/get-started.md` | Links |
| The intake narrative, for Claude | `skills/docs-assist/SKILL.md` | Links |
| The intake narrative, for people | `docs/write-docs-with-docs-assist.md` | Links |

Duplication across audiences is legitimate: the same fact for Claude and for a person is two documents, not one drifted in two places.
Duplication inside one audience is drift, and it has already cost this repo four disagreeing install procedures and a `templates.yml` claim that outlived the feature.

The rows above are prose for a reader.
The block below is the same map in a form `scripts/validate.mjs` can enforce, for the facts whose restatement is mechanically detectable.
It is deliberately short: a pattern only belongs here when a stray copy is both likely and findable by grep.

```yaml
owners:
  - fact: Install steps
    pattern: "plugin marketplace add"
    owner: docs/get-started.md
    also: [CONTRIBUTING.md, README.md]
    why: >
      CONTRIBUTING documents the local-path install, which is a different
      procedure. The README block is the shape of the thing, kept on purpose.
  - fact: The setup stage list
    pattern: "Site navigation"
    owner: docs/get-started.md
    also: [commands/setup.md, CHANGELOG.md]
    why: >
      setup.md is the implementation and names its own stages. The changelog
      records what shipped.
```

Adding a row is cheap and removing one is cheaper.
A pattern that fires on a legitimate mention is worse than no row, because the next person turns the check off rather than arguing with it.

## Count the occurrences before changing a fact

Grep for every instance of a fact before editing it, and fix them together.

Why: fixing the first hit and moving on produced two half-corrected claims in one session, each of which then contradicted its own file a few lines later.
A fact worth correcting is usually a fact worth correcting more than once.

## Working notes are not drafts

`reports/`, `.docs-assist/loop/`, `.docs-assist/claims/`, and `planning/` (forward-looking plans and dated reviews, moved out of `docs/` on 2026-09-17 for exactly this reason) are working material.
They are excluded from the shipping allowlist, from the linters, and from the doc set above.

Why: a packet is cold, flat prose written by an agent for another agent.
Linting it against a human prose style, or auditing it as documentation, is a category error that produces confident findings about files no reader will ever see.

## How to add to this file

Add a decision when you settle something that cost real work to figure out and that the files do not state on their own.
Give it a heading, state the decision in one or two sentences, and say why underneath.
Delete an entry when it stops being true, rather than annotating it: this file is what is true now, and the session log is what happened.
