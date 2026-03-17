// examples/screenshot.js — snapapi-js v3
// Run: SNAPAPI_KEY=sk_live_... node examples/screenshot.js

import { SnapAPI } from 'snapapi-js';
import fs from 'node:fs';

const snap = new SnapAPI({ apiKey: process.env.SNAPAPI_KEY ?? '' });

// 1. Basic PNG screenshot
console.log('Taking basic screenshot...');
const buf = await snap.screenshot({ url: 'https://example.com' });
fs.writeFileSync('basic.png', buf);
console.log('Saved basic.png');

// 2. Full-page dark-mode WebP with ad blocking
const buf2 = await snap.screenshot({
  url: 'https://example.com',
  format: 'webp',
  fullPage: true,
  darkMode: true,
  blockAds: true,
  blockCookieBanners: true,
  quality: 80,
});
fs.writeFileSync('dark-full.webp', buf2);
console.log('Saved dark-full.webp');

// 3. Mobile device preset
const buf3 = await snap.screenshot({
  url: 'https://example.com',
  device: 'iphone-15-pro',
  format: 'png',
});
fs.writeFileSync('mobile.png', buf3);
console.log('Saved mobile.png');

// 4. Render HTML to image
const buf4 = await snap.screenshot({
  html: '<body style="background:#1a1a2e;color:#e0e0e0;font:16px sans-serif;padding:40px"><h1>Hello from SnapAPI!</h1></body>',
  width: 800,
  height: 300,
});
fs.writeFileSync('html.png', buf4);
console.log('Saved html.png');

// 5. PDF — use the dedicated pdf() method in v3
const pdf = await snap.pdf({
  url: 'https://example.com',
  pageSize: 'a4',
  margins: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
});
fs.writeFileSync('page.pdf', pdf);
console.log('Saved page.pdf');

// 6. Store to SnapAPI cloud using the convenience method
const stored = await snap.screenshotToStorage('https://example.com');
console.log('Stored file URL:', stored.url, 'ID:', stored.id);

// 6b. Or use the low-level screenshot() and check the response type
const rawStored = await snap.screenshot({
  url: 'https://example.com',
  storage: { destination: 'snapapi' },
});
if (!Buffer.isBuffer(rawStored) && 'id' in rawStored) {
  console.log('Raw stored URL:', rawStored.url);
}

// 7. Async via webhook — check for jobId in the response
const queued = await snap.screenshot({
  url: 'https://example.com',
  webhookUrl: 'https://webhook.site/your-uuid',
});
if (!Buffer.isBuffer(queued) && 'jobId' in queued) {
  console.log('Queued job ID:', queued.jobId);
}
