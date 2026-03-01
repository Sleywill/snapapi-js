/**
 * SnapAPI JavaScript/TypeScript SDK v2.0.0
 * Lightning-fast screenshot, scrape, extract, analyze API for developers
 *
 * @packageDocumentation
 */

// ─────────────────────────────────────────────
// Core / Shared Types
// ─────────────────────────────────────────────

export type DevicePreset =
  | 'desktop-1080p' | 'desktop-1440p' | 'desktop-4k'
  | 'macbook-pro-13' | 'macbook-pro-16' | 'imac-24'
  | 'iphone-se' | 'iphone-12' | 'iphone-13' | 'iphone-14' | 'iphone-14-pro'
  | 'iphone-15' | 'iphone-15-pro' | 'iphone-15-pro-max'
  | 'ipad' | 'ipad-mini' | 'ipad-air' | 'ipad-pro-11' | 'ipad-pro-12.9'
  | 'pixel-7' | 'pixel-8' | 'pixel-8-pro'
  | 'samsung-galaxy-s23' | 'samsung-galaxy-s24' | 'samsung-galaxy-tab-s9';

export interface Cookie {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  expires?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

export interface HttpAuth {
  username: string;
  password: string;
}

export interface ProxyConfig {
  server: string;
  username?: string;
  password?: string;
}

export interface Geolocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface PdfMargins {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
}

// ─────────────────────────────────────────────
// Screenshot Types
// ─────────────────────────────────────────────

export interface StorageDestination {
  /** Where to store the file: SnapAPI cloud or your own S3 */
  destination: 'snapapi' | 'user_s3';
  /** Override format for stored file */
  format?: 'png' | 'jpeg' | 'webp' | 'avif' | 'pdf';
}

export interface ScreenshotOptions {
  /** URL to capture */
  url?: string;
  /** Raw HTML to render */
  html?: string;
  /** Markdown to render */
  markdown?: string;
  /** Output format */
  format?: 'png' | 'jpeg' | 'webp' | 'avif' | 'pdf';
  /** Image quality 1-100 (JPEG/WebP only) */
  quality?: number;
  /** Device preset (overrides width/height/scale) */
  device?: DevicePreset;
  /** Viewport width in pixels (100-3840) */
  width?: number;
  /** Viewport height in pixels (100-2160) */
  height?: number;
  /** Device scale factor (1-3) */
  deviceScaleFactor?: number;
  /** Emulate mobile device */
  isMobile?: boolean;
  /** Enable touch events */
  hasTouch?: boolean;
  /** Capture full scrollable page */
  fullPage?: boolean;
  /** Delay between scroll steps for full page (ms) */
  fullPageScrollDelay?: number;
  /** Max height for full-page capture (px) */
  fullPageMaxHeight?: number;
  /** CSS selector – capture only that element */
  selector?: string;
  /** Delay before capture (0-30000 ms) */
  delay?: number;
  /** Navigation timeout (ms) */
  timeout?: number;
  /** Wait until browser event */
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle';
  /** Wait for element before capture */
  waitForSelector?: string;
  /** Emulate dark colour scheme */
  darkMode?: boolean;
  /** Reduce animations */
  reducedMotion?: boolean;
  /** CSS to inject into the page */
  css?: string;
  /** JavaScript to execute before capture */
  javascript?: string;
  /** CSS selectors to hide (visibility: hidden) */
  hideSelectors?: string[];
  /** CSS selector to click before capture */
  clickSelector?: string;
  /** Block ad networks */
  blockAds?: boolean;
  /** Block third-party trackers */
  blockTrackers?: boolean;
  /** Block cookie consent banners */
  blockCookieBanners?: boolean;
  /** Block chat widgets (Intercom, Drift, Zendesk…) */
  blockChatWidgets?: boolean;
  /** Custom User-Agent string */
  userAgent?: string;
  /** Extra HTTP request headers */
  extraHeaders?: Record<string, string>;
  /** Cookies to inject */
  cookies?: Cookie[];
  /** HTTP Basic Auth credentials */
  httpAuth?: HttpAuth;
  /** Proxy configuration */
  proxy?: ProxyConfig;
  /** Use SnapAPI premium rotating proxy */
  premiumProxy?: boolean;
  /** Emulate geolocation */
  geolocation?: Geolocation;
  /** Timezone (e.g. 'America/New_York') */
  timezone?: string;
  /** PDF page size */
  pageSize?: 'a4' | 'a3' | 'a5' | 'letter' | 'legal' | 'tabloid';
  /** PDF landscape mode */
  landscape?: boolean;
  /** PDF margins */
  margins?: PdfMargins;
  /** HTML template for PDF header */
  headerTemplate?: string;
  /** HTML template for PDF footer */
  footerTemplate?: string;
  /** Show PDF header/footer */
  displayHeaderFooter?: boolean;
  /** PDF content scale (0.1-2) */
  scale?: number;
  /** Store result in cloud storage instead of returning binary */
  storage?: StorageDestination;
  /** Async delivery via webhook; returns {jobId, status:'queued'} */
  webhookUrl?: string;
  /** Poll a previously queued async job */
  jobId?: string;
}

export interface ScreenshotStorageResult {
  id: string;
  url: string;
}

export interface ScreenshotQueuedResult {
  jobId: string;
  status: 'queued';
}

// ─────────────────────────────────────────────
// Scrape Types
// ─────────────────────────────────────────────

export interface ScrapeOptions {
  /** URL to scrape (required) */
  url: string;
  /** Content type to return */
  type?: 'text' | 'html' | 'links';
  /** Number of pages to scrape (1-10) */
  pages?: number;
  /** Wait time after page load (0-30000 ms) */
  waitMs?: number;
  /** Proxy URL e.g. "http://user:pass@host:port" */
  proxy?: string;
  /** Use SnapAPI premium rotating proxy */
  premiumProxy?: boolean;
  /** Block images/fonts/media to save bandwidth */
  blockResources?: boolean;
  /** Browser locale e.g. 'en-US' */
  locale?: string;
}

export interface ScrapePageResult {
  page: number;
  url: string;
  data: string;
}

export interface ScrapeResult {
  success: true;
  results: ScrapePageResult[];
}

// ─────────────────────────────────────────────
// Extract Types
// ─────────────────────────────────────────────

export interface ExtractOptions {
  /** URL to extract content from (required) */
  url: string;
  /** Extraction type */
  type?: 'html' | 'text' | 'markdown' | 'article' | 'links' | 'images' | 'metadata' | 'structured';
  /** CSS selector to scope extraction */
  selector?: string;
  /** Wait for selector/event before extracting */
  waitFor?: string;
  /** Navigation timeout (ms) */
  timeout?: number;
  /** Emulate dark mode */
  darkMode?: boolean;
  /** Block ad networks */
  blockAds?: boolean;
  /** Block cookie consent banners */
  blockCookieBanners?: boolean;
  /** Include image URLs in output */
  includeImages?: boolean;
  /** Truncate output at this many characters */
  maxLength?: number;
  /** Strip boilerplate/navigation from output */
  cleanOutput?: boolean;
}

export interface ExtractResult {
  success: true;
  type: string;
  url: string;
  data: unknown;
  responseTime: number;
}

// ─────────────────────────────────────────────
// Analyze Types
// ─────────────────────────────────────────────

export interface AnalyzeOptions {
  /** URL to analyze (required) */
  url: string;
  /** Prompt describing what to analyze (required) */
  prompt: string;
  /** LLM provider (required) */
  provider: 'openai' | 'anthropic';
  /** Your LLM provider API key (required – BYOK) */
  apiKey: string;
  /** Override model (optional) */
  model?: string;
  /** JSON schema for structured output */
  jsonSchema?: Record<string, unknown>;
  /** Include a screenshot in the analysis context */
  includeScreenshot?: boolean;
  /** Include page metadata in analysis context */
  includeMetadata?: boolean;
  /** Truncate content sent to AI */
  maxContentLength?: number;
  /** Navigation timeout (ms) */
  timeout?: number;
  /** Block ad networks */
  blockAds?: boolean;
  /** Block cookie consent banners */
  blockCookieBanners?: boolean;
  /** Wait for selector before analyzing */
  waitFor?: string;
}

export interface AnalyzeResult {
  success: boolean;
  url: string;
  metadata?: Record<string, unknown>;
  analysis: unknown;
  provider: string;
  model: string;
  responseTime: number;
}

// ─────────────────────────────────────────────
// Storage Types
// ─────────────────────────────────────────────

export interface StorageFile {
  id: string;
  url: string;
  filename?: string;
  size?: number;
  format?: string;
  createdAt?: string;
  [key: string]: unknown;
}

export interface StorageListResult {
  files: StorageFile[];
  total?: number;
  limit?: number;
  offset?: number;
}

export interface StorageUsage {
  used: number;
  limit: number;
  percentage: number;
  usedFormatted: string;
  limitFormatted: string;
}

export interface S3Config {
  s3_bucket: string;
  s3_region: string;
  s3_access_key_id: string;
  s3_secret_access_key: string;
  /** Custom S3-compatible endpoint */
  s3_endpoint?: string;
}

export interface S3TestResult {
  success: boolean;
  message?: string;
}

// ─────────────────────────────────────────────
// Scheduled Screenshot Types
// ─────────────────────────────────────────────

export interface CreateScheduledOptions {
  /** URL to capture on schedule (required) */
  url: string;
  /** Cron expression e.g. '0 9 * * 1' (required) */
  cronExpression: string;
  /** Output format */
  format?: 'png' | 'jpeg' | 'webp' | 'avif' | 'pdf';
  /** Viewport width */
  width?: number;
  /** Viewport height */
  height?: number;
  /** Capture full page */
  fullPage?: boolean;
  /** Webhook URL for delivery */
  webhookUrl?: string;
}

export interface ScheduledScreenshot {
  id: string;
  url: string;
  cronExpression: string;
  nextRun?: string;
  format?: string;
  width?: number;
  height?: number;
  fullPage?: boolean;
  webhookUrl?: string;
  createdAt?: string;
  [key: string]: unknown;
}

export interface DeleteResult {
  success: boolean;
}

// ─────────────────────────────────────────────
// Webhook Types
// ─────────────────────────────────────────────

export interface CreateWebhookOptions {
  /** Endpoint URL to receive events (required) */
  url: string;
  /** Events to subscribe to (required) */
  events: string[];
  /** Optional signing secret */
  secret?: string;
}

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  secret?: string;
  createdAt?: string;
  [key: string]: unknown;
}

