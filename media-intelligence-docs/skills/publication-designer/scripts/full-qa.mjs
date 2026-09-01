#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const value = (name) => {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
};
const output = path.resolve(value('--out') || 'runs/latest');
const config = path.resolve(value('--config') || 'publication.json');
const run = (script, scriptArgs) => spawnSync(process.execPath, [path.join(here, script), ...scriptArgs], {
  stdio: 'inherit',
});
await mkdir(output, { recursive: true });
const stages = [];
let publication = null;
const execute = (name, script, scriptArgs) => {
  const result = run(script, scriptArgs);
  stages.push({ name, status: result.status ?? 1, passed: result.status === 0 });
  return result;
};
const validation = execute('config', 'validate-config.mjs', ['--run', output, '--config', config]);
if (validation.status === 0) {
  publication = JSON.parse(await readFile(config, 'utf8'));
  const preflight = publication.release?.editorialPreflight;
  if (preflight?.required) {
    const review = path.resolve(path.dirname(config), preflight.path || 'docs/preflight-editorial-review.json');
    execute('editorial-preflight', 'validate-editorial-preflight.mjs', ['--config', config, '--review', review, '--out', path.join(output, 'editorial-preflight-validation.json')]);
  }
  if (stages.every((stage) => stage.passed)) execute('browser', 'render-publication.mjs', args);
  if (stages.every((stage) => stage.passed)) {
    if (publication.revisionScope?.unchangedPagesMustMatch === true) {
      const revisionArgs = ['--run', output, '--config', config];
      const baseline = value('--baseline-run');
      if (baseline) revisionArgs.push('--baseline-run', baseline);
      execute('revision-scope', 'compare-untouched-pages.mjs', revisionArgs);
    }
    execute('pdf-preflight', 'preflight-pdf.mjs', ['--run', output, '--config', config]);
    execute('parity', 'compare-renders.mjs', ['--run', output, '--config', config]);
    if (args.includes('--probe-links')) execute('link-probe', 'probe-links.mjs', ['--run', output, '--config', config]);
  }
}

const evidence = {};
const evidenceReports = {};
const reportEntries = [
  ['config', 'config-validation.json'],
  ['browser', 'diagnostics.json'],
  ['pdf-preflight', 'preflight.json'],
  ['parity', 'parity.json'],
];
if (publication?.release?.editorialPreflight?.required) reportEntries.splice(1, 0, ['editorial-preflight', 'editorial-preflight-validation.json']);
if (publication?.revisionScope?.unchangedPagesMustMatch === true) {
  reportEntries.push(['revision-scope', 'revision-scope.json']);
}
for (const [name, filename] of reportEntries) {
  try {
    evidenceReports[name] = JSON.parse(await readFile(path.join(output, filename), 'utf8'));
    evidence[name] = evidenceReports[name].passed === true;
  } catch { evidence[name] = false; }
}
if (args.includes('--probe-links')) {
  try { evidence['link-probe'] = JSON.parse(await readFile(path.join(output, 'link-probe.json'), 'utf8')).passed === true; } catch { evidence['link-probe'] = false; }
}
let pdfSha256 = null;
try { pdfSha256 = createHash('sha256').update(await readFile(path.join(output, 'output.pdf'))).digest('hex'); } catch {}
let configSha256 = null;
try { configSha256 = createHash('sha256').update(await readFile(config)).digest('hex'); } catch {}
const hashesAgree = Boolean(pdfSha256) && ['browser', 'pdf-preflight', 'parity']
  .every((name) => evidenceReports[name]?.pdfSha256 === pdfSha256);
const configEvidence = ['config', 'browser', 'pdf-preflight', 'parity'];
if (publication?.release?.editorialPreflight?.required) configEvidence.splice(1, 0, 'editorial-preflight');
if (publication?.revisionScope?.unchangedPagesMustMatch === true) configEvidence.push('revision-scope');
const configHashesAgree = Boolean(configSha256) && configEvidence
  .every((name) => evidenceReports[name]?.configSha256 === configSha256);
const passed = stages.every((stage) => stage.passed)
  && stages.every((stage) => evidence[stage.name] === true)
  && hashesAgree
  && configHashesAgree;
const decision = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  run: output,
  config,
  pdfSha256,
  hashesAgree,
  configSha256,
  configHashesAgree,
  stages,
  evidence,
  passed,
};
await writeFile(path.join(output, 'release-decision.json'), `${JSON.stringify(decision, null, 2)}\n`);
console.log(`Full QA ${passed ? 'passed' : 'failed'}: ${path.join(output, 'release-decision.json')}`);
if (!passed) process.exitCode = 1;
