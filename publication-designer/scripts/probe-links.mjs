#!/usr/bin/env node
import { lookup } from 'node:dns/promises';
import http from 'node:http';
import https from 'node:https';
import { isIP } from 'node:net';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { argsFrom, loadConfig, normalizedUrl } from './lib/contracts.mjs';

const args = argsFrom();
const run = path.resolve(args.value('--run', 'runs/latest'));
const { config, configPath } = await loadConfig(args.value('--config', 'publication.json'));
await mkdir(run, { recursive: true });
const violations = [];
const results = [];
const urls = [...new Set((config.links?.probe || []).map(normalizedUrl))];
const timeoutMs = Number(config.links?.probeTimeoutMs ?? 10_000);
const maxRedirects = Number(config.links?.probeMaxRedirects ?? 5);

function publicIPv4(address) {
  const octets = address.split('.').map(Number);
  const [a, b] = octets;
  return !(
    a === 0 || a === 10 || a === 127 || a >= 224
    || (a === 100 && b >= 64 && b <= 127)
    || (a === 169 && b === 254)
    || (a === 172 && b >= 16 && b <= 31)
    || (a === 192 && [0, 2, 168].includes(b))
    || (a === 198 && (b === 18 || b === 19 || b === 51))
    || (a === 203 && b === 0)
  );
}

function ipv6Words(address) {
  let value = address.toLowerCase().replace(/^\[|\]$/g, '');
  if (value.includes('.')) {
    const lastColon = value.lastIndexOf(':');
    const octets = value.slice(lastColon + 1).split('.').map(Number);
    value = `${value.slice(0, lastColon)}:${((octets[0] << 8) | octets[1]).toString(16)}:${((octets[2] << 8) | octets[3]).toString(16)}`;
  }
  const [leftRaw, rightRaw = ''] = value.split('::');
  const left = leftRaw ? leftRaw.split(':') : [];
  const right = rightRaw ? rightRaw.split(':') : [];
  const zeros = Array(Math.max(0, 8 - left.length - right.length)).fill('0');
  return [...left, ...zeros, ...right].map((word) => Number.parseInt(word || '0', 16));
}

function publicIPv6(address) {
  const words = ipv6Words(address);
  if (words.length !== 8 || words.some((word) => !Number.isFinite(word))) return false;
  const [a, b, c, d, e, f, g, h] = words;
  if (words.every((word) => word === 0) || words.slice(0, 7).every((word) => word === 0) && h === 1) return false;
  if ((a & 0xfe00) === 0xfc00 || (a & 0xffc0) === 0xfe80 || (a & 0xff00) === 0xff00) return false;
  if ((a === 0x2001 && (b === 0 || b === 0x0db8)) || (a === 0x0100 && b === 0 && c === 0 && d === 0)) return false;
  const embedded = `${g >> 8}.${g & 255}.${h >> 8}.${h & 255}`;
  if (a === 0 && b === 0 && c === 0 && d === 0 && e === 0 && (f === 0 || f === 0xffff)) return publicIPv4(embedded);
  if (a === 0x64 && b === 0xff9b && c === 0 && d === 0 && e === 0 && f === 0) return publicIPv4(embedded);
  if (a === 0x2002) {
    const carried = `${b >> 8}.${b & 255}.${c >> 8}.${c & 255}`;
    return publicIPv4(carried);
  }
  return true;
}

function publicAddress(address) {
  const family = isIP(address);
  return family === 4 ? publicIPv4(address) : family === 6 ? publicIPv6(address) : false;
}

async function validatedAddresses(hostname, deadline) {
  const host = hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local')) {
    throw new Error('private or local hosts are not allowed');
  }
  let timer;
  const remaining = deadline - Date.now();
  if (remaining <= 0) throw new Error('overall probe deadline exceeded');
  const addresses = isIP(host)
    ? [{ address: host, family: isIP(host) }]
    : await Promise.race([
      lookup(host, { all: true, verbatim: true }),
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('DNS lookup timed out')), remaining); }),
    ]).finally(() => clearTimeout(timer));
  if (!addresses.length || addresses.some((item) => !publicAddress(item.address))) {
    throw new Error('host resolves to a private, local, documentation, or reserved address');
  }
  return addresses;
}

function requestHeaders(url, addresses, method, remainingMs) {
  return new Promise((resolve, reject) => {
    const transport = url.protocol === 'https:' ? https : http;
    const request = transport.request(url, {
      method,
      headers: method === 'GET' ? { Range: 'bytes=0-0' } : {},
      lookup: (_hostname, options, callback) => {
        if (options?.all) callback(null, addresses);
        else callback(null, addresses[0].address, addresses[0].family);
      },
    }, (response) => {
      const result = { status: response.statusCode || 0, headers: response.headers };
      response.destroy();
      resolve(result);
    });
    request.setTimeout(remainingMs, () => request.destroy(new Error('request timed out')));
    request.on('error', reject);
    request.end();
  });
}

async function probe(start) {
  let current = new URL(start);
  const deadline = Date.now() + timeoutMs;
  for (let redirect = 0; redirect <= maxRedirects; redirect += 1) {
    if (!['http:', 'https:'].includes(current.protocol)) throw new Error('only HTTP(S) links may be probed');
    if (current.username || current.password) throw new Error('credential-bearing URLs are not allowed');
    const addresses = await validatedAddresses(current.hostname, deadline);
    const remaining = deadline - Date.now();
    if (remaining <= 0) throw new Error('overall probe deadline exceeded');
    let response = await requestHeaders(current, addresses, 'HEAD', remaining);
    if (response.status === 405 || response.status === 501) {
      const getRemaining = deadline - Date.now();
      if (getRemaining <= 0) throw new Error('overall probe deadline exceeded');
      response = await requestHeaders(current, addresses, 'GET', getRemaining);
    }
    if (response.status >= 300 && response.status < 400 && response.headers.location) {
      if (redirect === maxRedirects) throw new Error('too many redirects');
      current = new URL(response.headers.location, current);
      continue;
    }
    return { finalUrl: current.href, status: response.status };
  }
  throw new Error('too many redirects');
}

for (const value of urls) {
  try {
    const response = await probe(value);
    const ok = response.status >= 200 && response.status < 400;
    results.push({ url: value, ...response, ok });
    if (!ok) violations.push({ kind: 'link-probe-status', url: value, status: response.status });
  } catch (error) {
    results.push({ url: value, ok: false, error: error.message });
    violations.push({ kind: 'link-probe-error', url: value, detail: error.message });
  }
}

const report = { schemaVersion: 1, config: configPath, urls, results, violations, passed: violations.length === 0 };
const reportPath = path.join(run, 'link-probe.json');
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(`Link probe ${report.passed ? 'passed' : 'failed'}: ${reportPath}`);
if (!report.passed) process.exitCode = 1;
