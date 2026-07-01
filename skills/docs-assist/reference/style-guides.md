# Style Guides

How to detect, choose, and apply a writing style guide, and how teams enforce one.

In a session your job is to follow the project's style: detect it, apply it, and stay consistent.
The catalog and enforcement sections are reference for when a team is choosing or formalizing a guide.

## Detect and Apply a Style Guide

Before writing, figure out which style the project already follows:

1. If the project defines its own conventions (a committed style config or a `CONTRIBUTING` section), follow those first. They override the plugin defaults.
1. Otherwise, infer from existing docs: heading case, list markers, voice, and terminology. Match what is there.
1. Fall back to the plugin defaults in `tone-and-voice.md` only when there is nothing to match.

Consistency with the surrounding docs matters more than any single guide's rules. Do not impose a style the rest of the set does not use.

## Choose a Style Guide (Reference)

When a team is selecting a guide, these are the common starting points:

- **Google Developer Documentation Style Guide**: modern, comprehensive, API-focused.
- **Microsoft Writing Style Guide**: software and consumer tech products.
- **Chicago Manual of Style**: general purpose, academic roots.
- **AP Stylebook**: news and journalism style. The plugin's default heading case (AP title case) comes from here.
- **Custom or hybrid**: one of the above plus company-specific rules.

Choose based on product type, audience, industry norms, the team's capacity to enforce it, and how much existing content would need to change.

## Style Guide Components (Reference)

A complete guide usually covers:

- **Voice and tone**: formality, active versus passive voice, person, contractions, personality.
- **Terminology**: preferred terms, prohibited terms, product vocabulary, capitalization, abbreviations.
- **Formatting**: heading case, list conventions, code formatting, UI element references, file paths.
- **Mechanics**: punctuation, numbers, dates and times, link text, alt text.

## Enforce a Style Guide (Reference)

Style holds up when it is checked automatically and reviewed by humans:

- **Automated checks**: linters such as Vale, markdownlint, and cspell, run in CI and as pre-commit hooks, plus link validation. The `/docs-assist:setup-lint` command scaffolds these from the project's style settings.
- **Human review**: peer review, an editorial pass, and subject matter expert review for accuracy.
- **Accessible rules**: keep the guide easy to find, give an example for each rule, and document the exception process.

## Common Issues

- **Inconsistent terminology**: the same concept under different terms. Fix with a terms list and automated checks.
- **Style drift**: new writers unaware of the standard. Fix with onboarding docs and templates.
- **Outdated guidelines**: the guide no longer matches the product. Fix with periodic review under version control.
- **Over-prescription**: a guide so detailed nobody follows it. Focus on high-impact rules and explain the rationale.
