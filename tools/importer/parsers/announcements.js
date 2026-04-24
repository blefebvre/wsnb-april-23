/* eslint-disable */
/* global WebImporter */

/**
 * Parser for announcements (default content; no block wrapping)
 * Source: WorkSafeNB section landing pages (/health-care/)
 * Selector: .news-widget-link-container.news-slider
 *
 * Replaces the widget with clean default content:
 *   - <h2>Announcements</h2>
 *   - <ul> of announcement items (linked date/title; description paragraph merged as sublist text)
 *   - <p>View All link</p>
 *
 * Dedupes bx-slider clone items by href and ignores empty pager links.
 */
export default function parse(element, { document }) {
  if (!element) return;

  const frag = document.createElement('div');

  // Heading
  const h2Src = element.querySelector('h2');
  if (h2Src) {
    const h2 = document.createElement('h2');
    h2.textContent = h2Src.textContent.trim();
    frag.append(h2);
  }

  // Items — scope tightly to the first ul to avoid bx-slider wrappers that duplicate items
  const firstUl = element.querySelector('ul#news-carousel') || element.querySelector('ul');
  const items = firstUl ? Array.from(firstUl.children).filter((c) => c.tagName === 'LI') : [];
  const seenHrefs = new Set();
  const cleanItems = [];
  items.forEach((src) => {
    if (src.closest('.bx-clone')) return;
    if (src.classList.contains('bx-clone')) return;
    if (src.classList.contains('bx-pager-item')) return;
    const link = src.querySelector('a');
    if (!link) return;
    const href = link.getAttribute('href') || '';
    const text = link.textContent.trim();
    if (!href || !text) return;
    if (seenHrefs.has(href)) return;
    seenHrefs.add(href);
    cleanItems.push({ src, link, href, text });
  });

  if (cleanItems.length > 0) {
    const ul = document.createElement('ul');
    cleanItems.forEach(({ src, link, href, text }) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = text;
      if (link.getAttribute('title')) a.title = link.getAttribute('title');
      li.append(a);
      const desc = src.querySelector('p');
      if (desc && desc.textContent.trim()) {
        const p = document.createElement('p');
        p.textContent = desc.textContent.trim();
        li.append(p);
      }
      ul.append(li);
    });
    frag.append(ul);
  }

  // View All link (filter out empty pager anchors)
  const showMore = element.querySelector('.show-more');
  if (showMore) {
    const anchors = Array.from(showMore.querySelectorAll('a')).filter((a) => a.textContent.trim());
    if (anchors.length > 0) {
      const viewAll = anchors[0];
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = viewAll.getAttribute('href') || '';
      a.textContent = viewAll.textContent.trim();
      if (viewAll.getAttribute('title')) a.title = viewAll.getAttribute('title');
      p.append(a);
      frag.append(p);
    }
  }

  // Replace the enclosing column if present
  const col = element.closest('.col-md-12, [class*="col-md"]');
  if (col && col.parentElement) {
    col.before(frag);
    col.remove();
  } else {
    element.replaceWith(frag);
  }
}
