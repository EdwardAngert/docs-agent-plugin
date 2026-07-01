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

Install your local version:

```bash
claude plugin install /path/to/docs-agent-plugin
```

Test commands and skill behavior before submitting.

Run the repository checks before opening a pull request:

```bash
node scripts/validate.mjs
```

This validates the manifests, the files they reference, and frontmatter.
CI also dogfoods the shipped linters against the plugin's own docs, so if you changed any docs, run them locally too:

```bash
npx --yes markdownlint-cli2 --config assets/lint/markdownlint/.markdownlint.jsonc "README.md" "docs/**/*.md"
```

## License

By contributing, you agree that your contributions will be licensed under the Apache License 2.0.
