# @snapapi/sdk

Official JavaScript/TypeScript SDK for [SnapAPI](https://snapapi.pics) - Lightning-fast screenshot API for developers.

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

### Device Presets

Capture screenshots using pre-configured device settings:

```typescript
// Using device preset
const screenshot = await client.screenshot({
  url: 'https://example.com',
  device: 'iphone-15-pro'
});

// Or use the convenience method
const screenshot = await client.screenshotDevice(
  'https://example.com',
  'ipad-pro-12.9'
);

// Get all available device presets
const { devices, total } = await client.getDevices();
console.log(devices); // Grouped by: desktop, mac, iphone, ipad, android
```

Available device presets:
- **Desktop**: `desktop-1080p`, `desktop-1440p`, `desktop-4k`
- **Mac**: `macbook-pro-13`, `macbook-pro-16`, `imac-24`
- **iPhone**: `iphone-se`, `iphone-12`, `iphone-13`, `iphone-14`, `iphone-14-pro`, `iphone-15`, `iphone-15-pro`, `iphone-15-pro-max`
- **iPad**: `ipad`, `ipad-mini`, `ipad-air`, `ipad-pro-11`, `ipad-pro-12.9`
- **Android**: `pixel-7`, `pixel-8`, `pixel-8-pro`, `samsung-galaxy-s23`, `samsung-galaxy-s24`, `samsung-galaxy-tab-s9`

### Dark Mode

```typescript
const screenshot = await client.screenshot({
  url: 'https://example.com',
  darkMode: true
});
```

### Screenshot from HTML

```typescript
const html = '<html><body><h1>Hello World</h1></body></html>';
const screenshot = await client.screenshotFromHtml(html, {
  width: 800,
  height: 600
});
```

### PDF Export

```typescript
const pdf = await client.pdf({
  url: 'https://example.com',
  pdfOptions: {
    pageSize: 'a4',
    landscape: false,
    marginTop: '20mm',
    marginBottom: '20mm',
    marginLeft: '15mm',
    marginRight: '15mm',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div style="font-size:10px;text-align:center;width:100%;">Header</div>',
    footerTemplate: '<div style="font-size:10px;text-align:center;width:100%;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>'
  }
});

fs.writeFileSync('document.pdf', pdf);
```

### Geolocation Emulation

```typescript
const screenshot = await client.screenshot({
  url: 'https://maps.google.com',
  geolocation: {
    latitude: 48.8566,
    longitude: 2.3522,
    accuracy: 100
  }
});
```

### Timezone & Locale

```typescript
const screenshot = await client.screenshot({
  url: 'https://example.com',
  timezone: 'America/New_York',
  locale: 'en-US'
});
```

### Proxy Support

```typescript
const screenshot = await client.screenshot({
  url: 'https://example.com',
  proxy: {
    server: 'http://proxy.example.com:8080',
    username: 'user',
    password: 'pass'
  }
});
```

### Hide Elements

```typescript
const screenshot = await client.screenshot({
  url: 'https://example.com',
  hideSelectors: [
    '.cookie-banner',
    '#popup-modal',
    '.advertisement'
  ]
});
```

### Click Before Screenshot

```typescript
const screenshot = await client.screenshot({
  url: 'https://example.com',
  clickSelector: '.accept-cookies-button',
  clickDelay: 500, // Wait 500ms after clicking
  delay: 1000 // Then wait another 1s before screenshot
});
```

### Block Ads, Trackers, Chat Widgets

```typescript
const screenshot = await client.screenshot({
  url: 'https://example.com',
  blockAds: true,
  blockTrackers: true,
  blockCookieBanners: true,
  blockChatWidgets: true // Blocks Intercom, Drift, Zendesk, etc.
});
```

### Thumbnail Generation

```typescript
const result = await client.screenshot({
  url: 'https://example.com',
  thumbnail: {
    enabled: true,
    width: 300,
    height: 200,
    fit: 'cover' // 'cover', 'contain', or 'fill'
  },
  responseType: 'json'
});

// Access both full image and thumbnail
const fullImage = Buffer.from(result.data, 'base64');
const thumbnail = Buffer.from(result.thumbnail, 'base64');
```

### Fail on HTTP Errors

```typescript
try {
  const screenshot = await client.screenshot({
    url: 'https://example.com/404-page',
    failOnHttpError: true // Will throw if page returns 4xx or 5xx
  });
} catch (error) {
  console.log('Page returned HTTP error');
}
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

### Custom CSS

```typescript
const screenshot = await client.screenshot({
  url: 'https://example.com',
  css: `
    body { background: #f0f0f0 !important; }
    .ads, .banner { display: none !important; }
  `
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

### HTTP Basic Authentication

```typescript
const screenshot = await client.screenshot({
  url: 'https://example.com/protected',
  httpAuth: {
    username: 'user',
    password: 'pass'
  }
});
```

### Element Screenshot with Clipping

```typescript
// Capture specific element
const screenshot = await client.screenshot({
  url: 'https://example.com',
  selector: '.hero-section'
});

// Or use manual clipping
const screenshot = await client.screenshot({
  url: 'https://example.com',
  clipX: 100,
  clipY: 100,
  clipWidth: 500,
  clipHeight: 300
});
```

### Extract Metadata

```typescript
const result = await client.screenshot({
  url: 'https://example.com',
  responseType: 'json',
  includeMetadata: true,
  extractMetadata: {
    fonts: true,
    colors: true,
    links: true,
    httpStatusCode: true
  }
});

console.log('Title:', result.metadata.title);
console.log('HTTP Status:', result.metadata.httpStatusCode);
console.log('Fonts:', result.metadata.fonts); // List of fonts used
console.log('Colors:', result.metadata.colors); // Dominant colors
console.log('Links:', result.metadata.links); // All links on page
```

### Get JSON Response with Metadata

```typescript
const result = await client.screenshot({
  url: 'https://example.com',
  responseType: 'json',
  includeMetadata: true
});

console.log(result.width);     // 1920
console.log(result.height);    // 1080
console.log(result.fileSize);  // 45321
console.log(result.took);      // 523 (milliseconds)
console.log(result.data);      // base64 encoded image
console.log(result.metadata);  // Page metadata
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

console.log(batch.jobId); // 'batch_abc123'

// Check status later
const status = await client.getBatchStatus(batch.jobId);
if (status.status === 'completed') {
  for (const result of status.results) {
    if (result.status === 'completed') {
      const url = new URL(result.url);
      fs.writeFileSync(
        `${url.hostname}.png`,
        Buffer.from(result.data, 'base64')
      );
    }
  }
}
```

### Screenshot from Markdown

Render Markdown content as a screenshot:

```typescript
const buffer = await client.screenshotFromMarkdown('# Hello World\n\nThis is **bold** text.');
fs.writeFileSync('markdown.png', buffer);

// With additional options
const screenshot = await client.screenshotFromMarkdown(
  '# Report\n\n| Name | Score |\n|------|-------|\n| Alice | 95 |',
  { width: 800, height: 600, darkMode: true }
);
```

Or pass markdown directly to the screenshot method:

```typescript
const screenshot = await client.screenshot({
  markdown: '# Hello World',
  format: 'png',
  width: 1280
});
```

### Extract Content

Extract content from any webpage in various formats:

```typescript
// Extract as Markdown
const markdown = await client.extractMarkdown('https://example.com/blog-post');
console.log(markdown.content);

// Extract article content (strips navigation, ads, etc.)
const article = await client.extractArticle('https://example.com/news/story');
console.log(article.title);
console.log(article.content);

// Extract plain text
const text = await client.extractText('https://example.com');
console.log(text.content);

// Extract all links
const links = await client.extractLinks('https://example.com');
for (const link of links.links!) {
  console.log(`${link.text}: ${link.href}`);
}

// Extract all images
const images = await client.extractImages('https://example.com');
for (const img of images.images!) {
  console.log(`${img.alt}: ${img.src}`);
}

// Extract structured data (JSON-LD, microdata)
const structured = await client.extractStructured('https://example.com/product');
console.log(structured.structured);

// Extract page metadata
const meta = await client.extractMetadata('https://example.com');
console.log(meta.metadata);
```

Use the full `extract()` method for advanced options:

```typescript
const result = await client.extract({
  url: 'https://example.com/article',
  type: 'markdown',
  selector: '.article-body',
  cleanOutput: true,
  blockAds: true,
  blockCookieBanners: true,
  maxLength: 5000,
  includeImages: true
});

console.log(result.content);
console.log(`Extracted ${result.contentLength} characters in ${result.took}ms`);
```

### Analyze with AI

Analyze webpage content using AI providers:

```typescript
// Summarize a page with OpenAI
const summary = await client.analyze({
  url: 'https://example.com/article',
  prompt: 'Summarize the main points of this article in 3 bullet points',
  provider: 'openai',
  apiKey: 'sk-...'
});
console.log(summary.result);

// Analyze with Anthropic Claude
const analysis = await client.analyze({
  url: 'https://example.com/product',
  prompt: 'Extract the product name, price, and key features',
  provider: 'anthropic',
  apiKey: 'sk-ant-...',
  model: 'claude-sonnet-4-20250514'
});
console.log(analysis.result);

// Get structured JSON output
const data = await client.analyze({
  url: 'https://example.com/contact',
  prompt: 'Extract all contact information from this page',
  provider: 'openai',
  apiKey: 'sk-...',
  jsonSchema: {
    type: 'object',
    properties: {
      email: { type: 'string' },
      phone: { type: 'string' },
      address: { type: 'string' }
    }
  },
  includeScreenshot: true,
  includeMetadata: true
});
console.log(data.structured);
console.log(`Tokens used: ${data.usage?.totalTokens}`);
```

### Get API Capabilities

```typescript
const { capabilities } = await client.getCapabilities();
console.log(capabilities.features);
```

## Configuration Options

### Client Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | string | *required* | Your API key |
| `baseUrl` | string | `https://api.snapapi.pics` | API base URL |
| `timeout` | number | `60000` | Request timeout in ms |

### Screenshot Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `url` | string | - | URL to capture (required if no html/markdown) |
| `html` | string | - | HTML content to render (required if no url/markdown) |
| `markdown` | string | - | Markdown content to render (required if no url/html) |
| `format` | string | `'png'` | `'png'`, `'jpeg'`, `'webp'`, `'avif'`, `'pdf'` |
| `quality` | number | `80` | Image quality 1-100 (JPEG/WebP) |
| `device` | string | - | Device preset name |
| `width` | number | `1280` | Viewport width (100-3840) |
| `height` | number | `800` | Viewport height (100-2160) |
| `deviceScaleFactor` | number | `1` | Device pixel ratio (1-3) |
| `isMobile` | boolean | `false` | Emulate mobile device |
| `hasTouch` | boolean | `false` | Enable touch events |
| `isLandscape` | boolean | `false` | Landscape orientation |
| `fullPage` | boolean | `false` | Capture full scrollable page |
| `fullPageScrollDelay` | number | `400` | Delay between scroll steps (ms) |
| `fullPageMaxHeight` | number | - | Max height for full page (px) |
| `selector` | string | - | CSS selector for element capture |
| `clipX`, `clipY` | number | - | Clip region position |
| `clipWidth`, `clipHeight` | number | - | Clip region size |
| `delay` | number | `0` | Delay before capture (0-30000ms) |
| `timeout` | number | `30000` | Max wait time (1000-60000ms) |
| `waitUntil` | string | `'load'` | `'load'`, `'domcontentloaded'`, `'networkidle'` |
| `waitForSelector` | string | - | Wait for element before capture |
| `darkMode` | boolean | `false` | Emulate dark mode |
| `reducedMotion` | boolean | `false` | Reduce animations |
| `css` | string | - | Custom CSS to inject |
| `javascript` | string | - | JS to execute before capture |
| `hideSelectors` | string[] | - | CSS selectors to hide |
| `clickSelector` | string | - | Element to click before capture |
| `clickDelay` | number | - | Delay after click (ms) |
| `blockAds` | boolean | `false` | Block ads |
| `blockTrackers` | boolean | `false` | Block trackers |
| `blockCookieBanners` | boolean | `false` | Hide cookie banners |
| `blockChatWidgets` | boolean | `false` | Block chat widgets |
| `blockResources` | string[] | - | Resource types to block |
| `userAgent` | string | - | Custom User-Agent |
| `extraHeaders` | object | - | Custom HTTP headers |
| `cookies` | Cookie[] | - | Cookies to set |
| `httpAuth` | object | - | HTTP basic auth credentials |
| `proxy` | object | - | Proxy configuration |
| `geolocation` | object | - | Geolocation coordinates |
| `timezone` | string | - | Timezone (e.g., 'America/New_York') |
| `locale` | string | - | Locale (e.g., 'en-US') |
| `pdfOptions` | object | - | PDF generation options |
| `thumbnail` | object | - | Thumbnail generation options |
| `failOnHttpError` | boolean | `false` | Fail on 4xx/5xx responses |
| `cache` | boolean | `false` | Enable caching |
| `cacheTtl` | number | `86400` | Cache TTL in seconds |
| `responseType` | string | `'binary'` | `'binary'`, `'base64'`, `'json'` |
| `includeMetadata` | boolean | `false` | Include page metadata |
| `extractMetadata` | object | - | Additional metadata to extract |

### PDF Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `pageSize` | string | `'a4'` | `'a4'`, `'a3'`, `'a5'`, `'letter'`, `'legal'`, `'tabloid'`, `'custom'` |
| `width` | string | - | Custom width (e.g., '210mm') |
| `height` | string | - | Custom height (e.g., '297mm') |
| `landscape` | boolean | `false` | Landscape orientation |
| `marginTop` | string | - | Top margin (e.g., '20mm') |
| `marginRight` | string | - | Right margin |
| `marginBottom` | string | - | Bottom margin |
| `marginLeft` | string | - | Left margin |
| `printBackground` | boolean | `true` | Print background graphics |
| `headerTemplate` | string | - | HTML template for header |
| `footerTemplate` | string | - | HTML template for footer |
| `displayHeaderFooter` | boolean | `false` | Show header/footer |
| `scale` | number | `1` | Scale (0.1-2) |
| `pageRanges` | string | - | Page ranges (e.g., '1-5') |
| `preferCSSPageSize` | boolean | `false` | Use CSS page size |

### Extract Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `url` | string | *required* | URL to extract content from |
| `type` | string | *required* | `'markdown'`, `'text'`, `'html'`, `'article'`, `'structured'`, `'links'`, `'images'`, `'metadata'` |
| `selector` | string | - | CSS selector to extract from specific element |
| `waitFor` | string | - | Wait for a selector before extracting |
| `timeout` | number | `30000` | Max wait time in ms |
| `darkMode` | boolean | `false` | Emulate dark mode |
| `blockAds` | boolean | `false` | Block ads |
| `blockCookieBanners` | boolean | `false` | Block cookie banners |
| `includeImages` | boolean | `false` | Include images in extracted content |
| `maxLength` | number | - | Maximum content length |
| `cleanOutput` | boolean | `false` | Clean output by removing boilerplate |

### Analyze Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `url` | string | *required* | URL to analyze |
| `prompt` | string | *required* | Prompt describing what to analyze |
| `provider` | string | *required* | `'openai'` or `'anthropic'` |
| `apiKey` | string | *required* | Your AI provider API key |
| `model` | string | - | AI model (uses provider default) |
| `jsonSchema` | object | - | JSON schema for structured output |
| `timeout` | number | `30000` | Max wait time in ms |
| `waitFor` | string | - | Wait for a selector before analyzing |
| `blockAds` | boolean | `false` | Block ads |
| `blockCookieBanners` | boolean | `false` | Block cookie banners |
| `includeScreenshot` | boolean | `false` | Include screenshot in analysis context |
| `includeMetadata` | boolean | `false` | Include page metadata in analysis context |
| `maxContentLength` | number | - | Maximum content length sent to AI |

## Error Handling

```typescript
import { SnapAPI, SnapAPIError } from '@snapapi/sdk';

try {
  await client.screenshot({ url: 'invalid-url' });
} catch (error) {
  if ((error as SnapAPIError).code) {
    const apiError = error as SnapAPIError;
    console.log(apiError.code);       // 'INVALID_URL'
    console.log(apiError.statusCode); // 400
    console.log(apiError.message);    // 'The provided URL is not valid'
    console.log(apiError.details);    // { url: 'invalid-url' }
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
| `HTTP_ERROR` | varies | Page returned HTTP error (with failOnHttpError) |

## TypeScript Support

This SDK is written in TypeScript and includes full type definitions:

```typescript
import {
  SnapAPI,
  ScreenshotOptions,
  ScreenshotResult,
  DevicePreset,
  PdfOptions,
  BatchOptions,
  BatchResult,
  ExtractOptions,
  ExtractResult,
  AnalyzeOptions,
  AnalyzeResult
} from '@snapapi/sdk';

const options: ScreenshotOptions = {
  url: 'https://example.com',
  device: 'iphone-15-pro' as DevicePreset,
  responseType: 'json'
};

const result: ScreenshotResult = await client.screenshot(options) as ScreenshotResult;
```

## License

MIT
