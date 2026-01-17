/**
 * SnapAPI JavaScript/TypeScript SDK
 * Lightning-fast screenshot API for developers
 *
 * @packageDocumentation
 */

export interface ScreenshotOptions {
  /** URL to capture (required) */
  url: string;
  /** Output format: 'png' | 'jpeg' | 'webp' | 'pdf' */
  format?: 'png' | 'jpeg' | 'webp' | 'pdf';
  /** Viewport width in pixels (100-3840) */
  width?: number;
  /** Viewport height in pixels (100-2160) */
  height?: number;
  /** Capture the full scrollable page */
  fullPage?: boolean;
  /** Image quality 1-100 (JPEG/WebP only) */
  quality?: number;
  /** Device scale factor 0.5-3 */
  scale?: number;
  /** Delay in ms before capture (0-10000) */
  delay?: number;
  /** Max wait time in ms (1000-60000) */
  timeout?: number;
  /** Emulate dark mode preference */
  darkMode?: boolean;
  /** Emulate mobile device */
  mobile?: boolean;
  /** CSS selector to capture specific element */
  selector?: string;
  /** Wait for element to appear before capture */
  waitForSelector?: string;
  /** JavaScript code to execute before capture */
  javascript?: string;
  /** Block ads and trackers */
  blockAds?: boolean;
  /** Hide cookie consent banners */
  hideCookieBanners?: boolean;
  /** Array of cookies to set */
  cookies?: Cookie[];
  /** Custom HTTP headers */
  headers?: Record<string, string>;
  /** Response type */
  responseType?: 'binary' | 'base64' | 'json';
}

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
  duration: number;
  /** Whether result was from cache */
  cached: boolean;
}

export interface BatchOptions extends Omit<ScreenshotOptions, 'url'> {
  /** Array of URLs to capture */
  urls: string[];
  /** Webhook URL for async notifications */
  webhookUrl?: string;
}

export interface BatchResult {
  /** Batch job ID */
  jobId: string;
  /** Job status */
  status: 'processing' | 'completed' | 'failed';
  /** Estimated completion time in ms */
  estimatedTime?: number;
  /** Results for each URL (when completed) */
  results?: ScreenshotResult[];
}

export interface SnapAPIConfig {
  /** Your API key */
  apiKey: string;
  /** Base URL (default: https://api.snapapi.dev) */
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
    this.baseUrl = config.baseUrl || 'https://api.snapapi.dev';
    this.timeout = config.timeout || 60000;
  }

  /**
   * Capture a screenshot of the specified URL
   *
   * @param options - Screenshot options
   * @returns Screenshot result or binary data
   *
   * @example
   * ```typescript
   * // Get screenshot as base64 JSON
   * const result = await client.screenshot({
   *   url: 'https://example.com',
   *   format: 'png',
   *   responseType: 'json'
   * });
   * console.log(result.data); // base64 string
   *
   * // Get screenshot as binary buffer
   * const buffer = await client.screenshot({
   *   url: 'https://example.com',
   *   responseType: 'binary'
   * });
   * fs.writeFileSync('screenshot.png', buffer);
   * ```
   */
  async screenshot(options: ScreenshotOptions): Promise<ScreenshotResult | Buffer> {
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
   * Get your API usage statistics
   *
   * @returns Usage statistics
   */
  async getUsage(): Promise<{
    used: number;
    limit: number;
    remaining: number;
    resetAt: string;
  }> {
    const response = await this.request('/v1/usage');
    return response.json();
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
          'User-Agent': 'snapapi-js/1.0.0',
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
