import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const operations = new Set([
  'agent-turn',
  'vision-call',
  'subagent-task',
  'image-generation',
  'image-edit',
  'other-ai',
]);
const measurements = new Set(['exact', 'aggregate', 'observable']);
const statuses = new Set(['succeeded', 'failed', 'cancelled']);

const nonNegativeNumberOrNull = (value) => (
  value == null || (Number.isFinite(value) && value >= 0)
);
const nonNegativeIntegerOrNull = (value) => (
  value == null || (Number.isInteger(value) && value >= 0)
);

export function resolveAiLedger(config, configPath) {
  if (config.aiUsage?.enabled !== true) return null;
  const configured = config.aiUsage.ledger || 'usage/ai-calls.jsonl';
  return path.isAbsolute(configured)
    ? configured
    : path.resolve(path.dirname(configPath), configured);
}

export function validateAiEvent(event, line = null) {
  const problems = [];
  if (event?.schemaVersion !== 1) problems.push('schemaVersion must be 1');
  if (!event?.id || typeof event.id !== 'string') problems.push('id must be a non-empty string');
  if (!event?.recordedAt || Number.isNaN(Date.parse(event.recordedAt))) problems.push('recordedAt must be an ISO date');
  if (!operations.has(event?.operation)) problems.push(`operation must be one of: ${[...operations].join(', ')}`);
  if (!measurements.has(event?.measurement)) problems.push('measurement must be exact, aggregate, or observable');
  if (!statuses.has(event?.status)) problems.push('status must be succeeded, failed, or cancelled');
  if (!event?.provider || typeof event.provider !== 'string') problems.push('provider must be a non-empty string');
  if (!event?.model || typeof event.model !== 'string') problems.push('model must be a non-empty string');
  if (!event?.usage || typeof event.usage !== 'object' || Array.isArray(event.usage)) {
    problems.push('usage must be an object');
  }
  for (const name of ['inputTokens', 'cachedInputTokens', 'outputTokens', 'reasoningTokens']) {
    if (!Object.hasOwn(event?.usage || {}, name)) problems.push(`usage.${name} must be present`);
  }
  for (const [name, value] of Object.entries(event?.usage || {})) {
    if (!['inputTokens', 'cachedInputTokens', 'outputTokens', 'reasoningTokens'].includes(name)) {
      problems.push(`unknown usage field: ${name}`);
    } else if (!nonNegativeIntegerOrNull(value)) {
      problems.push(`${name} must be a non-negative integer or null`);
    }
  }
  if (!event?.output || typeof event.output !== 'object' || !Object.hasOwn(event.output, 'images')) {
    problems.push('output.images must be present');
  }
  if (!nonNegativeIntegerOrNull(event?.output?.images ?? null)) {
    problems.push('output.images must be a non-negative integer or null');
  }
  if (!event?.cost || typeof event.cost !== 'object' || !Object.hasOwn(event.cost, 'amountUsd')) {
    problems.push('cost.amountUsd must be present');
  }
  if (!nonNegativeNumberOrNull(event?.cost?.amountUsd ?? null)) {
    problems.push('cost.amountUsd must be a non-negative number or null');
  }
  if (problems.length) {
    throw new Error(`invalid AI usage event${line == null ? '' : ` at line ${line}`}: ${problems.join('; ')}`);
  }
  return event;
}

export async function readAiLedger(ledgerPath) {
  let bytes;
  try {
    bytes = await readFile(ledgerPath);
  } catch (error) {
    if (error.code === 'ENOENT') return { bytes: Buffer.alloc(0), events: [] };
    throw error;
  }
  const lines = bytes.toString('utf8').split(/\r?\n/).filter((line) => line.trim());
  const events = lines.map((line, index) => validateAiEvent(JSON.parse(line), index + 1));
  const ids = new Set();
  for (const event of events) {
    if (ids.has(event.id)) throw new Error(`duplicate AI usage event id: ${event.id}`);
    ids.add(event.id);
  }
  return { bytes, events };
}

const countBy = (events, key) => Object.fromEntries(
  [...events.reduce((map, event) => {
    const value = key(event);
    map.set(value, (map.get(value) || 0) + 1);
    return map;
  }, new Map())].sort(([a], [b]) => a.localeCompare(b)),
);

export function summarizeAiUsage(events, ledgerBytes = Buffer.alloc(0)) {
  const tokenFields = ['inputTokens', 'cachedInputTokens', 'outputTokens', 'reasoningTokens'];
  const tokens = {};
  for (const field of tokenFields) {
    const known = events.filter((event) => event.usage?.[field] != null);
    tokens[field] = {
      value: known.reduce((sum, event) => sum + event.usage[field], 0),
      coveredEvents: known.length,
    };
  }
  const priced = events.filter((event) => event.cost?.amountUsd != null);
  const totalCostUsd = Number(priced
    .reduce((sum, event) => sum + event.cost.amountUsd, 0)
    .toFixed(8));
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    ledgerSha256: createHash('sha256').update(ledgerBytes).digest('hex'),
    totalEvents: events.length,
    measurements: countBy(events, (event) => event.measurement),
    operations: countBy(events, (event) => event.operation),
    statuses: countBy(events, (event) => event.status),
    providerModels: countBy(events, (event) => `${event.provider}/${event.model}`),
    tokens,
    images: {
      value: events.reduce((sum, event) => sum + (event.output?.images ?? 0), 0),
      coveredEvents: events.filter((event) => event.output?.images != null).length,
    },
    cost: {
      currency: 'USD',
      amount: totalCostUsd,
      pricedEvents: priced.length,
      unpricedEvents: events.length - priced.length,
      complete: priced.length === events.length,
    },
  };
}
