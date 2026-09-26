import { readFileSync } from 'node:fs';
import { getBoardGames, getBoardGameRegistry } from '../src/lib/content/board-games';
import { readRecords } from '../src/lib/content/catalog';
import { ruleSchema } from '../src/lib/content/schema';
import { validateLegacyOverrideReferences } from '../src/lib/content/identity-assignments';

// Validate historical overrides against their complete catalog/research union.
// Public resolution remains independent of ambiguous unpublished title leads.
const approved = readRecords('src/content/games').map(rule => ruleSchema.parse(rule));
const byId = new Map(readRecords('research/games').map(rule => { const parsed = ruleSchema.parse(rule); return [parsed.id, parsed] as const; }));
for (const rule of approved) byId.set(rule.id, rule);
validateLegacyOverrideReferences(getBoardGameRegistry(), [...byId.values()], JSON.parse(readFileSync('research/coverage/identity-overrides.json', 'utf8')));
getBoardGames(); // Canonical resolver: exact accepted assignments, strong publication lifecycle.
console.log('Identity audit passed: complete legacy references and unambiguous approved attachments.');
