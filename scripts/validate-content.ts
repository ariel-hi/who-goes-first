import { getCatalog, getPrompts, readRecords } from '../src/lib/content/catalog';
import { ruleSchema, promptSchema } from '../src/lib/content/schema';
import { validateRuleImageAsset } from '../src/lib/content/image-assets';
import { randomRuleRevision } from '../src/lib/content/random-rules';
import randomRulePool from '../src/content/random-rule-pool.json';
import { readFileSync } from 'node:fs';
import { getBoardGames, getBoardGameRegistry } from '../src/lib/content/board-games';
import { resolveResearchIdentityAssignments, validateLegacyOverrideReferences } from '../src/lib/content/identity-assignments';
const games = getCatalog(); const prompts = getPrompts();
for (const game of games) {
  await validateRuleImageAsset(game.image);
  for (const image of game.additionalImages ?? []) await validateRuleImageAsset(image);
}
for (const group of [games, prompts]) {
  if (new Set(group.map(record => record.id)).size !== group.length) throw new Error('Duplicate public content ID');
}
if (new Set(games.map(record => record.slug)).size !== games.length) throw new Error('Duplicate public slug');
const drafts = readRecords('research/games').map(record => ruleSchema.parse(record));
const questions = readRecords('research/prompts').map(record => promptSchema.parse(record));
for (const group of [drafts, questions]) {
  if (new Set(group.map(record => record.id)).size !== group.length || new Set(group.map(record => record.slug)).size !== group.length) throw new Error('Duplicate draft identity');
}
// Validate complete historical references without resolving unpublished title
// leads as public identities. Accepted publication assignments are never filtered.
const allRules = new Map(drafts.map(rule => [rule.id, rule]));
for (const rule of readRecords('src/content/games').map(record => ruleSchema.parse(record))) allRules.set(rule.id, rule);
const identities = getBoardGameRegistry();
validateLegacyOverrideReferences(identities, [...allRules.values()], JSON.parse(readFileSync('research/coverage/identity-overrides.json', 'utf8')));
getBoardGames();
const gameById = new Map(games.map(game => [game.id, game]));
// Published IDs cannot be reassigned via lifecycle-null research counterparts.
// This validates explicit associations only, never ambiguous research titles.
resolveResearchIdentityAssignments(identities, drafts.filter(draft => !gameById.has(draft.id)), JSON.parse(readFileSync('research/coverage/draft-identity-assignments.json', 'utf8')));
for (const [id, expectedRevision] of Object.entries(randomRulePool.revisions)) {
  const game = gameById.get(id);
  if (!game) throw new Error(`${id}: random-rule pool refers to a missing approved game`);
  if (randomRuleRevision(game) !== expectedRevision) throw new Error(`${id}: random-rule pool revision is stale`);
}
console.log(`Valid: ${games.length} approved game rules; ${Object.keys(randomRulePool.revisions).length} usable random rules; ${prompts.length} approved prompts; ${drafts.length} rule drafts; ${questions.length} prompt drafts. Drafts are not publication permission.`);
