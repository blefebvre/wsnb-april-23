see @AGENTS.md

## Project Identity

- **Source site**: https://www.worksafenb.ca/
- **Project type**: `doc` (document-based authoring)
- **Org/site**: `blefebvre/wsnb-april-23`
- **Block library**: `https://main--sta-boilerplate--aemdemos.aem.page/tools/sidekick/library.json`
- **Content host**: `https://content.da.live/blefebvre/wsnb-april-23/`
- **Preview URL**: `https://main--wsnb-april-23--blefebvre.aem.page/`
- **Live URL**: `https://main--wsnb-april-23--blefebvre.aem.live/`
- **Config files**: `.migration/project.json`, `.excat/preview-config.json`

## Design Tokens

- Font: Open Sans (Google Fonts), weights 300-700
- Brand navy: `#003d69`, accent rust: `#cd6d1c`, light blue border: `#c2dae6`, gradient blue: `#dbecf3`, footer light: `#e9f2fe`
- Body text: `#5f5f5f`, headings: `#343434`, links: `#000`
- Container max-width: `970px`
- Nav height: `114px` (53px utility + 61px main)

## Import Tooling

Scripts live under the excat marketplace, NOT on PATH:
```
SCRIPTS=/home/node/.excat-marketplace/excat/skills/excat-content-import/scripts
```

Full commands:
```bash
# Bundle
$SCRIPTS/aem-import-bundle.sh --importjs tools/importer/import-homepage.js

# Import (URLs must be a file path, not a bare URL)
node $SCRIPTS/run-bulk-import.js \
  --import-script tools/importer/import-homepage.bundle.js \
  --urls tools/importer/urls-homepage.txt

# Validate infrastructure
node $SCRIPTS/validate-bulk-import.js
```

**Every parser edit requires re-bundling and re-importing.**

## Migration Artifacts

| File | Purpose |
|------|---------|
| `tools/importer/page-templates.json` | Block mapping manifest — selectors, sections, block names per template |
| `tools/importer/import-{template}.js` | Import script per template (orchestrates parsers + transformers) — currently `import-homepage.js` and `import-section-landing.js` |
| `tools/importer/import-{template}.bundle.js` | Bundled import script (what `run-bulk-import.js` actually uses) |
| `tools/importer/parsers/*.js` | One parser per block variant |
| `tools/importer/transformers/*.js` | Site-wide DOM cleanup + per-template section break insertion. `worksafenb-sections.js` for homepage (runs `afterTransform`), `worksafenb-sections-landing.js` for section-landing (runs `beforeTransform` so it can query original selectors like `.row.toolbar` before parsers replace them). |
| `tools/importer/urls-{template}.txt` | URL list per template |
| `tools/importer/reports/{path}.report.json` | Per-URL import status |
| `tools/importer/reports/import-{template}.report.xlsx` | Compiled import report per template |
| `migration-work/` | Scrape artifacts (cleaned.html, screenshot, metadata, images, analysis JSON) |
| `blocks/*/metadata.json` | Variant tracking — visual characteristics, reuse guidance, usage counts. Update `pagesUsing` and `reuseCount` when reusing a variant on a new page. |

## Migration Scope

Two templates migrated:
- **homepage** — `https://www.worksafenb.ca/` (1 URL)
- **section-landing** — `https://www.worksafenb.ca/employers/`, `/workers/`, `/health-care/`, `/policy-and-legal/` (4 URLs)

## Block Variants

Homepage variants (import-homepage.js):
- `carousel-homepage` — 5-slide carousel (based on block collection `carousel`)
- `columns-news` — news list + sidebar images
- `cards-feature` — 3 feature cards with CSS background images
- `tabs-resources` — 5-tab resource browser
- `columns-contact` — newsletter signup + contact info. **Shared with section-landing pages — parser handles both layouts (homepage side-by-side .col-sm-8/.col-sm-4 AND stacked .col-sm-12)**

Section-landing variants (import-section-landing.js):
- `nav-panel` — batched 3-column grid of gradient-header + link list panels (with View All toggle). One block per `.row.clearfix`.
- `cards-overlay` — single image-overlay card (background image + caption bar)
- `announcements` — default content (H2 + list + View All) for the healthcare news widget

**Boilerplate blocks (not customized, not directly used by imported content):**
- `blocks/hero/`, `blocks/cards/`, `blocks/columns/` — vanilla copies from boilerplate. Variant blocks above are used instead.
- `blocks/metadata/` — no-op stub. `WebImporter.rules.createMetadata` emits a `<div class="metadata">` page block in every import; aem.live hoists its content into `<head>` at publish time, but local dev needs the stub to prevent 404s.

**Deprecated — do not wire up:**
- `blocks/hero-carousel/` — replaced by `carousel-homepage`.

## Auto-Blocking Warning

`scripts/scripts.js` contains `buildHeroBlock()` which auto-wraps `h1 + picture` in a hero block. The homepage carousel doesn't trigger this (no bare h1+picture at top of main), but other pages could. Disable or guard this if importing pages with leading h1+image that shouldn't become heroes.

## Nav / Footer Content

**Canonical files are in `content/`**. Root copies are needed because the dev server resolves `/nav.plain.html` and `/footer.plain.html` from the working directory root.

