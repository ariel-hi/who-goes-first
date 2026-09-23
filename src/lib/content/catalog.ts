import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { assertPublishable, promptSchema, publicRule, ruleSchema } from './schema';
export function readRecords(directory: string): unknown[] {
  return readdirSync(directory).filter(name => name.endsWith('.json')).sort().map(name => JSON.parse(readFileSync(join(directory, name), 'utf8')) as unknown);
}
// Production imports only these explicit approved-content directories.
export function getCatalog() {
  return readRecords('src/content/games').map(record => {
    const parsed = ruleSchema.parse(record); assertPublishable(parsed); return publicRule(parsed);
  }).sort((a, b) => a.gameName.localeCompare(b.gameName));
}
export function getPrompts() {
  return readRecords('src/content/prompts').flatMap(record => Array.isArray(record) ? record : [record]).map(record => {
    const parsed = promptSchema.parse(record); assertPublishable(parsed); return { id: parsed.id, prompt: parsed.prompt };
  });
}
