import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

const key = (name: string) => name.normalize('NFKD').replace(/\p{M}/gu, '').toLocaleLowerCase('en').replace(/[^\p{L}\p{N}]/gu, '');
const games = readdirSync('src/content/games').filter(file => file.endsWith('.json')).map(file => JSON.parse(readFileSync(`src/content/games/${file}`, 'utf8')) as { id: string; gameName: string; aliases: string[] });
const targets = JSON.parse(readFileSync('research/claude-batches/targets.json', 'utf8')) as { name: string; rank: number | null; covered: boolean; coveredBy?: string; coverageMatch?: string }[];
for (const target of targets) {
  const match = games.find(game => [game.gameName, ...game.aliases].some(name => key(name) === key(target.name)));
  target.covered = !!match;
  delete target.coverageMatch;
  if (match) target.coveredBy = match.id;
  else delete target.coveredBy;
}
writeFileSync('research/claude-batches/targets.json', JSON.stringify(targets, null, 2) + '\n');
const missing = targets.filter(target => !target.covered).sort((a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity));
console.log(`${targets.length - missing.length}/${targets.length} targets covered; ${missing.length} remain.`);
console.log(missing.slice(0, 16).map(target => `${target.rank ?? 'classic'}: ${target.name}`).join('\n'));
