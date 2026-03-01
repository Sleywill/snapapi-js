// examples/extract.js – SnapAPI v2 JavaScript SDK
const SnapAPI = require('@snapapi/sdk').default;

const client = new SnapAPI({ apiKey: process.env.SNAPAPI_KEY || 'sk_live_YOUR_KEY' });

async function main() {
  const url = 'https://en.wikipedia.org/wiki/Screenshot';

  // 1. Extract as Markdown (great for LLM context)
  const md = await client.extract({ url, type: 'markdown', cleanOutput: true, maxLength: 3000 });
  console.log('Markdown (first 500 chars):', String(md.data).slice(0, 500));
  console.log('Response time:', md.responseTime, 'ms');

  // 2. Extract article body only
  const article = await client.extract({ url, type: 'article' });
  console.log('Article length:', String(article.data).length);

  // 3. Extract all links
  const links = await client.extract({ url, type: 'links' });
  console.log('Links:', links.data);

  // 4. Extract images
  const images = await client.extract({ url, type: 'images' });
  console.log('Images:', images.data);

  // 5. Extract page metadata
  const meta = await client.extract({ url, type: 'metadata' });
  console.log('Metadata:', meta.data);

  // 6. Extract raw HTML
  const html = await client.extract({ url, type: 'html', selector: 'main' });
  console.log('HTML length:', String(html.data).length);

  // 7. Extract structured data (JSON-LD / microdata)
  const structured = await client.extract({ url, type: 'structured' });
  console.log('Structured:', structured.data);
}

main().catch(console.error);
