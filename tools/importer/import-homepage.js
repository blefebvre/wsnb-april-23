/* eslint-disable */
/* global WebImporter */

import heroCarouselParser from './parsers/hero-carousel.js';
import columnsNewsParser from './parsers/columns-news.js';
import cardsFeatureParser from './parsers/cards-feature.js';
import tabsResourcesParser from './parsers/tabs-resources.js';
import columnsContactParser from './parsers/columns-contact.js';

import worksafenbCleanupTransformer from './transformers/worksafenb-cleanup.js';
import worksafenbSectionsTransformer from './transformers/worksafenb-sections.js';

const parsers = {
  'hero-carousel': heroCarouselParser,
  'columns-news': columnsNewsParser,
  'cards-feature': cardsFeatureParser,
  'tabs-resources': tabsResourcesParser,
  'columns-contact': columnsContactParser,
};

const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'WorkSafeNB homepage with hero, quick links, news, and resources sections',
  urls: [
    'https://www.worksafenb.ca/',
  ],
  blocks: [
    {
      name: 'hero-carousel',
      instances: ['.home-carousel-container'],
    },
    {
      name: 'columns-news',
      instances: ['.col-md-8.news-widget', '.col-md-4 .feature-box'],
    },
    {
      name: 'cards-feature',
      instances: ['.col-sm-4 .feature-box'],
    },
    {
      name: 'tabs-resources',
      instances: ['.home-page-tabs'],
    },
    {
      name: 'columns-contact',
      instances: ['.row.toolbar'],
    },
  ],
  sections: [
    {
      id: 'section-1',
      name: 'Hero Carousel',
      selector: '.home-carousel-container',
      style: null,
      blocks: ['hero-carousel'],
      defaultContent: [],
    },
    {
      id: 'section-2',
      name: 'News and Sidebar',
      selector: '.container > .row:nth-of-type(2)',
      style: null,
      blocks: ['columns-news'],
      defaultContent: [],
    },
    {
      id: 'section-3',
      name: 'Feature Cards',
      selector: '.container > .row:nth-of-type(3)',
      style: null,
      blocks: ['cards-feature'],
      defaultContent: [],
    },
    {
      id: 'section-4',
      name: 'Tabs Section',
      selector: '.home-page-tabs',
      style: null,
      blocks: ['tabs-resources'],
      defaultContent: [],
    },
    {
      id: 'section-5',
      name: 'E-News and Connect',
      selector: '.row.toolbar',
      style: 'dark',
      blocks: ['columns-contact'],
      defaultContent: [],
    },
    {
      id: 'section-6',
      name: 'Footer',
      selector: '.footer-top',
      style: 'dark',
      blocks: [],
      defaultContent: ['footer'],
    },
  ],
};

const transformers = [
  worksafenbCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1
    ? [worksafenbSectionsTransformer]
    : []),
];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
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
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
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
