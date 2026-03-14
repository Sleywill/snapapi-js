/**
 * Main SnapAPI client.
 *
 * @module client
 */

import { executeRequest } from './http.js';
import {
  StorageNamespace,
  ScheduledNamespace,
  WebhooksNamespace,
  KeysNamespace,
} from './namespaces.js';
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
} from './types.js';

const DEFAULT_BASE_URL = 'https://snapapi.pics';
const DEFAULT_TIMEOUT_MS = 60_000;
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_DELAY_MS = 500;

/**
 * Official SnapAPI client for JavaScript / TypeScript.
 *
 * Supports ESM and CommonJS. All methods return typed responses and throw
 * typed errors. Includes automatic retry logic with exponential back-off.
 *
 * @example
 * ```typescript
 * import { SnapAPI } from 'snapapi-js';
 *
 * const snap = new SnapAPI({ apiKey: 'sk_live_...' });
 *
 * // Take a full-page screenshot
 * const buf = await snap.screenshot({ url: 'https://example.com', fullPage: true });
 * fs.writeFileSync('shot.png', buf);
 *
 * // Check quota
 * const { used, limit } = await snap.quota();
 * ```
 */
export class SnapAPI {
  private readonly _config: Required<
    Pick<SnapAPIConfig, 'apiKey' | 'baseUrl' | 'timeout' | 'maxRetries' | 'retryDelay'>
  > &
    Pick<SnapAPIConfig, 'onRequest' | 'onResponse'>;

  /** Storage management namespace — `client.storage.*` */
  public readonly storage: StorageNamespace;
  /** Scheduled screenshots namespace — `client.scheduled.*` */
  public readonly scheduled: ScheduledNamespace;
  /** Webhooks namespace — `client.webhooks.*` */
  public readonly webhooks: WebhooksNamespace;
  /** API keys namespace — `client.keys.*` */
  public readonly keys: KeysNamespace;

  /**
   * Create a new SnapAPI client.
   *
   * @param config Client configuration
   * @throws {Error} when `apiKey` is not provided
   *
   * @example
   * ```typescript
   * const snap = new SnapAPI({
   *   apiKey: process.env.SNAPAPI_KEY!,
   *   timeout: 30_000,
   *   maxRetries: 3,
   * });
   * ```
   */
  constructor(config: SnapAPIConfig) {
    if (!config.apiKey) {
      throw new Error('SnapAPI: apiKey is required');
    }
    this._config = {
      apiKey: config.apiKey,
      baseUrl: (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, ''),
      timeout: config.timeout ?? DEFAULT_TIMEOUT_MS,
      maxRetries: config.maxRetries ?? DEFAULT_MAX_RETRIES,
      retryDelay: config.retryDelay ?? DEFAULT_RETRY_DELAY_MS,
      onRequest: config.onRequest,
      onResponse: config.onResponse,
    };

    const req = this._request.bind(this);
    this.storage = new StorageNamespace(req);
    this.scheduled = new ScheduledNamespace(req);
    this.webhooks = new WebhooksNamespace(req);
    this.keys = new KeysNamespace(req);
  }

  // ── Screenshot ──────────────────────────────────────────────────────────

