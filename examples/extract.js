// examples/extract.js — snapapi-js v3
// Run: SNAPAPI_KEY=sk_live_... node examples/extract.js

import { SnapAPI } from 'snapapi-js';

const snap = new SnapAPI({ apiKey: process.env.SNAPAPI_KEY ?? '' });
const url = 'https://en.wikipedia.org/wiki/Screenshot';

// 1. Extract as Markdown (great for LLM context)
const md = await snap.extract({ url, type: 'markdown', cleanOutput: true, maxLength: 3000 });
console.log('Markdown (first 500 chars):', String(md.data).slice(0, 500));
console.log('Response time:', md.responseTime, 'ms');

// 2. Extract article body only
const article = await snap.extract({ url, type: 'article' });
console.log('Article length:', String(article.data).length);

// 3. Extract all links
const links = await snap.extract({ url, type: 'links' });
console.log('Links:', links.data);

// 4. Extract images
const images = await snap.extract({ url, type: 'images' });
console.log('Images:', images.data);

// 5. Extract page metadata
const meta = await snap.extract({ url, type: 'metadata' });
console.log('Metadata:', meta.data);

// 6. Extract raw HTML scoped to a selector
const html = await snap.extract({ url, type: 'html', selector: 'main' });
console.log('HTML length:', String(html.data).length);

// 7. Extract structured data (JSON-LD / microdata)
const structured = await snap.extract({ url, type: 'structured' });
console.log('Structured:', structured.data);
