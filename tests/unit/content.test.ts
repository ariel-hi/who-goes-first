import { expect, test } from 'vitest';
import { getCatalog, readRecords } from '../../src/lib/content/catalog';
import { assertPublishable, contentRevision, publicRule, ruleSchema } from '../../src/lib/content/schema';
import { searchRank } from '../../src/lib/search';
import { getCoverage } from '../../src/lib/content/coverage';
import { getBoardGames } from '../../src/lib/content/board-games';
import { getBrowseShelves, BROWSE_PAGE_SIZE } from '../../src/lib/content/board-game-browse';
test('public board game directory includes every discovered identity and links only approved matching rules', () => {
  const games = getBoardGames();
  expect(games.length).toBeGreaterThanOrEqual(1320);
  expect(new Set(games.map(game => game.bggId)).size).toBe(games.length);
  expect(games.find(game => game.name === 'Azul')?.rules.map(rule => rule.id)).toContain('azul-2018-en');
  expect(games.find(game => game.bggId === '377449')?.rules.map(rule => rule.id)).not.toContain('chomp-gamewright-en');
  expect(games.some(game => game.rules.length === 0)).toBe(true);
  const assignments = games.flatMap(game => game.rules.map(rule => rule.id));
  expect(assignments.toSorted()).toEqual(getCatalog().map(rule => rule.id).toSorted());
  expect(games.find(game => game.bggId === '209418')?.rules.map(rule => rule.id)).toContain('dominion-2021-en');
  expect(games.find(game => game.bggId === '36218')?.rules).toEqual([]);
});
test('browse shelves include each identity once within a bounded page size', () => {
  const { games, shelves } = getBrowseShelves();
  const listed = shelves.flatMap(shelf => shelf.games);
  expect(listed.length).toBe(games.length);
  expect(new Set(listed.map(game => game.bggId)).size).toBe(games.length);
  expect(shelves.every(shelf => shelf.games.length > 0 && shelf.games.length <= BROWSE_PAGE_SIZE)).toBe(true);
  expect(games.length).toBeGreaterThan(4900);
});
test('reviewed identities retain edition distinctions without transferring a starting rule', () => {
  const games = getBoardGames();
  expect(games.find(game => game.bggId === '2397')?.name).toBe('Backgammon');
  expect(games.find(game => game.bggId === '121')?.name).toBe('Dune (Avalon Hill, 1979)');
  expect(games.find(game => game.bggId === '283355')?.name).toBe('Dune (Gale Force Nine, 2019)');
  expect(games.find(game => game.bggId === '211716')?.name).toBe('John Company (first edition, 2017)');
  expect(games.find(game => game.bggId === '332686')?.name).toBe('John Company: Second Edition');
  expect(games.find(game => game.bggId === '121')?.rules).toEqual([]);
  expect(games.find(game => game.bggId === '2397')?.rules.map(rule => rule.id)).toEqual(['backgammon-usbgf-basics-standard-en']);
  // The unresolved Deluxe mapping is held rather than merged with the original.
  expect(games.some(game => game.bggId === '345972')).toBe(false);
});
test('coverage does not merge unrelated games with identical or punctuation-equivalent names', () => {
  const coverage = getCoverage();
  const chomp = coverage.games.find(game => game.bggId === '377449');
  expect(chomp).toBeDefined();
  expect(chomp!.editions.map(rule => rule.id)).not.toContain('chomp-gamewright-en');
  expect(chomp!.editions.map(rule => rule.id)).toContain('chomp-allplay-en');
  const bigTop = coverage.games.find(game => game.bggId === '369899');
  expect(bigTop!.editions.map(rule => rule.id)).toEqual(['big-top-allplay-en']);
  expect(coverage.games.find(game => game.bggId === '265736')!.editions.map(rule => rule.id)).toContain('tiny-towns-base-en');
  expect(coverage.researched + coverage.pending).toBe(coverage.games.length);
});
test('drafts cannot publish and approval is bound to the exact content', () => {
  const draft = ruleSchema.parse(readRecords('research/games')[0]);
  expect(() => assertPublishable(draft)).toThrow('not approved');
  const fixture = { ...draft, status: 'approved' as const, approvedBy: 'AUTOMATED TEST FIXTURE — NOT HUMAN APPROVAL', approvedRevision: contentRevision(draft), publishedAt: '2026-09-19', materiallyUpdatedAt: '2026-09-19' };
  expect(() => assertPublishable(fixture)).not.toThrow();
  expect(() => assertPublishable({ ...fixture, firstPlayerRule: 'Changed answer' })).toThrow('stale');
  expect(() => assertPublishable({ ...fixture, aliases: ['New alias'] })).toThrow('stale');
  expect(() => assertPublishable({ ...fixture, approvedBy: null })).toThrow('missing');
  expect(JSON.stringify(publicRule(fixture))).not.toMatch(/internalEvidence|approvedBy|approvedRevision/);
});
test('schema rejects future checks, impossible dates and unsupported sources', () => {
  const draft = ruleSchema.parse(readRecords('research/games')[0]);
  for (const checkedAt of ['2999-01-01', '2026-02-30']) expect(ruleSchema.safeParse({ ...draft, sources: [{ ...draft.sources[0], checkedAt }] }).success).toBe(false);
  expect(ruleSchema.safeParse({ ...draft, sources: [{ ...draft.sources[0], url: 'http://unsafe.test' }] }).success).toBe(false);
});
test('exact, alias, prefix and typo ordering', () => {
  const azul = { gameName: 'Azul', aliases: ['Blue Tiles'], editionLabel: '2018 English' };
  expect(searchRank(azul, 'AZUL')).toBe(0); expect(searchRank(azul, 'blue tiles')).toBe(0);
  expect(searchRank(azul, 'az')).toBe(1); expect(searchRank(azul, 'azl')).toBe(3); expect(searchRank(azul, 'monopoly')).toBe(Infinity);
});
