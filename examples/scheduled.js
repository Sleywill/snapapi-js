// examples/scheduled.js – SnapAPI v2 JavaScript SDK
// Demonstrates: Scheduled screenshots, Webhooks, API Keys
const SnapAPI = require('@snapapi/sdk').default;

const client = new SnapAPI({ apiKey: process.env.SNAPAPI_KEY || 'sk_live_YOUR_KEY' });

async function scheduledDemo() {
  console.log('=== Scheduled Screenshots ===');

  // Create a scheduled job – every day at 09:00 UTC
  const job = await client.scheduled.create({
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
  const jobs = await client.scheduled.list();
  console.log('All jobs:', jobs.map(j => `${j.id} (${j.cronExpression})`));

  // Delete the job
  const del = await client.scheduled.delete(job.id);
  console.log('Deleted:', del.success);
}

async function webhooksDemo() {
  console.log('\n=== Webhooks ===');

  // Register a webhook
  const wh = await client.webhooks.create({
    url: 'https://webhook.site/your-id',
    events: ['screenshot.done'],
    secret: 'my-signing-secret',
  });
  console.log('Webhook created:', wh.id);

  // List webhooks
  const list = await client.webhooks.list();
  console.log('Webhooks:', list.map(w => `${w.id} → ${w.url}`));

  // Delete
  await client.webhooks.delete(wh.id);
  console.log('Webhook deleted');
}

async function keysDemo() {
  console.log('\n=== API Keys ===');

  // List existing keys (values are masked)
  const existing = await client.keys.list();
  console.log('Existing keys:', existing.map(k => `${k.name} (${k.key})`));

  // Create a new key
  const newKey = await client.keys.create('ci-pipeline');
  console.log('New key created!');
  console.log('  Name:', newKey.name);
  console.log('  Key (save this!):', newKey.key);

  // Delete the new key
  await client.keys.delete(newKey.id);
  console.log('Key deleted');
}

async function main() {
  await scheduledDemo();
  await webhooksDemo();
  await keysDemo();
}

main().catch(console.error);
