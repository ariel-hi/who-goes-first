import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import sharp from 'sharp';
import { ruleImageSchema, type RuleImage } from './schema';

/** Local licensed artwork is optional; an absent field keeps the text-only page. */
export async function validateRuleImageAsset(image: RuleImage | undefined, publicDirectory = 'public') {
  if (!image) return;
  const checked = ruleImageSchema.parse(image);
  const path = resolve(publicDirectory, `.${checked.file}`);
  if (!existsSync(path) || !statSync(path).isFile()) throw new Error(`Missing licensed image: ${image.file}`);
  if (statSync(path).size > 128 * 1024) throw new Error(`Licensed image exceeds 128 KiB: ${image.file}`);
  const decoder = sharp(readFileSync(path), { failOn: 'warning', limitInputPixels: 4_000_000 });
  const metadata = await decoder.metadata();
  const extension = extname(path).slice(1);
  const format = metadata.format === 'heif' && metadata.compression === 'av1' ? 'avif' : metadata.format;
  const expected = extension === 'jpg' ? 'jpeg' : extension;
  if (format !== expected || (metadata.pages ?? 1) !== 1) throw new Error(`Unsupported or mismatched image format: ${image.file}`);
  if (metadata.width !== checked.width || metadata.height !== checked.height) throw new Error(`Licensed image dimensions do not match metadata: ${image.file}`);
  // Header metadata alone does not establish that compressed pixel data is valid.
  await decoder.raw().toBuffer();
}
