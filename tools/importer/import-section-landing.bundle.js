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

  // tools/importer/import-section-landing.js
  var import_section_landing_exports = {};
  __export(import_section_landing_exports, {
    default: () => import_section_landing_default
  });

  // tools/importer/parsers/nav-panel.js
  function parse(element, { document }) {
    const row = element.closest(".row.clearfix") || element.closest(".row");
    if (!row) return;
    if (row.dataset.navPanelParsed) {
      const col = element.closest('[class*="col-md"]');
      if (col && col.parentElement === row) col.remove();
      else element.remove();
      return;
    }
    row.dataset.navPanelParsed = "true";
    const panels = Array.from(row.querySelectorAll(".side-nav.section-nav"));
    if (panels.length === 0) return;
    const cells = [];
    const colsToRemove = /* @__PURE__ */ new Set();
    panels.forEach((panel) => {
      const col = panel.closest('[class*="col-md"]');
      if (col && col.parentElement === row) colsToRemove.add(col);
      let headingEl = null;
      if (col) headingEl = col.querySelector(".gradient-header");
      const headingText = headingEl ? headingEl.textContent.trim() : "";
      const allItems = Array.from(panel.querySelectorAll(":scope > ul > li"));
      const shownItems = allItems.filter((li) => !li.className.includes("hide-menu-item"));
      const hiddenItems = allItems.filter((li) => li.className.includes("hide-menu-item"));
      const buildList = (items) => {
        if (items.length === 0) return null;
        const ul = document.createElement("ul");
        items.forEach((srcLi) => {
          const li = document.createElement("li");
          const links = Array.from(srcLi.querySelectorAll("a"));
          if (links.length > 0) {
            links.forEach((src, idx) => {
              const a = document.createElement("a");
              a.href = src.getAttribute("href") || "";
              a.textContent = src.textContent.trim();
              if (src.getAttribute("title")) a.title = src.getAttribute("title");
              if (idx > 0) li.append(" | ");
              li.append(a);
            });
          } else {
            li.textContent = srcLi.textContent.trim();
          }
          ul.append(li);
        });
        return ul;
      };
      const headingCell = document.createElement("div");
      headingCell.textContent = headingText;
      const shownCell = document.createElement("div");
      const shownList = buildList(shownItems);
      if (shownList) shownCell.append(shownList);
      const hiddenCell = document.createElement("div");
      const hiddenList = buildList(hiddenItems);
      if (hiddenList) hiddenCell.append(hiddenList);
      cells.push([headingCell, shownCell, hiddenCell]);
    });
    if (cells.length === 0) return;
    const block = WebImporter.Blocks.createBlock(document, {
      name: "nav-panel",
      cells
    });
    row.before(block);
    colsToRemove.forEach((c) => c.remove());
  }

  // tools/importer/parsers/cards-overlay.js
  function parse2(element, { document }) {
    if (!element) return;
    const anchor = element.closest("a");
    const label = element.querySelector("p");
    const labelText = label ? label.textContent.trim().replace(/\s+/g, " ") : "";
    const href = anchor ? anchor.getAttribute("href") || "" : "";
    let imgSrc = "";
    const style = element.getAttribute("style") || "";
    const bgMatch = style.match(/url\(['"]?([^'")\s]+)['"]?\)/);
    if (bgMatch && bgMatch[1]) {
      imgSrc = bgMatch[1];
      if (imgSrc.startsWith("/")) imgSrc = "https://www.worksafenb.ca" + imgSrc;
    }
    if (!imgSrc) {
      const bgComputed = window.getComputedStyle(element).backgroundImage;
      const compMatch = bgComputed && bgComputed !== "none" ? bgComputed.match(/url\(["']?([^"')]+)["']?\)/) : null;
      if (compMatch) imgSrc = compMatch[1];
    }
    const imageCell = document.createElement("div");
    if (imgSrc) {
      const img = document.createElement("img");
      img.src = imgSrc;
      img.alt = labelText || "";
      imageCell.append(img);
    }
    const textCell = document.createElement("div");
    if (labelText) {
      const p = document.createElement("p");
      if (href) {
        const a = document.createElement("a");
        a.href = href;
        a.textContent = labelText;
        p.append(a);
      } else {
        p.textContent = labelText;
      }
      textCell.append(p);
    }
    const cells = [[imageCell, textCell]];
    const block = WebImporter.Blocks.createBlock(document, {
      name: "cards-overlay",
      cells
    });
    const replaceTarget = anchor && anchor.parentElement ? anchor : element;
    const col = replaceTarget.closest('.col-md-4, [class*="col-md"]');
    if (col && col.parentElement) {
      col.before(block);
      col.remove();
    } else {
      replaceTarget.replaceWith(block);
    }
  }

  // tools/importer/parsers/announcements.js
  function parse3(element, { document }) {
    if (!element) return;
    const frag = document.createElement("div");
    const h2Src = element.querySelector("h2");
    if (h2Src) {
      const h2 = document.createElement("h2");
      h2.textContent = h2Src.textContent.trim();
      frag.append(h2);
    }
    const firstUl = element.querySelector("ul#news-carousel") || element.querySelector("ul");
    const items = firstUl ? Array.from(firstUl.children).filter((c) => c.tagName === "LI") : [];
    const seenHrefs = /* @__PURE__ */ new Set();
    const cleanItems = [];
    items.forEach((src) => {
      if (src.closest(".bx-clone")) return;
      if (src.classList.contains("bx-clone")) return;
      if (src.classList.contains("bx-pager-item")) return;
      const link = src.querySelector("a");
      if (!link) return;
      const href = link.getAttribute("href") || "";
      const text = link.textContent.trim();
      if (!href || !text) return;
      if (seenHrefs.has(href)) return;
      seenHrefs.add(href);
      cleanItems.push({ src, link, href, text });
    });
    if (cleanItems.length > 0) {
      const ul = document.createElement("ul");
      cleanItems.forEach(({ src, link, href, text }) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = href;
        a.textContent = text;
        if (link.getAttribute("title")) a.title = link.getAttribute("title");
        li.append(a);
        const desc = src.querySelector("p");
        if (desc && desc.textContent.trim()) {
          const p = document.createElement("p");
          p.textContent = desc.textContent.trim();
          li.append(p);
        }
        ul.append(li);
      });
      frag.append(ul);
    }
    const showMore = element.querySelector(".show-more");
    if (showMore) {
      const anchors = Array.from(showMore.querySelectorAll("a")).filter((a) => a.textContent.trim());
      if (anchors.length > 0) {
        const viewAll = anchors[0];
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = viewAll.getAttribute("href") || "";
        a.textContent = viewAll.textContent.trim();
        if (viewAll.getAttribute("title")) a.title = viewAll.getAttribute("title");
        p.append(a);
        frag.append(p);
      }
    }
    const col = element.closest('.col-md-12, [class*="col-md"]');
    if (col && col.parentElement) {
      col.before(frag);
      col.remove();
    } else {
      element.replaceWith(frag);
    }
  }

  // tools/importer/parsers/columns-contact.js
  function parse4(element, { document }) {
    const headings = Array.from(element.querySelectorAll("h2"));
    let enewsHeading = null;
    let connectHeading = null;
    headings.forEach((h) => {
      const text = h.textContent.trim().replace(/\s+/g, " ").toLowerCase();
      if (!enewsHeading && text.includes("e-news")) enewsHeading = h;
      else if (!connectHeading && text.includes("connect")) connectHeading = h;
    });
    const findSource = (heading) => {
      if (!heading) return null;
      const col8or4 = heading.closest(".col-sm-8, .col-sm-4");
      if (col8or4) return col8or4;
      const innerCol = heading.closest(".col-sm-12");
      if (innerCol) {
        const containingRow = innerCol.closest(".row");
        if (containingRow) return containingRow;
        return innerCol;
      }
      return heading.parentElement;
    };
    const enewsSrc = findSource(enewsHeading);
    const connectSrc = findSource(connectHeading);
    const col1Content = [];
    if (enewsHeading) {
      const h2 = document.createElement("h2");
      h2.textContent = enewsHeading.textContent.trim().replace(/\s+/g, " ");
      col1Content.push(h2);
    }
    const signupDiv = enewsSrc ? enewsSrc.querySelector(".e-news-signup-text") : null;
    if (signupDiv) {
      const p = document.createElement("p");
      const signupLink = signupDiv.querySelector("a");
      if (signupLink) {
        const a = document.createElement("a");
        a.href = (signupLink.getAttribute("href") || "").trim();
        a.textContent = signupLink.textContent.trim();
        p.append(a);
      }
      const fullText = signupDiv.textContent.trim();
      const linkText = signupLink ? signupLink.textContent.trim() : "";
      const trailingText = linkText ? fullText.substring(fullText.indexOf(linkText) + linkText.length).trim() : fullText;
      if (trailingText) p.append(` ${trailingText}`);
      col1Content.push(p);
    }
    const col2Content = [];
    if (connectHeading) {
      const h2 = document.createElement("h2");
      h2.textContent = connectHeading.textContent.trim().replace(/\s+/g, " ");
      col2Content.push(h2);
    }
    if (connectSrc) {
      let phoneText = "";
      const phoneSpan = connectSrc.querySelector(".call-toll-free");
      if (phoneSpan && phoneSpan.textContent.includes("toll-free")) {
        phoneText = phoneSpan.textContent.trim();
      }
      if (!phoneText) {
        const walker = (connectSrc.ownerDocument || document).createTreeWalker(
          connectSrc,
          /* NodeFilter.SHOW_TEXT = */
          4,
          null
        );
        let node;
        while (node = walker.nextNode()) {
          const t = node.textContent.trim();
          if (t && t.toLowerCase().includes("toll-free")) {
            phoneText = t.replace(/\s+/g, " ");
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
        const p = document.createElement("p");
        p.textContent = phoneText;
        col2Content.push(p);
      }
      const mailto = connectSrc.querySelector('a[href^="mailto:"]');
      const inquiries = connectSrc.querySelector('a[title="General Inquiries"]');
      const contactLink = mailto || inquiries;
      if (contactLink) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = (contactLink.getAttribute("href") || "").trim();
        a.textContent = contactLink.getAttribute("title") || contactLink.textContent.trim().replace(/\s+/g, " ");
        p.append(a);
        col2Content.push(p);
      }
      const socialLinks = Array.from(connectSrc.querySelectorAll(".social ul li a"));
      if (socialLinks.length > 0) {
        const p = document.createElement("p");
        socialLinks.forEach((link, index) => {
          const a = document.createElement("a");
          a.href = (link.getAttribute("href") || "").trim();
          a.textContent = link.getAttribute("title") || link.className.replace(/function|small/g, "").trim();
          if (index > 0) p.append(" ");
          p.append(a);
        });
        col2Content.push(p);
      }
    }
    const cells = [[col1Content, col2Content]];
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
      WebImporter.DOMUtils.remove(element, [".breadcrumb-container", "ul.breadcrumb"]);
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

  // tools/importer/transformers/worksafenb-sections-landing.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName !== TransformHook2.beforeTransform) return;
    const tmpl = payload && payload.template;
    if (!tmpl || tmpl.name !== "section-landing") return;
    const sections = tmpl.sections;
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

  // tools/importer/import-section-landing.js
  var parsers = {
    announcements: parse3,
    "cards-overlay": parse2,
    "nav-panel": parse,
    "columns-contact": parse4
  };
  var PAGE_TEMPLATE = {
    name: "section-landing",
    description: "Section landing pages with H1 title, nav-panel rows, optional cards-overlay, optional announcements, and shared E-News/Connect toolbar",
    urls: [
      "https://www.worksafenb.ca/health-care/",
      "https://www.worksafenb.ca/workers/",
      "https://www.worksafenb.ca/employers/",
      "https://www.worksafenb.ca/policy-and-legal/"
    ],
    blocks: [
      // Order matters: process announcements and cards-overlay before nav-panel
      // so that the nav-panel parser (which collapses entire .row.clearfix) doesn't
      // sweep them up first.
      { name: "announcements", instances: [".news-widget-link-container.news-slider"] },
      { name: "cards-overlay", instances: [".image-with-overlay"] },
      { name: "nav-panel", instances: [".side-nav.section-nav"] },
      { name: "columns-contact", instances: [".row.toolbar"] }
    ],
    sections: [
      {
        id: "section-1",
        name: "Main Content",
        selector: ".umb-grid",
        style: null,
        blocks: ["announcements", "cards-overlay", "nav-panel"],
        defaultContent: []
      },
      {
        id: "section-2",
        name: "E-News and Connect",
        selector: ".row.toolbar",
        style: "dark",
        blocks: ["columns-contact"],
        defaultContent: []
      }
    ]
  };
  var transformers = [transform, transform2];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
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
          pageBlocks.push({ name: blockDef.name, selector, element });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_section_landing_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        const parser = parsers[block.name];
        if (parser) {
          try {
            if (!block.element.isConnected) return;
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
  return __toCommonJS(import_section_landing_exports);
})();
