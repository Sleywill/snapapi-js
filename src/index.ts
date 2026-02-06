/**
 * SnapAPI JavaScript/TypeScript SDK
 * Lightning-fast screenshot API for developers
 *
 * @packageDocumentation
 */

// Device preset types
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
  bypass?: string[];
}

export interface Geolocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface PdfOptions {
  /** Page size: 'a4', 'a3', 'a5', 'letter', 'legal', 'tabloid', 'custom' */
  pageSize?: 'a4' | 'a3' | 'a5' | 'letter' | 'legal' | 'tabloid' | 'custom';
  /** Custom width (e.g., '210mm') */
  width?: string;
  /** Custom height (e.g., '297mm') */
  height?: string;
  /** Landscape orientation */
  landscape?: boolean;
  /** Top margin (e.g., '20mm') */
  marginTop?: string;
  /** Right margin */
  marginRight?: string;
  /** Bottom margin */
  marginBottom?: string;
  /** Left margin */
  marginLeft?: string;
  /** Print background graphics */
  printBackground?: boolean;
  /** HTML template for header */
  headerTemplate?: string;
  /** HTML template for footer */
  footerTemplate?: string;
  /** Display header and footer */
  displayHeaderFooter?: boolean;
  /** Scale (0.1-2) */
  scale?: number;
  /** Page ranges (e.g., '1-5') */
  pageRanges?: string;
  /** Use CSS page size */
  preferCSSPageSize?: boolean;
}

export interface ThumbnailOptions {
  /** Enable thumbnail generation */
  enabled: boolean;
  /** Thumbnail width (50-800) */
  width?: number;
  /** Thumbnail height (50-600) */
  height?: number;
  /** Fit mode: 'cover', 'contain', 'fill' */
  fit?: 'cover' | 'contain' | 'fill';
}

export interface ExtractMetadataOptions {
  /** Extract fonts used on page */
  fonts?: boolean;
  /** Extract dominant colors */
  colors?: boolean;
  /** Extract all links */
  links?: boolean;
  /** Include HTTP status code */
  httpStatusCode?: boolean;
}

export interface ScreenshotOptions {
  /** URL to capture */
  url?: string;
  /** HTML content to render */
  html?: string;
  /** Markdown content to render */
  markdown?: string;
  /** Output format: 'png' | 'jpeg' | 'webp' | 'avif' | 'pdf' */
  format?: 'png' | 'jpeg' | 'webp' | 'avif' | 'pdf';
  /** Image quality 1-100 (JPEG/WebP only) */
  quality?: number;
  /** Device preset for viewport settings */
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
  /** Landscape orientation */
  isLandscape?: boolean;
  /** Capture the full scrollable page */
  fullPage?: boolean;
  /** Delay between scroll steps for full page (ms) */
  fullPageScrollDelay?: number;
  /** Max height for full page (px) */
  fullPageMaxHeight?: number;
  /** CSS selector to capture specific element */
  selector?: string;
  /** Scroll element into view before capture */
  selectorScrollIntoView?: boolean;
  /** Clip region X position */
  clipX?: number;
  /** Clip region Y position */
  clipY?: number;
  /** Clip region width */
  clipWidth?: number;
  /** Clip region height */
  clipHeight?: number;
  /** Delay in ms before capture (0-30000) */
  delay?: number;
  /** Max wait time in ms (1000-60000) */
  timeout?: number;
  /** Wait until event: 'load', 'domcontentloaded', 'networkidle' */
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle';
  /** Wait for element to appear before capture */
  waitForSelector?: string;
  /** Timeout for waiting for selector */
  waitForSelectorTimeout?: number;
  /** Emulate dark mode preference */
  darkMode?: boolean;
  /** Reduce animations */
  reducedMotion?: boolean;
  /** Custom CSS to inject */
  css?: string;
  /** JavaScript code to execute before capture */
  javascript?: string;
  /** CSS selectors to hide elements */
  hideSelectors?: string[];
  /** CSS selector to click before capture */
  clickSelector?: string;
  /** Delay after click (ms) */
  clickDelay?: number;
  /** Block ads */
  blockAds?: boolean;
  /** Block trackers */
  blockTrackers?: boolean;
  /** Hide cookie consent banners */
  blockCookieBanners?: boolean;
  /** Block chat widgets (Intercom, Drift, Zendesk, etc.) */
  blockChatWidgets?: boolean;
  /** Resource types to block */
  blockResources?: Array<'document' | 'stylesheet' | 'image' | 'media' | 'font' | 'script' | 'xhr' | 'fetch' | 'websocket'>;
  /** Custom User-Agent */
  userAgent?: string;
  /** Custom HTTP headers */
  extraHeaders?: Record<string, string>;
  /** Array of cookies to set */
  cookies?: Cookie[];
  /** HTTP basic auth credentials */
  httpAuth?: HttpAuth;
  /** Proxy configuration */
  proxy?: ProxyConfig;
  /** Geolocation coordinates */
  geolocation?: Geolocation;
  /** Timezone (e.g., 'America/New_York') */
  timezone?: string;
  /** Locale (e.g., 'en-US') */
  locale?: string;
  /** PDF generation options */
  pdfOptions?: PdfOptions;
  /** Thumbnail generation options */
  thumbnail?: ThumbnailOptions;
  /** Fail on HTTP 4xx/5xx errors */
  failOnHttpError?: boolean;
  /** Enable caching */
  cache?: boolean;
  /** Cache TTL in seconds (60-2592000) */
  cacheTtl?: number;
  /** Response type */
  responseType?: 'binary' | 'base64' | 'json';
  /** Include page metadata in response */
  includeMetadata?: boolean;
  /** Additional metadata to extract */
  extractMetadata?: ExtractMetadataOptions;
  /** Fail if these text strings are NOT found on the page (max 10 items, 200 chars each) */
  failIfContentMissing?: string[];
  /** Fail if these text strings ARE found on the page (max 10 items, 200 chars each) */
  failIfContentContains?: string[];
}

