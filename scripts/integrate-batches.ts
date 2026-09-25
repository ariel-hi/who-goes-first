// Folds research batch manifests (research/claude-batches/*.json) into the shared indexes:
// adds new BoardGameGeek identities to the directory inventory and portable criteria to
// the random-rule pool. Safe to re-run; entries already present are left alone.
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { z } from 'zod';
import { contentRevision, publicRule, ruleSchema } from '../src/lib/content/schema';
import { randomRuleRevision } from '../src/lib/content/random-rules';

const manifest = z.array(z.object({ id: z.string(), name: z.string(), bggId: z.string().regex(/^\d+$/).nullable().optional(), random: z.boolean() }).loose());
const inventoryPath = 'research/coverage/discovery-index.json';
const poolPath = 'src/content/random-rule-pool.json';
const inventory = JSON.parse(readFileSync(inventoryPath, 'utf8'));
const pool = JSON.parse(readFileSync(poolPath, 'utf8'));
const nameKey = (name: string) => name.normalize('NFKD').replace(/\p{M}/gu, '').toLocaleLowerCase('en').replace(/[^\p{L}\p{N}]/gu, '');
const known = new Set<string>(inventory.games.map((game: { bggId: string }) => game.bggId));
let added = 0, pooled = 0, repaired = 0;

for (const file of readdirSync('research/claude-batches').filter(name => name.endsWith('.json') && name !== 'targets.json').sort()) {
  for (const entry of manifest.parse(JSON.parse(readFileSync(`research/claude-batches/${file}`, 'utf8')))) {
    const path = `src/content/games/${entry.id}.json`;
    if (!existsSync(path)) { console.warn(`${file}: ${entry.id} has no published record; skipped`); continue; }
    let record = ruleSchema.parse(JSON.parse(readFileSync(path, 'utf8')));
    // HTML-escaped ampersands copied from a page break source links.
    if (record.sources.some(source => source.url.includes('&amp;'))) {
      const fixed = { ...record, sources: record.sources.map(source => ({ ...source, url: source.url.replaceAll('&amp;', '&') })) };
      record = ruleSchema.parse({ ...fixed, approvedRevision: contentRevision(fixed) });
      writeFileSync(path, JSON.stringify(record, null, 2) + '\n');
      repaired++;
    }
    if (entry.name !== record.gameName) console.warn(`${entry.id}: manifest name "${entry.name}" differs from "${record.gameName}"`);
    if (entry.bggId && !known.has(entry.bggId) && !inventory.games.some((game: { name: string }) => nameKey(game.name) === nameKey(record.gameName))) {
      inventory.games.push({ name: record.gameName, bggId: entry.bggId, discoveryUrl: `https://boardgamegeek.com/boardgame/${entry.bggId}`, status: 'needs-primary-source' });
      known.add(entry.bggId); added++;
    }
    if (entry.random && !pool.revisions[record.id]) { pool.revisions[record.id] = randomRuleRevision(publicRule(record)); pooled++; }
  }
}
writeFileSync(inventoryPath, JSON.stringify(inventory, null, 2) + '\n');
writeFileSync(poolPath, JSON.stringify(pool, null, 2) + '\n');
console.log(`Integrated batches: ${added} new directory games, ${pooled} new random-mix rules, ${repaired} source links repaired.`);
