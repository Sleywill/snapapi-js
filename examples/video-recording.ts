/**
 * Video recording example.
 *
 * Usage:
 *   SNAPAPI_KEY=sk_live_... npx tsx examples/video-recording.ts
 */

import { SnapAPI } from 'snapapi-js';
import fs from 'node:fs';

const snap = new SnapAPI({
  apiKey: process.env.SNAPAPI_KEY!,
});

// Record a 10-second scroll video of a page
const video = await snap.video({
  url: 'https://example.com',
  format: 'mp4',
  duration: 10,
  width: 1280,
  height: 720,
  fps: 30,
  scrolling: true,
  scrollSpeed: 200,
  scrollEasing: 'ease_in_out',
  darkMode: true,
  blockAds: true,
  blockCookieBanners: true,
});

if (Buffer.isBuffer(video)) {
  fs.writeFileSync('recording.mp4', video);
  console.log(`Saved recording.mp4 (${video.length} bytes)`);
}
