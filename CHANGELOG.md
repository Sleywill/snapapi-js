# Changelog

All notable changes to `snapapi-js` are documented in this file.

## [3.0.0] — 2026-03-14

### Breaking Changes
- Package renamed from `@snapapi/sdk` to `snapapi-js` for npm discoverability.
- Default export is still `SnapAPI`; named export `createClient` added.
- `client.usage()` is deprecated in favour of `client.quota()` (maps to `/v1/quota`).
- Node.js minimum version raised from 16 to 18 (native `fetch` required).
- CJS output extension changed to `.cjs` (ESM remains `.js`).

### Added
- `client.pdf(options)` — dedicated PDF method (no longer requires `format:'pdf'` on screenshot).
- `client.ogImage(options)` — OG image generation helper.
- `client.quota()` — correct endpoint `/v1/quota` for quota check.
- Typed error classes: `RateLimitError`, `AuthenticationError`, `ValidationError`, `QuotaExceededError`, `TimeoutError` — all extend `SnapAPIError`.
- Automatic retry logic with exponential backoff (configurable via `maxRetries` and `retryDelay`).
- Rate-limit auto-wait: respects `Retry-After` response header on HTTP 429.
- Configurable per-client request / response interceptors (`onRequest`, `onResponse`).
- `TimeoutError` thrown (instead of a generic error) when request exceeds `timeout`.
- `Authorization: Bearer <key>` header (was `x-api-key`).
- Full TypeScript strict mode; `noUncheckedIndexedAccess` enabled.
- `tsup.config.ts` for reproducible dual ESM/CJS build.
- `vitest.config.ts` + comprehensive unit test suite with mocked HTTP.
- Integration test script (`tests/integration.ts`) for live API verification.
- ESLint configuration.
- `CHANGELOG.md`.

### Changed
- Source split into focused modules: `errors.ts`, `types.ts`, `http.ts`, `namespaces.ts`, `client.ts`.
- All types moved to `types.ts` and re-exported from the barrel `index.ts`.
- `_request` made strongly typed and moved to `http.ts`.
- README completely rewritten with tables for every option and every method.
- `engines.node` bumped to `>=18.0.0`.

### Fixed
- `SnapAPIError` prototype chain broken in transpiled environments — fixed with `Object.setPrototypeOf`.
- Missing `retryAfter` field on rate-limit errors.
- Timeout `AbortController` leak on retry paths — `clearTimeout` is now called in a `finally` block.

## [2.0.0] — 2025-12

- Initial public release with screenshot, scrape, extract, analyze, video, storage, scheduled, webhooks, keys.
