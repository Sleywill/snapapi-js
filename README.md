# SnapAPI JavaScript / TypeScript SDK

Official JavaScript / TypeScript SDK for [SnapAPI](https://snapapi.pics) -- the lightning-fast screenshot, scrape, extract, PDF, video, and AI-analyze API.

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

const snap = new SnapAPI({ apiKey: 'sk_live_...' });

// Take a screenshot
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
- Request/response interceptors for logging and analytics
- Configurable timeouts (per-client)
- All SnapAPI endpoints: screenshot, scrape, extract, PDF, video, OG image, analyze
- Storage, scheduled jobs, webhooks, and API key management
- Custom error classes with machine-readable codes

## Configuration

```typescript
const snap = new SnapAPI({
  apiKey: 'sk_live_...',         // Required
  baseUrl: 'https://snapapi.pics', // Default
  timeout: 60_000,                 // 60s default
  maxRetries: 3,                   // Auto-retry on 429 / 5xx
  retryDelay: 500,                 // Initial backoff in ms (doubles each retry)

  // Interceptors
  onRequest: (url, init) => {
    console.log(`-> ${init.method ?? 'GET'} ${url}`);
  },
  onResponse: (status, response) => {
    console.log(`<- ${status}`);
  },
});
```

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
});

// Custom viewport (mobile)
const buf = await snap.screenshot({
  url: 'https://example.com',
  device: 'iphone-15-pro',
});

// From raw HTML
const buf = await snap.screenshot({
  html: '<h1 style="color: red;">Hello World</h1>',
  width: 800,
  height: 600,
});

// Store in SnapAPI cloud (returns URL instead of binary)
const { id, url } = await snap.screenshot({
  url: 'https://example.com',
  storage: { destination: 'snapapi' },
}) as ScreenshotStorageResult;

// Save directly to file
await snap.screenshotToFile('https://example.com', './output/shot.png');
await snap.screenshotToFile('https://example.com', './output/full.webp', {
  format: 'webp',
  fullPage: true,
});
```

**All screenshot options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `url` | `string` | -- | URL to capture |
| `html` | `string` | -- | Raw HTML to render |
| `markdown` | `string` | -- | Markdown to render |
| `format` | `'png' \| 'jpeg' \| 'webp' \| 'avif' \| 'pdf'` | `'png'` | Output format |
| `quality` | `number` | -- | JPEG/WebP quality 1-100 |
| `device` | `DevicePreset` | -- | Named device preset |
| `width` | `number` | `1280` | Viewport width |
| `height` | `number` | `800` | Viewport height |
| `deviceScaleFactor` | `number` | `1` | Pixel ratio 1-3 |
| `fullPage` | `boolean` | `false` | Capture full scrollable page |
| `selector` | `string` | -- | CSS selector to capture |
| `delay` | `number` | `0` | Delay before capture (ms) |
| `waitUntil` | `'load' \| 'domcontentloaded' \| 'networkidle'` | -- | Navigation wait |
| `waitForSelector` | `string` | -- | Wait for element |
| `darkMode` | `boolean` | `false` | Dark color scheme |
| `css` | `string` | -- | Custom CSS to inject |
| `javascript` | `string` | -- | JS to execute before capture |
| `blockAds` | `boolean` | `false` | Block ad networks |
| `blockCookieBanners` | `boolean` | `false` | Block consent popups |
| `blockTrackers` | `boolean` | `false` | Block tracking scripts |
| `blockChatWidgets` | `boolean` | `false` | Block chat widgets |
| `userAgent` | `string` | -- | Custom User-Agent |
| `extraHeaders` | `Record<string, string>` | -- | Extra HTTP headers |
| `cookies` | `Cookie[]` | -- | Cookies to inject |
| `proxy` | `ProxyConfig` | -- | Custom proxy |
| `premiumProxy` | `boolean` | -- | Use SnapAPI rotating proxy |
| `storage` | `StorageDestinationConfig` | -- | Cloud storage config |
| `webhookUrl` | `string` | -- | Async delivery URL |

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
  console.log(`Page ${page.page}: ${page.data.substring(0, 100)}...`);
}
```

### Extract

Extract structured content -- markdown, text, article, links, images, or metadata.

```typescript
const result = await snap.extract({
  url: 'https://example.com/blog/post',
  type: 'markdown',
  cleanOutput: true,
  includeImages: false,
});

console.log(result.data); // Clean markdown content
```

### PDF

