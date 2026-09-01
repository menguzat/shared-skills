#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { access, mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadConfig } from './lib/contracts.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const value = (name) => {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
};
const run = path.resolve(value('--run') || 'runs/latest');
const configPath = path.resolve(value('--config') || 'publication.json');
const { config, configSha256 } = await loadConfig(configPath);
const dpi = Number(config.rasterDpi || 150);
const thresholds = {
  dimensionDelta: Number(config.qa?.geometryDeltaPx ?? 2),
  structuralSsim: Number(config.qa?.structuralSsim ?? 0.98),
};

const command = (bin, argv) => {
  const result = spawnSync(bin, argv, { encoding: 'utf8' });
  if (result.error || result.status !== 0) {
    throw new Error(`${bin} failed: ${result.error?.message || result.stderr || result.stdout}`);
  }
  return `${result.stdout}\n${result.stderr}`;
};
const files = async (directory) => (
  (await readdir(directory)).filter((name) => /^page-\d+\.png$/.test(name)).sort()
);
const dimensions = (file) => JSON.parse(command('ffprobe', [
  '-v', 'error', '-select_streams', 'v:0',
  '-show_entries', 'stream=width,height', '-of', 'json', file,
])).streams[0];
const metric = (reference, rendered, filter) => {
  const output = command('ffmpeg', [
    '-hide_banner', '-i', reference, '-i', rendered,
    '-lavfi', filter, '-frames:v', '1', '-f', 'null', '-',
  ]);
  const match = output.match(/All:([\d.]+)/);
  return match ? Number(match[1]) : Number.NaN;
};
const meanAbsoluteError = (reference, rendered) => {
  const output = command('ffmpeg', [
    '-hide_banner', '-i', reference, '-i', rendered,
    '-lavfi',
    '[1:v][0:v]scale2ref[scaled][ref];[ref][scaled]blend=all_mode=difference,format=gray,signalstats,metadata=print',
    '-frames:v', '1', '-f', 'null', '-',
  ]);
  const values = [...output.matchAll(/YAVG=([\d.]+)/g)].map((match) => Number(match[1]));
  return values.at(-1) ?? Number.NaN;
};
const contactSheet = async (directory, output, count) => {
  if (!count) return;
  const rows = Math.ceil(count / 4);
  const tiles = path.join(path.dirname(output), 'contact-tiles', path.basename(directory));
  await mkdir(tiles, { recursive: true });
  command('ffmpeg', [
    '-hide_banner', '-y', '-framerate', '1', '-start_number', '1',
    '-i', path.join(directory, 'page-%02d.png'), '-frames:v', String(count),
    '-vf', 'scale=310:439:force_original_aspect_ratio=decrease,pad=310:439:(ow-iw)/2:(oh-ih)/2:color=white',
    path.join(tiles, 'page-%02d.png'),
  ]);
  command('ffmpeg', [
    '-hide_banner', '-y', '-framerate', '1', '-start_number', '1',
    '-i', path.join(tiles, 'page-%02d.png'), '-frames:v', String(count),
    '-vf', `tile=4x${rows}:padding=12:margin=12`, output,
  ]);
};

async function rasterize(pdf, output) {
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  if (process.platform === 'darwin') {
    command('swift', [path.join(here, 'rasterize_pdf.swift'), pdf, output, String(dpi)]);
    return 'PDFKit';
  }
  const prefix = path.join(output, 'page');
  command('pdftoppm', ['-png', '-r', String(dpi), pdf, prefix]);
  const generated = (await readdir(output)).filter((name) => /^page-\d+\.png$/.test(name)).sort((a, b) => (
    Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0])
  ));
  for (let index = 0; index < generated.length; index += 1) {
    await rename(
      path.join(output, generated[index]),
      path.join(output, `page-${String(index + 1).padStart(2, '0')}.png`),
    );
  }
  return 'Poppler';
}

try {
  const pdf = path.join(run, 'output.pdf');
  const referenceDir = path.join(run, 'print-pages');
  const pdfDir = path.join(run, 'pdf-pages');
  const diffDir = path.join(run, 'diff-pages');
  await Promise.all([access(pdf), access(referenceDir)]);
  const pdfSha256 = createHash('sha256').update(await readFile(pdf)).digest('hex');
  await rm(diffDir, { recursive: true, force: true });
  await mkdir(diffDir, { recursive: true });
  const rasterizer = await rasterize(pdf, pdfDir);
  const [referencePages, pdfPages] = await Promise.all([files(referenceDir), files(pdfDir)]);
  const countMatches = referencePages.length === pdfPages.length;
  const pages = [];
  for (let index = 0; index < Math.min(referencePages.length, pdfPages.length); index += 1) {
    const reference = path.join(referenceDir, referencePages[index]);
    const rendered = path.join(pdfDir, pdfPages[index]);
    const diff = path.join(diffDir, `page-${String(index + 1).padStart(2, '0')}.png`);
    const [referenceSize, pdfSize] = [dimensions(reference), dimensions(rendered)];
    const widthDelta = Math.abs(referenceSize.width - pdfSize.width);
    const heightDelta = Math.abs(referenceSize.height - pdfSize.height);
    command('ffmpeg', [
      '-hide_banner', '-y', '-i', reference, '-i', rendered,
      '-filter_complex',
      '[1:v][0:v]scale2ref[scaled][ref];[ref][scaled]blend=all_mode=difference,eq=contrast=4',
      '-frames:v', '1', diff,
    ]);
    const sized = (
      widthDelta <= thresholds.dimensionDelta
      && heightDelta <= thresholds.dimensionDelta
    );
    const rawSsim = sized ? metric(
      reference,
      rendered,
      '[1:v][0:v]scale2ref[scaled][ref];[ref][scaled]ssim',
    ) : Number.NaN;
    const structuralSsim = sized ? metric(
      reference,
      rendered,
      '[0:v]format=gray,scale=620:877:flags=lanczos,gblur=sigma=2[ref];[1:v]format=gray,scale=620:877:flags=lanczos,gblur=sigma=2[pdf];[ref][pdf]ssim',
    ) : Number.NaN;
    pages.push({
      number: index + 1,
      reference: referenceSize,
      pdf: pdfSize,
      widthDelta,
      heightDelta,
      rawSsim,
      rawLumaMae: sized ? meanAbsoluteError(reference, rendered) : Number.NaN,
      structuralSsim,
      passed: sized && structuralSsim >= thresholds.structuralSsim,
    });
  }
  await Promise.all([
    contactSheet(path.join(run, 'html-pages'), path.join(run, 'html-contact-sheet.png'), (await files(path.join(run, 'html-pages'))).length),
    contactSheet(referenceDir, path.join(run, 'print-contact-sheet.png'), referencePages.length),
    contactSheet(pdfDir, path.join(run, 'pdf-contact-sheet.png'), pdfPages.length),
    contactSheet(diffDir, path.join(run, 'diff-contact-sheet.png'), pages.length),
  ]);
  const report = {
    schemaVersion: 1,
    run,
    pdfSha256,
    config: configPath,
    configSha256,
    dpi,
    rasterizer,
    thresholds,
    referencePageCount: referencePages.length,
    pdfPageCount: pdfPages.length,
    countMatches,
    pages,
    passed: countMatches && pages.length > 0 && pages.every((page) => page.passed),
  };
  await writeFile(path.join(run, 'parity.json'), `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Parity ${report.passed ? 'passed' : 'failed'}: ${path.join(run, 'parity.json')}`);
  if (!report.passed) process.exitCode = 1;
} catch (error) {
  console.error(`Parity failed: ${error.message}`);
  process.exitCode = 1;
}
