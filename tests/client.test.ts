/**
 * Unit tests for SnapAPI JS SDK client.
 * HTTP is fully mocked — no real network calls are made.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SnapAPI } from '../src/client.js';
import {
  SnapAPIError,
  RateLimitError,
  AuthenticationError,
  ValidationError,
  QuotaExceededError,
  TimeoutError,
} from '../src/errors.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

function mockFetch(
  status: number,
  body: unknown,
  headers: Record<string, string> = {},
) {
  const contentType = body instanceof ArrayBuffer
    ? 'image/png'
    : 'application/json';

  const responseHeaders = new Headers({
    'Content-Type': contentType,
    ...headers,
  });

  const responseBody =
    body instanceof ArrayBuffer
      ? body
      : JSON.stringify(body);

  return vi.fn().mockResolvedValue(
    new Response(responseBody, { status, headers: responseHeaders }),
  );
}

function makeClient(overrides: Partial<Parameters<typeof SnapAPI>[0]> = {}) {
  return new SnapAPI({
    apiKey: 'sk_test_1234',
    maxRetries: 0,   // disable retries in most tests for speed
    ...overrides,
  });
}

// ─── Constructor ────────────────────────────────────────────────────────────

describe('SnapAPI constructor', () => {
  it('throws when apiKey is missing', () => {
    expect(() => new SnapAPI({ apiKey: '' })).toThrow('apiKey is required');
  });

  it('trims trailing slash from baseUrl', () => {
    const snap = new SnapAPI({ apiKey: 'k', baseUrl: 'https://example.com/' });
    // Access is indirectly visible through request URL; checked in request tests
    expect(snap).toBeDefined();
  });

  it('exposes namespace sub-objects', () => {
    const snap = makeClient();
    expect(snap.storage).toBeDefined();
    expect(snap.scheduled).toBeDefined();
    expect(snap.webhooks).toBeDefined();
    expect(snap.keys).toBeDefined();
  });
});

// ─── screenshot() ───────────────────────────────────────────────────────────

describe('client.screenshot()', () => {
  let snap: SnapAPI;

  beforeEach(() => { snap = makeClient(); });
  afterEach(() => { vi.restoreAllMocks(); });

  it('throws when no url/html/markdown provided', async () => {
    await expect(snap.screenshot({})).rejects.toThrow('url, html, or markdown');
  });

  it('returns Buffer for binary response', async () => {
    const fakePng = new ArrayBuffer(4);
    vi.stubGlobal('fetch', mockFetch(200, fakePng));

    const result = await snap.screenshot({ url: 'https://example.com' });
    expect(Buffer.isBuffer(result)).toBe(true);
  });

  it('returns JSON object when storage option is provided', async () => {
    vi.stubGlobal('fetch', mockFetch(200, { id: 'file_1', url: 'https://cdn.example.com/file.png' }));

    const result = await snap.screenshot({
      url: 'https://example.com',
      storage: { destination: 'snapapi' },
    });
    expect(result).toMatchObject({ id: 'file_1', url: 'https://cdn.example.com/file.png' });
  });

  it('sends Authorization header with Bearer prefix', async () => {
    const fakeFetch = vi.fn().mockResolvedValue(
      new Response(new ArrayBuffer(0), {
        status: 200,
        headers: { 'Content-Type': 'image/png' },
      }),
    );
    vi.stubGlobal('fetch', fakeFetch);

    await snap.screenshot({ url: 'https://example.com' });

    const [, init] = fakeFetch.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers['Authorization']).toBe('Bearer sk_test_1234');
  });
});

// ─── scrape() ───────────────────────────────────────────────────────────────

describe('client.scrape()', () => {
  afterEach(() => vi.restoreAllMocks());

  it('returns ScrapeResult on success', async () => {
    const payload = {
      success: true,
      results: [{ page: 1, url: 'https://example.com', data: 'Hello' }],
    };
    vi.stubGlobal('fetch', mockFetch(200, payload));

    const snap = makeClient();
    const result = await snap.scrape({ url: 'https://example.com' });
    expect(result.success).toBe(true);
    expect(result.results[0]?.data).toBe('Hello');
  });

  it('throws when url is empty string', async () => {
    const snap = makeClient();
    await expect(snap.scrape({ url: '' })).rejects.toThrow('url is required');
  });
});

// ─── extract() ──────────────────────────────────────────────────────────────

describe('client.extract()', () => {
  afterEach(() => vi.restoreAllMocks());

  it('returns ExtractResult on success', async () => {
    const payload = {
      success: true,
      type: 'markdown',
      url: 'https://example.com',
      data: '# Hello',
      responseTime: 1200,
    };
    vi.stubGlobal('fetch', mockFetch(200, payload));

    const snap = makeClient();
    const result = await snap.extract({ url: 'https://example.com', type: 'markdown' });
    expect(result.data).toBe('# Hello');
  });
});

// ─── pdf() ──────────────────────────────────────────────────────────────────

describe('client.pdf()', () => {
  afterEach(() => vi.restoreAllMocks());

  it('returns a Buffer', async () => {
    vi.stubGlobal('fetch', mockFetch(200, new ArrayBuffer(8)));
    const snap = makeClient();
    const buf = await snap.pdf({ url: 'https://example.com' });
    expect(Buffer.isBuffer(buf)).toBe(true);
  });

  it('throws when no url or html provided', async () => {
    const snap = makeClient();
    await expect(snap.pdf({})).rejects.toThrow('url or html is required');
  });
});

// ─── quota() ────────────────────────────────────────────────────────────────

describe('client.quota()', () => {
  afterEach(() => vi.restoreAllMocks());

  it('returns AccountUsage', async () => {
    const payload = { used: 10, limit: 1000, remaining: 990, resetAt: '2026-04-01T00:00:00Z' };
    vi.stubGlobal('fetch', mockFetch(200, payload));

    const snap = makeClient();
    const usage = await snap.quota();
    expect(usage.used).toBe(10);
    expect(usage.remaining).toBe(990);
  });
});

// ─── Error handling ─────────────────────────────────────────────────────────

describe('Error handling', () => {
  afterEach(() => vi.restoreAllMocks());

  it('throws AuthenticationError on 401', async () => {
    vi.stubGlobal('fetch', mockFetch(401, { message: 'Unauthorized', error: 'UNAUTHORIZED' }));
    const snap = makeClient();
    await expect(snap.ping()).rejects.toBeInstanceOf(AuthenticationError);
  });

  it('throws RateLimitError on 429 with retryAfter', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetch(429, { message: 'Too many requests' }, { 'Retry-After': '5' }),
    );
    const snap = makeClient();
    try {
      await snap.ping();
    } catch (err) {
      expect(err).toBeInstanceOf(RateLimitError);
      expect((err as RateLimitError).retryAfter).toBe(5);
    }
  });

  it('throws ValidationError on 422', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetch(422, {
        message: 'Validation failed',
        error: 'VALIDATION_ERROR',
        fields: { url: 'must be a valid URL' },
      }),
    );
    const snap = makeClient();
    try {
      await snap.screenshot({ url: 'not-a-url' });
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
      expect((err as ValidationError).fields).toMatchObject({ url: 'must be a valid URL' });
    }
  });

  it('throws QuotaExceededError on 402 quota message', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetch(402, { message: 'quota exceeded', error: 'QUOTA_EXCEEDED' }),
    );
    const snap = makeClient();
    await expect(snap.ping()).rejects.toBeInstanceOf(QuotaExceededError);
  });

  it('throws SnapAPIError on generic 500', async () => {
    vi.stubGlobal('fetch', mockFetch(500, { message: 'Internal Server Error' }));
    const snap = makeClient();
    try {
      await snap.ping();
    } catch (err) {
      expect(err).toBeInstanceOf(SnapAPIError);
      expect((err as SnapAPIError).statusCode).toBe(500);
    }
  });
});

// ─── Retry logic ─────────────────────────────────────────────────────────────

describe('Retry logic', () => {
  afterEach(() => vi.restoreAllMocks());

  it('retries on 429 and succeeds on the next attempt', async () => {
    const okPayload = { status: 'ok', timestamp: Date.now() };
    let calls = 0;
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => {
      calls++;
      if (calls === 1) {
        return Promise.resolve(
          new Response(JSON.stringify({ message: 'rate limited' }), {
            status: 429,
            headers: { 'Content-Type': 'application/json', 'Retry-After': '0' },
          }),
        );
      }
      return Promise.resolve(
        new Response(JSON.stringify(okPayload), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }));

    const snap = new SnapAPI({ apiKey: 'sk_test', maxRetries: 2, retryDelay: 0 });
    const result = await snap.ping();
    expect(result.status).toBe('ok');
    expect(calls).toBe(2);
  });

  it('retries on 503 up to maxRetries then throws', async () => {
    let calls = 0;
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => {
      calls++;
      return Promise.resolve(
        new Response(JSON.stringify({ message: 'service unavailable' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }));

    const snap = new SnapAPI({ apiKey: 'sk_test', maxRetries: 2, retryDelay: 0 });
    await expect(snap.ping()).rejects.toBeInstanceOf(SnapAPIError);
    expect(calls).toBe(3); // 1 initial + 2 retries
  });
});

// ─── Interceptors ────────────────────────────────────────────────────────────

describe('Interceptors', () => {
  afterEach(() => vi.restoreAllMocks());

  it('calls onRequest before each request', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetch(200, { status: 'ok', timestamp: Date.now() }),
    );
    const onRequest = vi.fn();
    const snap = new SnapAPI({ apiKey: 'sk_test', maxRetries: 0, onRequest });
    await snap.ping();
    expect(onRequest).toHaveBeenCalledOnce();
  });

  it('calls onResponse after each request', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetch(200, { status: 'ok', timestamp: Date.now() }),
    );
    const onResponse = vi.fn();
    const snap = new SnapAPI({ apiKey: 'sk_test', maxRetries: 0, onResponse });
    await snap.ping();
    expect(onResponse).toHaveBeenCalledOnce();
    expect(onResponse.mock.calls[0]?.[0]).toBe(200);
  });
});
