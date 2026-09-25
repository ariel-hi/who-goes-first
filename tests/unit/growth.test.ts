import { expect, test } from 'vitest';
import type { PublicRule } from '../../src/lib/content/schema';
import { getCatalog } from '../../src/lib/content/catalog';
import { groupByTheme, publisherHubs, similarRules, slugify, themeHubs } from '../../src/lib/content/hubs';
import { amazonSearchUrl } from '../../src/lib/affiliate';
import { clip } from '../../src/lib/og-image';
import { rankDemand } from '../../scripts/lib/demand';
import { postText, ruleForDay } from '../../scripts/lib/social';

const rule = (id: string, firstPlayerRule: string, publisher = 'Fixture Games', gameName = id): PublicRule => ({
  id, slug: id, gameName, aliases: [], editionLabel: 'Fixture edition', language: 'en', firstPlayerRule, officialTieBreak: null, houseFallback: null,
  clarifications: [], interpretation: null, materiallyUpdatedAt: '2026-09-24',
  sources: [{ url: 'https://example.org/rules.pdf', title: 'Rules', publisher, printedPages: ['2'], pdfPagesOneBased: [2], location: 'Setup', checkedAt: '2026-09-24' }],
});

test('theme hubs match the approved instruction itself and skip thin groups', () => {
  const catalog = [
    ...['a', 'b', 'c', 'd', 'e'].map(id => rule(`pet-${id}`, 'Whoever most recently petted a dog starts.')),
    rule('youngest', 'The youngest player takes the first turn.'),
    rule('group', 'The group chooses someone to start.'), rule('sweet', 'Choose the player with the biggest sweet tooth to start.'),
  ];
  const hubs = themeHubs(catalog);
  expect(hubs.map(hub => hub.slug)).toEqual(['animals', 'most-recently']);
  expect(hubs.find(hub => hub.slug === 'youngest-player')).toBeUndefined();
  // "Choose the player with…" is a criterion, not a group decision.
  expect(themeHubs([...catalog, ...['1', '2', '3', '4'].map(id => rule(`g${id}`, 'The group chooses a first player.'))]).find(hub => hub.slug === 'group-choice')?.rules.map(item => item.id)).not.toContain('sweet');
});

test('similar rules rotate through a hub, excluding the page and its related editions', () => {
  const catalog = ['a', 'b', 'c', 'd', 'e', 'f', 'g'].map(id => rule(id, 'The player who most recently ate cheese starts.'));
  expect(similarRules(catalog[5]!, catalog, new Set(['a']), 3).rules.map(item => item.id)).toEqual(['g', 'b', 'c']);
  expect(similarRules(rule('solo', 'Take turns.'), catalog, new Set()).rules).toEqual([]);
});

test('publisher hubs need three rules and have stable slugs', () => {
  const catalog = [rule('a', 'x', 'Czech Games Edition'), rule('b', 'x', 'Czech Games Edition'), rule('c', 'x', 'Czech Games Edition'), rule('d', 'x', 'R&R Games')];
  expect(publisherHubs(catalog).map(hub => [hub.slug, hub.rules.length])).toEqual([['czech-games-edition', 3]]);
  expect(slugify('Schrödinger & Sons')).toBe('schrodinger-and-sons');
});

test('the ways-to-pick page lists each portable rule exactly once', () => {
  const rules = [rule('a', 'Whoever most recently ate a pizza starts.'), rule('b', 'The person who most recently petted a cat starts.'), rule('c', 'The tallest player starts.')];
  const { groups, other } = groupByTheme(rules);
  expect(groups.flatMap(group => group.rules).length + other.length).toBe(rules.length);
  expect(other.map(item => item.id)).toEqual(['c']);
});

test('real catalog hubs are unique, sizeable, and never reuse a rule route', () => {
  const catalog = getCatalog();
  const slugs = new Set(catalog.map(item => item.slug));
  for (const hub of themeHubs(catalog)) expect(hub.rules.length).toBeGreaterThanOrEqual(5);
  const publishers = publisherHubs(catalog);
  expect(new Set(publishers.map(hub => hub.slug)).size).toBe(publishers.length);
  expect(slugs.has('themes')).toBe(false);
});

test('affiliate links are searches carrying only the game name and tag', () => {
  const url = new URL(amazonSearchUrl('Ticket to Ride: Europe', 'wgf-20'));
  expect(url.origin + url.pathname).toBe('https://www.amazon.com/s');
  expect(Object.fromEntries(url.searchParams)).toEqual({ k: 'Ticket to Ride: Europe board game', tag: 'wgf-20' });
});

test('share image text clips at word boundaries', () => {
  expect(clip('Short', 10)).toBe('Short');
  expect(clip('The player who most recently visited a castle starts', 30)).toBe('The player who most recently…');
});

test('search demand ranks games without rules by starting-rule queries only', () => {
  const games = [{ name: 'Ticket to Ride', bggId: '1', hasRule: false }, { name: 'Ticket to Ride: Europe', bggId: '2', hasRule: false }, { name: 'Azul', bggId: '3', hasRule: true }, { name: 'Go', bggId: '4', hasRule: false }];
  const row = (query: string, impressions: number) => ({ keys: [query], impressions, clicks: 1, ctr: 0, position: 5 });
  const demand = rankDemand([row('who goes first in ticket to ride europe', 40), row('ticket to ride first player', 30), row('ticket to ride price', 900), row('azul who starts', 50), row('who goes first in go', 70), row('who goes first in brand new game', 12)], [
    { keys: ['https://whogoesfirst.fun/games/azul-2018-en/'], impressions: 400, clicks: 2, ctr: 0.005, position: 6 },
    { keys: ['https://whogoesfirst.fun/games/catan/'], impressions: 400, clicks: 40, ctr: 0.1, position: 3 },
  ], games, 'https://whogoesfirst.fun');
  expect(demand.missingRules.map(game => [game.name, game.impressions])).toEqual([['Ticket to Ride: Europe', 40], ['Ticket to Ride', 30]]);
  expect(demand.unmatchedQueries.map(item => item.query)).toEqual(['who goes first in go', 'who goes first in brand new game']);
  expect(demand.lowClickPages.map(item => item.page)).toEqual(['/games/azul-2018-en/']);
});

test('daily posts are deterministic per day and fit platform limits', () => {
  const pool = ['a', 'b', 'c'].map(id => rule(id, 'The player who most recently visited a lighthouse starts. '.repeat(8).trim()));
  const day = new Date('2026-10-01T12:00:00Z');
  expect(ruleForDay(pool, day)).toBe(ruleForDay(pool.toReversed(), new Date('2026-10-01T23:59:00Z')));
  expect(new Set([0, 1, 2].map(offset => ruleForDay(pool, new Date(day.getTime() + offset * 86_400_000))!.id)).size).toBe(3);
  expect(ruleForDay([], day)).toBeUndefined();
  const text = postText(pool[0]!, 300);
  expect([...new Intl.Segmenter('en', { granularity: 'grapheme' }).segment(text)].length).toBeLessThanOrEqual(300);
  expect(text.endsWith('…')).toBe(true);
  expect(postText(rule('x', 'The youngest starts.', 'P', 'Azul'), 300)).toBe('Who goes first in Azul? The youngest starts.');
});
