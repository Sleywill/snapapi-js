# @snapapi/sdk

Official JavaScript / TypeScript SDK for **[SnapAPI](https://snapapi.pics)** — a lightning-fast screenshot, scrape, extract and AI-analyze API.

## Installation

```bash
npm install @snapapi/sdk
# or
yarn add @snapapi/sdk
# or
pnpm add @snapapi/sdk
```

## Quick start

```typescript
import SnapAPI from '@snapapi/sdk';

const client = new SnapAPI({ apiKey: 'sk_live_YOUR_KEY' });

// Take a screenshot
const buf = await client.screenshot({ url: 'https://example.com' });
require('fs').writeFileSync('shot.png', buf as Buffer);
```

---

## Authentication

Pass your API key when constructing the client:

```typescript
const client = new SnapAPI({
  apiKey: process.env.SNAPAPI_KEY!,   // required
  baseUrl: 'https://api.snapapi.pics', // optional override
  timeout: 60_000,                     // ms, default 60 s
});
```

---

## Methods

### `client.screenshot(options)`

Capture a screenshot of a URL, raw HTML, or Markdown.

| Return type | Trigger |
|---|---|
| `Buffer` | Default (binary image/PDF) |
| `{ id, url }` | `options.storage` is set |
| `{ jobId, status:'queued' }` | `options.webhookUrl` is set |

```typescript
// Basic PNG
const buf = await client.screenshot({ url: 'https://example.com' });

// Full-page dark-mode WebP, iPhone viewport
const buf2 = await client.screenshot({
  url: 'https://example.com',
  format: 'webp',
  device: 'iphone-15-pro',
  fullPage: true,
  darkMode: true,
  blockAds: true,
  blockCookieBanners: true,
});

// Generate PDF
const pdf = await client.screenshot({
  url: 'https://example.com',
  format: 'pdf',
  pageSize: 'a4',
  landscape: false,
  margins: { top: '20mm', bottom: '20mm' },
});

// Render raw HTML
const buf3 = await client.screenshot({
  html: '<h1 style="color:red">Hello!</h1>',
  width: 800, height: 200,
});

// Store in SnapAPI cloud and receive URL
const stored = await client.screenshot({
  url: 'https://example.com',
  storage: { destination: 'snapapi' },
}) as { id: string; url: string };
console.log(stored.url);

// Async delivery via webhook
const queued = await client.screenshot({
  url: 'https://example.com',
  webhookUrl: 'https://my.app/hooks/snapapi',
}) as { jobId: string; status: string };
console.log(queued.jobId);
```

**Key options:**

| Option | Type | Description |
|---|---|---|
| `url` | `string` | Page URL |
| `html` | `string` | Raw HTML to render |
| `markdown` | `string` | Markdown to render |
| `format` | `'png'\|'jpeg'\|'webp'\|'avif'\|'pdf'` | Output format |
| `quality` | `1–100` | JPEG/WebP quality |
| `device` | `DevicePreset` | 25 device presets |
| `width` / `height` | `number` | Viewport size |
| `fullPage` | `boolean` | Capture full scrollable page |
| `selector` | `string` | Capture a specific CSS element |
| `delay` | `0–30000` | Wait before capture (ms) |
| `waitUntil` | `'load'\|'domcontentloaded'\|'networkidle'` | Navigation event |
| `darkMode` | `boolean` | Dark colour scheme |
| `css` / `javascript` | `string` | Inject CSS/JS |
| `hideSelectors` | `string[]` | Hide elements |
| `blockAds` / `blockTrackers` / `blockCookieBanners` | `boolean` | Blocking |
| `proxy` | `ProxyConfig` | Custom proxy |
| `premiumProxy` | `boolean` | SnapAPI rotating proxy |
| `geolocation` | `{latitude, longitude}` | Emulate location |
| `timezone` | `string` | e.g. `'America/New_York'` |
| `httpAuth` | `{username, password}` | HTTP Basic Auth |
| `cookies` | `Cookie[]` | Inject cookies |
| `extraHeaders` | `Record<string,string>` | Custom request headers |
| `storage` | `StorageDestination` | Save to cloud |
| `webhookUrl` | `string` | Async delivery |
| `pageSize` / `landscape` / `margins` | — | PDF options |

---

### `client.scrape(options)`

Scrape text, HTML, or links from a page (or multiple pages with pagination).

```typescript
const { results } = await client.scrape({
  url: 'https://news.ycombinator.com',
  type: 'links',       // 'text' | 'html' | 'links'
  pages: 1,
  waitMs: 1000,
  blockResources: true,
});

console.log(results[0].data);
```

| Option | Type | Description |
|---|---|---|
| `url` | `string` | Target URL (required) |
| `type` | `'text'\|'html'\|'links'` | Content type |
| `pages` | `1–10` | Pages to scrape |
| `waitMs` | `0–30000` | Post-load wait |
| `proxy` | `string` | Proxy URL |
| `premiumProxy` | `boolean` | SnapAPI rotating proxy |
| `blockResources` | `boolean` | Block images/fonts |
| `locale` | `string` | Browser locale |

---

### `client.extract(options)`

Extract specific content types from a page.

```typescript
const result = await client.extract({
  url: 'https://example.com/blog/post',
  type: 'article',    // 'html'|'text'|'markdown'|'article'|'links'|'images'|'metadata'|'structured'
  cleanOutput: true,
  maxLength: 10000,
});

console.log(result.data);
```

---

### `client.analyze(options)`  *(BYOK)*

Analyze a page with an LLM using your own API key.

```typescript
const result = await client.analyze({
  url: 'https://example.com/pricing',
  prompt: 'List all pricing tiers and their features as JSON.',
  provider: 'openai',              // 'openai' | 'anthropic'
  apiKey: process.env.OPENAI_KEY!, // your LLM key
  jsonSchema: {
    type: 'object',
    properties: { tiers: { type: 'array' } },
  },
  includeScreenshot: true,
});

console.log(result.analysis);
```

---

### `client.storage`

Manage files stored by SnapAPI.

```typescript
// List files
const { files } = await client.storage.listFiles(50, 0);

// Get one file
const file = await client.storage.getFile('file_id');
console.log(file.url);

// Delete a file
await client.storage.deleteFile('file_id');

// Check usage
const usage = await client.storage.getUsage();
console.log(`${usage.usedFormatted} / ${usage.limitFormatted}`);

// Configure your own S3 bucket
await client.storage.configureS3({
  s3_bucket: 'my-bucket',
  s3_region: 'us-east-1',
  s3_access_key_id: 'AKIA...',
  s3_secret_access_key: 'secret',
  s3_endpoint: 'https://s3.example.com', // optional
});

// Test the S3 connection
const test = await client.storage.testS3();
console.log(test.success);
```

---

### `client.scheduled`

Schedule recurring screenshots.

```typescript
// Create a scheduled job (every day at 09:00 UTC)
const job = await client.scheduled.create({
  url: 'https://example.com',
  cronExpression: '0 9 * * *',
  format: 'png',
  fullPage: true,
  webhookUrl: 'https://my.app/hooks/snapapi',
});
console.log(job.id, job.nextRun);

// List all jobs
const jobs = await client.scheduled.list();

// Delete a job
await client.scheduled.delete(job.id);
```

---

### `client.webhooks`

Register endpoints to receive async events.

```typescript
// Register a webhook
const wh = await client.webhooks.create({
  url: 'https://my.app/hooks/snapapi',
  events: ['screenshot.done'],
  secret: 'my-signing-secret',
});

// List webhooks
const list = await client.webhooks.list();

// Delete
await client.webhooks.delete(wh.id);
```

---

### `client.keys`

Manage API keys programmatically.

```typescript
// List (values are masked)
const keys = await client.keys.list();

// Create – the full key is returned only once
const newKey = await client.keys.create('my-production-key');
console.log(newKey.key); // store this securely!

// Delete
await client.keys.delete(newKey.id);
```

---

## Error Handling

```typescript
import SnapAPI, { SnapAPIError } from '@snapapi/sdk';

try {
  await client.screenshot({ url: 'https://example.com' });
} catch (err) {
  if (err instanceof SnapAPIError) {
    console.error(err.code, err.statusCode, err.message);
  }
}
```

---

## TypeScript

All options and responses are fully typed. Import types directly:

```typescript
import type {
  ScreenshotOptions,
  ScrapeOptions,
  ExtractOptions,
  AnalyzeOptions,
  StorageFile,
  StorageUsage,
  ScheduledScreenshot,
  Webhook,
  ApiKey,
} from '@snapapi/sdk';
```

---

## Links

- 🌐 [snapapi.pics](https://snapapi.pics)
- 📖 [API Documentation](https://snapapi.pics/docs)
- 🐛 [Issues](https://github.com/Sleywill/snapapi-js/issues)
- 🐍 [Python SDK](https://github.com/Sleywill/snapapi-python)

## License

MIT
