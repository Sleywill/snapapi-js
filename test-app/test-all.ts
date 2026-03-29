/**
 * Comprehensive SnapAPI SDK Live Integration Test Suite
 *
 * Tests EVERY implemented method against the LIVE API.
 * Run with:
 *   SNAPAPI_KEY=sk_live_xxx ts-node --esm test-all.ts
 *   OR compile and run with node
 *
 * Usage counter implications:
 *   Each successful screenshot/scrape/extract/video call
 *   consumes one unit from the account quota.
 */

import SnapAPI, {
  AuthenticationError,
  RateLimitError,
  SnapAPIError,
  ValidationError,
} from '../src/index';
import type {
  ScreenshotStorageResult,
  ScreenshotQueuedResult,
  ScrapeResult,
  ExtractResult,
  AccountUsage,
  ApiKey,
  VideoResult,
} from '../src/index';
import * as fs from 'fs';
import * as path from 'path';

const API_KEY = process.env.SNAPAPI_KEY || '';
if (!API_KEY) {
  console.error('ERROR: Set SNAPAPI_KEY environment variable');
  process.exit(1);
}

// ── output dir for saved files ────────────────────────────────────────────────
const outDir = path.join(__dirname, 'output');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// ── test runner ───────────────────────────────────────────────────────────────
interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  notes: string;
  durationMs: number;
  typeMismatch?: string;
}

const results: TestResult[] = [];

async function test(
  name: string,
  fn: () => Promise<void>,
  skip = false,
): Promise<void> {
  if (skip) {
    results.push({ name, status: 'SKIP', notes: 'skipped', durationMs: 0 });
    console.log(`⏭  [SKIP] ${name}`);
    return;
  }
  const start = Date.now();
  try {
    await fn();
    const ms = Date.now() - start;
    results.push({ name, status: 'PASS', notes: '', durationMs: ms });
    console.log(`✅ [PASS] ${name}  (${ms}ms)`);
  } catch (e: unknown) {
    const ms = Date.now() - start;
    const msg = e instanceof Error ? e.message : String(e);
    results.push({ name, status: 'FAIL', notes: msg, durationMs: ms });
    console.error(`❌ [FAIL] ${name}: ${msg}`);
  }
}

function assert(cond: boolean, msg: string): asserts cond {
  if (!cond) throw new Error(`Assertion failed: ${msg}`);
}

function assertBuffer(val: unknown, label: string): asserts val is Buffer {
  assert(Buffer.isBuffer(val), `${label} must be Buffer, got ${typeof val}`);
  assert((val as Buffer).length > 100, `${label} buffer is suspiciously small (${(val as Buffer).length} bytes)`);
}

// ── clients ───────────────────────────────────────────────────────────────────
const snap = new SnapAPI({
  apiKey: API_KEY,
  maxRetries: 1,
  retryDelay: 500,
});

const invalidSnap = new SnapAPI({
  apiKey: 'sk_live_THIS_IS_INVALID_KEY_0000000000000000000000000',
  maxRetries: 0,
});

