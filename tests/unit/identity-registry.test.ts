import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import { createIdentityRegistry, identityReviewRevision, publisherIdentitySchema, type PublisherIdentityRecord } from '../../src/lib/content/identity-registry';
import { assignmentReviewRevision, identityAssignmentSchema, resolveIdentityAssignments, scopeLegacyOverrides, validateLegacyOverrideReferences } from '../../src/lib/content/identity-assignments';
import { getBoardGameInventory, getBoardGameRegistry, getBoardGames } from '../../src/lib/content/board-games';
import { contentRevision, ruleSchema, type RuleRecord } from '../../src/lib/content/schema';
import { readRecords } from '../../src/lib/content/catalog';

// Synthetic offline evidence only. These records never enter the active files.
const gameId = 'game-aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const otherId = 'game-bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const empty = { formatVersion: 1, records: [] };
const legacy = [{ name: 'Legacy Game', bggId: '12', discoveryUrl: 'https://boardgamegeek.com/boardgame/12', status: 'needs-primary-source' }];
function fixture(): PublisherIdentityRecord {
  return {
    identityId: gameId, routeKey: gameId, name: 'Offline Fixture', searchNames: [],
    publisher: 'Synthetic test publisher', identityScope: 'Synthetic base identity', identityEvidence: 'Synthetic complete product-context fixture; no real source approval.',
    publisherReferenceSourceId: 'product', sources: [{ id: 'product', kind: 'primary-publisher', url: 'https://publisher.example/game/', sha256: 'a'.repeat(64), byteCount: 123, location: 'Synthetic title and product description' }],
    collisionReviews: [], decision: 'draft', reviewedBy: null, reviewedAt: null, acceptedRevision: null,
  };
}
function accepted(changes: Partial<PublisherIdentityRecord> = {}): PublisherIdentityRecord {
  const record = { ...fixture(), ...changes, decision: 'accept' as const, reviewedBy: 'Offline unit-test fixture, not a real approval', reviewedAt: '2026-01-01' };
  record.acceptedRevision = identityReviewRevision(record);
  return record;
}
function rule(changes: Partial<RuleRecord> = {}): RuleRecord {
  const base = ruleSchema.parse(JSON.parse(readFileSync('src/content/games/azul-2018-en.json', 'utf8')));
  const record = { ...base, id: 'offline-fixture-rule', slug: 'offline-fixture-rule', gameName: 'Offline Fixture', aliases: [], editionLabel: 'Synthetic English base edition', ...changes };
  record.approvedRevision = ['approved', 'published'].includes(record.status) ? contentRevision(record) : null;
  return record;
}
function assignment(identity: PublisherIdentityRecord, edition: RuleRecord) {
  const record = {
    ruleId: edition.id, ruleRevision: contentRevision(edition), identityId: identity.identityId, identityRevision: identity.acceptedRevision!, editionScope: edition.editionLabel,
    evidence: [{ url: 'https://publisher.example/manual/', sha256: 'b'.repeat(64), location: 'Synthetic cover and setup', correspondence: 'Synthetic exact-edition relationship; no real source approval.' }],
    decision: 'accept' as const, reviewedBy: 'Offline unit-test fixture, not a real approval', reviewedAt: '2026-01-01', acceptedRevision: null as string | null,
  };
  record.acceptedRevision = assignmentReviewRevision(record);
  return record;
}

test('only current, source-bound accepted identities enter the registry; no BGG number is required', () => {
  for (const decision of ['draft', 'hold', 'reject'] as const) expect(createIdentityRegistry([], { formatVersion: 1, records: [{ ...fixture(), decision }] })).toEqual([]);
  const record = accepted();
  const [identity] = createIdentityRegistry([], { formatVersion: 1, records: [record] });
  expect(identity).toMatchObject({ identityId: gameId, routeKey: gameId, origin: 'publisher', reference: { label: 'Publisher reference' } });
  expect(identity).not.toHaveProperty('bggId');
  expect(identity?.reference?.url).not.toContain('boardgamegeek');
  expect(() => publisherIdentitySchema.parse({ ...record, reviewedBy: null })).toThrow();
  expect(() => publisherIdentitySchema.parse({ ...record, name: 'Changed after review' })).toThrow('stale');
  expect(() => publisherIdentitySchema.parse({ ...record, decision: 'hold' })).toThrow('Only accepted');
  expect(() => publisherIdentitySchema.parse(accepted({ sources: [] }))).toThrow('primary publisher');
  expect(() => publisherIdentitySchema.parse(accepted({ publisherReferenceSourceId: 'unknown' }))).toThrow('reference');
  expect(() => publisherIdentitySchema.parse({ ...fixture(), reviewedBy: 'Reviewer', reviewedAt: null })).toThrow('together');
});

