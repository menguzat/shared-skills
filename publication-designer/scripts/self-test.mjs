#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { cp, mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const fixture = path.join(here, 'test', 'fixture');
const root = await mkdtemp(path.join(os.tmpdir(), 'publication-designer-self-test-'));
const cases = [];
const record = (name, passed, detail = {}) => {
  cases.push({ name, passed, ...detail });
  console.log(`${passed ? 'ok' : 'not ok'} - ${name}`);
};
const run = (script, args) => spawnSync(process.execPath, [path.join(here, script), ...args], {
  encoding: 'utf8',
  timeout: 180_000,
});
const json = async (file) => JSON.parse(await readFile(file, 'utf8'));
const writeJson = (file, value) => writeFile(file, `${JSON.stringify(value, null, 2)}\n`);

await cp(fixture, path.join(root, 'fixture'), { recursive: true });
const input = path.join(root, 'fixture', 'index.html');
const configPath = path.join(root, 'fixture', 'publication.json');
const validRun = path.join(root, 'valid-run');
const baseArgs = ['--input', input, '--config', configPath, '--out', validRun];

const agentUsage = run('record-ai-call.mjs', [
  '--config', configPath,
  '--call-id', 'fixture-agent-turn-01',
  '--operation', 'agent-turn',
  '--provider', 'test-provider',
  '--model', 'test-agent-model',
  '--status', 'succeeded',
]);
const imageUsage = run('record-ai-call.mjs', [
  '--config', configPath,
  '--call-id', 'fixture-image-call-01',
  '--operation', 'image-generation',
  '--provider', 'test-provider',
  '--model', 'test-image-model',
  '--status', 'succeeded',
  '--disposition', 'accepted',
  '--input-tokens', '120',
  '--output-tokens', '40',
  '--images', '1',
  '--cost-usd', '0.04',
  '--pricing-ref', 'fixture-pricing-v1',
]);
const duplicateUsage = run('record-ai-call.mjs', [
  '--config', configPath,
  '--call-id', 'fixture-image-call-01',
  '--operation', 'image-generation',
  '--provider', 'test-provider',
  '--model', 'test-image-model',
]);
const usageSummaryPath = path.join(root, 'fixture', 'usage', 'ai-usage-summary.json');
const summarizedUsage = run('summarize-ai-usage.mjs', [
  '--config', configPath,
  '--out', usageSummaryPath,
]);
const usageSummary = await json(usageSummaryPath).catch(() => null);
record(
  'AI usage recorder distinguishes observable turns from exact calls',
  agentUsage.status === 0
    && imageUsage.status === 0
    && summarizedUsage.status === 0
    && usageSummary?.totalEvents === 2
    && usageSummary?.measurements?.observable === 1
    && usageSummary?.measurements?.exact === 1
    && usageSummary?.tokens?.inputTokens?.value === 120
    && usageSummary?.cost?.amount === 0.04
    && usageSummary?.cost?.unpricedEvents === 1,
);
record('AI usage recorder rejects duplicate call IDs', duplicateUsage.status !== 0);
const requirePricedUsage = run('summarize-ai-usage.mjs', [
  '--config', configPath,
  '--out', path.join(root, 'fixture', 'usage', 'priced-summary.json'),
  '--require-priced',
]);
record(
  'priced accounting rejects events whose provider cost is unavailable',
  requirePricedUsage.status !== 0 && /do not have a cost/.test(requirePricedUsage.stderr),
);

const valid = run('full-qa.mjs', baseArgs);
const decision = await json(path.join(validRun, 'release-decision.json')).catch(() => null);
const diagnostics = await json(path.join(validRun, 'diagnostics.json')).catch(() => null);
const preflight = await json(path.join(validRun, 'preflight.json')).catch(() => null);
const parity = await json(path.join(validRun, 'parity.json')).catch(() => null);
record(
  'valid fixture passes every public QA stage',
  valid.status === 0 && decision?.passed && diagnostics?.passed && preflight?.passed && parity?.passed,
  { status: valid.status, stderr: valid.stderr?.slice(-1000) },
);
record(
  'valid PDF carries exact annotation, embedded subset font, and tags',
  preflight?.links?.['https://example.com/'] === 1
    && preflight?.fonts?.some((font) => font.embedded && font.subset && /Manrope/i.test(font.name))
    && preflight?.markInfo?.Marked === true,
);

const baseConfig = await json(configPath);
const schemaConfig = structuredClone(baseConfig);
delete schemaConfig.requiredFonts;
const schemaConfigPath = path.join(root, 'schema-invalid.json');
const schemaRun = path.join(root, 'schema-invalid-run');
await writeJson(schemaConfigPath, schemaConfig);
const schemaResult = run('full-qa.mjs', ['--input', input, '--config', schemaConfigPath, '--out', schemaRun]);
const schemaReport = await json(path.join(schemaRun, 'config-validation.json')).catch(() => null);
record(
  'missing required config fields fail before rendering with typed schema evidence',
  schemaResult.status !== 0
    && schemaReport?.violations?.some((item) => item.kind === 'config-schema'),
);

