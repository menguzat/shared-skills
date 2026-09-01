#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { argsFrom, loadConfig } from './lib/contracts.mjs';
import {
  readAiLedger, resolveAiLedger, summarizeAiUsage,
} from './lib/ai-usage.mjs';

const args = argsFrom();
const { config, configPath } = await loadConfig(args.value('--config', 'publication.json'));
const ledger = resolveAiLedger(config, configPath);
if (!ledger) throw new Error('publication.json must set aiUsage.enabled to true');
const { bytes, events } = await readAiLedger(ledger);
if (events.length === 0) throw new Error(`AI usage ledger is empty: ${ledger}`);
const summary = {
  ...summarizeAiUsage(events, bytes),
  config: configPath,
  ledger,
};
if (args.has('--require-priced') && !summary.cost.complete) {
  throw new Error(`${summary.cost.unpricedEvents} AI usage events do not have a cost`);
}
const output = path.resolve(args.value('--out', path.join(path.dirname(ledger), 'ai-usage-summary.json')));
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify(summary, null, 2)}\n`);
console.log(`Summarized ${events.length} AI usage events: ${output}`);
