/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-carousel
 * Base block: hero
 * Source: https://www.worksafenb.ca/
 * Selector: .home-carousel-container
 * Generated: 2026-04-23
 *
 * Source structure:
 *   .home-carousel-container > .bx-wrapper > .bx-viewport > ul#home-carousel
 *     > a (with optional .bx-clone class) > li.slide > h1
 *
 * Extracts the first non-clone slide's heading and link to produce a Hero block.
 * Background image row included only if an img element is found in the carousel.
 */
export default function parse(element, { document }) {
  // Find all slide links in the carousel, excluding bxSlider clones
  const slideLinks = element.querySelectorAll('#home-carousel > a:not(.bx-clone), ul > a:not(.bx-clone)');

  // Fall back to any anchor with a slide if no non-clone slides found
  const allLinks = slideLinks.length > 0
    ? slideLinks
    : element.querySelectorAll('a:not(.bx-clone)');

  // Get the first valid slide (one that has a heading)
  let targetLink = null;
  let targetHeading = null;

  for (const link of allLinks) {
    const heading = link.querySelector('h1, h2, h3, [class*="title"]');
    if (heading && heading.textContent.trim()) {
      targetLink = link;
      targetHeading = heading;
      break;
    }
  }

  const cells = [];

  // Row 1: Background image (optional - may be CSS background, not an img element)
  const bgImage = element.querySelector('img, picture, [style*="background-image"]');
  if (bgImage) {
    if (bgImage.tagName === 'IMG' || bgImage.tagName === 'PICTURE') {
      cells.push([bgImage]);
    } else {
      // Extract background-image URL from inline style
      const style = bgImage.getAttribute('style') || '';
      const urlMatch = style.match(/background-image:\s*url\(['"]?([^'")\s]+)['"]?\)/i);
      if (urlMatch) {
        const img = document.createElement('img');
        img.src = urlMatch[1];
        img.alt = '';
        cells.push([img]);
      }
    }
  }

  // Row 2: Heading text + CTA link (single cell containing both elements)
  const contentContainer = document.createElement('div');

  if (targetHeading) {
    const h1 = document.createElement('h1');
    h1.textContent = targetHeading.textContent.trim();
    contentContainer.append(h1);
  }

  if (targetLink) {
    const href = targetLink.getAttribute('href') || '';
    if (href) {
      // Create a paragraph to wrap the CTA link
      const p = document.createElement('p');
      const cta = document.createElement('a');
      cta.href = href;
      cta.textContent = targetLink.getAttribute('title') || targetHeading?.textContent.trim() || 'Learn More';
      p.append(cta);
      contentContainer.append(p);
    }
  }

  if (contentContainer.childNodes.length > 0) {
    cells.push([contentContainer]);
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'hero-carousel',
    cells,
  });

  element.replaceWith(block);
}
