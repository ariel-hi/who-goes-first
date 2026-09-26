import { uniqueDirectorySearchTerms } from '../search';
import { getBoardGames } from './board-games';
import type { BoardGame } from './board-game-browse';

// Follow existing approved identity assignments. These terms improve discovery;
// they never participate in assigning rules or change an approved rule record.
export function getRuleSearchAliases(): ReadonlyMap<string, string[]> {
  return buildRuleSearchAliases(getBoardGames());
}
export function buildRuleSearchAliases(games: readonly BoardGame[]): ReadonlyMap<string, string[]> {
  const aliases = new Map<string, string[]>();
  for (const game of games) for (const rule of game.rules) {
    const current = aliases.get(rule.id) ?? [...rule.aliases];
    aliases.set(rule.id, [...current, ...uniqueDirectorySearchTerms(rule.gameName, [...current, ...game.searchNames]).filter(term => !current.includes(term))]);
  }
  return aliases;
}