export interface ScreenshotMetadata {
  /** Page title */
  title?: string;
  /** Page description */
  description?: string;
  /** Favicon URL */
  favicon?: string;
  /** Open Graph data */
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  /** HTTP status code */
  httpStatusCode?: number;
  /** Fonts used on page */
  fonts?: string[];
  /** Dominant colors */
  colors?: string[];
  /** All links on page */
  links?: string[];
}

export interface ScreenshotResult {
  /** Whether the screenshot was successful */
  success: boolean;
  /** Base64-encoded image data (when responseType is 'json' or 'base64') */
  data?: string;
  /** Image format */
  format: string;
  /** Image width */
  width: number;
  /** Image height */
  height: number;
  /** File size in bytes */
  fileSize: number;
  /** Processing duration in ms */
  took: number;
  /** Whether result was from cache */
  cached: boolean;
  /** Page metadata (when includeMetadata is true) */
  metadata?: ScreenshotMetadata;
  /** Thumbnail data (when thumbnail is enabled) */
  thumbnail?: string;
}

export type ScrollEasing = 'linear' | 'ease_in' | 'ease_out' | 'ease_in_out' | 'ease_in_out_quint';

export interface VideoOptions {
  /** URL to capture */
  url: string;
  /** Video format: 'mp4' | 'webm' | 'gif' */
  format?: 'mp4' | 'webm' | 'gif';
  /** Video quality 1-100 */
  quality?: number;
  /** Viewport width (100-1920) */
  width?: number;
  /** Viewport height (100-1080) */
  height?: number;
  /** Device preset */
  device?: DevicePreset;
  /** Video duration in ms (1000-30000) */
  duration?: number;
  /** Frames per second (1-30) */
  fps?: number;
  /** Delay before starting capture (ms) */
  delay?: number;
  /** Max wait time in ms */
  timeout?: number;
  /** Wait until event */
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle';
  /** Wait for element before capture */
  waitForSelector?: string;
  /** Emulate dark mode */
  darkMode?: boolean;
  /** Block ads */
  blockAds?: boolean;
  /** Block cookie banners */
  blockCookieBanners?: boolean;
  /** Custom CSS to inject */
  css?: string;
  /** JavaScript to execute before capture */
  javascript?: string;
  /** CSS selectors to hide */
  hideSelectors?: string[];
  /** Custom User-Agent */
  userAgent?: string;
  /** Cookies to set */
  cookies?: Cookie[];
  /** Response type: 'binary' | 'base64' | 'json' */
  responseType?: 'binary' | 'base64' | 'json';
  /** Enable scroll animation video */
  scroll?: boolean;
  /** Delay between scroll steps in ms (0-5000) */
  scrollDelay?: number;
  /** Duration of each scroll animation in ms (100-5000) */
  scrollDuration?: number;
  /** Pixels to scroll each step (100-2000) */
  scrollBy?: number;
  /** Easing function for scroll animation */
  scrollEasing?: ScrollEasing;
  /** Scroll back to top at the end */
  scrollBack?: boolean;
  /** Ensure entire page is scrolled */
  scrollComplete?: boolean;
}

