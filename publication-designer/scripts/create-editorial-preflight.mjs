#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { argsFrom, loadConfig } from './lib/contracts.mjs';

const args = argsFrom();
const { config, configPath, configSha256 } = await loadConfig(args.value('--config', 'publication.json'));
const output = path.resolve(args.value('--out', 'docs/preflight-editorial-review.json'));
const pages = Array.from({ length: config.expectedPages }, (_, index) => ({
  page: index + 1,
  template: 'unassigned',
  status: 'revise',
  visualRole: 'unassigned',
  dominantFocalAreas: null,
  textMode: 'separate',
  checks: { visualSelection: 'revise', layoutBalance: 'revise', contentReadability: 'revise' },
  notes: '',
}));
const report = {
  schemaVersion: 1,
  status: 'revise',
  reviewer: 'unassigned',
  reviewedAt: null,
  config: configPath,
  configSha256,
  edition: { pageCount: config.expectedPages, language: 'und', artDirection: 'unassigned' },
  pages,
  spreads: (config.release?.reviewSpreads || []).map((id) => ({ id, status: 'revise', note: '' })),
  findings: [{ id: 'complete-preflight', severity: 'blocker', owner: 'unassigned', action: 'Review every page and close this finding.' }],
};
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
console.log(`Created editorial preflight template: ${output}`);
