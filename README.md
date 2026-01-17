# @snapapi/sdk

Official JavaScript/TypeScript SDK for [SnapAPI](https://snapapi.dev) - Lightning-fast screenshot API for developers.

## Installation

```bash
npm install @snapapi/sdk
# or
yarn add @snapapi/sdk
# or
pnpm add @snapapi/sdk
```

## Quick Start

```typescript
import { SnapAPI } from '@snapapi/sdk';

const client = new SnapAPI({ apiKey: 'sk_live_xxx' });

// Capture a screenshot
const screenshot = await client.screenshot({
  url: 'https://example.com',
  format: 'png',
  width: 1920,
  height: 1080
});

// Save to file (Node.js)
import fs from 'fs';
fs.writeFileSync('screenshot.png', screenshot);
```

## Usage Examples

### Basic Screenshot

```typescript
const screenshot = await client.screenshot({
  url: 'https://example.com'
});
```

### Full Page Screenshot

```typescript
const screenshot = await client.screenshot({
  url: 'https://example.com',
  fullPage: true,
  format: 'png'
});
```

### Mobile Screenshot

```typescript
const screenshot = await client.screenshot({
  url: 'https://example.com',
  width: 375,
  height: 812,
  mobile: true,
  scale: 3 // Retina
});
```

### Dark Mode

```typescript
const screenshot = await client.screenshot({
  url: 'https://example.com',
  darkMode: true
});
```

### PDF Export

```typescript
const pdf = await client.screenshot({
  url: 'https://example.com',
  format: 'pdf',
  fullPage: true
});

fs.writeFileSync('document.pdf', pdf);
```

### Block Ads & Cookies

```typescript
const screenshot = await client.screenshot({
  url: 'https://example.com',
  blockAds: true,
  hideCookieBanners: true
});
```

### Custom JavaScript Execution

```typescript
const screenshot = await client.screenshot({
  url: 'https://example.com',
  javascript: `
    document.querySelector('.popup')?.remove();
    document.body.style.background = 'white';
  `,
  delay: 1000
});
```

### With Cookies (Authenticated Pages)

```typescript
const screenshot = await client.screenshot({
  url: 'https://example.com/dashboard',
  cookies: [
    {
      name: 'session',
      value: 'abc123',
      domain: 'example.com'
    }
  ]
});
```

### Get JSON Response with Metadata

```typescript
const result = await client.screenshot({
  url: 'https://example.com',
  responseType: 'json'
});

console.log(result.width);     // 1920
console.log(result.height);    // 1080
console.log(result.fileSize);  // 45321
console.log(result.duration);  // 523
console.log(result.data);      // base64 encoded image
```

### Batch Screenshots

```typescript
const batch = await client.batch({
  urls: [
    'https://example.com',
    'https://example.org',
    'https://example.net'
  ],
  format: 'png',
  webhookUrl: 'https://your-server.com/webhook'
});

console.log(batch.jobId); // 'job_abc123'

// Check status later
const status = await client.getBatchStatus(batch.jobId);
if (status.status === 'completed') {
  console.log(status.results);
}
```

## Configuration Options

### Client Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | string | *required* | Your API key |
| `baseUrl` | string | `https://api.snapapi.dev` | API base URL |
| `timeout` | number | `60000` | Request timeout in ms |

### Screenshot Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `url` | string | *required* | URL to capture |
| `format` | string | `'png'` | `'png'`, `'jpeg'`, `'webp'`, `'pdf'` |
| `width` | number | `1920` | Viewport width (100-3840) |
| `height` | number | `1080` | Viewport height (100-2160) |
| `fullPage` | boolean | `false` | Capture full scrollable page |
| `quality` | number | `80` | Image quality 1-100 (JPEG/WebP) |
| `scale` | number | `1` | Device scale factor 0.5-3 |
| `delay` | number | `0` | Delay before capture (0-10000ms) |
| `timeout` | number | `30000` | Max wait time (1000-60000ms) |
| `darkMode` | boolean | `false` | Emulate dark mode |
| `mobile` | boolean | `false` | Emulate mobile device |
| `selector` | string | - | CSS selector for element capture |
| `waitForSelector` | string | - | Wait for element before capture |
| `javascript` | string | - | JS to execute before capture |
| `blockAds` | boolean | `false` | Block ads and trackers |
| `hideCookieBanners` | boolean | `false` | Hide cookie banners |
| `cookies` | Cookie[] | - | Cookies to set |
| `headers` | object | - | Custom HTTP headers |
| `responseType` | string | `'binary'` | `'binary'`, `'base64'`, `'json'` |

## Error Handling

```typescript
import { SnapAPI, SnapAPIError } from '@snapapi/sdk';

try {
  await client.screenshot({ url: 'invalid-url' });
} catch (error) {
  if (error instanceof SnapAPIError) {
    console.log(error.code);       // 'INVALID_URL'
    console.log(error.statusCode); // 400
    console.log(error.message);    // 'The provided URL is not valid'
    console.log(error.details);    // { url: 'invalid-url' }
  }
}
```

### Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `INVALID_URL` | 400 | URL is malformed or not accessible |
| `INVALID_PARAMS` | 400 | One or more parameters are invalid |
| `UNAUTHORIZED` | 401 | Missing or invalid API key |
| `FORBIDDEN` | 403 | API key doesn't have permission |
| `QUOTA_EXCEEDED` | 429 | Monthly quota exceeded |
| `RATE_LIMITED` | 429 | Too many requests |
| `TIMEOUT` | 504 | Page took too long to load |
| `CAPTURE_FAILED` | 500 | Screenshot capture failed |

## TypeScript Support

This SDK is written in TypeScript and includes full type definitions:

```typescript
import { SnapAPI, ScreenshotOptions, ScreenshotResult } from '@snapapi/sdk';

const options: ScreenshotOptions = {
  url: 'https://example.com',
  format: 'png',
  width: 1920,
  height: 1080
};

const result: ScreenshotResult = await client.screenshot({
  ...options,
  responseType: 'json'
});
```

## License

MIT