  /**
   * Capture a screenshot of a URL, raw HTML, or Markdown string.
   *
   * Returns:
   * - `Buffer` — binary image or PDF (default)
   * - `ScreenshotStorageResult` `{ id, url }` — when `options.storage` is set
   * - `ScreenshotQueuedResult` `{ jobId, status }` — when `options.webhookUrl` is set
   *
   * @param options Screenshot parameters
   * @throws {SnapAPIError} on API errors
   * @throws {RateLimitError} on HTTP 429 (auto-retried up to `maxRetries`)
   * @throws {AuthenticationError} on HTTP 401 / 403
   * @throws {TimeoutError} when the request exceeds the configured timeout
   *
   * @example
   * ```typescript
   * // Basic screenshot
   * const buf = await snap.screenshot({ url: 'https://example.com' });
   * fs.writeFileSync('shot.png', buf);
   *
   * // Full-page, dark-mode WebP
   * const buf2 = await snap.screenshot({
   *   url: 'https://github.com',
   *   format: 'webp',
   *   fullPage: true,
   *   darkMode: true,
   *   blockAds: true,
   * });
   *
   * // Store result in SnapAPI cloud and receive a URL
   * const { url } = await snap.screenshot({
   *   url: 'https://example.com',
   *   storage: { destination: 'snapapi' },
   * }) as ScreenshotStorageResult;
   * ```
   */
  async screenshot(
    options: ScreenshotOptions,
  ): Promise<Buffer | ScreenshotStorageResult | ScreenshotQueuedResult> {
    if (!options.url && !options.html && !options.markdown) {
      throw new Error('screenshot: one of url, html, or markdown is required');
    }

    const res = await this._request('/v1/screenshot', {
      method: 'POST',
      body: JSON.stringify(options),
    });

    const ct = res.headers.get('content-type') ?? '';
    if (ct.includes('application/json')) {
      return res.json() as Promise<ScreenshotStorageResult | ScreenshotQueuedResult>;
    }
    return Buffer.from(await res.arrayBuffer());
  }

  // ── Scrape ──────────────────────────────────────────────────────────────

  /**
   * Scrape text, HTML, or links from one or more pages using a stealth browser.
   *
   * @param options Scraping parameters
   *
   * @example
   * ```typescript
   * const { results } = await snap.scrape({
   *   url: 'https://news.ycombinator.com',
   *   type: 'links',
   *   blockResources: true,
   * });
   * console.log(results[0].data);
   * ```
   */
  async scrape(options: ScrapeOptions): Promise<ScrapeResult> {
    if (!options.url) throw new Error('scrape: url is required');

    const res = await this._request('/v1/scrape', {
      method: 'POST',
      body: JSON.stringify(options),
    });
    return res.json() as Promise<ScrapeResult>;
  }

  // ── Extract ─────────────────────────────────────────────────────────────

  /**
   * Extract structured content from a webpage — text, markdown, article,
   * links, images, metadata, or structured data.
   *
   * @param options Extraction parameters
   *
   * @example
   * ```typescript
   * const result = await snap.extract({
   *   url: 'https://example.com/post',
   *   type: 'markdown',
   *   cleanOutput: true,
   * });
   * console.log(result.data);
   * ```
   */
  async extract(options: ExtractOptions): Promise<ExtractResult> {
    if (!options.url) throw new Error('extract: url is required');

    const res = await this._request('/v1/extract', {
      method: 'POST',
      body: JSON.stringify(options),
    });
    return res.json() as Promise<ExtractResult>;
  }

  // ── PDF ─────────────────────────────────────────────────────────────────

