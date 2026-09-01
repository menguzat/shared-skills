#!/usr/bin/env node
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { access, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';
import { loadConfig } from './lib/contracts.mjs';

const args = process.argv.slice(2);
const value = (name) => {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
};

const input = path.resolve(value('--input') || 'index.html');
const root = path.dirname(input);
const output = path.resolve(value('--out') || path.join(root, 'runs', 'latest'));
const configPath = path.resolve(value('--config') || path.join(root, 'publication.json'));
await Promise.all([access(input), access(configPath)]);
const { config, configSha256 } = await loadConfig(configPath);
const format = {
  widthMm: Number(config.format?.widthMm || 210),
  heightMm: Number(config.format?.heightMm || 297),
};
const selector = config.pageSelector || '.page';
const expectedPages = config.expectedPages == null ? null : Number(config.expectedPages);
const dpi = Number(config.rasterDpi || 150);
const dpr = dpi / 96;
const tolerance = Number(config.qa?.dimensionToleranceCssPx ?? 0.5);
const requireSafeArea = config.qa?.requireSafeArea !== false;
const cssPx = (mm) => mm * (96 / 25.4);
const expected = { width: cssPx(format.widthMm), height: cssPx(format.heightMm) };
const requiredFonts = config.requiredFonts || [];

await Promise.all([
  mkdir(path.join(output, 'html-pages'), { recursive: true }),
  mkdir(path.join(output, 'print-pages'), { recursive: true }),
]);

const mime = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
  ['.ttf', 'font/ttf'],
  ['.otf', 'font/otf'],
]);

const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url || '/', 'http://127.0.0.1').pathname);
    if (pathname === '/favicon.ico') {
      response.writeHead(204);
      response.end();
      return;
    }
    const relative = pathname === '/' ? path.basename(input) : pathname.slice(1);
    const file = path.resolve(root, relative);
    if (file !== root && !file.startsWith(`${root}${path.sep}`)) throw new Error('outside publication root');
    if (!(await stat(file)).isFile()) throw new Error('not a file');
    response.writeHead(200, {
      'Content-Type': mime.get(path.extname(file).toLowerCase()) || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    response.end(await readFile(file));
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
});

await new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', resolve);
});

const consoleErrors = [];
const pageErrors = [];
const requestFailures = [];
const browser = await puppeteer.launch({ headless: true });

