import { readFileSync } from 'node:fs';
import { getPublishableRuleRecords, readRecords } from './catalog';
import { publicRule, ruleSchema, type RuleRecord } from './schema';
import { getBoardGameInventory, getBoardGameRegistry, buildBoardGames } from './board-games';
import { resolveIdentityAssignments, resolveResearchIdentityAssignments, scopeLegacyOverrides, validateLegacyOverrideReferences } from './identity-assignments';
import type { RegistryIdentity } from './identity-registry';

/** Server-only researched coverage. Association review is not publication approval. */
export function buildCoverage(identities: readonly RegistryIdentity[], approved: readonly RuleRecord[], research: readonly RuleRecord[], overrides: unknown, assignments: unknown, researchAssignments: unknown) {
  const approvedIds = new Set(approved.map(rule => rule.id));
  const drafts = research.filter(rule => !approvedIds.has(rule.id));
  const all = [...approved, ...drafts];
  validateLegacyOverrideReferences(identities, all, overrides);
  const published = buildBoardGames(identities, approved, overrides, assignments);
  const legacyDrafts = resolveIdentityAssignments(identities, drafts, scopeLegacyOverrides(overrides, drafts), { formatVersion: 1, records: [] });
  const publisherDrafts = resolveResearchIdentityAssignments(identities, drafts, researchAssignments);
  const rules = [...approved.map(rule => ({ ...publicRule(rule), href: `/games/${rule.slug}/` })), ...drafts.map(rule => ({ ...rule, href: `/dev/rules/${rule.slug}/` }))];
  const byId = new Map(identities.map(identity => [identity.identityId, [] as typeof rules]));
  const ruleById = new Map(rules.map(rule => [rule.id, rule]));
  for (const game of published) for (const rule of game.rules) byId.get(game.identityId)!.push(ruleById.get(rule.id)!);
  for (const draft of drafts) {
    const legacy = legacyDrafts.get(draft.id) ?? [], publisher = publisherDrafts.get(draft.id) ?? [];
    if (legacy.length && publisher.length) throw new Error(`Conflicting legacy and publisher research association: ${draft.id}`);
    for (const id of [...legacy, ...publisher]) byId.get(id)!.push(ruleById.get(draft.id)!);
  }
  const games = identities.map(identity => ({ ...identity, discoveryUrl: identity.origin === 'legacy' ? identity.reference?.url : undefined, editions: byId.get(identity.identityId)! }));
  const researched = games.filter(game => game.editions.length > 0).length;
  return { games, researched, pending: games.length - researched, ruleCount: rules.length };
}

export function getCoverage() {
  const inventory = getBoardGameInventory();
  const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'));
  return { ...inventory, ...buildCoverage(getBoardGameRegistry(), getPublishableRuleRecords(),
    readRecords('research/games').map(rule => ruleSchema.parse(rule)), read('research/coverage/identity-overrides.json'),
    read('research/coverage/identity-assignments.json'), read('research/coverage/draft-identity-assignments.json')) };
}
