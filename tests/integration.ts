#!/usr/bin/env tsx
/**
 * Integration test script for the SnapAPI JS SDK.
 * Hits the real API — requires a valid API key.
 *
 * Usage:
 *   SNAPAPI_KEY=sk_live_... npx tsx tests/integration.ts
 *
 * Alternatively, set SNAPAPI_BASE_URL to test against a local or staging server.
 */

import fs from 'node:fs';
import path from 'node:path';
import { SnapAPI } from '../src/index.js';
import type { SnapAPIError } from '../src/index.js';

const API_KEY = process.env['SNAPAPI_KEY'] ?? '';
const BASE_URL = process.env['SNAPAPI_BASE_URL'];

if (!API_KEY) {
  console.error('Error: SNAPAPI_KEY environment variable is required');
  process.exit(1);
}

const snap = new SnapAPI({
  apiKey: API_KEY,
  ...(BASE_URL ? { baseUrl: BASE_URL } : {}),
  timeout: 60_000,
});

let passed = 0;
let failed = 0;

async function test(name: string, fn: () => Promise<void>) {
  process.stdout.write(`  ${name} ... `);
  try {
    await fn();
    console.log('PASS');
    passed++;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`FAIL: ${msg}`);
    failed++;
  }
}

async function main() {
  console.log('\nSnapAPI JS SDK — Integration Tests');
  console.log('====================================\n');

  // Ping
  await test('ping()', async () => {
    const result = await snap.ping();
    if (result.status !== 'ok') throw new Error(`Expected status ok, got ${result.status}`);
  });

  // Quota
  await test('quota()', async () => {
    const usage = await snap.quota();
    if (typeof usage.used !== 'number') throw new Error('Expected numeric used count');
  });

  // Screenshot — binary
  await test('screenshot() binary PNG', async () => {
    const buf = await snap.screenshot({ url: 'https://example.com', format: 'png' });
    if (!Buffer.isBuffer(buf)) throw new Error('Expected Buffer');
    if (buf.length < 100) throw new Error('Buffer suspiciously small');
    fs.writeFileSync(path.join(process.cwd(), 'tmp-integration-shot.png'), buf);
  });

  // Screenshot — full page
  await test('screenshot() fullPage', async () => {
    const buf = await snap.screenshot({
      url: 'https://example.com',
      fullPage: true,
      format: 'jpeg',
      quality: 80,
    });
    if (!Buffer.isBuffer(buf)) throw new Error('Expected Buffer');
  });

  // PDF
  await test('pdf()', async () => {
    const buf = await snap.pdf({ url: 'https://example.com', pageSize: 'a4' });
    if (!Buffer.isBuffer(buf)) throw new Error('Expected Buffer');
    // PDF magic bytes: %PDF
    const magic = buf.slice(0, 4).toString('ascii');
    if (magic !== '%PDF') throw new Error(`Invalid PDF header: ${magic}`);
    fs.writeFileSync(path.join(process.cwd(), 'tmp-integration.pdf'), buf);
  });

  // Scrape
  await test('scrape()', async () => {
    const result = await snap.scrape({ url: 'https://example.com', type: 'text' });
    if (!result.success) throw new Error('success was false');
    if (!Array.isArray(result.results)) throw new Error('Expected results array');
  });

  // Extract
  await test('extract()', async () => {
    const result = await snap.extract({ url: 'https://example.com', type: 'markdown' });
    if (!result.success) throw new Error('success was false');
    if (!result.data) throw new Error('No data returned');
  });

  // Error handling: invalid key
  await test('AuthenticationError on bad key', async () => {
    const badSnap = new SnapAPI({ apiKey: 'sk_invalid', maxRetries: 0 });
    try {
      await badSnap.screenshot({ url: 'https://example.com' });
      throw new Error('Expected an error but request succeeded');
    } catch (err: unknown) {
      const e = err as SnapAPIError;
      if (e.name !== 'AuthenticationError') {
        throw new Error(`Expected AuthenticationError, got ${e.name}: ${e.message}`);
      }
    }
  });

  // Cleanup
  try { fs.unlinkSync('tmp-integration-shot.png'); } catch { /* noop */ }
  try { fs.unlinkSync('tmp-integration.pdf'); } catch { /* noop */ }

  console.log('\n====================================');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('====================================\n');

  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
