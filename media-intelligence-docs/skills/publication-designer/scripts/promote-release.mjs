#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { argsFrom, loadConfig } from './lib/contracts.mjs';
import {
  readAiLedger, resolveAiLedger, summarizeAiUsage,
} from './lib/ai-usage.mjs';

const args = argsFrom();
const run = path.resolve(args.value('--run', 'runs/latest'));
const release = path.resolve(args.value('--release', 'release'));
const {
  config, configPath, configBytes, configSha256,
} = await loadConfig(args.value('--config', 'publication.json'));
const filename = config.releaseFilename;
if (!filename || path.basename(filename) !== filename) throw new Error('releaseFilename must be a plain filename');
let aiUsage = null;
if (config.aiUsage?.enabled === true) {
  const ledger = resolveAiLedger(config, configPath);
  const { bytes, events } = await readAiLedger(ledger);
  if (events.length === 0) throw new Error(`AI usage ledger is empty: ${ledger}`);
  const summary = {
    ...summarizeAiUsage(events, bytes),
    config: configPath,
    ledger,
  };
  if (config.aiUsage.requirePriced === true && !summary.cost.complete) {
    throw new Error(`${summary.cost.unpricedEvents} AI usage events do not have a cost`);
  }
  aiUsage = { ledger, bytes, summary };
}

const required = [
  'config-validation.json',
  'diagnostics.json',
  'preflight.json',
  'parity.json',
  ...(config.revisionScope?.unchangedPagesMustMatch === true ? ['revision-scope.json'] : []),
  'release-decision.json',
];
const evidence = {};
const snapshots = new Map();
for (const name of required) {
  const file = path.join(run, name);
  const raw = await readFile(file);
  snapshots.set(name, raw);
  const data = JSON.parse(raw.toString('utf8'));
  if (!data.passed) throw new Error(`${name} does not pass`);
  evidence[name] = data;
}
const releaseMode = config.release?.mode || 'distribution';
if (releaseMode === 'distribution' && config.release?.requireManualReview === false) {
  throw new Error('distribution releases cannot disable manual review');
}
const manualRequired = releaseMode === 'distribution' || config.release?.requireManualReview !== false;
if (manualRequired) {
  const reviewPath = path.resolve(args.value('--review', path.join(run, 'manual-review.json')));
  const reviewRaw = await readFile(reviewPath);
  snapshots.set('manual-review.json', reviewRaw);
  const review = JSON.parse(reviewRaw.toString('utf8'));
  if (review.status !== 'closed-after-verification' || review.run !== run) {
    throw new Error('manual-review.json must be closed-after-verification and name the exact run');
  }
  if (!review.reviewer || !review.reviewedAt || !review.pdfSha256) {
    throw new Error('manual-review.json must name reviewer, reviewedAt, and pdfSha256');
  }
  const expectedPages = Number(evidence['preflight.json'].pageCount);
  const pages = Array.isArray(review.pages) ? review.pages : [];
  const covered = new Set(pages.map((item) => Number(item.page)));
  const invalid = pages.filter((item) => !['pass', 'approved-exception'].includes(item.status));
  const emptyExceptions = pages.filter((item) => (
    item.status === 'approved-exception'
    && (!item.note || !item.approvedBy || !item.acceptanceCondition)
  ));
  const exactCoverage = Array.from({ length: expectedPages }, (_, index) => index + 1)
    .every((page) => covered.has(page));
  if (pages.length !== expectedPages || covered.size !== expectedPages || !exactCoverage || invalid.length || emptyExceptions.length) {
    throw new Error('manual-review.json must cover every page once with pass or approved-exception');
  }
  const requiredSpreads = config.release?.reviewSpreads || [];
  const spreads = Array.isArray(review.spreads) ? review.spreads : [];
  const spreadMap = new Map(spreads.map((item) => [item.id, item]));
  const invalidSpreads = requiredSpreads.filter((id) => {
    const item = spreadMap.get(id);
    return !item
      || !['pass', 'approved-exception'].includes(item.status)
      || (item.status === 'approved-exception' && (!item.note || !item.approvedBy || !item.acceptanceCondition));
  });
  if (spreads.length !== requiredSpreads.length || spreadMap.size !== spreads.length || invalidSpreads.length) {
    throw new Error('manual-review.json must cover every declared review spread once');
  }
  evidence['manual-review.json'] = review;
}

