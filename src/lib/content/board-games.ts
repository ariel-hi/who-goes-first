import { readFileSync } from 'node:fs';
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

export function getBoardGames() {
  const inventory = inventorySchema.parse(JSON.parse(readFileSync('research/coverage/discovery-index.json', 'utf8')));
  const overrides = overridesSchema.parse(JSON.parse(readFileSync('research/coverage/identity-overrides.json', 'utf8')));
  const rules = getCatalog();
  const ids = new Set(inventory.games.map(game => game.bggId));
  if (ids.size !== inventory.games.length) throw new Error('Duplicate board game identity');
  for (const override of overrides) {
    if (!rules.some(rule => rule.id === override.ruleId)) continue;
    if (override.inventoryIds.some(id => !ids.has(id))) throw new Error(`Unknown board game identity for ${override.ruleId}`);
  }
  return inventory.games.map(game => ({
    name: game.name,
    bggId: game.bggId,
    discoveryUrl: game.discoveryUrl,
    rules: rules.filter(rule => {
      const override = overrides.find(item => item.ruleId === rule.id);
      return override ? override.inventoryIds.includes(game.bggId) : [rule.gameName, ...rule.aliases].some(name => nameKey(name) === nameKey(game.name));
    }),
  }));
}
