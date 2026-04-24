/* eslint-disable */
/* global WebImporter */

/**
 * Parser for nav-panel
 * Base block: nav-panel
 * Source: WorkSafeNB section landing pages (/employers/, /workers/, etc.)
 * Selector: .side-nav.section-nav
 *
 * Content model (each row is one panel):
 *   Column 1: heading text (from sibling .gradient-header)
 *   Column 2: <ul> of "shown" items (li.show-menu-item)
 *   Column 3 (optional): <ul> of "hidden" items (li.hide-menu-item)
 *
 * Batches all .side-nav.section-nav panels within a single .row.clearfix into one block.
 * After the block is created, the source .col-md-* columns that contained panels are
 * removed — but the row itself is preserved so that other blocks (e.g. cards-overlay)
 * already placed in the row via prior parsers are not discarded.
 */
export default function parse(element, { document }) {
  // Find the enclosing row
  const row = element.closest('.row.clearfix') || element.closest('.row');
  if (!row) return;

  // Already processed: just remove this panel's column wrapper
  if (row.dataset.navPanelParsed) {
    const col = element.closest('[class*="col-md"]');
    if (col && col.parentElement === row) col.remove();
    else element.remove();
    return;
  }
  row.dataset.navPanelParsed = 'true';

  // Collect all panels in this row in document order
  const panels = Array.from(row.querySelectorAll('.side-nav.section-nav'));
  if (panels.length === 0) return;

  const cells = [];
  const colsToRemove = new Set();

  panels.forEach((panel) => {
    const col = panel.closest('[class*="col-md"]');
    if (col && col.parentElement === row) colsToRemove.add(col);

    let headingEl = null;
    if (col) headingEl = col.querySelector('.gradient-header');
    const headingText = headingEl ? headingEl.textContent.trim() : '';

    const allItems = Array.from(panel.querySelectorAll(':scope > ul > li'));
    const shownItems = allItems.filter((li) => !li.className.includes('hide-menu-item'));
    const hiddenItems = allItems.filter((li) => li.className.includes('hide-menu-item'));

    const buildList = (items) => {
      if (items.length === 0) return null;
      const ul = document.createElement('ul');
      items.forEach((srcLi) => {
        const li = document.createElement('li');
        const links = Array.from(srcLi.querySelectorAll('a'));
        if (links.length > 0) {
          links.forEach((src, idx) => {
            const a = document.createElement('a');
            a.href = src.getAttribute('href') || '';
            a.textContent = src.textContent.trim();
            if (src.getAttribute('title')) a.title = src.getAttribute('title');
            if (idx > 0) li.append(' | ');
            li.append(a);
          });
        } else {
          li.textContent = srcLi.textContent.trim();
        }
        ul.append(li);
      });
      return ul;
    };

    const headingCell = document.createElement('div');
    headingCell.textContent = headingText;

    const shownCell = document.createElement('div');
    const shownList = buildList(shownItems);
    if (shownList) shownCell.append(shownList);

    const hiddenCell = document.createElement('div');
    const hiddenList = buildList(hiddenItems);
    if (hiddenList) hiddenCell.append(hiddenList);

    cells.push([headingCell, shownCell, hiddenCell]);
  });

  if (cells.length === 0) return;

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'nav-panel',
    cells,
  });

  // Insert block BEFORE the row (keeping row + any cards-overlay siblings inside it)
  row.before(block);

  // Remove only the columns that held panels - other content (cards-overlay blocks)
  // already placed in the row stays intact.
  colsToRemove.forEach((c) => c.remove());
}
