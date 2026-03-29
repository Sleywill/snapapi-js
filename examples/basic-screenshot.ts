/**
 * Basic screenshot example.
 *
 * Usage:
 *   SNAPAPI_KEY=sk_live_... npx tsx examples/basic-screenshot.ts
 */

import { SnapAPI } from 'snapapi-js';
import fs from 'node:fs';

const snap = new SnapAPI({
  apiKey: process.env.SNAPAPI_KEY!,
});

// Take a simple PNG screenshot
const buf = await snap.screenshot({ url: 'https://example.com' });
fs.writeFileSync('screenshot.png', buf);
console.log('Saved screenshot.png');

// Full-page dark-mode WebP with ad blocking
const fullPage = await snap.screenshot({
  url: 'https://github.com',
  format: 'webp',
  fullPage: true,
  darkMode: true,
  blockAds: true,
  blockCookieBanners: true,
  quality: 80,
});
fs.writeFileSync('full-page.webp', fullPage);
console.log('Saved full-page.webp');

// Save directly to file (convenience method)
await snap.screenshotToFile('https://nodejs.org', './nodejs.png');
console.log('Saved nodejs.png');