for (const test of [
  {
    name: 'wrong HTML link count fails with a typed violation',
    mutate: (config) => { config.links.required[0].count = 2; },
    expectedKind: 'html-link-contract',
  },
  {
    name: 'unreadably small type contract fails with a typed violation',
    mutate: (config) => { config.semanticRules.push({ kind: 'min-font-size', selector: '.prose', value: 40 }); },
    expectedKind: 'min-font-size',
  },
  {
    name: 'wrong asset mapping fails with a typed violation',
    mutate: (config) => { config.assets[0].src = '/assets/not-the-figure.svg'; },
    expectedKind: 'asset-source',
  },
  {
    name: 'missing locale glyphs fail every declared font and weight explicitly',
    mutate: (config) => { config.requiredGlyphSets = { unsupported: '漢' }; },
    expectedKind: 'font-glyph-missing',
  },
  {
    name: 'declared non-overlap pairs fail when their rendered boxes collide',
    mutate: (config) => { config.nonOverlapPairs = [['.marker', '.chapter']]; },
    expectedKind: 'non-overlap-pair',
  },
  {
    name: 'required back-matter visual disclosure cannot be omitted',
    mutate: (config) => {
      config.visualCredits = {
        inCaptions: 'forbidden',
        backMatter: 'required',
        backMatterSelector: '.visual-credits',
        disclosureTextIncludes: 'AI-generated',
      };
    },
    expectedKind: 'visual-credit-back-matter-missing',
  },
  {
    name: 'a required source mapped to the wrong page fails even when pages render',
    mutate: (config) => { config.content.requiredSourcePlacements[1].page = 1; },
    expectedKind: 'source-placement-contract',
  },
  {
    name: 'insufficient deterministic text contrast fails the browser gate',
    mutate: (config) => { config.semanticRules.push({ kind: 'min-contrast', selector: '.prose', value: 21 }); },
    expectedKind: 'min-contrast',
  },
  {
    name: 'footer clearance below the declared margin fails the browser gate',
    mutate: (config) => { config.semanticRules.push({ kind: 'min-bottom-clearance', selector: '.folio', value: 100 }); },
    expectedKind: 'min-bottom-clearance',
  },
]) {
  const slug = test.expectedKind;
  const badConfig = structuredClone(baseConfig);
  test.mutate(badConfig);
  const file = path.join(root, `${slug}.json`);
  const out = path.join(root, `${slug}-run`);
  await writeJson(file, badConfig);
  const result = run('render-publication.mjs', ['--input', input, '--config', file, '--out', out]);
  const report = await json(path.join(out, 'diagnostics.json')).catch(() => null);
  record(
    test.name,
    result.status !== 0 && report?.passed === false && report.audit?.violations?.some((item) => item.kind === test.expectedKind),
    { status: result.status },
  );
}

const normalLineHeightInput = path.join(root, 'fixture', 'line-height-normal.html');
const fixtureHtml = await readFile(input, 'utf8');
await writeFile(normalLineHeightInput, fixtureHtml.replace(
  'font-size: 13px; line-height: 1.55;',
  'font-size: 13px; line-height: normal;',
));
const normalLineHeightRun = path.join(root, 'line-height-normal-run');
const normalLineHeightResult = run('render-publication.mjs', [
  '--input', normalLineHeightInput, '--config', configPath, '--out', normalLineHeightRun,
]);
const normalLineHeightReport = await json(path.join(normalLineHeightRun, 'diagnostics.json')).catch(() => null);
record(
  'unmeasurable normal line-height cannot silently bypass type-leading gates',
  normalLineHeightResult.status !== 0
    && normalLineHeightReport?.audit?.violations?.some((item) => item.kind === 'type-leading-unmeasurable'),
);

const privateProbeConfig = structuredClone(baseConfig);
privateProbeConfig.links.probe = ['http://127.0.0.1/', 'http://[::1]/'];
const privateProbeConfigPath = path.join(root, 'private-probe.json');
const privateProbeRun = path.join(root, 'private-probe-run');
await writeJson(privateProbeConfigPath, privateProbeConfig);
const privateProbeResult = run('probe-links.mjs', ['--config', privateProbeConfigPath, '--run', privateProbeRun]);
const privateProbeReport = await json(path.join(privateProbeRun, 'link-probe.json')).catch(() => null);
record(
  'link probe rejects IPv4 and IPv6 loopback before connection',
  privateProbeResult.status !== 0
    && privateProbeReport?.results?.length === 2
    && privateProbeReport.results.every((item) => item.ok === false && /private|local|reserved/.test(item.error)),
);

