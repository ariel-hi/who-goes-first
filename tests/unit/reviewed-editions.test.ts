import { expect, test } from 'vitest';
import { getBoardGames } from '../../src/lib/content/board-games';
import { getCatalog } from '../../src/lib/content/catalog';
import { randomRuleEligible } from '../../src/lib/content/random-rules';

test('reviewed editions keep their starting rules on the correct identities', () => {
  const games = getBoardGames();
  const reviewed = [
    ['samurai-fantasy-flight-2015-en', '3'], ['shogun-queen-2006-en', '20551'],
    ['john-company-second-edition-wehrlegig-en', '332686'],
    ['summoner-wars-second-edition-plaid-hat-en-v1-2', '332800'],
    ['london-second-edition-osprey-en-2017', '236191'], ['the-game-pandasaurus-kwanchai-moriya-en', '173090'],
  ];
  for (const [ruleId, inventoryId] of reviewed) {
    expect(games.filter(game => game.rules.some(rule => rule.id === ruleId)).map(game => game.bggId), ruleId).toEqual([inventoryId]);
  }
  expect(games.find(game => game.bggId === '211716')!.rules).toEqual([]);
  expect(games.find(game => game.bggId === '58281')!.rules).toEqual([]);
  // The unresolved first-edition London identity remains held, not inferred
  // from the second-edition manual's broad search alias.
  expect(games.some(game => game.bggId === '65781')).toBe(false);
  const catalog = getCatalog();
  for (const [ruleId] of reviewed) {
    expect(randomRuleEligible(catalog.find(rule => rule.id === ruleId)!), ruleId).toBe(ruleId === 'samurai-fantasy-flight-2015-en');
  }
});
