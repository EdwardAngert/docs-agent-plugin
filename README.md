# Docs Assist

A Claude Code plugin for turning what you know into documentation.
You bring the knowledge, expertise, and steps.
The plugin handles structure, standards, and drafting.

**Who it's for:** engineers, support leads, PMs, and repo owners who have something to document and don't want to become documentation experts to do it.

## Why use it

Most documentation gaps aren't a writing problem.
They're a knowledge-extraction problem: the person who knows the answer doesn't have time to structure it, and the person with time doesn't have the knowledge.

Docs Assist closes that gap by acting as the documentation expert in the session.
It asks the questions a technical writer would ask, checks what you say against the code rather than taking it on faith, structures the result, and applies your project's own conventions automatically, so you review for accuracy instead of formatting.

It also helps once a document exists, not just while it's being written:

- Checks a docs set's health and tells you the one thing worth fixing first.
- Audits a finished document by reconstructing what it claims and ruling on each claim against the code.
- Verifies a procedure by actually running its steps in an isolated workspace.
- Updates the docs affected by a code change, for your review.
- Turns a release's commits and pull requests into release notes, asking you for the why.

## This README describes version 1.0.0

`origin/main`'s marketplace manifest currently serves 0.9.8.
1.0.0 exists only on the `1.0-overhaul` branch, pending merge.
See [Status](#status) before you install.

## Get started

```text
/plugin marketplace add EdwardAngert/docs-agent-plugin
/plugin install docs-assist@docs-assist-marketplace
```

Then ask for a health check, or run `/docs-assist:health`, for a scorecard and one fix worth making now.

[Get started with Docs Assist](docs/get-started.md) has the full path: installing, setting up so the plugin writes like your project (including how to customize things like ordered-list style, heading case, and terminology casing), and making sure it shows up when it should.

## Commands and specifics

Nine commands exist, but they're a shortcut rather than the way in: anything they do, you can ask for in plain words.

[Command reference](docs/command-reference.md) has every command, its argument shape, and a worked example.
[How the authoring loop works](docs/how-the-loop-works.md) explains the three-chair mechanism behind drafting, including a real example from the ledger of the run that wrote that page, which is the fastest way to judge whether any of this is worth your time.

## What would improve it most

An honest self-assessment, kept in the open on purpose.

- **The loop has run once.** End to end, against one 207-line document, across four subagent runs total.
  Its cost, convergence, and false-positive rates are unmeasured.
- **Every finding to date is over-fit to one site.** `edwardangert.github.io` (Astro, Starlight, one subject) is the only real consumer of this plugin on record.
- **The chairs aren't registered as their own subagent types yet**, in the session that has run them so far.
  The first observed run used a workaround, an existing subagent type carrying a chair's brief, and the authority chair lacked a `Write` tool as a result.
  A faithful chair run needs a plugin reload first.
- **The eval harness comes after the implementation, not before.** Two dry runs, with two false positives, stand as its seed corpus; building the harness against an imagined implementation was rejected as carrying the same over-fitting risk the harness is meant to catch.
- **This branch is unpublished.** As of 2026-09-17 it, and its `v1.0.0` tag, are local only; no pull request is open.

`CHANGELOG.md` carries the fuller Known limits list for the 1.0.0 release.
If you try the plugin and something falls short, an issue with what you expected and what happened is the most valuable contribution this project can receive right now.

## Status

Version 1.0.0 is set in this branch's `.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json`.
`origin/main` still serves 0.9.8; installing from `EdwardAngert/docs-agent-plugin` today gets you 0.9.8, not the plugin this README describes.

1.0 is one comprehensive overhaul, not a staged path through intermediate versions; the earlier plan for 0.9.8 through 0.9.11 is superseded.
The command surface and the drafting mechanism both changed substantially, so anything pinned against a 0.9.x install is worth re-reading.
A version bump past 0.9.5, and especially to 1.0.0, is the maintainer's call rather than the plugin's own; this one followed 0.9.9 shipping the same content as a release candidate.

The plugin was renamed from `documentation-agent`; commands are `/docs-assist:...` now.

`CHANGELOG.md` has the full detail.

## Background

This plugin codifies methodologies from ten years of technical writing practice: building documentation practices from scratch for developer tools, managing documentation teams for enterprise platforms, API and SDK documentation, and docs-as-code workflows.

The core philosophy, in the maintainer's own words:

> I just want your knowledge, expertise, and steps.
> I'll deal with putting it in the right order, getting the words right, and making it all work together.

This plugin brings that same approach to every Claude Code session, not just one project.

## Contribute

See the [contributing guidelines](CONTRIBUTING.md).

## License

Apache 2.0.
See [LICENSE](LICENSE) for details.
