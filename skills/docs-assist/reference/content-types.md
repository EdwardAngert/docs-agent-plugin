# Content Types

This is the canonical list of content types Docs Assist uses.
Every other file in the plugin points here instead of redefining them, so there is one source of truth for the categories and their frontmatter values.

When you draft or audit a doc, pick the type that best serves the reader, then set the `content-type` frontmatter field to the matching value.
The contributor never needs to know these categories. You choose.
When the right type is genuinely ambiguous, default to `doc` (task-oriented) and let the reviewer restructure.

## How to Choose

| If the contributor is | Use | `content-type` value |
| --- | --- | --- |
| Listing the steps to complete one task | Doc | `doc` |
| Walking through a larger goal with paths that branch by context | Guide | `guide` |
| Onboarding someone from zero to competent, in sequence | Tutorial | `tutorial` |
| Teaching how or why something works | Concept | `concept` |
| Cataloging complete technical details to look up | Reference | `reference` |
| Explaining how to recover when something breaks | Troubleshooting | `troubleshooting` |

## Doc

The default for most contributions.

- Use when: the reader needs to complete a single, well-defined task.
- Structure: prerequisites, then numbered steps, then verification.
- Outcome: the reader finishes the task.
- Example: "Configure SSO With Okta"

## Guide

A set of related docs, not a single page.

- Use when: the reader is pursuing a larger goal and the path branches based on their context (operating system, environment, role).
- Structure: an entry point plus multiple docs that diverge by context, each following the Doc structure.
- Outcome: the reader accomplishes the larger goal along the path that fits them.
- Example: "Set Up Your Development Environment" with branches for macOS, Windows, and Linux.

## Tutorial

A guided learning journey, usually a set of guides in sequence.

- Use when: someone new needs to go from zero to competent, and concepts and implementation should build on each other in order.
- Structure: ordered sections that combine just-enough concept with hands-on steps, each building on the last.
- Outcome: the reader gains working competency with the product.
- Example: "Get Started" (spans account setup through first deployment).

## Concept

- Use when: the contributor is teaching, not instructing. The reader needs to understand how or why something works before the tasks make sense.
- Structure: explanation supported by examples, analogies, and diagrams where they clarify.
- Outcome: the reader understands the what and the why.
- Example: "Understand Workspace Architecture"

## Reference

- Use when: the reader knows what they are looking for and needs accurate, complete details to look up.
- Structure: systematic, scannable, and searchable. Tables, lists, and consistent entry formats.
- Outcome: the reader finds the specific detail quickly.
- Covers: API and CLI references, configuration options, plans and pricing, comparison tables, changelogs and release notes.

## Troubleshooting

- Use when: something went wrong and the reader needs to recover.
- Structure: problem, then cause, then solution. One entry per failure mode.
- Outcome: the reader resolves their issue.
- Placement: standalone pages, or a section within a related doc.
- Example: "Resolve Connection Timeout Errors"

## Procedural Hierarchy

Doc, Guide, and Tutorial form a hierarchy of task-oriented content that scales with scope:

- A Doc is one task.
- A Guide is a set of docs toward one goal, with branching paths.
- A Tutorial is an ordered journey, often a set of guides, that builds competency.

Start at the smallest type that fits. Split upward only when a single page tries to do too much (see the Everything Document antipattern in `documentation-patterns.md`).

## Templates for a Starting Structure

A content type says what shape a doc should take.
A template gives the contributor that shape as a fillable skeleton, so they start from a proven structure instead of a blank page.

When a project opts in, Docs Assist can suggest a template that matches the chosen content type and fetch it live.
Templates supplement these content types; they do not replace them.
`content-type` stays canonical, and an optional `template` field records which template seeded the doc.
See `templates.md`.
