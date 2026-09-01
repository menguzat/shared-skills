#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { access, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { argsFrom, loadConfig } from './lib/contracts.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.resolve(here, '..');
const args = argsFrom();

if (args.has('--help')) {
  console.log(`Usage: node gemini-visual-review.mjs --run <qa-run> --config <publication.json> [--brief <art-direction.md>] [--out <review.json>]\n\nLoads credentials only from the publication-designer skill's .env file (or process environment), sends the PDF contact sheet and per-page PDF rasters to Gemini, and writes structured independent visual-review evidence.`);
  process.exit(0);
}

function parseDotenv(raw) {
  const values = {};
  for (const originalLine of raw.split(/\r?\n/)) {
    const line = originalLine.trim();
    if (!line || line.startsWith('#')) continue;
    const match = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;
    let [, key, value] = match;
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    } else {
      value = value.replace(/\s+#.*$/, '').trim();
    }
    values[key] = value;
  }
  return values;
}

async function loadSkillEnv() {
  const envPath = path.join(skillRoot, '..', '.env');
  try {
    return parseDotenv(await readFile(envPath, 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') return {};
    throw error;
  }
}

const env = { ...(await loadSkillEnv()), ...process.env };
const apiKey = env.GEMINI_API_KEY;
const model = env.GEMINI_MODEL_FAST || env.GEMINI_FAST_MODEL || env.GEMINI_MODEL;
if (!apiKey) throw new Error(`GEMINI_API_KEY is missing. Add it to ${path.join(skillRoot, '.env')} (see .env.example).`);
if (!model) throw new Error('Set GEMINI_MODEL_FAST, GEMINI_FAST_MODEL, or GEMINI_MODEL in the skill-local .env file.');

const run = path.resolve(args.value('--run', 'runs/latest'));
const { config, configPath, configSha256 } = await loadConfig(args.value('--config', 'publication.json'));
const briefPath = path.resolve(args.value('--brief', path.join(path.dirname(configPath), 'docs', 'art-direction.md')));
const out = path.resolve(args.value('--out', path.join(run, 'gemini-visual-review.json')));
const expectedPages = Number(config.expectedPages);
const pdfPath = path.join(run, 'output.pdf');
const contactSheet = path.join(run, 'pdf-contact-sheet.png');

await Promise.all([access(pdfPath), access(contactSheet), access(briefPath)]);
const pagePaths = Array.from({ length: expectedPages }, (_, index) => path.join(run, 'pdf-pages', `page-${String(index + 1).padStart(2, '0')}.png`));
await Promise.all(pagePaths.map((file) => access(file)));

const sha256 = (input) => createHash('sha256').update(input).digest('hex');
const [pdfBytes, brief] = await Promise.all([readFile(pdfPath), readFile(briefPath, 'utf8')]);

const reviewLanguage = config.visualReview?.language || config.language || 'the publication language';
const invariants = config.visualReview?.invariants || [];
const invariantSection = invariants.length
  ? `\nProject-specific visual invariants (verify only when visible):\n${invariants.map((item) => `- ${item}`).join('\n')}`
  : '';
const requiredSpreads = config.release?.reviewSpreads || [];
const prompt = `You are an independent senior art director reviewing a fixed-page PDF publication. Do not infer facts that are not visible. This is a release-gate review, not a redesign request.\n\nPublication contract:\n- Title: ${config.title || 'not declared'}\n- Language for the review: ${reviewLanguage}\n- Format: ${config.format.widthMm} x ${config.format.heightMm} mm, ${expectedPages} pages\n- Art direction: ${config.artDirection?.label || 'not declared'}; editorial mode: ${config.artDirection?.editorialMode || 'not declared'}\n- Release spreads: ${requiredSpreads.join(', ') || 'none'}\n\nDesign brief:\n${brief.slice(0, 12000)}${invariantSection}\n\nInspect the contact sheet first, then every individual PDF raster. Check page rhythm, hierarchy, language readability, spacing, crop, visual repetition, and image–text relationships. Treat generated imagery according to the project brief; do not claim it documents an applied project unless the brief says so.\n\nReturn valid JSON only, with this exact top-level shape:\n{\n  "overall": "pass" | "revise" | "blocked",\n  "summary": "short summary in the review language",\n  "pages": [{"page": 1, "status": "pass" | "revise" | "approved-exception", "findings": [{"severity": "blocker" | "revise" | "note", "issue": "short issue", "evidence": "visible evidence", "acceptanceCondition": "specific fix or empty string"}]}],\n  "spreads": [{"id": "configured spread id", "status": "pass" | "revise" | "approved-exception", "findings": []}],\n  "releaseRecommendation": "pass" | "revise" | "blocked"\n}\nUse exactly ${expectedPages} page entries, numbered 1 through ${expectedPages}, and exactly ${requiredSpreads.length} spread entries matching the configured IDs. Do not include credentials, prompts, model speculation, or markdown.`;

const toInlineData = async (file) => ({
  inlineData: {
    mimeType: 'image/png',
    data: (await readFile(file)).toString('base64'),
  },
});

const parts = [
  { text: prompt },
  { text: 'PDF contact sheet:' },
  await toInlineData(contactSheet),
];
for (let index = 0; index < pagePaths.length; index += 1) {
  parts.push({ text: `PDF raster page ${index + 1}:` });
  parts.push(await toInlineData(pagePaths[index]));
}

const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
const response = await fetch(endpoint, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ role: 'user', parts }],
    generationConfig: { temperature: 0.1, responseMimeType: 'application/json' },
  }),
});
if (!response.ok) {
  const body = await response.text();
  const safeMessage = body.replaceAll(apiKey, '[REDACTED]').slice(0, 800);
  throw new Error(`Gemini visual review failed (HTTP ${response.status}): ${safeMessage}`);
}
const payload = await response.json();
const rawText = payload?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('\n').trim();
if (!rawText) throw new Error('Gemini returned no review text.');
let review;
try {
  review = JSON.parse(rawText.replace(/^```json\s*|\s*```$/g, ''));
} catch (error) {
  throw new Error(`Gemini returned non-JSON review: ${error.message}`);
}
const validStatuses = new Set(['pass', 'revise', 'approved-exception']);
if (!['pass', 'revise', 'blocked'].includes(review?.overall) || !['pass', 'revise', 'blocked'].includes(review?.releaseRecommendation)) {
  throw new Error('Gemini review has invalid overall or releaseRecommendation status.');
}
if (!Array.isArray(review.pages) || review.pages.length !== expectedPages || new Set(review.pages.map((item) => Number(item.page))).size !== expectedPages || review.pages.some((item) => !validStatuses.has(item.status))) {
  throw new Error('Gemini review must cover every page exactly once with a valid status.');
}
if (!Array.isArray(review.spreads) || new Set(review.spreads.map((item) => item.id)).size !== requiredSpreads.length || requiredSpreads.some((id) => !review.spreads.some((item) => item.id === id && validStatuses.has(item.status)))) {
  throw new Error('Gemini review must cover every configured release spread exactly once.');
}

const evidence = {
  schemaVersion: 1,
  provider: 'google-gemini',
  model,
  generatedAt: new Date().toISOString(),
  run,
  config: configPath,
  configSha256,
  pdfSha256: sha256(pdfBytes),
  brief: briefPath,
  inputs: [contactSheet, ...pagePaths].map((file) => path.relative(run, file)),
  review,
};
await writeFile(out, `${JSON.stringify(evidence, null, 2)}\n`);
console.log(`Gemini visual review written: ${out}`);
