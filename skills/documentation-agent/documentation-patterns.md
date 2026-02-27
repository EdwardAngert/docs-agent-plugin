# Common Documentation Patterns

## Content Types

### Concept

- Goal: Teach a skill or develop understanding
- Structure: Explanation with examples, diagrams, analogies
- Outcome: User understands the "what" and "why"
- Example: "Understand Workspace Architecture"

### Procedural Documentation

A hierarchy of task-oriented content:

#### Doc (Single Page)

- Goal: Walk reader through steps to complete one task
- Structure: Prerequisites → steps → verification
- Outcome: User completes a specific task
- Example: "Configure SSO with Okta"

#### Guide (Set of Docs)

- Goal: Bring user through a series of steps with possible divergent paths
- Structure: Multiple docs, branching based on user context
- Outcome: User accomplishes a larger goal
- Example: "Set Up Your Development Environment" (with paths for macOS/Windows/Linux)

#### Tutorial (Set of Guides)

- Goal: Onboard new users through concepts and implementation in sequence
- Structure: Ordered guides that build on each other
- Outcome: User gains competency with the product
- Example: "Get Started with Coder" (spans account setup through first workspace)

### Reference

- Goal: Provide accurate, complete technical details
- Structure: Systematic, scannable, searchable
- Outcome: User finds specific information quickly
- Types:
  - API/CLI reference
  - Configuration options
  - Plans and pricing
  - Feature comparison tables
  - Changelogs/release notes

### Troubleshooting

- Goal: Answer specific questions when something goes wrong
- Structure: Problem → cause → solution
- Outcome: User resolves their issue
- Placement: Standalone pages or sections within other docs
- Example: "Connection Timeout Errors"

## Documentation Antipatterns

### The Everything Document

- Problem: One doc tries to cover all content types
- Impact: Hard to find information, overwhelming
- Solution: Split by content type and audience

### The Easter Egg Hunt

- Problem: Information scattered across many docs
- Impact: Users give up, contact support
- Solution: Consolidate related information

### The Assumption Gap

- Problem: Documentation assumes prerequisite knowledge
- Impact: Users can't follow instructions
- Solution: Link to prerequisites, define terms

### The Maintenance Nightmare

- Problem: Duplicated information in multiple places
- Impact: Inconsistent, outdated content
- Solution: Single source of truth, content reuse

### The Corporate Speak

- Problem: Jargon-heavy, marketing language in docs
- Impact: Users can't understand instructions
- Solution: Plain language, technical accuracy

## Examples and Code Blocks

### Example Consistency

- Use the same examples throughout documentation so users can follow any doc in any order
- Don't make users match up disparate examples across different pages
- Use designated documentation IP ranges where appropriate (e.g., 192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24)
- Warn during audits if examples are inconsistent — this creates maintenance burden

### Code Block Safety

- All examples must be copy-paste ready
- Assume users will copy without reading — make it safe
- Never use dangerous commands without safeguards:
  - Bad: `rm -rf *`
  - Better: `rm -rfi *` (interactive flag)
  - Best: Use a clearly fake path that would fail
- If demonstrating a destructive operation, make the example fail safely

### Code Block Formatting

- Combine related shell commands: `sudo apt update && sudo apt upgrade`
- Don't use a single fenced code block for multiple commands separated by line breaks
- Exception: Commands continued with `\` can be in one block
- Each distinct command should be in its own block unless chained with `&&` or `||`

## SEO and Findability

SEO isn't just about ranking on Google — it serves users directly:

- Users search within your docs site
- Users search from Google/other engines
- AI systems use search to find authoritative information

### Apply SEO Principles

- Use keywords users actually search for in headings
- Write descriptive page titles and meta descriptions
- Use heading hierarchy correctly (H1 → H2 → H3)
- Include relevant terms in the first paragraph
- Link related content with descriptive anchor text

## Accessibility

### Use Images Purposefully

- Only include images when they clarify something text cannot
- Every image needs meaningful alt text
- Screenshots become outdated quickly — use sparingly

### Prefer Text-Based Diagrams

- Use Mermaid diagrams where possible
- Ensure diagrams render as SVG (text is highlightable/searchable)
- Provide text descriptions of complex diagrams

### Video and GIFs

- Videos rarely make step-by-step tasks easier to follow
- Use videos as supplemental aids, not primary instruction
- GIFs should be short and focused
- Always provide text alternatives for video content

## Effective Patterns

### Progressive Disclosure

- Start with overview
- Link to detailed pages
- Provide examples at each level
- Offer advanced topics separately

### Consistent Structure

- Same pattern for similar content
- Predictable navigation
- Standard page layouts
- Template-based authoring

### Clear Prerequisites

- State requirements upfront
- Link to setup instructions
- Version specifications
- Access requirements

### Contextual Help

- Right information, right place
- Inline tooltips
- Related articles
- Next steps

## Docs-as-Code Workflows

### Version Control

- Documentation in Git
- Branch for changes
- Pull request review
- Automated deployment

### CI/CD Integration

- Automated builds
- Link checking
- Style linting
- Preview deployments

### Review Processes

- Technical review (accuracy)
- Editorial review (clarity, style)
- Subject matter expert review
- User testing when possible

### Static Site Generators

- Common tools: Docusaurus, Hugo, Jekyll, Gatsby, Astro
- Benefits: Fast, version controlled, customizable
- Trade-offs: Requires technical comfort
