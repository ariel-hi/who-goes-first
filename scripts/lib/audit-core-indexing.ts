import type { PublicRule } from '../../src/lib/content/schema';
import { randomRuleEligible } from '../../src/lib/content/random-rules';

/** Match the Ways page's empty-state policy using the actual catalog under audit. */
export function auditCorePageIndexing(path: string, html: string, catalog: readonly PublicRule[]): void {
  if (path === '/ways-to-pick-who-goes-first/' && !catalog.some(randomRuleEligible)) {
    if (!html.includes('content="noindex, follow"')) throw new Error('Empty Ways page must be noindex');
    return;
  }
  if (!html.includes('content="index, follow"')) throw new Error(`Core page is not indexable: ${path}`);
}
