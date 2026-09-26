import { getBrowseShelves } from '../../lib/content/board-game-browse';
import { uniqueDirectorySearchTerms } from '../../lib/search';

export function GET() {
  const games = getBrowseShelves().games.map(game => {
    const terms = uniqueDirectorySearchTerms(game.name, [...game.searchNames, ...game.rules.flatMap(rule => [...rule.aliases, rule.editionLabel])]);
    return {
      name: game.name,
      id: game.bggId,
      ruleCount: game.rules.length,
      ...(game.rules.length === 1 ? { slug: game.rules[0]!.slug } : {}),
      ...(terms.length ? { terms } : {}),
    };
  });
  return new Response(JSON.stringify(games), { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=300, must-revalidate' } });
}
