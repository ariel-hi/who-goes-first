import { existsSync, mkdirSync, statSync } from 'node:fs';
import { dirname, resolve, sep } from 'node:path';
import sharp from 'sharp';
import { getCatalog } from '../src/lib/content/catalog';
import { coverThumbnailPath } from '../src/lib/content/cover-thumbnail';

const thumbnailRoot = resolve('public/images/games/thumbs');
let created = 0;
for (const image of getCatalog().flatMap(rule => rule.image?.presentation === 'cover' ? [rule.image] : [])) {
  const source = resolve('public', `.${image.file}`);
  const target = resolve('public', `.${coverThumbnailPath(image)}`);
  if (!target.startsWith(`${thumbnailRoot}${sep}`)) throw new Error(`Invalid cover thumbnail path: ${target}`);
  if (existsSync(target) && statSync(target).mtimeMs >= statSync(source).mtimeMs) continue;
  mkdirSync(dirname(target), { recursive: true });
  await sharp(source).resize(104, 128, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 60, effort: 4 }).toFile(target);
  if (statSync(target).size > 12 * 1024) throw new Error(`Cover thumbnail exceeds 12 KiB: ${target}`);
  created++;
}
console.log(`Prepared ${created} cover thumbnails.`);