After editing, always sync:
```bash
cp content/nav.plain.html nav.plain.html
cp content/footer.plain.html footer.plain.html
```

Currently the files are in sync. If they diverge, `content/` is the source of truth.

## Header Structure (Two-Row Nav)

Desktop layout is a two-row nav built from EDS's 3-section structure:
- **Tools** (`order: -1`, `width: 100%`) → top navy utility bar (53px)
- **Brand** (`position: absolute`, centered vertically) → logo overlapping both rows
- **Sections** (`width: 100%`) → bottom grey main nav (61px)

Key CSS techniques:
- `background: linear-gradient(...)` on `.nav-wrapper` creates the split navy/grey background
- Logo uses `border: 4px solid #fff` for white frame effect
- Brand positioned with `position: absolute; left: 15px; top: 50%; transform: translateY(-50%)`
- Fragment loader injects head.html tags into nav DOM — header.js must filter: `fragment.querySelectorAll(':scope .section')`. Same fix in footer.js.
- Strip `.button` / `.button-container` classes from all nav links (EDS auto-wraps `<p><a>` as buttons)

## Section Styles

The section transformer creates `style: "dark"` metadata on sections 5 and 6. Corresponding CSS in styles.css:
```css
main .section.dark { background-color: #003d69; color: #fff; padding: 30px 0; }
main .section.dark h2..h6 { color: #fff; }
main .section.dark a:any-link { color: #fff; }
```

## Parser Gotchas

1. **CSS background images**: Original uses inline `style="background:url(...)"` (shorthand, not `background-image`). Extract from `getAttribute('style')` first, fall back to `getComputedStyle().backgroundImage`.
2. **Multi-instance selectors**: When a selector matches N elements, the parser runs N times. Use a `data-*` flag on the parent to run once. Collect all siblings, build block, then `row.before(block); row.remove()`. Don't use `element.replaceWith(block)` — it orphans siblings.
3. **No `<picture>` tags**: Imported images are bare `<img>` in `<p>`, not `<picture>`. Always query `'picture, img'`.
4. **Button class stripping**: Any block with linked images needs to strip `.button`/`.button-container` classes in its decorate JS, or the links get button styling.
5. **Parser ordering when multiple blocks share a row**: When a parser for block A and block B both match elements inside the same `.row.clearfix` (e.g. section-landing has nav-panels + cards-overlay side by side), order matters. `findBlocksOnPage` iterates `template.blocks[]` in array order. The "outer" parser (nav-panel, which collapses the whole row) must run AFTER the "inner" parsers (cards-overlay). Also: the outer parser must NOT do `row.remove()` — only remove the columns it owns — or it will wipe out blocks the inner parsers already placed.
6. **Guard against detached elements**: After earlier parsers run, `block.element` may have been removed/replaced. Check `block.element.isConnected` before invoking the parser.
7. **Section transformer timing**: If a transformer needs to place `<hr>` or Section Metadata by original DOM selectors (e.g. `.row.toolbar`), run it in `beforeTransform` — once parsers replace elements with block tables, those selectors no longer match.

## Carousel Contract

`carousel-homepage.js` (167 lines) expects each row to have two columns:
- **Column 1**: Image (img or picture)
- **Column 2**: Heading (h2) + paragraph with link

The decorate function: wraps column 1's image in an `<a>` using column 2's link href, removes the `<p>` from column 2, then builds the slide. Content overlay uses `pointer-events: none` so clicks pass through to the image link underneath.

## CSS Pitfalls

- **Flex gap + percentage widths**: `gap: 30px` with `width: 66%` + `width: 33%` overflows the container. Use `flex: 2 1 0` / `flex: 1 1 0` instead.
- **`overflow: hidden` for border-radius**: Required when child content (e.g. gradient header) bleeds past rounded corners.
- **Block wrapper max-width**: `.[block]-container .[block]-wrapper { max-width: var(--container-max-width); margin: 0 auto; }` constrains content while allowing section backgrounds to go full-width.
- **Stylelint `no-descending-specificity`**: Use `/* stylelint-disable-next-line no-descending-specificity */` when selectors are logically grouped but specificity order differs (e.g. `.nav-tools a` after `.nav-sections a:hover`).

## Lint State

As of this session, all project JS and CSS files pass lint:
- `blocks/**/*.js`, `scripts/*.js` — ESLint clean
- `blocks/**/*.css`, `styles/styles.css` — Stylelint clean
- `tools/importer/**/*.js` — these have `/* eslint-disable */` and are excluded; `npm run lint` reports errors from these but they're expected.

## Dev Server

```bash
npx -y @adobe/aem-cli up --no-open --port 3000
```
- Serves local `.plain.html` from `content/` directory
- Proxies missing content to `https://main--wsnb-april-23--blefebvre.aem.page`
- Homepage at `http://localhost:3000/content/index`
- Headless Chromium for screenshots: `/ms-playwright/chromium-1217/chrome-linux64/chrome`

## PR Process

Per AGENTS.md: PRs must include a preview URL in the description body:
```
https://{branch}--wsnb-april-23--blefebvre.aem.page/content/index
```
