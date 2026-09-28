import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import { identityReviewRevision, publisherRegistrySchema } from '../../src/lib/content/identity-registry';

const snapshotBytes = readFileSync('research/coverage/wikidata-unlinked-board-games.json');
const snapshot = JSON.parse(snapshotBytes.toString('utf8')) as {
  source: { query: string; statementSha256: string };
  counts: { items: number; englishLabeled: number; registryItemMatches: number; registryNameMatches: number };
  games: Array<{ wikidataId: string; labelEn: string | null; registryItemMatches: string[]; registryNameMatches: string[] }>;
};
const review = JSON.parse(readFileSync('research/coverage/wikidata-unlinked-board-review.json', 'utf8')) as {
  sourceSnapshotSha256: string;
  counts: { reviewed: number; acceptedNewIdentities: number; held: number; startingRulesApproved: number };
  decisions: Array<{ wikidataId: string; snapshotLabel: string; decision: 'accept' | 'hold'; identityId?: string;
    existingIdentityId?: string; ruleStatus?: string; reason: string; primarySource?: { url: string; sha256: string } }>;
};

test('unlinked Wikidata snapshot is source-bound and has one row per item', () => {
  expect(createHash('sha256').update(snapshotBytes).digest('hex')).toBe(review.sourceSnapshotSha256);
  expect(snapshot.source.query).toContain('?item wdt:P31 wd:Q131436');
  expect(snapshot.source.query).toContain('FILTER NOT EXISTS { ?item wdt:P2339 ?bggId }');
  expect(snapshot.games).toHaveLength(snapshot.counts.items);
  expect(new Set(snapshot.games.map(row => row.wikidataId)).size).toBe(snapshot.games.length);
  expect(snapshot.games.filter(row => row.labelEn !== null)).toHaveLength(snapshot.counts.englishLabeled);
  expect(snapshot.games.filter(row => row.registryItemMatches.length > 0)).toHaveLength(snapshot.counts.registryItemMatches);
  expect(snapshot.games.filter(row => row.registryNameMatches.length > 0)).toHaveLength(snapshot.counts.registryNameMatches);
  expect(snapshot.source.statementSha256).toMatch(/^[a-f0-9]{64}$/);
});

test('reviewed leads reconcile to source rows and only primary-verified products become pending identities', () => {
  const sourceById = new Map(snapshot.games.map(row => [row.wikidataId, row]));
  const acceptedRegistry = publisherRegistrySchema.parse(JSON.parse(readFileSync('research/coverage/publisher-identities.json', 'utf8'))).records;
  const assignedIds = new Set((JSON.parse(readFileSync('research/coverage/identity-assignments.json', 'utf8')) as {
    records: Array<{ identityId: string }>;
  }).records.map(record => record.identityId));
  expect(review.decisions).toHaveLength(review.counts.reviewed);
  expect(new Set(review.decisions.map(row => row.wikidataId)).size).toBe(review.decisions.length);
  expect(review.decisions.filter(row => row.decision === 'accept')).toHaveLength(review.counts.acceptedNewIdentities);
  expect(review.decisions.filter(row => row.decision === 'hold')).toHaveLength(review.counts.held);
  expect(review.counts.startingRulesApproved).toBe(0);
  for (const row of review.decisions) {
    expect(sourceById.get(row.wikidataId)?.labelEn).toBe(row.snapshotLabel);
    expect(row.reason.length).toBeGreaterThan(25);
    if (row.decision !== 'accept') {
      expect(row.identityId).toBeUndefined();
      continue;
    }
    const record = acceptedRegistry.find(identity => identity.identityId === row.identityId);
    expect(record).toBeDefined();
    expect(record?.decision).toBe('accept');
    expect(record?.bggId).toBeUndefined();
    expect(record?.acceptedRevision).toBe(identityReviewRevision(record!));
    expect(record?.sources.find(source => source.id === record.publisherReferenceSourceId)).toMatchObject({
      url: row.primarySource!.url, sha256: row.primarySource!.sha256,
    });
    expect(row.ruleStatus).toBe('pending');
    expect(assignedIds.has(row.identityId!)).toBe(false);
  }
});
