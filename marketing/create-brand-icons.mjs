// Rebuild the ICO fallback and the social avatar from the site's SVG dice mark:
// node marketing/create-brand-icons.mjs
import { readFile, writeFile } from 'node:fs/promises';
import { Buffer } from 'node:buffer';
import { URL, fileURLToPath } from 'node:url';
import sharp from 'sharp';

const faviconUrl = new URL('../public/favicon.svg', import.meta.url);
const mark = await readFile(faviconUrl, 'utf8');
const sizes = [16, 32, 48, 64, 128, 256];
const frames = await Promise.all(sizes.map(size => sharp(Buffer.from(mark)).resize(size, size).png().toBuffer()));

// ICO accepts PNG image data. Keep the alpha channel so the rounded corners
// remain transparent in browsers that choose the legacy fallback.
const header = Buffer.alloc(6 + sizes.length * 16);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
frames.forEach((frame, index) => {
  const entry = 6 + index * 16;
  header.writeUInt8(sizes[index] === 256 ? 0 : sizes[index], entry);
  header.writeUInt8(sizes[index] === 256 ? 0 : sizes[index], entry + 1);
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(frame.length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += frame.length;
});
await writeFile(new URL('../public/favicon.ico', import.meta.url), Buffer.concat([header, ...frames]));

// Social platforms often crop avatars to a circle. The cream field and inset
// mark keep all five pips visible in both square and circular presentations.
const avatar = mark
  .replace(/<svg\b[^>]*>/, '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#f5f0ed"/><g transform="translate(2.88 2.88) scale(.82)">')
  .replace('</svg>', '</g></svg>');
await sharp(Buffer.from(avatar)).resize(1024, 1024).png().toFile(fileURLToPath(new URL('./who-goes-first-profile.png', import.meta.url)));
