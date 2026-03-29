/**
 * AI analysis (BYOK) example.
 *
 * Usage:
 *   SNAPAPI_KEY=sk_live_... OPENAI_API_KEY=sk-... npx tsx examples/ai-analysis.ts
 */

import { SnapAPI } from 'snapapi-js';

const snap = new SnapAPI({
  apiKey: process.env.SNAPAPI_KEY!,
});

// Extract clean markdown first
const { data: markdown } = await snap.extract({
  url: 'https://example.com',
  type: 'markdown',
  cleanOutput: true,
  maxLength: 10000,
});

console.log('Extracted markdown:');
console.log(String(markdown).substring(0, 200) + '...');

// Analyze with an LLM (bring your own API key)
const result = await snap.analyze({
  url: 'https://example.com',
  prompt: 'Summarize this page in 3 bullet points. Include the main purpose and key content.',
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY!,
});

console.log('\nAI Analysis:');
console.log(result.analysis);
console.log(`\nProvider: ${result.provider}, Model: ${result.model}`);
