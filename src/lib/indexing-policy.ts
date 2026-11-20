/**
 * Search indexing policy.
 *
 * Search Console showed sitewide impressions collapsing on 12-13 October 2026, days after Google's
 * September 2026 spam update finished, with even core tool pages moved to "Crawled - currently not
 * indexed". About 1,350 templated rule pages had launched in late September. Since then only the rule
 * pages listed in indexed-rules.json are offered for indexing. Every other rule page stays published and
 * linked for visitors but carries `noindex, follow` and is left out of the sitemaps.
 *
 * The list grows slowly and automatically: scripts/indexing-graduate.ts adds at most
 * `graduationPolicy.weeklyLimit` pages a week that pass `graduationCandidates` below. The build refuses
 * to ship more than `graduationPolicy.maxIndexedRules` indexable rules (scripts/audit-build.ts), so a bulk
 * change cannot silently recreate the October problem. See research/demand/indexing-recovery-2026-11.md.
 */
import indexedRules from './indexed-rules.json';

export type IndexedRule = { slug: string; addedAt: string; reason: string };
export const indexedRuleEntries: readonly IndexedRule[] = indexedRules.rules;
export const indexedRuleSlugs: ReadonlySet<string> = new Set(indexedRuleEntries.map(rule => rule.slug));
export const isRuleIndexed = (slug: string) => indexedRuleSlugs.has(slug);
/** Publisher hubs are thin listings of rule links; keep them for navigation only. */
export const publisherHubsIndexed = false;

export const graduationPolicy = {
  /** New rule pages offered to search engines per weekly run. */
  weeklyLimit: 10,
  /** Game-specific words a rule page needs before it is offered for indexing. */
  minimumDepth: 80,
  /** Hard ceiling on indexable rule pages; the build audit fails above it. */
  maxIndexedRules: 400,
} as const;

/** Home page and standalone tools: these must always stay indexable. */
export const corePaths = ['/', '/coin-flip/', '/random-number-generator/', '/ways-to-pick-who-goes-first/', '/choose-who-goes-first/', '/card-draw/', '/finger-chooser/', '/dice-roller/', '/random-team-generator/', '/tools/'] as const;

type DepthFields = { slug: string; gameName: string; firstPlayerRule: string; officialTieBreak?: unknown; clarifications?: unknown; interpretation?: unknown; sources: readonly unknown[] };
const countWords = (value: unknown): number => {
  if (typeof value === 'string') return value.split(/\s+/).filter(Boolean).length;
  if (Array.isArray(value)) return value.reduce((total: number, item) => total + countWords(item), 0);
  if (value && typeof value === 'object') return Object.values(value).reduce((total: number, item) => total + countWords(item), 0);
  return 0;
};
/**
 * Words written for this game specifically: the answer, the official tie-break, clarifications and
 * interpretation. Shared template text (house fallback, share and affiliate blocks) is excluded.
 */
export const ruleDepth = (rule: DepthFields) => countWords(rule.firstPlayerRule) + countWords(rule.officialTieBreak) + countWords(rule.clarifications) + countWords(rule.interpretation);

const gameKey = (name: string) => name.toLocaleLowerCase('en').replace(/[^a-z0-9]+/g, ' ').trim();
/**
 * Rule pages eligible to be offered next, deepest first. One edition per game title: another edition
 * of an already indexed game would be a near-duplicate.
 */
export function graduationCandidates<T extends DepthFields>(catalog: readonly T[], indexed: ReadonlySet<string> = indexedRuleSlugs) {
  const indexedGames = new Set(catalog.filter(rule => indexed.has(rule.slug)).map(rule => gameKey(rule.gameName)));
  const seen = new Set<string>();
  return catalog
    .filter(rule => !indexed.has(rule.slug) && rule.sources.length > 0 && ruleDepth(rule) >= graduationPolicy.minimumDepth && !indexedGames.has(gameKey(rule.gameName)))
    .sort((a, b) => ruleDepth(b) - ruleDepth(a) || a.slug.localeCompare(b.slug))
    .filter(rule => { const key = gameKey(rule.gameName); if (seen.has(key)) return false; seen.add(key); return true; });
}