const sourcePdf = path.join(run, 'output.pdf');
const bytes = await readFile(sourcePdf);
const sha256 = createHash('sha256').update(bytes).digest('hex');
for (const [name, data] of Object.entries(evidence)) {
  if (name !== 'manual-review.json' && data.config !== configPath) {
    throw new Error(`${name} does not name the exact publication config`);
  }
  if (name !== 'manual-review.json' && data.configSha256 !== configSha256) {
    throw new Error(`${name} is stale or belongs to a different publication config`);
  }
  if (['diagnostics.json', 'preflight.json', 'parity.json', 'release-decision.json'].includes(name) && data.pdfSha256 !== sha256) {
    throw new Error(`${name} is stale or belongs to a different PDF`);
  }
}
if (
  evidence['diagnostics.json'].output !== run
  || evidence['parity.json'].run !== run
  || evidence['release-decision.json'].run !== run
  || evidence['preflight.json'].pdf !== path.join(run, 'output.pdf')
  || (evidence['revision-scope.json'] && evidence['revision-scope.json'].run !== run)
) throw new Error('QA evidence does not name the exact run being promoted');
if (evidence['manual-review.json']?.pdfSha256 && evidence['manual-review.json'].pdfSha256 !== sha256) {
  throw new Error('manual review checksum does not match output.pdf');
}
let releaseExists = false;
try {
  await stat(release);
  releaseExists = true;
  if (!args.has('--replace')) throw new Error(`release directory already exists: ${release}; use --replace intentionally`);
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
const parent = path.dirname(release);
const stage = path.join(parent, `.${path.basename(release)}.stage-${process.pid}-${Date.now()}`);
const backup = path.join(parent, `.${path.basename(release)}.backup-${process.pid}-${Date.now()}`);
await mkdir(stage, { recursive: true });
const destination = path.join(release, filename);
const provenance = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  config: configPath,
  run,
  releasePdf: destination,
  filename,
  sha256,
  pageCount: evidence['preflight.json'].pageCount,
  fonts: evidence['preflight.json'].fonts,
  links: evidence['preflight.json'].links,
  gates: Object.fromEntries(required.map((name) => [name, true])),
  manualReview: evidence['manual-review.json'] || null,
  releaseMode,
  aiUsage: aiUsage?.summary || null,
  rebuildCapsule: config.release?.rebuildCapsule?.required ? 'rebuild-capsule/capsule-manifest.json' : null,
};
try {
  if (config.release?.rebuildCapsule?.required) {
    const capsule = path.join(stage, 'rebuild-capsule');
    const result = spawnSync(process.execPath, [
      path.join(path.dirname(new URL(import.meta.url).pathname), 'create-rebuild-capsule.mjs'),
      '--project-root', path.dirname(configPath),
      '--config', configPath,
      '--run', run,
      '--out', capsule,
      ...config.release.rebuildCapsule.includes.flatMap((include) => ['--include', include]),
    ], { stdio: 'inherit' });
    if (result.status !== 0) throw new Error('rebuild capsule creation failed');
    const verify = spawnSync(process.execPath, [path.join(path.dirname(new URL(import.meta.url).pathname), 'verify-rebuild-capsule.mjs'), '--capsule', capsule], { stdio: 'inherit' });
    if (verify.status !== 0) throw new Error('rebuild capsule verification failed');
  }
  const artifactNames = [
    ...required,
    'html-contact-sheet.png',
    'print-contact-sheet.png',
    'pdf-contact-sheet.png',
    'diff-contact-sheet.png',
  ];
  for (const name of artifactNames) {
    if (!snapshots.has(name)) snapshots.set(name, await readFile(path.join(run, name)));
  }
  if (aiUsage) {
    snapshots.set('ai-calls.jsonl', aiUsage.bytes);
    snapshots.set('ai-usage-summary.json', Buffer.from(`${JSON.stringify(aiUsage.summary, null, 2)}\n`));
  }
  try { snapshots.set('link-probe.json', await readFile(path.join(run, 'link-probe.json'))); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  snapshots.set('publication.json', configBytes);
  snapshots.set(filename, bytes);
  for (const [name, data] of snapshots) await writeFile(path.join(stage, name), data);
  await writeFile(path.join(stage, 'provenance.json'), `${JSON.stringify(provenance, null, 2)}\n`);
  const stagedSha256 = createHash('sha256').update(await readFile(path.join(stage, filename))).digest('hex');
  if (stagedSha256 !== sha256) throw new Error('staged PDF checksum changed before promotion');
  if (releaseExists) await rename(release, backup);
  await rename(stage, release);
  if (releaseExists) await rm(backup, { recursive: true, force: true }).catch(() => {});
} catch (error) {
  await rm(stage, { recursive: true, force: true });
  try {
    await stat(backup);
    try { await stat(release); } catch { await rename(backup, release); }
  } catch {}
  throw error;
}
console.log(`Promoted verified release: ${destination}\nSHA-256: ${sha256}`);
