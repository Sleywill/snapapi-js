/**
 * Web scraping and content extraction example.
 *
 * Usage:
 *   SNAPAPI_KEY=sk_live_... npx tsx examples/scrape-and-extract.ts
 */

import { SnapAPI } from 'snapapi-js';

const snap = new SnapAPI({
  apiKey: process.env.SNAPAPI_KEY!,
});

// Scrape links from Hacker News (3 pages)
const scrapeResult = await snap.scrape({
  url: 'https://news.ycombinator.com',
  type: 'links',
  pages: 3,
  blockResources: true,
});

for (const page of scrapeResult.results) {
  console.log(`Page ${page.page}: ${page.data.substring(0, 100)}...`);
}

// Extract clean markdown from a blog post
const extractResult = await snap.extract({
  url: 'https://example.com',
  type: 'markdown',
  cleanOutput: true,
  maxLength: 5000,
});

console.log('Extracted content:');
console.log(extractResult.data);
