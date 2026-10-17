import type { PublicRule } from './schema';

const family = (name: string) => name.split(':', 1)[0]!.trim().toLocaleLowerCase('en');

// Reviewed navigation only: keep each variant's own rule and edition intact.
// Bicycle's Rummy page links Gin Rummy and 500 Rum as related games:
// https://bicyclecards.com/how-to-play/rummy-rum (checked 2026-10-17).
const relatedGroups: readonly (readonly string[])[] = [
  ['rummy-bicycle-en', 'gin-rummy-bicycle-en', '500-rum-bicycle-en'],
];

/** Neighbours of a rule in the catalog, computed once per build. */
export function ruleContext(catalog: PublicRule[], rule: PublicRule) {
  const group = relatedGroups.find(ids => ids.includes(rule.id));
  return {
    related: catalog.filter(game => game.id !== rule.id && (group?.includes(game.id) || family(game.gameName) === family(rule.gameName))).slice(0, 5),
    // Edition details only go in the title when several entries share a game name.
    shared: catalog.filter(game => game.gameName === rule.gameName).length > 1,
  };
}
