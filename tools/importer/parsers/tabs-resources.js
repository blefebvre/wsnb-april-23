/* eslint-disable */
/* global WebImporter */

/**
 * Parser for tabs-resources
 * Base block: tabs
 * Source: https://www.worksafenb.ca/
 * Selector: .home-page-tabs
 *
 * Extracts a tabbed interface with 5 tabs:
 * - Resources: Table of latest publications (title link, type, date)
 * - Forms: Tables of forms grouped by Workers, Employers, Health Care
 * - Incidents: Link to /general-resources/incidents/
 * - Statistics: Link to /general-resources/statistics/
 * - Events: Link to /about-us/news-and-events/events/
 *
 * Target structure (from block library):
 * Row 1: Block name header "tabs-resources"
 * Row 2+: Tab label | Tab content (one row per tab)
 */
export default function parse(element, { document }) {
  const cells = [];

  // Get all tab label links from the nav-tabs list
  const tabLinks = element.querySelectorAll('#tabs.nav-tabs li a, ul.nav-tabs li a');
  // Get all tab content panes
  const tabPanes = element.querySelectorAll('#tabsContent .tab-pane, .tab-content .tab-pane');

  // Build a map of tab pane id -> tab pane element for matching
  const paneMap = {};
  tabPanes.forEach((pane) => {
    if (pane.id) {
      paneMap[pane.id] = pane;
    }
  });

  tabLinks.forEach((tabLink) => {
    const label = tabLink.textContent.trim();
    const href = tabLink.getAttribute('href') || '';

    // Determine if this tab links to content pane (href starts with #) or external page
    if (href.startsWith('#')) {
      // Content tab - find the matching pane
      const paneId = href.substring(1);
      const pane = paneMap[paneId];

      if (pane) {
        // Build content cell from the pane's inner content
        const contentCell = [];

        // Extract all tables from the pane
        const tables = pane.querySelectorAll('table.table, table');
        tables.forEach((table) => {
          // Reconstruct table as structured content
          const thead = table.querySelector('thead');
          const tbody = table.querySelector('tbody');

          if (thead) {
            // Create heading from the first th (section title like "Latest Publications", "Workers", etc.)
            const headerCells = thead.querySelectorAll('th');
            if (headerCells.length > 0) {
              const sectionTitle = document.createElement('h3');
              sectionTitle.textContent = headerCells[0].textContent.trim();
              contentCell.push(sectionTitle);
            }
          }

          if (tbody) {
            const rows = tbody.querySelectorAll('tr');
            // Create a list of entries from the table rows
            const list = document.createElement('ul');
            rows.forEach((row) => {
              const tds = row.querySelectorAll('td');
              if (tds.length > 0) {
                const li = document.createElement('li');
                // First cell contains the link
                const link = tds[0].querySelector('a');
                if (link) {
                  const a = document.createElement('a');
                  a.href = link.getAttribute('href') || '';
                  a.textContent = link.textContent.trim();
                  if (link.getAttribute('title')) {
                    a.title = link.getAttribute('title');
                  }
                  li.appendChild(a);
                }
                // Append additional cell text (type, date) as text
                for (let i = 1; i < tds.length; i++) {
                  const text = tds[i].textContent.trim();
                  if (text) {
                    const span = document.createTextNode(` | ${text}`);
                    li.appendChild(span);
                  }
                }
                list.appendChild(li);
              }
            });
            contentCell.push(list);
          }
        });

        // Extract "View All" link if present
        const viewAllLink = pane.querySelector('.show-more a, a[href*="publications"], a[href*="forms"]');
        if (viewAllLink) {
          const a = document.createElement('p');
          const link = document.createElement('a');
          link.href = viewAllLink.getAttribute('href') || '';
          link.textContent = viewAllLink.textContent.trim().replace(/\s+/g, ' ');
          a.appendChild(link);
          contentCell.push(a);
        }

        cells.push([label, contentCell]);
      }
    } else {
      // Link-only tab (Incidents, Statistics, Events) - content is just the link
      const a = document.createElement('a');
      a.href = href;
      a.textContent = label;
      cells.push([label, [a]]);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-resources', cells });
  element.replaceWith(block);
}
