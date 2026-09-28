import { createHash } from 'node:crypto';
import review from '../../content/random-rule-pool.json';
import type { PublicRule } from './schema';

// The pool is deliberately opt-in. New entries and changed sources/answers stay
// searchable, but cannot become a suggested way to choose a player by accident.
export function randomRuleRevision(rule: PublicRule): string {
  // Artwork and its review date cannot change who starts; only rule-bearing
  // fields should invalidate an approved portable starting rule.
  const content = Object.entries(rule).filter(([key]) => !['materiallyUpdatedAt', 'image', 'additionalImages'].includes(key)).sort(([a], [b]) => a.localeCompare(b));
  return createHash('sha256').update(JSON.stringify(content)).digest('hex');
}

export function randomRuleEligible(rule: PublicRule): boolean {
  return (review.revisions as Record<string, string>)[rule.id] === randomRuleRevision(rule);
}
