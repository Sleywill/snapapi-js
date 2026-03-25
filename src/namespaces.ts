/**
 * Sub-namespace classes for storage, scheduled jobs, webhooks, and API keys.
 *
 * @module namespaces
 * @internal
 */

import type {
  StorageFile,
  StorageListResult,
  StorageUsage,
  S3Config,
  S3TestResult,
  CreateScheduledOptions,
  ScheduledScreenshot,
  CreateWebhookOptions,
  Webhook,
  ApiKey,
  CreateApiKeyResult,
  DeleteResult,
} from './types.js';

type Req = (path: string, init?: RequestInit) => Promise<Response>;

/**
 * Manages files stored in SnapAPI cloud or user-configured S3.
 *
 * Access via `client.storage`.
 *
 * @example
 * ```typescript
 * const { files } = await client.storage.listFiles();
 * const usage = await client.storage.getUsage();
 * await client.storage.deleteFile('file_id_here');
 * ```
 */
export class StorageNamespace {
  constructor(private readonly _req: Req) {}

  /**
   * List stored files.
   *
   * @param limit  Maximum results per page (default: 50)
   * @param offset Pagination offset (default: 0)
   */
  async listFiles(limit = 50, offset = 0): Promise<StorageListResult> {
    const res = await this._req(`/v1/storage/files?limit=${limit}&offset=${offset}`);
    return res.json() as Promise<StorageListResult>;
  }

  /**
   * Get metadata and download URL for a specific stored file.
   *
   * @param id File ID
   */
  async getFile(id: string): Promise<StorageFile> {
    const res = await this._req(`/v1/storage/files/${encodeURIComponent(id)}`);
    return res.json() as Promise<StorageFile>;
  }

  /**
   * Delete a stored file.
   *
   * @param id File ID
   */
  async deleteFile(id: string): Promise<DeleteResult> {
    const res = await this._req(`/v1/storage/files/${encodeURIComponent(id)}`, { method: 'DELETE' });
    return res.json() as Promise<DeleteResult>;
  }

  /**
   * Get the current storage usage for this account.
   */
  async getUsage(): Promise<StorageUsage> {
    const res = await this._req('/v1/storage/usage');
    return res.json() as Promise<StorageUsage>;
  }

  /**
   * Configure a custom S3-compatible storage backend.
   *
   * @param config S3 credentials and bucket information
   */
  async configureS3(config: S3Config): Promise<{ success: boolean }> {
    const res = await this._req('/v1/storage/s3', {
      method: 'POST',
      body: JSON.stringify(config),
    });
    return res.json() as Promise<{ success: boolean }>;
  }

  /**
   * Test the configured S3 connection.
   */
  async testS3(): Promise<S3TestResult> {
    const res = await this._req('/v1/storage/s3/test', { method: 'POST', body: '{}' });
    return res.json() as Promise<S3TestResult>;
  }
}

/**
 * Manage recurring screenshot jobs.
 *
 * Access via `client.scheduled`.
 *
 * @example
 * ```typescript
 * const job = await client.scheduled.create({
 *   url: 'https://example.com',
 *   cronExpression: '0 9 * * *',
 * });
 * console.log(job.id, job.nextRun);
 * ```
 */
export class ScheduledNamespace {
  constructor(private readonly _req: Req) {}

  /**
   * Create a new scheduled screenshot job.
   *
   * @param options Scheduling configuration
   */
  async create(options: CreateScheduledOptions): Promise<ScheduledScreenshot> {
    const res = await this._req('/v1/scheduled', {
      method: 'POST',
      body: JSON.stringify(options),
    });
    return res.json() as Promise<ScheduledScreenshot>;
  }

  /**
   * List all scheduled screenshot jobs for this account.
   */
  async list(): Promise<ScheduledScreenshot[]> {
    const res = await this._req('/v1/scheduled');
    return res.json() as Promise<ScheduledScreenshot[]>;
  }

  /**
   * Delete a scheduled screenshot job.
   *
   * @param id Job ID
   */
  async delete(id: string): Promise<DeleteResult> {
    const res = await this._req(`/v1/scheduled/${encodeURIComponent(id)}`, { method: 'DELETE' });
    return res.json() as Promise<DeleteResult>;
  }
}

/**
 * Manage webhook endpoint registrations.
 *
 * Access via `client.webhooks`.
 *
 * @example
 * ```typescript
 * const wh = await client.webhooks.create({
 *   url: 'https://my-app.com/hooks/snapapi',
 *   events: ['screenshot.done'],
 *   secret: 'my-signing-secret',
 * });
 * ```
 */
export class WebhooksNamespace {
  constructor(private readonly _req: Req) {}

  /**
   * Register a new webhook endpoint.
   *
   * @param options Webhook configuration
   */
  async create(options: CreateWebhookOptions): Promise<Webhook> {
    const res = await this._req('/v1/webhooks', {
      method: 'POST',
      body: JSON.stringify(options),
    });
    return res.json() as Promise<Webhook>;
  }

  /**
   * List all registered webhooks.
   */
  async list(): Promise<Webhook[]> {
    const res = await this._req('/v1/webhooks');
    return res.json() as Promise<Webhook[]>;
  }

  /**
   * Delete a webhook.
   *
   * @param id Webhook ID
   */
  async delete(id: string): Promise<DeleteResult> {
    const res = await this._req(`/v1/webhooks/${encodeURIComponent(id)}`, { method: 'DELETE' });
    return res.json() as Promise<DeleteResult>;
  }
}

/**
 * Manage API keys programmatically.
 *
 * Access via `client.keys`.
 *
 * @example
 * ```typescript
 * const { key } = await client.keys.create('production');
 * console.log(key); // full key — store securely!
 * ```
 */
export class KeysNamespace {
  constructor(private readonly _req: Req) {}

  /**
   * List all API keys. Key values are masked.
   */
  async list(): Promise<ApiKey[]> {
    const res = await this._req('/v1/keys');
    return res.json() as Promise<ApiKey[]>;
  }

  /**
   * Create a new API key.
   * The full key value is returned only once — store it securely.
   *
   * @param name Human-readable label for the key
   */
  async create(name: string): Promise<CreateApiKeyResult> {
    const res = await this._req('/v1/keys', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
    return res.json() as Promise<CreateApiKeyResult>;
  }

  /**
   * Delete an API key.
   *
   * @param id Key ID
   */
  async delete(id: string): Promise<DeleteResult> {
    const res = await this._req(`/v1/keys/${encodeURIComponent(id)}`, { method: 'DELETE' });
    return res.json() as Promise<DeleteResult>;
  }
}
