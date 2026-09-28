import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { expect, test } from 'vitest';
import sharp from 'sharp';
import { readRecords } from '../../src/lib/content/catalog';
import { assertPublishable, contentRevision, publicRule, ruleImageSchema, ruleSchema } from '../../src/lib/content/schema';
import { validateRuleImageAsset } from '../../src/lib/content/image-assets';

// Synthetic rights metadata for schema tests only; never a publication grant.
const image = {
  file: '/images/games/test-box.png', alt: 'Synthetic test box', width: 120, height: 160,
  source: { url: 'https://publisher.example/press-kit', publisher: 'Test publisher' },
  licence: { name: 'Synthetic permission', url: 'https://publisher.example/terms',
    rightsHolder: 'Test rights holder', attribution: 'Synthetic test credit',
    reviewedAt: '2026-09-26', localEditorialUse: true as const },
};

test('optional images require complete rights information and a local raster path', () => {
  expect(ruleImageSchema.parse(image)).toEqual(image);
  for (const file of ['https://publisher.example/box.png', '//publisher.example/box.png', '/images/games/../box.png', '/images/games/box.svg']) {
    expect(ruleImageSchema.safeParse({ ...image, file }).success).toBe(false);
  }
  expect(ruleImageSchema.safeParse({ ...image, licence: undefined }).success).toBe(false);
  expect(ruleImageSchema.safeParse({ ...image, licence: { ...image.licence, localEditorialUse: false } }).success).toBe(false);
});

test('BGG, search results, and Amazon images cannot supply locally hosted rule artwork', () => {
  for (const url of ['https://boardgamegeek.com/image/1', 'https://cf.geekdo-images.com/box.png', 'https://www.google.com/search?q=box', 'https://m.media-amazon.com/images/I/box.jpg']) {
    expect(ruleImageSchema.safeParse({ ...image, source: { ...image.source, url } }).success).toBe(false);
  }
});

test('image metadata and licence edits are bound to editorial approval', () => {
  const unillustrated = readRecords('src/content/games').find(record =>
    typeof record === 'object' && record !== null && !('image' in record));
  if (!unillustrated) throw new Error('Expected an unillustrated rule for the fallback test');
  const rule = ruleSchema.parse(unillustrated);
  expect(() => assertPublishable(rule)).not.toThrow();
  expect(publicRule(rule)).not.toHaveProperty('image');
  const illustrated = ruleSchema.parse({ ...rule, image });
  expect(publicRule(illustrated).image).toEqual(image);
  expect(contentRevision(illustrated)).not.toBe(contentRevision(rule));
  expect(() => assertPublishable(illustrated)).toThrow('stale editorial approval');
  expect(contentRevision({ ...illustrated, image: { ...image, licence: { ...image.licence, attribution: 'Changed credit' } } })).not.toBe(contentRevision(illustrated));
});

test('publication decodes real rasters and rejects missing, malformed, mismatched and oversized files', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'wgf-image-test-'));
  if (dirname(directory) !== resolve(tmpdir()) || !basename(directory).startsWith('wgf-image-test-')) throw new Error('Unexpected test directory');
  try {
    mkdirSync(join(directory, 'images/games'), { recursive: true });
    await expect(validateRuleImageAsset(undefined, directory)).resolves.toBeUndefined();
    await expect(validateRuleImageAsset(image, directory)).rejects.toThrow('Missing licensed image');
    const path = join(directory, 'images/games/test-box.png');
    writeFileSync(path, Buffer.alloc(64 * 1024));
    await expect(validateRuleImageAsset(image, directory)).rejects.toThrow();
    writeFileSync(path, Buffer.alloc(128 * 1024 + 1));
    await expect(validateRuleImageAsset(image, directory)).rejects.toThrow('exceeds 128 KiB');
    const synthetic = () => sharp({ create: { width: 3, height: 4, channels: 3, background: '#336655' } });
    for (const extension of ['png', 'jpg', 'jpeg', 'webp', 'avif'] as const) {
      const file = `/images/games/test-box.${extension}`;
      const bytes = await synthetic().toFormat(extension === 'jpg' ? 'jpeg' : extension).toBuffer();
      writeFileSync(join(directory, `.${file}`), bytes);
      const record = { ...image, file, width: 3, height: 4 };
      await expect(validateRuleImageAsset(record, directory)).resolves.toBeUndefined();
      await expect(validateRuleImageAsset({ ...record, width: 4 }, directory)).rejects.toThrow('dimensions');
    }
    writeFileSync(path, await synthetic().webp().toBuffer());
    await expect(validateRuleImageAsset({ ...image, width: 3, height: 4 }, directory)).rejects.toThrow('format');
    writeFileSync(path, await synthetic().gif().toBuffer());
    await expect(validateRuleImageAsset({ ...image, width: 3, height: 4 }, directory)).rejects.toThrow('format');
    const damaged = (await synthetic().jpeg().toBuffer()).subarray(0, -10);
    // A damaged compressed stream must not be accepted as a valid local image.
    writeFileSync(join(directory, 'images/games/test-box.jpg'), damaged);
    await expect(validateRuleImageAsset({ ...image, file: '/images/games/test-box.jpg', width: 3, height: 4 }, directory)).rejects.toThrow();
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
