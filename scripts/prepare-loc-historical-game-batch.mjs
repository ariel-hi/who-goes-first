/** Rebuild or validate two physical game identities from Library of Congress scans. */
import { createHash } from 'node:crypto';
import console from 'node:console';
import { readFileSync, writeFileSync } from 'node:fs';
import process from 'node:process';

const registryPath = 'research/coverage/publisher-identities.json';
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

const identities = [
  accepted({
    identityId: 'game-22ce89dd-893f-4c12-9228-1e3b79e638d0',
    routeKey: 'game-22ce89dd-893f-4c12-9228-1e3b79e638d0',
    name: 'Jeu géographique de la République Française : présenté à la Convention Nationale',
    searchNames: [],
    publisher: 'Basset (Firm)',
    identityScope: 'The single printed French geographical game board held by the Library of Congress as G5831.F7 1795 .M3 (LCCN 79695291), published in Paris by Chez Basset around 1795. Other impressions, reproductions and later geographic games are excluded.',
    identityEvidence: 'The original hand-colored sheet prints the full game title, J. N. Mauborgne credit, a numbered route through the French departments, rules in the central panel, and the Chez Basset Paris imprint. The Library of Congress catalogs one 55 x 80 cm game sheet, circa 1795, with Basset as a named contributor. No starting-player rule has been checked or transferred.',
    publisherReferenceSourceId: 'loc-jeu-geographique-board',
    sources: [
      { id: 'loc-jeu-geographique-board', kind: 'primary-publisher', url: 'https://tile.loc.gov/image-services/iiif/service:gmd:gmd5:g5831:g5831f:ct001461/full/pct:25/0/default.jpg', sha256: '52251e7f5822bc8f2a3ebf1b682e1a22f7d36eabfd6fe09010ed3eeb4ee526cf', byteCount: 1037963, location: 'Library of Congress LCCN 79695291, Geography and Map Division, original hand-colored game sheet: central title, rules and bottom Chez Basset imprint. The item rights statement says the World Digital Library material is free to use and reuse absent restrictions.' },
    ],
    collisionReviews: [],
  }),
  accepted({
    identityId: 'game-27835ce3-95e4-4b4f-ba5c-14e9358e8208',
    routeKey: 'game-27835ce3-95e4-4b4f-ba5c-14e9358e8208',
    name: 'Going to Klondyke (Klondyke Game Co. 1897)',
    searchNames: ['Going to Klondyke'],
    publisher: 'Klondyke Game Co.',
    identityScope: 'The single 1897 printed map and pin-placement game by May Bloom and the Klondyke Game Co. of San Francisco, held by the Library of Congress as G4371.A9 1897 .B5 TIL (LCCN 99446193). Later Klondike-themed games or reprints are excluded.',
    identityEvidence: 'The original printed sheet says Going to Klondyke, An Amusing and Instructive Game, carries numbered rules for blindfolded pin placement and claim scoring, and prints Copyright 1897 by May Bloom and Published by the Klondyke Game Co. No starting-player rule has been reviewed or transferred.',
    publisherReferenceSourceId: 'loc-going-to-klondyke-map',
    sources: [
      { id: 'loc-going-to-klondyke-map', kind: 'primary-publisher', url: 'https://tile.loc.gov/image-services/iiif/service:gmd:gmd437:g4371:g4371a:mf000035/full/pct:25/0/default.jpg', sha256: '52fa278a9686a265e939f29cc4ec3e0cda9eb0b1838144d28d714951a1e1bd26', byteCount: 520161, location: 'Library of Congress LCCN 99446193, Geography and Map Division, original printed 1897 game map: prominent title, rules panel, May Bloom copyright and Klondyke Game Co. San Francisco imprint. The item rights statement says World Digital Library material is free to use and reuse absent restrictions.' },
    ],
    collisionReviews: [],
  }),
];

const mode = process.argv[2];
if (mode === '--write') {
  if (registry.records.length !== 111 || identities.some(record => registry.records.some(existing => existing.identityId === record.identityId))) {
    throw new Error('Expected untouched 5,248-identity registry before insertion');
  }
  registry.records.push(...identities);
  writeFileSync(registryPath, `${JSON.stringify(registry, null, 2).replace(/\n/g, '\r\n')}\r\n`);
} else if (mode === '--validate') {
  for (const expected of identities) {
    const actual = registry.records.find(record => record.identityId === expected.identityId);
    if (canonical(actual) !== canonical(expected) || actual.acceptedRevision !== revision(actual)) {
      throw new Error(`Identity record changed: ${expected.identityId}`);
    }
  }
  if (registry.records.length !== 113 || registry.records.filter(record => record.decision === 'accept').length !== 113) {
    throw new Error('Historical batch has unexpected registry count');
  }
  const observed = await Promise.all(identities.flatMap(record => record.sources).map(async source => {
    const bytes = new Uint8Array(await (await globalThis.fetch(source.url, { signal: globalThis.AbortSignal.timeout(30000) })).arrayBuffer());
    if (bytes.length !== source.byteCount || hash(bytes) !== source.sha256) {
      throw new Error(`Source changed: ${source.id}`);
    }
    return source.id;
  }));
  console.log(`Validated ${identities.length} accepted historical identities and ${observed.length} original source hashes`);
} else {
  throw new Error('Use --write once or --validate after insertion');
}
