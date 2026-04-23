/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-carousel
 * Base block: hero
 * Source: https://www.worksafenb.ca/
 * Selector: .home-carousel-container
 *
 * Source structure:
 *   .home-carousel-container > .bx-wrapper > .bx-viewport > ul#home-carousel
 *     > a (with optional .bx-clone class) > li.slide > h1
 *
 * Extracts ALL non-clone slides as separate rows in the hero-carousel block.
 * Each row: image (if available) | heading + CTA link
 * The form67 promotional image is used as background for the first slide.
 */
export default function parse(element, { document }) {
  const slideLinks = element.querySelectorAll('#home-carousel > a:not(.bx-clone)');

  if (slideLinks.length === 0) return;

  const cells = [];

  slideLinks.forEach((link, index) => {
    const slide = link.querySelector('li.slide, .slide');
    const heading = slide ? slide.querySelector('h1, h2, h3') : link.querySelector('h1, h2, h3');
    const href = link.getAttribute('href') || '';
    const title = link.getAttribute('title') || '';

    const headingText = heading ? heading.textContent.trim() : title;
    if (!headingText && !href) return;

    const imageCell = document.createElement('div');

    if (slide) {
      const bgStyle = window.getComputedStyle(slide).backgroundImage;
      const urlMatch = bgStyle && bgStyle !== 'none' ? bgStyle.match(/url\(["']?([^"')]+)["']?\)/) : null;
      if (urlMatch) {
        const img = document.createElement('img');
        img.src = urlMatch[1];
        img.alt = headingText || '';
        imageCell.append(img);
      }
    }

    const contentCell = document.createElement('div');

    if (headingText) {
      const h2 = document.createElement('h2');
      h2.textContent = headingText;
      contentCell.append(h2);
    }

    if (href) {
      const p = document.createElement('p');
      const cta = document.createElement('a');
      cta.href = href;
      cta.textContent = title || headingText || 'Learn More';
      p.append(cta);
      contentCell.append(p);
    }

    cells.push([imageCell, contentCell]);
  });

  if (cells.length === 0) return;

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'hero-carousel',
    cells,
  });

  element.replaceWith(block);
}
