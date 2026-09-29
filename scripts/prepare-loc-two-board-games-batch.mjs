/** Rebuild or validate two original Library of Congress board-game identities. */
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
    identityId: 'game-12f45568-ecb6-44d1-9aa5-1db168f4936b',
    routeKey: 'game-12f45568-ecb6-44d1-9aa5-1db168f4936b',
    name: 'Rambles Through Our Country (American Publishing Company 1890)',
    searchNames: ['Rambles Through Our Country', 'Rambles Through Our Country: An Instructive Geographical Game for the Young'],
    publisher: 'American Publishing Company',
    identityScope: 'The original 1890 illustrated United States geographical game map copyrighted by American Publishing Company of Hartford, held by the Library of Congress as PGA - Schaefer & Weisenbach--Rambles ... (LCCN 2006677460). Schaefer & Weisenbach are credited as lithographers, not silently treated as the rights holder. Later reprints and other United States map games are excluded.',
    identityEvidence: 'The original chromolithograph prints RAMBLES THROUGH OUR COUNTRY, AN INSTRUCTIVE GEOGRAPHICAL GAME FOR THE YOUNG, a numbered route across the United States, the 1890 date, and COPYRIGHT SECURED BY AMERICAN PUBLISHING COMPANY, HARTFORD, CONN. The Library catalogs the physical print, names Schaefer & Weisenbach as lithographers, and describes the game; its map-division blog notes an associated instructions booklet. No starting-player rule has been reviewed or transferred.',
    publisherReferenceSourceId: 'loc-rambles-original-board',
    sources: [
      { id: 'loc-rambles-original-board', kind: 'primary-publisher', url: 'https://cdn.loc.gov/service/pnp/pga/03200/03272v.jpg', sha256: '100a1d2c9366a8b3b917c464b29ca9ab9d88a2453678d63933120dfa13dfd9f5', byteCount: 240812, location: 'Library of Congress LCCN 2006677460, LC-DIG-pga-03272 digital file from original print: title, game subtitle, numbered U.S. route, 1890 date, American Publishing Company copyright panel. Item catalog separately names Schaefer & Weisenbach as lithographers.' },
    ],
    collisionReviews: [],
  }),
  accepted({
    identityId: 'game-5cb75667-b8b5-4529-adac-3619ec2c8fe6',
    routeKey: 'game-5cb75667-b8b5-4529-adac-3619ec2c8fe6',
    name: 'The Office Boy (Parker Bros. 1889)',
    searchNames: ['The Office Boy', 'Office Boy'],
    publisher: 'Parker Bros.',
    identityScope: 'The original 1889 Parker Bros. Salem illustrated board held by the Library of Congress Rare Book and Special Collections Division as LCCN 97196328. The surviving copy has only the board; its playing pieces and teetotum are missing. Later Office Boy issues and unrelated namesakes are excluded.',
    identityEvidence: 'The original board prints THE OFFICE BOY, COPYRIGHT 1889 BY PARKER BROS. PUBLISHERS SALEM, MASS., a start square, career-path spaces, a head-of-firm goal and a small printed rules panel. The Library catalogs the physical 47 x 42 cm color game board and missing pieces and teetotum. No starting-player rule has been reviewed or transferred.',
    publisherReferenceSourceId: 'loc-office-boy-board',
    sources: [
      { id: 'loc-office-boy-board', kind: 'primary-publisher', url: 'https://tile.loc.gov/image-services/iiif/public:rbc:2017carson96328:0001/full/pct:25.0/0/default.jpg', sha256: 'a513daf3cb87738fabc33e49a61f6ee450e788844b2a4530354e5409e6f43cea', byteCount: 553423, location: 'Library of Congress LCCN 97196328, original illustrated game board: bottom-left title, Parker Bros. Salem imprint and 1889 copyright, printed rules, start path and central goal. Item catalog describes missing pieces and teetotum.' },
    ],
    collisionReviews: [],
  }),
];

const mode = process.argv[2];
if (mode === '--write') {
  if (registry.records.length !== 116 || identities.some(record => registry.records.some(existing => existing.identityId === record.identityId))) {
    throw new Error('Expected untouched 5,253-identity registry before insertion');
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
  if (registry.records.length !== 118 || registry.records.filter(record => record.decision === 'accept').length !== 118) {
    throw new Error('Two-board batch has unexpected registry count');
  }
  const observed = await Promise.all(identities.flatMap(record => record.sources).map(async source => {
    const response = await globalThis.fetch(source.url, { signal: globalThis.AbortSignal.timeout(60000) });
    if (!response.ok) throw new Error(`Source unavailable: ${source.id} (${response.status})`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.length !== source.byteCount || hash(bytes) !== source.sha256) throw new Error(`Source changed: ${source.id}`);
    return source.id;
  }));
  console.log(`Validated ${identities.length} accepted board identities and ${observed.length} original source hashes`);
} else {
  throw new Error('Use --write once or --validate after insertion');
}
