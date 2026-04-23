/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WorkSafeNB section breaks and section metadata.
 * Inserts <hr> between sections and adds Section Metadata blocks for styled sections.
 * Processes sections from payload.template.sections in reverse order.
 * All selectors from page-templates.json, validated against migration-work/cleaned.html.
 *
 * Sections defined in template:
 *   1. Hero Carousel       -> .home-carousel-container (no style, first section - no <hr>)
 *   2. News and Sidebar     -> .container > .row:nth-of-type(2) (no style)
 *   3. Feature Cards        -> .container > .row:nth-of-type(3) (no style)
 *   4. Tabs Section         -> .home-page-tabs (no style)
 *   5. E-News and Connect   -> .row.toolbar (style: dark)
 *   6. Footer               -> .footer-top (style: dark) - may be removed by cleanup transformer
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    const sections = payload && payload.template && payload.template.sections;
    if (!sections || sections.length < 2) return;

    const document = element.ownerDocument || element;

    // Process sections in reverse order to avoid index shifts
    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      const sectionEl = element.querySelector(section.selector);

      if (!sectionEl) continue;

      // Add Section Metadata block if the section has a style
      if (section.style) {
        const sectionMetadata = WebImporter.Blocks.createBlock(document, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        sectionEl.after(sectionMetadata);
      }

      // Insert <hr> before every non-first section to create section breaks
      if (i > 0) {
        const hr = document.createElement('hr');
        sectionEl.before(hr);
      }
    }
  }
}
