# snapapi-js

Official JavaScript / TypeScript SDK for [SnapAPI](https://snapapi.pics) — lightning-fast
screenshot, scrape, extract, PDF, video, and AI-analyze API.

## Installation

```bash
npm install snapapi-js
# yarn add snapapi-js
# pnpm add snapapi-js
```

Requires Node.js >= 18 (uses the native `fetch` API).

## Quick Start

```typescript
import { SnapAPI } from 'snapapi-js';

const snap = new SnapAPI({ apiKey: process.env.SNAPAPI_KEY! });

// Take a screenshot and save it
import fs from 'node:fs';
const buf = await snap.screenshot({ url: 'https://example.com' });
fs.writeFileSync('shot.png', buf);
```

## Configuration

```typescript
const snap = new SnapAPI({
  apiKey: 'sk_live_...',          // required
  baseUrl: 'https://snapapi.pics', // optional, default: https://snapapi.pics
  timeout: 60_000,                 // ms, default: 60 000
  maxRetries: 3,                   // default: 3 (429 + 5xx)
  retryDelay: 500,                 // initial backoff ms, doubles each retry

  // Optional interceptors
  onRequest: (url, init) => console.log('>', url),
  onResponse: (status, res) => console.log('<', status),
});
```

## Authentication

All requests send `Authorization: Bearer <apiKey>` automatically.
You can also pass the key as `?access_key=<apiKey>` on the URL if needed — but
the SDK handles authentication for you.

---

## Methods

### `snap.screenshot(options)`

Capture a screenshot of a URL, raw HTML, or Markdown string.

| Return type | Condition |
|---|---|
| `Buffer` | Default — binary image / PDF |
| `ScreenshotStorageResult` `{ id, url }` | `options.storage` is set |
| `ScreenshotQueuedResult` `{ jobId, status }` | `options.webhookUrl` is set |

```typescript
// PNG (default)
const buf = await snap.screenshot({ url: 'https://example.com' });

// Full-page dark-mode WebP on iPhone 15 Pro
const buf2 = await snap.screenshot({
  url: 'https://example.com',
  format: 'webp',
  device: 'iphone-15-pro',
  fullPage: true,
  darkMode: true,
  blockAds: true,
  blockCookieBanners: true,
  quality: 85,
});

// Capture a specific CSS element
const widget = await snap.screenshot({
  url: 'https://example.com',
  selector: '#pricing-table',
});

// Render raw HTML
const htmlBuf = await snap.screenshot({
  html: '<h1 style="color:red;font-size:48px">Hello!</h1>',
  width: 800,
  height: 200,
});

// Store in SnapAPI cloud and get back a permanent URL
import type { ScreenshotStorageResult } from 'snapapi-js';
const stored = await snap.screenshot({
  url: 'https://example.com',
  storage: { destination: 'snapapi' },
}) as ScreenshotStorageResult;
console.log(stored.url);

// Async delivery via webhook
import type { ScreenshotQueuedResult } from 'snapapi-js';
const queued = await snap.screenshot({
  url: 'https://example.com',
  webhookUrl: 'https://my-app.com/webhooks/snap',
}) as ScreenshotQueuedResult;
console.log(queued.jobId);
```

**Key options:**

| Option | Type | Default | Description |
|---|---|---|---|
| `url` | `string` | — | Page URL |
| `html` | `string` | — | Raw HTML to render |
| `markdown` | `string` | — | Markdown to render |
| `format` | `'png'\|'jpeg'\|'webp'\|'avif'\|'pdf'` | `'png'` | Output format |
| `quality` | `1–100` | — | JPEG / WebP quality |
| `device` | `DevicePreset` | — | 25+ device presets |
| `width` / `height` | `number` | `1280 / 800` | Viewport dimensions |
| `fullPage` | `boolean` | `false` | Capture full scrollable page |
| `selector` | `string` | — | Capture only this CSS element |
| `delay` | `0–30000` | `0` | Wait before capturing (ms) |
| `waitUntil` | `'load'\|'domcontentloaded'\|'networkidle'` | — | Navigation event |
| `darkMode` | `boolean` | `false` | Dark colour scheme |
| `css` | `string` | — | Inject custom CSS |
| `javascript` | `string` | — | Execute JS before capture |
| `hideSelectors` | `string[]` | — | Elements to hide |
| `blockAds` | `boolean` | `false` | Block ad networks |
| `blockTrackers` | `boolean` | `false` | Block tracking scripts |
| `blockCookieBanners` | `boolean` | `false` | Block consent popups |
| `proxy` | `ProxyConfig` | — | Custom proxy |
| `premiumProxy` | `boolean` | `false` | SnapAPI rotating proxy |
| `geolocation` | `Geolocation` | — | GPS coordinates |
| `timezone` | `string` | — | IANA timezone |
| `httpAuth` | `HttpAuth` | — | HTTP Basic Auth |
| `cookies` | `Cookie[]` | — | Inject cookies |
| `extraHeaders` | `Record<string,string>` | — | Custom request headers |
| `storage` | `StorageDestinationConfig` | — | Save to cloud |
| `webhookUrl` | `string` | — | Async delivery |
| `pageSize` | `PageSize` | — | PDF page size |
| `landscape` | `boolean` | — | PDF landscape |
| `margins` | `PdfMargins` | — | PDF page margins |

---

### `snap.scrape(options)`

Scrape text, HTML, or links from a page (or multiple pages with pagination).

```typescript
const { results } = await snap.scrape({
  url: 'https://news.ycombinator.com',
  type: 'links',       // 'text' | 'html' | 'links'
  pages: 1,
  waitMs: 1000,
  blockResources: true,
});
console.log(results[0].data);
```

| Option | Type | Default | Description |
|---|---|---|---|
| `url` | `string` | — | Target URL (required) |
| `type` | `'text'\|'html'\|'links'` | `'text'` | Content type |
| `pages` | `1–10` | `1` | Pages to scrape |
| `waitMs` | `0–30000` | — | Post-load wait (ms) |
| `proxy` | `string` | — | Proxy URL |
| `premiumProxy` | `boolean` | `false` | SnapAPI rotating proxy |
| `blockResources` | `boolean` | `false` | Block images / fonts |
| `locale` | `string` | — | Browser locale |

---

### `snap.extract(options)`

Extract structured content — text, markdown, article, links, images,
metadata, or structured data.

```typescript
const result = await snap.extract({
  url: 'https://example.com/blog/post',
  type: 'article',    // 'html'|'text'|'markdown'|'article'|'links'|'images'|'metadata'|'structured'
  cleanOutput: true,
  maxLength: 10_000,
});
console.log(result.data);
```

---

### `snap.pdf(options)`

Convert a URL or HTML string to a PDF file.

```typescript
const pdf = await snap.pdf({
  url: 'https://example.com',
  pageSize: 'a4',
  landscape: false,
  margins: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
});
fs.writeFileSync('output.pdf', pdf);

// From HTML
const htmlPdf = await snap.pdf({
  html: '<h1>Invoice</h1><p>Total: $99</p>',
  pageSize: 'letter',
});
```

---

### `snap.video(options)`

Record a video (WebM / MP4 / GIF) of a live webpage. Returns raw binary bytes.

```typescript
const video = await snap.video({
  url: 'https://example.com',
  format: 'mp4',
  duration: 5,
  scrolling: true,
  scrollEasing: 'ease_in_out',
});
fs.writeFileSync('recording.mp4', video);
```

---

### `snap.ogImage(options)`

Generate an Open Graph image (1200 x 630 by default) for a URL.

```typescript
const og = await snap.ogImage({ url: 'https://example.com' });
fs.writeFileSync('og.png', og);
```

---

### `snap.analyze(options)` — BYOK

Analyze a webpage with an LLM using your own API key (Bring Your Own Key).

```typescript
const result = await snap.analyze({
  url: 'https://example.com/pricing',
  prompt: 'List all pricing tiers and their monthly cost.',
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY!,
  jsonSchema: {
    type: 'object',
    properties: { tiers: { type: 'array', items: { type: 'object' } } },
  },
});
console.log(result.analysis);
```

---

### `snap.quota()`

Get your API usage for the current billing period.

```typescript
const { used, limit, remaining } = await snap.quota();
console.log(`${used} / ${limit} calls used (${remaining} remaining)`);
```

---

### `snap.storage.*`

Manage files stored in SnapAPI cloud.

```typescript
// List files
const { files } = await snap.storage.listFiles(50, 0);

// Download URL for a file
const file = await snap.storage.getFile('file_id');
console.log(file.url);

// Delete
await snap.storage.deleteFile('file_id');

// Storage usage
const usage = await snap.storage.getUsage();
console.log(`${usage.usedFormatted} / ${usage.limitFormatted}`);

// Configure your own S3 bucket
await snap.storage.configureS3({
  s3_bucket: 'my-bucket',
  s3_region: 'us-east-1',
  s3_access_key_id: 'AKIA...',
  s3_secret_access_key: 'secret',
  s3_endpoint: 'https://s3.example.com', // optional
});
const testResult = await snap.storage.testS3();
console.log(testResult.success);
```

---

### `snap.scheduled.*`

Create recurring screenshot jobs on a cron schedule.

```typescript
const job = await snap.scheduled.create({
  url: 'https://example.com',
  cronExpression: '0 9 * * *',  // every day at 09:00 UTC
  format: 'png',
  fullPage: true,
  webhookUrl: 'https://my-app.com/hooks/snap',
});
console.log(job.id, job.nextRun);

const jobs = await snap.scheduled.list();
await snap.scheduled.delete(job.id);
```

---

### `snap.webhooks.*`

Manage webhook endpoint registrations.

```typescript
const wh = await snap.webhooks.create({
  url: 'https://my-app.com/hooks/snapapi',
  events: ['screenshot.done'],
  secret: 'my-signing-secret',
});

const list = await snap.webhooks.list();
await snap.webhooks.delete(wh.id);
```

---

### `snap.keys.*`

Manage API keys programmatically.

```typescript
// List (values are masked)
const keys = await snap.keys.list();

// Create — full key returned only once
const { key } = await snap.keys.create('production-key');
console.log(key); // sk_live_... — store this securely!

// Delete
await snap.keys.delete(keys[0].id);
```

---

## Error Handling

All errors extend `SnapAPIError`, which includes `.code` (machine-readable)
and `.statusCode` (HTTP status):

```typescript
import {
  SnapAPIError,
  RateLimitError,
  AuthenticationError,
  ValidationError,
  QuotaExceededError,
  TimeoutError,
} from 'snapapi-js';

try {
  const buf = await snap.screenshot({ url: 'https://example.com' });
} catch (err) {
  if (err instanceof RateLimitError) {
    console.log(`Rate limited. Retry after ${err.retryAfter}s`);
    // The SDK retries automatically — you only see this if maxRetries is exhausted
  } else if (err instanceof AuthenticationError) {
    console.error('Invalid API key');
  } else if (err instanceof QuotaExceededError) {
    console.error('Quota exhausted — upgrade your plan');
  } else if (err instanceof ValidationError) {
    console.error('Bad request:', err.fields);
  } else if (err instanceof TimeoutError) {
    console.error('Request timed out');
  } else if (err instanceof SnapAPIError) {
    console.error(`API error ${err.statusCode} [${err.code}]: ${err.message}`);
  }
}
```

Rate-limit errors (HTTP 429) and server errors (5xx) are **automatically retried**
with exponential backoff. The error is thrown only when all retries are exhausted.

---

## Examples Directory

See the `examples/` directory for runnable code samples:

| File | Description |
|---|---|
| `examples/screenshot.js` | Basic + advanced screenshot usage |
| `examples/scrape.js` | Multi-page scraping |
| `examples/extract.js` | Content extraction |
| `examples/analyze.js` | LLM page analysis |
| `examples/scheduled.js` | Scheduled screenshots |
| `examples/storage.js` | Cloud storage management |

---

## TypeScript

Full type definitions are bundled. Import types directly:

```typescript
import type {
  SnapAPIConfig,
  ScreenshotOptions,
  ScreenshotStorageResult,
  ScrapeOptions,
  ScrapeResult,
  ExtractOptions,
  ExtractResult,
  PdfOptions,
  VideoOptions,
  AnalyzeOptions,
  AnalyzeResult,
  AccountUsage,
  StorageFile,
  ScheduledScreenshot,
  Webhook,
  ApiKey,
  Cookie,
  HttpAuth,
  ProxyConfig,
  DevicePreset,
} from 'snapapi-js';
```

---

## Contributing

1. Fork the repository
2. Create a branch: `git checkout -b my-feature`
3. Install dependencies: `npm install`
4. Run tests: `npm test`
5. Submit a pull request

---

## License

MIT — see [LICENSE](LICENSE)

## Links

- [snapapi.pics](https://snapapi.pics)
- [API Documentation](https://snapapi.pics/docs)
- [Python SDK](https://github.com/Sleywill/snapapi-python)
- [Issues](https://github.com/Sleywill/snapapi-js/issues)
