/**
 * SnapAPI custom error classes.
 *
 * @module errors
 */

/**
 * Base error class for all SnapAPI errors.
 * Extends the native Error with `code` and `statusCode` fields.
 */
export class SnapAPIError extends Error {
  /** Machine-readable error code returned by the API (e.g. `UNAUTHORIZED`) */
  readonly code: string;
  /** HTTP status code (0 when no response was received) */
  readonly statusCode: number;
  /** Extra detail payload from the API response, if present */
  readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    code: string,
    statusCode: number,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'SnapAPIError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    // Restore prototype chain in transpiled environments
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when the API returns HTTP 429 Too Many Requests.
 * The `retryAfter` field indicates how many seconds to wait before retrying.
 */
export class RateLimitError extends SnapAPIError {
  /** Seconds to wait before the next request (from `Retry-After` header) */
  readonly retryAfter: number;

  constructor(message: string, retryAfter: number, details?: Record<string, unknown>) {
    super(message, 'RATE_LIMITED', 429, details);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when the API returns HTTP 401 Unauthorized or 403 Forbidden.
 */
export class AuthenticationError extends SnapAPIError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'UNAUTHORIZED', 401, details);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when the API returns HTTP 422 Unprocessable Entity (validation failure).
 */
export class ValidationError extends SnapAPIError {
  /** Per-field validation messages, if the API provides them */
  readonly fields: Record<string, string>;

  constructor(message: string, fields: Record<string, string> = {}, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 422, details);
    this.name = 'ValidationError';
    this.fields = fields;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when the account has exhausted its API quota (HTTP 402 or specific error code).
 */
export class QuotaExceededError extends SnapAPIError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'QUOTA_EXCEEDED', 402, details);
    this.name = 'QuotaExceededError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when the request times out before the API responds.
 */
export class TimeoutError extends SnapAPIError {
  constructor(message = 'Request timed out') {
    super(message, 'TIMEOUT', 0);
    this.name = 'TimeoutError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when a network-level error prevents the request from reaching the API
 * (e.g. DNS failure, connection refused, no internet).
 * `statusCode` is `0` because no HTTP response was received.
 */
export class NetworkError extends SnapAPIError {
  constructor(message: string) {
    super(message, 'NETWORK_ERROR', 0);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
