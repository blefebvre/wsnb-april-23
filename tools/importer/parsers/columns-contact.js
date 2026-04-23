/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-contact variant.
 * Base block: columns
 * Source: https://www.worksafenb.ca/
 * Selector: .row.toolbar
 *
 * Source structure:
 *   .row.toolbar
 *     .col-sm-8  -> E-News Sign-up heading, envelope icon, signup link + text
 *     .col-sm-4  -> Connect With Us heading, phone number, email link, social media links
 *
 * Target: Columns block with two columns (one row of content cells).
 */
export default function parse(element, { document }) {
  // --- Column 1: E-News Sign-up ---
  const col1Source = element.querySelector('.col-sm-8');
  const col1Content = [];

  if (col1Source) {
    // Heading
    const col1Heading = col1Source.querySelector('h2');
    if (col1Heading) {
      const h2 = document.createElement('h2');
      h2.textContent = col1Heading.textContent.trim().replace(/\s+/g, ' ');
      col1Content.push(h2);
    }

    // Signup text and link from .e-news-signup-text
    const signupDiv = col1Source.querySelector('.e-news-signup-text');
    if (signupDiv) {
      const p = document.createElement('p');
      const signupLink = signupDiv.querySelector('a');
      if (signupLink) {
        const a = document.createElement('a');
        a.href = signupLink.href || signupLink.getAttribute('href');
        a.textContent = signupLink.textContent.trim();
        p.append(a);
      }
      // Append any trailing text after the link
      const fullText = signupDiv.textContent.trim();
      const linkText = signupLink ? signupLink.textContent.trim() : '';
      const trailingText = fullText.substring(fullText.indexOf(linkText) + linkText.length).trim();
      if (trailingText) {
        p.append(` ${trailingText}`);
      }
      col1Content.push(p);
    }
  }

  // --- Column 2: Connect With Us ---
  const col2Source = element.querySelector('.col-sm-4');
  const col2Content = [];

  if (col2Source) {
    // Heading
    const col2Heading = col2Source.querySelector('h2');
    if (col2Heading) {
      const h2 = document.createElement('h2');
      h2.textContent = col2Heading.textContent.trim().replace(/\s+/g, ' ');
      col2Content.push(h2);
    }

    // Phone number text - direct text node before the <br> and <a>
    // Source has: "Call toll-free in Canada 1 800 999-9775 <br>"
    // We need to extract text nodes that are direct children of .col-sm-4
    const col2Clone = col2Source.cloneNode(true);
    // Remove child elements to isolate text nodes
    const childElements = Array.from(col2Clone.children);
    let phoneText = '';
    for (const node of col2Source.childNodes) {
      if (node.nodeType === 3) { // TEXT_NODE
        const text = node.textContent.trim();
        if (text && text.includes('toll-free')) {
          phoneText = text;
          break;
        }
      }
    }
    // Also check for text that might span across nodes
    if (!phoneText) {
      // Fallback: look for text containing phone number pattern
      const fullColText = col2Source.textContent;
      const phoneMatch = fullColText.match(/Call toll-free[^<\n]*/);
      if (phoneMatch) {
        phoneText = phoneMatch[0].trim();
      }
    }
    if (phoneText) {
      const p = document.createElement('p');
      p.textContent = phoneText;
      col2Content.push(p);
    }

    // Email link (mailto:)
    const emailLink = col2Source.querySelector('a[href^="mailto:"]');
    if (emailLink) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = emailLink.href || emailLink.getAttribute('href');
      // Get clean text without glyphicon spans
      a.textContent = emailLink.title || emailLink.textContent.trim().replace(/\s+/g, ' ');
      p.append(a);
      col2Content.push(p);
    }

    // Social media links from .social ul li a
    const socialLinks = Array.from(col2Source.querySelectorAll('.social ul li a'));
    if (socialLinks.length > 0) {
      const p = document.createElement('p');
      socialLinks.forEach((link, index) => {
        const a = document.createElement('a');
        a.href = link.href || link.getAttribute('href');
        a.textContent = link.title || link.className.replace(/function|small/g, '').trim();
        if (index > 0) {
          p.append(' ');
        }
        p.append(a);
      });
      col2Content.push(p);
    }
  }

  // Build the cells array: single row with two columns
  const cells = [
    [col1Content, col2Content],
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-contact', cells });
  element.replaceWith(block);
}
