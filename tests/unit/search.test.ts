import { describe, expect, it } from 'vitest';
import { createSearchRanker, prepareSearch, searchRank } from '../../src/lib/search';

describe('catalog search ranking', () => {
  const game = { gameName: 'Azul', aliases: ['Blå'], editionLabel: 'Édition française' };
  it('keeps exact, prefix, contained, edition and one-edit matches in order', () => {
    const rank = createSearchRanker('Azul');
    const records = ['Azul', 'Azul: Summer Pavilion', 'My Azul', 'Azl', 'Catan'];
    expect(records.map(gameName => rank(prepareSearch({ gameName, aliases: [], editionLabel: '' })))).toEqual([0, 1, 2, 3, Infinity]);
    expect(searchRank(game, 'FRANCAISE')).toBe(2);
  });
  it('finds aliases and accented names, and restores all rows for an empty query', () => {
    expect(searchRank(game, '  BLA  ')).toBe(0);
    expect(createSearchRanker('')(prepareSearch(game))).toBe(1);
    expect(searchRank(game, 'no matching game')).toBe(Infinity);
  });
  it('bounds long input and leaves ordinary searches responsive to changed records', () => {
    const changed = { ...game, aliases: [...game.aliases] };
    const prepared = prepareSearch(changed);
    changed.gameName = 'Catan';
    expect(searchRank(changed, 'Catan')).toBe(0);
    expect(createSearchRanker('Azul')(prepared)).toBe(0);
    expect(searchRank({ gameName: 'a'.repeat(100), aliases: [], editionLabel: '' }, 'a'.repeat(200))).toBe(0);
  });
});
