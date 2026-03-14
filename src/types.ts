/**
 * Shared type definitions for the SnapAPI SDK.
 *
 * @module types
 */

// ─────────────────────────────────────────────
// Shared primitive types
// ─────────────────────────────────────────────

/** Device viewport presets. */
export type DevicePreset =
  | 'desktop-1080p' | 'desktop-1440p' | 'desktop-4k'
  | 'macbook-pro-13' | 'macbook-pro-16' | 'imac-24'
  | 'iphone-se' | 'iphone-12' | 'iphone-13' | 'iphone-14' | 'iphone-14-pro'
  | 'iphone-15' | 'iphone-15-pro' | 'iphone-15-pro-max'
  | 'ipad' | 'ipad-mini' | 'ipad-air' | 'ipad-pro-11' | 'ipad-pro-12.9'
  | 'pixel-7' | 'pixel-8' | 'pixel-8-pro'
  | 'samsung-galaxy-s23' | 'samsung-galaxy-s24' | 'samsung-galaxy-tab-s9';

/** Image output formats. */
export type ImageFormat = 'png' | 'jpeg' | 'webp' | 'avif';

/** Video output formats. */
export type VideoFormat = 'webm' | 'mp4' | 'gif';

/** Scroll easing functions for video capture. */
export type ScrollEasing = 'linear' | 'ease_in' | 'ease_out' | 'ease_in_out' | 'ease_in_out_quint';

/** Browser navigation wait conditions. */
export type WaitUntil = 'load' | 'domcontentloaded' | 'networkidle';

/** Extract content types. */
export type ExtractType = 'html' | 'text' | 'markdown' | 'article' | 'links' | 'images' | 'metadata' | 'structured';

/** Scrape content types. */
export type ScrapeType = 'text' | 'html' | 'links';

/** AI provider for analyze endpoint. */
export type AnalyzeProvider = 'openai' | 'anthropic';

/** PDF page size presets. */
export type PageSize = 'a4' | 'a3' | 'a5' | 'letter' | 'legal' | 'tabloid';

/** Storage destination for screenshots. */
export type StorageDestination = 'snapapi' | 'user_s3';

// ─────────────────────────────────────────────
// Nested option objects
// ─────────────────────────────────────────────

