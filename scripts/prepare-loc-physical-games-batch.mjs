/** Rebuild or validate three physical game identities from original Library of Congress artifacts. */
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
    identityId: 'game-491439d4-195e-45a9-ae73-ad5a1cca1679',
    routeKey: 'game-491439d4-195e-45a9-ae73-ad5a1cca1679',
    name: "Middleton's New geographical game of a tour through England and Wales (1820)",
    searchNames: ["Middleton's New geographical game of a tour through England and Wales", 'The New Game of England and Wales'],
    publisher: 'M. Middleton',
    identityScope: 'The M. Middleton London boxed map game and jigsaw issue published May 1820, held by the Library of Congress as G5751.A9 1820 .M5 (LCCN 85695490). Later maps, reproductions and different geographical games are excluded.',
    identityEvidence: 'The original board prints Middleton\'s New Geographical Game of a Tour through England and Wales and the M. Middleton London imprint. Its photographed directions are headed The Game of England and specify counters, a numbered totum, movement and a winning destination; the box lid says The New Game of England. The Library catalogs a 77-piece physical puzzle, directions, box, missing counters and die. No starting-player rule has been reviewed or transferred.',
    publisherReferenceSourceId: 'loc-middleton-game-sheet',
    sources: [
      { id: 'loc-middleton-game-sheet', kind: 'primary-publisher', url: 'https://tile.loc.gov/image-services/iiif/service:gmd:gmd5:g5751:g5751a:ct006184/full/pct:25/0/default.jpg', sha256: 'cc4d43737de86ce2a0a0b76322c11c22a137b6dc401d08b9bad00dea32ea8e0c', byteCount: 824297, location: 'Library of Congress LCCN 85695490, original boxed map game: board title and London imprint, game directions with rules, and illustrated box label. Date and physical pieces cross-checked against the item catalog.' },
    ],
    collisionReviews: [],
  }),
  accepted({
    identityId: 'game-b845b50a-6c5b-462f-b7c5-80683c69d765',
    routeKey: 'game-b845b50a-6c5b-462f-b7c5-80683c69d765',
    name: "The traveller's tour through the United States (F. & R. Lockwood 1822)",
    searchNames: ["The traveller's tour through the United States"],
    publisher: 'F. & R. Lockwood',
    identityScope: 'The original 1822 F. & R. Lockwood New York hand-colored map game held by the Library of Congress as G3701.A9 1822 .F3 (LCCN 2017585497). Expanded Lockwood tours of Europe or the world, later printings and reproductions are excluded.',
    identityEvidence: 'The original recto prints The Traveller\'s Tour through the United States, Rules for playing the Game, a numbered city route, and Published by F. & R. Lockwood, 1822. Its photographed verso bears a publisher label naming the same game and firm. The Library catalogs one cardboard-mounted physical map with instructions. No starting-player rule has been reviewed or transferred.',
    publisherReferenceSourceId: 'loc-travellers-tour-recto',
    sources: [
      { id: 'loc-travellers-tour-recto', kind: 'primary-publisher', url: 'https://tile.loc.gov/image-services/iiif/service:gmd:gmd370:g3701:g3701a:ct011568r/full/pct:25/0/default.jpg', sha256: '9ea0466ea967f80e4587ea854b92902e16c56c27e78fc8a3527ff42387e6546e', byteCount: 504377, location: 'Library of Congress LCCN 2017585497, original map recto: game title, printed rules, numbered route, New York F. & R. Lockwood imprint and 1822 date.' },
      { id: 'loc-travellers-tour-verso', kind: 'primary-publisher', url: 'https://tile.loc.gov/image-services/iiif/service:gmd:gmd370:g3701:g3701a:ct011568v/full/pct:12.5/0/default.jpg', sha256: '5f20b2ca4056ba8e7a4cb6aa94647c213ebe38c7f1063d9e2cc647c1eab016bd', byteCount: 20229, location: 'Same Library of Congress physical item, photographed verso: publisher label with game title and F. & R. Lockwood identification.' },
    ],
    collisionReviews: [],
  }),
  accepted({
    identityId: 'game-c533cedf-6e6f-4725-92c8-d5d5090358d7',
    routeKey: 'game-c533cedf-6e6f-4725-92c8-d5d5090358d7',
    name: 'Los charros contrabandistas: juego de dados (A. Vanegas Arroyo)',
    searchNames: ['Los charros contrabandistas', 'Los charros contrabandistas. Juego de dados'],
    publisher: 'Antonio Vanegas Arroyo',
    identityScope: 'The Antonio Vanegas Arroyo Mexico City printed dice-game board, cataloged by the Library of Congress between 1890 and 1913 as PGA - Vanegas, no. 32 (LCCN 99615952). The exact printing year is unknown; other Posada prints and later games are excluded.',
    identityEvidence: 'The original gameboard visibly prints Los Charros Contrabandistas, Juego de Dados, a 64-space illustrated route, an Explicacion rules panel, and Imprenta de A. Vanegas Arroyo, Mexico. The Library identifies the printed sheet as a physical dice game and credits José Guadalupe Posada as artist. No starting-player rule has been reviewed or transferred.',
    publisherReferenceSourceId: 'loc-charros-original-sheet',
    sources: [
      { id: 'loc-charros-original-sheet', kind: 'primary-publisher', url: 'https://cdn.loc.gov/service/pnp/ppmsc/03400/03448v.jpg', sha256: '77bbccd8141d5612fb97d009b399d451276f2a66fa32ddc0a6b0af15f2442243', byteCount: 382038, location: 'Library of Congress LCCN 99615952, digital file from original print LC-DIG-ppmsc-03448: title, 64 spaces, printed Spanish rules, and A. Vanegas Arroyo Mexico imprint. Item catalog dates the sheet only between 1890 and 1913.' },
    ],
    collisionReviews: [],
  }),
];

const mode = process.argv[2];
if (mode === '--write') {
  if (registry.records.length !== 113 || identities.some(record => registry.records.some(existing => existing.identityId === record.identityId))) {
    throw new Error('Expected untouched 5,250-identity registry before insertion');
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
  if (registry.records.length !== 116 || registry.records.filter(record => record.decision === 'accept').length !== 116) {
    throw new Error('Physical-game batch has unexpected registry count');
  }
  const observed = await Promise.all(identities.flatMap(record => record.sources).map(async source => {
    const response = await globalThis.fetch(source.url, { signal: globalThis.AbortSignal.timeout(60000) });
    if (!response.ok) throw new Error(`Source unavailable: ${source.id} (${response.status})`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.length !== source.byteCount || hash(bytes) !== source.sha256) {
      throw new Error(`Source changed: ${source.id}`);
    }
    return source.id;
  }));
  console.log(`Validated ${identities.length} accepted physical game identities and ${observed.length} original source hashes`);
} else {
  throw new Error('Use --write once or --validate after insertion');
}