export interface VideoResult {
  /** Whether capture was successful */
  success: boolean;
  /** Base64-encoded video data (when responseType is 'json' or 'base64') */
  data?: string;
  /** Video format */
  format: string;
  /** Video width */
  width: number;
  /** Video height */
  height: number;
  /** File size in bytes */
  fileSize: number;
  /** Video duration in ms */
  duration: number;
  /** Processing time in ms */
  took: number;
}

export interface BatchOptions {
  /** Array of URLs to capture */
  urls: string[];
  /** Output format */
  format?: 'png' | 'jpeg' | 'webp' | 'avif' | 'pdf';
  /** Image quality */
  quality?: number;
  /** Viewport width */
  width?: number;
  /** Viewport height */
  height?: number;
  /** Full page capture */
  fullPage?: boolean;
  /** Dark mode */
  darkMode?: boolean;
  /** Block ads */
  blockAds?: boolean;
  /** Block cookie banners */
  blockCookieBanners?: boolean;
  /** Webhook URL for async notifications */
  webhookUrl?: string;
}

export interface BatchResult {
  /** Whether operation was successful */
  success: boolean;
  /** Batch job ID */
  jobId: string;
  /** Job status */
  status: 'pending' | 'processing' | 'completed' | 'failed';
  /** Total URLs */
  total: number;
  /** Completed count */
  completed?: number;
  /** Failed count */
  failed?: number;
  /** Results for each URL (when completed) */
  results?: Array<{
    url: string;
    status: 'pending' | 'completed' | 'failed';
    data?: string;
    error?: string;
    duration?: number;
  }>;
  /** Created timestamp */
  createdAt?: string;
  /** Completed timestamp */
  completedAt?: string;
}

export interface DeviceInfo {
  id: string;
  name: string;
  width: number;
  height: number;
  deviceScaleFactor: number;
  isMobile: boolean;
}

export interface DevicesResult {
  success: boolean;
  devices: {
    desktop: DeviceInfo[];
    mac: DeviceInfo[];
    iphone: DeviceInfo[];
    ipad: DeviceInfo[];
    android: DeviceInfo[];
  };
  total: number;
}

export interface CapabilitiesResult {
  success: boolean;
  version: string;
  capabilities: {
    formats: string[];
    maxViewport: { width: number; height: number };
    maxFullPageHeight: number;
    maxHtmlSize: number;
    maxCssSize: number;
    maxJsSize: number;
    devicePresets: number;
    features: Record<string, unknown>;
  };
}

export interface UsageResult {
  used: number;
  limit: number;
  remaining: number;
  resetAt: string;
}

export type ExtractType = 'markdown' | 'text' | 'html' | 'article' | 'structured' | 'links' | 'images' | 'metadata';

export interface ExtractOptions {
  /** URL to extract content from */
  url: string;
  /** Type of extraction */
  type: ExtractType;
  /** CSS selector to extract from specific element */
  selector?: string;
  /** Wait for a selector before extracting */
  waitFor?: string;
  /** Max wait time in ms */
  timeout?: number;
  /** Emulate dark mode */
  darkMode?: boolean;
  /** Block ads */
  blockAds?: boolean;
  /** Block cookie banners */
  blockCookieBanners?: boolean;
  /** Include images in extracted content */
  includeImages?: boolean;
  /** Maximum content length */
  maxLength?: number;
  /** Clean output by removing boilerplate */
  cleanOutput?: boolean;
}

export interface ExtractResult {
  /** Whether extraction was successful */
  success: boolean;
  /** Extracted content */
  content: string;
  /** Extraction type used */
  type: ExtractType;
  /** Source URL */
  url: string;
  /** Page title */
  title?: string;
  /** Processing time in ms */
  took: number;
  /** Content length in characters */
  contentLength: number;
  /** Extracted links (for type 'links') */
  links?: Array<{ href: string; text: string }>;
  /** Extracted images (for type 'images') */
  images?: Array<{ src: string; alt?: string; width?: number; height?: number }>;
  /** Extracted metadata (for type 'metadata') */
  metadata?: Record<string, unknown>;
  /** Structured data (for type 'structured') */
  structured?: Record<string, unknown>;
}

