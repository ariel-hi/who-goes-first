import { expect, test, vi } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { getCatalog, readRecords } from '../../src/lib/content/catalog';
import * as catalogModule from '../../src/lib/content/catalog';
import { assertPublishable, contentRevision, publicRule, ruleSchema } from '../../src/lib/content/schema';
import { directorySearchKey, searchRank } from '../../src/lib/search';
import { GET as directorySearch } from '../../src/pages/board-games/search.json';
import { GET as ruleSearch } from '../../src/pages/rule-index.json';
import { getCoverage } from '../../src/lib/content/coverage';
import { getBoardGames, nativeIdentityAdditions } from '../../src/lib/content/board-games';
import { getBrowseShelves, BROWSE_PAGE_SIZE } from '../../src/lib/content/board-game-browse';
import { randomRuleEligible } from '../../src/lib/content/random-rules';

test('Amigo identities retain complete holds and numeric provenance without borrowing rules', async () => {
  const review = JSON.parse(readFileSync('research/coverage/wikidata-native-title-decisions.json', 'utf8'));
  const games = getBoardGames();
  const directory = await directorySearch().json() as Array<{ id: string; name: string; ruleCount: number; terms?: string[]; slug?: string }>;
  const checked = await ruleSearch().json() as Array<{ n: string; a: string[] }>;
  for (const [id, name] of [['325853', 'Lama Dice'], ['394889', 'Cabanga!'], ['447384', 'Meister Makatsu']] as const) {
    const decision = review.decisions.find((item: { bggId: string }) => item.bggId === id);
    expect(decision).toMatchObject({ decision: 'accept', reviewed: true, priorBoundedDisposition: null, idEvidenceStatus: 'wikidata-statement-only', independentRawIdEvidence: [], startingRuleApproved: false, editionRuleTransferApproved: false });
    expect(decision.identityReviewHistory).toHaveLength(1);
    expect(decision.identityReviewHistory[0].fullPreviousDecision).toMatchObject({ decision: 'hold', reviewed: false, selectedTitle: decision.selectedTitle, idProvenance: decision.idProvenance, priorBoundedDisposition: null });
    expect(decision.primaryIdentityReviewEvidence).toMatchObject({ literalP856: 'http://www.amigo-spiele.de/', observedRequestScheme: 'https', primaryHostedNumericBggHrefObserved: false, metadataRepairApproved: false, relatedIdentityMergeApproved: false });
    for (const sourceId of decision.sourceIds) {
      const source = review.sources[sourceId];
      expect(source.sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(source.byteCount).toBeGreaterThan(0);
      if (existsSync(source.cacheFile)) {
        const raw = readFileSync(source.cacheFile);
        expect(raw.length).toBe(source.byteCount);
        expect(createHash('sha256').update(raw).digest('hex')).toBe(source.sha256);
      }
    }
    expect(games.find(game => game.bggId === id)).toMatchObject({ name, rules: [] });
    expect(directory.find(entry => entry.id === id)).toMatchObject({ name, ruleCount: 0 });
    expect(directory.find(entry => entry.id === id)).not.toHaveProperty('slug');
    expect(checked.some(entry => entry.n === name || entry.a.includes(name))).toBe(false);
  }
  expect(games.find(game => game.bggId === '447384')?.searchNames).toEqual(['Maître Makatsu']);
  expect(checked.some(entry => entry.a.includes('Maître Makatsu'))).toBe(false);
  for (const id of ['15828', '38195', '40234', '146149', '191473', '205766', '257957', '433340', '451923']) {
    expect(review.decisions.find((item: { bggId: string }) => item.bggId === id)).toMatchObject({ decision: 'hold', reviewed: false });
    expect(games.some(game => game.bggId === id)).toBe(false);
  }
});

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
  for (const [id, name] of [['286063', 'The 7th Citadel'], ['356944', 'Stonesaga'], ['400602', 'Civolution'], ['434367', 'Nippon: Zaibatsu']] as const) {
    const game = games.find(game => game.bggId === id);
    expect(game?.name).toBe(name);
    if (id === '434367') expect(game?.rules).toEqual([]);
  }
  for (const [id, name] of [['276182', 'Dead Reckoning'], ['380619', 'Cyclades: Legendary Edition'], ['421606', 'Knitting Circle']] as const) {
    const game = games.find(game => game.bggId === id);
    expect(game?.name).toBe(name);
    expect(game?.rules).toEqual([]);
  }
  for (const [id, name, ruleId] of [
    ['407343', 'Ironwood', 'ironwood-mindclash-en-publisher-rulebook'],
    ['414117', 'Wroth', 'wroth-chip-theory-en-v1-0'],
    ['421310', 'Beyond the Horizon', 'beyond-the-horizon-super-meeple-fr-rulebook'],
    ['428280', 'Final Titan', 'final-titan-gaga-2026-ru-main'],
  ] as const) {
    const game = games.find(game => game.bggId === id);
    expect(game?.name).toBe(name);
    expect(game?.rules.map(rule => rule.id)).toEqual([ruleId]);
  }
  for (const [id, name] of [
    ['273910', 'Stars of Akarios'], ['322421', 'Aqua Garden'],
    ['360899', 'Harrow County: The Game of Gothic Conflict'], ['447999', 'Dino Garden'],
  ] as const) {
    const game = games.find(game => game.bggId === id);
    expect(game?.name).toBe(name);
    const expected = ({ '273910': 'stars-of-akarios-crowd-ru-base-manual', '322421': 'aqua-garden-uchibacoya-en-rulebook', '360899': 'harrow-county-off-the-page-en-2023-full', '447999': 'dino-garden-uchibacoya-en-rulebook' } as Record<string, string>)[id];
    expect(game?.rules.map(rule => rule.id)).toEqual(expected ? [expected] : []);
  }
  for (const [id, name] of [['415147', 'Spectacular'], ['432834', 'The Great Library'], ['452684', 'Yami']] as const) {
    expect(games.find(game => game.bggId === id)?.name).toBe(name);
  }
  expect(games.find(game => game.bggId === '432834')?.rules).toEqual([]);
  expect(games.find(game => game.bggId === '415147')?.rules.map(rule => rule.id)).toEqual(['spectacular-crowd-ru-base-manual']);
  expect(games.find(game => game.bggId === '452684')?.rules.map(rule => rule.id)).toEqual(['yami-crowd-ru-training-manual']);
  expect(games.find(game => game.bggId === '410097')).toMatchObject({ name: 'The Kakapo: Buddy & Party', rules: [] });
  expect(games.find(game => game.bggId === '452264')).toMatchObject({ name: 'Brass: Pittsburgh', rules: [] });
  for (const [id, name] of [['325853', 'Lama Dice'], ['394889', 'Cabanga!'], ['447384', 'Meister Makatsu']] as const) {
    expect(games.find(game => game.bggId === id)).toMatchObject({ name, rules: [] });
  }
  expect(games).toHaveLength(4999);
  // Edition ambiguities, failed primary retrievals and unreviewed labels stay excluded.
  for (const id of ['258', '270', '281', '995', '1055', '1137', '1869', '2086', '2510', '2965', '41829', '84732', '150145', '205597', '318243', '447998', '418683', '406454']) {
    expect(games.some(game => game.bggId === id)).toBe(false);
  }
});
test('native identity validation rejects stale or unsupported acceptance evidence', () => {
  const snapshotText = readFileSync('research/coverage/wikidata-native-title-leads.json', 'utf8');
  const decisionsText = readFileSync('research/coverage/wikidata-native-title-decisions.json', 'utf8');
  expect(nativeIdentityAdditions(snapshotText, decisionsText, []).games).toHaveLength(43);
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

test('accepted native alternate names are search-only and deduped without held identity leakage', async () => {
  const games = getBoardGames();
  const identities = nativeIdentityAdditions(readFileSync('research/coverage/wikidata-native-title-leads.json', 'utf8'), readFileSync('research/coverage/wikidata-native-title-decisions.json', 'utf8'), []).games;
  const entries = await directorySearch().json() as Array<{ name: string; id: string; ruleCount: number; terms?: string[]; slug?: string }>;
  for (const [id, name, alternate] of [
    ['273910', 'Stars of Akarios', 'Звёзды Акариоса'],
    ['322421', 'Aqua Garden', 'Зоосад: Вода'],
    ['360899', 'Harrow County: The Game of Gothic Conflict', 'Округ Хэрроу: Готическое противостояние'],
    ['447999', 'Dino Garden', 'Зоосад: Дино'],
    ['415147', 'Spectacular', 'Заповедник: Исчезающие виды'],
    ['415147', 'Spectacular', 'Útočiště'],
    ['432834', 'The Great Library', 'Великая библиотека'],
    ['432834', 'The Great Library', 'A Nagy Könyvtár'],
    ['452684', 'Yami', 'Ями'],
    ['452264', 'Brass: Pittsburgh', 'Брасс: Питтсбург'],
    ['447384', 'Meister Makatsu', 'Maître Makatsu'],
  ] as const) {
    expect(identities.find(game => game.bggId === id)).toMatchObject({ name, searchNames: expect.arrayContaining([alternate]), status: 'needs-primary-source' });
    expect(identities.find(game => game.bggId === id)).not.toHaveProperty('rules');
    const game = games.find(game => game.bggId === id)!;
    expect(game).toMatchObject({ name, searchNames: expect.arrayContaining([alternate]) });
    const entry = entries.find(entry => entry.id === id)!;
    expect(entry).toMatchObject({ name, ruleCount: game.rules.length, terms: expect.arrayContaining([alternate]) });
    if (game.rules.length === 1) expect(entry.slug).toBe(game.rules[0]!.slug);
    else expect(entry).not.toHaveProperty('slug');
    expect(entries.filter(entry => entry.terms?.some(term => directorySearchKey(term) === directorySearchKey(alternate))).map(entry => entry.id)).toEqual([id]);
  }
  expect(games.find(game => game.bggId === '273910')!.rules.map(rule => rule.id)).toEqual(['stars-of-akarios-crowd-ru-base-manual']);
  expect(games.find(game => game.bggId === '452684')!.searchNames).toEqual(['Ями']);
  expect(games.find(game => game.bggId === '410097')!.searchNames).not.toContain('Ями');
  expect(games.find(game => game.bggId === '396790')!.searchNames.filter(name => name === 'Nukleum')).toHaveLength(1);
  expect(games.find(game => game.bggId === '258779')!.searchNames.filter(name => name === 'プラネット アンノウン')).toHaveLength(1);
  expect(games.find(game => game.bggId === '245476')!.searchNames).toEqual([]);
  const review = JSON.parse(readFileSync('research/coverage/wikidata-native-title-decisions.json', 'utf8'));
  const heldIds = new Set(review.decisions.filter((decision: { decision: string }) => decision.decision === 'hold').map((decision: { bggId: string }) => decision.bggId));
  expect(games.filter(game => heldIds.has(game.bggId)).every(game => game.searchNames.length === 0)).toBe(true);
  expect(entries.find(entry => entry.id === '452264')).toMatchObject({ name: 'Brass: Pittsburgh', ruleCount: 0, terms: ['Брасс: Питтсбург'] });
  expect(entries.some(entry => ['418683', '406454'].includes(entry.id))).toBe(false);
  expect(entries.some(entry => entry.terms?.includes('Маршрут построен: Расширенное издание'))).toBe(false);
  for (const entry of entries) {
    const keys = [entry.name, ...(entry.terms ?? [])].map(directorySearchKey);
    expect(new Set(keys).size).toBe(keys.length);
    expect(Object.keys(entry).every(key => ['name', 'id', 'ruleCount', 'terms', 'slug'].includes(key))).toBe(true);
  }
  // Alternate names cannot attach another game's rule or move an approved edition.
  expect(games.flatMap(game => game.rules.map(rule => rule.id)).toSorted()).toEqual(getCatalog().map(rule => rule.id).toSorted());
  const catalog = getCatalog();
  const searchOnlyRule = { ...catalog[0]!, id: 'test-search-only-title', gameName: 'Зоосад: Вода', aliases: [] };
  const catalogSpy = vi.spyOn(catalogModule, 'getCatalog').mockReturnValue([...catalog, searchOnlyRule]);
  try {
    expect(getBoardGames().some(game => game.rules.some(rule => rule.id === searchOnlyRule.id))).toBe(false);
  } finally { catalogSpy.mockRestore(); }
});
test('checked rule search follows assigned native identities without changing approved content', async () => {
  const catalog = getCatalog();
  const before = JSON.stringify(catalog);
  const entries = await ruleSearch().json() as Array<{ n: string; a: string[]; e: string; s: string }>;
  expect(entries.map(entry => entry.s)).toEqual(catalog.map(rule => rule.slug));
  for (const game of getBoardGames()) {
    for (const rule of game.rules) {
      const entry = entries.find(entry => entry.s === rule.slug)!;
      expect(entry).toMatchObject({ n: rule.gameName, e: rule.editionLabel });
      for (const name of rule.aliases) {
        expect(searchRank({ gameName: entry.n, aliases: entry.a, editionLabel: entry.e }, name)).toBe(0);
      }
      for (const name of game.searchNames) {
        expect(Number.isFinite(searchRank({ gameName: entry.n, aliases: entry.a, editionLabel: entry.e }, name))).toBe(true);
      }
      expect(entry.a.slice(0, rule.aliases.length)).toEqual(rule.aliases);
      const addedKeys = entry.a.slice(rule.aliases.length).map(directorySearchKey);
      expect(new Set(addedKeys).size).toBe(addedKeys.length);
      const originalKeys = [entry.n, ...rule.aliases].map(directorySearchKey);
      expect(addedKeys.every(key => !originalKeys.includes(key))).toBe(true);
    }
  }
  expect(entries.find(entry => entry.s === 'stars-of-akarios-crowd-ru-base-manual')!.a).toContain('Звёзды Акариоса');
  expect(entries.some(entry => entry.a.includes('Брасс: Питтсбург'))).toBe(false);
  expect(entries.some(entry => entry.a.includes('Великая библиотека'))).toBe(false);
  expect(JSON.stringify(getCatalog())).toBe(before);
  expect(catalog.find(rule => rule.id === 'stars-of-akarios-crowd-ru-base-manual')!.aliases).toEqual([]);

  const unmapped = { ...catalog[0]!, id: 'test-unmapped-search', slug: 'test-unmapped-search', gameName: 'Unmapped fixture', aliases: ['Fixture alias'] };
  const catalogSpy = vi.spyOn(catalogModule, 'getCatalog').mockReturnValue([...catalog, unmapped]);
  try {
    const withFixture = await ruleSearch().json() as typeof entries;
    expect(withFixture.find(entry => entry.s === unmapped.slug)).toMatchObject({ n: unmapped.gameName, a: unmapped.aliases });
  } finally { catalogSpy.mockRestore(); }
});

test('native acceptance distinguishes semantic and direct numeric proof while retaining prior holds', () => {
  const review = JSON.parse(readFileSync('research/coverage/wikidata-native-title-decisions.json', 'utf8'));
  const decisions = review.decisions as Array<{
    bggId: string; decision: string; reviewed: boolean; independentRawIdEvidence: unknown[];
    idEvidenceStatus: string; identityCorroborationStatus?: string;
    startingRuleApproved: boolean; editionRuleTransferApproved: boolean;
    identityReviewHistory?: Array<{ fullPreviousDecision: { decision: string; idProvenance: unknown; independentRawIdEvidence: unknown[] } }>;
    idProvenance: unknown;
    semanticIdentityEvidence?: { primaryNumericHrefObserved: boolean; relatedQidResolution: { entities: Array<{ wikidataId: string; hasEnglishLabel: boolean; labels: Record<string, unknown> }> } };
  }>;
  expect(review.counts).toMatchObject({ totalCandidates: 288, accept: 43, hold: 245, reviewed: 55, unreviewed: 233, additionalAccepted: 33 });
  expect(decisions.filter(decision => decision.decision === 'accept')).toHaveLength(43);
  expect(decisions.filter(decision => decision.decision === 'hold')).toHaveLength(245);
  expect(decisions.filter(decision => decision.reviewed)).toHaveLength(55);
  expect(decisions.filter(decision => !decision.reviewed)).toHaveLength(233);
  expect(decisions.filter(decision => decision.reviewed && decision.decision === 'hold')).toHaveLength(12);
  for (const id of ['452264', '418683']) {
    const decision = review.decisions.find((item: { bggId: string }) => item.bggId === id);
    expect(decision).toMatchObject({ decision: id === '452264' ? 'accept' : 'hold', reviewed: true, priorBoundedDisposition: null, startingRuleApproved: false, editionRuleTransferApproved: false, independentRawIdEvidence: [] });
    expect(decision.identityReviewHistory[0].fullPreviousDecision).toMatchObject({ decision: 'hold', reviewed: false, selectedTitle: decision.selectedTitle, idProvenance: decision.idProvenance, priorBoundedDisposition: null });
    expect(decision.rootIdentityReview.applicationHead).toBe('749eab519d18af679eab64224b9028bc5fe8cc9c');
    expect(decision.primaryIdentityReviewEvidence).toMatchObject({ primaryHostedNumericBggHrefObserved: false, metadataRepairApproved: false, relatedIdentityMergeApproved: false });
    for (const sourceId of decision.sourceIds) {
      const source = review.sources[sourceId];
      expect(source.sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(source.byteCount).toBeGreaterThan(0);
      if (existsSync(source.cacheFile)) {
        const raw = readFileSync(source.cacheFile);
        expect(raw.length).toBe(source.byteCount);
        expect(createHash('sha256').update(raw).digest('hex')).toBe(source.sha256);
      }
    }
  }
  const brass = review.decisions.find((item: { bggId: string }) => item.bggId === '452264');
  expect(brass.idEvidenceStatus).toBe('wikidata-statement-only');
  const enRoute = review.decisions.find((item: { bggId: string }) => item.bggId === '418683');
  expect(enRoute.idEvidenceStatus).toBe('wikidata-statement-only-with-competing-primary-href');
  expect(enRoute.primaryIdentityReviewEvidence.completePrimaryContexts[0].numericBggAnchors[0].attributes).toContainEqual(['href', 'https://boardgamegeek.com/boardgame/406454/en-route']);
  const brassGames = getBoardGames().filter(game => ['452264', '224517', '28720'].includes(game.bggId));
  expect(brassGames).toHaveLength(3);
  expect(brassGames.find(game => game.bggId === '452264')?.rules).toEqual([]);
  expect(brassGames.filter(game => game.bggId !== '452264').every(game => !game.searchNames.includes('Брасс: Питтсбург'))).toBe(true);
  for (const id of ['415147', '432834', '452684']) {
    const decision = review.decisions.find((item: { bggId: string }) => item.bggId === id);
    expect(decision).toMatchObject({ decision: 'accept', reviewed: true, priorBoundedDisposition: null, idEvidenceStatus: 'primary-href-and-wikidata-statement', startingRuleApproved: false, editionRuleTransferApproved: false });
    expect(decision.identityReviewHistory).toHaveLength(1);
    expect(decision.identityReviewHistory[0].fullPreviousDecision).toMatchObject({ decision: 'hold', reviewed: false, priorBoundedDisposition: null, selectedTitle: decision.selectedTitle, idProvenance: decision.idProvenance });
    expect(decision.independentRawIdEvidence).toHaveLength(1);
    expect(decision.independentRawIdEvidence[0]).toMatchObject({ rawId: id, exactCandidateId: true, destinationFetched: false });
    expect(decision.sourceIds.every((sourceId: string) => review.sources[sourceId]?.status === 'retrieved' && review.sources[sourceId]?.cacheFile)).toBe(true);
  }
  const yami = review.decisions.find((item: { bggId: string }) => item.bggId === '452684');
  expect(yami.primaryIdentityReviewEvidence).toMatchObject({ relatedIdentityMergeApproved: false, metadataRepairApproved: false });
  expect(yami.primaryIdentityReviewEvidence.completePrimaryHtmlTitles[1]).toContain('The Kakapo: Buddy & Party');
  for (const id of ['41829', '273910', '322421', '360899', '447999']) {
    const decision = review.decisions.find((item: {bggId:string}) => item.bggId === id);
    expect(decision).toMatchObject({ decision: id === '41829' ? 'hold' : 'accept', reviewed:true, startingRuleApproved:false, editionRuleTransferApproved:false });
    expect(decision.identityReviewHistory).toHaveLength(1);
    expect(decision.identityReviewHistory[0].fullPreviousDecision).toMatchObject({ decision:'hold', reviewed:false, selectedTitle:decision.selectedTitle, idProvenance:decision.idProvenance });
    expect(decision.rootIdentityReview.applicationHead).toBe('8021cfce8468e3937d2b494c95ae0ffd83b54973');
    expect(decision.sourceIds.every((sourceId:string) => review.sources[sourceId]?.status === 'retrieved')).toBe(true);
    if (['273910','322421','360899'].includes(id)) {
      expect(decision.idEvidenceStatus).toBe('primary-href-and-wikidata-statement');
      expect(decision.independentRawIdEvidence).toHaveLength(1);
      expect(decision.independentRawIdEvidence[0]).toMatchObject({rawId:id,exactCandidateId:true,destinationFetched:false});
    } else expect(decision.independentRawIdEvidence).toEqual([]);
  }
  const dino = review.decisions.find((item:{bggId:string}) => item.bggId === '447999');
  expect(dino.semanticIdentityEvidence).not.toHaveProperty('primaryNumericHrefObserved');
  expect(dino.semanticIdentityEvidence).toMatchObject({primaryProductNumericHrefObserved:false,primaryNumericTitleBindingEstablished:false,observedUnboundCollectionHref:{href:'https://boardgamegeek.com/boardgame/447999/dino-garden',titleBindingEstablished:false,destinationFetched:false}});
  for (const id of ['359029', '387388', '422374', '428280']) {
    const decision = review.decisions.find((item: {bggId: string}) => item.bggId === id);
    expect(decision).toMatchObject({ decision: id === '428280' ? 'accept' : 'hold', reviewed: true, idEvidenceStatus: 'wikidata-statement-only', independentRawIdEvidence: [], startingRuleApproved: false, editionRuleTransferApproved: false });
    expect(decision.semanticIdentityEvidence.primaryNumericHrefObserved).toBe(false);
    expect(decision.identityReviewHistory).toHaveLength(1);
    expect(decision.identityReviewHistory[0].fullPreviousDecision).toMatchObject({ decision: 'hold', reviewed: false, idProvenance: decision.idProvenance, selectedTitle: decision.selectedTitle });
    expect(decision.rootIdentityReview.originalIntakeManifestSha256).toBe('9c4c89748444ed41866193d86307774753260742ce931fef0b9db47735cdd6a2');
  }
  for (const id of ['276182', '380619', '421606']) {
    const decision = decisions.find(item => item.bggId === id)!;
    expect(decision).toMatchObject({ decision: 'accept', reviewed: true, idEvidenceStatus: 'wikidata-statement-only', identityCorroborationStatus: 'primary-semantic-corroboration', independentRawIdEvidence: [], startingRuleApproved: false, editionRuleTransferApproved: false });
    expect(decision.semanticIdentityEvidence?.primaryNumericHrefObserved).toBe(false);
    expect(decision.identityReviewHistory).toHaveLength(1);
    expect(decision.identityReviewHistory?.[0]?.fullPreviousDecision).toMatchObject({ decision: 'hold', independentRawIdEvidence: [] });
    expect(decision.identityReviewHistory?.[0]?.fullPreviousDecision.idProvenance).toEqual(decision.idProvenance);
  }
  for (const [id, name] of [['274124', 'Northgard: Uncharted Lands'], ['340980', 'ImmunoWars'], ['312859', 'Townsfolk Tussle']]) {
    const decision = review.decisions.find((item: {bggId: string}) => item.bggId === id);
    expect(decision).toMatchObject({ decision: 'accept', reviewed: true, displayName: name, selectedTitle: {text: name, language: 'mul', source: 'label'}, idEvidenceStatus: 'wikidata-statement-only', identityCorroborationStatus: 'primary-semantic-corroboration', independentRawIdEvidence: [], startingRuleApproved: false, editionRuleTransferApproved: false });
    expect(decision.semanticIdentityEvidence.primaryNumericHrefObserved).toBe(false);
    expect(decision.identityReviewHistory).toHaveLength(1);
    expect(decision.identityReviewHistory[0].fullPreviousDecision).toMatchObject({ decision: 'hold', reviewed: false, idProvenance: decision.idProvenance, selectedTitle: decision.selectedTitle });
    expect(decision.rootIndependentReview.priorDecisionsSha256).toBe('a68386a3d07f12cdbe0ad1697ac06a09823e981814236f12c9c1667812697174');
    expect(decision.sourceIds.every((sourceId: string) => review.sources[sourceId]?.status === 'retrieved')).toBe(true);
  }
  const ironwood = decisions.find(decision => decision.bggId === '407343')!;
  expect(ironwood).toMatchObject({ decision: 'accept', reviewed: true, idEvidenceStatus: 'primary-href-and-wikidata-statement', startingRuleApproved: false, editionRuleTransferApproved: false });
  expect(ironwood.independentRawIdEvidence).toEqual([{
    sourceId: 'supermeeple-ironwood', href: 'https://boardgamegeek.com/boardgame/407343/ironwood', rawId: '407343', exactCandidateId: true,
    location: 'literal product-page anchor 145 (zero-based)', destinationFetched: false,
  }]);
  expect(review.sources['supermeeple-ironwood']).toMatchObject({ url: 'https://www.supermeeple.com/nos-jeux/ironwood/', kind: 'primary-publisher', status: 'retrieved', sha256: 'db64e0d26d34e414daafbae75084da39d3ebb2a98d8d567665041f8099df0ae7', byteCount: 177624 });
  expect(ironwood.identityReviewHistory).toHaveLength(1);
  expect(ironwood.identityReviewHistory?.[0]?.fullPreviousDecision).toMatchObject({ decision: 'hold', independentRawIdEvidence: [] });
  expect(ironwood.identityReviewHistory?.[0]?.fullPreviousDecision.idProvenance).toEqual(ironwood.idProvenance);
  for (const id of ['414117', '421310']) {
    const decision = decisions.find(item => item.bggId === id)!;
    expect(decision).toMatchObject({ decision: 'accept', reviewed: true, startingRuleApproved: false, editionRuleTransferApproved: false });
    expect(decision.identityReviewHistory).toHaveLength(1);
    expect(decision.identityReviewHistory?.[0]?.fullPreviousDecision).toMatchObject({ decision: 'hold', independentRawIdEvidence: [] });
    expect(decision.identityReviewHistory?.[0]?.fullPreviousDecision.idProvenance).toEqual(decision.idProvenance);
  }
  const wroth = review.decisions.find((decision: { bggId: string }) => decision.bggId === '414117');
  expect(wroth).toMatchObject({ idEvidenceStatus: 'wikidata-statement-only', identityCorroborationStatus: 'primary-semantic-corroboration', independentRawIdEvidence: [] });
  expect(wroth.primaryIdentityReviewEvidence).toMatchObject({ primaryHostedNumericBggHrefObserved: false, numericClaimSource: 'preserved-wikidata-p2339-only', preservedLocalizedLabel: { language: 'de', value: 'Groll' }, creatorClaimRepairApproved: false, quantityYearOrTerritoryRepairApproved: false });
  expect(wroth.sourceIds).toEqual(['chip-wroth', 'chip-wroth-support', 'frosted-wroth-announcement', 'frosted-groll-product']);
  expect(review.sources['frosted-wroth-announcement']).toMatchObject({ url: 'https://frostedgames.de/die-gamefound-kampagne-zu-wroth-startet/2024/03/', sha256: '5efc183985061e391882dcedfdcd6c7e84a6f34ff310bc471a5a3da93ed1ab63', byteCount: 119476, externalIdEvidence: [] });
  expect(review.sources['frosted-groll-product']).toMatchObject({ url: 'https://frostedgames.de/shop/groll/', sha256: '6d301afe5c657fe72cc3d144bad3d76655b5655b21ce73f2558838fcf96cbec4', byteCount: 185584, externalIdEvidence: [] });
  const horizon = review.decisions.find((decision: { bggId: string }) => decision.bggId === '421310');
  expect(horizon).toMatchObject({ idEvidenceStatus: 'primary-href-and-wikidata-statement', identityCorroborationStatus: 'primary-hosted-numeric-href' });
  expect(horizon.independentRawIdEvidence).toEqual([{ sourceId: 'supermeeple-horizon-product', href: 'https://boardgamegeek.com/boardgame/421310/beyond-the-horizon', rawId: '421310', exactCandidateId: true, location: 'literal product-page anchor 145 (zero-based), original byte offset 148359', destinationFetched: false }]);
  expect(review.sources['supermeeple-horizon-product']).toMatchObject({ url: 'https://www.supermeeple.com/nos-jeux/beyondthehorizon/', sha256: 'ad10e1046d444917c7939bff7f0322ebf38874a87507f0fa866460a937b97040', byteCount: 176722 });
  const sesame = decisions.find(decision => decision.bggId === '380619')?.semanticIdentityEvidence?.relatedQidResolution.entities.find(entity => entity.wikidataId === 'Q134451123');
  expect(sesame?.hasEnglishLabel).toBe(false);
  expect(sesame?.labels).not.toHaveProperty('en');
  const snapshot = JSON.parse(readFileSync('research/coverage/wikidata-native-title-leads.json', 'utf8'));
  const knitting = snapshot.candidates.find((candidate: { bggId: string }) => candidate.bggId === '421606');
  expect(knitting.items[0].entity.claims).not.toHaveProperty('P170');
  expect(knitting.items[0].entity.claims).not.toHaveProperty('P178');
  const savedIronwood = snapshot.candidates.find((candidate: { bggId: string }) => candidate.bggId === '407343');
  expect(savedIronwood.items[0].entity.claims).not.toHaveProperty('P170');
  expect(savedIronwood.items[0].entity.claims).not.toHaveProperty('P178');
  expect(savedIronwood.items[0].entity.claims).not.toHaveProperty('P110');
  expect(savedIronwood.items[0].entity.claims.P2899[0].mainsnak.datavalue.value.amount).toBe('+12');
  const ironwoodRecord = review.decisions.find((decision: { bggId: string }) => decision.bggId === '407343');
  expect(ironwoodRecord.editionNotes).toContain('Identity only: French product age14+ differs from saved12; no printing/release dates, rule text, creator claim or edition equivalence inferred. The unfetched FR manual filename is not reviewed date evidence.');
  for (const id of ['414117', '421310']) {
    const saved = snapshot.candidates.find((candidate: { bggId: string }) => candidate.bggId === id).items[0].entity;
    expect(saved.claims).not.toHaveProperty('P170');
    expect(saved.claims).not.toHaveProperty('P178');
  }
  const savedWroth = snapshot.candidates.find((candidate: { bggId: string }) => candidate.bggId === '414117').items[0].entity;
  expect(savedWroth.claims.P2899[0].mainsnak.datavalue.value.amount).toBe('+13');
  expect(savedWroth.claims.P1872[0].mainsnak.datavalue.value.amount).toBe('+1');
  expect(wroth.editionNotes).toContain('German page explicitly offers solo/cooperative modes and scenario components; original cached base page says2–4. This supports only German page mode scope, not English base solo equivalence or rule transfer.');
  expect(wroth.editionNotes).toContain('Saved2025 publication is not corroborated:2024 announcement is a campaign date; German shop2026 is its own product context.');
  expect(horizon.editionNotes).toContain('Saved2024 year and alternative90-minute claim remain uncorroborated by the fetched page.');
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
  expect(changedEntity(item => { item.titleOptions.push({ text: 'Invented search name', language: 'ru', source: 'label' }); })).toThrow('Missing native alternate title');
  expect(changedEntity(item => {
    item.titleOptions.push({ text: 'Deprecated search name', language: 'ru', source: 'P1476', statementId: `${item.wikidataId}$test-title` });
    item.entity.claims.P1476 = [{ id: `${item.wikidataId}$test-title`, rank: 'deprecated', mainsnak: { property: 'P1476', snaktype: 'value', datavalue: { type: 'monolingualtext', value: { text: 'Deprecated search name', language: 'ru' } } } }];
  })).toThrow('Missing native alternate title');
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
test('the three manual approvals bind exact revisions and remain outside the portable mix', () => {
  const catalog = getCatalog();
  const drafts = readRecords('research/games').map(record => ruleSchema.parse(record));
  for (const id of ['ironwood-mindclash-en-publisher-rulebook', 'wroth-chip-theory-en-v1-0', 'beyond-the-horizon-super-meeple-fr-rulebook']) {
    const raw = ruleSchema.parse(JSON.parse(readFileSync(`src/content/games/${id}.json`, 'utf8')));
    const draft = drafts.find(record => record.id === id)!;
    expect(contentRevision(draft)).toBe(raw.approvedRevision);
    expect(draft).toMatchObject({ status: 'needs-review', approvedBy: null, approvedRevision: null, publishedAt: null });
    expect(() => assertPublishable({ ...raw, editionLabel: 'Another edition' })).toThrow('stale');
    expect(randomRuleEligible(catalog.find(rule => rule.id === id)!)).toBe(false);
    expect(raw.tieBreakApplicable).toBe(false);
  }
});
test('CrowD shared-folder manual approvals bind exact revisions and four independent edition assignments', () => {
  const games = getBoardGames();
  const catalog = getCatalog();
  expect(catalog).toHaveLength(893);
  expect(games.filter(game => game.rules.length > 0)).toHaveLength(887);
  expect(games.filter(game => game.rules.length === 0)).toHaveLength(4112);
  for (const [id, ruleId, firstPage, folder] of [
    ['322421', 'aqua-garden-uchibacoya-en-rulebook', 3, '_tSRueefX4dKjQ'],
    ['447999', 'dino-garden-uchibacoya-en-rulebook', 3, '_tSRueefX4dKjQ'],
    ['360899', 'harrow-county-off-the-page-en-2023-full', 19, 'IjsvmsDwtKGLPQ'],
    ['273910', 'stars-of-akarios-crowd-ru-base-manual', 13, 'G5NtVcPiXbqCKw'],
  ] as const) {
    const raw = ruleSchema.parse(JSON.parse(readFileSync(`src/content/games/${ruleId}.json`, 'utf8')));
    const draft = ruleSchema.parse(JSON.parse(readFileSync(`research/games/${ruleId}.json`, 'utf8')));
    expect(contentRevision(draft)).toBe(raw.approvedRevision);
    expect(draft).toMatchObject({ status: 'needs-review', approvedBy: null, approvedRevision: null, publishedAt: null, materiallyUpdatedAt: null });
    expect(games.find(game => game.bggId === id)?.rules.map(rule => rule.id)).toEqual([ruleId]);
    expect(raw.sources[0]).toMatchObject({ url: `https://disk.yandex.ru/d/${folder}`, pdfPagesOneBased: expect.arrayContaining([firstPage]) });
    expect(raw.sources[0]!.pdfPagesOneBased[0]).toBe(firstPage);
    expect(raw.tieBreakApplicable).toBe(false);
    expect(raw.officialTieBreak).toBeNull();
    expect(randomRuleEligible(catalog.find(rule => rule.id === ruleId)!)).toBe(false);
    expect(() => assertPublishable({ ...raw, firstPlayerRule: 'Different opening' })).toThrow('stale');
  }
  const dino = catalog.find(rule => rule.id === 'dino-garden-uchibacoya-en-rulebook')!;
  expect(dino.sources[0]!.location).toContain('spread8, left, no visible printed numeral');
  expect(dino.clarifications.join(' ')).toContain('space ahead on the Main track');
  const harrow = catalog.find(rule => rule.id === 'harrow-county-off-the-page-en-2023-full')!;
  expect(harrow.editionLabel).toContain('full two-player');
  expect(harrow.clarifications.join(' ')).toContain('Training Game');
  expect(harrow.clarifications.join(' ')).toContain('Fair Folk');
  expect(harrow.houseFallback).toContain('who reveals the first setup tile');
  const akarios = catalog.find(rule => rule.id === 'stars-of-akarios-crowd-ru-base-manual')!;
  expect(akarios.editionLabel).toContain('English summary of the Russian base manual');
  expect(akarios.firstPlayerRule).toContain('No fixed starting player');
  expect(akarios.sources[0]!.pdfPagesOneBased.slice(0, 2)).toEqual([13, 37]);
  expect(akarios.clarifications.join(' ')).toContain('first choose a space-event option together');
  expect(akarios.clarifications.join(' ')).toContain('separate scenario book was not reviewed');
});

test('Spectacular and Yami bind exact Russian manual openings without portable or related-game transfer', () => {
  const catalog = getCatalog();
  for (const [id, page, folder] of [
    ['spectacular-crowd-ru-base-manual', 6, 'avf_1T19WUChTg'],
    ['yami-crowd-ru-training-manual', 4, 'zNyTWDsIvJsItA'],
  ] as const) {
    const raw = ruleSchema.parse(JSON.parse(readFileSync(`src/content/games/${id}.json`, 'utf8')));
    const draft = ruleSchema.parse(JSON.parse(readFileSync(`research/games/${id}.json`, 'utf8')));
    expect(contentRevision(draft)).toBe(raw.approvedRevision);
    expect(draft).toMatchObject({ status: 'needs-review', approvedBy: null, approvedRevision: null, publishedAt: null, materiallyUpdatedAt: null });
    expect(raw.sources[0]!.url).toBe(`https://disk.yandex.ru/d/${folder}`);
    expect(raw.sources[0]!.pdfPagesOneBased[0]).toBe(page);
    expect(raw.tieBreakApplicable).toBe(false);
    expect(raw.officialTieBreak).toBeNull();
    expect(raw.aliases).toEqual([]);
    expect(randomRuleEligible(catalog.find(rule => rule.id === id)!)).toBe(false);
    expect(() => assertPublishable({ ...raw, editionLabel: 'Unreviewed English edition' })).toThrow('stale');
  }
  const spectacular = catalog.find(rule => rule.id === 'spectacular-crowd-ru-base-manual')!;
  expect(spectacular.firstPlayerRule).toContain('simultaneously');
  expect(spectacular.firstPlayerRule).toContain('numbers on the supply boards currently');
  expect(spectacular.houseFallback).toContain('does not give that player the first move');
  const yami = catalog.find(rule => rule.id === 'yami-crowd-ru-training-manual')!;
  expect(yami.editionLabel).toContain('opening training mission');
  expect(yami.firstPlayerRule).toContain('a human must start');
  expect(yami.clarifications.join(' ')).toContain('Automa may lead a later trick, but never receives the Kakapo pawn');
  expect(getBoardGames().find(game => game.bggId === '410097')!.rules).toEqual([]);
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
