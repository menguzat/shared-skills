import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.resolve(here, '..', '..', 'references', 'publication-contract.schema.json');
const schema = JSON.parse(await readFile(schemaPath, 'utf8'));
const ajv = new Ajv2020({ allErrors: true, strict: true, allowUnionTypes: true });
const validate = ajv.compile(schema);

function semanticErrors(config) {
  const errors = [];
  if (config.release?.mode === 'distribution' && !config.layoutMode) {
    errors.push('distribution releases must declare layoutMode: deterministic or legacy');
  }
  if (config.layoutMode === 'deterministic' && !config.designSystem) {
    errors.push('deterministic layoutMode requires designSystem');
  }
  if (config.release?.mode === 'distribution' && config.layoutMode === 'deterministic') {
    if (config.release.editorialPreflight?.required !== true) errors.push('deterministic distribution releases require release.editorialPreflight.required: true');
    if (config.release.rebuildCapsule?.required !== true) errors.push('deterministic distribution releases require release.rebuildCapsule.required: true');
  }
  for (const rule of config.semanticRules || []) {
    const need = (fields) => {
      if (fields.some((field) => rule[field] == null || rule[field] === '')) errors.push(`${rule.kind} requires ${fields.join(', ')}`);
    };
    if (['min-font-size', 'max-lines', 'min-bottom-clearance', 'min-contrast', 'unique-text'].includes(rule.kind)) need(['selector', 'value']);
    if (rule.kind === 'heading-balance') {
      need(['selector']);
      if (['minLines', 'maxLines', 'minLastLineRatio', 'maxLineWidthRatio'].every((field) => rule[field] == null)) errors.push('heading-balance requires at least one threshold');
      if (rule.minLines != null && rule.maxLines != null && Number(rule.minLines) > Number(rule.maxLines)) errors.push('heading-balance minLines must not exceed maxLines');
    }
    if (['no-overlap', 'min-gap'].includes(rule.kind)) need(['a', 'b', ...(rule.kind === 'min-gap' ? ['value'] : [])]);
    if (rule.kind === 'no-text-art-overlap' || rule.kind === 'min-footer-gap') need(['selector', 'b']);
  }
  const headlineSelectors = new Set();
  for (const rule of config.designSystem?.headlines || []) {
    if (headlineSelectors.has(rule.selector)) errors.push(`duplicate designSystem headline selector: ${rule.selector}`);
    headlineSelectors.add(rule.selector);
    if (rule.minLines != null && rule.maxLines != null && Number(rule.minLines) > Number(rule.maxLines)) errors.push(`headline ${rule.selector}: minLines must not exceed maxLines`);
    if (['minLines', 'maxLines', 'minLastLineRatio', 'maxLineWidthRatio'].every((field) => rule[field] == null)) errors.push(`headline ${rule.selector}: at least one threshold is required`);
  }
  return errors;
}

export async function loadConfig(configPath) {
  const absolute = path.resolve(configPath);
  const configBytes = await readFile(absolute);
  const config = JSON.parse(configBytes.toString('utf8'));
  if (!validate(config)) {
    const details = validate.errors.map((error) => `${error.instancePath || '/'} ${error.message}`).join('; ');
    const failure = new Error(`publication.json schema validation failed: ${details}`);
    failure.code = 'CONFIG_SCHEMA';
    failure.validationErrors = validate.errors;
    throw failure;
  }
  const semantic = semanticErrors(config);
  if (semantic.length) {
    const failure = new Error(`publication.json semantic validation failed: ${semantic.join('; ')}`);
    failure.code = 'CONFIG_SEMANTIC';
    failure.validationErrors = semantic;
    throw failure;
  }
  return {
    config,
    configPath: absolute,
    configBytes,
    configSha256: createHash('sha256').update(configBytes).digest('hex'),
  };
}

export function argsFrom(argv = process.argv.slice(2)) {
  return {
    has: (name) => argv.includes(name),
    value: (name, fallback) => {
      const index = argv.indexOf(name);
      return index === -1 ? fallback : argv[index + 1];
    },
  };
}

export function normalizedUrl(value) {
  try {
    const url = new URL(value);
    if ((url.protocol === 'https:' && url.port === '443') || (url.protocol === 'http:' && url.port === '80')) {
      url.port = '';
    }
    return url.href;
  } catch {
    return value;
  }
}

export function multiset(values) {
  return Object.fromEntries(
    [...values.reduce((map, item) => map.set(item, (map.get(item) || 0) + 1), new Map())]
      .sort(([a], [b]) => a.localeCompare(b)),
  );
}

export function compareMultisets(expected, actual) {
  const keys = [...new Set([...Object.keys(expected), ...Object.keys(actual)])].sort();
  return keys
    .filter((key) => (expected[key] || 0) !== (actual[key] || 0))
    .map((key) => ({ value: key, expected: expected[key] || 0, actual: actual[key] || 0 }));
}

export function expectedLinks(config) {
  return (config.links?.required || []).flatMap((entry) => (
    Array.from({ length: Number(entry.count ?? 1) }, () => normalizedUrl(entry.href))
  ));
}

export const mmToPoints = (mm) => Number(mm) * (72 / 25.4);
