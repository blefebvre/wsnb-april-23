/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WorkSafeNB site-wide cleanup.
 * Removes non-authorable content (nav, footer, search widgets, alerts, carousel controls).
 * All selectors validated against migration-work/cleaned.html.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove carousel clone slides (bx-slider duplicates) - found at lines 180, 209 in cleaned.html
    WebImporter.DOMUtils.remove(element, ['.bx-clone']);

    // Remove carousel pager controls (non-authorable UI) - found at line 216 in cleaned.html
    WebImporter.DOMUtils.remove(element, ['.bx-controls']);

    // Remove Google Custom Search suggestion dropdown tables - found at lines 720, 730, 740 in cleaned.html
    WebImporter.DOMUtils.remove(element, ['table.gssb_c']);

    // Remove breadcrumb navigation (e.g. "Home > Workers") from section-landing pages
    WebImporter.DOMUtils.remove(element, ['.breadcrumb-container', 'ul.breadcrumb']);
  }

  if (hookName === TransformHook.afterTransform) {
    // Remove main navigation bar - found at line 6 in cleaned.html
    WebImporter.DOMUtils.remove(element, ['nav.navbar']);

    // Remove print-only logo image - found at line 5 in cleaned.html
    WebImporter.DOMUtils.remove(element, ['img.print-logo']);

    // Remove top waypoint spacer div - found at line 171 in cleaned.html
    WebImporter.DOMUtils.remove(element, ['#to-top-waypoint']);

    // Remove footer sections - found at lines 615, 688 in cleaned.html
    WebImporter.DOMUtils.remove(element, ['.footer-top', '.footer-bottom']);

    // Remove back-to-top button - found at line 698 in cleaned.html
    WebImporter.DOMUtils.remove(element, ['a.go-top']);

    // Remove bottom alert/notification bar - found at line 702 in cleaned.html
    WebImporter.DOMUtils.remove(element, ['.alert-message-container-bottom']);

    // Remove Google Custom Search containers (in nav and footer) - found in multiple locations in cleaned.html
    WebImporter.DOMUtils.remove(element, ['.search-container']);

    // Remove noscript elements (GTM etc.)
    WebImporter.DOMUtils.remove(element, ['noscript']);

    // Remove empty trailing divs - found at line 750 in cleaned.html
    const emptyDivs = element.querySelectorAll('body > div:empty');
    emptyDivs.forEach((div) => {
      if (!div.id && !div.className) div.remove();
    });
  }
}
