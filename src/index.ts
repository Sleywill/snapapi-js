/**
 * SnapAPI JavaScript / TypeScript SDK v3.0.0
 *
 * Official SDK for the SnapAPI screenshot, scrape, extract and
 * AI-analyze service.
 *
 * @example
 * ```typescript
 * import { SnapAPI } from 'snapapi-js';
 *
 * const snap = new SnapAPI({ apiKey: 'sk_live_...' });
 * const buf = await snap.screenshot({ url: 'https://example.com' });
 * ```
 *
 * @packageDocumentation
 */

// Client
export { SnapAPI, createClient } from './client.js';

// Errors
export {
  SnapAPIError,
  RateLimitError,
  AuthenticationError,
  ValidationError,
  QuotaExceededError,
  TimeoutError,
} from './errors.js';

// All public types
export type {
  // Config
  SnapAPIConfig,

  // Screenshot
  ScreenshotOptions,
  ScreenshotStorageResult,
  ScreenshotQueuedResult,

  // Scrape
  ScrapeOptions,
  ScrapeResult,
  ScrapePageResult,
  ScrapeType,

  // Extract
  ExtractOptions,
  ExtractResult,
  ExtractType,

  // PDF
  PdfOptions,

  // Video
  VideoOptions,
  VideoResult,
  VideoFormat,
  ScrollEasing,

  // OG Image
  OgImageOptions,

  // Analyze
  AnalyzeOptions,
  AnalyzeResult,
  AnalyzeProvider,

  // Quota
  AccountUsage,

  // Storage
  StorageFile,
  StorageListResult,
  StorageUsage,
  StorageDestinationConfig,
  S3Config,
  S3TestResult,

  // Scheduled
  CreateScheduledOptions,
  ScheduledScreenshot,

  // Webhooks
  CreateWebhookOptions,
  Webhook,

  // API Keys
  ApiKey,
  CreateApiKeyResult,

  // Shared
  Cookie,
  HttpAuth,
  ProxyConfig,
  Geolocation,
  PdfMargins,
  DevicePreset,
  ImageFormat,
  WaitUntil,
  PageSize,
  StorageDestination,
  DeleteResult,
} from './types.js';

// Default export for convenience
export { SnapAPI as default } from './client.js';