  /**
   * Convert a URL or HTML string to a PDF file.
   *
   * @param options PDF generation parameters
   * @returns Raw PDF bytes
   *
   * @example
   * ```typescript
   * const pdf = await snap.pdf({ url: 'https://example.com', pageSize: 'a4' });
   * fs.writeFileSync('output.pdf', pdf);
   * ```
   */
  async pdf(options: PdfOptions): Promise<Buffer> {
    if (!options.url && !options.html) {
      throw new Error('pdf: one of url or html is required');
    }

    const body = {
      ...(options.url ? { url: options.url } : {}),
      ...(options.html ? { html: options.html } : {}),
      format: 'pdf',
      pageSize: options.pageSize,
      landscape: options.landscape,
      margins: options.margins,
      headerTemplate: options.headerTemplate,
      footerTemplate: options.footerTemplate,
      displayHeaderFooter: options.displayHeaderFooter,
      scale: options.scale,
      delay: options.delay,
      waitForSelector: options.waitForSelector,
    };

    const res = await this._request('/v1/screenshot', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return Buffer.from(await res.arrayBuffer());
  }

  // ── Video ───────────────────────────────────────────────────────────────

  /**
   * Record a video (WebM / MP4 / GIF) of a live webpage.
   *
   * Returns raw binary bytes by default.
   *
   * @param options Video recording parameters
   *
   * @example
   * ```typescript
   * const video = await snap.video({ url: 'https://example.com', duration: 5 });
   * fs.writeFileSync('recording.webm', video);
   * ```
   */
  async video(options: VideoOptions): Promise<Buffer | VideoResult> {
    if (!options.url) throw new Error('video: url is required');

    const res = await this._request('/v1/video', {
      method: 'POST',
      body: JSON.stringify(options),
    });
    const ct = res.headers.get('content-type') ?? '';
    if (ct.includes('application/json')) {
      return res.json() as Promise<VideoResult>;
    }
    return Buffer.from(await res.arrayBuffer());
  }

  // ── OG Image ────────────────────────────────────────────────────────────

  /**
   * Generate an Open Graph image for a URL.
   *
   * Returns raw binary image bytes.
   *
   * @param options OG image parameters
   *
   * @example
   * ```typescript
   * const og = await snap.ogImage({ url: 'https://example.com' });
   * fs.writeFileSync('og.png', og);
   * ```
   */
  async ogImage(options: OgImageOptions): Promise<Buffer> {
    if (!options.url) throw new Error('ogImage: url is required');

    const res = await this._request('/v1/screenshot', {
      method: 'POST',
      body: JSON.stringify({
        url: options.url,
        format: options.format ?? 'png',
        width: options.width ?? 1200,
        height: options.height ?? 630,
      }),
    });
    return Buffer.from(await res.arrayBuffer());
  }

  // ── Analyze ─────────────────────────────────────────────────────────────

  /**
   * Analyze a webpage with an LLM using your own API key (BYOK).
   *
   * Note: this endpoint is currently experimental. If the server returns an
   * error, the SDK surfaces it as a `SnapAPIError` so you can handle it
   * gracefully in your application.
   *
   * @param options Analysis parameters
   *
   * @example
   * ```typescript
   * const result = await snap.analyze({
   *   url: 'https://example.com',
   *   prompt: 'Summarize this page in 3 bullet points.',
   *   provider: 'openai',
   *   apiKey: process.env.OPENAI_API_KEY!,
   * });
   * console.log(result.analysis);
   * ```
   */
  async analyze(options: AnalyzeOptions): Promise<AnalyzeResult> {
    if (!options.url) throw new Error('analyze: url is required');
    if (!options.prompt) throw new Error('analyze: prompt is required');

    const res = await this._request('/v1/analyze', {
      method: 'POST',
      body: JSON.stringify(options),
    });
    return res.json() as Promise<AnalyzeResult>;
  }

  // ── Quota ───────────────────────────────────────────────────────────────

  /**
   * Get your account API usage for the current billing period.
   *
   * @example
   * ```typescript
   * const { used, limit, remaining } = await snap.quota();
   * console.log(`${used} / ${limit} calls used`);
   * ```
   */
  async quota(): Promise<AccountUsage> {
    const res = await this._request('/v1/quota');
    return res.json() as Promise<AccountUsage>;
  }

  /**
   * Alias for `quota()` — kept for backwards compatibility.
   * @deprecated Use `quota()` instead.
   */
  async usage(): Promise<AccountUsage> {
    return this.quota();
  }

  // ── Ping ────────────────────────────────────────────────────────────────

  /**
   * Check API availability.
   *
   * @returns `{ status: 'ok', timestamp: <unix ms> }`
   */
  async ping(): Promise<{ status: string; timestamp: number }> {
    const res = await this._request('/v1/ping');
    return res.json() as Promise<{ status: string; timestamp: number }>;
  }

  // ── Private HTTP helper ──────────────────────────────────────────────────

  private _request(path: string, init: RequestInit = {}): Promise<Response> {
    return executeRequest(path, init, this._config);
  }
}

/**
 * Convenience factory — equivalent to `new SnapAPI(config)`.
 *
 * @example
 * ```typescript
 * import { createClient } from 'snapapi-js';
 * const snap = createClient({ apiKey: 'sk_live_...' });
 * ```
 */
export function createClient(config: SnapAPIConfig): SnapAPI {
  return new SnapAPI(config);
}
