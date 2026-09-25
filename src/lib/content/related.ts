import type { PublicRule } from './schema';

const family = (name: string) => name.split(':', 1)[0]!.trim().toLocaleLowerCase('en');

/** Neighbours of a rule in the catalog, computed once per build. */
export function ruleContext(catalog: PublicRule[], rule: PublicRule) {
  return {
    related: catalog.filter(game => game.id !== rule.id && family(game.gameName) === family(rule.gameName)).slice(0, 5),
    // Edition details only go in the title when several entries share a game name.
    shared: catalog.filter(game => game.gameName === rule.gameName).length > 1,
  };
}
