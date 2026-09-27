import { expect, test } from 'vitest';
import { accepted, assignment, empty, gameId, legacy, rule, publisherJourneyFixture } from '../fixtures/publisher-identities';
import { createIdentityRegistry } from '../../src/lib/content/identity-registry';
import { assignmentReviewRevision, resolveResearchIdentityAssignments, validateLegacyOverrideReferences } from '../../src/lib/content/identity-assignments';
import { buildBoardGames } from '../../src/lib/content/board-games';
import { buildCoverage } from '../../src/lib/content/coverage';
import { boardGameHref, buildBrowseShelves } from '../../src/lib/content/board-game-browse';
import { directorySearchEntries } from '../../src/pages/board-games/search.json';
import { directoryEntryLinks } from '../../src/lib/directory-entry';
import { rankDemand } from '../../scripts/lib/demand';
import { buildRuleSearchAliases } from '../../src/lib/content/rule-search';
import { searchRank } from '../../src/lib/search';
import { contentRevision, publicRule } from '../../src/lib/content/schema';
import { randomRuleRevision } from '../../src/lib/content/random-rules';

test('the copied-site fixture binds all four states without any real enrollment or portable approval', () => {
  const fixture = publisherJourneyFixture();
  const registry = createIdentityRegistry([], { formatVersion: 1, records: fixture.identities });
  const games = buildBoardGames(registry, fixture.approved, [], fixture.publication);
  expect(games.map(game => game.rules.length)).toEqual([0, 0, 1, 2]);
  const coverage = buildCoverage(registry, fixture.approved, [fixture.draft], [], fixture.publication, fixture.research);
  expect(coverage.games.map(game => game.editions.length)).toEqual([0, 1, 1, 2]);
  expect(fixture.identities.every(identity => !identity.bggId && identity.reviewedBy?.includes('Offline unit-test'))).toBe(true);
  expect(fixture.approved.every(rule => rule.approvedBy === 'OFFLINE UNIT TEST — NOT SOURCE APPROVAL')).toBe(true);
});

test('an explicitly attached no-BGG identity reaches the same article through shelves and native search', () => {
  const identity = accepted({ searchNames: ['Offline alternate'] }), edition = rule();
  const registry = createIdentityRegistry(legacy, { formatVersion: 1, records: [identity] });
  const games = buildBoardGames(registry, [edition], [], { formatVersion: 1, records: [assignment(identity, edition)] });
  const browse = buildBrowseShelves(games), game = browse.games.find(game => game.identityId === gameId)!;
  expect(browse.shelves.flatMap(shelf => shelf.games).filter(game => game.identityId === gameId)).toHaveLength(1);
  expect(boardGameHref(game)).toBe('/games/offline-fixture-rule/');
  const entry = directorySearchEntries(browse.games).find(entry => entry.id === gameId)!;
  expect(entry).toMatchObject({ ruleCount: 1, terms: expect.arrayContaining(['Offline alternate']), href: '/games/offline-fixture-rule/', reference: { label: 'Publisher reference' } });
  expect(entry).not.toHaveProperty('bggId');
  expect(directoryEntryLinks(entry)).toMatchObject({ href: boardGameHref(game), numericId: undefined });
  expect(JSON.stringify(entry)).not.toMatch(/boardgamegeek|identityEvidence|acceptedRevision|identityRevision|sha256|reviewedBy/);
  expect(directorySearchEntries(browse.games).find(entry => entry.id === '12')).toEqual({ name: 'Legacy Game', id: '12', ruleCount: 0 });
});

test('pending identities use the picker and real optional references; editions use an opaque chooser route', () => {
  const identity = accepted(), registry = createIdentityRegistry([], { formatVersion: 1, records: [identity] });
  const pending = buildBoardGames(registry, [], [], empty)[0]!;
  const entry = directorySearchEntries([pending])[0]!;
  expect(directoryEntryLinks(entry)).toMatchObject({ href: undefined, reference: { url: 'https://publisher.example/game/' } });
  const withoutReference = directorySearchEntries([{ ...pending, reference: undefined }])[0]!;
  expect(directoryEntryLinks(withoutReference)).toEqual({ href: undefined, reference: undefined, numericId: undefined });
  const first = rule(), second = rule({ id: 'offline-second', slug: 'offline-second', editionLabel: 'Synthetic second edition' });
  const game = buildBoardGames(registry, [first, second], [], { formatVersion: 1, records: [assignment(identity, first), assignment(identity, second)] })[0]!;
  expect(boardGameHref(game)).toBe(`/board-games/${gameId}/`);
  expect(directoryEntryLinks(directorySearchEntries([game])[0]!).href).toBe(`/board-games/${gameId}/`);
  expect(() => directoryEntryLinks({ ...entry, ruleCount: 1 })).toThrow('internal answer link');
  expect(() => directoryEntryLinks({ ...entry, ruleCount: 1, slug: 'offline-fixture-rule', href: '//external.example/' })).toThrow('internal answer link');
});

