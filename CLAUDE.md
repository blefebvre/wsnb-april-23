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
| `tools/importer/import-homepage.js` | Import script (orchestrates parsers + transformers) |
| `tools/importer/import-homepage.bundle.js` | Bundled import script (what `run-bulk-import.js` actually uses) |
| `tools/importer/parsers/*.js` | One parser per block variant |
| `tools/importer/transformers/*.js` | Site-wide DOM cleanup and section break insertion |
| `tools/importer/urls-homepage.txt` | URL list for import |
| `tools/importer/reports/index.report.json` | Last import status |
| `tools/importer/reports/import-homepage.report.xlsx` | Compiled import report |
| `migration-work/` | Scrape artifacts (cleaned.html, screenshot, metadata, images, analysis JSON) |
| `blocks/*/metadata.json` | Variant tracking — visual characteristics, reuse guidance, usage counts. Update `pagesUsing` and `reuseCount` when reusing a variant on a new page. |

## Migration Scope

Only the homepage (`https://www.worksafenb.ca/`) has been migrated. The `homepage` template in `page-templates.json` currently covers one URL. No other pages are planned yet.

## Block Variants

Active variants wired into import-homepage.js:
- `carousel-homepage` — 5-slide carousel (based on block collection `carousel`)
- `columns-news` — news list + sidebar images
- `cards-feature` — 3 feature cards with CSS background images
- `tabs-resources` — 5-tab resource browser
- `columns-contact` — newsletter signup + contact info

**Deprecated — do not wire up:**
- `blocks/hero-carousel/` — replaced by `carousel-homepage`. Directory kept for reference but not used in any import script or page template. Safe to delete.

**Boilerplate blocks (not customized, not directly used by imported content):**
- `blocks/hero/`, `blocks/cards/`, `blocks/columns/` — vanilla copies from boilerplate. Variant blocks above are used instead.

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
