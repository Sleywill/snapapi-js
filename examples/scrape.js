// examples/scrape.js — snapapi-js v3
// Run: SNAPAPI_KEY=sk_live_... node examples/scrape.js

import { SnapAPI } from 'snapapi-js';

const snap = new SnapAPI({ apiKey: process.env.SNAPAPI_KEY ?? '' });

// 1. Scrape page text
const text = await snap.scrape({
  url: 'https://news.ycombinator.com',
  type: 'text',
  waitMs: 1000,
  blockResources: true,
});
console.log('Text (first 500 chars):', text.results[0]?.data.slice(0, 500));

// 2. Scrape links
const links = await snap.scrape({
  url: 'https://news.ycombinator.com',
  type: 'links',
});
console.log('Links found:', links.results[0]?.data);

// 3. Multi-page scrape with premium proxy
const multi = await snap.scrape({
  url: 'https://news.ycombinator.com',
  type: 'html',
  pages: 3,
  premiumProxy: true,
});
for (const page of multi.results) {
  console.log(`Page ${page.page} (${page.url}): ${page.data.length} chars`);
}
