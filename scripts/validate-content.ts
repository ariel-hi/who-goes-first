import { getCatalog, getPrompts, readRecords } from '../src/lib/content/catalog';
import { ruleSchema, promptSchema } from '../src/lib/content/schema';
const games = getCatalog(); const prompts = getPrompts();
for (const group of [games, prompts]) {
  if (new Set(group.map(record => record.id)).size !== group.length) throw new Error('Duplicate public content ID');
}
if (new Set(games.map(record => record.slug)).size !== games.length) throw new Error('Duplicate public slug');
const drafts = readRecords('research/games').map(record => ruleSchema.parse(record));
const questions = readRecords('research/prompts').map(record => promptSchema.parse(record));
for (const group of [drafts, questions]) {
  if (new Set(group.map(record => record.id)).size !== group.length || new Set(group.map(record => record.slug)).size !== group.length) throw new Error('Duplicate draft identity');
}
console.log(`Valid: ${games.length} approved game rules; ${prompts.length} approved prompts; ${drafts.length} rule drafts; ${questions.length} prompt drafts. Drafts are not publication permission.`);
