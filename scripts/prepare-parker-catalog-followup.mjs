/** Rebuild or validate five additional physical Parker Brothers catalog products. */
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
    identityId: 'game-3e233e7f-f2d8-485e-9f79-7d6865fbde5b',
    routeKey: 'game-3e233e7f-f2d8-485e-9f79-7d6865fbde5b',
    name: 'The Garrison Game (Parker Brothers catalog issue)',
    searchNames: ['The Garrison Game'],
    publisher: 'Parker Brothers',
    identityScope: 'The boxed, folding-board siege game on printed page 12 of Parker Brothers’ undated Illustrated Catalogue of Standard Games (archived as 1889). The precise manufacture year and equivalence to later Garrison Game issues are unproved.',
    identityEvidence: 'The catalog illustrates a Garrison Game box label with Parker Bros. Salem identification and describes an asymmetric fort assault with 50 attacking pieces and three defenders. The listed large box contains a mounted folding board, turned maple pieces and directions. No starting-player rule has been reviewed or transferred.',
    publisherReferenceSourceId: 'parker-catalog-garrison-game',
    sources: [source('parker-catalog-garrison-game', 'Original Parker Brothers publisher catalog, PDF page 8 / printed page 12: Garrison Game illustrated label, separate heading, physical board and piece description.')],
    collisionReviews: [],
  }),
  accepted({
    identityId: 'game-6747c489-8d06-49f6-a074-fb05f6bcbffd',
    routeKey: 'game-6747c489-8d06-49f6-a074-fb05f6bcbffd',
    name: 'The Railroad Game (Parker Brothers wooden-board issue)',
    searchNames: ['The Railroad Game'],
    publisher: 'Parker Brothers',
    identityScope: 'The 50-cent boxed wooden-board Railroad Game on printed page 13 of Parker Brothers’ undated Illustrated Catalogue of Standard Games (archived as 1889). The separately listed 25-cent Popular Edition is a different physical catalog issue, even though title and rules may overlap.',
    identityEvidence: 'Under A New Board Game, the publisher describes a folding wooden landscape board with branching railway lines, an illuminated spinning teetotum and playing pieces in the box; price is 50 cents. No starting-player rule has been reviewed or transferred.',
    publisherReferenceSourceId: 'parker-catalog-railroad-wooden',
    sources: [source('parker-catalog-railroad-wooden', 'Original Parker Brothers publisher catalog, PDF page 8 / printed page 13: The Railroad Game 50-cent wooden-board issue with illustrated train, spinner and pieces.')],
    collisionReviews: [],
  }),
  accepted({
    identityId: 'game-a3644921-b283-4a5b-8183-30ecf7a7034e',
    routeKey: 'game-a3644921-b283-4a5b-8183-30ecf7a7034e',
    name: 'The Railroad Game: Popular Edition (Parker Brothers)',
    searchNames: ['The Railroad Game Popular Edition'],
    publisher: 'Parker Brothers',
    identityScope: 'The separately advertised 25-cent Popular Edition of The Railroad Game on printed page 13 of Parker Brothers’ undated Illustrated Catalogue of Standard Games (archived as 1889). Its lithographed folding board and showy box are distinguished from the 50-cent wooden-board issue; detailed rules and component correspondence are unproved.',
    identityEvidence: 'The publisher gives The Railroad Game a second heading marked Popular Edition and describes a color-and-gold lithographed folding board that folds into a box with pieces and directions, priced at 25 cents. No starting-player rule has been reviewed or transferred.',
    publisherReferenceSourceId: 'parker-catalog-railroad-popular',
    sources: [source('parker-catalog-railroad-popular', 'Original Parker Brothers publisher catalog, PDF page 8 / printed page 13: separate Railroad Game Popular Edition listing, lithographed folding board, box, components and 25-cent price.')],
    collisionReviews: [],
  }),
  accepted({
    identityId: 'game-fcf81100-12d6-4108-9d35-c50dc4fc2d35',
    routeKey: 'game-fcf81100-12d6-4108-9d35-c50dc4fc2d35',
    name: 'The Grocery Store Game (Parker Brothers 50-cent issue)',
    searchNames: ['The Grocery Store Game'],
    publisher: 'Parker Brothers',
    identityScope: 'The 50-cent large-box premium card edition advertised on printed page 14 of Parker Brothers’ undated Illustrated Catalogue of Standard Games (archived as 1889). The publisher explicitly says it is played in the same manner as its 25-cent Corner Grocery, but this record binds only the higher-priced physical issue.',
    identityEvidence: 'The illustrated Grocery Store Game box label bears the Parker Bros. Salem publisher imprint. The text describes a more elaborate large-box edition, with illustrated grocery cards on prepared cardboard, priced at 50 cents. It states that playing qualities follow Corner Grocery; no starting-player rule is reviewed or transferred.',
    publisherReferenceSourceId: 'parker-catalog-grocery-store',
    sources: [source('parker-catalog-grocery-store', 'Original Parker Brothers publisher catalog, PDF page 9 / printed page 14: illustrated Grocery Store Game label, premium-card description, same-manner relation to Corner Grocery and 50-cent price.')],
    collisionReviews: [],
  }),
  accepted({
    identityId: 'game-c8943689-960a-4007-9af6-c3a51c83a735',
    routeKey: 'game-c8943689-960a-4007-9af6-c3a51c83a735',
    name: 'Corner Grocery (Parker Brothers 25-cent issue)',
    searchNames: ['The Amusing Game of the Corner Grocery', 'Corner Grocery'],
    publisher: 'Parker Brothers',
    identityScope: 'The 25-cent boxed card-and-play-money Corner Grocery product advertised on printed page 15 of Parker Brothers’ undated Illustrated Catalogue of Standard Games (archived as 1889). The 50-cent Grocery Store Game is a separately packaged premium edition described on the facing page; other Corner Grocery printings are unlinked.',
    identityEvidence: 'The catalog illustrates a box label headed The Amusing Game of the Corner Grocery. Its description specifies about 40 illustrated grocery cards with prices and about 100 money pieces for buying and paying, in a separately priced 25-cent product. No starting-player rule has been reviewed or transferred.',
    publisherReferenceSourceId: 'parker-catalog-corner-grocery',
    sources: [source('parker-catalog-corner-grocery', 'Original Parker Brothers publisher catalog, PDF page 9 / printed page 15: illustrated Corner Grocery box label, card and money components and 25-cent price.')],
    collisionReviews: [],
  }),
];

