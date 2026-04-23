/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-news variant.
 * Base block: columns
 * Source: https://www.worksafenb.ca/
 * Generated: 2026-04-23
 *
 * Two-column layout:
 *   Column 1 (left): News heading, list of news items (title link + date), "View All" link
 *   Column 2 (right): Two stacked feature box images linking to external resources
 *
 * This parser is invoked on multiple matched elements:
 *   - .col-md-8.news-widget (primary - builds the full block)
 *   - .col-md-4 .feature-box (secondary - skipped, content pulled from news-widget call)
 *
 * Source selectors (validated against source.html):
 *   - .gradient-header (news heading)
 *   - ul.news-items li (news list items with links and dates)
 *   - .show-more a (View All link)
 *   - .feature-box a > img (right column linked images, found via parent traversal)
 */
export default function parse(element, { document }) {
  // Only build the block when called on the news-widget element.
  // When called on a .feature-box element, remove it (content is consumed by the news-widget call).
  const isNewsWidget = element.classList.contains('news-widget')
    || element.querySelector('.news-widget');

  if (!isNewsWidget) {
    // This is a .feature-box element — remove it since it is consumed by the news-widget pass
    element.remove();
    return;
  }

  // Determine the scope for finding feature boxes.
  // They are siblings in a .col-md-4 next to .col-md-8.news-widget inside a shared .row parent.
  const parentRow = element.closest('.row') || element.parentElement;

  // --- Column 1: News content ---
  const col1Content = [];

  // Extract the "News" heading from .gradient-header
  const gradientHeader = element.querySelector('.gradient-header');
  if (gradientHeader) {
    const heading = document.createElement('h2');
    heading.textContent = gradientHeader.textContent.trim();
    col1Content.push(heading);
  }

  // Extract news items from ul.news-items li
  const newsItems = element.querySelectorAll('ul.news-items li');
  if (newsItems.length > 0) {
    const ul = document.createElement('ul');
    newsItems.forEach((item) => {
      const li = document.createElement('li');
      const link = item.querySelector('a');
      if (link) {
        const a = document.createElement('a');
        a.href = link.getAttribute('href') || '';
        a.textContent = link.textContent.trim();
        if (link.getAttribute('title')) {
          a.title = link.getAttribute('title');
        }
        li.appendChild(a);
      }
      // Extract date text (text node after <br>)
      const br = item.querySelector('br');
      if (br && br.nextSibling) {
        const dateText = br.nextSibling.textContent.trim();
        if (dateText) {
          li.appendChild(document.createTextNode(' - ' + dateText));
        }
      }
      ul.appendChild(li);
    });
    col1Content.push(ul);
  }

  // Extract "View All" link from .show-more a
  const viewAllLink = element.querySelector('.show-more a');
  if (viewAllLink) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = viewAllLink.getAttribute('href') || '';
    a.textContent = viewAllLink.textContent.trim();
    if (viewAllLink.getAttribute('title')) {
      a.title = viewAllLink.getAttribute('title');
    }
    p.appendChild(a);
    col1Content.push(p);
  }

  // --- Column 2: Feature box images ---
  const col2Content = [];

  // Find feature boxes from the parent row context (sibling .col-md-4 containers)
  // or directly as .feature-box siblings
  const featureBoxes = parentRow
    ? parentRow.querySelectorAll('.feature-box')
    : [];

  Array.from(featureBoxes).forEach((box) => {
    // Skip if this feature-box is inside the news-widget itself (shouldn't happen but defensive)
    if (element.contains(box)) return;

    const link = box.querySelector('a');
    const img = box.querySelector('img');
    if (link && img) {
      const a = document.createElement('a');
      a.href = link.getAttribute('href') || '';
      const image = document.createElement('img');
      image.src = img.getAttribute('src') || '';
      if (img.getAttribute('alt')) {
        image.alt = img.getAttribute('alt');
      }
      a.appendChild(image);
      const p = document.createElement('p');
      p.appendChild(a);
      col2Content.push(p);
    } else if (img) {
      // Image without link fallback
      const image = document.createElement('img');
      image.src = img.getAttribute('src') || '';
      if (img.getAttribute('alt')) {
        image.alt = img.getAttribute('alt');
      }
      col2Content.push(image);
    }
  });

  // Build cells: single row with two columns
  const cells = [
    [col1Content, col2Content],
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-news', cells });
  element.replaceWith(block);
}
