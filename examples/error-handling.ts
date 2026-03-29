/**
 * Error handling example demonstrating all error types.
 *
 * Usage:
 *   SNAPAPI_KEY=sk_live_... npx tsx examples/error-handling.ts
 */

import {
  SnapAPI,
  SnapAPIError,
  AuthenticationError,
  RateLimitError,
  ValidationError,
  QuotaExceededError,
  TimeoutError,
  NetworkError,
} from 'snapapi-js';

const snap = new SnapAPI({
  apiKey: process.env.SNAPAPI_KEY!,
  maxRetries: 2,
  timeout: 30_000,
  onRequest: (url, init) => {
    console.log(`-> ${init.method ?? 'GET'} ${url}`);
  },
  onResponse: (status) => {
    console.log(`<- ${status}`);
  },
});

try {
  const buf = await snap.screenshot({ url: 'https://example.com' });
  console.log(`Screenshot captured: ${buf.length} bytes`);
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
    console.error('Request timed out -- try increasing the timeout');
  } else if (err instanceof NetworkError) {
    console.error('Network error:', err.message);
  } else if (err instanceof SnapAPIError) {
    console.error(`API error [${err.code}] HTTP ${err.statusCode}: ${err.message}`);
  } else {
    throw err;
  }
}
