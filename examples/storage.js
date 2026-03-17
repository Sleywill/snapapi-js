// examples/storage.js — snapapi-js v3
// Run: SNAPAPI_KEY=sk_live_... node examples/storage.js

import { SnapAPI } from 'snapapi-js';

const snap = new SnapAPI({ apiKey: process.env.SNAPAPI_KEY ?? '' });

// 1. Check storage usage
const usage = await snap.storage.getUsage();
console.log(`Storage used: ${usage.usedFormatted} / ${usage.limitFormatted} (${usage.percentage}%)`);

// 2a. Take a screenshot and store it via screenshotToStorage() convenience method
const stored = await snap.screenshotToStorage('https://example.com');
console.log('Stored file ID:', stored.id);
console.log('Public URL:', stored.url);

// 2b. Or use the full options form with a custom destination
const stored2 = await snap.screenshotToStorage({
  url: 'https://example.com',
  format: 'webp',
  fullPage: true,
  storage: { destination: 'snapapi' },
});
console.log('Stored WebP ID:', stored2.id);

// 3. List stored files
const { files } = await snap.storage.listFiles(10, 0);
console.log(`You have ${files.length} files stored:`);
for (const f of files) {
  console.log(' -', f.id, f.url);
}

// 4. Get a specific file
if (files.length > 0 && files[0]) {
  const file = await snap.storage.getFile(files[0].id);
  console.log('File details:', file);
}

// 5. Delete the file we just uploaded
const del = await snap.storage.deleteFile(stored.id);
console.log('Deleted:', del.success);

// 6. Configure custom S3 bucket
await snap.storage.configureS3({
  s3_bucket: 'my-screenshots',
  s3_region: 'us-east-1',
  s3_access_key_id: process.env.AWS_ACCESS_KEY_ID ?? 'AKIA...',
  s3_secret_access_key: process.env.AWS_SECRET_ACCESS_KEY ?? 'secret',
});

// 7. Test the S3 connection
const test = await snap.storage.testS3();
console.log('S3 test:', test.success ? 'OK' : 'Failed', test.message);
