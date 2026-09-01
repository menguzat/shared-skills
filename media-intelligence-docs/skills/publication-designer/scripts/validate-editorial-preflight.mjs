#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { argsFrom, loadConfig } from './lib/contracts.mjs';

const allowed = new Set(['pass', 'revise', 'approved-exception']);
const args = argsFrom();
const { config, configPath, configSha256 } = await loadConfig(args.value('--config', 'publication.json'));
const reviewPath = path.resolve(args.value('--review', 'docs/preflight-editorial-review.json'));
const review = JSON.parse(await readFile(reviewPath, 'utf8'));
const violations = [];
const fail = (detail) => violations.push(detail);
const exceptionValid = (item) => item?.status !== 'approved-exception'
  || (typeof item.note === 'string' && item.note.trim() && typeof item.approvedBy === 'string' && item.approvedBy.trim()
    && typeof item.acceptanceCondition === 'string' && item.acceptanceCondition.trim());
if (review.schemaVersion !== 1) fail('schemaVersion must be 1');
if (!allowed.has(review.status)) fail('root status must be pass, revise, or approved-exception');
if (!review.reviewer || !review.reviewedAt) fail('reviewer and reviewedAt are required');
if (review.config !== configPath || review.configSha256 !== configSha256) fail('review does not bind the exact current publication config');
if (review.edition?.pageCount !== config.expectedPages) fail('edition.pageCount must equal expectedPages');
const pages = Array.isArray(review.pages) ? review.pages : [];
const pageIds = pages.map((item) => Number(item.page));
const exactPages = pages.length === config.expectedPages
  && new Set(pageIds).size === config.expectedPages
  && Array.from({ length: config.expectedPages }, (_, i) => pageIds.includes(i + 1)).every(Boolean);
if (!exactPages) fail('pages must cover every expected page exactly once');
for (const item of pages) {
  if (!allowed.has(item.status)) fail(`page ${item.page}: invalid status`);
  for (const check of ['visualSelection', 'layoutBalance', 'contentReadability']) {
    if (!allowed.has(item.checks?.[check])) fail(`page ${item.page}: checks.${check} is required`);
  }
  if (!exceptionValid(item)) fail(`page ${item.page}: approved exception lacks accountable fields`);
  if (item.textMode === 'overlay' && !item.safeZoneSelector) fail(`page ${item.page}: overlay text requires safeZoneSelector`);
}
const requiredSpreads = config.release?.reviewSpreads || [];
const spreads = Array.isArray(review.spreads) ? review.spreads : [];
if (spreads.length !== requiredSpreads.length || new Set(spreads.map((item) => item.id)).size !== spreads.length
  || !requiredSpreads.every((id) => spreads.some((item) => item.id === id))) fail('spreads must cover every declared review spread exactly once');
for (const item of spreads) {
  if (!allowed.has(item.status) || !exceptionValid(item)) fail(`spread ${item.id}: invalid or unaccountable status`);
}
const findings = Array.isArray(review.findings) ? review.findings : [];
for (const finding of findings) {
  if (!finding.id || !finding.severity || !finding.owner || !finding.action) fail('every finding needs id, severity, owner, and action');
}
const unresolved = findings.filter((finding) => finding.status !== 'closed');
const pageBlocking = pages.some((item) => item.status === 'revise' || Object.values(item.checks || {}).includes('revise'));
const spreadBlocking = spreads.some((item) => item.status === 'revise');
if (review.status === 'pass' && (unresolved.length || pageBlocking || spreadBlocking)) fail('pass review cannot have unresolved findings or revise dispositions');
if (review.status !== 'pass' && violations.length === 0) violations.push('review is structurally valid but not approved for composition');
const output = { schemaVersion: 1, passed: violations.length === 0, review: reviewPath, config: configPath, configSha256, violations };
const out = args.value('--out');
if (out) await writeFile(path.resolve(out), `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
if (!output.passed) process.exitCode = 1;
