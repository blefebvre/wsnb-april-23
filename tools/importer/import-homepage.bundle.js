var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/hero-carousel.js
  function parse(element, { document }) {
    const slideLinks = element.querySelectorAll("#home-carousel > a:not(.bx-clone)");
    if (slideLinks.length === 0) return;
    const cells = [];
    slideLinks.forEach((link, index) => {
      const slide = link.querySelector("li.slide, .slide");
      const heading = slide ? slide.querySelector("h1, h2, h3") : link.querySelector("h1, h2, h3");
      const href = link.getAttribute("href") || "";
      const title = link.getAttribute("title") || "";
      const headingText = heading ? heading.textContent.trim() : title;
      if (!headingText && !href) return;
      const imageCell = document.createElement("div");
      if (slide) {
        const bgStyle = window.getComputedStyle(slide).backgroundImage;
        const urlMatch = bgStyle && bgStyle !== "none" ? bgStyle.match(/url\(["']?([^"')]+)["']?\)/) : null;
        if (urlMatch) {
          const img = document.createElement("img");
          img.src = urlMatch[1];
          img.alt = headingText || "";
          imageCell.append(img);
        }
      }
      const contentCell = document.createElement("div");
      if (headingText) {
        const h2 = document.createElement("h2");
        h2.textContent = headingText;
        contentCell.append(h2);
      }
      if (href) {
        const p = document.createElement("p");
        const cta = document.createElement("a");
        cta.href = href;
        cta.textContent = title || headingText || "Learn More";
        p.append(cta);
        contentCell.append(p);
      }
      cells.push([imageCell, contentCell]);
    });
    if (cells.length === 0) return;
    const block = WebImporter.Blocks.createBlock(document, {
      name: "hero-carousel",
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-news.js
  function parse2(element, { document }) {
    const isNewsWidget = element.classList.contains("news-widget") || element.querySelector(".news-widget");
    if (!isNewsWidget) {
      element.remove();
      return;
    }
    const parentRow = element.closest(".row") || element.parentElement;
    const col1Content = [];
    const gradientHeader = element.querySelector(".gradient-header");
    if (gradientHeader) {
      const heading = document.createElement("h2");
      heading.textContent = gradientHeader.textContent.trim();
      col1Content.push(heading);
    }
    const newsItems = element.querySelectorAll("ul.news-items li");
    if (newsItems.length > 0) {
      const ul = document.createElement("ul");
      newsItems.forEach((item) => {
        const li = document.createElement("li");
        const link = item.querySelector("a");
        if (link) {
          const a = document.createElement("a");
          a.href = link.getAttribute("href") || "";
          a.textContent = link.textContent.trim();
          if (link.getAttribute("title")) {
            a.title = link.getAttribute("title");
          }
          li.appendChild(a);
        }
        const br = item.querySelector("br");
        if (br && br.nextSibling) {
          const dateText = br.nextSibling.textContent.trim();
          if (dateText) {
            li.appendChild(document.createTextNode(" - " + dateText));
          }
        }
        ul.appendChild(li);
      });
      col1Content.push(ul);
    }
    const viewAllLink = element.querySelector(".show-more a");
    if (viewAllLink) {
      const p = document.createElement("p");
      const a = document.createElement("a");
      a.href = viewAllLink.getAttribute("href") || "";
      a.textContent = viewAllLink.textContent.trim();
      if (viewAllLink.getAttribute("title")) {
        a.title = viewAllLink.getAttribute("title");
      }
      p.appendChild(a);
      col1Content.push(p);
    }
    const col2Content = [];
    const featureBoxes = parentRow ? parentRow.querySelectorAll(".feature-box") : [];
    Array.from(featureBoxes).forEach((box) => {
      if (element.contains(box)) return;
      const link = box.querySelector("a");
      const img = box.querySelector("img");
      if (link && img) {
        const a = document.createElement("a");
        a.href = link.getAttribute("href") || "";
        const image = document.createElement("img");
        image.src = img.getAttribute("src") || "";
        if (img.getAttribute("alt")) {
          image.alt = img.getAttribute("alt");
        }
        a.appendChild(image);
        const p = document.createElement("p");
        p.appendChild(a);
        col2Content.push(p);
      } else if (img) {
        const image = document.createElement("img");
        image.src = img.getAttribute("src") || "";
        if (img.getAttribute("alt")) {
          image.alt = img.getAttribute("alt");
        }
        col2Content.push(image);
      }
    });
    const cells = [
      [col1Content, col2Content]
    ];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-news", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-feature.js
  function parse3(element, { document }) {
    if (!element.parentElement) {
      return;
    }
    const row = element.closest(".row");
    if (row && row.dataset.cardsFeatureParsed) {
      element.remove();
      return;
    }
    if (row) {
      row.dataset.cardsFeatureParsed = "true";
    }
    let featureBoxes;
    if (row) {
      featureBoxes = Array.from(row.querySelectorAll(".col-sm-4 .feature-box"));
    }
    if (!featureBoxes || featureBoxes.length === 0) {
      featureBoxes = [element];
    }
    const cells = [];
    featureBoxes.forEach((box) => {
      const imageCell = [];
      const img = box.querySelector("img");
      if (img) {
        const newImg = document.createElement("img");
        newImg.src = img.getAttribute("src") || img.src || "";
        const alt = img.getAttribute("alt") || "";
        if (alt) newImg.alt = alt;
        imageCell.push(newImg);
      } else {
        const bgStyle = box.style.backgroundImage || (typeof window !== "undefined" ? window.getComputedStyle(box).backgroundImage : "");
        const bgMatch = bgStyle.match(/url\(["']?([^"')]+)["']?\)/);
        if (bgMatch && bgMatch[1]) {
          const newImg = document.createElement("img");
          newImg.src = bgMatch[1];
          imageCell.push(newImg);
        }
      }
      const textCell = [];
      const label = box.querySelector("p");
      const labelText = label ? label.textContent.trim() : "";
      let linkHref = "";
      const parentAnchor = box.closest("a");
      const childAnchor = box.querySelector("a");
      if (parentAnchor) {
        linkHref = parentAnchor.href || parentAnchor.getAttribute("href") || "";
      } else if (childAnchor) {
        linkHref = childAnchor.href || childAnchor.getAttribute("href") || "";
      }
      if (labelText && linkHref) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = linkHref;
        a.textContent = labelText;
        p.append(a);
        textCell.push(p);
      } else if (labelText) {
        const p = document.createElement("p");
        p.textContent = labelText;
        textCell.push(p);
      }
      if (imageCell.length > 0 || textCell.length > 0) {
        cells.push([imageCell, textCell]);
      }
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-feature", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-resources.js
  function parse4(element, { document }) {
    const cells = [];
    const tabLinks = element.querySelectorAll("#tabs.nav-tabs li a, ul.nav-tabs li a");
    const tabPanes = element.querySelectorAll("#tabsContent .tab-pane, .tab-content .tab-pane");
    const paneMap = {};
    tabPanes.forEach((pane) => {
      if (pane.id) {
        paneMap[pane.id] = pane;
      }
    });
    tabLinks.forEach((tabLink) => {
      const label = tabLink.textContent.trim();
      const href = tabLink.getAttribute("href") || "";
      if (href.startsWith("#")) {
        const paneId = href.substring(1);
        const pane = paneMap[paneId];
        if (pane) {
          const contentCell = [];
          const tables = pane.querySelectorAll("table.table, table");
          tables.forEach((table) => {
            const thead = table.querySelector("thead");
            const tbody = table.querySelector("tbody");
            if (thead) {
              const headerCells = thead.querySelectorAll("th");
              if (headerCells.length > 0) {
                const sectionTitle = document.createElement("h3");
                sectionTitle.textContent = headerCells[0].textContent.trim();
                contentCell.push(sectionTitle);
              }
            }
            if (tbody) {
              const rows = tbody.querySelectorAll("tr");
              const list = document.createElement("ul");
              rows.forEach((row) => {
                const tds = row.querySelectorAll("td");
                if (tds.length > 0) {
                  const li = document.createElement("li");
                  const link = tds[0].querySelector("a");
                  if (link) {
                    const a = document.createElement("a");
                    a.href = link.getAttribute("href") || "";
                    a.textContent = link.textContent.trim();
                    if (link.getAttribute("title")) {
                      a.title = link.getAttribute("title");
                    }
                    li.appendChild(a);
                  }
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
          const viewAllLink = pane.querySelector('.show-more a, a[href*="publications"], a[href*="forms"]');
          if (viewAllLink) {
            const a = document.createElement("p");
            const link = document.createElement("a");
            link.href = viewAllLink.getAttribute("href") || "";
            link.textContent = viewAllLink.textContent.trim().replace(/\s+/g, " ");
            a.appendChild(link);
            contentCell.push(a);
          }
          cells.push([label, contentCell]);
        }
      } else {
        const a = document.createElement("a");
        a.href = href;
        a.textContent = label;
        cells.push([label, [a]]);
      }
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "tabs-resources", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-contact.js
  function parse5(element, { document }) {
    const col1Source = element.querySelector(".col-sm-8");
    const col1Content = [];
    if (col1Source) {
      const col1Heading = col1Source.querySelector("h2");
      if (col1Heading) {
        const h2 = document.createElement("h2");
        h2.textContent = col1Heading.textContent.trim().replace(/\s+/g, " ");
        col1Content.push(h2);
      }
      const signupDiv = col1Source.querySelector(".e-news-signup-text");
      if (signupDiv) {
        const p = document.createElement("p");
        const signupLink = signupDiv.querySelector("a");
        if (signupLink) {
          const a = document.createElement("a");
          a.href = signupLink.href || signupLink.getAttribute("href");
          a.textContent = signupLink.textContent.trim();
          p.append(a);
        }
        const fullText = signupDiv.textContent.trim();
        const linkText = signupLink ? signupLink.textContent.trim() : "";
        const trailingText = fullText.substring(fullText.indexOf(linkText) + linkText.length).trim();
        if (trailingText) {
          p.append(` ${trailingText}`);
        }
        col1Content.push(p);
      }
    }
    const col2Source = element.querySelector(".col-sm-4");
    const col2Content = [];
    if (col2Source) {
      const col2Heading = col2Source.querySelector("h2");
      if (col2Heading) {
        const h2 = document.createElement("h2");
        h2.textContent = col2Heading.textContent.trim().replace(/\s+/g, " ");
        col2Content.push(h2);
      }
      const col2Clone = col2Source.cloneNode(true);
      const childElements = Array.from(col2Clone.children);
      let phoneText = "";
      for (const node of col2Source.childNodes) {
        if (node.nodeType === 3) {
          const text = node.textContent.trim();
          if (text && text.includes("toll-free")) {
            phoneText = text;
            break;
          }
        }
      }
      if (!phoneText) {
        const fullColText = col2Source.textContent;
        const phoneMatch = fullColText.match(/Call toll-free[^<\n]*/);
        if (phoneMatch) {
          phoneText = phoneMatch[0].trim();
        }
      }
      if (phoneText) {
        const p = document.createElement("p");
        p.textContent = phoneText;
        col2Content.push(p);
      }
      const emailLink = col2Source.querySelector('a[href^="mailto:"]');
      if (emailLink) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = emailLink.href || emailLink.getAttribute("href");
        a.textContent = emailLink.title || emailLink.textContent.trim().replace(/\s+/g, " ");
        p.append(a);
        col2Content.push(p);
      }
      const socialLinks = Array.from(col2Source.querySelectorAll(".social ul li a"));
      if (socialLinks.length > 0) {
        const p = document.createElement("p");
        socialLinks.forEach((link, index) => {
          const a = document.createElement("a");
          a.href = link.href || link.getAttribute("href");
          a.textContent = link.title || link.className.replace(/function|small/g, "").trim();
          if (index > 0) {
            p.append(" ");
          }
          p.append(a);
        });
        col2Content.push(p);
      }
    }
    const cells = [
      [col1Content, col2Content]
    ];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-contact", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/worksafenb-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [".bx-clone"]);
      WebImporter.DOMUtils.remove(element, [".bx-controls"]);
      WebImporter.DOMUtils.remove(element, ["table.gssb_c"]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, ["nav.navbar"]);
      WebImporter.DOMUtils.remove(element, ["img.print-logo"]);
      WebImporter.DOMUtils.remove(element, ["#to-top-waypoint"]);
      WebImporter.DOMUtils.remove(element, [".footer-top", ".footer-bottom"]);
      WebImporter.DOMUtils.remove(element, ["a.go-top"]);
      WebImporter.DOMUtils.remove(element, [".alert-message-container-bottom"]);
      WebImporter.DOMUtils.remove(element, [".search-container"]);
      WebImporter.DOMUtils.remove(element, ["noscript"]);
      const emptyDivs = element.querySelectorAll("body > div:empty");
      emptyDivs.forEach((div) => {
        if (!div.id && !div.className) div.remove();
      });
    }
  }

  // tools/importer/transformers/worksafenb-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName === TransformHook2.afterTransform) {
      const sections = payload && payload.template && payload.template.sections;
      if (!sections || sections.length < 2) return;
      const document = element.ownerDocument || element;
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const sectionEl = element.querySelector(section.selector);
        if (!sectionEl) continue;
        if (section.style) {
          const sectionMetadata = WebImporter.Blocks.createBlock(document, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          sectionEl.after(sectionMetadata);
        }
        if (i > 0) {
          const hr = document.createElement("hr");
          sectionEl.before(hr);
        }
      }
    }
  }

  // tools/importer/import-homepage.js
  var parsers = {
    "hero-carousel": parse,
    "columns-news": parse2,
    "cards-feature": parse3,
    "tabs-resources": parse4,
    "columns-contact": parse5
  };
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "WorkSafeNB homepage with hero, quick links, news, and resources sections",
    urls: [
      "https://www.worksafenb.ca/"
    ],
    blocks: [
      {
        name: "hero-carousel",
        instances: [".home-carousel-container"]
      },
      {
        name: "columns-news",
        instances: [".col-md-8.news-widget", ".col-md-4 .feature-box"]
      },
      {
        name: "cards-feature",
        instances: [".col-sm-4 .feature-box"]
      },
      {
        name: "tabs-resources",
        instances: [".home-page-tabs"]
      },
      {
        name: "columns-contact",
        instances: [".row.toolbar"]
      }
    ],
    sections: [
      {
        id: "section-1",
        name: "Hero Carousel",
        selector: ".home-carousel-container",
        style: null,
        blocks: ["hero-carousel"],
        defaultContent: []
      },
      {
        id: "section-2",
        name: "News and Sidebar",
        selector: ".container > .row:nth-of-type(2)",
        style: null,
        blocks: ["columns-news"],
        defaultContent: []
      },
      {
        id: "section-3",
        name: "Feature Cards",
        selector: ".container > .row:nth-of-type(3)",
        style: null,
        blocks: ["cards-feature"],
        defaultContent: []
      },
      {
        id: "section-4",
        name: "Tabs Section",
        selector: ".home-page-tabs",
        style: null,
        blocks: ["tabs-resources"],
        defaultContent: []
      },
      {
        id: "section-5",
        name: "E-News and Connect",
        selector: ".row.toolbar",
        style: "dark",
        blocks: ["columns-contact"],
        defaultContent: []
      },
      {
        id: "section-6",
        name: "Footer",
        selector: ".footer-top",
        style: "dark",
        blocks: [],
        defaultContent: ["footer"]
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_homepage_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "") || "/index"
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
