import type { SearchRow } from './google-api';

export const words = (text: string) => text.normalize('NFKD').replace(/\p{M}/gu, '').toLocaleLowerCase('en').replace(/&/g, ' and ').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
// Queries that ask about starting a game. Other queries naming a game (reviews,
// prices) are not evidence that people want its starting rule.
const intent = /\b(who goes first|who starts|who plays first|goes first|go first|first player|starting player|start player|first turn|who begins|how to start|how do you start)\b/;

type Game = { name: string; bggId: string; hasRule: boolean };
export type Demand = {
  missingRules: { name: string; bggId: string; impressions: number; clicks: number; queries: string[] }[];
  unmatchedQueries: { query: string; impressions: number }[];
  lowClickPages: { page: string; impressions: number; clicks: number; ctr: number; position: number }[];
};

/**
 * Ranks board games without a sourced rule by search impressions for
 * starting-player queries that name them. Each query counts toward its longest
 * matching game name only, so "ticket to ride europe" isn't also "ticket to ride".
 * Very short single-word names ("go", "life") are skipped: they match too much.
 */
export function rankDemand(queryRows: SearchRow[], pageRows: SearchRow[], games: Game[], origin: string): Demand {
  const candidates = games.map(game => ({ ...game, key: words(game.name) })).filter(game => game.key.length >= 4 || game.key.includes(' ')).sort((a, b) => b.key.length - a.key.length);
  const missing = new Map<string, Demand['missingRules'][number]>();
  const unmatched = new Map<string, number>();
  for (const row of queryRows) {
    const query = words(row.keys[0] ?? '');
    if (!intent.test(query)) continue;
    const padded = ` ${query} `;
    const game = candidates.find(candidate => padded.includes(` ${candidate.key} `));
    if (!game) { unmatched.set(query, (unmatched.get(query) ?? 0) + row.impressions); continue; }
    if (game.hasRule) continue;
    const entry = missing.get(game.bggId) ?? { name: game.name, bggId: game.bggId, impressions: 0, clicks: 0, queries: [] };
    entry.impressions += row.impressions; entry.clicks += row.clicks;
    if (entry.queries.length < 5 && !entry.queries.includes(query)) entry.queries.push(query);
    missing.set(game.bggId, entry);
  }
  // Rule pages that already rank but rarely get chosen: their titles and
  // descriptions are the first thing to revisit.
  const lowClickPages = pageRows
    .filter(row => row.keys[0]?.startsWith(`${origin}/games/`) && row.impressions >= 50 && row.ctr < 0.02 && row.position <= 15)
    .map(row => ({ page: row.keys[0]!.slice(origin.length), impressions: row.impressions, clicks: row.clicks, ctr: Number(row.ctr.toFixed(4)), position: Number(row.position.toFixed(1)) }))
    .sort((a, b) => b.impressions - a.impressions).slice(0, 50);
  return {
    missingRules: [...missing.values()].sort((a, b) => b.impressions - a.impressions || a.name.localeCompare(b.name)),
    unmatchedQueries: [...unmatched].map(([query, impressions]) => ({ query, impressions })).sort((a, b) => b.impressions - a.impressions).slice(0, 100),
    lowClickPages,
  };
}