test('IDs, routes and external numbers are validated independently and remain stable', () => {
  expect(() => publisherIdentitySchema.parse({ ...fixture(), routeKey: 'browse' })).toThrow();
  expect(() => publisherIdentitySchema.parse({ ...fixture(), routeKey: otherId })).toThrow('opaque route');
  expect(() => publisherIdentitySchema.parse({ ...fixture(), identityId: 'name-derived' })).toThrow();
  expect(() => createIdentityRegistry([...legacy, ...legacy], empty)).toThrow('Duplicate registry');
  expect(() => createIdentityRegistry([], { formatVersion: 1, records: [fixture(), fixture()] })).toThrow('Duplicate publisher');
  expect(() => publisherIdentitySchema.parse(accepted({ bggId: '12' }))).toThrow('matching explicit evidence');
  expect(() => publisherIdentitySchema.parse(accepted({ bggIdEvidence: { value: '12', sourceId: 'product', location: 'Synthetic claim' } }))).toThrow('matching explicit evidence');
  const record = accepted({ bggId: '12', bggIdEvidence: { value: '12', sourceId: 'product', location: 'Synthetic explicit external claim' } });
  expect(() => createIdentityRegistry(legacy, { formatVersion: 1, records: [record] })).toThrow('external BGG ID');
  const [identified] = createIdentityRegistry([], { formatVersion: 1, records: [record] });
  expect(identified).toMatchObject({ identityId: gameId, routeKey: gameId, bggId: '12' });
});

test('name, search-title and primary-URL collisions require reviewed distinction, never a merge', () => {
  const sameName = accepted({ name: 'Legacy Game' });
  expect(() => createIdentityRegistry(legacy, { formatVersion: 1, records: [sameName] })).toThrow('collision');
  const sameAlias = accepted({ searchNames: ['Legacy Game'] });
  expect(() => createIdentityRegistry(legacy, { formatVersion: 1, records: [sameAlias] })).toThrow('collision');
  const distinct = accepted({ name: 'Legacy Game', collisionReviews: [{ identityId: 'bgg-12', reason: 'Synthetic distinct edition correspondence', sourceIds: ['product'] }] });
  expect(createIdentityRegistry(legacy, { formatVersion: 1, records: [distinct] }).map(identity => identity.identityId)).toEqual(['bgg-12', gameId]);
  expect(() => createIdentityRegistry([], { formatVersion: 1, records: [distinct] })).toThrow('Unknown collision');
  expect(() => publisherIdentitySchema.parse(accepted({ collisionReviews: [{ identityId: 'bgg-12', reason: 'Claim without evidence', sourceIds: ['unknown'] }] }))).toThrow('collision evidence');
  const a = accepted(), b = accepted({ identityId: otherId, routeKey: otherId, name: 'Different title' });
  expect(() => createIdentityRegistry([], { formatVersion: 1, records: [a, b] })).toThrow('collision');
});

test('publisher title/alias agreement cannot attach a rule without an explicit edition assignment', () => {
  const identity = accepted(), edition = rule();
  const registry = createIdentityRegistry([], { formatVersion: 1, records: [identity] });
  expect(resolveIdentityAssignments(registry, [edition], [], empty).get(edition.id)).toEqual([]);
  expect(resolveIdentityAssignments(registry, [edition], [], { formatVersion: 1, records: [assignment(identity, edition)] }).get(edition.id)).toEqual([gameId]);
  const held = { ...assignment(identity, edition), decision: 'hold', acceptedRevision: null };
  expect(resolveIdentityAssignments(registry, [edition], [], { formatVersion: 1, records: [held] }).get(edition.id)).toEqual([]);
  expect(resolveIdentityAssignments(registry, [], [], empty).size).toBe(0);
});

