/**
 * Weekly: offer a few more rule pages to search engines.
 *
 * Adds up to graduationPolicy.weeklyLimit rule pages that pass the depth check to
 * src/lib/indexed-rules.json, never exceeding graduationPolicy.maxIndexedRules. The workflow commits
 * the change without [skip ci] so Cloudflare Pages deploys it; IndexNow then hears about the newly
 * indexable pages through the existing publish notification.
 *
 * Usage: npx tsx scripts/indexing-graduate.ts [--dry-run]
 */
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { getCatalog } from '../src/lib/content/catalog';
import { graduationCandidates, graduationPolicy, ruleDepth, type IndexedRule } from '../src/lib/indexing-policy';

const file = 'src/lib/indexed-rules.json';
const dryRun = process.argv.includes('--dry-run');
const data = JSON.parse(readFileSync(file, 'utf8')) as { note: string; rules: IndexedRule[] };
const indexed = new Set(data.rules.map(rule => rule.slug));
const catalog = getCatalog();
const published = new Set(catalog.map(rule => rule.slug));

// Drop entries whose rule page no longer exists, so the list never points at removed pages.
const removed = data.rules.filter(rule => !published.has(rule.slug));
data.rules = data.rules.filter(rule => published.has(rule.slug));
for (const rule of removed) indexed.delete(rule.slug);

const room = Math.max(0, Math.min(graduationPolicy.weeklyLimit, graduationPolicy.maxIndexedRules - data.rules.length));
const candidates = graduationCandidates(catalog, indexed);
const today = new Date().toISOString().slice(0, 10);
const added = candidates.slice(0, room).map(rule => ({ slug: rule.slug, addedAt: today, reason: `depth ${ruleDepth(rule)} words` }));
data.rules.push(...added);

const lines = [
  `# Indexing graduation ${today}`,
  '',
  `- Indexable rule pages: ${data.rules.length} (ceiling ${graduationPolicy.maxIndexedRules}).`,
  `- Added this run: ${added.length}${added.length ? '' : room ? ' (no remaining page passes the depth check)' : ' (ceiling reached)'}.`,
  `- Still eligible after this run: ${Math.max(0, candidates.length - added.length)}.`,
  ...(removed.length ? [`- Removed ${removed.length} entries whose rule page no longer exists: ${removed.map(rule => rule.slug).join(', ')}.`] : []),
  ...added.map(rule => `  - /games/${rule.slug}/ (${rule.reason})`),
  '',
].join('\n');
console.log(lines);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines);
if (!dryRun && (added.length || removed.length)) writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
