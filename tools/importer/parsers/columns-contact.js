/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-contact variant.
 * Base block: columns
 * Source: https://www.worksafenb.ca/ + section landing pages (/employers/, /workers/, /health-care/, /policy-and-legal/)
 *
 * Two logical layouts in the source:
 *   A) Homepage: .row.toolbar > .col-sm-12 > .row > (.col-sm-8 E-News | .col-sm-4 Connect) (side-by-side)
 *   B) Section-landing one-column: .row.toolbar.toolbar-one-column > .col-sm-12 > two stacked .row > .col-sm-12 (E-News on top, Connect below)
 *   C) Section-landing two-column: .row.toolbar.toolbar-two-column (same as B but nested inside .col-md-8)
 *
 * Strategy: find the two <h2> headings ("E-News Sign-up" and "Connect With Us") and use each heading's
 * nearest logical container as the source for that column's content. Output is always a 2-column row.
 */
export default function parse(element, { document }) {
  // Find all h2 headings; expect two — "E-News ... Sign-up" and "Connect ... With Us"
  const headings = Array.from(element.querySelectorAll('h2'));

  let enewsHeading = null;
  let connectHeading = null;
  headings.forEach((h) => {
    const text = h.textContent.trim().replace(/\s+/g, ' ').toLowerCase();
    if (!enewsHeading && text.includes('e-news')) enewsHeading = h;
    else if (!connectHeading && text.includes('connect')) connectHeading = h;
  });

  // Helper: pick nearest enclosing .col-sm-* or .col-md-*
  const findSource = (heading) => {
    if (!heading) return null;
    // Walk up until we find a col container whose content is JUST this heading's section
    // Prefer the closest .col-sm-8/.col-sm-4 (homepage) or the wrapping row of a col-sm-12 (landing)
    const col8or4 = heading.closest('.col-sm-8, .col-sm-4');
    if (col8or4) return col8or4;
    // Landing-page layout: heading is inside .col-sm-12 > .row > .col-sm-12
    const innerCol = heading.closest('.col-sm-12');
    // Walk up to the closest .row that doesn't include both headings
    if (innerCol) {
      const containingRow = innerCol.closest('.row');
      if (containingRow) return containingRow;
      return innerCol;
    }
    return heading.parentElement;
  };

  const enewsSrc = findSource(enewsHeading);
  const connectSrc = findSource(connectHeading);

  // --- Column 1: E-News Sign-up ---
  const col1Content = [];
  if (enewsHeading) {
    const h2 = document.createElement('h2');
    h2.textContent = enewsHeading.textContent.trim().replace(/\s+/g, ' ');
    col1Content.push(h2);
  }
  const signupDiv = enewsSrc ? enewsSrc.querySelector('.e-news-signup-text') : null;
  if (signupDiv) {
    const p = document.createElement('p');
    const signupLink = signupDiv.querySelector('a');
    if (signupLink) {
      const a = document.createElement('a');
      a.href = (signupLink.getAttribute('href') || '').trim();
      a.textContent = signupLink.textContent.trim();
      p.append(a);
    }
    // Append any trailing text after the link
    const fullText = signupDiv.textContent.trim();
    const linkText = signupLink ? signupLink.textContent.trim() : '';
    const trailingText = linkText
      ? fullText.substring(fullText.indexOf(linkText) + linkText.length).trim()
      : fullText;
    if (trailingText) p.append(` ${trailingText}`);
    col1Content.push(p);
  }

  // --- Column 2: Connect With Us ---
  const col2Content = [];
  if (connectHeading) {
    const h2 = document.createElement('h2');
    h2.textContent = connectHeading.textContent.trim().replace(/\s+/g, ' ');
    col2Content.push(h2);
  }

  if (connectSrc) {
    // Phone text — try dedicated span first, then text node scan
    let phoneText = '';
    const phoneSpan = connectSrc.querySelector('.call-toll-free');
    if (phoneSpan && phoneSpan.textContent.includes('toll-free')) {
      phoneText = phoneSpan.textContent.trim();
    }
    if (!phoneText) {
      // Walk text nodes looking for "toll-free"
      const walker = (connectSrc.ownerDocument || document).createTreeWalker(
        connectSrc,
        /* NodeFilter.SHOW_TEXT = */ 4,
        null,
      );
      let node;
      while ((node = walker.nextNode())) {
        const t = node.textContent.trim();
        if (t && t.toLowerCase().includes('toll-free')) {
          phoneText = t.replace(/\s+/g, ' ');
          break;
        }
      }
    }
    if (!phoneText) {
      const fullText = connectSrc.textContent;
      const m = fullText.match(/Call toll-free[^\n\r]*?\d[\d\s-]+/);
      if (m) phoneText = m[0].trim();
    }
    if (phoneText) {
      const p = document.createElement('p');
      p.textContent = phoneText;
      col2Content.push(p);
    }

    // Email OR General Inquiries link
    const mailto = connectSrc.querySelector('a[href^="mailto:"]');
    const inquiries = connectSrc.querySelector('a[title="General Inquiries"]');
    const contactLink = mailto || inquiries;
    if (contactLink) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = (contactLink.getAttribute('href') || '').trim();
      a.textContent = contactLink.getAttribute('title') || contactLink.textContent.trim().replace(/\s+/g, ' ');
      p.append(a);
      col2Content.push(p);
    }

    // Social links
    const socialLinks = Array.from(connectSrc.querySelectorAll('.social ul li a'));
    if (socialLinks.length > 0) {
      const p = document.createElement('p');
      socialLinks.forEach((link, index) => {
        const a = document.createElement('a');
        a.href = (link.getAttribute('href') || '').trim();
        a.textContent = link.getAttribute('title') || link.className.replace(/function|small/g, '').trim();
        if (index > 0) p.append(' ');
        p.append(a);
      });
      col2Content.push(p);
    }
  }

  const cells = [[col1Content, col2Content]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-contact', cells });
  element.replaceWith(block);
}
