# Documentation patterns

Content types live in their own canonical file. See `content-types.md` for the full list, when to use each, and the frontmatter value to set.
This file covers the patterns, antipatterns, examples, and practices that apply across all content types.

## Documentation antipatterns

### The everything document

- Problem: One doc tries to cover all content types
- Impact: Hard to find information, overwhelming
- Solution: Split by content type and audience

### The easter egg hunt

- Problem: Information scattered across many docs
- Impact: Users give up, contact support
- Solution: Consolidate related information

### The assumption gap

- Problem: Documentation assumes prerequisite knowledge
- Impact: Users can't follow instructions
- Solution: Link to prerequisites, define terms

### The maintenance nightmare

- Problem: Duplicated information in multiple places
- Impact: Inconsistent, outdated content
- Solution: Single source of truth, content reuse

### The corporate speak

- Problem: Jargon-heavy, marketing language in docs
- Impact: Users can't understand instructions
- Solution: Plain language, technical accuracy

## Examples and code blocks

The full rules for safe, consistent code examples are single-sourced in `code-examples.md`: reuse before you invent, the `.docs-assist/reference.yml` registry, copy-paste safety, and formatting.
One pattern worth restating here because it spans docs rather than living in any one of them: use the same example values throughout the documentation set, so users can follow any doc in any order without translating between disparate examples.
Inconsistent examples are a maintenance burden and an audit finding.

## SEO and findability

SEO isn't just about ranking on Google, it serves users directly:

- Users search within your docs site
- Users search from Google/other engines
- AI systems use search to find authoritative information

### Apply SEO principles

- Use keywords users actually search for in headings
- Write descriptive page titles and meta descriptions
- Use heading hierarchy correctly (H1 → H2 → H3)
- Include relevant terms in the first paragraph
- Link related content with descriptive anchor text

## Accessibility

### Use images purposefully

- Only include images when they clarify something text cannot
- Every image needs meaningful alt text
- Screenshots become outdated quickly; use sparingly

### Prefer text-based diagrams

- Use Mermaid diagrams where possible
- Ensure diagrams render as SVG (text is highlightable/searchable)
- Provide text descriptions of complex diagrams

### Video and GIFs

- Videos rarely make step-by-step tasks easier to follow
- Use videos as supplemental aids, not primary instruction
- GIFs should be short and focused
- Always provide text alternatives for video content

## Effective patterns

### Progressive disclosure

- Start with overview
- Link to detailed pages
- Provide examples at each level
- Offer advanced topics separately

### Consistent structure

- Same pattern for similar content
- Predictable navigation
- Standard page layouts
- Template-based authoring

### Clear prerequisites

- State requirements upfront
- Link to setup instructions
- Version specifications
- Access requirements

### Contextual help

- Right information, right place
- Inline tooltips
- Related articles
- Next steps

## Docs-as-code workflows

### Version control

- Documentation in Git
- Branch for changes
- Pull request review
- Automated deployment

### CI/CD integration

- Automated builds
- Link checking
- Style linting
- Preview deployments

### Review processes

- Technical review (accuracy)
- Editorial review (clarity, style)
- Subject matter expert review
- User testing when possible

### Static site generators

- Common tools: Docusaurus, Hugo, Jekyll, Gatsby, Astro
- Benefits: Fast, version controlled, customizable
- Trade-offs: Requires technical comfort
