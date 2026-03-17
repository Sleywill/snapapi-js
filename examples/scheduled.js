// examples/scheduled.js — snapapi-js v3
// Demonstrates: Scheduled screenshots, Webhooks, API Keys
// Run: SNAPAPI_KEY=sk_live_... node examples/scheduled.js

import { SnapAPI } from 'snapapi-js';

const snap = new SnapAPI({ apiKey: process.env.SNAPAPI_KEY ?? '' });

async function scheduledDemo() {
  console.log('=== Scheduled Screenshots ===');

  // Create a scheduled job – every day at 09:00 UTC
  const job = await snap.scheduled.create({
    url: 'https://example.com',
    cronExpression: '0 9 * * *',
    format: 'png',
    width: 1280,
    height: 800,
    fullPage: true,
    webhookUrl: 'https://webhook.site/your-id',
  });
  console.log('Created job:', job.id, 'next run:', job.nextRun);

  // List all scheduled jobs
  const jobs = await snap.scheduled.list();
  console.log('All jobs:', jobs.map(j => `${j.id} (${j.cronExpression})`));

  // Delete the job
  const del = await snap.scheduled.delete(job.id);
  console.log('Deleted:', del.success);
}

async function webhooksDemo() {
  console.log('\n=== Webhooks ===');

  // Register a webhook
  const wh = await snap.webhooks.create({
    url: 'https://webhook.site/your-id',
    events: ['screenshot.done'],
    secret: 'my-signing-secret',
  });
  console.log('Webhook created:', wh.id);

  // List webhooks
  const list = await snap.webhooks.list();
  console.log('Webhooks:', list.map(w => `${w.id} -> ${w.url}`));

  // Delete
  await snap.webhooks.delete(wh.id);
  console.log('Webhook deleted');
}

async function keysDemo() {
  console.log('\n=== API Keys ===');

  // List existing keys (values are masked)
  const existing = await snap.keys.list();
  console.log('Existing keys:', existing.map(k => `${k.name} (${k.key})`));

  // Create a new key
  const newKey = await snap.keys.create('ci-pipeline');
  console.log('New key created!');
  console.log('  Name:', newKey.name);
  console.log('  Key (save this!):', newKey.key);

  // Delete the new key
  await snap.keys.delete(newKey.id);
  console.log('Key deleted');
}

await scheduledDemo();
await webhooksDemo();
await keysDemo();
