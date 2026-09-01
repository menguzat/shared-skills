#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { argsFrom, loadConfig } from './lib/contracts.mjs';

const args = argsFrom();
const run = path.resolve(args.value('--run', 'runs/latest'));
const configArg = args.value('--config', 'publication.json');
const {
  config, configPath, configSha256,
} = await loadConfig(configArg);
const scope = config.revisionScope;
if (!scope?.unchangedPagesMustMatch) {
  throw new Error('revisionScope.unchangedPagesMustMatch must be true for untouched-page comparison');
}

const baselineValue = args.value('--baseline-run', scope.baselineRun);
if (!baselineValue) throw new Error('pass --baseline-run or set revisionScope.baselineRun');
const baseline = path.isAbsolute(baselineValue)
  ? baselineValue
  : path.resolve(path.dirname(configPath), baselineValue);
const expectedPages = Number(config.expectedPages);
const allowedPages = new Set(scope.allowedPages.map(Number));
const invalidAllowedPages = [...allowedPages].filter((page) => page < 1 || page > expectedPages);
const checks = [];
const violations = invalidAllowedPages.map((page) => ({
  kind: 'revision-scope-page-out-of-range',
  page,
  expectedPages,
}));
if (baseline === run) {
  violations.push({
    kind: 'revision-baseline-same-as-run',
    detail: 'baseline and current run must be different directories',
  });
}
try {
  const decision = JSON.parse(await readFile(path.join(baseline, 'release-decision.json'), 'utf8'));
  if (decision.passed !== true || path.resolve(decision.run) !== baseline) {
    violations.push({
      kind: 'revision-baseline-not-verified',
      decisionPassed: decision.passed === true,
      decisionRun: decision.run || null,
    });
  }
} catch (error) {
  violations.push({
    kind: 'revision-baseline-evidence-missing',
    detail: error.message,
  });
}

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
for (let page = 1; page <= expectedPages; page += 1) {
  if (allowedPages.has(page)) {
    checks.push({ page, disposition: 'allowed-change' });
    continue;
  }
  const filename = `page-${String(page).padStart(2, '0')}.png`;
  const baselineFile = path.join(baseline, 'print-pages', filename);
  const currentFile = path.join(run, 'print-pages', filename);
  try {
    const [baselineBytes, currentBytes] = await Promise.all([
      readFile(baselineFile),
      readFile(currentFile),
    ]);
    const baselineSha256 = sha256(baselineBytes);
    const currentSha256 = sha256(currentBytes);
    const matched = baselineSha256 === currentSha256;
    checks.push({
      page,
      disposition: 'must-match',
      matched,
      baselineSha256,
      currentSha256,
    });
    if (!matched) violations.push({
      kind: 'untouched-page-changed',
      page,
      baselineSha256,
      currentSha256,
    });
  } catch (error) {
    violations.push({
      kind: 'untouched-page-evidence-missing',
      page,
      detail: error.message,
    });
  }
}

const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  run,
  baseline,
  config: configPath,
  configSha256,
  expectedPages,
  allowedPages: [...allowedPages].sort((a, b) => a - b),
  checks,
  violations,
  passed: violations.length === 0,
};
const reportPath = path.join(run, 'revision-scope.json');
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(`Revision scope ${report.passed ? 'passed' : 'failed'}: ${reportPath}`);
if (!report.passed) process.exitCode = 1;
