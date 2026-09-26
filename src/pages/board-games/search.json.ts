import { getBrowseShelves } from '../../lib/content/board-game-browse';

export function GET() {
  const games = getBrowseShelves().games.map(game => ({
    name: game.name,
    id: game.bggId,
    ruleCount: game.rules.length,
    ...(game.rules.length === 1 ? { slug: game.rules[0]!.slug } : {}),
    ...(game.rules.length ? { terms: [...new Set(game.rules.flatMap(rule => [...rule.aliases, rule.editionLabel]))].filter(term => term !== game.name) } : {}),
  }));
  return new Response(JSON.stringify(games), { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}
