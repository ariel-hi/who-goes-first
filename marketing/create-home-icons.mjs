// Rebuild home-screen icons from the existing site-owned vector dice mark:
// node marketing/create-home-icons.mjs
import { chromium } from 'playwright';
import { mkdir, readFile } from 'node:fs/promises';
import { URL, fileURLToPath } from 'node:url';

const publicRoot = new URL('../public/', import.meta.url);
await mkdir(new URL('icons/', publicRoot), { recursive: true });
const favicon = await readFile(new URL('favicon.svg', publicRoot), 'utf8');
// Fill the corners for platform masks. The five pips stay inside the central
// safe circle (radius 40% of the image); let the platform shape the outer tile.
const icon = favicon.replace(/<rect\b[^>]*\/>/, '<rect width="32" height="32" fill="#62506f"/>');
const browser = await chromium.launch({ headless: true });
try {
  for (const [size, path] of [[180, 'apple-touch-icon.png'], [192, 'icons/picker-192.png'], [512, 'icons/picker-512.png']]) {
    const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
    try {
      await page.setContent(`<!doctype html><html><head><style>html,body{margin:0}svg{display:block;width:100vw;height:100vh}</style></head><body>${icon}</body></html>`);
      await page.screenshot({ path: fileURLToPath(new URL(path, publicRoot)) });
    } finally {
      await page.close();
    }
  }
} finally {
  await browser.close();
}
