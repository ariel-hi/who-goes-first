import { readFileSync } from 'node:fs';
import { z } from 'zod';
import { getCatalog, readRecords } from './catalog';
import { ruleSchema } from './schema';
import { getBoardGameInventory } from './board-games';

const discoverySchema = z.object({
  discoveredAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  indexSource: z.url(), scope: z.string().min(1),
  games: z.array(z.object({
    name: z.string().min(1), bggId: z.string().regex(/^\d+$/),
    discoveryUrl: z.url().refine(url => new URL(url).hostname === 'boardgamegeek.com'),
    status: z.literal('needs-primary-source'),
  }).strict()),
}).strict();
const key = (name: string) => name.normalize('NFKD').replace(/\p{M}/gu, '').toLocaleLowerCase('en').replace(/[^\p{L}\p{N}]/gu, '');
const identityOverrideSchema = z.array(z.object({
  ruleId: z.string().min(1), inventoryIds: z.array(z.string().regex(/^\d+$/)), reason: z.string().min(1),
}).strict());

// Server-only, imported exclusively by development routes and the review CLI.
// A matched name means at least one edition is researched, never every edition.
export function getCoverage() {
  const inventory = discoverySchema.parse(getBoardGameInventory());
  if (new Set(inventory.games.map(game => game.bggId)).size !== inventory.games.length) throw new Error('Duplicate discovery identity');
  const drafts = readRecords('research/games').map(rule => ruleSchema.parse(rule));
  const rules = [
    ...getCatalog().map(rule => ({ ...rule, href: `/games/${rule.slug}/` })),
    ...drafts.map(rule => ({ ...rule, href: `/dev/rules/${rule.slug}/` })),
  ].filter((rule, index, all) => all.findIndex(other => other.id === rule.id) === index);
  const overrides = identityOverrideSchema.parse(JSON.parse(readFileSync('research/coverage/identity-overrides.json', 'utf8')));
  if (new Set(overrides.map(item => item.ruleId)).size !== overrides.length) throw new Error('Duplicate identity override');
  for (const item of overrides) {
    if (!rules.some(rule => rule.id === item.ruleId) || item.inventoryIds.some(id => !inventory.games.some(game => game.bggId === id))) throw new Error('Unknown identity override reference');
  }
  const byName = new Map<string, string[]>();
  for (const game of inventory.games) byName.set(key(game.name), [...(byName.get(key(game.name)) ?? []), game.bggId]);
  const byId = new Map(inventory.games.map(game => [game.bggId, [] as typeof rules]));
  const overrideMap = new Map(overrides.map(item => [item.ruleId, item.inventoryIds]));
  for (const rule of rules) {
    const explicit = overrideMap.get(rule.id);
    const matches = explicit ?? [...new Set([rule.gameName, ...rule.aliases].flatMap(name => byName.get(key(name)) ?? []))];
    if (matches.length > 1 && !explicit) throw new Error(`Ambiguous coverage identity for ${rule.id}: ${matches.join(', ')}`);
    for (const id of matches) byId.get(id)!.push(rule);
  }
  const games = inventory.games.map(game => ({ ...game, editions: byId.get(game.bggId)! }));
  const researched = games.filter(game => game.editions.length > 0).length;
  return { ...inventory, games, researched, pending: games.length - researched, ruleCount: rules.length };
}
