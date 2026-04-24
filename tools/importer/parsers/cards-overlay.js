/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-overlay
 * Base block: cards
 * Source: WorkSafeNB section landing pages (/workers/, /health-care/)
 * Selector: .image-with-overlay
 *
 * Source structure:
 *   <a href="..."><div class="image-with-overlay" style="background:url(...)"><p>Label <br><span></span></p></div></a>
 * (or without wrapping anchor)
 *
 * Extracts background-image URL from inline style, plus caption text and link href.
 * Emits one card per .image-with-overlay instance.
 */
export default function parse(element, { document }) {
  if (!element) return;

  // Resolve the wrapping anchor (if any)
  const anchor = element.closest('a');
  const label = element.querySelector('p');
  const labelText = label ? label.textContent.trim().replace(/\s+/g, ' ') : '';
  const href = anchor ? (anchor.getAttribute('href') || '') : '';

  // Extract background image URL from inline style (shorthand "background:url(...)")
  let imgSrc = '';
  const style = element.getAttribute('style') || '';
  const bgMatch = style.match(/url\(['"]?([^'")\s]+)['"]?\)/);
  if (bgMatch && bgMatch[1]) {
    imgSrc = bgMatch[1];
    if (imgSrc.startsWith('/')) imgSrc = 'https://www.worksafenb.ca' + imgSrc;
  }
  if (!imgSrc) {
    const bgComputed = window.getComputedStyle(element).backgroundImage;
    const compMatch = bgComputed && bgComputed !== 'none'
      ? bgComputed.match(/url\(["']?([^"')]+)["']?\)/)
      : null;
    if (compMatch) imgSrc = compMatch[1];
  }

  // Build cells: single row with [image | caption]
  const imageCell = document.createElement('div');
  if (imgSrc) {
    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = labelText || '';
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

  const cells = [[imageCell, textCell]];
  const block = WebImporter.Blocks.createBlock(document, {
    name: 'cards-overlay',
    cells,
  });

  // Replace the enclosing column if present, otherwise the anchor or element
  const replaceTarget = anchor && anchor.parentElement ? anchor : element;
  const col = replaceTarget.closest('.col-md-4, [class*="col-md"]');
  if (col && col.parentElement) {
    col.before(block);
    col.remove();
  } else {
    replaceTarget.replaceWith(block);
  }
}
