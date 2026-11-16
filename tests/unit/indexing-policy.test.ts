import { describe, expect, test } from 'vitest';
import { getCatalog } from '../../src/lib/content/catalog';
import { indexedRuleSlugs, isRuleIndexed, publisherHubsIndexed } from '../../src/lib/indexing-policy';
import { sitemapEntries } from '../../src/lib/sitemap';

describe('indexing policy', () => {
  const catalog = getCatalog();
  const slugs = new Set(catalog.map(rule => rule.slug));

  test('every indexed rule slug is a published rule', () => {
    expect([...indexedRuleSlugs].filter(slug => !slugs.has(slug))).toEqual([]);
  });

  test('keeps a small, deliberate set of rule pages indexable', () => {
    expect(indexedRuleSlugs.size).toBeGreaterThan(50);
    expect(indexedRuleSlugs.size).toBeLessThan(250);
    expect(isRuleIndexed('catan-2020-en')).toBe(true);
  });

  test('sitemaps list only indexable rules and no publisher hubs', () => {
    const entries = sitemapEntries();
    expect(entries.rules.map(entry => entry.path).sort()).toEqual([...indexedRuleSlugs].map(slug => `/games/${slug}/`).sort());
    expect(publisherHubsIndexed).toBe(false);
    expect(entries.hubs.some(entry => entry.path.startsWith('/publishers/'))).toBe(false);
    expect(entries.pages.map(entry => entry.path)).toContain('/coin-flip/');
  });
});
