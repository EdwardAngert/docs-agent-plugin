# Contribute to Docs Assist

Thanks for your interest in contributing.

## Report issues

Open an issue at [github.com/EdwardAngert/docs-agent-plugin/issues](https://github.com/EdwardAngert/docs-agent-plugin/issues) for:

- Bug reports: what you expected, and what happened instead
- Feature requests
- Questions about usage

## Submit pull requests

1. Fork the repository
1. Create a branch for your changes
1. Make your changes
1. Test with Claude Code locally
1. Open a pull request

### What to contribute

Good contributions:

- New commands that help with documentation tasks
- Improvements to existing methodologies
- Better examples or clarifications
- Bug fixes

### Code style

- Follow the style established in existing files
- Use clear, descriptive names
- Keep commands focused on a single purpose

## Test locally

Add your working copy as a marketplace, then install the plugin from it:

```bash
claude plugin marketplace add /path/to/docs-agent-plugin && \
claude plugin install docs-assist@docs-assist-marketplace
```

To check the manifests without installing, run `claude plugin validate /path/to/docs-agent-plugin`.

Test commands and skill behavior before submitting.

Run the repository checks before opening a pull request:

```bash
node scripts/validate.mjs
```

Then run the regression tests for the scripts and hooks that work without a model:

```bash
node --test scripts/test.mjs
```

Both run in CI on pull requests and on pushes to `main`.

The validator checks the manifests, the files they reference, frontmatter, relative links and anchors, and that the shipped Vale styles don't fire on the plugin's own docs (a style that bans a phrase and then explains itself using that phrase in plain prose flags itself; wrap the example in backticks, or reconsider the token if it's flagging ordinary English rather than the thing the rule means to catch).

CI also dogfoods the shipped linters against the plugin's own docs, so if you changed any docs, run them locally too.
The root `.markdownlint-cli2.jsonc` already scopes this to what CI lints, so a bare invocation matches:

```bash
npx markdownlint-cli2
npx cspell "**/*.md" ".docs-assist/**"
```

Spelling uses `.cspell.json`, this repo's own word list (its own vocabulary: `frontmatter`, `llms`, `dogfooding`, and so on), not the generic template the plugin ships to other projects at `assets/lint/cspell/`.
If a real word is missing, add it there rather than ignoring the finding.

### Run the eval suite

The eval suite in `evals/` tests model behavior: whether the plugin fires when it should, stays out of the way when it should not, and produces docs that match the code.
Each case runs twice, once with the plugin and once without, and the headline number is the difference.

It runs real Claude Code sessions on your machine, as you, so it is not part of CI.
Run it before a release, or after changing a skill, a command, or a chair:

```bash
claude plugin eval . --scaffold --allow-tools Write Edit Bash --judge-model sonnet
```

`--scaffold` runs each case's `scaffold.sh` to build its fixture repository, and the first run asks you to confirm you trust the plugin directory.
A full run is nine cases, three runs each, in two arms: 54 Claude Code sessions, plus a grading model for the cases that use one.
On a Claude subscription that counts against your plan's usage limits; on API billing it is charged per token.
In the pilots, one case with both arms took one to two minutes.
Results go to `evals/results/`, which git ignores.

On macOS, `git` fails inside the eval sandbox: the plugin under test cannot run git commands, and its git-based checks do not run.
The error is `couldn't create cache file '.../xcrun_db-...' (errno=Operation not permitted)`: `/usr/bin/git` on macOS is an `xcrun` shim that writes a cache to the system temp directory, which the sandbox blocks.
The journal still finds the branch by reading `.git/HEAD` directly.
The scaffolds run outside the sandbox and still commit, so the fixtures are correct.
Linux runs have not been tried yet.

When you add a case, follow the existing ones: a `case.yaml`, a `scaffold.sh` that runs `git init` and commits, and graders that check the outcome rather than which tools ran.
Keep at least one case where the plugin should not fire, and check each fixture's premise against its own code before trusting a failure: two of the first pilot's failures were fixtures that said something the code did not.

### When you rename a plugin concept

This repo is almost entirely prose, cross-referenced by hand: renaming a file, a registry, or a concept the docs describe means every mention of the old name needs to be found and updated, not just the definition.
`impact-analysis.md` exists to formalize exactly this kind of change for the docs the plugin works on; turn it on this repo too rather than hand-grepping.
After a rename, run `/docs-assist:audit` or `/docs-assist:update` against this repo in Claude Code to catch what a manual search misses.

## License

By contributing, you agree that your contributions will be licensed under the Apache License 2.0.
