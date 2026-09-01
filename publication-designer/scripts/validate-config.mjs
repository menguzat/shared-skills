#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { argsFrom, loadConfig } from './lib/contracts.mjs';

const args = argsFrom();
const run = path.resolve(args.value('--run', args.value('--out', 'runs/latest')));
const configPath = path.resolve(args.value('--config', 'publication.json'));
await mkdir(run, { recursive: true });
let report;
try {
  const { configSha256 } = await loadConfig(configPath);
  report = { schemaVersion: 1, config: configPath, configSha256, violations: [], passed: true };
} catch (error) {
  report = {
    schemaVersion: 1,
    config: configPath,
    violations: [{
      kind: error.code === 'CONFIG_SCHEMA' ? 'config-schema' : 'config-read',
      detail: error.message,
      errors: error.validationErrors || [],
    }],
    passed: false,
  };
}
const reportPath = path.join(run, 'config-validation.json');
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(`Config validation ${report.passed ? 'passed' : 'failed'}: ${reportPath}`);
if (!report.passed) process.exitCode = 1;
