/**
 * Comprehensive SnapAPI SDK Test Suite
 * Tests EVERY endpoint and feature against the LIVE API
 */

import SnapAPI from '../src/index';
import * as fs from 'fs';
import * as path from 'path';

const API_KEY = process.env.SNAPAPI_KEY || '';
if (!API_KEY) { console.error('Set SNAPAPI_KEY env var'); process.exit(1); }
const client = new SnapAPI({ apiKey: API_KEY });

const outDir = path.join(__dirname, 'output');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

let passed = 0, failed = 0;
const failures: string[] = [];

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (e: any) {
    console.log(`❌ ${name}: ${e.message}`);
    failed++;
    failures.push(`${name}: ${e.message}`);
  }
}

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(msg);
}

async function main() {
  console.log('=== SnapAPI SDK Comprehensive Tests ===\n');

  // ==================== 1. PING ====================
  await test('ping', async () => {
    const r = await client.ping();
    assert(r.status === 'ok' || r.success === true, `Unexpected: ${JSON.stringify(r)}`);
  });

  // ==================== 2. DEVICES ====================
  await test('getDevices', async () => {
    const r = await client.getDevices();
    assert(r.success === true, 'not success');
    assert(r.total > 0, 'no devices');
    console.log(`   Found ${r.total} devices`);
  });

  // ==================== 3. CAPABILITIES ====================
  await test('getCapabilities', async () => {
    const r = await client.getCapabilities();
    assert(r.success === true, 'not success');
    console.log(`   Version: ${r.version}`);
  });

  // ==================== 4. USAGE ====================
  await test('getUsage', async () => {
    const r = await client.getUsage();
    assert(typeof r.used === 'number', `unexpected: ${JSON.stringify(r)}`);
    console.log(`   Used: ${r.used}/${r.limit}`);
  });

  // ==================== 5. SCREENSHOT - Basic URL (binary) ====================
  await test('screenshot - URL binary PNG', async () => {
    const buf = await client.screenshot({ url: 'https://example.com' });
    assert(Buffer.isBuffer(buf), 'not a buffer');
    assert((buf as Buffer).length > 1000, 'too small');
    fs.writeFileSync(path.join(outDir, 'basic.png'), buf as Buffer);
  });

  // ==================== 6. SCREENSHOT - JPEG format ====================
  await test('screenshot - JPEG format', async () => {
    const buf = await client.screenshot({ url: 'https://example.com', format: 'jpeg', quality: 80 });
    assert(Buffer.isBuffer(buf), 'not a buffer');
    fs.writeFileSync(path.join(outDir, 'basic.jpeg'), buf as Buffer);
  });

  // ==================== 7. SCREENSHOT - WebP format ====================
  await test('screenshot - WebP format', async () => {
    const buf = await client.screenshot({ url: 'https://example.com', format: 'webp', quality: 80 });
    assert(Buffer.isBuffer(buf), 'not a buffer');
    fs.writeFileSync(path.join(outDir, 'basic.webp'), buf as Buffer);
  });

  // ==================== 8. SCREENSHOT - AVIF format ====================
  await test('screenshot - AVIF format', async () => {
    const buf = await client.screenshot({ url: 'https://example.com', format: 'avif' });
    assert(Buffer.isBuffer(buf), 'not a buffer');
    fs.writeFileSync(path.join(outDir, 'basic.avif'), buf as Buffer);
  });

  // ==================== 9. SCREENSHOT - PDF format ====================
  await test('screenshot - PDF format via screenshot endpoint', async () => {
    const buf = await client.screenshot({ url: 'https://example.com', format: 'pdf' });
    assert(Buffer.isBuffer(buf), 'not a buffer');
    fs.writeFileSync(path.join(outDir, 'screenshot.pdf'), buf as Buffer);
  });

  // ==================== 10. SCREENSHOT - JSON response with metadata ====================
  await test('screenshot - JSON with metadata', async () => {
    const r = await client.screenshot({
      url: 'https://example.com',
      responseType: 'json',
      includeMetadata: true,
    });
    assert(typeof r === 'object' && !Buffer.isBuffer(r), 'expected object');
    const result = r as any;
    assert(result.success === true, 'not success');
    assert(result.data, 'no data');
    console.log(`   Title: ${result.metadata?.title}, Size: ${result.fileSize}b`);
  });

  // ==================== 11. SCREENSHOT - base64 response ====================
  await test('screenshot - base64 response', async () => {
    const r = await client.screenshot({
      url: 'https://example.com',
      responseType: 'base64',
    });
    assert(!Buffer.isBuffer(r), 'should not be buffer');
    const result = r as any;
    assert(result.success === true || typeof result.data === 'string', 'no base64 data');
  });

  // ==================== 12. SCREENSHOT - HTML input ====================
  await test('screenshot - HTML input', async () => {
    const buf = await client.screenshotFromHtml('<h1 style="color:red">Hello SnapAPI!</h1>');
    assert(Buffer.isBuffer(buf), 'not a buffer');
    fs.writeFileSync(path.join(outDir, 'html.png'), buf as Buffer);
  });

  // ==================== 13. SCREENSHOT - Markdown input ====================
  await test('screenshot - Markdown input', async () => {
    const buf = await client.screenshotFromMarkdown('# Hello\n\n**Bold** text and *italic*.\n\n- Item 1\n- Item 2');
    assert(Buffer.isBuffer(buf), 'not a buffer');
    fs.writeFileSync(path.join(outDir, 'markdown.png'), buf as Buffer);
  });

  // ==================== 14. SCREENSHOT - Device preset ====================
  await test('screenshot - device preset (iphone-15-pro)', async () => {
    const buf = await client.screenshotDevice('https://example.com', 'iphone-15-pro');
    assert(Buffer.isBuffer(buf), 'not a buffer');
    fs.writeFileSync(path.join(outDir, 'iphone15pro.png'), buf as Buffer);
  });

  // ==================== 15. SCREENSHOT - Full page ====================
  await test('screenshot - fullPage', async () => {
    const buf = await client.screenshot({ url: 'https://example.com', fullPage: true });
    assert(Buffer.isBuffer(buf), 'not a buffer');
    fs.writeFileSync(path.join(outDir, 'fullpage.png'), buf as Buffer);
  });

  // ==================== 16. SCREENSHOT - Custom viewport ====================
  await test('screenshot - custom viewport 1440x900', async () => {
    const buf = await client.screenshot({ url: 'https://example.com', width: 1440, height: 900 });
    assert(Buffer.isBuffer(buf), 'not a buffer');
  });

  // ==================== 17. SCREENSHOT - Dark mode ====================
  await test('screenshot - darkMode', async () => {
    const buf = await client.screenshot({ url: 'https://example.com', darkMode: true });
    assert(Buffer.isBuffer(buf), 'not a buffer');
    fs.writeFileSync(path.join(outDir, 'darkmode.png'), buf as Buffer);
  });

  // ==================== 18. SCREENSHOT - Custom CSS ====================
  await test('screenshot - custom CSS', async () => {
    const buf = await client.screenshot({
      url: 'https://example.com',
      css: 'body { background: yellow !important; }',
    });
    assert(Buffer.isBuffer(buf), 'not a buffer');
  });

  // ==================== 19. SCREENSHOT - Custom JavaScript ====================
  await test('screenshot - custom JavaScript', async () => {
    const buf = await client.screenshot({
      url: 'https://example.com',
      javascript: 'document.title = "Modified";',
    });
    assert(Buffer.isBuffer(buf), 'not a buffer');
  });

  // ==================== 20. SCREENSHOT - Block ads/cookies/trackers ====================
  await test('screenshot - blockAds + blockCookieBanners + blockTrackers', async () => {
    const buf = await client.screenshot({
      url: 'https://example.com',
      blockAds: true,
      blockCookieBanners: true,
      blockTrackers: true,
    });
    assert(Buffer.isBuffer(buf), 'not a buffer');
  });

  // ==================== 21. SCREENSHOT - Delay ====================
  await test('screenshot - delay', async () => {
    const buf = await client.screenshot({ url: 'https://example.com', delay: 1000 });
    assert(Buffer.isBuffer(buf), 'not a buffer');
  });

  // ==================== 22. SCREENSHOT - Selector ====================
  await test('screenshot - selector capture', async () => {
    const buf = await client.screenshot({
      url: 'https://example.com',
      selector: 'h1',
    });
    assert(Buffer.isBuffer(buf), 'not a buffer');
    fs.writeFileSync(path.join(outDir, 'selector.png'), buf as Buffer);
  });

  // ==================== 23. SCREENSHOT - Thumbnail ====================
  await test('screenshot - thumbnail', async () => {
    const r = await client.screenshot({
      url: 'https://example.com',
      responseType: 'json',
      thumbnail: { enabled: true, width: 200, height: 150, fit: 'cover' },
    });
    const result = r as any;
    assert(result.success === true, 'not success');
    assert(result.thumbnail, 'no thumbnail data');
  });

  // ==================== 24. SCREENSHOT - waitForSelector ====================
  await test('screenshot - waitForSelector', async () => {
    const buf = await client.screenshot({
      url: 'https://example.com',
      waitForSelector: 'h1',
    });
    assert(Buffer.isBuffer(buf), 'not a buffer');
  });

  // ==================== 25. SCREENSHOT - hideSelectors ====================
  await test('screenshot - hideSelectors', async () => {
    const buf = await client.screenshot({
      url: 'https://example.com',
      hideSelectors: ['h1'],
    });
    assert(Buffer.isBuffer(buf), 'not a buffer');
  });

  // ==================== 26. SCREENSHOT - extractMetadata ====================
  await test('screenshot - extractMetadata options', async () => {
    const r = await client.screenshot({
      url: 'https://example.com',
      responseType: 'json',
      includeMetadata: true,
      extractMetadata: { fonts: true, colors: true, links: true, httpStatusCode: true },
    });
    const result = r as any;
    assert(result.success === true, 'not success');
  });

  // ==================== 27. PDF endpoint ====================
  await test('pdf - URL', async () => {
    const buf = await client.pdf({ url: 'https://example.com' });
    assert(Buffer.isBuffer(buf), 'not a buffer');
    assert(buf.length > 1000, 'too small');
    fs.writeFileSync(path.join(outDir, 'dedicated.pdf'), buf);
  });

  // ==================== 28. PDF - with options ====================
  await test('pdf - with options (A4, margins, landscape)', async () => {
    const buf = await client.pdf({
      url: 'https://example.com',
      pdfOptions: {
        pageSize: 'a4',
        landscape: true,
        marginTop: '20mm',
        marginBottom: '20mm',
        marginLeft: '15mm',
        marginRight: '15mm',
        printBackground: true,
      },
    });
    assert(Buffer.isBuffer(buf), 'not a buffer');
    fs.writeFileSync(path.join(outDir, 'pdf-options.pdf'), buf);
  });

  // ==================== 29. PDF - from HTML ====================
  await test('pdf - from HTML', async () => {
    const buf = await client.pdf({ html: '<h1>Invoice</h1><p>Total: $100</p>' });
    assert(Buffer.isBuffer(buf), 'not a buffer');
    fs.writeFileSync(path.join(outDir, 'pdf-html.pdf'), buf);
  });

  // ==================== 30. BATCH ====================
  await test('batch - multiple URLs', async () => {
    const r = await client.batch({
      urls: ['https://example.com', 'https://httpbin.org/html'],
      format: 'png',
    });
    assert(r.success === true, `not success: ${JSON.stringify(r)}`);
    assert(!!r.jobId, 'no jobId');
    console.log(`   Batch jobId: ${r.jobId}, status: ${r.status}`);
    
    // Wait and check status
    await new Promise(res => setTimeout(res, 5000));
    const status = await client.getBatchStatus(r.jobId);
    console.log(`   Batch status: ${status.status}, completed: ${status.completed}/${status.total}`);
  });

  // ==================== 31. VIDEO ====================
  await test('video - basic capture', async () => {
    const buf = await client.video({
      url: 'https://example.com',
      format: 'mp4',
      duration: 2000,
      width: 800,
      height: 600,
    });
    assert(Buffer.isBuffer(buf), 'not a buffer');
    assert((buf as Buffer).length > 1000, 'too small');
    fs.writeFileSync(path.join(outDir, 'video.mp4'), buf as Buffer);
  });

  // ==================== 32. VIDEO - scroll ====================
  await test('video - scroll animation', async () => {
    const buf = await client.video({
      url: 'https://en.wikipedia.org/wiki/Main_Page',
      format: 'mp4',
      scroll: true,
      scrollDuration: 1000,
      scrollEasing: 'ease_in_out',
      scrollBack: true,
      width: 800,
      height: 600,
    });
    assert(Buffer.isBuffer(buf), 'not a buffer');
    fs.writeFileSync(path.join(outDir, 'scroll.mp4'), buf as Buffer);
  });

  // ==================== 33. VIDEO - JSON response ====================
  await test('video - JSON response', async () => {
    const r = await client.video({
      url: 'https://example.com',
      format: 'mp4',
      duration: 2000,
      responseType: 'json',
      width: 800,
      height: 600,
    });
    assert(!Buffer.isBuffer(r), 'should be object');
    const result = r as any;
    assert(result.success === true, `not success: ${JSON.stringify(result)}`);
  });

  // ==================== 34. EXTRACT - markdown ====================
  await test('extract - markdown', async () => {
    const r = await client.extractMarkdown('https://example.com');
    assert(r.success === true, 'not success');
    assert(r.content.length > 0, 'empty content');
    console.log(`   Markdown length: ${r.contentLength}`);
  });

  // ==================== 35. EXTRACT - text ====================
  await test('extract - text', async () => {
    const r = await client.extractText('https://example.com');
    assert(r.success === true, 'not success');
  });

  // ==================== 36. EXTRACT - html ====================
  await test('extract - html', async () => {
    const r = await client.extract({ url: 'https://example.com', type: 'html' });
    assert(r.success === true, 'not success');
  });

  // ==================== 37. EXTRACT - article ====================
  await test('extract - article', async () => {
    const r = await client.extractArticle('https://example.com');
    assert(r.success === true, 'not success');
  });

  // ==================== 38. EXTRACT - links ====================
  await test('extract - links', async () => {
    const r = await client.extractLinks('https://example.com');
    assert(r.success === true, 'not success');
  });

  // ==================== 39. EXTRACT - images ====================
  await test('extract - images', async () => {
    const r = await client.extractImages('https://example.com');
    assert(r.success === true, 'not success');
  });

  // ==================== 40. EXTRACT - metadata ====================
  await test('extract - metadata', async () => {
    const r = await client.extractMetadata('https://example.com');
    assert(r.success === true, 'not success');
  });

  // ==================== 41. EXTRACT - structured ====================
  await test('extract - structured', async () => {
    const r = await client.extractStructured('https://example.com');
    assert(r.success === true, 'not success');
  });

  // ==================== 42. EXTRACT - with options ====================
  await test('extract - with full options', async () => {
    const r = await client.extract({
      url: 'https://example.com',
      type: 'markdown',
      blockAds: true,
      blockCookieBanners: true,
      cleanOutput: true,
    });
    assert(r.success === true, 'not success');
  });

  // ==================== 43. ASYNC SCREENSHOT ====================
  await test('screenshotAsync + getAsyncScreenshot', async () => {
    const job = await client.screenshotAsync({ url: 'https://example.com' });
    assert(!!job.jobId, `no jobId: ${JSON.stringify(job)}`);
    console.log(`   Async jobId: ${job.jobId}`);
    
    // Poll for result
    await new Promise(res => setTimeout(res, 5000));
    const result = await client.getAsyncScreenshot(job.jobId);
    console.log(`   Async status: ${(result as any).status}`);
  });

  // ==================== 44. SCREENSHOT - reducedMotion ====================
  await test('screenshot - reducedMotion', async () => {
    const buf = await client.screenshot({ url: 'https://example.com', reducedMotion: true });
    assert(Buffer.isBuffer(buf), 'not a buffer');
  });

  // ==================== 45. SCREENSHOT - clip region ====================
  await test('screenshot - clip region', async () => {
    const buf = await client.screenshot({
      url: 'https://example.com',
      clipX: 0, clipY: 0, clipWidth: 400, clipHeight: 300,
    });
    assert(Buffer.isBuffer(buf), 'not a buffer');
  });

  // ==================== 46. SCREENSHOT - blockChatWidgets ====================
  await test('screenshot - blockChatWidgets', async () => {
    const buf = await client.screenshot({ url: 'https://example.com', blockChatWidgets: true });
    assert(Buffer.isBuffer(buf), 'not a buffer');
  });

  // ==================== 47. SCREENSHOT - timezone/locale ====================
  await test('screenshot - timezone and locale', async () => {
    const buf = await client.screenshot({
      url: 'https://example.com',
      timezone: 'Asia/Tokyo',
      locale: 'ja-JP',
    });
    assert(Buffer.isBuffer(buf), 'not a buffer');
  });

  // ==================== 48. SCREENSHOT - cache ====================
  await test('screenshot - cache enabled', async () => {
    const r = await client.screenshot({
      url: 'https://example.com',
      responseType: 'json',
      cache: true,
      cacheTtl: 300,
    });
    const result = r as any;
    assert(result.success === true, 'not success');
  });

  // ==================== SUMMARY ====================
  console.log(`\n${'='.repeat(50)}`);
  console.log(`RESULTS: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
  if (failures.length > 0) {
    console.log(`\nFAILURES:`);
    failures.forEach(f => console.log(`  - ${f}`));
  }
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
