# SnapAPI JavaScript / TypeScript SDK

Official JavaScript / TypeScript SDK for [SnapAPI](https://snapapi.pics) — the lightning-fast screenshot, scrape, extract, PDF, video, and AI-analyze API.

[![npm version](https://img.shields.io/npm/v/snapapi-js?label=npm&color=cb3837)](https://www.npmjs.com/package/snapapi-js)
[![CI](https://github.com/Sleywill/snapapi-js/actions/workflows/ci.yml/badge.svg)](https://github.com/Sleywill/snapapi-js/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

## Installation

```bash
npm install snapapi-js
```

```bash
yarn add snapapi-js
```

```bash
pnpm add snapapi-js
```

## Quick Start

```typescript
import { SnapAPI } from 'snapapi-js';
import fs from 'node:fs';

const snap = new SnapAPI({ apiKey: 'sk_live_...' });

// Take a screenshot and get the raw bytes
const buf = await snap.screenshot({ url: 'https://example.com' });
fs.writeFileSync('screenshot.png', buf);

// Or save directly to a file
await snap.screenshotToFile('https://example.com', './screenshot.png');
```

## Features

- Full TypeScript types with JSDoc on every method
- ESM and CommonJS dual output
- Automatic retries with exponential backoff
- Rate limit handling with Retry-After support
- Request / response interceptors for logging and analytics
- Configurable timeouts (per-client)
- All SnapAPI endpoints: screenshot, scrape, extract, PDF, video, OG image, analyze
- Storage, scheduled jobs, webhooks, and API key management namespaces
- Custom error classes: `SnapAPIError`, `AuthenticationError`, `RateLimitError`, `ValidationError`, `QuotaExceededError`, `TimeoutError`, `NetworkError`

## Configuration

```typescript
const snap = new SnapAPI({
  apiKey: 'sk_live_...',              // Required
  baseUrl: 'https://api.snapapi.pics', // Default
  timeout: 60_000,                     // 60 s — global request timeout
  maxRetries: 3,                       // Auto-retry on 429 / 5xx
  retryDelay: 500,                     // Initial backoff in ms (doubles each retry)

  // Interceptors (optional)
  onRequest: (url, init) => {
    console.log(`-> ${init.method ?? 'GET'} ${url}`);
  },
  onResponse: (status, response) => {
    console.log(`<- ${status}`);
  },
});
```

### Configuration options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | `string` | -- | **Required.** Your SnapAPI key |
| `baseUrl` | `string` | `'https://api.snapapi.pics'` | API base URL |
| `timeout` | `number` | `60000` | Global request timeout in ms |
| `maxRetries` | `number` | `3` | Maximum retry attempts on 429 / 5xx |
| `retryDelay` | `number` | `500` | Initial retry backoff in ms (doubles each attempt) |
| `onRequest` | `function` | -- | Hook called before every request |
| `onResponse` | `function` | -- | Hook called after every response |

## API Reference

### Screenshot

Capture a screenshot of any URL, raw HTML, or Markdown.

```typescript
// Basic PNG screenshot
const buf = await snap.screenshot({ url: 'https://example.com' });

// Full-page dark-mode WebP with ad blocking
const buf = await snap.screenshot({
  url: 'https://github.com',
  format: 'webp',
  fullPage: true,
  darkMode: true,
  blockAds: true,
  blockCookieBanners: true,
  quality: 80,
});

// Custom viewport (named device preset)
const buf = await snap.screenshot({
  url: 'https://example.com',
  device: 'iphone-15-pro',
});

// Render from raw HTML
const buf = await snap.screenshot({
  html: '<h1 style="color: red;">Hello World</h1>',
  width: 800,
  height: 600,
});

// Save directly to a file (convenience method)
await snap.screenshotToFile('https://example.com', './output/shot.png');
await snap.screenshotToFile('https://example.com', './output/full.webp', {
  format: 'webp',
  fullPage: true,
});

// Store in SnapAPI cloud (convenience method — always returns { id, url })
const { id, url } = await snap.screenshotToStorage('https://example.com');

// Store to your own S3
const { id, url } = await snap.screenshotToStorage('https://example.com', {
  destination: 'user_s3',
});

// Low-level storage — check response type yourself
const result = await snap.screenshot({
  url: 'https://example.com',
  storage: { destination: 'snapapi' },
});
if (!Buffer.isBuffer(result) && 'id' in result) {
  console.log(result.url);
}

// Async via webhook — sends result to a URL, returns a job ID
const queued = await snap.screenshot({
  url: 'https://example.com',
  webhookUrl: 'https://my-app.com/hooks/snapapi',
});
if (!Buffer.isBuffer(queued) && 'jobId' in queued) {
  console.log('Job ID:', queued.jobId);
}
```

**All screenshot options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `url` | `string` | -- | URL to capture |
| `html` | `string` | -- | Raw HTML to render |
| `markdown` | `string` | -- | Markdown to render |
| `format` | `'png' \| 'jpeg' \| 'webp' \| 'avif' \| 'pdf'` | `'png'` | Output format |
| `quality` | `number` | -- | JPEG / WebP quality 1–100 |
| `device` | `DevicePreset` | -- | Named device viewport preset |
| `width` | `number` | `1280` | Viewport width in px |
| `height` | `number` | `800` | Viewport height in px |
| `deviceScaleFactor` | `number` | `1` | Device pixel ratio 1–3 |
| `isMobile` | `boolean` | `false` | Emulate mobile device |
| `hasTouch` | `boolean` | `false` | Enable touch events |
| `fullPage` | `boolean` | `false` | Capture full scrollable page |
| `fullPageScrollDelay` | `number` | -- | Delay between scroll steps (ms) |
| `fullPageMaxHeight` | `number` | -- | Maximum full-page height (px) |
| `selector` | `string` | -- | CSS selector to capture |
| `delay` | `number` | `0` | Extra delay before capture (ms) |
| `timeout` | `number` | -- | Navigation timeout (ms) |
| `waitUntil` | `'load' \| 'domcontentloaded' \| 'networkidle'` | -- | Navigation wait condition |
| `waitForSelector` | `string` | -- | Wait for a CSS selector |
| `darkMode` | `boolean` | `false` | Emulate dark colour scheme |
| `reducedMotion` | `boolean` | `false` | Reduce CSS animations |
| `css` | `string` | -- | Custom CSS to inject |
| `javascript` | `string` | -- | JS to execute before capture |
| `hideSelectors` | `string[]` | -- | CSS selectors to hide |
| `clickSelector` | `string` | -- | CSS selector to click first |
| `blockAds` | `boolean` | `false` | Block ad networks |
| `blockTrackers` | `boolean` | `false` | Block tracking scripts |
| `blockCookieBanners` | `boolean` | `false` | Block cookie consent popups |
| `blockChatWidgets` | `boolean` | `false` | Block chat widgets |
| `userAgent` | `string` | -- | Custom User-Agent |
| `extraHeaders` | `Record<string, string>` | -- | Extra HTTP request headers |
| `cookies` | `Cookie[]` | -- | Cookies to inject |
| `httpAuth` | `HttpAuth` | -- | HTTP Basic Auth credentials |
| `proxy` | `ProxyConfig` | -- | Custom proxy configuration |
| `premiumProxy` | `boolean` | `false` | Use SnapAPI rotating proxy |
| `geolocation` | `Geolocation` | -- | GPS geolocation to emulate |
| `timezone` | `string` | -- | IANA timezone (e.g. `'America/New_York'`) |
| `pageSize` | `PageSize` | -- | PDF page size (when `format: 'pdf'`) |
| `landscape` | `boolean` | `false` | PDF landscape orientation |
| `margins` | `PdfMargins` | -- | PDF page margins |
| `headerTemplate` | `string` | -- | HTML for PDF header |
| `footerTemplate` | `string` | -- | HTML for PDF footer |
| `displayHeaderFooter` | `boolean` | `false` | Show PDF header / footer |
| `scale` | `number` | `1` | PDF content scale factor |
| `storage` | `StorageDestinationConfig` | -- | Cloud storage configuration |
| `webhookUrl` | `string` | -- | Deliver result to this webhook URL |
| `jobId` | `string` | -- | Poll a previously queued async job |

### Scrape

Scrape text, HTML, or links from web pages using a stealth browser.

```typescript
const { results } = await snap.scrape({
  url: 'https://news.ycombinator.com',
  type: 'links',
  pages: 3,
  blockResources: true,
});

for (const page of results) {
  console.log(`Page ${page.page}: ${page.data.substring(0, 100)}`);
}
```

**Scrape options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `url` | `string` | -- | **Required.** URL to scrape |
| `type` | `'text' \| 'html' \| 'links'` | `'text'` | Content type to return |
| `pages` | `number` | `1` | Number of pages to scrape (1–10) |
| `waitMs` | `number` | `0` | Wait time after page load (ms) |
| `proxy` | `string` | -- | Proxy URL `http://user:pass@host:port` |
| `premiumProxy` | `boolean` | `false` | Use SnapAPI rotating proxy |
| `blockResources` | `boolean` | `false` | Block images / fonts / media |
| `locale` | `string` | -- | Browser locale e.g. `'en-US'` |

### Extract

Extract structured content from pages -- markdown, text, article, links, images, metadata, or structured data.

```typescript
const result = await snap.extract({
  url: 'https://example.com/blog/post',
  type: 'markdown',
  cleanOutput: true,
  maxLength: 10000,
});

console.log(result.data); // Clean markdown string
console.log(result.responseTime); // ms
```

**Extract options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `url` | `string` | -- | **Required.** URL to extract from |
| `type` | `'html' \| 'text' \| 'markdown' \| 'article' \| 'links' \| 'images' \| 'metadata' \| 'structured'` | `'markdown'` | Content type |
| `selector` | `string` | -- | CSS selector to scope extraction |
| `waitFor` | `string` | -- | CSS selector or event to wait for |
| `timeout` | `number` | -- | Navigation timeout (ms) |
| `darkMode` | `boolean` | `false` | Emulate dark mode |
| `blockAds` | `boolean` | `false` | Block ad networks |
| `blockCookieBanners` | `boolean` | `false` | Block consent banners |
| `includeImages` | `boolean` | `false` | Include image URLs in output |
| `maxLength` | `number` | -- | Truncate output at N characters |
| `cleanOutput` | `boolean` | `false` | Strip navigation and boilerplate |

### PDF

Convert URLs or HTML strings to PDF documents.

```typescript
// From URL
const pdf = await snap.pdf({
  url: 'https://example.com/invoice',
  pageSize: 'a4',
  margins: { top: '20mm', bottom: '20mm' },
});
fs.writeFileSync('invoice.pdf', pdf);

// From HTML
const pdf = await snap.pdf({
  html: '<h1>Invoice #1234</h1><p>Total: $99.00</p>',
  landscape: true,
});

// Save directly to file
await snap.pdfToFile('https://example.com', './output.pdf', { pageSize: 'letter' });
```

**PDF options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `url` | `string` | -- | URL to convert (required unless `html` is set) |
| `html` | `string` | -- | Raw HTML to convert |
| `pageSize` | `'a4' \| 'a3' \| 'a5' \| 'letter' \| 'legal' \| 'tabloid'` | `'a4'` | Page size |
| `landscape` | `boolean` | `false` | Landscape orientation |
| `margins` | `PdfMargins` | -- | Page margins (`top`, `right`, `bottom`, `left`) |
| `headerTemplate` | `string` | -- | HTML template for page header |
| `footerTemplate` | `string` | -- | HTML template for page footer |
| `displayHeaderFooter` | `boolean` | `false` | Show header and footer |
| `scale` | `number` | `1` | Content scale factor 0.1–2 |
| `delay` | `number` | `0` | Extra delay before rendering (ms) |
| `waitForSelector` | `string` | -- | Wait for a CSS selector before rendering |

### Video

Record a video (WebM / MP4 / GIF) of a live webpage.

```typescript
const video = await snap.video({
  url: 'https://example.com',
  format: 'mp4',
  duration: 10,
  scrolling: true,
  scrollSpeed: 200,
  fps: 30,
});
fs.writeFileSync('recording.mp4', video as Buffer);
```

**Video options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `url` | `string` | -- | **Required.** URL to record |
| `format` | `'webm' \| 'mp4' \| 'gif'` | `'webm'` | Output format |
| `width` | `number` | `1280` | Viewport width 320–1920 |
| `height` | `number` | `720` | Viewport height 240–1080 |
| `duration` | `number` | `5` | Recording duration in seconds 1–30 |
| `fps` | `number` | `25` | Frames per second 10–30 |
| `scrolling` | `boolean` | `false` | Enable auto-scroll animation |
| `scrollSpeed` | `number` | `100` | Scroll speed px/s 50–500 |
| `scrollDelay` | `number` | `500` | Delay before scroll starts (ms) |
| `scrollDuration` | `number` | `1500` | Duration of each scroll step (ms) |
| `scrollBy` | `number` | `500` | Pixels to scroll per step 100–2000 |
| `scrollEasing` | `ScrollEasing` | `'ease_in_out'` | Scroll easing function |
| `scrollBack` | `boolean` | `true` | Scroll back to top at end |
| `scrollComplete` | `boolean` | `true` | Stop at bottom |
| `darkMode` | `boolean` | `false` | Enable dark mode |
| `blockAds` | `boolean` | `false` | Block ad networks |
| `blockCookieBanners` | `boolean` | `false` | Block consent banners |
| `delay` | `number` | `0` | Delay before recording starts (ms) |

### OG Image

Generate Open Graph social images.

```typescript
const og = await snap.ogImage({
  url: 'https://example.com',
  format: 'png',
  width: 1200,
  height: 630,
});
fs.writeFileSync('og.png', og);
```

**OG Image options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `url` | `string` | -- | **Required.** URL to generate OG image for |
| `format` | `'png' \| 'jpeg' \| 'webp' \| 'avif'` | `'png'` | Output format |
| `width` | `number` | `1200` | Image width |
| `height` | `number` | `630` | Image height |

### Analyze (AI)

Analyze webpages with an LLM -- bring your own API key (BYOK).

```typescript
const result = await snap.analyze({
  url: 'https://example.com/pricing',
  prompt: 'Extract all pricing tiers as JSON with name, price, and features.',
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY!,
  jsonSchema: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        price: { type: 'string' },
        features: { type: 'array', items: { type: 'string' } },
      },
    },
  },
});
console.log(result.analysis);
```

**Analyze options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `url` | `string` | -- | **Required.** URL to analyze |
| `prompt` | `string` | -- | **Required.** Prompt describing what to analyze |
| `provider` | `'openai' \| 'anthropic'` | -- | LLM provider |
| `apiKey` | `string` | -- | Your LLM provider API key (BYOK) |
| `model` | `string` | -- | Override model (e.g. `'gpt-4o'`) |
| `jsonSchema` | `Record<string, unknown>` | -- | JSON schema for structured output |
| `includeScreenshot` | `boolean` | `false` | Include screenshot in LLM context |
| `includeMetadata` | `boolean` | `false` | Include page metadata in context |
| `maxContentLength` | `number` | -- | Max characters of content sent to LLM |
| `timeout` | `number` | -- | Navigation timeout (ms) |
| `blockAds` | `boolean` | `false` | Block ad networks |
| `blockCookieBanners` | `boolean` | `false` | Block consent banners |
| `waitFor` | `string` | -- | Wait for a CSS selector before analyzing |

### Usage / Quota

```typescript
const { used, limit, remaining, resetAt } = await snap.getUsage();
console.log(`${used} / ${limit} API calls used (resets ${resetAt})`);

// Aliases
await snap.quota();  // same as getUsage()
```

### Ping

```typescript
const { status } = await snap.ping();
// { status: 'ok', timestamp: 1710540000000 }
```

## Sub-Namespaces

### Storage

```typescript
// Check storage usage
const usage = await snap.storage.getUsage();
// { used, limit, percentage, usedFormatted, limitFormatted }

// List stored files (paginated)
const { files, total } = await snap.storage.listFiles(50, 0);

// Get metadata for a specific file
const file = await snap.storage.getFile('file_abc');

// Delete a file
await snap.storage.deleteFile('file_abc');

// Configure custom S3-compatible storage
await snap.storage.configureS3({
  s3_bucket: 'my-bucket',
  s3_region: 'us-east-1',
  s3_access_key_id: process.env.AWS_ACCESS_KEY_ID!,
  s3_secret_access_key: process.env.AWS_SECRET_ACCESS_KEY!,
  s3_endpoint: 'https://s3.custom-provider.com', // optional
});

// Test the S3 connection
const { success, message } = await snap.storage.testS3();
```

### Scheduled Screenshots

```typescript
// Create a scheduled job (runs daily at 9 am UTC)
const job = await snap.scheduled.create({
  url: 'https://example.com',
  cronExpression: '0 9 * * *',
  format: 'png',
  webhookUrl: 'https://my-app.com/webhook',
});
console.log(job.id, job.nextRun);

// List all jobs
const jobs = await snap.scheduled.list();

// Delete a job
await snap.scheduled.delete(job.id);
```

### Webhooks

```typescript
const wh = await snap.webhooks.create({
  url: 'https://my-app.com/hooks/snapapi',
  events: ['screenshot.done'],
  secret: 'my-signing-secret', // HMAC signing secret (optional)
});

const all = await snap.webhooks.list();
await snap.webhooks.delete(wh.id);
```

### API Keys

```typescript
// Create a new key (full key returned only once — store securely!)
const { key, id, name } = await snap.keys.create('production');
console.log(key); // sk_live_abc123...

// List all keys (values are masked)
const allKeys = await snap.keys.list();

// Delete a key
await snap.keys.delete(id);
```

## Error Handling

All errors extend `SnapAPIError` with machine-readable `code` and `statusCode` fields.

```typescript
import {
  SnapAPIError,
  AuthenticationError,
  RateLimitError,
  ValidationError,
  QuotaExceededError,
  TimeoutError,
  NetworkError,
} from 'snapapi-js';

try {
  await snap.screenshot({ url: 'https://example.com' });
} catch (err) {
  if (err instanceof AuthenticationError) {
    // HTTP 401 / 403 — invalid or missing API key
    console.error('Invalid API key. Get yours at https://snapapi.pics');
  } else if (err instanceof RateLimitError) {
    // HTTP 429 — rate limited; SDK auto-retries up to maxRetries
    console.error(`Rate limited. Retry after ${err.retryAfter}s`);
  } else if (err instanceof QuotaExceededError) {
    // HTTP 402 — monthly quota exhausted
    console.error('Quota exceeded. Upgrade at https://snapapi.pics/pricing');
  } else if (err instanceof ValidationError) {
    // HTTP 422 — invalid request parameters
    console.error('Invalid options:', err.fields);
  } else if (err instanceof TimeoutError) {
    // Request exceeded the configured timeout
    console.error('Request timed out');
  } else if (err instanceof NetworkError) {
    // DNS failure, ECONNREFUSED, no internet, etc.
    console.error('Network error:', err.message);
  } else if (err instanceof SnapAPIError) {
    // Any other API error
    console.error(`API error [${err.code}] HTTP ${err.statusCode}: ${err.message}`);
  }
}
```

**Error classes:**

| Class | `statusCode` | `code` | Description |
|-------|-------------|--------|-------------|
| `SnapAPIError` | varies | varies | Base class — all SDK errors extend this |
| `AuthenticationError` | `401` / `403` | `UNAUTHORIZED` | Invalid or missing API key |
| `RateLimitError` | `429` | `RATE_LIMITED` | Rate limit hit; has `.retryAfter` (seconds) |
| `QuotaExceededError` | `402` | `QUOTA_EXCEEDED` | Monthly quota exhausted |
| `ValidationError` | `422` | `VALIDATION_ERROR` | Invalid parameters; has `.fields` map |
| `TimeoutError` | `0` | `TIMEOUT` | Request exceeded configured timeout |
| `NetworkError` | `0` | `NETWORK_ERROR` | Network failure before reaching the API |

## Advanced Usage

### Proxies

```typescript
// Custom proxy
const buf = await snap.screenshot({
  url: 'https://example.com',
  proxy: {
    server: 'http://proxy.example.com:8080',
    username: 'user',
    password: 'pass',
  },
});

// SnapAPI built-in rotating proxy
const buf = await snap.screenshot({
  url: 'https://example.com',
  premiumProxy: true,
});
```

### Custom Headers and Cookies

```typescript
const buf = await snap.screenshot({
  url: 'https://app.example.com/dashboard',
  extraHeaders: {
    'Accept-Language': 'fr-FR',
    'X-Custom-Header': 'value',
  },
  cookies: [
    {
      name: 'session',
      value: 'abc123',
      domain: 'app.example.com',
      secure: true,
      httpOnly: true,
    },
  ],
});
```

### Batch Processing

```typescript
const urls = [
  'https://example.com',
  'https://github.com',
  'https://nodejs.org',
];

const results = await Promise.allSettled(
  urls.map(url =>
    snap.screenshotToFile(url, `./output/${new URL(url).hostname}.png`)
  )
);

for (const [i, result] of results.entries()) {
  if (result.status === 'fulfilled') {
    console.log(`OK: ${urls[i]}`);
  } else {
    console.error(`FAIL: ${urls[i]} - ${result.reason}`);
  }
}
```

### Change Detection / Monitoring

```typescript
import crypto from 'node:crypto';

async function checkForChanges(url: string, previousHash: string) {
  const buf = await snap.screenshot({ url, fullPage: true });
  const hash = crypto.createHash('sha256').update(buf).digest('hex');

  if (hash !== previousHash) {
    console.log(`Page changed: ${url}`);
  }
  return hash;
}
```

### LLM Data Pipeline

```typescript
// 1. Extract clean markdown
const { data: markdown } = await snap.extract({
  url: 'https://example.com/article',
  type: 'markdown',
  cleanOutput: true,
  maxLength: 10000,
});

// 2. Feed to your LLM directly — no API key needed on SnapAPI's side
const { analysis } = await snap.analyze({
  url: 'https://example.com/article',
  prompt: 'Summarize the key points and overall sentiment.',
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY!,
});
```

### Interceptors (Logging / Analytics)

```typescript
const snap = new SnapAPI({
  apiKey: process.env.SNAPAPI_KEY!,
  onRequest: (url, init) => {
    console.log(`[SnapAPI] -> ${init.method ?? 'GET'} ${url}`);
  },
  onResponse: (status, response) => {
    console.log(`[SnapAPI] <- ${status} ${response.url}`);
  },
});
```

## TypeScript

All types and interfaces are exported from the package root.

```typescript
import type {
  SnapAPIConfig,
  ScreenshotOptions,
  ScreenshotStorageResult,
  ScreenshotQueuedResult,
  ScrapeOptions,
  ScrapeResult,
  ExtractOptions,
  ExtractResult,
  PdfOptions,
  VideoOptions,
  VideoResult,
  OgImageOptions,
  AnalyzeOptions,
  AnalyzeResult,
  AccountUsage,
  StorageFile,
  StorageListResult,
  StorageUsage,
  StorageDestinationConfig,
  S3Config,
  CreateScheduledOptions,
  ScheduledScreenshot,
  CreateWebhookOptions,
  Webhook,
  ApiKey,
  CreateApiKeyResult,
  Cookie,
  HttpAuth,
  ProxyConfig,
  Geolocation,
  PdfMargins,
  DeleteResult,
} from 'snapapi-js';
```

## Requirements

- Node.js 18+ (uses native `fetch`)
- TypeScript 5.3+ (optional, for type checking)

## License

MIT -- see [LICENSE](./LICENSE).

## Links

- [SnapAPI Website](https://snapapi.pics)
- [API Documentation](https://snapapi.pics/docs)
- [GitHub Repository](https://github.com/Sleywill/snapapi-js)
- [GitHub Issues](https://github.com/Sleywill/snapapi-js/issues)
- [Changelog](./CHANGELOG.md)
