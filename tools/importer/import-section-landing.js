/* eslint-disable */
/* global WebImporter */

import navPanelParser from './parsers/nav-panel.js';
import cardsOverlayParser from './parsers/cards-overlay.js';
import announcementsParser from './parsers/announcements.js';
import columnsContactParser from './parsers/columns-contact.js';

import worksafenbCleanupTransformer from './transformers/worksafenb-cleanup.js';
import worksafenbSectionsLandingTransformer from './transformers/worksafenb-sections-landing.js';

const parsers = {
  announcements: announcementsParser,
  'cards-overlay': cardsOverlayParser,
  'nav-panel': navPanelParser,
  'columns-contact': columnsContactParser,
};

const PAGE_TEMPLATE = {
  name: 'section-landing',
  description: 'Section landing pages with H1 title, nav-panel rows, optional cards-overlay, optional announcements, and shared E-News/Connect toolbar',
  urls: [
    'https://www.worksafenb.ca/health-care/',
    'https://www.worksafenb.ca/workers/',
    'https://www.worksafenb.ca/employers/',
    'https://www.worksafenb.ca/policy-and-legal/',
  ],
  blocks: [
    // Order matters: process announcements and cards-overlay before nav-panel
    // so that the nav-panel parser (which collapses entire .row.clearfix) doesn't
    // sweep them up first.
    { name: 'announcements', instances: ['.news-widget-link-container.news-slider'] },
    { name: 'cards-overlay', instances: ['.image-with-overlay'] },
    { name: 'nav-panel', instances: ['.side-nav.section-nav'] },
    { name: 'columns-contact', instances: ['.row.toolbar'] },
  ],
  sections: [
    {
      id: 'section-1',
      name: 'Main Content',
      selector: '.umb-grid',
      style: null,
      blocks: ['announcements', 'cards-overlay', 'nav-panel'],
      defaultContent: [],
    },
    {
      id: 'section-2',
      name: 'E-News and Connect',
      selector: '.row.toolbar',
      style: 'dark',
      blocks: ['columns-contact'],
      defaultContent: [],
    },
  ],
};

const transformers = [worksafenbCleanupTransformer, worksafenbSectionsLandingTransformer];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try { transformerFn.call(null, hookName, element, enhancedPayload); }
    catch (e) { console.error(`Transformer failed at ${hookName}:`, e); }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({ name: blockDef.name, selector, element });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          // Element may have been removed/replaced by an earlier parser - skip detached elements
          if (!block.element.isConnected) return;
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    executeTransformers('afterTransform', main, payload);

    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '') || '/index',
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