test('assignments bind actual approved rule content, identity revision and exact edition scope', () => {
  const identity = accepted(), edition = rule(), registry = createIdentityRegistry([], { formatVersion: 1, records: [identity] });
  const resolve = (record: ReturnType<typeof assignment>, rules = [edition]) => resolveIdentityAssignments(registry, rules, [], { formatVersion: 1, records: [record] });
  const reseal = (changes: Partial<ReturnType<typeof assignment>>) => {
    const record = { ...assignment(identity, edition), ...changes };
    record.acceptedRevision = assignmentReviewRevision(record);
    return record;
  };
  expect(() => resolve(reseal({ identityId: otherId }))).toThrow('Unknown publisher');
  expect(() => resolve(reseal({ ruleId: 'missing' }))).toThrow('Unknown assignment rule');
  expect(() => resolve(reseal({ identityRevision: 'c'.repeat(64) }))).toThrow('Stale');
  expect(() => resolve(reseal({ ruleRevision: 'c'.repeat(64) }))).toThrow('Stale');
  expect(() => resolve(reseal({ editionScope: 'Different edition' }))).toThrow('edition scope');
  expect(() => resolve(assignment(identity, edition), [rule({ status: 'draft', approvedBy: null, publishedAt: null, materiallyUpdatedAt: null })])).toThrow('not approved');
  expect(() => resolve(assignment(identity, edition), [{ ...edition, firstPlayerRule: 'Unreviewed replacement' }])).toThrow('stale editorial');
  expect(() => identityAssignmentSchema.parse({ ...assignment(identity, edition), evidence: [] })).toThrow();
  expect(() => identityAssignmentSchema.parse({ ...assignment(identity, edition), editionScope: 'Unreviewed edit' })).toThrow('stale');
});

test('legacy exclusions and numeric attachments remain explicit; conflicting assignments fail', () => {
  const edition = rule({ gameName: 'Legacy Game' }), identity = accepted();
  const registry = createIdentityRegistry(legacy, { formatVersion: 1, records: [identity] });
  expect(resolveIdentityAssignments(registry, [edition], [], empty).get(edition.id)).toEqual(['bgg-12']);
  const exclusion = [{ ruleId: edition.id, inventoryIds: [], reason: 'Synthetic explicit exclusion' }];
  expect(resolveIdentityAssignments(registry, [edition], exclusion, empty).get(edition.id)).toEqual([]);
  expect(() => resolveIdentityAssignments(registry, [edition], exclusion, { formatVersion: 1, records: [assignment(identity, edition)] })).toThrow('Conflicting');
  expect(() => resolveIdentityAssignments(registry, [edition], [{ ruleId: edition.id, inventoryIds: ['99'], reason: 'Unknown' }], empty)).toThrow('Unknown');
  expect(() => resolveIdentityAssignments(registry, [edition], [...exclusion, ...exclusion], empty)).toThrow('Duplicate');
  const record = assignment(identity, edition);
  expect(() => resolveIdentityAssignments(registry, [edition], [], { formatVersion: 1, records: [record, record] })).toThrow('Duplicate explicit');
  expect(() => resolveIdentityAssignments(registry, [edition, edition], [], empty)).toThrow('Duplicate');
});

test('active publisher identities preserve every numeric identity and explicit rule attachment', () => {
  const registry = getBoardGameRegistry(), inventory = getBoardGameInventory(), publicGames = getBoardGames();
  const numeric = registry.filter(identity => identity.origin === 'legacy');
  expect(numeric.map(identity => [identity.identityId, identity.routeKey, identity.bggId, identity.name])).toEqual(inventory.games.map(game => [`bgg-${game.bggId}`, game.bggId, game.bggId, game.name]));
  const publisherRecords = JSON.parse(readFileSync('research/coverage/publisher-identities.json', 'utf8')).records as PublisherIdentityRecord[];
  const acceptedRecords = publisherRecords.filter(record => record.decision === 'accept');
  expect(registry.filter(identity => identity.origin === 'publisher').map(identity => [identity.identityId, identity.routeKey, identity.bggId, identity.name, identity.identityRevision, identity.reference])).toEqual(acceptedRecords.map(record => [record.identityId, record.routeKey, record.bggId, record.name, record.acceptedRevision, { url: record.sources.find(source => source.id === record.publisherReferenceSourceId)!.url, label: 'Publisher reference' }]));
  expect(registry).toHaveLength(inventory.games.length + acceptedRecords.length);
  const rules = readRecords('src/content/games').map(record => ruleSchema.parse(record));
  const assignments = JSON.parse(readFileSync('research/coverage/identity-assignments.json', 'utf8'));
  const overrides = JSON.parse(readFileSync('research/coverage/identity-overrides.json', 'utf8'));
  const researchRules = readRecords('research/games').map(record => ruleSchema.parse(record));
  validateLegacyOverrideReferences(registry, [...rules, ...researchRules], overrides);
  const resolved = resolveIdentityAssignments(registry, rules, scopeLegacyOverrides(overrides, rules), assignments);
  const actual = new Map(rules.map(rule => [rule.id, publicGames.filter(game => game.rules.some(attached => attached.id === rule.id)).map(game => game.identityId)]));
  expect(resolved).toEqual(actual);
  expect(registry.map(identity => identity.searchNames)).toEqual(publicGames.map(game => game.searchNames));
}, 120_000);

