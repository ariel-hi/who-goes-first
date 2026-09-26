import { expect, test } from 'vitest';
import { getBoardGames } from '../../src/lib/content/board-games';
import { getCatalog } from '../../src/lib/content/catalog';
import { randomRuleEligible } from '../../src/lib/content/random-rules';

test('merged discovery entries stay unique and broad aliases do not cross edition identities', () => {
  const games = getBoardGames();
  expect(games.filter(game => game.bggId === '171')).toHaveLength(1);
  for (const [ruleId, id] of [
    ['agricola-revised-edition-lookout-en', '200680'],
    ['agricola-zman-original-en', '31260'],
    ['android-netrunner-ffg-2012-en', '124742'],
    ['mage-knight-wizkids-en', '96848'],
  ]) {
    expect(games.filter(game => game.rules.some(rule => rule.id === ruleId)).map(game => game.bggId)).toEqual([id]);
  }
});

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

test('modern native identities keep component and portable rules in their reviewed scopes', () => {
  const games = getBoardGames();
  const catalog = getCatalog();
  const reviewed = [
    ['cubirds-pandasaurus-en-2023', '245476'], ['skyjo-magilano-en', '204135'],
    ['samurai-sword-dv-undated-en', '128667'], ['nucleum-board-and-dice-2023-en', '396790'],
    ['spicy-heidelbaer-en-2020', '299169'], ['dune-imperium-uprising-dire-wolf-en-2023', '397598'],
  ];
  for (const [ruleId, inventoryId] of reviewed) {
    expect(games.filter(game => game.rules.some(rule => rule.id === ruleId)).map(game => game.bggId), ruleId).toEqual([inventoryId]);
    expect(randomRuleEligible(catalog.find(rule => rule.id === ruleId)!), ruleId).toBe(ruleId === 'spicy-heidelbaer-en-2020');
  }
  // Samurai Sword's dealt Shogun and Uprising's Objective do not authorize
  // replacing similarly named games' separate source answers.
  expect(games.find(game => game.bggId === '3')!.rules.map(rule => rule.id)).toEqual(['samurai-fantasy-flight-2015-en']);
  expect(games.find(game => game.bggId === '20551')!.rules.map(rule => rule.id)).toEqual(['shogun-queen-2006-en']);
  expect(games.find(game => game.bggId === '316554')!.rules.some(rule => rule.id.startsWith('dune-imperium-uprising-'))).toBe(false);
});

test('new native source approvals keep cooperative choices and era order on their exact identities', () => {
  const games = getBoardGames();
  const catalog = getCatalog();
  for (const [ruleId, identityId] of [
    ['the-7th-citadel-serious-poulp-en-2023', '286063'],
    ['stonesaga-open-owl-en-rulebook-1-1', '356944'],
    ['civolution-deep-print-us-en-1-0', '400602'],
  ]) {
    expect(games.filter(game => game.rules.some(rule => rule.id === ruleId)).map(game => game.bggId)).toEqual([identityId]);
    expect(randomRuleEligible(catalog.find(rule => rule.id === ruleId)!)).toBe(false);
  }
  const civolution = catalog.find(rule => rule.id === 'civolution-deep-print-us-en-1-0')!;
  expect(civolution.firstPlayerRule).toContain('does not state how');
  expect(civolution.clarifications.join(' ')).toContain('that era’s scoring category');
  expect(civolution.clarifications.join(' ')).toContain('including at zero');
  expect(games.find(game => game.bggId === '434367')!.rules).toEqual([]);
});

test('archived German summaries retain selection phases and their exact native identities', () => {
  const games = getBoardGames();
  const catalog = getCatalog();
  for (const [ruleId, identityId] of [
    ['magalon-ravensburger-de-1998', '429'],
    ['hick-hack-in-gackelwack-zoch-de-printout-2007', '2569'],
  ]) {
    expect(games.filter(game => game.rules.some(rule => rule.id === ruleId)).map(game => game.bggId)).toEqual([identityId]);
    expect(randomRuleEligible(catalog.find(rule => rule.id === ruleId)!)).toBe(false);
  }
  const magalon = catalog.find(rule => rule.id === 'magalon-ravensburger-de-1998')!;
  expect(magalon.firstPlayerRule).toContain('highest value takes the first action turn');
  expect(magalon.clarifications.join(' ')).toContain('does not guarantee the first action turn');
  const hick = catalog.find(rule => rule.id === 'hick-hack-in-gackelwack-zoch-de-printout-2007')!;
  expect(hick.firstPlayerRule).toContain('only after all players have chosen');
  expect(hick.tieBreakApplicable).toBe(false);
});
