import { createHash } from 'node:crypto';
import type { PublicRule } from '../../src/lib/content/schema';

/**
 * One rule per UTC day, in a fixed shuffled order so consecutive posts aren't
 * alphabetical neighbours. Stateless: the date alone decides, so a re-run on the
 * same day picks the same rule and a missed day simply skips one.
 */
export function ruleForDay(pool: PublicRule[], date: Date): PublicRule | undefined {
  if (!pool.length) return undefined;
  const order = pool.toSorted((a, b) => rank(a.id).localeCompare(rank(b.id)));
  const day = Math.floor(date.getTime() / 86_400_000);
  return order[day % order.length];
}
const rank = (id: string) => createHash('sha256').update(`wgf-daily:${id}`).digest('hex');

const graphemes = (text: string) => [...new Intl.Segmenter('en', { granularity: 'grapheme' }).segment(text)].length;
/** Post text within a platform's grapheme limit, trimmed at a word boundary. */
export function postText(rule: PublicRule, limit: number, suffix = ''): string {
  const full = `Who goes first in ${rule.gameName}? ${rule.firstPlayerRule}`;
  const room = limit - graphemes(suffix);
  if (graphemes(full) <= room) return full + suffix;
  const words = full.split(' '); let text = '';
  for (const word of words) { if (graphemes(`${text} ${word}…`) > room) break; text = text ? `${text} ${word}` : word; }
  return `${text.replace(/[\s,;:.–—-]+$/, '')}…${suffix}`;
}
