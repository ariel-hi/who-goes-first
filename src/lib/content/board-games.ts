import { readFileSync, statSync } from 'node:fs';
import { z } from 'zod';
import { getCatalog } from './catalog';

const inventorySchema = z.object({
  discoveredAt: z.string(),
  indexSource: z.url(),
  scope: z.string(),
  games: z.array(z.object({
    name: z.string().min(1),
    bggId: z.string().regex(/^\d+$/),
    discoveryUrl: z.url().refine(url => new URL(url).hostname === 'boardgamegeek.com'),
    status: z.literal('needs-primary-source'),
  }).strict()),
}).strict();
const overridesSchema = z.array(z.object({
  ruleId: z.string(), inventoryIds: z.array(z.string()), reason: z.string(),
}).strict());
const nameKey = (name: string) => name.normalize('NFKD').replace(/\p{M}/gu, '').toLocaleLowerCase('en').replace(/[^\p{L}\p{N}]/gu, '');

const wikidataSchema = z.object({
  retrievedOn: z.string(),
  games: z.array(z.object({
    name: z.string().min(1), bggId: z.string().regex(/^\d+$/),
    wikidataUrl: z.url(), alreadyListed: z.boolean(), reviewFlags: z.array(z.string()),
  })),
});

let cachedInventory: z.infer<typeof inventorySchema> | undefined;
let inventoryRevision = '';
export function getBoardGameInventory() {
  const revision = ['research/coverage/discovery-index.json', 'research/coverage/wikidata-board-games.json'].map(path => {
    const file = statSync(path);
    return `${file.mtimeMs}:${file.size}`;
  }).join('|');
  if (cachedInventory && revision === inventoryRevision) return cachedInventory;
  const original = inventorySchema.parse(JSON.parse(readFileSync('research/coverage/discovery-index.json', 'utf8')));
  const wikidata = wikidataSchema.parse(JSON.parse(readFileSync('research/coverage/wikidata-board-games.json', 'utf8')));
  const ids = new Set(original.games.map(game => game.bggId));
  const names = new Set(original.games.map(game => nameKey(game.name)));
  const additions = wikidata.games.filter(game => !ids.has(game.bggId) && game.reviewFlags.length === 0 && !names.has(nameKey(game.name))).map(game => ({
    name: game.name, bggId: game.bggId,
    discoveryUrl: `https://boardgamegeek.com/boardgame/${game.bggId}`,
    status: 'needs-primary-source' as const,
  }));
  if (new Set(additions.map(game => game.bggId)).size !== additions.length) throw new Error('Duplicate Wikidata board game identity');
  cachedInventory = { ...original, scope: `${original.scope} Plus ${additions.length} unflagged, English-labeled Wikidata P2339 identity leads from ${wikidata.retrievedOn}; no rule text imported.`, games: [...original.games, ...additions] };
  inventoryRevision = revision;
  return cachedInventory;
}

export function getBoardGames() {
  const inventory = getBoardGameInventory();
  const overrides = overridesSchema.parse(JSON.parse(readFileSync('research/coverage/identity-overrides.json', 'utf8')));
  const rules = getCatalog();
  const ids = new Set(inventory.games.map(game => game.bggId));
  if (ids.size !== inventory.games.length) throw new Error('Duplicate board game identity');
  for (const override of overrides) {
    if (!rules.some(rule => rule.id === override.ruleId)) continue;
    if (override.inventoryIds.some(id => !ids.has(id))) throw new Error(`Unknown board game identity for ${override.ruleId}`);
  }
  const byName = new Map<string, string[]>();
  for (const game of inventory.games) {
    const key = nameKey(game.name);
    byName.set(key, [...(byName.get(key) ?? []), game.bggId]);
  }
  const byRule = new Map(inventory.games.map(game => [game.bggId, [] as typeof rules]));
  const overridesByRule = new Map(overrides.map(item => [item.ruleId, item.inventoryIds]));
  for (const rule of rules) {
    const explicit = overridesByRule.get(rule.id);
    const matches = explicit ?? [...new Set([rule.gameName, ...rule.aliases].flatMap(name => byName.get(nameKey(name)) ?? []))];
    if (matches.length > 1 && !explicit) throw new Error(`Ambiguous board game identity for ${rule.id}: ${matches.join(', ')}; add an explicit identity override`);
    for (const id of matches) byRule.get(id)!.push(rule);
  }
  return inventory.games.map(game => ({ name: game.name, bggId: game.bggId, discoveryUrl: game.discoveryUrl, rules: byRule.get(game.bggId)! }));
}
