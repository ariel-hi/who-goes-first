import { describe, expect, test } from 'vitest';
import { getCatalog } from '../../src/lib/content/catalog';
import { randomRuleEligible } from '../../src/lib/content/random-rules';
import { corePaths } from '../../src/lib/indexing-policy';
import { auditCorePageIndexing } from '../../scripts/lib/audit-core-indexing';

const ways = '/ways-to-pick-who-goes-first/';
const indexed = '<meta name="robots" content="index, follow">';
const noindex = '<meta name="robots" content="noindex, follow">';

describe('core indexing audit', () => {
  const catalog = getCatalog();
  const portable = catalog.find(randomRuleEligible)!;
  const nonportable = catalog.find(rule => !randomRuleEligible(rule))!;

  test('permits the deliberately noindexed Ways empty state only with no portable rules', () => {
    expect(() => auditCorePageIndexing(ways, noindex, [])).not.toThrow();
    expect(() => auditCorePageIndexing(ways, indexed, [])).toThrow('Empty Ways page must be noindex');
    expect(() => auditCorePageIndexing(ways, '', [])).toThrow('Empty Ways page must be noindex');
  });

  test('treats a populated but nonportable catalog as an empty Ways collection', () => {
    expect(nonportable).toBeDefined();
    expect(() => auditCorePageIndexing(ways, noindex, [nonportable])).not.toThrow();
    expect(() => auditCorePageIndexing(ways, indexed, [nonportable])).toThrow('Empty Ways page must be noindex');
  });

  test('still rejects noindex on Ways when the actual catalog has a reviewed portable rule', () => {
    expect(portable).toBeDefined();
    expect(() => auditCorePageIndexing(ways, indexed, [portable])).not.toThrow();
    expect(() => auditCorePageIndexing(ways, noindex, [portable])).toThrow('Core page is not indexable');
    expect(() => auditCorePageIndexing(ways, noindex, catalog)).toThrow('Core page is not indexable');
  });

  test('does not accept an unreviewed revision as a portable rule', () => {
    const changed = { ...portable, firstPlayerRule: 'A different answer without a portable source review.' };
    expect(randomRuleEligible(changed)).toBe(false);
    expect(() => auditCorePageIndexing(ways, noindex, [changed])).not.toThrow();
  });

  test('keeps every other core page index-required even with an empty catalog', () => {
    for (const path of corePaths.filter(path => path !== ways)) {
      expect(() => auditCorePageIndexing(path, indexed, [])).not.toThrow();
      expect(() => auditCorePageIndexing(path, noindex, [])).toThrow(`Core page is not indexable: ${path}`);
    }
  });
});
