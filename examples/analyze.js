// examples/analyze.js – SnapAPI v2 JavaScript SDK (BYOK)
const SnapAPI = require('@snapapi/sdk').default;

const client = new SnapAPI({ apiKey: process.env.SNAPAPI_KEY || 'sk_live_YOUR_KEY' });

async function main() {
  // 1. Free-form analysis with OpenAI
  const summary = await client.analyze({
    url: 'https://example.com',
    prompt: 'Summarize the main content of this page in 3 bullet points.',
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY || 'sk-YOUR_OPENAI_KEY',
    includeScreenshot: false,
    includeMetadata: true,
    blockAds: true,
  });
  console.log('Analysis:', summary.analysis);
  console.log('Model used:', summary.model);

  // 2. Structured JSON output with Anthropic
  const structured = await client.analyze({
    url: 'https://stripe.com/pricing',
    prompt: 'Extract all pricing plans with their names, prices, and features.',
    provider: 'anthropic',
    apiKey: process.env.ANTHROPIC_API_KEY || 'sk-ant-YOUR_KEY',
    jsonSchema: {
      type: 'object',
      properties: {
        plans: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              price: { type: 'string' },
              features: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
    },
    includeScreenshot: true,
  });
  console.log('Plans:', JSON.stringify(structured.analysis, null, 2));
}

main().catch(console.error);
