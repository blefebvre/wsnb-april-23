/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-feature variant.
 * Base block: cards
 * Source: https://www.worksafenb.ca/
 * Selector: .col-sm-4 .feature-box
 *
 * The selector matches individual .feature-box elements (one per card).
 * On the first invocation the parser navigates up to the shared .row parent,
 * collects all three sibling cards, builds one Cards block with all rows,
 * and replaces the passed element. A data attribute on the row prevents
 * subsequent invocations from creating duplicate blocks.
 *
 * Source structure (per card):
 *   .col-sm-4 > a > .feature-box
 *     CSS background-image  -> card image (no <img> tag in live DOM)
 *     p                     -> card text label
 *   The parent <a> provides the card link.
 *
 * Target: Cards block with 2 columns per row (image | text + link), one row per card.
 */
export default function parse(element, { document }) {
  // Guard: if this element has been detached from the DOM, skip.
  if (!element.parentElement) {
    return;
  }

  // Navigate up to the shared .row container that holds all .col-sm-4 cards.
  const row = element.closest('.row');

  // Guard: if the row was already processed by a prior invocation, skip.
  if (row && row.dataset.cardsFeatureParsed) {
    // Remove this element so it doesn't appear as leftover content.
    element.remove();
    return;
  }

  // Mark the row as processed to prevent duplicate blocks.
  if (row) {
    row.dataset.cardsFeatureParsed = 'true';
  }

  // Collect all feature-box elements from the row, or fall back to element itself.
  let featureBoxes;
  if (row) {
    featureBoxes = Array.from(row.querySelectorAll('.col-sm-4 .feature-box'));
  }
  if (!featureBoxes || featureBoxes.length === 0) {
    featureBoxes = [element];
  }

  // Build one row per card.
  const cells = [];

  featureBoxes.forEach((box) => {
    // --- Cell 1: Image ---
    // The live DOM uses CSS background-image on .feature-box (no <img> tags).
    // Extract the background-image URL and create an <img> element for the block.
    const imageCell = [];
    const img = box.querySelector('img');
    if (img) {
      // Fallback: if an <img> tag exists (e.g. in scraped/cached HTML), use it.
      const newImg = document.createElement('img');
      newImg.src = img.getAttribute('src') || img.src || '';
      const alt = img.getAttribute('alt') || '';
      if (alt) newImg.alt = alt;
      imageCell.push(newImg);
    } else {
      // Primary path: extract from CSS background-image.
      const bgStyle = box.style.backgroundImage
        || (typeof window !== 'undefined' ? window.getComputedStyle(box).backgroundImage : '');
      const bgMatch = bgStyle.match(/url\(["']?([^"')]+)["']?\)/);
      if (bgMatch && bgMatch[1]) {
        const newImg = document.createElement('img');
        newImg.src = bgMatch[1];
        imageCell.push(newImg);
      }
    }

    // --- Cell 2: Text + Link ---
    const textCell = [];

    const label = box.querySelector('p');
    const labelText = label ? label.textContent.trim() : '';

    // The link wraps the feature-box: .col-sm-4 > a > .feature-box
    let linkHref = '';
    const parentAnchor = box.closest('a');
    const childAnchor = box.querySelector('a');
    if (parentAnchor) {
      linkHref = parentAnchor.href || parentAnchor.getAttribute('href') || '';
    } else if (childAnchor) {
      linkHref = childAnchor.href || childAnchor.getAttribute('href') || '';
    }

    if (labelText && linkHref) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = linkHref;
      a.textContent = labelText;
      p.append(a);
      textCell.push(p);
    } else if (labelText) {
      const p = document.createElement('p');
      p.textContent = labelText;
      textCell.push(p);
    }

    if (imageCell.length > 0 || textCell.length > 0) {
      cells.push([imageCell, textCell]);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-feature', cells });
  element.replaceWith(block);
}
