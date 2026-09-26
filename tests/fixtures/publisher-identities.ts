import { readFileSync } from 'node:fs';
import { identityReviewRevision, type PublisherIdentityRecord } from '../../src/lib/content/identity-registry';
import { assignmentReviewRevision } from '../../src/lib/content/identity-assignments';
import { contentRevision, ruleSchema, type RuleRecord } from '../../src/lib/content/schema';

// Synthetic offline evidence only. These records never enter the active files.
export const gameId = 'game-aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
export const otherId = 'game-bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
export const empty = { formatVersion: 1, records: [] };
export const legacy = [{ name: 'Legacy Game', bggId: '12', discoveryUrl: 'https://boardgamegeek.com/boardgame/12', status: 'needs-primary-source' }];
export function fixture(): PublisherIdentityRecord {
  return {
    identityId: gameId, routeKey: gameId, name: 'Offline Fixture', searchNames: [],
    publisher: 'Synthetic test publisher', identityScope: 'Synthetic base identity', identityEvidence: 'Synthetic complete product-context fixture; no real source approval.',
    publisherReferenceSourceId: 'product', sources: [{ id: 'product', kind: 'primary-publisher', url: 'https://publisher.example/game/', sha256: 'a'.repeat(64), byteCount: 123, location: 'Synthetic title and product description' }],
    collisionReviews: [], decision: 'draft', reviewedBy: null, reviewedAt: null, acceptedRevision: null,
  };
}
export function accepted(changes: Partial<PublisherIdentityRecord> = {}): PublisherIdentityRecord {
  const record = { ...fixture(), ...changes, decision: 'accept' as const, reviewedBy: 'Offline unit-test fixture, not a real approval', reviewedAt: '2026-01-01' };
  record.acceptedRevision = identityReviewRevision(record);
  return record;
}
export function rule(changes: Partial<RuleRecord> = {}): RuleRecord {
  const base = ruleSchema.parse(JSON.parse(readFileSync('src/content/games/azul-2018-en.json', 'utf8')));
  const record = { ...base, id: 'offline-fixture-rule', slug: 'offline-fixture-rule', gameName: 'Offline Fixture', aliases: [], editionLabel: 'Synthetic English base edition',
    approvedBy: 'OFFLINE UNIT TEST — NOT SOURCE APPROVAL', internalEvidence: 'Synthetic fixture only; never enroll or publish this example.',
    firstPlayerRule: 'For this fictional fixture, the youngest player starts.', officialTieBreak: null, houseFallback: null, clarifications: [], interpretation: null, uncertainty: [],
    sources: [{ url: 'https://publisher.example/manual/', title: 'Synthetic manual', publisher: 'Synthetic test publisher', printedPages: [], pdfPagesOneBased: [], location: 'Synthetic setup passage', checkedAt: '2026-01-01' }], ...changes };
  record.approvedRevision = ['approved', 'published'].includes(record.status) ? contentRevision(record) : null;
  return record;
}
export function assignment(identity: PublisherIdentityRecord, edition: RuleRecord) {
  const record = {
    ruleId: edition.id, ruleRevision: contentRevision(edition), identityId: identity.identityId, identityRevision: identity.acceptedRevision!, editionScope: edition.editionLabel,
    evidence: [{ url: 'https://publisher.example/manual/', sha256: 'b'.repeat(64), location: 'Synthetic cover and setup', correspondence: 'Synthetic exact-edition relationship; no real source approval.' }],
    decision: 'accept' as const, reviewedBy: 'Offline unit-test fixture, not a real approval', reviewedAt: '2026-01-01', acceptedRevision: null as string | null,
  };
  record.acceptedRevision = assignmentReviewRevision(record);
  return record;
}

/** All four architectural states coexist in a temporary copied site only. */
export function publisherJourneyFixture() {
  const ids = [gameId, otherId, 'game-cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'game-dddddddd-dddd-4ddd-8ddd-dddddddddddd'];
  const identities = ['Pending', 'Research', 'Article', 'Chooser'].map((state, index) => accepted({
    identityId: ids[index]!, routeKey: ids[index]!, name: `Offline Fixture ${state}`,
    searchNames: [`Offline alternate ${state}`],
    sources: [{ ...fixture().sources[0]!, url: `https://publisher.example/${state.toLowerCase()}/` }],
  }));
  const draft = rule({ id: 'offline-fixture-research', slug: 'offline-fixture-research', gameName: identities[1]!.name,
    status: 'draft', approvedBy: null, approvedRevision: null, publishedAt: null, materiallyUpdatedAt: null });
  const approved = [rule({ gameName: identities[2]!.name }),
    rule({ id: 'offline-fixture-chooser-first', slug: 'offline-fixture-chooser-first', gameName: identities[3]!.name }),
    rule({ id: 'offline-fixture-chooser-second', slug: 'offline-fixture-chooser-second', gameName: identities[3]!.name, editionLabel: 'Synthetic second edition' })];
  const association = { ...assignment(identities[1]!, draft), purpose: 'research-only' as const };
  association.acceptedRevision = assignmentReviewRevision(association);
  return { identities, approved, draft,
    publication: { formatVersion: 1, records: [assignment(identities[2]!, approved[0]!), assignment(identities[3]!, approved[1]!), assignment(identities[3]!, approved[2]!)] },
    research: { formatVersion: 1, records: [association] } };
}