// ─────────────────────────────────────────────
// API Key Types
// ─────────────────────────────────────────────

export interface ApiKey {
  id: string;
  name: string;
  /** Masked key value e.g. sk_live_xxx…xxx */
  key: string;
  createdAt?: string;
  lastUsed?: string;
}

export interface CreateApiKeyResult {
  id: string;
  name: string;
  /** Full key – shown only once */
  key: string;
}

// ─────────────────────────────────────────────
// SDK Config
// ─────────────────────────────────────────────

export interface SnapAPIConfig {
  /** Your SnapAPI key */
  apiKey: string;
  /** Override base URL (default: https://api.snapapi.pics) */
  baseUrl?: string;
  /** Request timeout in ms (default: 60000) */
  timeout?: number;
}

export class SnapAPIError extends Error {
  code: string;
  statusCode: number;
  details?: Record<string, unknown>;

  constructor(message: string, code: string, statusCode: number, details?: Record<string, unknown>) {
    super(message);
    this.name = 'SnapAPIError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

// ─────────────────────────────────────────────
// Sub-namespaces (fluent API style)
// ─────────────────────────────────────────────

class StorageNamespace {
  constructor(private _req: (path: string, init?: RequestInit) => Promise<Response>) {}

  /**
   * List stored files.
   * @param limit  Max results (default 50)
   * @param offset Pagination offset
   */
  async listFiles(limit = 50, offset = 0): Promise<StorageListResult> {
    const res = await this._req(`/v1/storage/files?limit=${limit}&offset=${offset}`);
    return res.json() as Promise<StorageListResult>;
  }

  /**
   * Get metadata / download URL for a stored file.
   */
  async getFile(id: string): Promise<StorageFile> {
    const res = await this._req(`/v1/storage/files/${encodeURIComponent(id)}`);
    return res.json() as Promise<StorageFile>;
  }

  /**
   * Delete a stored file.
   */
  async deleteFile(id: string): Promise<DeleteResult> {
    const res = await this._req(`/v1/storage/files/${encodeURIComponent(id)}`, { method: 'DELETE' });
    return res.json() as Promise<DeleteResult>;
  }

  /**
   * Get current storage usage for this account.
   */
  async getUsage(): Promise<StorageUsage> {
    const res = await this._req('/v1/storage/usage');
    return res.json() as Promise<StorageUsage>;
  }

  /**
   * Configure a custom S3-compatible storage backend.
   */
  async configureS3(config: S3Config): Promise<{ success: boolean }> {
    const res = await this._req('/v1/storage/s3', {
      method: 'POST',
      body: JSON.stringify(config),
    });
    return res.json() as Promise<{ success: boolean }>;
  }

  /**
   * Test the custom S3 connection.
   */
  async testS3(): Promise<S3TestResult> {
    const res = await this._req('/v1/storage/s3/test', { method: 'POST', body: '{}' });
    return res.json() as Promise<S3TestResult>;
  }
}

class ScheduledNamespace {
  constructor(private _req: (path: string, init?: RequestInit) => Promise<Response>) {}

  /**
   * Create a new scheduled screenshot job.
   */
  async create(options: CreateScheduledOptions): Promise<ScheduledScreenshot> {
    const res = await this._req('/v1/scheduled', {
      method: 'POST',
      body: JSON.stringify(options),
    });
    return res.json() as Promise<ScheduledScreenshot>;
  }

  /**
   * List all scheduled screenshot jobs.
   */
  async list(): Promise<ScheduledScreenshot[]> {
    const res = await this._req('/v1/scheduled');
    return res.json() as Promise<ScheduledScreenshot[]>;
  }

  /**
   * Delete a scheduled screenshot job.
   */
  async delete(id: string): Promise<DeleteResult> {
    const res = await this._req(`/v1/scheduled/${encodeURIComponent(id)}`, { method: 'DELETE' });
    return res.json() as Promise<DeleteResult>;
  }
}

class WebhooksNamespace {
  constructor(private _req: (path: string, init?: RequestInit) => Promise<Response>) {}

  /**
   * Register a new webhook endpoint.
   *
   * @example
   * ```ts
   * await client.webhooks.create({
   *   url: 'https://my-app.com/hooks/snapapi',
   *   events: ['screenshot.done'],
   *   secret: 'my-signing-secret',
   * });
   * ```
   */
  async create(options: CreateWebhookOptions): Promise<Webhook> {
    const res = await this._req('/v1/webhooks', {
      method: 'POST',
      body: JSON.stringify(options),
    });
    return res.json() as Promise<Webhook>;
  }

  /**
   * List all registered webhooks.
   */
  async list(): Promise<Webhook[]> {
    const res = await this._req('/v1/webhooks');
    return res.json() as Promise<Webhook[]>;
  }

  /**
   * Delete a webhook.
   */
  async delete(id: string): Promise<DeleteResult> {
    const res = await this._req(`/v1/webhooks/${encodeURIComponent(id)}`, { method: 'DELETE' });
    return res.json() as Promise<DeleteResult>;
  }
}

class KeysNamespace {
  constructor(private _req: (path: string, init?: RequestInit) => Promise<Response>) {}

  /**
   * List all API keys (values are masked).
   */
  async list(): Promise<ApiKey[]> {
    const res = await this._req('/v1/keys');
    return res.json() as Promise<ApiKey[]>;
  }

  /**
   * Create a new API key.
   * The full key is only returned once – store it securely.
   */
  async create(name: string): Promise<CreateApiKeyResult> {
    const res = await this._req('/v1/keys', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
    return res.json() as Promise<CreateApiKeyResult>;
  }

  /**
   * Delete an API key.
   */
  async delete(id: string): Promise<DeleteResult> {
    const res = await this._req(`/v1/keys/${encodeURIComponent(id)}`, { method: 'DELETE' });
    return res.json() as Promise<DeleteResult>;
  }
}

// ─────────────────────────────────────────────
// Main Client
// ─────────────────────────────────────────────

/**
 * SnapAPI Client
 *
 * @example
 * ```typescript
 * import SnapAPI from '@snapapi/sdk';
 *
 * const client = new SnapAPI({ apiKey: 'sk_live_xxx' });
 *
 * // Screenshot → Buffer
 * const buf = await client.screenshot({ url: 'https://example.com' });
 * fs.writeFileSync('shot.png', buf as Buffer);
 *
 * // Scrape page text
 * const { results } = await client.scrape({ url: 'https://example.com' });
 *
 * // Storage management
 * const files = await client.storage.listFiles();
 *
 * // Scheduled shots
 * await client.scheduled.create({ url: 'https://example.com', cronExpression: '0 9 * * *' });
 *
 * // Webhooks
 * await client.webhooks.create({ url: 'https://my.app/hook', events: ['screenshot.done'] });
 *
 * // API keys
 * const keys = await client.keys.list();
 * ```
 */
export class SnapAPI {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;

  /** Storage management namespace */
  public readonly storage: StorageNamespace;
  /** Scheduled screenshots namespace */
  public readonly scheduled: ScheduledNamespace;
  /** Webhooks namespace */
  public readonly webhooks: WebhooksNamespace;
  /** API keys namespace */
  public readonly keys: KeysNamespace;

  constructor(config: SnapAPIConfig) {
    if (!config.apiKey) throw new Error('apiKey is required');
    this.apiKey = config.apiKey;
    this.baseUrl = (config.baseUrl || 'https://api.snapapi.pics').replace(/\/$/, '');
    this.timeout = config.timeout ?? 60_000;

    const bound = this._request.bind(this);
    this.storage = new StorageNamespace(bound);
    this.scheduled = new ScheduledNamespace(bound);
    this.webhooks = new WebhooksNamespace(bound);
    this.keys = new KeysNamespace(bound);
  }

  // ── Screenshot ──────────────────────────────

  /**
   * Capture a screenshot of a URL, HTML snippet, or Markdown string.
   *
   * - Returns `Buffer` when the image/PDF is returned as binary (default).
   * - Returns `{id, url}` when `options.storage` is set.
   * - Returns `{jobId, status}` when `options.webhookUrl` is set (async).
   *
   * @example
   * ```typescript
   * // Basic screenshot
   * const buf = await client.screenshot({ url: 'https://example.com' });
   * fs.writeFileSync('shot.png', buf as Buffer);
   *
   * // Full-page dark-mode WebP
   * const buf2 = await client.screenshot({
   *   url: 'https://example.com',
   *   format: 'webp',
   *   fullPage: true,
   *   darkMode: true,
   * });
   *
   * // Store in SnapAPI cloud and get back a URL
   * const result = await client.screenshot({
   *   url: 'https://example.com',
   *   storage: { destination: 'snapapi' },
   * });
   * console.log((result as ScreenshotStorageResult).url);
   *
   * // Async via webhook
   * const queued = await client.screenshot({
   *   url: 'https://example.com',
   *   webhookUrl: 'https://my.app/hooks/snap',
   * });
   * console.log((queued as ScreenshotQueuedResult).jobId);
   * ```
   */
  async screenshot(
    options: ScreenshotOptions,
  ): Promise<Buffer | ScreenshotStorageResult | ScreenshotQueuedResult> {
    if (!options.url && !options.html && !options.markdown) {
      throw new Error('One of url, html, or markdown is required');
    }

    const res = await this._request('/v1/screenshot', {
      method: 'POST',
      body: JSON.stringify(options),
    });

    // Async / storage mode → JSON response
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      return res.json() as Promise<ScreenshotStorageResult | ScreenshotQueuedResult>;
    }

    return Buffer.from(await res.arrayBuffer());
  }

  // ── Scrape ───────────────────────────────────

  /**
   * Scrape text, HTML, or links from one or more pages.
   *
   * @example
   * ```typescript
   * const { results } = await client.scrape({
   *   url: 'https://news.ycombinator.com',
   *   type: 'links',
   * });
   * results[0].data; // HTML/text/links for page 1
   * ```
   */
  async scrape(options: ScrapeOptions): Promise<ScrapeResult> {
    if (!options.url) throw new Error('url is required');
    const res = await this._request('/v1/scrape', {
      method: 'POST',
      body: JSON.stringify(options),
    });
    return res.json() as Promise<ScrapeResult>;
  }

  // ── Extract ──────────────────────────────────

  /**
   * Extract structured content from a webpage (text, markdown, article, links, images, metadata…).
   *
   * @example
   * ```typescript
   * const result = await client.extract({
   *   url: 'https://example.com/blog/post',
   *   type: 'markdown',
   *   cleanOutput: true,
   * });
   * console.log(result.data);
   * ```
   */
  async extract(options: ExtractOptions): Promise<ExtractResult> {
    if (!options.url) throw new Error('url is required');
    const res = await this._request('/v1/extract', {
      method: 'POST',
      body: JSON.stringify(options),
    });
    return res.json() as Promise<ExtractResult>;
  }

  // ── Analyze ──────────────────────────────────

  /**
   * Analyze a webpage with an LLM (BYOK – bring your own key).
   *
   * @example
   * ```typescript
   * const result = await client.analyze({
   *   url: 'https://example.com',
   *   prompt: 'Summarize the main content of this page in 3 bullet points.',
   *   provider: 'openai',
   *   apiKey: process.env.OPENAI_API_KEY!,
   * });
   * console.log(result.analysis);
   * ```
   */
  async analyze(options: AnalyzeOptions): Promise<AnalyzeResult> {
    if (!options.url) throw new Error('url is required');
    if (!options.prompt) throw new Error('prompt is required');
    if (!options.provider) throw new Error('provider is required');
    if (!options.apiKey) throw new Error('apiKey (LLM provider key) is required');
    const res = await this._request('/v1/analyze', {
      method: 'POST',
      body: JSON.stringify(options),
    });
    return res.json() as Promise<AnalyzeResult>;
  }

  // ── Private HTTP helper ──────────────────────

  private async _request(path: string, init?: RequestInit): Promise<Response> {
    const url = `${this.baseUrl}${path}`;
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), this.timeout);

    try {
      const res = await fetch(url, {
        ...init,
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
          'User-Agent': 'snapapi-js/2.0.0',
          ...(init?.headers as Record<string, string> | undefined),
        },
        signal: ctrl.signal,
      });

      if (!res.ok) {
        throw await this._parseError(res);
      }
      return res;
    } finally {
      clearTimeout(tid);
    }
  }

  private async _parseError(res: Response): Promise<SnapAPIError> {
    let body: Record<string, unknown> = {};
    try { body = await res.json() as Record<string, unknown>; } catch { /* noop */ }
    const message = (body.message as string) || `HTTP ${res.status}`;
    const code = (body.error as string) || 'UNKNOWN_ERROR';
    return new SnapAPIError(message, code, res.status, body.details as Record<string, unknown>);
  }
}

export default SnapAPI;

/** Convenience factory */
export function createClient(config: SnapAPIConfig): SnapAPI {
  return new SnapAPI(config);
}
