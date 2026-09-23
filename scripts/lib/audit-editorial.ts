import { assertPublishable, type PromptRecord, type RuleRecord } from '../../src/lib/content/schema';

/** A shared generic answer is public only when an exact approved record uses it.
 * Page existence alone must never authorize a research draft for publication.
 */
export function editorialGuard(approvedRules: RuleRecord[], approvedPrompts: PromptRecord[], researchRules: RuleRecord[], researchPrompts: PromptRecord[]) {
  for (const record of [...approvedRules, ...approvedPrompts]) assertPublishable(record);
  const publicSlugs = new Set(approvedRules.map(record => record.slug));
  const publicAnswers = new Set(approvedRules.map(record => record.firstPlayerRule));
  const publicPrompts = new Set(approvedPrompts.map(record => record.prompt));
  const markers = [...new Set([
    'internalEvidence', 'internalReviewNotes', 'approvedBy', 'approvedRevision',
    '/dev/review', '/dev/rules/', '/dev/games', '/dev/house-rules', '/dev/coverage',
    'discovery-index.json', 'needs-primary-source',
    ...[...approvedRules, ...researchRules].map(record => record.internalEvidence),
    ...[...approvedPrompts, ...researchPrompts].map(record => record.internalReviewNotes),
    ...researchRules.filter(record => !publicAnswers.has(record.firstPlayerRule)).map(record => record.firstPlayerRule),
    ...researchPrompts.filter(record => !publicPrompts.has(record.prompt)).map(record => record.prompt),
  ])];
  return (file: string, text: string) => {
    const article = /^games\/([^/]+)\/index\.html$/.exec(file);
    if (article && !publicSlugs.has(article[1]!)) throw new Error(`Unapproved game page: ${file}`);
    for (const marker of markers) {
      if (text.includes(marker)) throw new Error(`Private content leaked in ${file}: ${marker.slice(0, 40)}`);
    }
  };
}