/** HTTP cookie to inject into the browser session. */
export interface Cookie {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  /** Unix timestamp (seconds) */
  expires?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

/** HTTP Basic Authentication credentials. */
export interface HttpAuth {
  username: string;
  password: string;
}

/** Proxy server configuration. */
export interface ProxyConfig {
  /** Proxy server URL e.g. `http://host:port` */
  server: string;
  username?: string;
  password?: string;
}

/** GPS coordinates for geolocation emulation. */
export interface Geolocation {
  latitude: number;
  longitude: number;
  /** Accuracy in metres (default: 1) */
  accuracy?: number;
}

/** PDF margin values (accepts CSS units e.g. `'10mm'`, `'0.5in'`). */
export interface PdfMargins {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
}

/** Cloud storage destination configuration. */
export interface StorageDestinationConfig {
  /** Where to store the file */
  destination: StorageDestination;
  /** Override the stored file format */
  format?: ImageFormat | 'pdf';
}

// ─────────────────────────────────────────────
// Screenshot
// ─────────────────────────────────────────────

/** Options for `client.screenshot()`. */
export interface ScreenshotOptions {
  /** URL to capture (required unless `html` or `markdown` is set) */
  url?: string;
  /** Raw HTML string to render */
  html?: string;
  /** Markdown string to render */
  markdown?: string;
  /** Output image format (default: `'png'`) */
  format?: ImageFormat | 'pdf';
  /** Image quality 1–100, JPEG / WebP only */
  quality?: number;
  /** Use a named device viewport preset (overrides width/height/scale) */
  device?: DevicePreset;
  /** Viewport width in pixels, 100–3840 (default: 1280) */
  width?: number;
  /** Viewport height in pixels, 100–2160 (default: 800) */
  height?: number;
  /** Device pixel ratio 1–3 (default: 1) */
  deviceScaleFactor?: number;
  /** Emulate a mobile device */
  isMobile?: boolean;
  /** Enable touch events */
  hasTouch?: boolean;
  /** Capture the full scrollable page */
  fullPage?: boolean;
  /** Delay between scroll steps for full-page capture (ms) */
  fullPageScrollDelay?: number;
  /** Maximum height for full-page capture (px) */
  fullPageMaxHeight?: number;
  /** CSS selector — capture only that element */
  selector?: string;
  /** Extra delay before the screenshot is taken (0–30 000 ms) */
  delay?: number;
  /** Navigation timeout (ms) */
  timeout?: number;
  /** Browser navigation event to wait for */
  waitUntil?: WaitUntil;
  /** Wait for a CSS selector to appear before capturing */
  waitForSelector?: string;
  /** Emulate dark colour scheme */
  darkMode?: boolean;
  /** Reduce CSS animations */
  reducedMotion?: boolean;
  /** Custom CSS to inject into the page */
  css?: string;
  /** JavaScript to execute before capturing */
  javascript?: string;
  /** CSS selectors to hide (visibility: hidden) */
  hideSelectors?: string[];
  /** CSS selector to click before capturing */
  clickSelector?: string;
  /** Block ad networks */
  blockAds?: boolean;
  /** Block third-party tracking scripts */
  blockTrackers?: boolean;
  /** Block cookie consent popups */
  blockCookieBanners?: boolean;
  /** Block chat widgets (Intercom, Drift, Zendesk, etc.) */
  blockChatWidgets?: boolean;
  /** Custom User-Agent string */
  userAgent?: string;
  /** Extra HTTP request headers */
  extraHeaders?: Record<string, string>;
  /** Cookies to inject before loading the page */
  cookies?: Cookie[];
  /** HTTP Basic Auth credentials */
  httpAuth?: HttpAuth;
  /** Custom proxy configuration */
  proxy?: ProxyConfig;
  /** Use SnapAPI's premium rotating proxy */
  premiumProxy?: boolean;
  /** GPS geolocation to emulate */
  geolocation?: Geolocation;
  /** IANA timezone string e.g. `'America/New_York'` */
  timezone?: string;
  /** PDF page size (only when `format` is `'pdf'`) */
  pageSize?: PageSize;
  /** PDF landscape orientation */
  landscape?: boolean;
  /** PDF page margins */
  margins?: PdfMargins;
  /** HTML for PDF header */
  headerTemplate?: string;
  /** HTML for PDF footer */
  footerTemplate?: string;
  /** Show PDF header/footer */
  displayHeaderFooter?: boolean;
  /** PDF content scale factor 0.1–2 */
  scale?: number;
  /** Store result in cloud storage instead of returning binary */
  storage?: StorageDestinationConfig;
  /** Deliver result to this webhook URL (returns a queued job) */
  webhookUrl?: string;
  /** Poll a previously queued async job by its ID */
  jobId?: string;
}

/** Returned when `options.storage` is set. */
export interface ScreenshotStorageResult {
  id: string;
  url: string;
}

/** Returned when `options.webhookUrl` is set. */
export interface ScreenshotQueuedResult {
  jobId: string;
  status: 'queued';
}

// ─────────────────────────────────────────────
// Scrape
// ─────────────────────────────────────────────

/** Options for `client.scrape()`. */
export interface ScrapeOptions {
  /** URL to scrape (required) */
  url: string;
  /** Content type to return (default: `'text'`) */
  type?: ScrapeType;
  /** Number of pages to scrape, 1–10 (default: 1) */
  pages?: number;
  /** Wait time after page load in ms (0–30 000) */
  waitMs?: number;
  /** Proxy URL e.g. `'http://user:pass@host:port'` */
  proxy?: string;
  /** Use SnapAPI's premium rotating proxy */
  premiumProxy?: boolean;
  /** Block images, fonts and media to save bandwidth */
  blockResources?: boolean;
  /** Browser locale e.g. `'en-US'` */
  locale?: string;
}

/** A single page result from `client.scrape()`. */
export interface ScrapePageResult {
  page: number;
  url: string;
  data: string;
}

/** Response from `client.scrape()`. */
export interface ScrapeResult {
  success: true;
  results: ScrapePageResult[];
}

// ─────────────────────────────────────────────
// Extract
// ─────────────────────────────────────────────

/** Options for `client.extract()`. */
export interface ExtractOptions {
  /** URL to extract content from (required) */
  url: string;
  /** Content type to extract (default: `'markdown'`) */
  type?: ExtractType;
  /** CSS selector to scope extraction to a specific element */
  selector?: string;
  /** CSS selector or event to wait for before extracting */
  waitFor?: string;
  /** Navigation timeout (ms) */
  timeout?: number;
  /** Emulate dark mode */
  darkMode?: boolean;
  /** Block ad networks */
  blockAds?: boolean;
  /** Block cookie consent banners */
  blockCookieBanners?: boolean;
  /** Include image URLs in extracted output */
  includeImages?: boolean;
  /** Truncate output at this many characters */
  maxLength?: number;
  /** Strip navigation and boilerplate from output */
  cleanOutput?: boolean;
}

/** Response from `client.extract()`. */
export interface ExtractResult {
  success: true;
  type: ExtractType;
  url: string;
  /** Extracted content — type depends on `options.type` */
  data: unknown;
  responseTime: number;
}

// ─────────────────────────────────────────────
// PDF
// ─────────────────────────────────────────────

/** Options for `client.pdf()`. */
export interface PdfOptions {
  /** URL to convert to PDF (required unless `html` is set) */
  url?: string;
  /** Raw HTML to convert to PDF */
  html?: string;
  /** PDF page size (default: `'a4'`) */
  pageSize?: PageSize;
  /** Landscape orientation (default: `false`) */
  landscape?: boolean;
  /** Page margins */
  margins?: PdfMargins;
  /** HTML template for the page header */
  headerTemplate?: string;
  /** HTML template for the page footer */
  footerTemplate?: string;
  /** Show header and footer */
  displayHeaderFooter?: boolean;
  /** Content scale factor 0.1–2 (default: 1) */
  scale?: number;
  /** Extra delay before rendering (ms) */
  delay?: number;
  /** Wait for this CSS selector before rendering */
  waitForSelector?: string;
}

// ─────────────────────────────────────────────
// Video
// ─────────────────────────────────────────────

/** Options for `client.video()`. */
export interface VideoOptions {
  /** URL to record (required) */
  url: string;
  /** Output format (default: `'webm'`) */
  format?: VideoFormat;
  /** Viewport width 320–1920 (default: 1280) */
  width?: number;
  /** Viewport height 240–1080 (default: 720) */
  height?: number;
  /** Recording duration in seconds 1–30 (default: 5) */
  duration?: number;
  /** Frames per second 10–30 (default: 25) */
  fps?: number;
  /** Enable automatic scroll animation */
  scrolling?: boolean;
  /** Scroll speed in px/s, 50–500 (default: 100) */
  scrollSpeed?: number;
  /** Delay before scrolling starts in ms, 0–5000 (default: 500) */
  scrollDelay?: number;
  /** Duration of each scroll step in ms, 100–5000 (default: 1500) */
  scrollDuration?: number;
  /** Pixels to scroll per step, 100–2000 (default: 500) */
  scrollBy?: number;
  /** Easing function for scroll animation (default: `'ease_in_out'`) */
  scrollEasing?: ScrollEasing;
  /** Scroll back to top after reaching the bottom (default: `true`) */
  scrollBack?: boolean;
  /** Stop recording when scroll reaches the bottom (default: `true`) */
  scrollComplete?: boolean;
  /** Enable dark mode */
  darkMode?: boolean;
  /** Block ad networks */
  blockAds?: boolean;
  /** Block cookie consent banners */
  blockCookieBanners?: boolean;
  /** Delay before recording starts in ms, 0–10 000 (default: 0) */
  delay?: number;
}

/** JSON response from `client.video()` when `format` is `'json'`. */
export interface VideoResult {
  /** Base64-encoded video data */
  data: string;
  /** MIME type (`video/webm`, `video/mp4`, `image/gif`) */
  mimeType: string;
  format: VideoFormat;
  width: number;
  height: number;
  duration: number;
  /** File size in bytes */
  size: number;
}

// ─────────────────────────────────────────────
// OG Image
// ─────────────────────────────────────────────

/** Options for `client.ogImage()`. */
export interface OgImageOptions {
  /** URL to generate an OG image for (required) */
  url: string;
  /** Output image format (default: `'png'`) */
  format?: ImageFormat;
  /** Image width (default: 1200) */
  width?: number;
  /** Image height (default: 630) */
  height?: number;
}

// ─────────────────────────────────────────────
// Analyze
// ─────────────────────────────────────────────

/** Options for `client.analyze()`. */
export interface AnalyzeOptions {
  /** URL to analyze (required) */
  url: string;
  /** Prompt describing what to analyze (required) */
  prompt: string;
  /** LLM provider — bring your own key (BYOK) */
  provider?: AnalyzeProvider;
  /** Your LLM provider API key */
  apiKey?: string;
  /** Override the default model (e.g. `'gpt-4o'`, `'claude-opus-4-5'`) */
  model?: string;
  /** JSON schema for structured output */
  jsonSchema?: Record<string, unknown>;
  /** Include a screenshot in the analysis context */
  includeScreenshot?: boolean;
  /** Include page metadata in the analysis context */
  includeMetadata?: boolean;
  /** Max characters of page content sent to the AI */
  maxContentLength?: number;
  /** Navigation timeout (ms) */
  timeout?: number;
  /** Block ad networks */
  blockAds?: boolean;
  /** Block cookie consent banners */
  blockCookieBanners?: boolean;
  /** Wait for this CSS selector before analyzing */
  waitFor?: string;
}

/** Response from `client.analyze()`. */
export interface AnalyzeResult {
  success: boolean;
  url: string;
  metadata?: Record<string, unknown>;
  /** The AI-generated analysis */
  analysis: unknown;
  provider: string;
  model: string;
  responseTime: number;
}

// ─────────────────────────────────────────────
// Quota / Usage
// ─────────────────────────────────────────────

/** Account API usage for the current billing period. */
export interface AccountUsage {
  /** API calls made in the current period */
  used: number;
  /** Total API call allowance for the plan */
  limit: number;
  /** Remaining calls before quota is exhausted */
  remaining: number;
  /** ISO 8601 timestamp when the quota resets */
  resetAt?: string;
}

// ─────────────────────────────────────────────
// Storage
// ─────────────────────────────────────────────

/** A file stored in SnapAPI cloud or user S3. */
export interface StorageFile {
  id: string;
  url: string;
  filename?: string;
  size?: number;
  format?: string;
  createdAt?: string;
  [key: string]: unknown;
}

/** Response from `client.storage.listFiles()`. */
export interface StorageListResult {
  files: StorageFile[];
  total?: number;
  limit?: number;
  offset?: number;
}

/** Storage usage summary. */
export interface StorageUsage {
  used: number;
  limit: number;
  percentage: number;
  usedFormatted: string;
  limitFormatted: string;
}

/** Custom S3-compatible storage configuration. */
export interface S3Config {
  s3_bucket: string;
  s3_region: string;
  s3_access_key_id: string;
  s3_secret_access_key: string;
  /** Custom endpoint for S3-compatible services */
  s3_endpoint?: string;
}

/** Result of testing an S3 connection. */
export interface S3TestResult {
  success: boolean;
  message?: string;
}

// ─────────────────────────────────────────────
// Scheduled screenshots
// ─────────────────────────────────────────────

/** Options for creating a scheduled screenshot job. */
export interface CreateScheduledOptions {
  url: string;
  /** Cron expression e.g. `'0 9 * * 1'` */
  cronExpression: string;
  format?: ImageFormat | 'pdf';
  width?: number;
  height?: number;
  fullPage?: boolean;
  webhookUrl?: string;
}

/** A scheduled screenshot job. */
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

// ─────────────────────────────────────────────
// Webhooks
// ─────────────────────────────────────────────

/** Options for registering a webhook endpoint. */
export interface CreateWebhookOptions {
  /** Endpoint URL to receive events */
  url: string;
  /** Events to subscribe to e.g. `['screenshot.done']` */
  events: string[];
  /** Optional HMAC signing secret */
  secret?: string;
}

/** A registered webhook. */
export interface Webhook {
  id: string;
  url: string;
  events: string[];
  secret?: string;
  createdAt?: string;
  [key: string]: unknown;
}

// ─────────────────────────────────────────────
// API Keys
// ─────────────────────────────────────────────

/** An API key entry (value is masked in list responses). */
export interface ApiKey {
  id: string;
  name: string;
  /** Masked value e.g. `'sk_live_xxx…xxx'` */
  key: string;
  createdAt?: string;
  lastUsed?: string;
}

/** Result of creating a new API key — the full key is shown only once. */
export interface CreateApiKeyResult {
  id: string;
  name: string;
  /** Full key — store securely, shown only once */
  key: string;
}

// ─────────────────────────────────────────────
// SDK configuration
// ─────────────────────────────────────────────

/** Configuration options passed to the `SnapAPI` constructor. */
export interface SnapAPIConfig {
  /** Your SnapAPI key (required) */
  apiKey: string;
  /** Override the API base URL (default: `https://snapapi.pics`) */
  baseUrl?: string;
  /** Global request timeout in ms (default: 60 000) */
  timeout?: number;
  /** Maximum number of automatic retries on 429 / 5xx (default: 3) */
  maxRetries?: number;
  /**
   * Initial backoff delay for retries in ms (default: 500).
   * Each retry doubles the delay (exponential backoff) up to 30 000 ms.
   */
  retryDelay?: number;
  /**
   * Hook called before every HTTP request.
   * Useful for logging or injecting dynamic headers.
   */
  onRequest?: (url: string, init: RequestInit) => void | Promise<void>;
  /**
   * Hook called after every HTTP response (including errors).
   * Receives the status code and the raw Response object.
   */
  onResponse?: (statusCode: number, response: Response) => void | Promise<void>;
}

/** Generic delete operation result. */
export interface DeleteResult {
  success: boolean;
}