function rawHelveticaPdf() {
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 419.5276 595.2756] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Length 47 >>\nstream\nBT /F1 24 Tf 72 500 Td (Unembedded font) Tj ET\nendstream',
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => { pdf += `${String(offset).padStart(10, '0')} 00000 n \n`; });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return pdf;
}

const badPdfRun = path.join(root, 'unembedded-run');
await mkdir(badPdfRun, { recursive: true });
const badPdf = path.join(badPdfRun, 'output.pdf');
await writeFile(badPdf, rawHelveticaPdf());
const badPdfConfig = {
  ...baseConfig,
  expectedPages: 1,
  requiredFonts: [{ family: 'Helvetica', weights: [400] }],
  links: { required: [] },
  pdf: { ...baseConfig.pdf, requireTagged: false, nativeCrosscheck: true },
};
const badPdfConfigPath = path.join(root, 'unembedded.json');
await writeJson(badPdfConfigPath, badPdfConfig);
const badPreflightResult = run('preflight-pdf.mjs', ['--pdf', badPdf, '--run', badPdfRun, '--config', badPdfConfigPath]);
const badPreflight = await json(path.join(badPdfRun, 'preflight.json')).catch(() => null);
record(
  'unembedded system font PDF fails preflight',
  badPreflightResult.status !== 0 && badPreflight?.violations?.some((item) => item.kind === 'pdf-font-not-embedded'),
  { violations: badPreflight?.violations },
);

const brokenParityRun = path.join(root, 'broken-parity-run');
await cp(validRun, brokenParityRun, { recursive: true });
await writeFile(path.join(brokenParityRun, 'output.pdf'), rawHelveticaPdf());
const brokenParityResult = run('compare-renders.mjs', ['--run', brokenParityRun, '--config', configPath]);
const brokenParity = await json(path.join(brokenParityRun, 'parity.json')).catch(() => null);
record(
  'PDF/browser page-count drift fails parity with retained evidence',
  brokenParityResult.status !== 0 && brokenParity?.passed === false && brokenParity?.countMatches === false,
);

const revisionConfig = structuredClone(baseConfig);
revisionConfig.revisionScope = {
  allowedPages: [1],
  unchangedPagesMustMatch: true,
  baselineRun: validRun,
};
const revisionConfigPath = path.join(root, 'revision-scope.json');
await writeJson(revisionConfigPath, revisionConfig);
const identicalRevisionRun = path.join(root, 'revision-identical-run');
await cp(validRun, identicalRevisionRun, { recursive: true });
const identicalRevisionResult = run('compare-untouched-pages.mjs', [
  '--run', identicalRevisionRun,
  '--config', revisionConfigPath,
]);
const identicalRevisionReport = await json(path.join(identicalRevisionRun, 'revision-scope.json')).catch(() => null);
record(
  'untouched-page comparison accepts an exact print-raster match',
  identicalRevisionResult.status === 0
    && identicalRevisionReport?.passed
    && identicalRevisionReport?.checks?.some((item) => item.page === 2 && item.matched === true),
);

const sameBaselineResult = run('compare-untouched-pages.mjs', [
  '--run', validRun,
  '--config', revisionConfigPath,
  '--baseline-run', validRun,
]);
const sameBaselineReport = await json(path.join(validRun, 'revision-scope.json')).catch(() => null);
record(
  'revision comparison cannot use its current run as the baseline',
  sameBaselineResult.status !== 0
    && sameBaselineReport?.violations?.some((item) => item.kind === 'revision-baseline-same-as-run'),
);

const changedRevisionRun = path.join(root, 'revision-changed-run');
await cp(validRun, changedRevisionRun, { recursive: true });
const changedPage = path.join(changedRevisionRun, 'print-pages', 'page-02.png');
await writeFile(changedPage, Buffer.concat([await readFile(changedPage), Buffer.from([0])]));
const changedRevisionResult = run('compare-untouched-pages.mjs', [
  '--run', changedRevisionRun,
  '--config', revisionConfigPath,
]);
const changedRevisionReport = await json(path.join(changedRevisionRun, 'revision-scope.json')).catch(() => null);
record(
  'untouched-page comparison rejects any byte-level print-raster change',
  changedRevisionResult.status !== 0
    && changedRevisionReport?.violations?.some((item) => item.kind === 'untouched-page-changed' && item.page === 2),
);

const manualReview = {
  status: 'closed-after-verification',
  run: validRun,
  reviewer: 'Publication Designer self-test',
  reviewedAt: new Date().toISOString(),
  pdfSha256: preflight.pdfSha256,
  pages: [
    { page: 1, status: 'pass' },
    { page: 2, status: 'pass' },
  ],
  spreads: [{ id: '1-2', status: 'pass' }],
};
await writeJson(path.join(validRun, 'manual-review.json'), manualReview);

