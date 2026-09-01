#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import {
  argsFrom, compareMultisets, expectedLinks, loadConfig, mmToPoints, multiset, normalizedUrl,
} from './lib/contracts.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = argsFrom();
const run = path.resolve(args.value('--run', 'runs/latest'));
const pdfPath = path.resolve(args.value('--pdf', path.join(run, 'output.pdf')));
const { config, configPath, configSha256 } = await loadConfig(args.value('--config', 'publication.json'));
const reportPath = path.join(run, 'preflight.json');
await mkdir(run, { recursive: true });

const violations = [];
const tolerance = Number(config.pdf?.mediaBoxTolerancePt ?? 0.5);
const expectedBox = [mmToPoints(config.format.widthMm), mmToPoints(config.format.heightMm)];
const wantedLinks = multiset(expectedLinks(config));
const requiredFonts = (config.requiredFonts || []).map((font) => font.family.toLowerCase());

try {
  const bytes = new Uint8Array(await readFile(pdfPath));
  const pdfSha256 = createHash('sha256').update(bytes).digest('hex');
  const task = getDocument({ data: bytes, useSystemFonts: false });
  const document = await task.promise;
  const markInfo = await document.getMarkInfo();
  const pages = [];
  const fonts = new Map();
  const links = [];

  for (let index = 0; index < document.numPages; index += 1) {
    const page = await document.getPage(index + 1);
    const [x1, y1, x2, y2] = page.view;
    const size = [Math.abs(x2 - x1), Math.abs(y2 - y1)];
    if (Math.abs(size[0] - expectedBox[0]) > tolerance || Math.abs(size[1] - expectedBox[1]) > tolerance) {
      violations.push({ kind: 'media-box', page: index + 1, expected: expectedBox, actual: size });
    }
    const annotations = (await page.getAnnotations({ intent: 'display' }))
      .filter((item) => item.url)
      .map((item) => ({ url: normalizedUrl(item.url), rect: item.rect }));
    annotations.forEach((item) => {
      const [, , x2, y2] = item.rect || [];
      const [x1, y1] = item.rect || [];
      if (![x1, y1, x2, y2].every(Number.isFinite) || Math.abs(x2 - x1) <= 0 || Math.abs(y2 - y1) <= 0) {
        violations.push({ kind: 'pdf-link-empty-rect', page: index + 1, url: item.url, rect: item.rect });
      }
    });
    annotations.forEach((item) => links.push(item.url));
    const text = await page.getTextContent();
    await page.getOperatorList();
    for (const fontId of new Set(text.items.map((item) => item.fontName).filter(Boolean))) {
      const font = page.commonObjs.get(fontId);
      if (!font) continue;
      const name = font.name || font.loadedName || fontId;
      fonts.set(name, {
        name,
        embedded: font.missingFile !== true && !font.systemFontInfo,
        subset: /^[A-Z]{6}\+/.test(name),
        missingFile: Boolean(font.missingFile),
        systemFont: Boolean(font.systemFontInfo),
      });
    }
    pages.push({ number: index + 1, box: size, annotations, hasStructure: Boolean(await page.getStructTree()) });
  }

  if (config.expectedPages != null && document.numPages !== Number(config.expectedPages)) {
    violations.push({ kind: 'page-count', expected: Number(config.expectedPages), actual: document.numPages });
  }
  const actualLinks = multiset(links);
  for (const difference of compareMultisets(wantedLinks, actualLinks)) {
    violations.push({ kind: 'pdf-link-contract', ...difference });
  }
  for (const forbidden of config.links?.forbiddenTargets || []) {
    const target = normalizedUrl(forbidden);
    if (actualLinks[target]) violations.push({ kind: 'forbidden-pdf-link', value: target, actual: actualLinks[target] });
  }
  for (const required of (config.links?.required || []).filter((item) => item.page != null)) {
    const page = pages[Number(required.page) - 1];
    const target = normalizedUrl(required.href);
    const actual = page?.annotations.filter((item) => item.url === target).length || 0;
    const expected = Number(required.count ?? 1);
    if (actual !== expected) violations.push({ kind: 'pdf-link-page-contract', page: Number(required.page), value: target, expected, actual });
  }

  const fontList = [...fonts.values()];
  for (const family of requiredFonts) {
    const matched = fontList.filter((font) => font.name.toLowerCase().includes(family.replace(/\s+/g, '')));
    if (matched.length === 0) violations.push({ kind: 'required-pdf-font-missing', family });
    if (matched.some((font) => !font.embedded)) violations.push({ kind: 'pdf-font-not-embedded', family });
    if (config.pdf?.requireSubsetFonts !== false && matched.some((font) => !font.subset)) {
      violations.push({ kind: 'pdf-font-not-subset', family });
    }
  }
  if (config.pdf?.requireTagged !== false) {
    if (!markInfo?.Marked) violations.push({ kind: 'pdf-not-marked' });
    if (pages.some((page) => !page.hasStructure)) violations.push({ kind: 'pdf-page-structure-missing' });
  }

  let native = null;
  if (process.platform === 'darwin' && config.pdf?.nativeCrosscheck !== false) {
    const result = spawnSync('swift', [path.join(here, 'inspect-pdf.swift'), pdfPath], {
      encoding: 'utf8',
      env: { ...process.env, CLANG_MODULE_CACHE_PATH: path.join('/tmp', 'publication-designer-swift-cache') },
    });
    if (result.status === 0) {
      native = JSON.parse(result.stdout);
      if (native.pageCount !== document.numPages) {
        violations.push({ kind: 'native-page-count-disagreement', pdfjs: document.numPages, native: native.pageCount });
      }
      native.pages.forEach((page) => {
        const [, , width, height] = page.mediaBox;
        if (Math.abs(width - expectedBox[0]) > tolerance || Math.abs(height - expectedBox[1]) > tolerance) {
          violations.push({ kind: 'native-media-box', page: page.number, expected: expectedBox, actual: [width, height] });
        }
      });
      const nativeLinks = multiset(native.pages.flatMap((page) => page.links.map((link) => normalizedUrl(link.url))));
      for (const difference of compareMultisets(actualLinks, nativeLinks)) {
        violations.push({ kind: 'native-link-disagreement', ...difference });
      }
    } else if (config.pdf?.requireNativeCrosscheck) {
      violations.push({ kind: 'native-crosscheck-unavailable', detail: result.stderr || result.error?.message });
    }
  }

  const report = {
    schemaVersion: 2,
    pdf: pdfPath,
    pdfSha256,
    config: configPath,
    configSha256,
    expectedBoxPt: expectedBox,
    tolerancePt: tolerance,
    pageCount: document.numPages,
    markInfo,
    fonts: fontList,
    links: actualLinks,
    expectedLinks: wantedLinks,
    pages,
    native,
    violations,
    passed: violations.length === 0,
  };
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  await task.destroy();
  console.log(`PDF preflight ${report.passed ? 'passed' : 'failed'}: ${reportPath}`);
  if (!report.passed) process.exitCode = 1;
} catch (error) {
  const report = { schemaVersion: 2, pdf: pdfPath, config: configPath, violations: [{ kind: 'preflight-error', detail: error.message }], passed: false };
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.error(`PDF preflight failed: ${error.message}`);
  process.exitCode = 1;
}
