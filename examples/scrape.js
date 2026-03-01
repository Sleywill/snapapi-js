// examples/scrape.js – SnapAPI v2 JavaScript SDK
const SnapAPI = require('@snapapi/sdk').default;

const client = new SnapAPI({ apiKey: process.env.SNAPAPI_KEY || 'sk_live_YOUR_KEY' });

async function main() {
  // 1. Scrape page text
  const text = await client.scrape({
    url: 'https://news.ycombinator.com',
    type: 'text',
    waitMs: 1000,
    blockResources: true,
  });
  console.log('Text (first 500 chars):', text.results[0].data.slice(0, 500));

  // 2. Scrape links
  const links = await client.scrape({
    url: 'https://news.ycombinator.com',
    type: 'links',
  });
  console.log('Links found:', links.results[0].data);

  // 3. Multi-page scrape with premium proxy
  const multi = await client.scrape({
    url: 'https://news.ycombinator.com',
    type: 'html',
    pages: 3,
    premiumProxy: true,
  });
  multi.results.forEach(r => {
    console.log(`Page ${r.page} (${r.url}): ${r.data.length} chars`);
  });
}

main().catch(console.error);