const badReleaseRun = path.join(root, 'bad-release-run');
await cp(validRun, badReleaseRun, { recursive: true });
const badDecision = await json(path.join(badReleaseRun, 'release-decision.json'));
badDecision.passed = false;
await writeJson(path.join(badReleaseRun, 'release-decision.json'), badDecision);
const badReleaseReview = structuredClone(manualReview);
badReleaseReview.run = badReleaseRun;
await writeJson(path.join(badReleaseRun, 'manual-review.json'), badReleaseReview);
const rejectedRelease = run('promote-release.mjs', [
  '--run', badReleaseRun, '--config', configPath, '--release', path.join(root, 'rejected-release'),
]);
record('promotion rejects a failing release decision', rejectedRelease.status !== 0);

const releaseDir = path.join(root, 'release');
const promoted = run('promote-release.mjs', ['--run', validRun, '--config', configPath, '--release', releaseDir]);
const provenance = await json(path.join(releaseDir, 'provenance.json')).catch(() => null);
record(
  'verified run promotes with checksum provenance',
  promoted.status === 0
    && /^[a-f0-9]{64}$/.test(provenance?.sha256 || '')
    && provenance?.gates?.['preflight.json'] === true
    && provenance?.aiUsage?.totalEvents === 2
    && provenance?.aiUsage?.cost?.amount === 0.04,
);
record(
  'promotion snapshots AI call accounting beside the publication',
  (await readFile(path.join(releaseDir, 'ai-calls.jsonl'), 'utf8').catch(() => '')).split(/\r?\n/).filter(Boolean).length === 2
    && (await json(path.join(releaseDir, 'ai-usage-summary.json')).catch(() => null))?.ledgerSha256 === provenance?.aiUsage?.ledgerSha256,
);

const emptyException = structuredClone(manualReview);
emptyException.pages[0] = { page: 1, status: 'approved-exception' };
await writeJson(path.join(validRun, 'manual-review.json'), emptyException);
const emptyExceptionRelease = run('promote-release.mjs', [
  '--run', validRun, '--config', configPath, '--release', path.join(root, 'empty-exception-release'),
]);
record('promotion rejects an approved exception without rationale and approver', emptyExceptionRelease.status !== 0);
await writeJson(path.join(validRun, 'manual-review.json'), manualReview);

const duplicateSpreads = structuredClone(manualReview);
duplicateSpreads.spreads.push({ id: '1-2', status: 'pass' });
await writeJson(path.join(validRun, 'manual-review.json'), duplicateSpreads);
const duplicateSpreadRelease = run('promote-release.mjs', [
  '--run', validRun, '--config', configPath, '--release', path.join(root, 'duplicate-spread-release'),
]);
record('promotion rejects duplicate spread review evidence', duplicateSpreadRelease.status !== 0);
await writeJson(path.join(validRun, 'manual-review.json'), manualReview);

const originalPdf = await readFile(path.join(validRun, 'output.pdf'));
await writeFile(path.join(validRun, 'output.pdf'), rawHelveticaPdf());
const staleRelease = run('promote-release.mjs', [
  '--run', validRun, '--config', configPath, '--release', path.join(root, 'stale-release'),
]);
record('promotion rejects a PDF changed after QA evidence was created', staleRelease.status !== 0);
await writeFile(path.join(validRun, 'output.pdf'), originalPdf);

const distributionWithoutReview = structuredClone(baseConfig);
distributionWithoutReview.release = { mode: 'distribution', requireManualReview: false };
await writeJson(configPath, distributionWithoutReview);
const unsafeDistribution = run('promote-release.mjs', [
  '--run', validRun, '--config', configPath, '--release', path.join(root, 'unsafe-distribution'),
]);
record('distribution promotion cannot disable manual design review', unsafeDistribution.status !== 0);

const changedConfig = structuredClone(baseConfig);
changedConfig.title = 'Changed after QA';
await writeJson(configPath, changedConfig);
const staleConfigPromotion = run('promote-release.mjs', [
  '--run', validRun, '--config', configPath, '--release', path.join(root, 'stale-config-release'),
]);
record('promotion rejects a publication config changed after QA', staleConfigPromotion.status !== 0);
await writeJson(configPath, baseConfig);

const passed = cases.every((item) => item.passed);
const report = { schemaVersion: 1, root, cases, passed };
await writeFile(path.join(root, 'self-test-report.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(`Self-test ${passed ? 'passed' : 'failed'}: ${path.join(root, 'self-test-report.json')}`);
if (!passed) process.exitCode = 1;