test('reviewed Zoch editions attach only to their allocated publisher identities', () => {
  const games = getBoardGames();
  for (const [identityId, name, ruleId] of [
    ['game-0eba6647-2448-47d5-b70e-850ff0545067', 'Die Zausel vom Zauberwald', 'die-zausel-vom-zauberwald-zoch-601105206-en'],
    ['game-866dabc4-1dd7-4557-bc7b-f87f68a59e72', 'Das Schloss der 7 Schlösser', 'das-schloss-der-7-schloesser-zoch-601105204-en'],
    ['game-442193d6-20c4-41d7-a261-37b34b8c19dc', 'Über den Wolken', 'ueber-den-wolken-zoch-601105207-en'],
    ['game-bab1eb8c-f3f5-4b38-a0d6-3cf63c41e407', 'Flitze Flatze Bärentatze', 'flitze-flatze-baerentatze-zoch-601105211-en'],
    ['game-60b6d1ae-767a-42cb-bce2-df3a41f28efb', 'Gigi Gacker am Würfelacker', 'gigi-gacker-am-wuerfelacker-zoch-601105222-en'],
    ['game-2300274b-4a9d-448b-97fa-836b973bd8bf', 'Beethupferl', 'beethupferl-en'],
    ['game-132a548d-b00a-46ce-a29b-6c40525c452b', 'Mirakel Mix', 'mirakel-mix-en'],
    ['game-20ec80fb-32d8-4764-816e-285e0d0cb292', "Käpt'n Memo", 'kaeptn-memo-en'],
    ['game-c60afcd1-5e6b-44ed-a41a-dbd91376d400', 'Kleiner Drache Wirbelwind', 'kleiner-drache-wirbelwind-en'],
    ['game-5a318f64-4fde-423e-9a63-e3887b7de5de', 'Mach die Flatter', 'mach-die-flatter-en'],
  ] as const) {
    const attached = games.filter(game => game.rules.some(rule => rule.id === ruleId));
    expect(attached.map(game => game.identityId)).toEqual([identityId]);
    expect(attached[0]).toMatchObject({ name, routeKey: identityId, searchNames: [], reference: { label: 'Publisher reference' } });
    expect(attached[0]).not.toHaveProperty('bggId');
  }
  for (const identityId of [
    'game-1266d398-3f70-4bb8-bac8-3c96fce358a8',
  ]) {
    expect(games.find(game => game.identityId === identityId)).toMatchObject({ rules: [], searchNames: [], reference: { label: 'Publisher reference' } });
  }
}, 120_000);

test('reviewed Grail identities stay publisher-only pending games with exact product links', () => {
  const games = getBoardGames();
  for (const [identityId, name, productPath] of [
    ['game-8d56f43f-7ccd-4c1c-999b-02f29b16b10b', 'Aeterna', 'aeterna'],
    ['game-d20b9c60-4071-42ae-8123-3f22d137b627', 'The Gardens', 'thegardens'],
    ['game-fb31080c-fd3a-4018-ac6d-9d21d3e78d70', 'Harvest Valley', 'harvest-valley'],
    ['game-df4a14f0-ca55-4b1e-9412-4002aed07606', 'Hibachi', 'hibachi'],
    ['game-7156daab-3ee2-4e52-9f9f-77af7f8a83de', 'One Zero One', 'one-zero-one'],
    ['game-806c297f-f156-4024-baf2-4ee39025f248', 'Scoville', 'scoville'],
    ['game-fc1c68b1-7462-41b8-a023-b3fc885921f6', 'Silicon Valley', 'silicon-valley'],
    ['game-a1d2166b-9a0f-4581-a68c-0c1767290430', 'Snowcrest', 'snowcrest'],
    ['game-d9976717-7827-46e1-8774-a455d72c98b2', 'Tango', 'tango'],
    ['game-57bb804a-0e45-4152-bda3-abb73ec20321', 'Farm Hand', 'farm-hand'],
  ] as const) {
    const matching = games.filter(game => game.identityId === identityId);
    expect(matching).toHaveLength(1);
    expect(matching[0]).toMatchObject({
      name, routeKey: identityId, searchNames: [], rules: [],
      reference: { url: `https://www.grailgames.games/our-games/${productPath}`, label: 'Publisher reference' },
    });
    expect(matching[0]).not.toHaveProperty('bggId');
  }
}, 120_000);