// ─────────────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  SnapAPI JS SDK — Comprehensive Live API Test Suite');
  console.log('═══════════════════════════════════════════════════════════\n');

  // ══════════════════════════════════════════════════
  // SECTION 1: Client construction
  // ══════════════════════════════════════════════════
  console.log('\n── Section 1: Client Construction ──────────────────────────');

  await test('T01 constructor throws on missing apiKey', async () => {
    try {
      new SnapAPI({ apiKey: '' });
      throw new Error('Should have thrown');
    } catch (e: unknown) {
      assert(e instanceof Error && e.message.includes('apiKey'), 'wrong error message');
    }
  });

  await test('T02 createClient factory', async () => {
    const { createClient } = await import('../src/client.js');
    const c = createClient({ apiKey: API_KEY });
    assert(c instanceof SnapAPI, 'not a SnapAPI instance');
  });

  await test('T03 namespace sub-objects present', async () => {
    assert(snap.storage !== undefined, 'storage namespace missing');
    assert(snap.scheduled !== undefined, 'scheduled namespace missing');
    assert(snap.webhooks !== undefined, 'webhooks namespace missing');
    assert(snap.keys !== undefined, 'keys namespace missing');
  });

  // ══════════════════════════════════════════════════
  // SECTION 2: Ping & Usage
  // ══════════════════════════════════════════════════
  console.log('\n── Section 2: Ping & Usage ──────────────────────────────────');

  await test('T04 ping - returns { status: "ok", timestamp }', async () => {
    const r = await snap.ping();
    assert(r.status === 'ok', `status = "${r.status}"`);
    assert(typeof r.timestamp === 'number', 'timestamp not number');
    console.log(`   timestamp: ${r.timestamp}`);
  });

  let usageBeforeTests = 0;
  await test('T05 getUsage - returns AccountUsage shape', async () => {
    const r: AccountUsage = await snap.getUsage();
    assert(typeof r.used === 'number', `used not number: ${JSON.stringify(r)}`);
    assert(typeof r.limit === 'number', `limit not number`);
    assert(typeof r.remaining === 'number', `remaining not number`);
    assert(r.used + r.remaining === r.limit, `used+remaining != limit`);
    usageBeforeTests = r.used;
    console.log(`   used: ${r.used}/${r.limit}, resetAt: ${r.resetAt}`);
  });

  await test('T06 quota() alias for getUsage()', async () => {
    const r = await snap.quota();
    assert(typeof r.used === 'number', 'quota() broke');
  });

  // ══════════════════════════════════════════════════
  // SECTION 3: Screenshot — formats
  // ══════════════════════════════════════════════════
  console.log('\n── Section 3: Screenshot — formats ─────────────────────────');

  await test('T07 screenshot PNG (default format)', async () => {
    const buf = await snap.screenshot({ url: 'https://example.com' });
    assertBuffer(buf, 'PNG screenshot');
    fs.writeFileSync(path.join(outDir, 'T07_basic.png'), buf as Buffer);
    // Verify PNG magic bytes: 89 50 4E 47
    const header = (buf as Buffer).slice(0, 4);
    assert(header[0] === 0x89 && header[1] === 0x50, 'Not a valid PNG');
  });

  await test('T08 screenshot JPEG format', async () => {
    const buf = await snap.screenshot({ url: 'https://example.com', format: 'jpeg', quality: 80 });
    assertBuffer(buf, 'JPEG screenshot');
    fs.writeFileSync(path.join(outDir, 'T08_jpeg.jpg'), buf as Buffer);
    // JPEG magic bytes: FF D8
    const header = (buf as Buffer).slice(0, 2);
    assert(header[0] === 0xFF && header[1] === 0xD8, 'Not a valid JPEG');
  });

  await test('T09 screenshot WebP format', async () => {
    const buf = await snap.screenshot({ url: 'https://example.com', format: 'webp', quality: 85 });
    assertBuffer(buf, 'WebP screenshot');
    fs.writeFileSync(path.join(outDir, 'T09_webp.webp'), buf as Buffer);
    // WebP magic: RIFF....WEBP
    const riff = (buf as Buffer).slice(0, 4).toString('ascii');
    const webp = (buf as Buffer).slice(8, 12).toString('ascii');
    assert(riff === 'RIFF' && webp === 'WEBP', 'Not a valid WebP');
  });

  // ══════════════════════════════════════════════════
  // SECTION 4: Screenshot — viewport options
  // ══════════════════════════════════════════════════
  console.log('\n── Section 4: Screenshot — viewport options ─────────────────');

  await test('T10 screenshot fullPage capture', async () => {
    const buf = await snap.screenshot({ url: 'https://example.com', fullPage: true });
    assertBuffer(buf, 'fullPage screenshot');
    fs.writeFileSync(path.join(outDir, 'T10_fullpage.png'), buf as Buffer);
  });

  await test('T11 screenshot custom viewport (375x667 mobile)', async () => {
    const buf = await snap.screenshot({ url: 'https://example.com', width: 375, height: 667 });
    assertBuffer(buf, 'custom viewport screenshot');
    fs.writeFileSync(path.join(outDir, 'T11_mobile.png'), buf as Buffer);
  });

  await test('T12 screenshot custom viewport (1920x1080)', async () => {
    const buf = await snap.screenshot({ url: 'https://example.com', width: 1920, height: 1080 });
    assertBuffer(buf, '1920x1080 screenshot');
    fs.writeFileSync(path.join(outDir, 'T12_1920x1080.png'), buf as Buffer);
  });

  await test('T13 screenshot darkMode', async () => {
    const buf = await snap.screenshot({ url: 'https://example.com', darkMode: true });
    assertBuffer(buf, 'darkMode screenshot');
    fs.writeFileSync(path.join(outDir, 'T13_darkmode.png'), buf as Buffer);
  });

  // ══════════════════════════════════════════════════
  // SECTION 5: Screenshot — plan-gated features
  // ══════════════════════════════════════════════════
  console.log('\n── Section 5: Screenshot — plan-gated features ──────────────');

  await test('T14 screenshot CSS injection (plan check)', async () => {
    try {
      const buf = await snap.screenshot({
        url: 'https://example.com',
        css: 'body { background: hotpink !important; }',
      });
      assertBuffer(buf, 'CSS injection screenshot');
      fs.writeFileSync(path.join(outDir, 'T14_css.png'), buf as Buffer);
    } catch (e: unknown) {
      if (e instanceof SnapAPIError && e.statusCode === 403) {
        throw new Error(`Plan restriction: ${(e as SnapAPIError).message} [expected on Free plan]`);
      }
      throw e;
    }
  });

  await test('T15 screenshot JavaScript injection (plan check)', async () => {
    try {
      const buf = await snap.screenshot({
        url: 'https://example.com',
        javascript: 'document.body.style.background = "lime";',
      });
      assertBuffer(buf, 'JS injection screenshot');
    } catch (e: unknown) {
      if (e instanceof SnapAPIError && e.statusCode === 403) {
        throw new Error(`Plan restriction: ${(e as SnapAPIError).message} [expected on non-Pro plan]`);
      }
      throw e;
    }
  });

  await test('T16 screenshot blockAds (plan check)', async () => {
    try {
      const buf = await snap.screenshot({ url: 'https://example.com', blockAds: true });
      assertBuffer(buf, 'blockAds screenshot');
    } catch (e: unknown) {
      if (e instanceof SnapAPIError && e.statusCode === 403) {
        throw new Error(`Plan restriction: ${(e as SnapAPIError).message} [expected on Free plan]`);
      }
      throw e;
    }
  });

  await test('T17 screenshot blockCookieBanners', async () => {
    // blockCookieBanners might also be plan-gated; test and report
    try {
      const buf = await snap.screenshot({ url: 'https://example.com', blockCookieBanners: true });
      assertBuffer(buf, 'blockCookieBanners screenshot');
    } catch (e: unknown) {
      if (e instanceof SnapAPIError && e.statusCode === 403) {
        throw new Error(`Plan restriction: ${(e as SnapAPIError).message}`);
      }
      throw e;
    }
  });

  // ══════════════════════════════════════════════════
  // SECTION 6: Screenshot — advanced options
  // ══════════════════════════════════════════════════
  console.log('\n── Section 6: Screenshot — advanced options ─────────────────');

  await test('T18 screenshot delay option', async () => {
    const buf = await snap.screenshot({ url: 'https://example.com', delay: 500 });
    assertBuffer(buf, 'delay screenshot');
  });

  await test('T19 screenshot waitForSelector', async () => {
    const buf = await snap.screenshot({ url: 'https://example.com', waitForSelector: 'h1' });
    assertBuffer(buf, 'waitForSelector screenshot');
  });

  await test('T20 screenshot hideSelectors', async () => {
    const buf = await snap.screenshot({ url: 'https://example.com', hideSelectors: ['h1'] });
    assertBuffer(buf, 'hideSelectors screenshot');
  });

  await test('T21 screenshot reducedMotion', async () => {
    const buf = await snap.screenshot({ url: 'https://example.com', reducedMotion: true });
    assertBuffer(buf, 'reducedMotion screenshot');
  });

  await test('T22 screenshot timezone option', async () => {
    const buf = await snap.screenshot({ url: 'https://example.com', timezone: 'America/New_York' });
    assertBuffer(buf, 'timezone screenshot');
  });

  await test('T23 screenshot HTML input', async () => {
    const buf = await snap.screenshot({ html: '<h1 style="color:red;padding:40px">Hello SnapAPI!</h1>' });
    assertBuffer(buf, 'HTML screenshot');
    fs.writeFileSync(path.join(outDir, 'T23_html.png'), buf as Buffer);
  });

  await test('T24 screenshot Markdown input', async () => {
    const buf = await snap.screenshot({ markdown: '# Hello\n\n**Bold** and *italic*.\n\n- Item A\n- Item B' });
    assertBuffer(buf, 'Markdown screenshot');
    fs.writeFileSync(path.join(outDir, 'T24_markdown.png'), buf as Buffer);
  });

  // ══════════════════════════════════════════════════
  // SECTION 7: screenshotToFile helper
  // ══════════════════════════════════════════════════
  console.log('\n── Section 7: screenshotToFile helper ───────────────────────');

  await test('T25 screenshotToFile saves to disk', async () => {
    const dest = path.join(outDir, 'T25_toFile.png');
    const buf = await snap.screenshotToFile('https://example.com', dest);
    assertBuffer(buf, 'screenshotToFile return value');
    assert(fs.existsSync(dest), 'file not written to disk');
    const stat = fs.statSync(dest);
    assert(stat.size > 100, `file too small: ${stat.size}`);
    console.log(`   Saved ${stat.size} bytes to ${dest}`);
  });

  await test('T26 screenshotToFile with options (WebP)', async () => {
    const dest = path.join(outDir, 'T26_toFile.webp');
    const buf = await snap.screenshotToFile('https://example.com', dest, { format: 'webp', fullPage: true });
    assertBuffer(buf, 'screenshotToFile WebP');
    assert(fs.existsSync(dest), 'webp file not written');
  });

  // ══════════════════════════════════════════════════
  // SECTION 8: screenshotToStorage helper
  // ══════════════════════════════════════════════════
  console.log('\n── Section 8: screenshotToStorage helper ─────────────────────');

  await test('T27 screenshotToStorage returns ScreenshotStorageResult', async () => {
    // NOTE: The live API requires { destination, enabled: true } in the storage object
    // The SDK sends { destination: 'snapapi' } — missing 'enabled: true'.
    // This test documents the mismatch.
    try {
      const result = await snap.screenshotToStorage('https://example.com');
      assert('id' in result, `result missing 'id': ${JSON.stringify(result)}`);
      assert('url' in result, `result missing 'url': ${JSON.stringify(result)}`);
      console.log(`   Storage id: ${result.id}, url: ${result.url.substring(0, 60)}`);
    } catch (e: unknown) {
      if (e instanceof SnapAPIError) {
        throw new Error(`SDK/API storage mismatch: ${(e as SnapAPIError).message} [code: ${(e as SnapAPIError).statusCode}]`);
      }
      throw e;
    }
  });

  // ══════════════════════════════════════════════════
  // SECTION 9: PDF
  // ══════════════════════════════════════════════════
  console.log('\n── Section 9: PDF ────────────────────────────────────────────');

  await test('T28 pdf() from URL', async () => {
    const buf = await snap.pdf({ url: 'https://example.com' });
    assertBuffer(buf, 'PDF from URL');
    fs.writeFileSync(path.join(outDir, 'T28_url.pdf'), buf);
    // PDF magic: %PDF
    const magic = buf.slice(0, 4).toString('ascii');
    assert(magic === '%PDF', `Not a PDF: ${magic}`);
    console.log(`   PDF size: ${buf.length} bytes`);
  });

  await test('T29 pdf() from HTML', async () => {
    const buf = await snap.pdf({ html: '<html><body><h1>Invoice #001</h1><p>Total: $100</p></body></html>' });
    assertBuffer(buf, 'PDF from HTML');
    fs.writeFileSync(path.join(outDir, 'T29_html.pdf'), buf);
    const magic = buf.slice(0, 4).toString('ascii');
    assert(magic === '%PDF', `Not a PDF: ${magic}`);
  });

  await test('T30 pdf() with page options (A4, landscape, margins)', async () => {
    const buf = await snap.pdf({
      url: 'https://example.com',
      pageSize: 'a4',
      landscape: true,
      margins: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
    });
    assertBuffer(buf, 'PDF with options');
    fs.writeFileSync(path.join(outDir, 'T30_options.pdf'), buf);
  });

  await test('T31 pdfToFile() saves to disk', async () => {
    const dest = path.join(outDir, 'T31_toFile.pdf');
    const buf = await snap.pdfToFile('https://example.com', dest);
    assertBuffer(buf, 'pdfToFile return value');
    assert(fs.existsSync(dest), 'PDF file not written');
    console.log(`   Saved ${buf.length} bytes`);
  });

  await test('T32 generatePdf() alias', async () => {
    const buf = await snap.generatePdf({ url: 'https://example.com' });
    assertBuffer(buf, 'generatePdf alias');
    const magic = buf.slice(0, 4).toString('ascii');
    assert(magic === '%PDF', 'generatePdf did not return PDF');
  });

  // ══════════════════════════════════════════════════
  // SECTION 10: Scrape
  // ══════════════════════════════════════════════════
  console.log('\n── Section 10: Scrape ────────────────────────────────────────');

  await test('T33 scrape() text type', async () => {
    const r: ScrapeResult = await snap.scrape({ url: 'https://example.com', type: 'text' });
    assert(r.success === true, `success !== true: ${JSON.stringify(r)}`);
    assert(Array.isArray(r.results), 'results not array');
    assert(r.results.length > 0, 'empty results');
    assert(typeof r.results[0].data === 'string', 'data not string');
    assert(r.results[0].data.length > 0, 'data empty');
    assert(r.results[0].page === 1, 'page !== 1');
    assert(r.results[0].url === 'https://example.com', 'url mismatch');
    console.log(`   Text length: ${r.results[0].data.length} chars`);
  });

  await test('T34 scrape() html type', async () => {
    const r: ScrapeResult = await snap.scrape({ url: 'https://example.com', type: 'html' });
    assert(r.success === true, 'not success');
    assert(r.results[0].data.includes('<html') || r.results[0].data.includes('<!DOCTYPE'), 'not HTML');
    console.log(`   HTML length: ${r.results[0].data.length} chars`);
  });

  await test('T35 scrape() links type', async () => {
    const r: ScrapeResult = await snap.scrape({ url: 'https://example.com', type: 'links' });
    assert(r.success === true, 'not success');
    // Links are returned as JSON string in data
    const links = JSON.parse(r.results[0].data);
    assert(Array.isArray(links), 'links not array');
    console.log(`   Links found: ${links.length}`);
  });

  await test('T36 scrape() with blockResources option', async () => {
    const r: ScrapeResult = await snap.scrape({
      url: 'https://example.com',
      type: 'text',
      blockResources: true,
    });
    assert(r.success === true, 'blockResources scrape failed');
  });

  await test('T37 scrape() with waitMs option', async () => {
    const r: ScrapeResult = await snap.scrape({
      url: 'https://example.com',
      type: 'text',
      waitMs: 500,
    });
    assert(r.success === true, 'waitMs scrape failed');
  });

  await test('T38 scrape() ScrapeResult type shape validation', async () => {
    const r: ScrapeResult = await snap.scrape({ url: 'https://example.com', type: 'text' });
    // Validate that every field in ScrapePageResult is present
    const page = r.results[0];
    assert(typeof page.page === 'number', `page.page not number: ${typeof page.page}`);
    assert(typeof page.url === 'string', `page.url not string`);
    assert(typeof page.data === 'string', `page.data not string`);
  });

  // ══════════════════════════════════════════════════
  // SECTION 11: Extract
  // ══════════════════════════════════════════════════
  console.log('\n── Section 11: Extract ───────────────────────────────────────');

  await test('T39 extract() markdown type', async () => {
    const r: ExtractResult = await snap.extract({ url: 'https://example.com', type: 'markdown' });
    assert(r.success === true, `not success: ${JSON.stringify(r)}`);
    assert(r.type === 'markdown', `type mismatch: ${r.type}`);
    assert(r.url === 'https://example.com', `url mismatch: ${r.url}`);
    assert(typeof r.data === 'string', 'data not string for markdown');
    assert((r.data as string).length > 0, 'empty markdown');
    assert(typeof r.responseTime === 'number', 'responseTime not number');
    console.log(`   Markdown: ${(r.data as string).substring(0, 80)}...`);
    console.log(`   ResponseTime: ${r.responseTime}ms`);
  });

  await test('T40 extract() text type', async () => {
    const r: ExtractResult = await snap.extract({ url: 'https://example.com', type: 'text' });
    assert(r.success === true, 'not success');
    assert(typeof r.data === 'string', 'data not string');
    console.log(`   Text: ${(r.data as string).substring(0, 80)}`);
  });

  await test('T41 extract() html type', async () => {
    const r: ExtractResult = await snap.extract({ url: 'https://example.com', type: 'html' });
    assert(r.success === true, 'not success');
    assert(typeof r.data === 'string', 'html data not string');
    assert((r.data as string).includes('<'), 'html data has no HTML tags');
  });

  await test('T42 extract() links type', async () => {
    const r: ExtractResult = await snap.extract({ url: 'https://example.com', type: 'links' });
    assert(r.success === true, 'not success');
    assert(r.type === 'links', 'type mismatch');
    assert(Array.isArray(r.data), `links data not array: ${typeof r.data}`);
    const links = r.data as Array<{ text: string; href: string }>;
    assert(links.length > 0, 'no links found');
    assert('text' in links[0], 'link missing text field');
    assert('href' in links[0], 'link missing href field');
    console.log(`   Links: ${links.length}, first: ${links[0].href}`);
  });

  await test('T43 extract() metadata type', async () => {
    const r: ExtractResult = await snap.extract({ url: 'https://example.com', type: 'metadata' });
    assert(r.success === true, 'not success');
    assert(typeof r.data === 'object' && r.data !== null, 'metadata not object');
    const meta = r.data as Record<string, unknown>;
    assert('title' in meta, 'metadata missing title');
    assert('url' in meta, 'metadata missing url');
    console.log(`   Title: "${meta.title}", description: "${meta.description}"`);
  });

  await test('T44 extract() article type', async () => {
    const r: ExtractResult = await snap.extract({ url: 'https://news.ycombinator.com', type: 'article' });
    assert(r.success === true, 'not success');
    assert(typeof r.data === 'object' && r.data !== null, 'article data not object');
    const article = r.data as Record<string, unknown>;
    assert('title' in article, 'article missing title');
    console.log(`   Article title: "${article.title}", length: ${article.length}`);
  });

  await test('T45 extract() with cleanOutput option', async () => {
    const r: ExtractResult = await snap.extract({
      url: 'https://example.com',
      type: 'markdown',
      cleanOutput: true,
    });
    assert(r.success === true, 'not success');
    assert(typeof r.data === 'string', 'data not string');
  });

  await test('T46 extract() with selector scoping', async () => {
    const r: ExtractResult = await snap.extract({
      url: 'https://example.com',
      type: 'text',
      selector: 'h1',
    });
    assert(r.success === true, 'not success');
  });

  await test('T47 extract() ExtractResult type shape validation', async () => {
    const r: ExtractResult = await snap.extract({ url: 'https://example.com', type: 'markdown' });
    // Verify all documented fields exist
    assert('success' in r, 'missing success');
    assert('type' in r, 'missing type');
    assert('url' in r, 'missing url');
    assert('data' in r, 'missing data');
    assert('responseTime' in r, 'missing responseTime');
    // success is typed as `true` in SDK, confirm actual value
    if (r.success !== true) {
      throw new Error(`TYPE MISMATCH: ExtractResult.success typed as 'true' but got ${r.success}`);
    }
  });

  // ══════════════════════════════════════════════════
  // SECTION 12: Video
  // ══════════════════════════════════════════════════
  console.log('\n── Section 12: Video ─────────────────────────────────────────');

  await test('T48 video() WebM format (binary)', async () => {
    const result = await snap.video({ url: 'https://example.com', format: 'webm', duration: 3 });
    assert(Buffer.isBuffer(result), 'video not a buffer');
    const buf = result as Buffer;
    assert(buf.length > 5000, `WebM suspiciously small: ${buf.length}`);
    fs.writeFileSync(path.join(outDir, 'T48_basic.webm'), buf);
    // WebM signature: 0x1A 0x45 0xDF 0xA3
    assert(buf[0] === 0x1A && buf[1] === 0x45, 'Not a valid WebM file');
    console.log(`   WebM size: ${buf.length} bytes`);
  });

  await test('T49 video() duration option', async () => {
    const result = await snap.video({ url: 'https://example.com', format: 'webm', duration: 2 });
    assert(Buffer.isBuffer(result), 'video not a buffer');
    assert((result as Buffer).length > 1000, 'too small');
  });

  await test('T50 video() with scrolling options', async () => {
    const result = await snap.video({
      url: 'https://example.com',
      format: 'webm',
      duration: 5,
      scrolling: true,
      scrollSpeed: 100,
      scrollEasing: 'ease_in_out',
      scrollBack: true,
    });
    assert(Buffer.isBuffer(result), 'scroll video not a buffer');
    fs.writeFileSync(path.join(outDir, 'T50_scroll.webm'), result as Buffer);
  });

  await test('T51 video() custom viewport', async () => {
    const result = await snap.video({
      url: 'https://example.com',
      format: 'webm',
      duration: 2,
      width: 800,
      height: 600,
    });
    assert(Buffer.isBuffer(result), 'custom viewport video not a buffer');
  });

  // ══════════════════════════════════════════════════
  // SECTION 13: OG Image
  // ══════════════════════════════════════════════════
  console.log('\n── Section 13: OG Image ──────────────────────────────────────');

  await test('T52 ogImage() - check route exists', async () => {
    // API returns 404 for /v1/og-image — documenting this bug
    try {
      const buf = await snap.ogImage({ url: 'https://example.com' });
      assertBuffer(buf, 'OG image');
      fs.writeFileSync(path.join(outDir, 'T52_og.png'), buf);
    } catch (e: unknown) {
      if (e instanceof SnapAPIError && e.statusCode === 404) {
        throw new Error(`Route /v1/og-image returns 404 — endpoint not implemented on server`);
      }
      throw e;
    }
  });

  await test('T53 generateOgImage() alias', async () => {
    try {
      const buf = await snap.generateOgImage({ url: 'https://example.com', width: 1200, height: 630 });
      assertBuffer(buf, 'generateOgImage alias');
    } catch (e: unknown) {
      if (e instanceof SnapAPIError && e.statusCode === 404) {
        throw new Error(`Route /v1/og-image returns 404 — endpoint not implemented on server`);
      }
      throw e;
    }
  });

  // ══════════════════════════════════════════════════
  // SECTION 14: Analyze (disabled)
  // ══════════════════════════════════════════════════
  console.log('\n── Section 14: Analyze (expect SERVICE_DISABLED) ────────────');

  await test('T54 analyze() returns service disabled gracefully', async () => {
    // The endpoint exists but returns { success: false, error: { code: 'SERVICE_DISABLED' } }
    // The SDK should surface this as a SnapAPIError (currently it calls res.json() on non-ok response)
    try {
      const r = await snap.analyze({
        url: 'https://example.com',
        prompt: 'Summarize this page',
      });
      // If it returns data, check the shape
      console.log(`   Analyze result: ${JSON.stringify(r).substring(0, 100)}`);
    } catch (e: unknown) {
      if (e instanceof SnapAPIError) {
        // Expected when server returns non-2xx
        console.log(`   Got SnapAPIError (expected): ${(e as SnapAPIError).message} [${(e as SnapAPIError).statusCode}]`);
        return;
      }
      throw e;
    }
  });

  // ══════════════════════════════════════════════════
  // SECTION 15: API Keys namespace
  // ══════════════════════════════════════════════════
  console.log('\n── Section 15: API Keys namespace ───────────────────────────');

  await test('T55 keys.list() returns ApiKey[]', async () => {
    const r = await snap.keys.list();
    assert(Array.isArray(r), 'keys.list() not array');

    // NOTE: The server returns { keys: [...] } but SDK calls res.json() directly.
    // Check for the shape discrepancy.
    const list = r as unknown;
    if (typeof list === 'object' && list !== null && 'keys' in (list as object)) {
      throw new Error(
        'TYPE MISMATCH: SDK expects ApiKey[] but API returns { keys: ApiKey[] }. ' +
        'SDK must unwrap the "keys" property.'
      );
    }
    // If it IS an array, validate shape
    if (Array.isArray(r) && r.length > 0) {
      const key = r[0] as ApiKey;
      assert('id' in key, 'key missing id');
      assert('name' in key, 'key missing name');
      assert('key' in key, 'key missing key');
      // Server sends lastUsedAt, not lastUsed
      const raw = key as unknown as Record<string, unknown>;
      if ('lastUsedAt' in raw && !('lastUsed' in raw)) {
        throw new Error(
          'TYPE MISMATCH: API returns "lastUsedAt" but SDK type declares "lastUsed". ' +
          'Update ApiKey type to use lastUsedAt.'
        );
      }
      console.log(`   Keys found: ${r.length}`);
    }
  });

  // ══════════════════════════════════════════════════
  // SECTION 16: Webhooks namespace
  // ══════════════════════════════════════════════════
  console.log('\n── Section 16: Webhooks namespace ───────────────────────────');

  await test('T56 webhooks.list() returns Webhook[]', async () => {
    const r = await snap.webhooks.list();
    // Server returns { webhooks: [] }
    const raw = r as unknown;
    if (typeof raw === 'object' && raw !== null && 'webhooks' in (raw as object)) {
      throw new Error(
        'TYPE MISMATCH: SDK expects Webhook[] but API returns { webhooks: Webhook[] }. ' +
        'SDK must unwrap the "webhooks" property.'
      );
    }
    assert(Array.isArray(r), `webhooks.list() not array: ${JSON.stringify(r).substring(0, 100)}`);
    console.log(`   Webhooks found: ${r.length}`);
  });

  // ══════════════════════════════════════════════════
  // SECTION 17: Storage namespace
  // ══════════════════════════════════════════════════
  console.log('\n── Section 17: Storage namespace (expects 404/401) ──────────');

  await test('T57 storage.listFiles() - check route/auth', async () => {
    // /v1/storage/files requires JWT session auth, not API key auth
    // This documents a critical design gap
    try {
      const r = await snap.storage.listFiles();
      console.log(`   Files: ${r.files?.length ?? 'unknown'}`);
    } catch (e: unknown) {
      if (e instanceof SnapAPIError && (e.statusCode === 404 || e.statusCode === 401)) {
        throw new Error(
          `Storage endpoint /v1/storage/files returns ${(e as SnapAPIError).statusCode}: ` +
          `Route requires JWT session auth, not API key auth. ` +
          `SDK storage namespace cannot work with API key authentication.`
        );
      }
      throw e;
    }
  });

  await test('T58 storage.getUsage() - check route', async () => {
    try {
      const r = await snap.storage.getUsage();
      console.log(`   Storage used: ${r.used}/${r.limit}`);
    } catch (e: unknown) {
      if (e instanceof SnapAPIError && (e.statusCode === 404 || e.statusCode === 401)) {
        throw new Error(
          `Storage endpoint /v1/storage/usage returns ${(e as SnapAPIError).statusCode}: ` +
          `Route requires JWT session auth, not API key auth.`
        );
      }
      throw e;
    }
  });

  // ══════════════════════════════════════════════════
  // SECTION 18: Scheduled namespace
  // ══════════════════════════════════════════════════
  console.log('\n── Section 18: Scheduled namespace ──────────────────────────');

  await test('T59 scheduled.list() - plan check', async () => {
    try {
      const r = await snap.scheduled.list();
      assert(Array.isArray(r), 'not array');
      console.log(`   Scheduled jobs: ${r.length}`);
    } catch (e: unknown) {
      if (e instanceof SnapAPIError && e.statusCode === 403) {
        throw new Error(`Plan restriction: ${(e as SnapAPIError).message} [expected on Starter plan]`);
      }
      throw e;
    }
  });

  // ══════════════════════════════════════════════════
  // SECTION 19: Error Handling
  // ══════════════════════════════════════════════════
  console.log('\n── Section 19: Error Handling ────────────────────────────────');

  await test('T60 invalid API key → AuthenticationError', async () => {
    try {
      await invalidSnap.screenshot({ url: 'https://example.com' });
      throw new Error('Should have thrown AuthenticationError');
    } catch (e: unknown) {
      if (e instanceof AuthenticationError) {
        assert(e.statusCode === 401, `Expected 401, got ${e.statusCode}`);
        assert(e.code === 'UNAUTHORIZED', `Expected UNAUTHORIZED, got ${e.code}`);
        console.log(`   AuthenticationError: "${e.message}" [${e.statusCode}]`);
        return;
      }
      throw e;
    }
  });

  await test('T61 screenshot missing url/html/markdown → Error', async () => {
    try {
      await snap.screenshot({});
      throw new Error('Should have thrown');
    } catch (e: unknown) {
      assert(e instanceof Error, 'not an Error');
      assert(
        (e as Error).message.includes('url') ||
        (e as Error).message.includes('html') ||
        (e as Error).message.includes('markdown'),
        `unexpected message: ${(e as Error).message}`,
      );
    }
  });

  await test('T62 screenshot invalid URL → 400 error', async () => {
    try {
      await snap.screenshot({ url: 'not-a-url' });
      throw new Error('Should have thrown');
    } catch (e: unknown) {
      assert(e instanceof SnapAPIError, `Expected SnapAPIError, got ${(e as any)?.constructor?.name}`);
      assert((e as SnapAPIError).statusCode === 400, `Expected 400, got ${(e as SnapAPIError).statusCode}`);
      console.log(`   400 error: "${(e as SnapAPIError).message}"`);
    }
  });

  await test('T63 scrape missing url → Error', async () => {
    try {
      await snap.scrape({ url: '' });
      throw new Error('Should have thrown');
    } catch (e: unknown) {
      assert(e instanceof Error, 'not an Error');
    }
  });

  await test('T64 extract missing url → Error', async () => {
    try {
      await snap.extract({ url: '' });
      throw new Error('Should have thrown');
    } catch (e: unknown) {
      assert(e instanceof Error, 'not an Error');
    }
  });

  await test('T65 video missing url → Error', async () => {
    try {
      await snap.video({ url: '' });
      throw new Error('Should have thrown');
    } catch (e: unknown) {
      assert(e instanceof Error, 'not an Error');
    }
  });

  await test('T66 analyze missing url → Error', async () => {
    try {
      await snap.analyze({ url: '', prompt: 'test' });
      throw new Error('Should have thrown');
    } catch (e: unknown) {
      assert(e instanceof Error, 'not an Error');
    }
  });

  await test('T67 error class instanceof checks', async () => {
    const authErr = new AuthenticationError('test');
    assert(authErr instanceof AuthenticationError, 'instanceof AuthenticationError failed');
    assert(authErr instanceof SnapAPIError, 'instanceof SnapAPIError failed');
    assert(authErr instanceof Error, 'instanceof Error failed');
    assert(authErr.statusCode === 401, 'statusCode wrong');
    assert(authErr.code === 'UNAUTHORIZED', 'code wrong');

    const rateLimitErr = new RateLimitError('too many', 30);
    assert(rateLimitErr instanceof RateLimitError, 'instanceof RateLimitError failed');
    assert(rateLimitErr instanceof SnapAPIError, 'RL instanceof SnapAPIError failed');
    assert(rateLimitErr.retryAfter === 30, 'retryAfter wrong');
  });

  // ══════════════════════════════════════════════════
  // SECTION 20: Interceptors / hooks
  // ══════════════════════════════════════════════════
  console.log('\n── Section 20: Interceptors & hooks ─────────────────────────');

  await test('T68 onRequest hook called with url and init', async () => {
    let hookUrl = '';
    let hookCalled = false;
    const hookClient = new SnapAPI({
      apiKey: API_KEY,
      maxRetries: 0,
      onRequest: (url, _init) => {
        hookUrl = url;
        hookCalled = true;
      },
    });
    await hookClient.ping();
    assert(hookCalled, 'onRequest not called');
    assert(hookUrl.includes('/v1/ping'), `Unexpected hook URL: ${hookUrl}`);
    console.log(`   onRequest called with: ${hookUrl}`);
  });

  await test('T69 onResponse hook called with statusCode and response', async () => {
    let capturedStatus = 0;
    const hookClient = new SnapAPI({
      apiKey: API_KEY,
      maxRetries: 0,
      onResponse: (status, _response) => {
        capturedStatus = status;
      },
    });
    await hookClient.ping();
    assert(capturedStatus === 200, `Expected 200, got ${capturedStatus}`);
    console.log(`   onResponse called with status: ${capturedStatus}`);
  });

  // ══════════════════════════════════════════════════
  // SECTION 21: usage() deprecation alias
  // ══════════════════════════════════════════════════
  await test('T70 usage() deprecated alias still works', async () => {
    const r = await snap.usage();
    assert(typeof r.used === 'number', 'usage() broken');
  });

  // ══════════════════════════════════════════════════
  // FINAL SUMMARY
  // ══════════════════════════════════════════════════
  printSummary(usageBeforeTests);
}

function printSummary(usageBefore: number): void {
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const skipped = results.filter(r => r.status === 'SKIP').length;
  const total = results.length;

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  FINAL RESULTS');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  PASS:  ${passed}/${total}`);
  console.log(`  FAIL:  ${failed}/${total}`);
  console.log(`  SKIP:  ${skipped}/${total}`);
  console.log(`  Quota used by tests: ~${passed} API calls (started at ${usageBefore})`);

  if (failed > 0) {
    console.log('\n  FAILURES:');
    results
      .filter(r => r.status === 'FAIL')
      .forEach(r => console.log(`  ❌ [${r.name}]: ${r.notes}`));
  }

  // Timing: slowest tests
  const sorted = [...results].filter(r => r.status !== 'SKIP').sort((a, b) => b.durationMs - a.durationMs);
  console.log('\n  SLOWEST TESTS:');
  sorted.slice(0, 5).forEach(r => console.log(`  ${r.durationMs}ms  ${r.name}`));

  console.log('\n  Output files saved to:', path.join(__dirname, 'output'));
  console.log('═══════════════════════════════════════════════════════════\n');
}

main().catch(e => {
  console.error('\nFATAL ERROR:', e);
  process.exit(1);
});
