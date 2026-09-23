import { createHash } from 'node:crypto';
import review from '../../content/random-rule-pool.json';
import type { PublicRule } from './schema';

// The pool is deliberately opt-in. New entries and changed sources/answers stay
// searchable, but cannot become a suggested way to choose a player by accident.
export function randomRuleRevision(rule: PublicRule): string {
  const content = Object.entries(rule).filter(([key]) => key !== 'materiallyUpdatedAt').sort(([a], [b]) => a.localeCompare(b));
  return createHash('sha256').update(JSON.stringify(content)).digest('hex');
}

export function randomRuleEligible(rule: PublicRule): boolean {
  return (review.revisions as Record<string, string>)[rule.id] === randomRuleRevision(rule);
}
