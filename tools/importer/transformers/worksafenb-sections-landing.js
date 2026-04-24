/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: section-landing template section breaks and metadata.
 *
 * Runs in `beforeTransform` so it can query original DOM selectors before parsers
 * replace elements with block tables. Inserts <hr> before every non-first section
 * and adds a Section Metadata block after sections that declare a `style`.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName !== TransformHook.beforeTransform) return;
  const tmpl = payload && payload.template;
  if (!tmpl || tmpl.name !== 'section-landing') return;
  const sections = tmpl.sections;
  if (!sections || sections.length < 2) return;

  const document = element.ownerDocument || element;

  // Process sections in reverse to avoid index shifts
  for (let i = sections.length - 1; i >= 0; i--) {
    const section = sections[i];
    const sectionEl = element.querySelector(section.selector);
    if (!sectionEl) continue;

    if (section.style) {
      const sectionMetadata = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      sectionEl.after(sectionMetadata);
    }

    if (i > 0) {
      const hr = document.createElement('hr');
      sectionEl.before(hr);
    }
  }
}
