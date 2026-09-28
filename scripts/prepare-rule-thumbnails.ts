import { existsSync, mkdirSync, statSync } from 'node:fs';
import { dirname, resolve, sep } from 'node:path';
import sharp from 'sharp';
import { getCatalog } from '../src/lib/content/catalog';
import { coverThumbnailPath } from '../src/lib/content/cover-thumbnail';

const thumbnailRoot = resolve('public/images/games/thumbs');
const scriptModifiedAt = statSync(new URL(import.meta.url)).mtimeMs;

// Product photos often have a white studio backdrop baked into the JPG. Remove
// only near-white pixels connected to the outside, so white printing on a box
// stays intact and the small cover can sit on either card theme.
function clearWhiteBackdrop(pixels: Buffer, width: number, height: number): void {
  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let head = 0;
  let tail = 0;
  const add = (index: number) => {
    if (visited[index]) return;
    const offset = index * 4;
    const red = pixels[offset]!;
    const green = pixels[offset + 1]!;
    const blue = pixels[offset + 2]!;
    const darkest = Math.min(red, green, blue);
    const lightest = Math.max(red, green, blue);
    if (pixels[offset + 3] !== 0 && (darkest < 230 || lightest - darkest > 24)) return;
    visited[index] = 1;
    queue[tail++] = index;
  };

  for (let x = 0; x < width; x++) { add(x); add((height - 1) * width + x); }
  for (let y = 0; y < height; y++) { add(y * width); add(y * width + width - 1); }
  while (head < tail) {
    const index = queue[head++]!;
    const offset = index * 4;
    const darkest = Math.min(pixels[offset]!, pixels[offset + 1]!, pixels[offset + 2]!);
    pixels[offset + 3] = Math.min(pixels[offset + 3]!, Math.round(255 * (255 - darkest) / 25));
    const x = index % width;
    if (x > 0) add(index - 1);
    if (x < width - 1) add(index + 1);
    if (index >= width) add(index - width);
    if (index < width * (height - 1)) add(index + width);
  }
}

let created = 0;
for (const image of getCatalog().flatMap(rule => rule.image?.presentation === 'cover' ? [rule.image] : [])) {
  const source = resolve('public', `.${image.file}`);
  const target = resolve('public', `.${coverThumbnailPath(image)}`);
  if (!target.startsWith(`${thumbnailRoot}${sep}`)) throw new Error(`Invalid cover thumbnail path: ${target}`);
  if (existsSync(target) && statSync(target).mtimeMs >= Math.max(statSync(source).mtimeMs, scriptModifiedAt)) continue;
  mkdirSync(dirname(target), { recursive: true });
  const { data, info } = await sharp(source).resize(208, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  clearWhiteBackdrop(data, info.width, info.height);
  await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .resize(104, 128).webp({ quality: 60, effort: 4 }).toFile(target);
  if (statSync(target).size > 12 * 1024) throw new Error(`Cover thumbnail exceeds 12 KiB: ${target}`);
  created++;
}
console.log(`Prepared ${created} cover thumbnails.`);