export type AnalyzeProvider = 'openai' | 'anthropic';

export interface AnalyzeOptions {
  /** URL to analyze */
  url: string;
  /** Prompt describing what to analyze */
  prompt: string;
  /** AI provider to use */
  provider: AnalyzeProvider;
  /** Your AI provider API key */
  apiKey: string;
  /** AI model to use (optional, uses provider default) */
  model?: string;
  /** JSON schema for structured output */
  jsonSchema?: Record<string, unknown>;
  /** Max wait time in ms */
  timeout?: number;
  /** Wait for a selector before analyzing */
  waitFor?: string;
  /** Block ads */
  blockAds?: boolean;
  /** Block cookie banners */
  blockCookieBanners?: boolean;
  /** Include a screenshot in the analysis context */
  includeScreenshot?: boolean;
  /** Include page metadata in the analysis context */
  includeMetadata?: boolean;
  /** Maximum content length sent to AI */
  maxContentLength?: number;
}

export interface AnalyzeResult {
  /** Whether analysis was successful */
  success: boolean;
  /** AI analysis result */
  result: string;
  /** Structured result (when jsonSchema is provided) */
  structured?: Record<string, unknown>;
  /** AI provider used */
  provider: AnalyzeProvider;
  /** AI model used */
  model: string;
  /** Source URL */
  url: string;
  /** Processing time in ms */
  took: number;
  /** Token usage */
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface SnapAPIConfig {
  /** Your API key */
  apiKey: string;
  /** Base URL (default: https://api.snapapi.pics) */
  baseUrl?: string;
  /** Request timeout in ms (default: 60000) */
  timeout?: number;
}

export interface SnapAPIError extends Error {
  code: string;
  statusCode: number;
  details?: Record<string, unknown>;
}

/**
 * SnapAPI Client
 *
 * @example
 * ```typescript
 * import { SnapAPI } from '@snapapi/sdk';
 *
 * const client = new SnapAPI({ apiKey: 'sk_live_xxx' });
 *
 * // Capture a screenshot
 * const screenshot = await client.screenshot({
 *   url: 'https://example.com',
 *   format: 'png',
 *   width: 1920,
 *   height: 1080
 * });
 * ```
 */
export class SnapAPI {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;

  constructor(config: SnapAPIConfig) {
    if (!config.apiKey) {
      throw new Error('API key is required');
    }
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.snapapi.pics';
    this.timeout = config.timeout || 60000;
  }

  /**
   * Capture a screenshot of the specified URL or HTML content
   *
   * @param options - Screenshot options
   * @returns Screenshot result or binary data
   *
   * @example
   * ```typescript
   * // Get screenshot as binary buffer
   * const buffer = await client.screenshot({
   *   url: 'https://example.com',
   *   responseType: 'binary'
   * });
   * fs.writeFileSync('screenshot.png', buffer);
   *
   * // Get screenshot with metadata
   * const result = await client.screenshot({
   *   url: 'https://example.com',
   *   responseType: 'json',
   *   includeMetadata: true
   * });
   * console.log(result.metadata.title);
   * ```
   */
  async screenshot(options: ScreenshotOptions): Promise<ScreenshotResult | Buffer> {
    if (!options.url && !options.html && !options.markdown) {
      throw new Error('Either url, html, or markdown is required');
    }

    const response = await this.request('/v1/screenshot', {
      method: 'POST',
      body: JSON.stringify(options),
    });

    if (options.responseType === 'binary' || !options.responseType) {
      return Buffer.from(await response.arrayBuffer());
    }

    return response.json() as Promise<ScreenshotResult>;
  }

  /**
   * Capture a screenshot from HTML content
   *
   * @param html - HTML content to render
   * @param options - Additional screenshot options
   * @returns Screenshot result or binary data
   */
  async screenshotFromHtml(html: string, options: Omit<ScreenshotOptions, 'url' | 'html'> = {}): Promise<ScreenshotResult | Buffer> {
    return this.screenshot({ ...options, html });
  }

  /**
   * Capture a screenshot using a device preset
   *
   * @param url - URL to capture
   * @param device - Device preset name
   * @param options - Additional screenshot options
   * @returns Screenshot result or binary data
   */
  async screenshotDevice(url: string, device: DevicePreset, options: Omit<ScreenshotOptions, 'url' | 'device'> = {}): Promise<ScreenshotResult | Buffer> {
    return this.screenshot({ ...options, url, device });
  }

