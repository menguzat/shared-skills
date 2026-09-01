#!/usr/bin/env node
/**
 * Warning-based static audit for common desktop-first/mobile risks.
 * This tool intentionally does NOT claim that a match is a bug.
 * It produces review candidates for the agent's audit phase.
 */

import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] || process.cwd());
const allowed = new Set(['.html', '.htm', '.css', '.scss', '.sass', '.less', '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte']);
const ignored = new Set(['node_modules', '.git', 'dist', 'build', '.next', 'coverage', 'vendor']);

const rules = [
  {
    id: 'ZOOM_DISABLED', severity: 'critical',
    re: /(?:user-scalable\s*=\s*no|maximum-scale\s*=\s*1(?:\.0)?)(?=["',\s>])/i,
    message: 'Viewport may disable or restrict user zoom. Review against accessibility requirements.'
  },
  {
    id: 'LEGACY_100VH', severity: 'medium',
    re: /(?:min-|max-)?height\s*:\s*100vh\b/i,
    message: '100vh on a full-height surface may mishandle dynamic mobile browser UI. Review svh/dvh behavior.'
  },
  {
    id: 'LARGE_FIXED_WIDTH', severity: 'medium',
    re: /(?:min-)?width\s*:\s*(?:[7-9]\d{2}|\d{4,})px\b/i,
    message: 'Large fixed/minimum width may block compact layouts.'
  },
  {
    id: 'OVERFLOW_MASK', severity: 'low',
    re: /overflow-x\s*:\s*hidden\b/i,
    message: 'overflow-x:hidden can mask layout overflow. Verify it is intentional.'
  },
  {
    id: 'TOUCH_ACTION_NONE', severity: 'medium',
    re: /touch-action\s*:\s*none\b/i,
    message: 'touch-action:none disables browser touch behaviors in this region. Verify necessity and zoom/pan implications.'
  },
  {
    id: 'HOVER_HANDLER', severity: 'medium',
    re: /onMouse(?:Enter|Over)\s*=|\.on\(['"]mouseenter['"]/i,
    message: 'Mouse-hover handler found. Verify equivalent touch/keyboard access for meaningful functionality.'
  },
  {
    id: 'HARD_CODED_WIDTH_BRANCH', severity: 'low',
    re: /(?:innerWidth|clientWidth)\s*(?:<|<=|>|>=)\s*\d{3,4}/i,
    message: 'JavaScript width breakpoint found. Review whether CSS/container/capability queries are more robust.'
  },
  {
    id: 'ABSOLUTE_FIXED_BOTTOM', severity: 'low',
    re: /position\s*:\s*fixed[\s\S]{0,180}(?:bottom|inset-block-end)\s*:\s*0\b/i,
    message: 'Fixed bottom UI found. Verify safe-area inset and content overlap.'
  },
];

function walk(target, out = []) {
  const stat = fs.statSync(target);
  if (stat.isFile()) {
    if (allowed.has(path.extname(target).toLowerCase())) out.push(target);
    return out;
  }

  for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const full = path.join(target, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (allowed.has(path.extname(entry.name).toLowerCase())) out.push(full);
  }
  return out;
}

function lineNumber(text, index) {
  return text.slice(0, index).split('\n').length;
}

const findings = [];
for (const file of walk(root)) {
  let text;
  try { text = fs.readFileSync(file, 'utf8'); } catch { continue; }
  for (const rule of rules) {
    const flags = rule.re.flags.includes('g') ? rule.re.flags : `${rule.re.flags}g`;
    const re = new RegExp(rule.re.source, flags);
    for (const match of text.matchAll(re)) {
      findings.push({
        severity: rule.severity,
        id: rule.id,
        file: path.relative(root, file),
        line: lineNumber(text, match.index ?? 0),
        message: rule.message,
        sample: String(match[0]).replace(/\s+/g, ' ').slice(0, 120),
      });
    }
  }
}

const rank = { critical: 0, high: 1, medium: 2, low: 3 };
findings.sort((a, b) => rank[a.severity] - rank[b.severity] || a.file.localeCompare(b.file) || a.line - b.line);

if (!findings.length) {
  console.log('No static review candidates found by the limited rule set. This is not proof of mobile UX correctness.');
  process.exit(0);
}

console.log(JSON.stringify({ root, findingCount: findings.length, findings }, null, 2));
process.exit(findings.some(f => f.severity === 'critical') ? 2 : 0);
