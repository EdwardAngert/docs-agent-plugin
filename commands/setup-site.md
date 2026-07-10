---
description: "Generate site navigation from the docs' own metadata, scaffolding a minimal Docusaurus or MkDocs setup when no site exists"
argument-hint: [docusaurus | mkdocs]
---

# Set Up the Docs Site

Turn the metadata the plugin already maintains into a navigable docs site.

The docs carry rich structure (frontmatter content types and descriptions, `llms.txt` in reader-priority order), but nothing turned that structure into navigation.
This command does, and nothing more: it is deliberately not a site builder.
It generates navigation from metadata, scaffolds a minimal generator setup when none exists, and leaves theming, hosting, and customization to the team.

The optional argument (`$ARGUMENTS`) names a generator to skip the selection question.

## Process

### 1. Detect What Exists

- Look for an existing static site generator: `docusaurus.config.*`, `mkdocs.yml`, `astro.config.*`, `_config.yml` (Jekyll), `config.toml`/`hugo.toml` (Hugo).
- Read `.docs-assist/config.yml` for `docs_dir`, and `llms.txt` for the docs map. A missing or stale `llms.txt` is a blocker worth fixing first: offer `/docs-assist:agent-ready`, since the map is the navigation source (see `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/llms-txt.md`).

### 2. Scaffold Only When Nothing Exists

When no generator is present, offer one, using `$ARGUMENTS` if given:

- **Docusaurus**: the richer default for product docs. Scaffold the minimal config wired to `docs_dir`, no theme customization.
- **MkDocs**: the lighter default. Scaffold a minimal `mkdocs.yml` wired to `docs_dir`.

Keep the scaffold small enough to read in one sitting. If a generator this command does not scaffold is already present (Astro, Hugo, Jekyll), skip to navigation and adapt to its format where the mapping is unambiguous; say plainly what you cannot generate for it.

### 3. Generate Navigation From the Metadata

The metadata is the source of truth; the navigation is derived, never hand-invented here.

- **Order comes from `llms.txt`**: its reader-priority order becomes the sidebar order, and its sections become navigation groups.
- **Labels come from frontmatter**: `title` for the label, `description` where the generator supports hover or index text.
- Write the generator's navigation format: `sidebars.js` for Docusaurus, the `nav` block in `mkdocs.yml` for MkDocs.
- **Never silently overwrite navigation someone curated.** If a sidebar or nav block exists, show the diff and confirm. Preserve entries for pages outside the docs set.

### 4. Verify and Hand Off

- Confirm every navigation entry resolves to a real file, and every doc in `llms.txt` is either in the navigation or intentionally excluded (say which).
- Offer the build command (`npx docusaurus build`, `mkdocs build`) rather than running it unasked; the first build is the team's moment to see the site.
- The branch delivery rule applies: this touches config plus navigation, so offer a docs branch.
- Note the maintenance loop: when docs change, `/docs-assist:update` keeps `llms.txt` true, and re-running this command regenerates the navigation from it.

## Notes

- Metadata first, always. If the navigation looks wrong, the fix is the metadata (order in `llms.txt`, titles in frontmatter), not a hand-edit here; hand-edits drift.
- Respect SSG-required frontmatter per `${CLAUDE_PLUGIN_ROOT}/skills/docs-assist/reference/frontmatter-spec.md`; scaffolding must not break an existing build.
- Theming, search, versioning, and deployment are out of scope. Recommend the generator's own docs for those.
