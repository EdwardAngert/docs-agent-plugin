# Information Architecture Methodology

How to design and evaluate the structure of a documentation set: how docs are grouped, named, and connected so readers can find what they need.

The design principles below are what you apply when planning or restructuring docs.
The validation methods at the end need real users, so treat them as recommendations to the docs lead, not steps you run yourself.

## Design Principles You Apply

Use these when proposing a structure in `/docs-assist:plan` or recommending changes in `/docs-assist:audit`.

- **Match user mental models**, not the org chart. Group by what readers are trying to do.
- **Progressive disclosure**: lead with an overview, link to detail. Do not front-load everything.
- **Clear hierarchy**: three to four levels at most.
- **Consistent patterns**: similar things live in similar places and follow the same shape.
- **Logical grouping**: related topics sit together, connected by cross-references.

## Choose an Organization Pattern

Pick the pattern that fits how readers approach the content:

- **Task-based**: organized by user goals. The default for product docs.
- **Topic-based**: organized by subject matter. Good for conceptual material.
- **Reference**: alphabetical or categorized for lookup.
- **Hybrid**: task-based navigation with a reference section, chosen per content type.

## Design Navigation

- **Global navigation**: always accessible, covers the top-level structure.
- **Local navigation**: context-specific, shows where the reader is within a section.
- **Cross-references**: connect related topics so readers do not hit dead ends.
- **Breadcrumbs**: show location within the hierarchy.
- **Search**: well-indexed and filterable, supported by good frontmatter (see `frontmatter-spec.md`).

## Plan a Migration

When restructuring an existing set:

1. Create the new structure.
1. Map old URLs to new ones and set up redirects.
1. Update internal links.
1. Communicate the change to readers and contributors.
1. Monitor for broken links and lost traffic.

## Validate With Real Users (Reference)

These methods confirm a structure works, but they need participants and analytics you do not have in a session. Recommend them to the docs lead when the stakes justify it.

- **Tree testing**: can users find a given item in the proposed structure?
- **First-click testing**: do users start down the right path?
- **User interviews**: does the structure match how they think?
- **Analytics review**: time to find information, search success rate, navigation depth, bounce rate, and support-ticket volume.

When results are available, feed them back into the design principles above.
When they are not, propose the structure from the codebase and existing docs, and note where validation would reduce risk.