  /**
   * Capture a screenshot from Markdown content
   *
   * @param markdown - Markdown content to render
   * @param options - Additional screenshot options
   * @returns Screenshot result or binary data
   *
   * @example
   * ```typescript
   * const buffer = await client.screenshotFromMarkdown('# Hello World\n\nThis is **bold** text.');
   * fs.writeFileSync('markdown.png', buffer);
   * ```
   */
  async screenshotFromMarkdown(markdown: string, options: Partial<Omit<ScreenshotOptions, 'url' | 'html' | 'markdown'>> = {}): Promise<ScreenshotResult | Buffer> {
    return this.screenshot({ ...options, markdown });
  }

  /**
   * Extract content from a webpage
   *
   * @param options - Extract options
   * @returns Extracted content result
   *
   * @example
   * ```typescript
   * const result = await client.extract({
   *   url: 'https://example.com/article',
   *   type: 'markdown',
   *   cleanOutput: true
   * });
   * console.log(result.content);
   * ```
   */
  async extract(options: ExtractOptions): Promise<ExtractResult> {
    if (!options.url) {
      throw new Error('URL is required');
    }

    const response = await this.request('/v1/extract', {
      method: 'POST',
      body: JSON.stringify(options),
    });

    return response.json() as Promise<ExtractResult>;
  }

  /**
   * Extract page content as Markdown
   *
   * @param url - URL to extract from
   * @returns Extracted content result
   */
  async extractMarkdown(url: string): Promise<ExtractResult> {
    return this.extract({ url, type: 'markdown' });
  }

  /**
   * Extract article content (main body, stripped of navigation/ads)
   *
   * @param url - URL to extract from
   * @returns Extracted content result
   */
  async extractArticle(url: string): Promise<ExtractResult> {
    return this.extract({ url, type: 'article' });
  }

  /**
   * Extract structured data (JSON-LD, microdata, etc.)
   *
   * @param url - URL to extract from
   * @returns Extracted content result
   */
  async extractStructured(url: string): Promise<ExtractResult> {
    return this.extract({ url, type: 'structured' });
  }

  /**
   * Extract plain text content
   *
   * @param url - URL to extract from
   * @returns Extracted content result
   */
  async extractText(url: string): Promise<ExtractResult> {
    return this.extract({ url, type: 'text' });
  }

  /**
   * Extract all links from a page
   *
   * @param url - URL to extract from
   * @returns Extracted content result with links array
   */
  async extractLinks(url: string): Promise<ExtractResult> {
    return this.extract({ url, type: 'links' });
  }

  /**
   * Extract all images from a page
   *
   * @param url - URL to extract from
   * @returns Extracted content result with images array
   */
  async extractImages(url: string): Promise<ExtractResult> {
    return this.extract({ url, type: 'images' });
  }

  /**
   * Extract page metadata (title, description, OG tags, etc.)
   *
   * @param url - URL to extract from
   * @returns Extracted content result with metadata
   */
  async extractMetadata(url: string): Promise<ExtractResult> {
    return this.extract({ url, type: 'metadata' });
  }

  /**
   * Analyze a webpage using AI
   *
   * @param options - Analyze options
   * @returns AI analysis result
   *
   * @example
   * ```typescript
   * const result = await client.analyze({
   *   url: 'https://example.com',
   *   prompt: 'Summarize the main content of this page',
   *   provider: 'openai',
   *   apiKey: 'sk-...'
   * });
   * console.log(result.result);
   * ```
   */
  async analyze(options: AnalyzeOptions): Promise<AnalyzeResult> {
    if (!options.url) {
      throw new Error('URL is required');
    }
    if (!options.prompt) {
      throw new Error('Prompt is required');
    }
    if (!options.provider) {
      throw new Error('Provider is required');
    }
    if (!options.apiKey) {
      throw new Error('API key for AI provider is required');
    }

    const response = await this.request('/v1/analyze', {
      method: 'POST',
      body: JSON.stringify(options),
    });

    return response.json() as Promise<AnalyzeResult>;
  }

