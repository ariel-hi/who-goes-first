import { expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { getCatalog, readRecords } from '../../src/lib/content/catalog';
import { assertPublishable, contentRevision, publicRule, ruleSchema } from '../../src/lib/content/schema';
import { searchRank } from '../../src/lib/search';
import { getCoverage } from '../../src/lib/content/coverage';
import { getBoardGames, nativeIdentityAdditions } from '../../src/lib/content/board-games';
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
test('native and language-neutral identities enroll only after primary identity acceptance', () => {
  const games = getBoardGames();
  for (const [id, name] of [['156', 'Abenteuer Tierwelt'], ['1806', 'Rüsselbande'], ['2537', 'Der König der Diebe'], ['153938', 'Camel Up'], ['204135', 'Skyjo'], ['245476', 'CuBirds'], ['396790', 'Nucleum'], ['397598', 'Dune: Imperium – Uprising']] as const) {
    const game = games.find(game => game.bggId === id);
    expect(game?.name).toBe(name);
    // These four still have identity evidence only. Modern source approvals
    // are separately checked against their exact identities and editions.
    if (['156', '1806', '2537', '153938'].includes(id)) expect(game?.rules).toEqual([]);
  }
  // Edition ambiguities, failed primary retrievals and unreviewed labels stay excluded.
  for (const id of ['258', '270', '281', '995', '1055', '1137', '1869', '2086', '2510', '2965', '84732', '150145', '205597', '318243', '452264']) {
    expect(games.some(game => game.bggId === id)).toBe(false);
  }
});
test('native identity validation rejects stale or unsupported acceptance evidence', () => {
  const snapshotText = readFileSync('research/coverage/wikidata-native-title-leads.json', 'utf8');
  const decisionsText = readFileSync('research/coverage/wikidata-native-title-decisions.json', 'utf8');
  expect(nativeIdentityAdditions(snapshotText, decisionsText, []).games).toHaveLength(18);
  const mutateDecision = (change: (review: ReturnType<typeof JSON.parse>) => void) => {
    const review = JSON.parse(decisionsText); change(review);
    return () => nativeIdentityAdditions(snapshotText, JSON.stringify(review), []);
  };
  expect(mutateDecision(review => { review.sourceSnapshotSha256 = '0'.repeat(64); })).toThrow('different snapshot');
  expect(mutateDecision(review => { review.decisions[0].selectedTitle.language = 'en'; })).toThrow('Invalid native identity title');
  expect(mutateDecision(review => { review.decisions[0].sourceIds = ['unregistered-author']; })).toThrow('native primary source');
  expect(mutateDecision(review => { review.decisions[0].idProvenance[0].revision += 1; })).toThrow('P2339 evidence');
  expect(mutateDecision(review => { review.decisions[0].editionRuleTransferApproved = true; })).toThrow();
  expect(mutateDecision(review => { review.decisions.push(review.decisions[0]); })).toThrow('Duplicate native');
  expect(() => nativeIdentityAdditions(snapshotText, decisionsText, [{ name: 'Existing game', bggId: '156' }])).toThrow('Duplicate native');
  expect(() => nativeIdentityAdditions(snapshotText, decisionsText, [{ name: 'SKYJO', bggId: '999999' }])).toThrow('Duplicate native');
});
test('native identity validation checks the preserved entity and actual nondeprecated ID statement', () => {
  const originalSnapshot = JSON.parse(readFileSync('research/coverage/wikidata-native-title-leads.json', 'utf8'));
  const originalReview = JSON.parse(readFileSync('research/coverage/wikidata-native-title-decisions.json', 'utf8'));
  const canonical = (value: unknown): string => {
    if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
    if (value !== null && typeof value === 'object') {
      const record = value as Record<string, unknown>;
      return `{${Object.keys(record).sort().map(key => `${JSON.stringify(key)}:${canonical(record[key])}`).join(',')}}`;
    }
    return JSON.stringify(value)!;
  };
  const hash = (value: string) => createHash('sha256').update(value).digest('hex');
  const changedEntity = (change: (item: ReturnType<typeof JSON.parse>) => void) => {
    const snapshot = structuredClone(originalSnapshot), review = structuredClone(originalReview);
    const item = snapshot.candidates[0].items[0]; change(item);
    item.entitySha256 = hash(canonical(item.entity));
    review.decisions[0].idProvenance[0].entitySha256 = item.entitySha256;
    const entities = Object.fromEntries(snapshot.candidates.flatMap((candidate: { items: { wikidataId: string; entity: unknown }[] }) => candidate.items.map(item => [item.wikidataId, item.entity])));
    snapshot.source.entitiesSha256 = hash(canonical(entities));
    review.sourceSnapshotEntitiesSha256 = snapshot.source.entitiesSha256;
    const snapshotText = JSON.stringify(snapshot); review.sourceSnapshotSha256 = hash(snapshotText);
    return () => nativeIdentityAdditions(snapshotText, JSON.stringify(review), []);
  };
  // Rebinding hashes must not turn a deprecated/mismatched statement into ID evidence.
  expect(changedEntity(item => { item.entity.claims.P2339[0].rank = 'deprecated'; item.bggIdClaims[0].rank = 'deprecated'; })).toThrow('P2339 evidence');
  expect(changedEntity(item => { item.entity.claims.P2339[0].mainsnak.datavalue.value = '999999'; item.bggIdClaims[0].mainsnak.datavalue.value = '999999'; })).toThrow('P2339 evidence');
  expect(changedEntity(item => { item.entity.lastrevid += 1; })).toThrow('P2339 evidence');
  expect(changedEntity(item => { item.entity.labels.de.value = 'Invented title'; })).toThrow('Missing native entity title');
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
