/**
 * Unit tests for SnapAPI JS SDK client.
 * HTTP is fully mocked -- no real network calls are made.
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
  NetworkError,
} from '../src/errors.js';

// --- Helpers -----------------------------------------------------------------

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

function makeClient(overrides: Partial<ConstructorParameters<typeof SnapAPI>[0]> = {}) {
  return new SnapAPI({
    apiKey: 'sk_test_1234',
    maxRetries: 0,   // disable retries in most tests for speed
    ...overrides,
  });
}

// --- Constructor -------------------------------------------------------------

describe('SnapAPI constructor', () => {
  it('throws when apiKey is missing', () => {
    expect(() => new SnapAPI({ apiKey: '' })).toThrow('apiKey is required');
  });

  it('trims trailing slash from baseUrl', () => {
    const snap = new SnapAPI({ apiKey: 'k', baseUrl: 'https://example.com/' });
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

// --- screenshot() ------------------------------------------------------------

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

  it('sends both X-Api-Key and Authorization headers', async () => {
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
    expect(headers['X-Api-Key']).toBe('sk_test_1234');
  });

  it('accepts html option', async () => {
    vi.stubGlobal('fetch', mockFetch(200, new ArrayBuffer(4)));
    const result = await snap.screenshot({ html: '<h1>Hello</h1>' });
    expect(Buffer.isBuffer(result)).toBe(true);
  });

  it('accepts markdown option', async () => {
    vi.stubGlobal('fetch', mockFetch(200, new ArrayBuffer(4)));
    const result = await snap.screenshot({ markdown: '# Hello' });
    expect(Buffer.isBuffer(result)).toBe(true);
  });
});

// --- screenshotToFile() ------------------------------------------------------

vi.mock('node:fs/promises', () => ({
  writeFile: vi.fn().mockResolvedValue(undefined),
}));

describe('client.screenshotToFile()', () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it('returns a Buffer after saving', async () => {
    const fakePng = new ArrayBuffer(8);
    vi.stubGlobal('fetch', mockFetch(200, fakePng));

    const snap = makeClient();
    const result = await snap.screenshotToFile('https://example.com', '/tmp/test.png');
    expect(Buffer.isBuffer(result)).toBe(true);
  });
});

// --- scrape() ----------------------------------------------------------------

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

// --- extract() ---------------------------------------------------------------

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

  it('throws when url is empty', async () => {
    const snap = makeClient();
    await expect(snap.extract({ url: '' })).rejects.toThrow('url is required');
  });
});

// --- pdf() -------------------------------------------------------------------

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

  it('accepts html option', async () => {
    vi.stubGlobal('fetch', mockFetch(200, new ArrayBuffer(8)));
    const snap = makeClient();
    const buf = await snap.pdf({ html: '<h1>Hello</h1>' });
    expect(Buffer.isBuffer(buf)).toBe(true);
  });
});

// --- video() -----------------------------------------------------------------

describe('client.video()', () => {
  afterEach(() => vi.restoreAllMocks());

  it('returns Buffer for binary response', async () => {
    vi.stubGlobal('fetch', mockFetch(200, new ArrayBuffer(16)));
    const snap = makeClient();
    const buf = await snap.video({ url: 'https://example.com', duration: 3 });
    expect(Buffer.isBuffer(buf)).toBe(true);
  });

  it('returns VideoResult for JSON response', async () => {
    const payload = {
      data: 'base64...',
      mimeType: 'video/webm',
      format: 'webm',
      width: 1280,
      height: 720,
      duration: 5,
      size: 12345,
    };
    vi.stubGlobal('fetch', mockFetch(200, payload));
    const snap = makeClient();
    const result = await snap.video({ url: 'https://example.com' });
    expect(result).toMatchObject({ format: 'webm', width: 1280 });
  });

  it('throws when url is missing', async () => {
    const snap = makeClient();
    // @ts-expect-error testing runtime validation
    await expect(snap.video({ url: '' })).rejects.toThrow('url is required');
  });
});

// --- ogImage() ---------------------------------------------------------------

describe('client.ogImage()', () => {
  afterEach(() => vi.restoreAllMocks());

  it('returns Buffer', async () => {
    vi.stubGlobal('fetch', mockFetch(200, new ArrayBuffer(4)));
    const snap = makeClient();
    const buf = await snap.ogImage({ url: 'https://example.com' });
    expect(Buffer.isBuffer(buf)).toBe(true);
  });

  it('throws when url is missing', async () => {
    const snap = makeClient();
    // @ts-expect-error testing runtime validation
    await expect(snap.ogImage({ url: '' })).rejects.toThrow('url is required');
  });
});

// --- analyze() ---------------------------------------------------------------

describe('client.analyze()', () => {
  afterEach(() => vi.restoreAllMocks());

  it('returns AnalyzeResult on success', async () => {
    const payload = {
      success: true,
      url: 'https://example.com',
      analysis: 'This page is about testing.',
      provider: 'openai',
      model: 'gpt-4o',
      responseTime: 3500,
    };
    vi.stubGlobal('fetch', mockFetch(200, payload));

    const snap = makeClient();
    const result = await snap.analyze({
      url: 'https://example.com',
      prompt: 'Summarize this page.',
      provider: 'openai',
      apiKey: 'sk-test',
    });
    expect(result.success).toBe(true);
    expect(result.analysis).toBe('This page is about testing.');
  });

  it('throws when url is missing', async () => {
    const snap = makeClient();
    await expect(snap.analyze({ url: '', prompt: 'test' })).rejects.toThrow('url is required');
  });

  it('throws when prompt is missing', async () => {
    const snap = makeClient();
    await expect(snap.analyze({ url: 'https://example.com', prompt: '' })).rejects.toThrow('prompt is required');
  });
});

// --- getUsage() / quota() ----------------------------------------------------

describe('client.getUsage()', () => {
  afterEach(() => vi.restoreAllMocks());

  it('returns AccountUsage', async () => {
    const payload = { used: 10, limit: 1000, remaining: 990, resetAt: '2026-04-01T00:00:00Z' };
    vi.stubGlobal('fetch', mockFetch(200, payload));

    const snap = makeClient();
    const usage = await snap.getUsage();
    expect(usage.used).toBe(10);
    expect(usage.remaining).toBe(990);
  });

  it('quota() is an alias for getUsage()', async () => {
    const payload = { used: 5, limit: 500, remaining: 495 };
    vi.stubGlobal('fetch', mockFetch(200, payload));

    const snap = makeClient();
    const usage = await snap.quota();
    expect(usage.used).toBe(5);
  });
});

// --- ping() ------------------------------------------------------------------

describe('client.ping()', () => {
  afterEach(() => vi.restoreAllMocks());

  it('returns status ok', async () => {
    vi.stubGlobal('fetch', mockFetch(200, { status: 'ok', timestamp: Date.now() }));
    const snap = makeClient();
    const result = await snap.ping();
    expect(result.status).toBe('ok');
  });
});

// --- Error handling ----------------------------------------------------------

describe('Error handling', () => {
  afterEach(() => vi.restoreAllMocks());

  it('throws AuthenticationError on 401', async () => {
    vi.stubGlobal('fetch', mockFetch(401, { message: 'Unauthorized', error: 'UNAUTHORIZED' }));
    const snap = makeClient();
    await expect(snap.ping()).rejects.toBeInstanceOf(AuthenticationError);
  });

  it('throws AuthenticationError on 403', async () => {
    vi.stubGlobal('fetch', mockFetch(403, { message: 'Forbidden', error: 'FORBIDDEN' }));
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

  it('throws ValidationError on 422 with field details', async () => {
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

  it('throws TimeoutError when request times out', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(Object.assign(new Error('aborted'), { name: 'AbortError' })));
    const snap = new SnapAPI({ apiKey: 'sk_test', maxRetries: 0, timeout: 100 });
    await expect(snap.ping()).rejects.toBeInstanceOf(TimeoutError);
  });

  it('throws SnapAPIError on network errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')));
    const snap = makeClient();
    await expect(snap.ping()).rejects.toBeInstanceOf(SnapAPIError);
  });
});

// --- Retry logic -------------------------------------------------------------

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

  it('does not retry on 401 (non-retryable)', async () => {
    let calls = 0;
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => {
      calls++;
      return Promise.resolve(
        new Response(JSON.stringify({ message: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }));

    const snap = new SnapAPI({ apiKey: 'sk_test', maxRetries: 3, retryDelay: 0 });
    await expect(snap.ping()).rejects.toBeInstanceOf(AuthenticationError);
    expect(calls).toBe(1); // no retries
  });

  it('does not retry on 422 (validation error)', async () => {
    let calls = 0;
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => {
      calls++;
      return Promise.resolve(
        new Response(JSON.stringify({ message: 'Bad input', error: 'VALIDATION_ERROR' }), {
          status: 422,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }));

    const snap = new SnapAPI({ apiKey: 'sk_test', maxRetries: 3, retryDelay: 0 });
    await expect(snap.screenshot({ url: 'bad' })).rejects.toBeInstanceOf(ValidationError);
    expect(calls).toBe(1);
  });
});

// --- Interceptors ------------------------------------------------------------

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

  it('onRequest receives the correct URL', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetch(200, { status: 'ok', timestamp: Date.now() }),
    );
    const onRequest = vi.fn();
    const snap = new SnapAPI({ apiKey: 'sk_test', maxRetries: 0, onRequest });
    await snap.ping();
    expect(onRequest.mock.calls[0]?.[0]).toContain('/v1/ping');
  });
});

// --- Error class properties --------------------------------------------------

describe('Error class structure', () => {
  it('SnapAPIError has code, statusCode, and name', () => {
    const err = new SnapAPIError('test', 'TEST_CODE', 418);
    expect(err.code).toBe('TEST_CODE');
    expect(err.statusCode).toBe(418);
    expect(err.name).toBe('SnapAPIError');
    expect(err.message).toBe('test');
    expect(err instanceof Error).toBe(true);
  });

  it('RateLimitError has retryAfter', () => {
    const err = new RateLimitError('too fast', 10);
    expect(err.retryAfter).toBe(10);
    expect(err.statusCode).toBe(429);
    expect(err instanceof SnapAPIError).toBe(true);
  });

  it('AuthenticationError is instanceof SnapAPIError', () => {
    const err = new AuthenticationError('bad key');
    expect(err instanceof SnapAPIError).toBe(true);
    expect(err.statusCode).toBe(401);
  });

  it('ValidationError has fields record', () => {
    const err = new ValidationError('bad', { url: 'invalid' });
    expect(err.fields.url).toBe('invalid');
    expect(err.statusCode).toBe(422);
  });

  it('QuotaExceededError has 402 statusCode', () => {
    const err = new QuotaExceededError('exceeded');
    expect(err.statusCode).toBe(402);
  });

  it('TimeoutError has 0 statusCode', () => {
    const err = new TimeoutError();
    expect(err.statusCode).toBe(0);
    expect(err.code).toBe('TIMEOUT');
  });
});
