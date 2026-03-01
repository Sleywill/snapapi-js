// examples/screenshot.js – SnapAPI v2 JavaScript SDK
const SnapAPI = require('@snapapi/sdk').default;
const fs = require('fs');

const client = new SnapAPI({ apiKey: process.env.SNAPAPI_KEY || 'sk_live_YOUR_KEY' });

async function main() {
  // 1. Basic PNG screenshot
  console.log('Taking basic screenshot…');
  const buf = await client.screenshot({ url: 'https://example.com' });
  fs.writeFileSync('basic.png', buf);
  console.log('Saved basic.png');

  // 2. Full-page dark-mode WebP
  const buf2 = await client.screenshot({
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
  const buf3 = await client.screenshot({
    url: 'https://example.com',
    device: 'iphone-15-pro',
    format: 'png',
  });
  fs.writeFileSync('mobile.png', buf3);
  console.log('Saved mobile.png');

  // 4. Render HTML to image
  const buf4 = await client.screenshot({
    html: `<!DOCTYPE html><html><body style="background:#1a1a2e;color:#e0e0e0;font-family:sans-serif;padding:40px">
      <h1>Hello from SnapAPI!</h1><p>Rendered from raw HTML.</p></body></html>`,
    width: 800,
    height: 300,
    format: 'png',
  });
  fs.writeFileSync('html.png', buf4);
  console.log('Saved html.png');

  // 5. PDF generation
  const pdf = await client.screenshot({
    url: 'https://example.com',
    format: 'pdf',
    pageSize: 'a4',
    margins: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
  });
  fs.writeFileSync('page.pdf', pdf);
  console.log('Saved page.pdf');

  // 6. Store to SnapAPI cloud
  const stored = await client.screenshot({
    url: 'https://example.com',
    storage: { destination: 'snapapi' },
  });
  console.log('Stored file URL:', stored.url, ' ID:', stored.id);

  // 7. Async via webhook
  const queued = await client.screenshot({
    url: 'https://example.com',
    webhookUrl: 'https://webhook.site/your-id',
  });
  console.log('Queued job ID:', queued.jobId);
}

main().catch(console.error);
