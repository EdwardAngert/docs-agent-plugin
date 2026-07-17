# Contribute to Docs Assist

Thanks for your interest in contributing.

## Report Issues

Open an issue at [github.com/EdwardAngert/docs-agent-plugin/issues](https://github.com/EdwardAngert/docs-agent-plugin/issues) for:

- Bug reports
- Feature requests
- Questions about usage

## Submit Pull Requests

1. Fork the repository
1. Create a branch for your changes
1. Make your changes
1. Test with Claude Code locally
1. Open a pull request

### What to Contribute

Good contributions:

- New commands that help with documentation tasks
- Improvements to existing methodologies
- Better examples or clarifications
- Bug fixes

### Code Style

- Follow the style established in existing files
- Use clear, descriptive names
- Keep commands focused on a single purpose

## Test Locally

Add your working copy as a marketplace, then install the plugin from it:

```bash
claude plugin marketplace add /path/to/docs-agent-plugin
claude plugin install docs-assist@docs-assist-marketplace
```

To check the manifests without installing, run `claude plugin validate /path/to/docs-agent-plugin`.

Test commands and skill behavior before submitting.

Run the repository checks before opening a pull request:

```bash
node scripts/validate.mjs
```

This validates the manifests, the files they reference, frontmatter, and that the shipped Vale styles don't fire on the plugin's own docs (a style that bans a phrase and then explains itself using that phrase in plain prose flags itself; wrap the example in backticks, or reconsider the token if it's flagging ordinary English rather than the thing the rule means to catch).

CI also dogfoods the shipped linters against the plugin's own docs, so if you changed any docs, run them locally too. The root `.markdownlint-cli2.jsonc` already scopes this to what CI lints, so a bare invocation matches:

```bash
npx markdownlint-cli2
```

### When You Rename a Plugin Concept

This repo is almost entirely prose, cross-referenced by hand: renaming a file, a registry, or a concept the docs describe means every mention of the old name needs to be found and updated, not just the definition. `impact-analysis.md` exists to formalize exactly this kind of change for the docs the plugin works on; turn it on this repo too rather than hand-grepping. After a rename, run `/docs-assist:audit` or `/docs-assist:update` against this repo in Claude Code to catch what a manual search misses.

## License

By contributing, you agree that your contributions will be licensed under the Apache License 2.0.