try {
  const page = await browser.newPage();
  await page.setViewport({
    width: Math.ceil(expected.width),
    height: Math.ceil(expected.height),
    deviceScaleFactor: dpr,
  });
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('requestfailed', (request) => requestFailures.push({
    url: request.url(),
    error: request.failure()?.errorText || 'unknown',
  }));

  const url = `http://127.0.0.1:${server.address().port}/${path.basename(input)}`;
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60_000 });
  const readiness = await page.evaluate(async ({ fonts }) => {
    const withTimeout = (promise, label) => Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error(`${label} timed out`)), 30_000)),
    ]);
    await withTimeout(document.fonts.ready, 'document.fonts.ready');
    const images = await Promise.all([...document.images].map(async (image) => {
      try {
        if (!image.complete || image.naturalWidth === 0) throw new Error('not loaded');
        await image.decode();
        return {
          src: image.currentSrc || image.src,
          ok: true,
          width: image.naturalWidth,
          height: image.naturalHeight,
        };
      } catch (error) {
        return { src: image.currentSrc || image.src, ok: false, error: error.message };
      }
    }));
    const weightNumber = (value) => {
      if (value === 'normal') return 400;
      if (value === 'bold') return 700;
      return Number(value);
    };
    const coversWeight = (declaration, requested) => {
      const values = String(declaration).trim().split(/\s+/).map(weightNumber).filter(Number.isFinite);
      const target = weightNumber(requested);
      return values.length === 1 ? values[0] === target : values.length === 2 && target >= values[0] && target <= values[1];
    };
    const fontContract = fonts.map(({ family, weights }) => {
      const faces = [...document.fonts].filter((font) => (
        font.family.replaceAll('"', '').replaceAll("'", '') === family && font.status === 'loaded'
      ));
      const declaredWeights = weights.map((weight) => ({
        weight,
        loaded: document.fonts.check(`${weight} 16px "${family}"`),
        declared: faces.some((face) => coversWeight(face.weight, weight)),
        glyphSets: [],
      }));
      return {
        family,
        weights,
        declaredWeights,
        loaded: declaredWeights.every((weight) => weight.loaded && weight.declared),
        declared: faces.length > 0,
      };
    });
    return {
      images,
      fontContract,
      fonts: [...document.fonts].map((font) => ({
        family: font.family,
        weight: font.weight,
        status: font.status,
      })),
    };
  }, { fonts: requiredFonts });

  const glyphSets = config.requiredGlyphSets || {};
  if (Object.keys(glyphSets).length > 0) {
    const client = await page.createCDPSession();
    await client.send('DOM.enable');
    await client.send('CSS.enable');
    await client.send('DOM.getDocument', { depth: -1 });
    const normalize = (value) => String(value).toLocaleLowerCase().replace(/[^a-z0-9]/g, '');
    try {
      for (const font of readiness.fontContract) {
        for (const weight of font.declaredWeights) {
          weight.glyphSets = [];
          for (const [name, glyphs] of Object.entries(glyphSets)) {
            const missing = [];
            const probes = [];
            for (const glyph of [...new Set([...glyphs])].filter((value) => !/\s/u.test(value))) {
              const expression = `(() => {
                const node = document.createElement('span');
                node.textContent = ${JSON.stringify(glyph)};
                node.style.cssText = 'position:fixed;left:-10000px;top:0;font-size:48px;line-height:1;';
                node.style.fontFamily = ${JSON.stringify(font.family)};
                node.style.fontWeight = ${JSON.stringify(String(weight.weight))};
                document.body.append(node);
                node.getBoundingClientRect();
                return node;
              })()`;
              const remote = await client.send('Runtime.evaluate', { expression });
              const objectId = remote.result.objectId;
              if (!objectId) {
                missing.push(glyph);
                continue;
              }
              try {
                const { nodeId } = await client.send('DOM.requestNode', { objectId });
                const { fonts } = await client.send('CSS.getPlatformFontsForNode', { nodeId });
                probes.push({ glyph, fonts });
                const expected = normalize(font.family);
                const usedDeclaredFont = fonts.some((used) => (
                  used.glyphCount > 0
                  && (
                    normalize(used.familyName) === expected
                    || normalize(used.postScriptName).startsWith(expected)
                  )
                ));
                if (!usedDeclaredFont) missing.push(glyph);
              } finally {
                await client.send('Runtime.callFunctionOn', {
                  objectId,
                  functionDeclaration: 'function() { this.remove(); }',
                }).catch(() => {});
                await client.send('Runtime.releaseObject', { objectId }).catch(() => {});
              }
            }
            weight.glyphSets.push({
              name,
              glyphs,
              missing,
              probes,
              passed: missing.length === 0,
            });
          }
        }
        font.loaded = font.declaredWeights.every((weight) => (
          weight.loaded
          && weight.declared
          && weight.glyphSets.every((set) => set.passed)
        ));
      }
    } finally {
      await client.detach();
    }
  }

  const audit = await page.evaluate(({ selector: pageSelector, expectedSize, tolerancePx, requireSafe }) => {
    const number = (value) => Number.parseFloat(value) || 0;
    const violations = [];
    const pages = [...document.querySelectorAll(pageSelector)].map((node, index) => {
      const pageNumber = index + 1;
      const rect = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      const safe = {
        top: number(style.getPropertyValue('--safe-top')),
        right: number(style.getPropertyValue('--safe-right')),
        bottom: number(style.getPropertyValue('--safe-bottom')),
        left: number(style.getPropertyValue('--safe-left')),
      };
      const report = {
        number: pageNumber,
        id: node.id || null,
        rect: { width: rect.width, height: rect.height },
        scroll: {
          width: node.scrollWidth,
          height: node.scrollHeight,
          clientWidth: node.clientWidth,
          clientHeight: node.clientHeight,
        },
        safeAreas: [],
      };
      if (
        Math.abs(rect.width - expectedSize.width) > tolerancePx
        || Math.abs(rect.height - expectedSize.height) > tolerancePx
      ) violations.push({ kind: 'trim-size', page: pageNumber, detail: report.rect });
      if (
        node.scrollWidth > node.clientWidth + tolerancePx
        || node.scrollHeight > node.clientHeight + tolerancePx
      ) violations.push({ kind: 'overflow', page: pageNumber, detail: report.scroll });

      const safeNodes = [...node.querySelectorAll('[data-safe]')];
      if (requireSafe && safeNodes.length === 0 && Object.values(safe).every((item) => item === 0)) {
        violations.push({ kind: 'safe-area-contract-missing', page: pageNumber });
      }
      for (const safeNode of safeNodes) {
        const child = safeNode.getBoundingClientRect();
        const outside = (
          child.left < rect.left + safe.left - tolerancePx
          || child.right > rect.right - safe.right + tolerancePx
          || child.top < rect.top + safe.top - tolerancePx
          || child.bottom > rect.bottom - safe.bottom + tolerancePx
        );
        const item = {
          selector: safeNode.dataset.safe || safeNode.tagName.toLowerCase(),
          outside,
          rect: { x: child.x, y: child.y, width: child.width, height: child.height },
        };
        report.safeAreas.push(item);
        if (outside) violations.push({ kind: 'safe-area', page: pageNumber, detail: item });
      }
      return report;
    });
    return { pageCount: pages.length, pages, violations };
  }, {
    selector,
    expectedSize: expected,
    tolerancePx: tolerance,
    requireSafe: requireSafeArea,
  });

  const contracts = await page.evaluate((publication) => {
    const violations = [];
    const warnings = [];
    const normalize = (value) => {
      try {
        const url = new URL(value, document.baseURI);
        if ((url.protocol === 'https:' && url.port === '443') || (url.protocol === 'http:' && url.port === '80')) url.port = '';
        return url.href;
      } catch {
        return value;
      }
    };
    const visible = (node) => {
      const style = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
    };
    const rect = (node) => node?.getBoundingClientRect();
    const overlap = (a, b) => (
      Math.min(a.right, b.right) - Math.max(a.left, b.left) > 0.5
      && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 0.5
    );
    const pageNodes = [...document.querySelectorAll(publication.pageSelector || '.page')];
    const pageNumberOf = (node) => pageNodes.indexOf(node.closest(publication.pageSelector || '.page')) + 1;
    const color = (value) => {
      const match = String(value).match(/^rgba?\(([^)]+)\)$/i);
      if (!match) return null;
      const values = match[1].split(',').map((part) => Number.parseFloat(part.trim()));
      if (values.length < 3 || values.slice(0, 3).some((item) => !Number.isFinite(item))) return null;
      return { r: values[0], g: values[1], b: values[2], a: Number.isFinite(values[3]) ? values[3] : 1 };
    };
    const luminance = ({ r, g, b }) => {
      const linear = (channel) => {
        const value = channel / 255;
        return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
    };
    const solidBackground = (node) => {
      for (let current = node; current; current = current.parentElement) {
        const candidate = color(getComputedStyle(current).backgroundColor);
        if (candidate?.a >= 0.99) return candidate;
      }
      return null;
    };

    const anchors = [...document.querySelectorAll('a[href]')].filter(visible).map((node) => ({
      href: normalize(node.href),
      text: node.textContent.replace(/\s+/g, ' ').trim(),
      page: pageNumberOf(node),
    }));
    for (const required of publication.links?.required || []) {
      const href = normalize(required.href);
      const matches = anchors.filter((anchor) => (
        anchor.href === href
        && (required.page == null || anchor.page === Number(required.page))
        && (required.text == null || anchor.text === required.text)
        && (required.textIncludes == null || anchor.text.includes(required.textIncludes))
      ));
      const expected = Number(required.count ?? 1);
      if (matches.length !== expected) {
        violations.push({ kind: 'html-link-contract', href, text: required.text, page: required.page, expected, actual: matches.length });
      }
    }
    for (const target of publication.links?.forbiddenTargets || []) {
      const href = normalize(target);
      const count = anchors.filter((anchor) => anchor.href === href).length;
      if (count) violations.push({ kind: 'forbidden-html-link', href, actual: count });
    }
    for (const text of publication.links?.forbiddenVisibleText || []) {
      const count = anchors.filter((anchor) => anchor.text.includes(text)).length;
      if (count) violations.push({ kind: 'forbidden-link-text', text, actual: count });
    }

    const contentNodes = [...document.querySelectorAll('[data-content-id]')];
    const contentIds = contentNodes.map((node) => node.dataset.contentId);
    for (const id of publication.content?.requiredIds || []) {
      const count = contentIds.filter((value) => value === id).length;
      if (count !== 1) violations.push({ kind: 'content-id-contract', id, expected: 1, actual: count });
    }
    if (publication.content?.requireUniqueIds !== false) {
      for (const id of new Set(contentIds)) {
        const count = contentIds.filter((value) => value === id).length;
        if (count > 1) violations.push({ kind: 'duplicate-content-id', id, actual: count });
      }
    }
    for (const placement of publication.content?.requiredSourcePlacements || []) {
      const nodes = [...document.querySelectorAll(`[data-source-id="${CSS.escape(placement.id)}"]`)].filter(visible);
      const matching = nodes.filter((node) => pageNumberOf(node) === Number(placement.page));
      if (nodes.length !== 1 || matching.length !== 1) {
        violations.push({ kind: 'source-placement-contract', id: placement.id, page: Number(placement.page), expected: 1, actual: nodes.length, actualOnExpectedPage: matching.length });
        continue;
      }
      const text = matching[0].innerText.replace(/\s+/g, ' ').trim();
      const minimum = Number(placement.minVisibleCharacters ?? 1);
      if (text.length < minimum) {
        violations.push({ kind: 'source-content-unreadable', id: placement.id, page: Number(placement.page), actualCharacters: text.length, expectedMinCharacters: minimum });
      }
    }

    const assets = [];
    for (const contract of publication.assets || []) {
      const nodes = [...document.querySelectorAll(contract.selector || `[data-asset-id="${CSS.escape(contract.id)}"]`)];
      if (nodes.length !== Number(contract.count ?? 1)) {
        violations.push({ kind: 'asset-count', id: contract.id, expected: Number(contract.count ?? 1), actual: nodes.length });
      }
      for (const node of nodes) {
        const source = node.currentSrc || node.src || node.getAttribute('href') || '';
        const pathname = (() => { try { return decodeURIComponent(new URL(source, document.baseURI).pathname); } catch { return source; } })();
        if (contract.src && !pathname.endsWith(contract.src)) {
          violations.push({ kind: 'asset-source', id: contract.id, expected: contract.src, actual: pathname });
        }
        const box = rect(node);
        const dpiX = node.naturalWidth && box.width ? node.naturalWidth / (box.width / 96) : null;
        const dpiY = node.naturalHeight && box.height ? node.naturalHeight / (box.height / 96) : null;
        const effectiveDpi = dpiX && dpiY ? Math.min(dpiX, dpiY) : null;
        if (contract.minEffectiveDpi && effectiveDpi != null && effectiveDpi < Number(contract.minEffectiveDpi)) {
          violations.push({ kind: 'asset-effective-dpi', id: contract.id, expectedMin: Number(contract.minEffectiveDpi), actual: effectiveDpi });
        }
        if (node.tagName === 'IMG' && publication.qa?.requireImageAlt !== false && !node.hasAttribute('alt')) {
          violations.push({ kind: 'image-alt-missing', id: contract.id });
        }
        assets.push({ id: contract.id, source, effectiveDpi, alt: node.getAttribute?.('alt') });
      }
    }

    for (const role of publication.typeRoles || []) {
      const nodes = [...document.querySelectorAll(role.selector)].filter(visible);
      if (nodes.length === 0 && role.required !== false) violations.push({ kind: 'type-role-missing', role: role.name, selector: role.selector });
      nodes.forEach((node) => {
        const style = getComputedStyle(node);
        const size = Number.parseFloat(style.fontSize);
        const lineHeight = Number.parseFloat(style.lineHeight);
        const measure = rect(node).width / size;
        if (role.minFontSizePx != null && size < Number(role.minFontSizePx)) violations.push({ kind: 'type-min-size', role: role.name, actual: size });
        if (role.maxFontSizePx != null && size > Number(role.maxFontSizePx)) violations.push({ kind: 'type-max-size', role: role.name, actual: size });
        if (role.minLineHeight != null && !Number.isFinite(lineHeight)) violations.push({ kind: 'type-leading-unmeasurable', role: role.name, actual: style.lineHeight });
        else if (role.minLineHeight != null && lineHeight / size < Number(role.minLineHeight)) violations.push({ kind: 'type-min-leading', role: role.name, actual: lineHeight / size });
        if (role.maxMeasureCh != null && measure > Number(role.maxMeasureCh)) violations.push({ kind: 'type-measure', role: role.name, actual: measure });
      });
    }

    const deterministicHeadlineRules = (publication.designSystem?.headlines || [])
      .map((rule) => ({ kind: 'heading-balance', ...rule }));
    for (const rule of [...(publication.semanticRules || []), ...deterministicHeadlineRules]) {
      const nodes = rule.selector ? [...document.querySelectorAll(rule.selector)].filter(visible) : [];
      if (rule.kind === 'min-font-size') {
        nodes.forEach((node) => {
          const actual = Number.parseFloat(getComputedStyle(node).fontSize);
          if (actual < Number(rule.value)) violations.push({ kind: rule.kind, selector: rule.selector, actual, expectedMin: Number(rule.value) });
        });
      } else if (rule.kind === 'max-lines') {
        nodes.forEach((node) => {
          const style = getComputedStyle(node);
          const lineHeight = Number.parseFloat(style.lineHeight);
          if (!Number.isFinite(lineHeight)) violations.push({ kind: 'line-height-unmeasurable', selector: rule.selector, actual: style.lineHeight });
          else {
            const actual = Math.round(rect(node).height / lineHeight);
            if (actual > Number(rule.value)) violations.push({ kind: rule.kind, selector: rule.selector, actual, expectedMax: Number(rule.value) });
          }
        });
      } else if (rule.kind === 'heading-balance') {
        if (nodes.length === 0) {
          violations.push({ kind: 'semantic-selector-missing', rule: rule.kind, selector: rule.selector });
        }
        for (const node of nodes) {
          const range = document.createRange();
          range.selectNodeContents(node);
          const rawLines = [...range.getClientRects()]
            .filter((item) => item.width > 0.5 && item.height > 0.5)
            .sort((a, b) => a.top - b.top || a.left - b.left);
          const lines = [];
          for (const item of rawLines) {
            const existing = lines.find((line) => Math.abs(line.top - item.top) < 1);
            if (existing) {
              existing.left = Math.min(existing.left, item.left);
              existing.right = Math.max(existing.right, item.right);
            } else lines.push({ top: item.top, left: item.left, right: item.right });
          }
          const widths = lines.map((line) => line.right - line.left).filter((width) => width > 0.5);
          const count = widths.length;
          if (!count) {
            violations.push({ kind: 'heading-balance-unmeasurable', selector: rule.selector, page: pageNumberOf(node) });
            continue;
          }
          if (rule.minLines != null && count < Number(rule.minLines)) {
            violations.push({ kind: 'heading-min-lines', selector: rule.selector, page: pageNumberOf(node), actual: count, expectedMin: Number(rule.minLines) });
          }
          if (rule.maxLines != null && count > Number(rule.maxLines)) {
            violations.push({ kind: 'heading-max-lines', selector: rule.selector, page: pageNumberOf(node), actual: count, expectedMax: Number(rule.maxLines) });
          }
          const widest = Math.max(...widths);
          const narrowest = Math.min(...widths);
          const lastRatio = widths.at(-1) / widest;
          const widthRatio = widest / narrowest;
          if (rule.minLastLineRatio != null && lastRatio < Number(rule.minLastLineRatio)) {
            violations.push({ kind: 'heading-last-line-ratio', selector: rule.selector, page: pageNumberOf(node), actual: lastRatio, expectedMin: Number(rule.minLastLineRatio) });
          }
          if (rule.maxLineWidthRatio != null && widthRatio > Number(rule.maxLineWidthRatio)) {
            violations.push({ kind: 'heading-line-width-ratio', selector: rule.selector, page: pageNumberOf(node), actual: widthRatio, expectedMax: Number(rule.maxLineWidthRatio) });
          }
        }
      } else if (rule.kind === 'no-overlap') {
        const left = [...document.querySelectorAll(rule.a)].filter(visible);
        const right = [...document.querySelectorAll(rule.b)].filter(visible);
        for (const a of left) for (const b of right) if (a !== b && overlap(rect(a), rect(b))) {
          violations.push({ kind: rule.kind, a: rule.a, b: rule.b });
        }
      } else if (rule.kind === 'no-text-art-overlap') {
        const textNodes = nodes;
        const artNodes = [...document.querySelectorAll(rule.b)].filter(visible);
        if (textNodes.length === 0 || artNodes.length === 0) {
          violations.push({ kind: 'semantic-selector-missing', rule: rule.kind, selector: rule.selector, b: rule.b });
        }
        for (const textNode of textNodes) for (const artNode of artNodes) {
          if (pageNumberOf(textNode) !== pageNumberOf(artNode) || !overlap(rect(textNode), rect(artNode))) continue;
          const exception = (publication.textOnArtExceptions || []).find((item) => (
            Number(item.page) === pageNumberOf(textNode)
            && textNode.matches(item.copySelector)
            && artNode.matches(item.artSelector)
          ));
          if (textNode.dataset.allowTextOverArt !== 'true' || !exception) {
            violations.push({ kind: rule.kind, selector: rule.selector, b: rule.b, page: pageNumberOf(textNode) });
            continue;
          }
          const safeZone = [...document.querySelectorAll(exception.safeZoneSelector)]
            .find((node) => pageNumberOf(node) === pageNumberOf(textNode));
          if (!safeZone || !overlap(rect(textNode), rect(safeZone))) {
            violations.push({ kind: 'text-art-exception-safe-zone', id: exception.id, page: pageNumberOf(textNode) });
          }
        }
      } else if (rule.kind === 'min-gap') {
        const left = [...document.querySelectorAll(rule.a)].filter(visible);
        const right = [...document.querySelectorAll(rule.b)].filter(visible);
        if (!left.length || !right.length) violations.push({ kind: 'semantic-selector-missing', rule: rule.kind, a: rule.a, b: rule.b });
        const pages = new Set([...left, ...right].map((node) => pageNumberOf(node)));
        for (const page of pages) {
          const localLeft = left.filter((node) => pageNumberOf(node) === page);
          const localRight = right.filter((node) => pageNumberOf(node) === page);
          if (localLeft.length !== localRight.length || !localLeft.length) {
            violations.push({ kind: 'min-gap-pairing', a: rule.a, b: rule.b, page, left: localLeft.length, right: localRight.length });
            continue;
          }
          localLeft.sort((a, b) => rect(a).top - rect(b).top || rect(a).left - rect(b).left);
          localRight.sort((a, b) => rect(a).top - rect(b).top || rect(a).left - rect(b).left);
          for (let index = 0; index < localLeft.length; index += 1) {
            const gap = rect(localRight[index]).top - rect(localLeft[index]).bottom;
            if (gap < Number(rule.value)) violations.push({ kind: rule.kind, a: rule.a, b: rule.b, page, index, actual: gap, expectedMin: Number(rule.value) });
          }
        }
      } else if (rule.kind === 'min-bottom-clearance') {
        if (nodes.length === 0) violations.push({ kind: 'semantic-selector-missing', rule: rule.kind, selector: rule.selector });
        for (const node of nodes) {
          const pageNode = node.closest(publication.pageSelector || '.page');
          if (!pageNode) continue;
          const actual = rect(pageNode).bottom - rect(node).bottom;
          if (actual < Number(rule.value)) violations.push({ kind: rule.kind, selector: rule.selector, page: pageNumberOf(node), actual, expectedMin: Number(rule.value) });
        }
      } else if (rule.kind === 'min-footer-gap') {
        const contentNodes = nodes;
        const footers = [...document.querySelectorAll(rule.b)].filter(visible);
        if (contentNodes.length === 0 || footers.length === 0) {
          violations.push({ kind: 'semantic-selector-missing', rule: rule.kind, selector: rule.selector, b: rule.b });
        }
        for (const contentNode of contentNodes) for (const footer of footers) {
          if (pageNumberOf(contentNode) !== pageNumberOf(footer)) continue;
          const actual = rect(footer).top - rect(contentNode).bottom;
          if (actual < Number(rule.value)) violations.push({ kind: rule.kind, selector: rule.selector, b: rule.b, page: pageNumberOf(contentNode), actual, expectedMin: Number(rule.value) });
        }
      } else if (rule.kind === 'min-contrast') {
        if (nodes.length === 0) violations.push({ kind: 'semantic-selector-missing', rule: rule.kind, selector: rule.selector });
        for (const node of nodes) {
          const foreground = color(getComputedStyle(node).color);
          const background = solidBackground(node);
          if (!foreground || !background) {
            violations.push({ kind: 'contrast-unmeasurable', selector: rule.selector, page: pageNumberOf(node) });
            continue;
          }
          const ratio = (Math.max(luminance(foreground), luminance(background)) + 0.05) / (Math.min(luminance(foreground), luminance(background)) + 0.05);
          if (ratio < Number(rule.value)) violations.push({ kind: rule.kind, selector: rule.selector, page: pageNumberOf(node), actual: ratio, expectedMin: Number(rule.value) });
        }
      } else if (rule.kind === 'unique-text') {
        const texts = nodes.map((node) => node.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean);
        for (const text of new Set(texts)) {
          const count = texts.filter((value) => value === text).length;
          if (count > 1) violations.push({ kind: rule.kind, selector: rule.selector, text, actual: count });
        }
      } else {
        warnings.push({ kind: 'unknown-semantic-rule', rule });
      }
    }

    for (const [aSelector, bSelector] of publication.nonOverlapPairs || []) {
      const left = [...document.querySelectorAll(aSelector)].filter(visible);
      const right = [...document.querySelectorAll(bSelector)].filter(visible);
      if (left.length === 0 || right.length === 0) {
        violations.push({
          kind: 'non-overlap-selector-missing',
          a: aSelector,
          b: bSelector,
          aCount: left.length,
          bCount: right.length,
        });
        continue;
      }
      for (const a of left) for (const b of right) if (a !== b && overlap(rect(a), rect(b))) {
        violations.push({ kind: 'non-overlap-pair', a: aSelector, b: bSelector });
      }
    }

    if (publication.visualCredits) {
      const policy = publication.visualCredits;
      const needle = policy.disclosureTextIncludes.toLocaleLowerCase();
      const captionSelector = policy.captionSelector || 'figcaption, .caption';
      const captions = [...document.querySelectorAll(captionSelector)].filter(visible);
      const captionMatches = captions.filter((node) => (
        node.textContent.toLocaleLowerCase().includes(needle)
      ));
      if (policy.inCaptions === 'forbidden' && captionMatches.length > 0) {
        violations.push({
          kind: 'visual-credit-caption-forbidden',
          selector: captionSelector,
          actual: captionMatches.length,
        });
      }
      if (policy.inCaptions === 'required' && captionMatches.length === 0) {
        violations.push({
          kind: 'visual-credit-caption-missing',
          selector: captionSelector,
          textIncludes: policy.disclosureTextIncludes,
        });
      }
      if (policy.backMatter === 'required') {
        if (!policy.backMatterSelector) {
          violations.push({ kind: 'visual-credit-back-matter-selector-missing' });
        } else {
          const nodes = [...document.querySelectorAll(policy.backMatterSelector)].filter(visible);
          const matches = nodes.filter((node) => (
            node.textContent.toLocaleLowerCase().includes(needle)
          ));
          if (matches.length === 0) {
            violations.push({
              kind: 'visual-credit-back-matter-missing',
              selector: policy.backMatterSelector,
              textIncludes: policy.disclosureTextIncludes,
            });
          }
        }
      }
    }

    if (publication.qa?.checkSafeDescendants !== false) {
      for (const safe of document.querySelectorAll('[data-safe]')) {
        const safeRect = rect(safe);
        for (const child of safe.querySelectorAll('*')) {
          if (!visible(child) || getComputedStyle(child).position === 'fixed') continue;
          const childRect = rect(child);
          if (
            childRect.left < safeRect.left - 0.5 || childRect.right > safeRect.right + 0.5
            || childRect.top < safeRect.top - 0.5 || childRect.bottom > safeRect.bottom + 0.5
          ) violations.push({
            kind: 'safe-descendant-overflow',
            safe: safe.dataset.safe || null,
            tag: child.tagName.toLowerCase(),
            page: pageNumberOf(child),
            assetId: child.closest('[data-asset-id]')?.dataset.assetId || null,
          });
        }
      }
    }
    return { anchors, contentIds, assets, violations, warnings };
  }, config);
  audit.violations.push(...contracts.violations);
  for (const font of readiness.fontContract) {
    for (const weight of font.declaredWeights) {
      for (const glyphSet of weight.glyphSets) {
        if (glyphSet.missing.length > 0) {
          audit.violations.push({
            kind: 'font-glyph-missing',
            family: font.family,
            weight: weight.weight,
            set: glyphSet.name,
            missing: glyphSet.missing,
          });
        }
      }
    }
  }

  if (expectedPages != null && audit.pageCount !== expectedPages) {
    audit.violations.push({
      kind: 'page-count',
      expected: expectedPages,
      actual: audit.pageCount,
    });
  }

  const handles = await page.$$(selector);
  for (let index = 0; index < handles.length; index += 1) {
    await handles[index].screenshot({
      path: path.join(output, 'html-pages', `page-${String(index + 1).padStart(2, '0')}.png`),
    });
  }
  await page.emulateMediaType('print');
  for (let index = 0; index < handles.length; index += 1) {
    await handles[index].screenshot({
      path: path.join(output, 'print-pages', `page-${String(index + 1).padStart(2, '0')}.png`),
    });
  }
  await page.pdf({
    path: path.join(output, 'output.pdf'),
    width: `${format.widthMm}mm`,
    height: `${format.heightMm}mm`,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
    printBackground: true,
    preferCSSPageSize: true,
    tagged: true,
  });
  const pdfSha256 = createHash('sha256')
    .update(await readFile(path.join(output, 'output.pdf')))
    .digest('hex');

  const diagnostics = {
    schemaVersion: 1,
    input,
    config: configPath,
    configSha256,
    output,
    generatedAt: new Date().toISOString(),
    pdfSha256,
    browser: await browser.version(),
    format,
    rasterDpi: dpi,
    pageSelector: selector,
    expectedPages,
    readiness,
    audit,
    contracts,
    consoleErrors,
    pageErrors,
    requestFailures,
  };
  diagnostics.passed = (
    audit.violations.length === 0
    && readiness.images.every((image) => image.ok)
    && readiness.fontContract.every((font) => font.loaded && font.declared)
    && consoleErrors.length === 0
    && pageErrors.length === 0
    && requestFailures.length === 0
  );
  await writeFile(path.join(output, 'diagnostics.json'), `${JSON.stringify(diagnostics, null, 2)}\n`);
  console.log(`Browser QA ${diagnostics.passed ? 'passed' : 'failed'}: ${output}`);
  if (!diagnostics.passed) process.exitCode = 1;
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
