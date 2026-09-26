import { expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { getCatalog, readRecords } from '../../src/lib/content/catalog';
import { assertPublishable, contentRevision, publicRule, ruleSchema } from '../../src/lib/content/schema';
import { searchRank } from '../../src/lib/search';
import { getCoverage } from '../../src/lib/content/coverage';
import { getBoardGames, nativeIdentityAdditions } from '../../src/lib/content/board-games';
import { getBrowseShelves, BROWSE_PAGE_SIZE } from '../../src/lib/content/board-game-browse';
import { randomRuleEligible } from '../../src/lib/content/random-rules';
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
  expect(games).toHaveLength(4988);
  // Edition ambiguities, failed primary retrievals and unreviewed labels stay excluded.
  for (const id of ['258', '270', '281', '995', '1055', '1137', '1869', '2086', '2510', '2965', '84732', '150145', '205597', '318243', '452264']) {
    expect(games.some(game => game.bggId === id)).toBe(false);
  }
});
test('native identity validation rejects stale or unsupported acceptance evidence', () => {
  const snapshotText = readFileSync('research/coverage/wikidata-native-title-leads.json', 'utf8');
  const decisionsText = readFileSync('research/coverage/wikidata-native-title-decisions.json', 'utf8');
  expect(nativeIdentityAdditions(snapshotText, decisionsText, []).games).toHaveLength(32);
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
  expect(review.counts).toMatchObject({ totalCandidates: 288, accept: 32, hold: 256, reviewed: 42, unreviewed: 246 });
  expect(decisions.filter(decision => decision.decision === 'accept')).toHaveLength(32);
  expect(decisions.filter(decision => decision.decision === 'hold')).toHaveLength(256);
  expect(decisions.filter(decision => decision.reviewed)).toHaveLength(42);
  expect(decisions.filter(decision => !decision.reviewed)).toHaveLength(246);
  expect(decisions.filter(decision => decision.reviewed && decision.decision === 'hold')).toHaveLength(10);
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
