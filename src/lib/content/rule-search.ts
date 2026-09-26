import { uniqueDirectorySearchTerms } from '../search';
import { getBoardGames } from './board-games';

// Follow existing approved identity assignments. These terms improve discovery;
// they never participate in assigning rules or change an approved rule record.
export function getRuleSearchAliases(): ReadonlyMap<string, string[]> {
  return new Map(getBoardGames().flatMap(game => game.rules.map(rule => [
    rule.id,
    [...rule.aliases, ...uniqueDirectorySearchTerms(rule.gameName, [...rule.aliases, ...game.searchNames]).filter(term => !rule.aliases.includes(term))],
  ] as const)));
}
