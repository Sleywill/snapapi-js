/**
 * Internal HTTP transport layer with retry logic, timeout handling,
 * and interceptor support.
 *
 * @module http
 * @internal
 */

import {
  SnapAPIError,
  RateLimitError,
  AuthenticationError,
  ValidationError,
  QuotaExceededError,
  TimeoutError,
  NetworkError,
} from './errors.js';
import type { SnapAPIConfig } from './types.js';

const SDK_VERSION = '3.2.0';
const MAX_RETRY_DELAY_MS = 30_000;

/**
 * Parses an API error response into the appropriate SnapAPI error subclass.
 */
async function parseErrorResponse(res: Response): Promise<SnapAPIError> {
  let body: Record<string, unknown> = {};
  try {
    body = (await res.json()) as Record<string, unknown>;
  } catch {
    // non-JSON body — fall through with empty object
  }

  const message = (body.message as string | undefined) || `HTTP ${res.status}`;
  const code = (body.error as string | undefined) || 'UNKNOWN_ERROR';
  const details = body.details as Record<string, unknown> | undefined;

  switch (res.status) {
    case 401:
    case 403:
      return new AuthenticationError(message, details);
    case 402: {
      const errorCode = typeof code === 'string' ? code : 'QUOTA_EXCEEDED';
      if (errorCode.includes('QUOTA') || message.toLowerCase().includes('quota')) {
        return new QuotaExceededError(message, details);
      }
      return new SnapAPIError(message, errorCode, 402, details);
    }
    case 422: {
      const fields = (body.fields as Record<string, string> | undefined) ?? {};
      return new ValidationError(message, fields, details);
    }
    case 429: {
      const retryAfter = Number(res.headers.get('Retry-After') ?? (body.retryAfter as number) ?? 1);
      return new RateLimitError(message, retryAfter, details);
    }
    default:
      return new SnapAPIError(message, code, res.status, details);
  }
}

/**
 * Determines whether a given error warrants an automatic retry.
 */
function isRetryable(error: unknown): boolean {
  if (error instanceof RateLimitError) return true;
  if (error instanceof NetworkError) return true;
  if (error instanceof SnapAPIError) {
    return error.statusCode >= 500;
  }
  return false;
}

/**
 * Sleeps for `ms` milliseconds, returning a cancellable promise.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Executes an HTTP request against the SnapAPI, handling retries,
 * rate-limit back-off, timeouts, and interceptor hooks.
 *
 * @internal
 */
export async function executeRequest(
  path: string,
  init: RequestInit,
  config: Required<Pick<SnapAPIConfig, 'apiKey' | 'baseUrl' | 'timeout' | 'maxRetries' | 'retryDelay'>> &
    Pick<SnapAPIConfig, 'onRequest' | 'onResponse'>,
): Promise<Response> {
  const url = `${config.baseUrl}${path}`;

  const baseHeaders: Record<string, string> = {
    'X-Api-Key': config.apiKey,
    'Authorization': `Bearer ${config.apiKey}`,
    'Content-Type': 'application/json',
    'User-Agent': `snapapi-js/${SDK_VERSION}`,
  };

  const mergedInit: RequestInit = {
    ...init,
    headers: {
      ...baseHeaders,
      ...(init.headers as Record<string, string> | undefined),
    },
  };

  let attempt = 0;

  while (true) {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), config.timeout);

    try {
      // Call onRequest interceptor
      if (config.onRequest) {
        await config.onRequest(url, mergedInit);
      }

      let res: Response;
      try {
        res = await fetch(url, { ...mergedInit, signal: ctrl.signal });
      } catch (fetchErr: unknown) {
        clearTimeout(tid);
        const err = fetchErr as Error;
        if (err.name === 'AbortError') {
          throw new TimeoutError(`Request timed out after ${config.timeout}ms`);
        }
        // Network-level error (ECONNREFUSED, DNS failure, etc.)
        const networkErr = new NetworkError(`Network error: ${err.message}`);
        if (attempt < config.maxRetries && isRetryable(networkErr)) {
          attempt++;
          const backoff = Math.min(
            config.retryDelay * Math.pow(2, attempt - 1),
            MAX_RETRY_DELAY_MS,
          );
          await sleep(backoff);
          continue;
        }
        throw networkErr;
      }

      clearTimeout(tid);

      // Call onResponse interceptor
      if (config.onResponse) {
        await config.onResponse(res.status, res);
      }

      if (!res.ok) {
        const err = await parseErrorResponse(res);

        // Auto-retry on rate limit: wait the Retry-After period
        if (err instanceof RateLimitError && attempt < config.maxRetries) {
          attempt++;
          const waitMs = Math.min(err.retryAfter * 1000, MAX_RETRY_DELAY_MS);
          await sleep(waitMs);
          continue;
        }

        // Auto-retry on server errors with exponential backoff
        if (isRetryable(err) && attempt < config.maxRetries) {
          attempt++;
          const backoff = Math.min(
            config.retryDelay * Math.pow(2, attempt - 1),
            MAX_RETRY_DELAY_MS,
          );
          await sleep(backoff);
          continue;
        }

        throw err;
      }

      return res;
    } finally {
      clearTimeout(tid);
    }
  }
}
