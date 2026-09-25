import { expect, test } from 'vitest';
import { readRecords } from '../../src/lib/content/catalog';
import { assertPublishable, contentRevision, publicRule, ruleSchema } from '../../src/lib/content/schema';
import { searchRank } from '../../src/lib/search';
import { getCoverage } from '../../src/lib/content/coverage';
import { getBoardGames } from '../../src/lib/content/board-games';
test('public board game directory includes every discovered identity and links only approved matching rules', () => {
  const games = getBoardGames();
  expect(games.length).toBeGreaterThanOrEqual(1320);
  expect(new Set(games.map(game => game.bggId)).size).toBe(games.length);
  expect(games.find(game => game.name === 'Azul')?.rules.map(rule => rule.id)).toContain('azul-2018-en');
  expect(games.find(game => game.bggId === '377449')?.rules.map(rule => rule.id)).not.toContain('chomp-gamewright-en');
  expect(games.some(game => game.rules.length === 0)).toBe(true);
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