Convert URLs or HTML to PDF documents.

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
await snap.pdfToFile('https://example.com', './output.pdf');
```

### Video

Record a video of a live webpage.

```typescript
const video = await snap.video({
  url: 'https://example.com',
  format: 'mp4',
  duration: 10,
  scrolling: true,
  scrollSpeed: 200,
});
fs.writeFileSync('recording.mp4', video as Buffer);
```

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

### Analyze (AI)

Analyze webpages with an LLM -- bring your own API key.

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

### Usage / Quota

```typescript
const { used, limit, remaining, resetAt } = await snap.getUsage();
console.log(`${used} / ${limit} API calls used (resets ${resetAt})`);
```

### Ping

```typescript
const { status } = await snap.ping();
// { status: 'ok', timestamp: 1710540000000 }
```

## Sub-Namespaces

### Storage

```typescript
// List stored files
const { files } = await snap.storage.listFiles(50, 0);

// Get a specific file
const file = await snap.storage.getFile('file_abc');

// Delete a file
await snap.storage.deleteFile('file_abc');

// Get storage usage
const usage = await snap.storage.getUsage();

// Configure custom S3
await snap.storage.configureS3({
  s3_bucket: 'my-bucket',
  s3_region: 'us-east-1',
  s3_access_key_id: '...',
  s3_secret_access_key: '...',
});
```

### Scheduled Screenshots

```typescript
// Create a scheduled job (runs daily at 9am)
const job = await snap.scheduled.create({
  url: 'https://example.com',
  cronExpression: '0 9 * * *',
  format: 'png',
  webhookUrl: 'https://my-app.com/webhook',
});

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
  secret: 'my-signing-secret',
});

const all = await snap.webhooks.list();
await snap.webhooks.delete(wh.id);
```

### API Keys

```typescript
const { key } = await snap.keys.create('production');
console.log(key); // Full key -- store securely!

const allKeys = await snap.keys.list();
await snap.keys.delete('key_id');
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
} from 'snapapi-js';

try {
  await snap.screenshot({ url: 'https://example.com' });
} catch (err) {
  if (err instanceof AuthenticationError) {
    console.error('Invalid API key. Get yours at https://snapapi.pics');
  } else if (err instanceof RateLimitError) {
    console.error(`Rate limited. Retry after ${err.retryAfter}s`);
  } else if (err instanceof QuotaExceededError) {
    console.error('Quota exceeded. Upgrade at https://snapapi.pics/pricing');
  } else if (err instanceof ValidationError) {
    console.error('Invalid options:', err.fields);
  } else if (err instanceof TimeoutError) {
    console.error('Request timed out');
  } else if (err instanceof SnapAPIError) {
    console.error(`API error [${err.code}]: ${err.message}`);
  }
}
```

## Advanced Usage

### Proxies

```typescript
const buf = await snap.screenshot({
  url: 'https://example.com',
  proxy: {
    server: 'http://proxy.example.com:8080',
    username: 'user',
    password: 'pass',
  },
});

// Or use SnapAPI's built-in rotating proxy
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
  urls.map(url => snap.screenshotToFile(url, `./output/${new URL(url).hostname}.png`))
);

for (const [i, result] of results.entries()) {
  if (result.status === 'fulfilled') {
    console.log(`OK: ${urls[i]}`);
  } else {
    console.error(`FAIL: ${urls[i]} - ${result.reason}`);
  }
}
```

### Monitoring and Alerts

```typescript
import crypto from 'crypto';

async function checkForChanges(url: string, previousHash: string) {
  const buf = await snap.screenshot({ url, fullPage: true });
  const hash = crypto.createHash('sha256').update(buf).digest('hex');

  if (hash !== previousHash) {
    console.log('Page changed!');
  }
  return hash;
}
```

### LLM Data Pipeline

```typescript
// Extract content for LLM processing
const content = await snap.extract({
  url: 'https://example.com/article',
  type: 'markdown',
  cleanOutput: true,
  maxLength: 10000,
});

// Then analyze with AI
const analysis = await snap.analyze({
  url: 'https://example.com/article',
  prompt: 'Summarize the key points and sentiment.',
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY!,
});
```

## TypeScript

All types are exported and available for use.

```typescript
import type {
  SnapAPIConfig,
  ScreenshotOptions,
  ScrapeOptions,
  ExtractOptions,
  AnalyzeOptions,
  AccountUsage,
  ScrapeResult,
  ExtractResult,
  AnalyzeResult,
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
- [GitHub Issues](https://github.com/Sleywill/snapapi-js/issues)
- [Changelog](./CHANGELOG.md)
