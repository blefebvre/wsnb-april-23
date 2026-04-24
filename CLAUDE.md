see @AGENTS.md

## WorkSafeNB Migration Notes

### Site Info
- Source: https://www.worksafenb.ca/
- Font: Open Sans (Google Fonts), all weights 300-700
- Brand colors: navy `#003d69`, accent rust `#cd6d1c`, light blue border `#c2dae6`, gradient blue `#dbecf3`, footer light `#e9f2fe`
- Body text: `#5f5f5f`, headings: `#343434`, links: `#000`
- Container max-width: 970px (matches original Bootstrap container)

### Content Import
- Import script: `tools/importer/import-homepage.js`
- Bundle before running: use `aem-import-bundle.sh --importjs tools/importer/import-homepage.js`
- Run import: `run-bulk-import.js --import-script tools/importer/import-homepage.bundle.js --urls tools/importer/urls-homepage.txt`
- URLs must be passed as a file path, not a bare URL string
- Content outputs to `content/index.plain.html`

### Parser Lessons
- **CSS background images**: The original site uses inline `style="background:url(...)"` on many elements (carousel slides, feature cards). Parsers must extract from `box.getAttribute('style')` first, then fall back to `window.getComputedStyle(box).backgroundImage`. The shorthand `background:` property needs a different regex than `background-image:`.
- **Multi-instance selectors**: When a selector like `.col-sm-4 .feature-box` matches multiple elements, the parser is invoked once per match. Use a `data-*` attribute on the parent container to prevent duplicate block creation. On first invocation, collect all siblings, build the block, then on subsequent invocations check the flag and bail out. Use `row.before(block); row.remove()` rather than `element.replaceWith(block)` to avoid orphan content.
- **No `<picture>` tags**: Imported images render as bare `<img>` inside `<p>`, not `<picture>` elements. Block JS that looks for `picture` tags will fail — always use `querySelector('picture, img')`.
- **Re-bundle after parser changes**: Every parser edit requires re-bundling and re-importing to see results.

### Block Variant Architecture
- Carousel content uses `carousel-homepage` (based on carousel block collection), NOT `hero-carousel`
- Cards use `cards-feature`, columns use `columns-news` and `columns-contact`, tabs use `tabs-resources`
- Each variant has its own directory under `blocks/` with JS, CSS, and metadata.json

### Header/Nav Structure
- Original has two-row nav: navy utility bar (53px) on top, grey main nav (61px) below, total 114px
- EDS header uses 3 sections: brand, sections, tools — mapped as: brand=logo, sections=main nav links, tools=utility links
- Desktop layout uses CSS `flex-wrap: wrap` with tools `order: -1` and `width: 100%` to push tools to top row. Brand uses `position: absolute` to overlap both rows.
- Nav wrapper gets `background: linear-gradient(to bottom, var(--brand-primary) 53px, var(--light-color) 53px)` for the split background effect
- Logo image has `border: 4px solid #fff` to create white frame effect overlapping both bars
- `--nav-height` in styles.css must be 114px to reserve correct header space
- Fragment loader injects `<meta>`, `<link>`, `<script>` tags into nav fragment DOM. Header JS must filter to only `.section` divs: `fragment.querySelectorAll(':scope .section')` instead of `fragment.firstElementChild`
- Same fragment fix needed in footer.js
- Strip `.button` / `.button-container` classes from nav links — EDS auto-wraps links in `<p>` tags which get button styling

### Footer Structure
- Two sections: navy top (address), light blue bottom (copyright + disclaimer)
- Content in `content/footer.plain.html` and `footer.plain.html` (root copy needed for dev server)
- Nav content similarly needs both `content/nav.plain.html` and `nav.plain.html`

### CSS Lessons
- **Flex gap overflow**: Using `gap: 30px` with percentage column widths (66% + 33%) causes the container to exceed max-width. Use `flex: 2 1 0` and `flex: 1 1 0` instead of fixed percentages so gap is subtracted from available space.
- **`overflow: hidden` for border-radius**: When a child element (like a gradient header) extends to the edge of a rounded-corner container, add `overflow: hidden` to the container to clip it properly.
- **`pointer-events: none`**: Use on overlay elements (like carousel heading bar) that should be visible but not block clicks on elements underneath.
- **Stylelint `no-descending-specificity`**: When `.nav-tools a` must come after `.nav-sections a` due to logical grouping, use `/* stylelint-disable-next-line no-descending-specificity */`.
- **`moveInstrumentation` import**: Not available in `scripts.js` in this project. Remove the import and all calls from block JS files (cards-feature, tabs-resources) to avoid lint errors.
- **Block wrapper max-width**: Use `.block-name-container .block-name-wrapper { max-width: var(--container-max-width); margin: 0 auto; }` to constrain blocks to 970px while allowing section backgrounds to extend full width.

### Carousel Clickability
- Carousel slides need the image wrapped in an `<a>` tag for clickability
- The `decorate` JS finds the link from the content column and wraps the `<img>` (not `<picture>`) in it
- Content overlay (heading bar) needs `pointer-events: none` so clicks pass through to the link underneath
- The link class `carousel-homepage-slide-link` gets `position: absolute; inset: 0` to cover the full slide

### Dev Server
- Start: `npx -y @adobe/aem-cli up --no-open --port 3000`
- Serves local `.plain.html` files from `content/` directory
- Proxies missing content to remote origin configured in the project
- Page at `/content/index` — the dev server fetches `/content/index.plain.html` locally
- Playwright browser at `/ms-playwright/chromium-1217/chrome-linux64/chrome` for headless screenshots
