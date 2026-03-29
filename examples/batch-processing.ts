/**
 * Batch processing example -- capture multiple URLs concurrently.
 *
 * Usage:
 *   SNAPAPI_KEY=sk_live_... npx tsx examples/batch-processing.ts
 */

import { SnapAPI } from 'snapapi-js';

const snap = new SnapAPI({
  apiKey: process.env.SNAPAPI_KEY!,
});

const urls = [
  'https://example.com',
  'https://github.com',
  'https://nodejs.org',
  'https://www.typescriptlang.org',
];

console.log(`Capturing ${urls.length} screenshots concurrently...`);

const results = await Promise.allSettled(
  urls.map((url) =>
    snap.screenshotToFile(url, `./output/${new URL(url).hostname}.png`),
  ),
);

for (const [i, result] of results.entries()) {
  if (result.status === 'fulfilled') {
    console.log(`OK:   ${urls[i]} (${result.value.length} bytes)`);
  } else {
    console.error(`FAIL: ${urls[i]} -- ${result.reason}`);
  }
}
