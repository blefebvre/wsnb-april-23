/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-feature
 * Base block: cards
 * Source: https://www.worksafenb.ca/
 * Selector: .col-sm-4 .feature-box
 *
 * Each card is: .col-sm-4 > a > .feature-box[style="background:url(...)"] > p
 * Images are inline CSS background (shorthand), not <img> tags.
 * On first invocation, collects all 3 cards from the parent .row,
 * replaces the element with the block, and removes the remaining siblings.
 */
export default function parse(element, { document }) {
  if (!element.parentElement) return;

  const col = element.closest('.col-sm-4');
  const row = col ? col.closest('.row') : null;

  if (!row) return;

  if (row.dataset.cardsFeatureParsed) {
    if (col && col.parentElement) col.remove();
    else element.remove();
    return;
  }
  row.dataset.cardsFeatureParsed = 'true';

  const cols = Array.from(row.querySelectorAll('.col-sm-4'));
  const cells = [];

  cols.forEach((c) => {
    const anchor = c.querySelector('a');
    const box = c.querySelector('.feature-box');
    if (!box) return;

    const label = box.querySelector('p');
    const labelText = label ? label.textContent.trim() : '';
    const href = anchor ? (anchor.getAttribute('href') || '') : '';

    let imgSrc = '';
    const style = box.getAttribute('style') || '';
    const bgMatch = style.match(/url\(['"]?([^'")\s]+)['"]?\)/);
    if (bgMatch && bgMatch[1]) {
      imgSrc = bgMatch[1];
      if (imgSrc.startsWith('/')) imgSrc = 'https://www.worksafenb.ca' + imgSrc;
    }
    if (!imgSrc) {
      const bgComputed = window.getComputedStyle(box).backgroundImage;
      const compMatch = bgComputed && bgComputed !== 'none'
        ? bgComputed.match(/url\(["']?([^"')]+)["']?\)/)
        : null;
      if (compMatch) imgSrc = compMatch[1];
    }

    const imageCell = document.createElement('div');
    if (imgSrc) {
      const img = document.createElement('img');
      img.src = imgSrc;
      img.alt = labelText;
      imageCell.append(img);
    }

    const textCell = document.createElement('div');
    if (labelText) {
      const p = document.createElement('p');
      if (href) {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = labelText;
        p.append(a);
      } else {
        p.textContent = labelText;
      }
      textCell.append(p);
    }

    cells.push([imageCell, textCell]);
  });

  if (cells.length === 0) return;

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'cards-feature',
    cells,
  });

  row.before(block);
  row.remove();
}
