/**
 * PDF generation example.
 *
 * Usage:
 *   SNAPAPI_KEY=sk_live_... npx tsx examples/pdf-generation.ts
 */

import { SnapAPI } from 'snapapi-js';
import fs from 'node:fs';

const snap = new SnapAPI({
  apiKey: process.env.SNAPAPI_KEY!,
});

// Convert a URL to PDF with custom margins
const pdf = await snap.pdf({
  url: 'https://example.com',
  pageSize: 'a4',
  margins: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
});
fs.writeFileSync('output.pdf', pdf);
console.log('Saved output.pdf');

// Generate PDF from raw HTML
const invoicePdf = await snap.pdf({
  html: `
    <html>
      <body style="font-family: Arial, sans-serif; padding: 40px;">
        <h1>Invoice #1234</h1>
        <p>Date: 2026-03-28</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #ccc;">
            <th style="text-align: left;">Item</th>
            <th style="text-align: right;">Amount</th>
          </tr>
          <tr><td>API Access (Pro Plan)</td><td style="text-align: right;">$79.00</td></tr>
          <tr style="font-weight: bold; border-top: 2px solid #000;">
            <td>Total</td><td style="text-align: right;">$79.00</td>
          </tr>
        </table>
      </body>
    </html>
  `,
  landscape: false,
});
fs.writeFileSync('invoice.pdf', invoicePdf);
console.log('Saved invoice.pdf');

// Save directly to file (convenience)
await snap.pdfToFile('https://example.com', './quick.pdf', { pageSize: 'letter' });
console.log('Saved quick.pdf');
