---
description: Add or improve code examples in a documentation file
argument-hint: [doc-path]
---

# Add Code Examples

Review the documentation file at `$ARGUMENTS` and add or improve code examples.

## Process

### 1. Analyze the Document

- Read the document and identify its content type (concept, doc, guide, reference, etc.)
- Find sections that would benefit from code examples
- Identify existing examples that could be improved

### 2. Determine What Examples to Add

Look for:

- Procedures without corresponding code
- Concepts that would be clearer with examples
- Configuration options without sample values
- API/CLI references without usage examples
- Troubleshooting steps without commands

### 3. Create Examples

Follow these rules:

#### Safety

- All examples must be copy-paste ready
- Never use dangerous commands without safeguards
- Use documentation IP ranges (192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24)
- Use clearly fake values that won't accidentally work (example.com, your-api-key, etc.)

#### Consistency

- Match the style of existing examples in the codebase
- Use the same variable names, paths, and patterns as other docs
- If the repo has example conventions, follow them

#### Formatting

- Always include language tags on code blocks
- Combine related commands with `&&`
- Don't put multiple separate commands in one fenced block
- Add brief annotations above or below complex examples

#### Completeness

- Show the expected output where helpful
- Include error cases for troubleshooting docs
- Provide both minimal and complete examples when appropriate

### 4. Verify Examples

- Check that examples actually work (or would work with real values)
- Ensure syntax is correct for the language/tool
- Verify paths and filenames match the product

## Output

Present the suggested examples and where to add them.
Ask if the user wants you to insert them directly or review first.

## Notes

- Don't over-example: add examples where they genuinely help
- Match the technical level of the document's audience
- If you're unsure about syntax or behavior, say so and ask
