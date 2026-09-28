import { getBoardGames } from './board-games';
import { getCatalog } from './catalog';

/** Counts for the public directory and rule catalog, keyed by reviewed identities. */
export function getPublicCounts() {
  const boardGames = getBoardGames();
  const rules = getCatalog();
  const identitiesWithRules = boardGames.filter(game => game.rules.length > 0).length;
  return {
    boardGames,
    rules,
    identities: boardGames.length,
    identitiesWithRules,
    identitiesAwaitingRules: boardGames.length - identitiesWithRules,
    ruleEditions: rules.length,
  };
}