  /**
   * Generate a PDF from a URL or HTML content
   *
   * @param options - PDF options
   * @returns Binary PDF data
   *
   * @example
   * ```typescript
   * const pdf = await client.pdf({
   *   url: 'https://example.com',
   *   pdfOptions: {
   *     pageSize: 'a4',
   *     marginTop: '20mm',
   *     marginBottom: '20mm'
   *   }
   * });
   * fs.writeFileSync('document.pdf', pdf);
   * ```
   */
  async pdf(options: Omit<ScreenshotOptions, 'format'>): Promise<Buffer> {
    if (!options.url && !options.html) {
      throw new Error('Either url or html is required');
    }

    const response = await this.request('/v1/pdf', {
      method: 'POST',
      body: JSON.stringify({ ...options, format: 'pdf' }),
    });

    return Buffer.from(await response.arrayBuffer());
  }

  /**
   * Capture a video of a webpage with optional scroll animation
   *
   * @param options - Video options
   * @returns Video result or binary data
   *
   * @example
   * ```typescript
   * // Capture a scroll video
   * const video = await client.video({
   *   url: 'https://example.com',
   *   format: 'mp4',
   *   scroll: true,
   *   scrollDuration: 1500,
   *   scrollEasing: 'ease_in_out',
   *   scrollBack: true
   * });
   * fs.writeFileSync('scroll.mp4', video);
   * ```
   */
  async video(options: VideoOptions): Promise<VideoResult | Buffer> {
    if (!options.url) {
      throw new Error('URL is required');
    }

    const response = await this.request('/v1/video', {
      method: 'POST',
      body: JSON.stringify(options),
    });

    if (options.responseType === 'binary' || !options.responseType) {
      return Buffer.from(await response.arrayBuffer());
    }

    return response.json() as Promise<VideoResult>;
  }

  /**
   * Capture screenshots of multiple URLs
   *
   * @param options - Batch options with array of URLs
   * @returns Batch job result
   *
   * @example
   * ```typescript
   * const batch = await client.batch({
   *   urls: ['https://example.com', 'https://example.org'],
   *   format: 'png',
   *   webhookUrl: 'https://your-server.com/webhook'
   * });
   * console.log(batch.jobId);
   * ```
   */
  async batch(options: BatchOptions): Promise<BatchResult> {
    if (!options.urls || options.urls.length === 0) {
      throw new Error('URLs array is required');
    }

    const response = await this.request('/v1/screenshot/batch', {
      method: 'POST',
      body: JSON.stringify(options),
    });

    return response.json() as Promise<BatchResult>;
  }

  /**
   * Check the status of a batch job
   *
   * @param jobId - The batch job ID
   * @returns Batch job status and results
   */
  async getBatchStatus(jobId: string): Promise<BatchResult> {
    const response = await this.request(`/v1/screenshot/batch/${jobId}`);
    return response.json() as Promise<BatchResult>;
  }

  /**
   * Get available device presets
   *
   * @returns Device presets grouped by category
   */
  async getDevices(): Promise<DevicesResult> {
    const response = await this.request('/v1/devices');
    return response.json() as Promise<DevicesResult>;
  }

  /**
   * Get API capabilities and features
   *
   * @returns API capabilities
   */
  async getCapabilities(): Promise<CapabilitiesResult> {
    const response = await this.request('/v1/capabilities');
    return response.json() as Promise<CapabilitiesResult>;
  }

  /**
   * Get your API usage statistics
   *
   * @returns Usage statistics
   */
  async getUsage(): Promise<UsageResult> {
    const response = await this.request('/v1/usage');
    return response.json() as Promise<UsageResult>;
  }

  private async request(path: string, init?: RequestInit): Promise<Response> {
    const url = `${this.baseUrl}${path}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...init,
        headers: {
          'X-Api-Key': this.apiKey,
          'Content-Type': 'application/json',
          'User-Agent': 'snapapi-js/1.2.0',
          ...init?.headers,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        const error = await this.parseError(response);
        throw error;
      }

      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async parseError(response: Response): Promise<SnapAPIError> {
    let body: { error?: { code?: string; message?: string; details?: Record<string, unknown> } } = {};

    try {
      body = await response.json();
    } catch {
      // Ignore JSON parse errors
    }

    const error = new Error(body.error?.message || `HTTP ${response.status}`) as SnapAPIError;
    error.code = body.error?.code || 'UNKNOWN_ERROR';
    error.statusCode = response.status;
    error.details = body.error?.details;

    return error;
  }
}

// Default export
export default SnapAPI;

// Convenience function
export function createClient(config: SnapAPIConfig): SnapAPI {
  return new SnapAPI(config);
}
