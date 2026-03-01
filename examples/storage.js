// examples/storage.js – SnapAPI v2 JavaScript SDK
const SnapAPI = require('@snapapi/sdk').default;

const client = new SnapAPI({ apiKey: process.env.SNAPAPI_KEY || 'sk_live_YOUR_KEY' });

async function main() {
  // 1. Check storage usage
  const usage = await client.storage.getUsage();
  console.log(`Storage used: ${usage.usedFormatted} / ${usage.limitFormatted} (${usage.percentage}%)`);

  // 2. Take a screenshot and store it
  const stored = await client.screenshot({
    url: 'https://example.com',
    storage: { destination: 'snapapi', format: 'png' },
  });
  console.log('Stored file ID:', stored.id);
  console.log('Public URL:', stored.url);

  // 3. List stored files
  const { files } = await client.storage.listFiles(10, 0);
  console.log(`You have ${files.length} files stored:`);
  files.forEach(f => console.log(' -', f.id, f.url));

  // 4. Get a specific file
  if (files.length > 0) {
    const file = await client.storage.getFile(files[0].id);
    console.log('File details:', file);
  }

  // 5. Delete the file we just uploaded
  if (stored.id) {
    const del = await client.storage.deleteFile(stored.id);
    console.log('Deleted:', del.success);
  }

  // 6. Configure custom S3 bucket
  await client.storage.configureS3({
    s3_bucket: 'my-screenshots',
    s3_region: 'us-east-1',
    s3_access_key_id: process.env.AWS_ACCESS_KEY_ID || 'AKIA...',
    s3_secret_access_key: process.env.AWS_SECRET_ACCESS_KEY || 'secret',
  });

  // 7. Test the S3 connection
  const test = await client.storage.testS3();
  console.log('S3 test:', test.success ? '✅ OK' : '❌ Failed', test.message);
}

main().catch(console.error);
