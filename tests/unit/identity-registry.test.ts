import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import { createIdentityRegistry, identityReviewRevision, publisherIdentitySchema, type PublisherIdentityRecord } from '../../src/lib/content/identity-registry';
import { assignmentReviewRevision, identityAssignmentSchema, resolveIdentityAssignments } from '../../src/lib/content/identity-assignments';
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

test('empty active publisher files preserve every current numeric identity and legacy attachment', () => {
  const registry = getBoardGameRegistry(), inventory = getBoardGameInventory(), publicGames = getBoardGames();
  expect(registry.map(identity => [identity.identityId, identity.routeKey, identity.bggId, identity.name])).toEqual(inventory.games.map(game => [`bgg-${game.bggId}`, game.bggId, game.bggId, game.name]));
  expect(registry.every(identity => identity.origin === 'legacy')).toBe(true);
  const rules = readRecords('src/content/games').map(record => ruleSchema.parse(record));
  const assignments = JSON.parse(readFileSync('research/coverage/identity-assignments.json', 'utf8'));
  const overrides = JSON.parse(readFileSync('research/coverage/identity-overrides.json', 'utf8'));
  const resolved = resolveIdentityAssignments(registry, rules, overrides, assignments);
  const actual = new Map(rules.map(rule => [rule.id, publicGames.filter(game => game.rules.some(attached => attached.id === rule.id)).map(game => `bgg-${game.bggId}`)]));
  expect(resolved).toEqual(actual);
  expect(registry.map(identity => identity.searchNames)).toEqual(publicGames.map(game => game.searchNames));
}, 120_000);
