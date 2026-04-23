/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel-homepage
 * Base block: carousel
 * Source: https://www.worksafenb.ca/
 * Selector: .home-carousel-container
 *
 * Extracts ALL non-clone slides. Each row: image | heading + CTA link.
 * Background images are extracted via getComputedStyle on each slide.
 */
export default function parse(element, { document }) {
  const slideLinks = element.querySelectorAll('#home-carousel > a:not(.bx-clone)');

  if (slideLinks.length === 0) return;

  const cells = [];

  slideLinks.forEach((link) => {
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
    name: 'carousel-homepage',
    cells,
  });

  element.replaceWith(block);
}
