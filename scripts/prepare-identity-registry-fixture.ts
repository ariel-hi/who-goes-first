// Prepares an ignored copied site; does not build, serve, approve or deploy it.
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { publisherJourneyFixture } from '../tests/fixtures/publisher-identities';
import { createIdentityRegistry } from '../src/lib/content/identity-registry';
import { getBoardGameInventory, getBoardGameRegistry, buildBoardGames } from '../src/lib/content/board-games';
import { buildBrowseShelves, shelfHref } from '../src/lib/content/board-game-browse';
import { readRecords } from '../src/lib/content/catalog';
import { ruleSchema } from '../src/lib/content/schema';

const root = resolve('.');
const read = (path: string) => JSON.parse(readFileSync(join(root, path), 'utf8'));
const envelopes = ['publisher-identities', 'identity-assignments', 'draft-identity-assignments'];
// An explicit fixture, not an importer for future active registries.
for (const file of envelopes) if (read(`research/coverage/${file}.json`).records.length) throw new Error('Fixture preparation requires empty active new registries');
mkdirSync('artifacts/identity-registry-fixtures', { recursive: true });
const target = mkdtempSync(resolve('artifacts/identity-registry-fixtures/site-'));
for (const name of ['src', 'public', 'research', 'scripts', 'tests/fixtures']) cpSync(join(root, name), join(target, name), { recursive: true, filter: path => !path.includes('source-files') });
for (const name of ['astro.config.ts', 'tsconfig.json', 'package.json']) cpSync(join(root, name), join(target, name));
if (!existsSync(join(target, 'node_modules'))) symlinkSync(join(root, 'node_modules'), join(target, 'node_modules'), 'junction');
const fixture = publisherJourneyFixture();
const write = (path: string, value: unknown) => writeFileSync(join(target, path), JSON.stringify(value, null, 2) + '\n');
write('research/coverage/publisher-identities.json', { formatVersion: 1, records: fixture.identities });
write('research/coverage/identity-assignments.json', fixture.publication);
write('research/coverage/draft-identity-assignments.json', fixture.research);
for (const record of fixture.approved) write(`src/content/games/${record.id}.json`, record);
write(`research/games/${fixture.draft.id}.json`, fixture.draft);
const aliases = new Map(getBoardGameRegistry().map(identity => [identity.identityId, identity.searchNames]));
const registry = createIdentityRegistry(getBoardGameInventory().games.map(game => ({ ...game, searchNames: aliases.get(`bgg-${game.bggId}`) ?? [] })), { formatVersion: 1, records: fixture.identities });
const browse = buildBrowseShelves(buildBoardGames(registry, [...readRecords('src/content/games').map(rule => ruleSchema.parse(rule)), ...fixture.approved], read('research/coverage/identity-overrides.json'), fixture.publication));
write('identity-fixture.json', { neverDeploy: true, base: root, target,
  identities: fixture.identities.map(identity => ({ identityId: identity.identityId, name: identity.name, shelf: shelfHref(browse.shelves.find(shelf => shelf.games.some(game => game.identityId === identity.identityId))!.letter, browse.shelves.find(shelf => shelf.games.some(game => game.identityId === identity.identityId))!.page) })),
  article: fixture.approved[0]!.slug, chooser: fixture.identities[3]!.routeKey, draft: fixture.draft.slug });
console.log(`Synthetic fixture only, never deploy: ${target}`);
