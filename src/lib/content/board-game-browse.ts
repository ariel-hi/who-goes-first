import { getBoardGames } from './board-games';

export type BoardGame = ReturnType<typeof getBoardGames>[number];
export const BROWSE_PAGE_SIZE = 180;

export function browseLetter(name: string) {
  const first = name.normalize('NFKD').replace(/\p{M}/gu, '').charAt(0).toUpperCase();
  return /^[A-Z]$/.test(first) ? first.toLowerCase() : /^\d$/.test(first) ? '0-9' : 'other';
}

export function boardGameHref(game: BoardGame) {
  return game.rules.length === 1 ? `/games/${game.rules[0]!.slug}/`
    : game.rules.length > 1 ? `/board-games/${game.routeKey}/`
    : game.reference?.url;
}

export function getBrowseShelves() {
  return buildBrowseShelves(getBoardGames());
}

export function buildBrowseShelves(input: readonly BoardGame[]) {
  const games = input.toSorted((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true })
    || (a.origin === 'legacy' && b.origin === 'legacy' ? Number(a.bggId) - Number(b.bggId) : a.identityId.localeCompare(b.identityId)));
  const byLetter = new Map<string, BoardGame[]>();
  for (const game of games) {
    const letter = browseLetter(game.name);
    const group = byLetter.get(letter) ?? [];
    group.push(game);
    byLetter.set(letter, group);
  }
  const letters = [...byLetter.keys()].toSorted((a, b) => a === '0-9' ? -1 : b === '0-9' ? 1 : a === 'other' ? 1 : b === 'other' ? -1 : a.localeCompare(b));
  const shelves = letters.flatMap(letter => {
    const group = byLetter.get(letter)!;
    return Array.from({ length: Math.ceil(group.length / BROWSE_PAGE_SIZE) }, (_, index) => ({
      letter,
      page: index + 1,
      games: group.slice(index * BROWSE_PAGE_SIZE, (index + 1) * BROWSE_PAGE_SIZE),
      total: group.length,
    }));
  });
  return { games, letters: letters.map(letter => ({ letter, count: byLetter.get(letter)!.length, pages: Math.ceil(byLetter.get(letter)!.length / BROWSE_PAGE_SIZE) })), shelves };
}

export const shelfHref = (letter: string, page = 1) => `/board-games/browse/${letter}/${page}/`;
export const shelfLabel = (letter: string) => letter === '0-9' ? '0–9' : letter === 'other' ? 'Other' : letter.toUpperCase();
