#!/usr/bin/env node
import { randomUUID } from 'node:crypto';
import { appendFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { argsFrom, loadConfig } from './lib/contracts.mjs';
import {
  readAiLedger, resolveAiLedger, validateAiEvent,
} from './lib/ai-usage.mjs';

const args = argsFrom();
const { config, configPath } = await loadConfig(args.value('--config', 'publication.json'));
const ledger = resolveAiLedger(config, configPath);
if (!ledger) throw new Error('publication.json must set aiUsage.enabled to true');

const numberOrNull = (name, integer = false) => {
  const raw = args.value(name);
  if (raw == null) return null;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0 || (integer && !Number.isInteger(value))) {
    throw new Error(`${name} must be a non-negative ${integer ? 'integer' : 'number'}`);
  }
  return value;
};
const operation = args.value('--operation');
const defaultMeasurement = {
  'agent-turn': 'observable',
  'subagent-task': 'aggregate',
}[operation] || 'exact';
const event = validateAiEvent({
  schemaVersion: 1,
  id: args.value('--call-id', randomUUID()),
  recordedAt: new Date().toISOString(),
  publication: config.title || null,
  operation,
  measurement: args.value('--measurement', defaultMeasurement),
  provider: args.value('--provider'),
  model: args.value('--model'),
  requestId: args.value('--request-id', null),
  actor: args.value('--actor', null),
  runId: args.value('--run-id', null),
  status: args.value('--status', 'succeeded'),
  disposition: args.value('--disposition', null),
  usage: {
    inputTokens: numberOrNull('--input-tokens', true),
    cachedInputTokens: numberOrNull('--cached-input-tokens', true),
    outputTokens: numberOrNull('--output-tokens', true),
    reasoningTokens: numberOrNull('--reasoning-tokens', true),
  },
  output: {
    images: numberOrNull('--images', true),
  },
  cost: {
    amountUsd: numberOrNull('--cost-usd'),
    pricingRef: args.value('--pricing-ref', null),
  },
  note: args.value('--note', null),
});

const existing = await readAiLedger(ledger);
if (existing.events.some((item) => item.id === event.id)) {
  throw new Error(`AI usage event id already exists: ${event.id}`);
}
await mkdir(path.dirname(ledger), { recursive: true });
await appendFile(ledger, `${JSON.stringify(event)}\n`, { encoding: 'utf8', flag: 'a' });
console.log(`Recorded AI call ${event.id}: ${ledger}`);