test('a rule attached to several reviewed legacy identities retains all search aliases without last-write loss', () => {
  const registry = createIdentityRegistry([{ ...legacy[0], searchNames: ['First alternate'] }, { ...legacy[0], name: 'Second Game', bggId: '13', discoveryUrl: 'https://boardgamegeek.com/boardgame/13', searchNames: ['Second alternate'] }], empty);
  const edition = rule({ gameName: 'Legacy Game', aliases: ['Approved alias'] });
  const games = buildBoardGames(registry, [edition], [{ ruleId: edition.id, inventoryIds: ['12', '13'], reason: 'Synthetic independently reviewed shared rule attachment' }], empty);
  expect(buildRuleSearchAliases(games).get(edition.id)).toEqual(['Approved alias', 'First alternate', 'Second Game', 'Second alternate']);
});


test('the assigned second-edition identity is searchable without attaching its rule to the original title', () => {
  // Synthetic scope fixtures exercise the existing 316377 override; never source approval or enrollment.
  const registry = createIdentityRegistry([
    { ...legacy[0], name: '7 Wonders', bggId: '68448', discoveryUrl: 'https://boardgamegeek.com/boardgame/68448' },
    { ...legacy[0], name: '7 Wonders (Second Edition)', bggId: '316377', discoveryUrl: 'https://boardgamegeek.com/boardgame/316377' },
  ], empty);
  const edition = rule({ id: '7-wonders-2020-en', slug: '7-wonders-2020-en', gameName: '7 Wonders',
    aliases: ['Seven Wonders', '7 Wonders base game'], editionLabel: 'Synthetic test of the existing 2020 edition scope' });
  const before = structuredClone(edition), beforeContent = contentRevision(edition), beforePortable = randomRuleRevision(publicRule(edition));
  const games = buildBoardGames(registry, [edition], [{ ruleId: edition.id, inventoryIds: ['316377'], reason: 'Synthetic test of the existing explicit second-edition scope' }], empty);
  expect(games.find(game => game.identityId === 'bgg-68448')?.rules).toEqual([]);
  expect(games.find(game => game.identityId === 'bgg-316377')?.rules.map(rule => rule.id)).toEqual([edition.id]);
  const aliases = buildRuleSearchAliases(games).get(edition.id)!;
  expect(aliases).toEqual(['Seven Wonders', '7 Wonders base game', '7 Wonders (Second Edition)']);
  expect(searchRank({ ...publicRule(edition), aliases }, '7 Wonders (Second Edition)')).toBe(0);
  expect(edition).toEqual(before);
  expect(contentRevision(edition)).toBe(beforeContent);
  expect(randomRuleRevision(publicRule(edition))).toBe(beforePortable);
});

test('an assigned opaque publisher name is discoverable with or without an evidenced external number', () => {
  for (const withExternalNumber of [false, true]) {
    const identity = accepted({ name: 'Publisher Qualified Base', searchNames: ['Publisher alternate', 'PUBLISHER ALTERNATE'],
      ...(withExternalNumber ? { bggId: '999999', bggIdEvidence: { value: '999999', sourceId: 'product', location: 'Synthetic explicit external claim' } } : {}) });
    const edition = rule({ gameName: 'Approved Edition Title', aliases: ['Approved alias'] });
    const before = structuredClone(edition), beforeContent = contentRevision(edition), beforePortable = randomRuleRevision(publicRule(edition));
    const registry = createIdentityRegistry([], { formatVersion: 1, records: [identity] });
    const games = buildBoardGames(registry, [edition], [], { formatVersion: 1, records: [assignment(identity, edition)] });
    expect(games[0]!.routeKey).toBe(gameId);
    expect(games[0]!.bggId).toBe(withExternalNumber ? '999999' : undefined);
    const aliases = buildRuleSearchAliases(games).get(edition.id)!;
    expect(aliases).toEqual(['Approved alias', 'Publisher Qualified Base', 'Publisher alternate']);
    expect(searchRank({ ...publicRule(edition), aliases }, identity.name)).toBe(0);
    expect(edition).toEqual(before);
    expect(contentRevision(edition)).toBe(beforeContent);
    expect(randomRuleRevision(publicRule(edition))).toBe(beforePortable);
  }
});

