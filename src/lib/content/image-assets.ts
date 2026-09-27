import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { ruleImageSchema, type RuleImage } from './schema';

/** Local licensed artwork is optional; an absent field keeps the SVG-only page. */
export function validateRuleImageAsset(image: RuleImage | undefined, publicDirectory = 'public') {
  if (!image) return;
  const checked = ruleImageSchema.parse(image);
  const path = resolve(publicDirectory, `.${checked.file}`);
  if (!existsSync(path) || !statSync(path).isFile()) throw new Error(`Missing licensed image: ${image.file}`);
  if (statSync(path).size > 64 * 1024) throw new Error(`Licensed image exceeds 64 KiB: ${image.file}`);
}
