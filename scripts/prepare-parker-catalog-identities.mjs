/** Rebuild or validate five physical Parker Brothers products from its illustrated catalog. */
import { createHash } from 'node:crypto';
import console from 'node:console';
import { readFileSync, writeFileSync } from 'node:fs';
import process from 'node:process';

const registryPath = 'research/coverage/publisher-identities.json';
const catalogUrl = 'https://gamesandpuzzles.org/images/trade-catalogs/parker-brothers/1889_Parker_Brothers_catalog_-Strong_Parker_Brothers_Inc._1889_95033143-from_TheStrong_%28handmarked_1892_incorrectly%29_-prep_2025-01-02_6MB.pdf';
const catalogHash = '8c13acd3edc81b6466d622bb2fb2f9e7609dd8773b046d1dfd6f7438a6282d60';
const catalogBytes = 6015474;
const registry = JSON.parse(readFileSync(registryPath, 'utf8'));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const canonical = value => Array.isArray(value)
  ? `[${value.map(canonical).join(',')}]`
  : value !== null && typeof value === 'object'
    ? `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`).join(',')}}`
    : JSON.stringify(value);
const revision = record => hash(canonical(Object.fromEntries(Object.entries(record)
  .filter(([key]) => !['decision', 'reviewedBy', 'reviewedAt', 'acceptedRevision'].includes(key)))));
const accepted = data => ({ ...data, decision: 'accept', reviewedBy: 'Codex /root', reviewedAt: '2026-09-28', acceptedRevision: revision(data) });
const source = (id, location) => ({ id, kind: 'primary-publisher', url: catalogUrl, sha256: catalogHash, byteCount: catalogBytes, location });

const identities = [
  accepted({
    identityId: 'game-056efc27-4c46-496a-8eba-1d15b51e8e02',
    routeKey: 'game-056efc27-4c46-496a-8eba-1d15b51e8e02',
    name: 'The Soldier Boy (Parker Brothers catalog issue)',
    searchNames: ['The Soldier Boy'],
    publisher: 'Parker Brothers',
    identityScope: 'The boxed folding-board game advertised on printed page 3 of Parker Brothers’ undated Illustrated Catalogue of Standard Games (archived as 1889). The catalog does not establish an exact manufacture year or correspondence to later Soldier Boy issues.',
    identityEvidence: 'The publisher catalog illustrates a circular military-career board headed The Soldier Boy and describes a nearly two-foot-square folding board, uniformed metal soldier pieces, a spinning indicator and box. Its finish is Commander-in-Chief. No starting-player rule has been reviewed or transferred.',
    publisherReferenceSourceId: 'parker-catalog-soldier-boy',
    sources: [source('parker-catalog-soldier-boy', 'Original Parker Brothers publisher catalog, PDF page 3 / printed page 3: publisher introduction, The Soldier Boy board illustration, physical contents and product description.')],
    collisionReviews: [],
  }),
  accepted({
    identityId: 'game-138bf8ab-46f7-4f92-8157-3f4caf2bde25',
    routeKey: 'game-138bf8ab-46f7-4f92-8157-3f4caf2bde25',
    name: 'Innocence Abroad (Parker Brothers catalog issue)',
    searchNames: ['Innocence Abroad'],
    publisher: 'Parker Brothers',
    identityScope: 'The boxed travel board game advertised on printed page 4 of Parker Brothers’ undated Illustrated Catalogue of Standard Games (archived as 1889). The description identifies this catalog product but does not establish an exact manufacture year or later-edition equivalence.',
    identityEvidence: 'The publisher catalog depicts a box label naming The Amusing Game of Innocence Abroad and describes a large lithographed folding board, a party travelling by several routes to one destination, playing utensils and a box. No starting-player rule has been reviewed or transferred.',
    publisherReferenceSourceId: 'parker-catalog-innocence-abroad',
    sources: [source('parker-catalog-innocence-abroad', 'Original Parker Brothers publisher catalog, PDF page 4 / printed page 4: illustrated Innocence Abroad box label and product description of the folding travel board and box.')],
    collisionReviews: [],
  }),
  accepted({
    identityId: 'game-324ca9c3-5445-40d4-97ee-e9716f59dfc0',
    routeKey: 'game-324ca9c3-5445-40d4-97ee-e9716f59dfc0',
    name: 'Rex (Parker Brothers single-board issue)',
    searchNames: ['Rex'],
    publisher: 'Parker Brothers',
    identityScope: 'The single-board Rex boxed product advertised on printed page 5 of Parker Brothers’ undated Illustrated Catalogue of Standard Games (archived as 1889). Progressive Rex, separately advertised there as a four-board set, is a distinct catalog product.',
    identityEvidence: 'The publisher catalog illustrates a Rex track board with a Parker Bros. center imprint and describes turned maple pieces, a spinning indicator, a folding board and one large box priced at $1.00. No starting-player rule has been reviewed or transferred.',
    publisherReferenceSourceId: 'parker-catalog-rex',
    sources: [source('parker-catalog-rex', 'Original Parker Brothers publisher catalog, PDF page 4 / printed page 5: Rex board illustration and $1 single-board product description; separate Progressive Rex listing below.')],
    collisionReviews: [],
  }),
  accepted({
    identityId: 'game-2c89d6f3-74c4-4103-a73a-07bf933637ff',
    routeKey: 'game-2c89d6f3-74c4-4103-a73a-07bf933637ff',
    name: 'Progressive Rex (Parker Brothers four-board set)',
    searchNames: ['Progressive Rex'],
    publisher: 'Parker Brothers',
    identityScope: 'The four-board Progressive Rex boxed set advertised separately on printed page 5 of Parker Brothers’ undated Illustrated Catalogue of Standard Games (archived as 1889). Its relation to the single-board Rex is stated only at the product-family level; rules and component equivalence are not assumed.',
    identityEvidence: 'The publisher gives Progressive Rex its own heading and describes a large-group progressive game with four boards and complete utensils in each boxed set, priced at $3.50; the single-board Rex above it is priced at $1.00. No starting-player rule has been reviewed or transferred.',
    publisherReferenceSourceId: 'parker-catalog-progressive-rex',
    sources: [source('parker-catalog-progressive-rex', 'Original Parker Brothers publisher catalog, PDF page 4 / printed page 5: separate Progressive Rex heading, four-board boxed-set contents and $3.50 price.')],
    collisionReviews: [],
  }),
  accepted({
    identityId: 'game-a84bd742-749d-4704-8144-b47ad8f5c957',
    routeKey: 'game-a84bd742-749d-4704-8144-b47ad8f5c957',
    name: 'The Game of War (Parker Brothers catalog issue)',
    searchNames: ['The Game of War'],
    publisher: 'Parker Brothers',
    identityScope: 'The boxed strategy board game advertised on printed page 9 of Parker Brothers’ undated Illustrated Catalogue of Standard Games (archived as 1889). This particular Parker Brothers battlefield board is separate from other games bearing the generic title Game of War.',
    identityEvidence: 'The publisher catalog illustrates the connected-point battlefield board and describes a folding, multicolor board with a box, a full set of turned maple pieces and directions, priced at 75 cents. No starting-player rule has been reviewed or transferred.',
    publisherReferenceSourceId: 'parker-catalog-game-of-war',
    sources: [source('parker-catalog-game-of-war', 'Original Parker Brothers publisher catalog, PDF page 6 / printed page 9: The Game of War board diagram, physical product description, components and price.')],
    collisionReviews: [],
  }),
];

// A shared catalog URL triggers the registry's same-reference collision guard.
// Each later record explicitly reviews the earlier product as a distinct listing.
const configurations = [
  'military-career board, metal soldier pieces and spinner',
  'boxed folding travel board',
  'single track board, maple pieces and spinner',
  'four-board progressive set',
  'connected-point battlefield board and maple pieces',
];
for (let i = 0; i < identities.length; i++) {
  const current = identities[i];
  for (let j = 0; j < i; j++) {
    const prior = identities[j];
    current.collisionReviews.push({
      identityId: prior.identityId,
      reason: `The original Parker Brothers catalog separately lists ${current.name} (${configurations[i]}) and ${prior.name} (${configurations[j]}). These distinct physical configurations warrant separate identities despite the shared source-volume URL.`,
      sourceIds: [current.publisherReferenceSourceId],
    });
  }
  current.acceptedRevision = revision(current);
}

const mode = process.argv[2];
if (mode === '--write') {
  const existing = identities.map(record => registry.records.findIndex(item => item.identityId === record.identityId));
  if (registry.records.length === 118 && existing.every(index => index === -1)) {
    registry.records.push(...identities);
  } else if (registry.records.length === 123 && existing.every((index, offset) => index === 118 + offset)) {
    registry.records.splice(118, identities.length, ...identities);
  } else {
    throw new Error('Expected untouched registry or this batch in its original five slots');
  }
  writeFileSync(registryPath, `${JSON.stringify(registry, null, 2).replace(/\n/g, '\r\n')}\r\n`);
} else if (mode === '--validate') {
  for (const expected of identities) {
    const actual = registry.records.find(record => record.identityId === expected.identityId);
    if (canonical(actual) !== canonical(expected) || actual.acceptedRevision !== revision(actual)) {
      throw new Error(`Identity record changed: ${expected.identityId}`);
    }
  }
  if (registry.records.length !== 123 || registry.records.filter(record => record.decision === 'accept').length !== 123) {
    throw new Error('Parker catalog batch has unexpected registry count');
  }
  const response = await globalThis.fetch(catalogUrl, { signal: globalThis.AbortSignal.timeout(120000) });
  if (!response.ok) throw new Error(`Catalog unavailable (${response.status})`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.length !== catalogBytes || hash(bytes) !== catalogHash) throw new Error('Catalog bytes changed');
  console.log(`Validated ${identities.length} accepted Parker Brothers product identities and the original publisher catalog hash`);
} else {
  throw new Error('Use --write once or --validate after insertion');
}