test('adding an evidenced external number leaves the allocated route and attachment stable', () => {
  const identity = accepted({ bggId: '999999', bggIdEvidence: { value: '999999', sourceId: 'product', location: 'Synthetic explicit external claim' } });
  const edition = rule(), registry = createIdentityRegistry([], { formatVersion: 1, records: [identity] });
  const game = buildBoardGames(registry, [edition], [], { formatVersion: 1, records: [assignment(identity, edition)] })[0]!;
  const entry = directorySearchEntries([game])[0]!;
  expect(entry.id).toBe(gameId);
  expect(entry.bggId).toBe('999999');
  expect(directoryEntryLinks(entry)).toMatchObject({ numericId: '999999', reference: { label: 'Publisher reference' } });
});

test('research associations are separately signed, exact, lifecycle-null and never publish a rule', () => {
  const identity = accepted(), registry = createIdentityRegistry([], { formatVersion: 1, records: [identity] });
  const draft = rule({ status: 'draft', approvedBy: null, approvedRevision: null, publishedAt: null, materiallyUpdatedAt: null });
  const association = { ...assignment(identity, draft), purpose: 'research-only' as const };
  association.acceptedRevision = assignmentReviewRevision(association);
  const associations = { formatVersion: 1, records: [association] };
  const coverage = buildCoverage(registry, [], [draft], [], empty, associations);
  expect(coverage.games[0]!.editions[0]).toMatchObject({ href: '/dev/rules/offline-fixture-rule/', approvedBy: null });
  expect(buildBoardGames(registry, [], [], empty)[0]!.rules).toEqual([]);
  expect(() => buildBoardGames(registry, [], [], associations)).toThrow();
  expect(() => buildBoardGames(registry, [draft], [], { formatVersion: 1, records: [assignment(identity, draft)] })).toThrow('not approved');
  expect(() => buildBoardGames(registry, [], [], { formatVersion: 1, records: [assignment(identity, draft)] })).toThrow('Unknown assignment rule');
  expect(() => resolveResearchIdentityAssignments(registry, [rule()], associations)).toThrow('lifecycle-null');
  expect(() => resolveResearchIdentityAssignments(registry, [{ ...draft, firstPlayerRule: 'Unreviewed change' }], associations)).toThrow('Stale');
  expect(() => resolveResearchIdentityAssignments(registry, [draft], { formatVersion: 1, records: [assignment(identity, draft)] })).toThrow();
  const published = rule();
  // A same-ID null-lifecycle counterpart cannot hide the published-ID conflict.
  expect(() => buildCoverage(registry, [published], [draft], [], empty, associations)).toThrow('Unknown publisher research');
  expect(() => buildCoverage(registry, [draft], [], [], empty, empty)).toThrow('not approved');
});

test('ambiguous unpublished legacy title leads do not block public output; full override audit still catches unknown references', () => {
  const registry = createIdentityRegistry([...legacy, { ...legacy[0], bggId: '13', discoveryUrl: 'https://boardgamegeek.com/boardgame/13' }], empty);
  const draft = rule({ gameName: 'Legacy Game', status: 'draft', approvedBy: null, approvedRevision: null, publishedAt: null, materiallyUpdatedAt: null });
  expect(buildBoardGames(registry, [], [], empty).every(game => game.rules.length === 0)).toBe(true);
  expect(() => buildCoverage(registry, [], [draft], [], empty, empty)).toThrow('Ambiguous legacy');
  const overrides = [{ ruleId: draft.id, inventoryIds: ['12'], reason: 'Synthetic exact legacy association' }];
  expect(buildBoardGames(registry, [], overrides, empty).every(game => game.rules.length === 0)).toBe(true);
  expect(buildCoverage(registry, [], [draft], overrides, empty, empty).researched).toBe(1);
  expect(() => validateLegacyOverrideReferences(registry, [draft], [{ ...overrides[0], inventoryIds: ['99'] }])).toThrow('Unknown');
  expect(() => validateLegacyOverrideReferences(registry, [draft], [{ ...overrides[0], ruleId: 'missing' }])).toThrow('Unknown');
});

test('demand can rank a missing rule without an external ID and holds indistinguishable namesakes', () => {
  const row = (query: string, impressions: number) => ({ keys: [query], impressions, clicks: 1, ctr: 0, position: 5 });
  const result = rankDemand([row('offline fixture who starts', 50), row('same title who starts', 90)], [], [
    { identityId: gameId, name: 'Offline Fixture', hasRule: false },
    { identityId: 'bgg-12', bggId: '12', name: 'Same Title', hasRule: false },
    { identityId: 'bgg-13', bggId: '13', name: 'Same Title', hasRule: true },
  ], 'https://example.test');
  expect(result.missingRules).toEqual([{ identityId: gameId, name: 'Offline Fixture', impressions: 50, clicks: 1, queries: ['offline fixture who starts'] }]);
  expect(result.unmatchedQueries).toEqual([{ query: 'same title who starts', impressions: 90 }]);
});