// Same-reference collisions are reviewed as separate products, with the concrete
// configuration of both catalog entries recorded in each acknowledgment.
const configurations = new Map([
  ['game-056efc27-4c46-496a-8eba-1d15b51e8e02', 'military-career board, metal soldiers and spinner'],
  ['game-138bf8ab-46f7-4f92-8157-3f4caf2bde25', 'boxed folding travel board'],
  ['game-324ca9c3-5445-40d4-97ee-e9716f59dfc0', 'single Rex track board, maple pieces and spinner'],
  ['game-2c89d6f3-74c4-4103-a73a-07bf933637ff', 'four-board Progressive Rex set'],
  ['game-a84bd742-749d-4704-8144-b47ad8f5c957', 'connected-point battlefield board and maple pieces'],
  ['game-3e233e7f-f2d8-485e-9f79-7d6865fbde5b', 'siege board with 50 attackers and three defenders'],
  ['game-6747c489-8d06-49f6-a074-fb05f6bcbffd', '50-cent wooden railway board with a teetotum'],
  ['game-a3644921-b283-4a5b-8183-30ecf7a7034e', '25-cent lithographed folding railway board and box'],
  ['game-fcf81100-12d6-4108-9d35-c50dc4fc2d35', '50-cent large-box premium illustrated grocery cards'],
  ['game-c8943689-960a-4007-9af6-c3a51c83a735', '25-cent grocery cards and play money'],
]);
const newIds = new Set(identities.map(record => record.identityId));
const existingCatalog = registry.records.filter(record => !newIds.has(record.identityId) && record.decision === 'accept' && record.sources.some(item => item.url === catalogUrl));
if (existingCatalog.length !== 5) throw new Error('Expected five preceding accepted catalog products');
for (let i = 0; i < identities.length; i++) {
  const current = identities[i];
  for (const prior of [...existingCatalog, ...identities.slice(0, i)]) {
    current.collisionReviews.push({
      identityId: prior.identityId,
      reason: `The original Parker Brothers catalog separately lists ${current.name} (${configurations.get(current.identityId)}) and ${prior.name} (${configurations.get(prior.identityId)}). These distinct physical configurations warrant separate identities despite the shared source-volume URL.`,
      sourceIds: [current.publisherReferenceSourceId],
    });
  }
  current.acceptedRevision = revision(current);
}

const mode = process.argv[2];
if (mode === '--write') {
  const existing = identities.map(record => registry.records.findIndex(item => item.identityId === record.identityId));
  if (registry.records.length !== 123 || existing.some(index => index !== -1)) throw new Error('Expected untouched 5,260-identity registry');
  registry.records.push(...identities);
  writeFileSync(registryPath, `${JSON.stringify(registry, null, 2).replace(/\n/g, '\r\n')}\r\n`);
} else if (mode === '--validate') {
  for (const expected of identities) {
    const actual = registry.records.find(record => record.identityId === expected.identityId);
    if (canonical(actual) !== canonical(expected) || actual.acceptedRevision !== revision(actual)) throw new Error(`Identity record changed: ${expected.identityId}`);
  }
  if (registry.records.length !== 128 || registry.records.filter(record => record.decision === 'accept').length !== 128) throw new Error('Follow-up batch has unexpected registry count');
  const response = await globalThis.fetch(catalogUrl, { signal: globalThis.AbortSignal.timeout(120000) });
  if (!response.ok) throw new Error(`Catalog unavailable (${response.status})`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.length !== catalogBytes || hash(bytes) !== catalogHash) throw new Error('Catalog bytes changed');
  console.log(`Validated ${identities.length} additional Parker Brothers product identities and the original catalog hash`);
} else {
  throw new Error('Use --write once or --validate after insertion');
}
