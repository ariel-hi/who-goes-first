import { describe, expect, test } from 'vitest';
import { getCatalog } from '../../src/lib/content/catalog';
import { graduationCandidates, graduationPolicy, indexedRuleEntries, indexedRuleSlugs, isRuleIndexed, publisherHubsIndexed, ruleDepth } from '../../src/lib/indexing-policy';
import { sitemapEntries } from '../../src/lib/sitemap';

describe('indexing policy', () => {
  const catalog = getCatalog();
  const slugs = new Set(catalog.map(rule => rule.slug));

  test('every indexed rule slug is a published rule, listed once, with a date', () => {
    expect([...indexedRuleSlugs].filter(slug => !slugs.has(slug))).toEqual([]);
    expect(indexedRuleSlugs.size).toBe(indexedRuleEntries.length);
    expect(indexedRuleEntries.every(rule => /^\d{4}-\d{2}-\d{2}$/.test(rule.addedAt) && rule.reason)).toBe(true);
  });

  test('keeps the indexed set within the policy ceiling', () => {
    expect(indexedRuleSlugs.size).toBeGreaterThan(50);
    expect(indexedRuleSlugs.size).toBeLessThanOrEqual(graduationPolicy.maxIndexedRules);
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

describe('graduation', () => {
  const rule = (slug: string, gameName: string, words: number, sources = 1) => ({ slug, gameName, firstPlayerRule: Array(words).fill('word').join(' '), clarifications: [], interpretation: null, officialTieBreak: null, houseFallback: 'shared template text '.repeat(50), sources: Array(sources).fill({}) });

  test('depth counts game-specific fields and ignores the shared house fallback', () => {
    expect(ruleDepth(rule('a', 'A', 12))).toBe(12);
  });

  test('candidates are deep, sourced, one edition per game, deepest first, and skip indexed games', () => {
    const min = graduationPolicy.minimumDepth;
    const catalog = [
      rule('shallow', 'Shallow', min - 1),
      rule('unsourced', 'Unsourced', min + 50, 0),
      rule('deep-1', 'Deep', min + 10),
      rule('deep-2', 'Deep', min + 40),
      rule('other', 'Other', min + 5),
      rule('kept', 'Kept', min + 90),
      rule('kept-edition', 'Kept', min + 80),
    ];
    expect(graduationCandidates(catalog, new Set(['kept'])).map(candidate => candidate.slug)).toEqual(['deep-2', 'other']);
  });
});
