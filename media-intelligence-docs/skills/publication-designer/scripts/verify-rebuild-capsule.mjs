#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { lstat, readFile } from 'node:fs/promises';
import path from 'node:path';
import { argsFrom } from './lib/contracts.mjs';

const args = argsFrom();
const capsule = path.resolve(args.value('--capsule', 'rebuild-capsule'));
const manifestPath = path.join(capsule, 'capsule-manifest.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const violations = [];
const digest = async (file) => createHash('sha256').update(await readFile(file)).digest('hex');
if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.files)) violations.push('invalid capsule manifest shape');
const seen = new Set();
for (const item of manifest.files || []) {
  if (!item.relativePath || path.isAbsolute(item.relativePath) || item.relativePath.split('/').includes('..')) {
    violations.push(`unsafe manifest path: ${item.relativePath}`); continue;
  }
  if (seen.has(item.relativePath)) violations.push(`duplicate manifest path: ${item.relativePath}`);
  seen.add(item.relativePath);
  const file = path.join(capsule, item.relativePath);
  try {
    const info = await lstat(file);
    if (!info.isFile() || info.isSymbolicLink()) { violations.push(`not a regular file: ${item.relativePath}`); continue; }
    if (info.size !== item.bytes) violations.push(`byte count mismatch: ${item.relativePath}`);
    if (await digest(file) !== item.sha256) violations.push(`checksum mismatch: ${item.relativePath}`);
  } catch { violations.push(`missing file: ${item.relativePath}`); }
}
const pdf = path.join(capsule, manifest.outputPdf || '');
try { if (await digest(pdf) !== manifest.pdfSha256) violations.push('output PDF checksum does not match manifest'); } catch { violations.push('output PDF missing'); }
const output = { schemaVersion: 1, capsule, passed: violations.length === 0, files: manifest.files?.length || 0, violations };
console.log(JSON.stringify(output, null, 2));
if (!output.passed) process.exitCode = 1;
