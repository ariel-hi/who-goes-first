import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { expect, test } from 'vitest';
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
  const rule = ruleSchema.parse(readRecords('src/content/games')[0]);
  expect(() => assertPublishable(rule)).not.toThrow();
  expect(publicRule(rule)).not.toHaveProperty('image');
  const illustrated = ruleSchema.parse({ ...rule, image });
  expect(publicRule(illustrated).image).toEqual(image);
  expect(contentRevision(illustrated)).not.toBe(contentRevision(rule));
  expect(() => assertPublishable(illustrated)).toThrow('stale editorial approval');
  expect(contentRevision({ ...illustrated, image: { ...image, licence: { ...image.licence, attribution: 'Changed credit' } } })).not.toBe(contentRevision(illustrated));
});

test('publication rejects missing and oversized licensed files', () => {
  const directory = mkdtempSync(join(tmpdir(), 'wgf-image-test-'));
  if (dirname(directory) !== resolve(tmpdir()) || !basename(directory).startsWith('wgf-image-test-')) throw new Error('Unexpected test directory');
  try {
    mkdirSync(join(directory, 'images/games'), { recursive: true });
    expect(() => validateRuleImageAsset(undefined, directory)).not.toThrow();
    expect(() => validateRuleImageAsset(image, directory)).toThrow('Missing licensed image');
    const path = join(directory, 'images/games/test-box.png');
    writeFileSync(path, Buffer.alloc(64 * 1024));
    expect(() => validateRuleImageAsset(image, directory)).not.toThrow();
    writeFileSync(path, Buffer.alloc(64 * 1024 + 1));
    expect(() => validateRuleImageAsset(image, directory)).toThrow('exceeds 64 KiB');
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
