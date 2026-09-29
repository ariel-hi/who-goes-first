/** Rebuild or validate two exact physical-game identities from inspected museum artifacts. */
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
    identityId: 'game-8b5169c6-588d-4ca9-bca8-ff4da387212e',
    routeKey: 'game-8b5169c6-588d-4ca9-bca8-ff4da387212e',
    name: 'The Road to the Temple of Honour and Fame (J. Harris 1811)',
    searchNames: ['The Road to the Temple of Honour and Fame'],
    publisher: 'J. Harris',
    identityScope: 'The NYPL Rare Book Division J. Harris London board and cover cataloged as the 1811 issue (*KVZ 85-162, b10947547). The associated instructions carry an 1810 imprint; their printing and rules are not claimed to correspond to the 1811 board. No other issue or reproduction is enrolled.',
    identityEvidence: 'The original cover scan prints The Road to the Temple of Honour and Fame, A New Game, and Published London by J. Harris. The original illustrated game board prints the title and An Instructive and Entertaining Game. NYPL catalogs the physical board and cover together as issued in 1811. A separately scanned instructions title page reads 1810, so no starting-player rule or edition transfer is approved.',
    publisherReferenceSourceId: 'road-cover-scan',
    sources: [
      { id: 'road-cover-scan', kind: 'primary-publisher', url: 'https://iiif-prod.nypl.org/index.php?id=5030766&t=v', sha256: '82ca342026e2513b648e6f87457f6f1f312dd634159aa215c2f9a288947337fb', byteCount: 730045, location: 'NYPL image 5030766, front of the original box cover; title, A New Game, and Published London by J. Harris in the central cartouche.' },
      { id: 'road-board-scan', kind: 'primary-publisher', url: 'https://iiif-prod.nypl.org/index.php?id=5030765&t=v', sha256: '88bcd7d13a00c9d2928fec725d6e32ce65e7d3667355f0d34300b4ef03ac58ba', byteCount: 1402480, location: 'NYPL image 5030765, original linen-mounted board; top caption Road to the Temple of Honour and Fame, An Instructive and Entertaining Game.' },
      { id: 'road-rules-imprint', kind: 'primary-publisher', url: 'https://iiif-prod.nypl.org/index.php?id=5030770&t=v', sha256: 'fb32a126f63095d3e966ee111d440537a12f2ad77a76a492687dd22e77818d23', byteCount: 393706, location: 'NYPL image 5030770, associated rules booklet title page; printed for J. Harris and dated 1810. Used only to record the issue mismatch, not to approve a rule.' },
      { id: 'road-nypl-catalog', kind: 'identifier-reference', url: 'https://raw.githubusercontent.com/NYPL-publicdomain/data-and-utilities/master/collections/pd_collections.csv', sha256: '578c09d19393055cd8b40d8bd4f1754eabb65bd3ea3ecf3b038e6ea5358f490c', byteCount: 628632, location: 'Collection UUID 9a304ec0-6281-0130-61d8-58d385a7bbd0; title, J. Harris publisher, 1811 date, three associated items.' },
    ],
    collisionReviews: [],
  }),
  accepted({
    identityId: 'game-9f330a5b-0e0b-4fbd-94e0-6fd762012e93',
    routeKey: 'game-9f330a5b-0e0b-4fbd-94e0-6fd762012e93',
    name: 'The Telephone Game (Ideal Spellbinders No. 2410)',
    searchNames: ['The Telephone Game'],
    publisher: 'Ideal School Supply Co.',
    identityScope: 'The physical Ideal Spellbinders educational teacher game numbered 2410, cataloged by Smithsonian as made in 1976. Other games with this generic title, later issues, and touch-tone or rotary-dial variants outside this box are excluded.',
    identityEvidence: 'The original museum-photographed box front visibly prints Ideal Spellbinders, No. 2410, and THE TELEPHONE GAME beside a photograph of its board and components. The Smithsonian object manifest identifies Ideal School Supply Co. as maker, dates the object to 1976, and describes the board, teacher guide, cards, markers, die, and pieces. No starting-player rule is approved. The Smithsonian photo is restricted media and is referenced only as evidence; no image is shipped.',
    publisherReferenceSourceId: 'telephone-box-photo',
    sources: [
      { id: 'telephone-box-photo', kind: 'primary-publisher', url: 'https://ids.si.edu/ids/iiif/NMAH-AHB2006q21623/full/full/0/default.jpg', sha256: '6c0b1aa06d413e08d31593ca203c2c68ec9d44b63f68778dc2121cf96aa6c046', byteCount: 635774, location: 'Smithsonian image NMAH-AHB2006q21623, original product box front; Ideal Spellbinders logo, No. 2410, title THE TELEPHONE GAME. Media usage conditions apply; fact extraction only.' },
      { id: 'telephone-object-manifest', kind: 'identifier-reference', url: 'https://ids.si.edu/ids/manifest/NMAH-AHB2006q21623', sha256: '5aacf71eb13a25d31f4c804fde67c69aed6e0fcd7fea69e5b36fce4391e32f75', byteCount: 3456, location: 'IIIF manifest metadata: National Museum of American History object nmah_1213645, maker Ideal School Supply Co., date made 1976, physical components; CC0 metadata and Smithsonian image-use terms are separate.' },
    ],
    collisionReviews: [],
  }),
];

const mode = process.argv[2];
if (mode === '--write') {
  if (registry.records.length !== 109 || identities.some(record => registry.records.some(existing => existing.identityId === record.identityId))) {
    throw new Error('Expected untouched 5,246-identity live baseline before batch insertion');
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
  if (registry.records.length !== 111 || registry.records.filter(record => record.decision === 'accept').length !== 111) {
    throw new Error('Museum batch has unexpected registry count');
  }
  const sources = identities.flatMap(record => record.sources);
  const observed = await Promise.all(sources.map(async source => {
    const bytes = source.id === 'road-nypl-catalog'
      ? readFileSync('artifacts/coverage-research/nypl-pd-collections.csv')
      : new Uint8Array(await (await globalThis.fetch(source.url, { signal: globalThis.AbortSignal.timeout(30000) })).arrayBuffer());
    if (bytes.length !== source.byteCount || hash(bytes) !== source.sha256) {
      throw new Error(`Source changed: ${source.id}`);
    }
    return source.id;
  }));
  console.log(`Validated ${identities.length} accepted identities and ${observed.length} original source hashes`);
} else {
  throw new Error('Use --write once or --validate after insertion');
}
