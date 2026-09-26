import { readFileSync } from 'node:fs';
import { getBoardGameInventory } from '../src/lib/content/board-games';
import { getCatalog } from '../src/lib/content/catalog';
const key = (name: string) => name.normalize('NFKD').replace(/\p{M}/gu, '').toLocaleLowerCase('en').replace(/[^\p{L}\p{N}]/gu, '');
const games = getBoardGameInventory().games;
const byName = new Map<string, string[]>();
for (const game of games) byName.set(key(game.name), [...(byName.get(key(game.name)) ?? []), game.bggId]);
const overrides = JSON.parse(readFileSync('research/coverage/identity-overrides.json', 'utf8')) as { ruleId: string }[];
const explicit = new Set(overrides.map(item => item.ruleId));
let ambiguous = 0;
for (const rule of getCatalog()) {
  if (explicit.has(rule.id)) continue;
  const matches = [...new Set([rule.gameName, ...rule.aliases].flatMap(name => byName.get(key(name)) ?? []))];
  if (matches.length > 1) {
    ambiguous++;
    console.log(`${rule.id}\t${matches.map(id => `${id} ${games.find(game => game.bggId === id)!.name}`).join(' | ')}`);
  }
}
if (ambiguous) process.exitCode = 1;
else console.log('Identity audit passed: no approved rule has an ambiguous automatic identity match.');
