#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { cp, lstat, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { argsFrom, loadConfig } from './lib/contracts.mjs';

const sha256 = async (file) => createHash('sha256').update(await readFile(file)).digest('hex');
const repeated = (name) => process.argv.slice(2).flatMap((value, index, values) => value === name ? [values[index + 1]] : []).filter(Boolean);
const roleEntries = repeated('--role').map((value) => {
  const delimiter = value.indexOf(':');
  if (delimiter < 1 || delimiter === value.length - 1) throw new Error(`--role must use role:relative/path, received ${value}`);
  return { role: value.slice(0, delimiter), relative: value.slice(delimiter + 1) };
});
const args = argsFrom();
const projectRoot = path.resolve(args.value('--project-root', '.'));
const run = path.resolve(args.value('--run', 'runs/latest'));
const out = path.resolve(args.value('--out', 'rebuild-capsule'));
const { configPath, configSha256 } = await loadConfig(args.value('--config', 'publication.json'));
const ensureInside = (absolute, label) => {
  const relative = path.relative(projectRoot, absolute);
  if (relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative))) return relative || path.basename(absolute);
  throw new Error(`${label} must be inside --project-root: ${absolute}`);
};
const configRelative = ensureInside(configPath, 'config');
const runRelative = ensureInside(run, 'run');
try { await stat(out); throw new Error(`capsule destination exists: ${out}`); } catch (error) { if (error.code !== 'ENOENT') throw error; }
const named = new Map([[configRelative, 'config']]);
for (const relative of repeated('--include')) named.set(relative, named.get(relative) || 'source');
for (const { role, relative } of roleEntries) named.set(relative, role);
const files = [];
const addFile = async (absolute, destinationRelative, role) => {
  const info = await lstat(absolute);
  if (info.isSymbolicLink()) throw new Error(`symlinks are not permitted in a rebuild capsule: ${absolute}`);
  if (!info.isFile()) return;
  files.push({ absolute, relativePath: destinationRelative.split(path.sep).join('/'), role, bytes: info.size, sha256: await sha256(absolute) });
};
const walk = async (absolute, destinationRelative, role) => {
  const info = await lstat(absolute);
  if (info.isSymbolicLink()) throw new Error(`symlinks are not permitted in a rebuild capsule: ${absolute}`);
  if (info.isFile()) return addFile(absolute, destinationRelative, role);
  if (!info.isDirectory()) return;
  for (const child of (await readdir(absolute)).sort()) await walk(path.join(absolute, child), path.join(destinationRelative, child), role);
};
for (const [relative, role] of named) {
  if (path.isAbsolute(relative)) throw new Error(`--include and --role paths must be relative to project root: ${relative}`);
  const absolute = path.resolve(projectRoot, relative);
  ensureInside(absolute, 'included path');
  await walk(absolute, relative, role);
}
await walk(run, path.join('__run__', runRelative), 'evidence');
const duplicatePaths = files.filter((file, index) => files.findIndex((candidate) => candidate.relativePath === file.relativePath) !== index);
if (duplicatePaths.length) throw new Error(`duplicate capsule paths: ${[...new Set(duplicatePaths.map((file) => file.relativePath))].join(', ')}`);
const runPdf = path.join(run, 'output.pdf');
const pdfSha256 = await sha256(runPdf);
const manifest = {
  schemaVersion: 1,
  createdAt: new Date().toISOString(),
  projectRoot,
  config: configRelative.split(path.sep).join('/'),
  configSha256,
  run: runRelative.split(path.sep).join('/'),
  outputPdf: `${path.join('__run__', runRelative, 'output.pdf').split(path.sep).join('/')}`,
  pdfSha256,
  files: files.sort((a, b) => a.relativePath.localeCompare(b.relativePath)).map(({ absolute, ...file }) => file),
};
await mkdir(out, { recursive: true });
try {
  for (const file of files) {
    const destination = path.join(out, file.relativePath);
    await mkdir(path.dirname(destination), { recursive: true });
    await cp(file.absolute, destination, { force: false, errorOnExist: true });
  }
  await writeFile(path.join(out, 'capsule-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
} catch (error) {
  await rm(out, { recursive: true, force: true });
  throw error;
}
console.log(`Created rebuild capsule: ${out}\nFiles: ${manifest.files.length}\nPDF SHA-256: ${pdfSha256}`);
