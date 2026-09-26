import { boardGameHref, getBrowseShelves, type BoardGame } from '../../lib/content/board-game-browse';
import { uniqueDirectorySearchTerms } from '../../lib/search';

export function directorySearchEntries(games: readonly BoardGame[]) {
  return games.map(game => {
    const terms = uniqueDirectorySearchTerms(game.name, [...game.searchNames, ...game.rules.flatMap(rule => [...rule.aliases, rule.editionLabel])]);
    return {
      name: game.name,
      id: game.routeKey,
      ruleCount: game.rules.length,
      ...(game.rules.length === 1 ? { slug: game.rules[0]!.slug } : {}),
      ...(terms.length ? { terms } : {}),
      ...(game.origin === 'publisher' ? {
        ...(game.rules.length ? { href: boardGameHref(game) } : {}),
        ...(game.reference ? { reference: game.reference } : {}),
        ...(game.bggId ? { bggId: game.bggId } : {}),
      } : {}),
    };
  });
}
export function GET() {
  const games = directorySearchEntries(getBrowseShelves().games);
  return new Response(JSON.stringify(games), { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=300, must-revalidate' } });
}
