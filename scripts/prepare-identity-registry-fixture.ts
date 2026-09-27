// Prepares an ignored copied site; does not build, serve, approve or deploy it.
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { publisherJourneyFixture } from '../tests/fixtures/publisher-identities';
import { createIdentityRegistry, publisherRegistrySchema } from '../src/lib/content/identity-registry';
import { identityAssignmentsSchema, researchIdentityAssignmentsSchema } from '../src/lib/content/identity-assignments';
import { getBoardGameInventory, getBoardGameRegistry, buildBoardGames } from '../src/lib/content/board-games';
import { buildCoverage } from '../src/lib/content/coverage';
import { buildBrowseShelves, shelfHref } from '../src/lib/content/board-game-browse';
import { readRecords } from '../src/lib/content/catalog';
import { ruleSchema } from '../src/lib/content/schema';

const root = resolve('.');
const read = (path: string) => JSON.parse(readFileSync(join(root, path), 'utf8'));
// Validate real envelopes, but retain their original objects/attribution when
// adding synthetic records. The live files are never fixture write targets.
const publisher = read('research/coverage/publisher-identities.json');
const publication = read('research/coverage/identity-assignments.json');
const research = read('research/coverage/draft-identity-assignments.json');
publisherRegistrySchema.parse(publisher);
identityAssignmentsSchema.parse(publication);
researchIdentityAssignmentsSchema.parse(research);
const fixture = publisherJourneyFixture();
const mergedPublisher = { ...publisher, records: [...publisher.records, ...fixture.identities] };
const mergedPublication = { ...publication, records: [...publication.records, ...fixture.publication.records] };
const mergedResearch = { ...research, records: [...research.records, ...fixture.research.records] };
const approved = readRecords('src/content/games').map(rule => ruleSchema.parse(rule));
const drafts = readRecords('research/games').map(rule => ruleSchema.parse(rule));
for (const record of [...fixture.approved, fixture.draft]) {
  if ([...approved, ...drafts].some(existing => existing.id === record.id || existing.slug === record.slug)
    || ['src/content/games', 'research/games'].some(directory => existsSync(join(root, directory, `${record.id}.json`)))) {
    throw new Error(`Synthetic fixture output collides with real content: ${record.id}`);
  }
}
const aliases = new Map(getBoardGameRegistry().map(identity => [identity.identityId, identity.searchNames]));
const registry = createIdentityRegistry(getBoardGameInventory().games.map(game => ({ ...game, searchNames: aliases.get(`bgg-${game.bggId}`) ?? [] })), mergedPublisher);
const overrides = read('research/coverage/identity-overrides.json');
const allApproved = [...approved, ...fixture.approved];
const browse = buildBrowseShelves(buildBoardGames(registry, allApproved, overrides, mergedPublication));
// Retain real research associations too; stale/conflicting scope must fail,
// rather than being filtered out to make the synthetic site build.
buildCoverage(registry, allApproved, [...drafts, fixture.draft], overrides, mergedPublication, mergedResearch);
mkdirSync('artifacts/identity-registry-fixtures', { recursive: true });
const target = mkdtempSync(resolve('artifacts/identity-registry-fixtures/site-'));
for (const name of ['src', 'public', 'research', 'scripts', 'tests/fixtures']) cpSync(join(root, name), join(target, name), { recursive: true, filter: path => !path.includes('source-files') });
for (const name of ['astro.config.ts', 'tsconfig.json', 'package.json']) cpSync(join(root, name), join(target, name));
if (!existsSync(join(target, 'node_modules'))) symlinkSync(join(root, 'node_modules'), join(target, 'node_modules'), 'junction');
const write = (path: string, value: unknown) => writeFileSync(join(target, path), JSON.stringify(value, null, 2) + '\n');
write('research/coverage/publisher-identities.json', mergedPublisher);
write('research/coverage/identity-assignments.json', mergedPublication);
write('research/coverage/draft-identity-assignments.json', mergedResearch);
for (const record of fixture.approved) write(`src/content/games/${record.id}.json`, record);
write(`research/games/${fixture.draft.id}.json`, fixture.draft);
write('identity-fixture.json', { neverDeploy: true, base: root, target,
  identities: fixture.identities.map(identity => ({ identityId: identity.identityId, name: identity.name, shelf: shelfHref(browse.shelves.find(shelf => shelf.games.some(game => game.identityId === identity.identityId))!.letter, browse.shelves.find(shelf => shelf.games.some(game => game.identityId === identity.identityId))!.page) })),
  article: fixture.approved[0]!.slug, chooser: fixture.identities[3]!.routeKey, draft: fixture.draft.slug });
console.log(`Synthetic fixture only, never deploy: ${target}`);
