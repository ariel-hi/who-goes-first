import { readRecords } from '../src/lib/content/catalog';
import { contentRevision, ruleSchema, promptSchema } from '../src/lib/content/schema';
for (const [directory, schema] of [['research/games', ruleSchema], ['research/prompts', promptSchema]] as const) {
  for (const raw of readRecords(directory)) {
    const record = schema.parse(raw);
    console.log(`${record.id} | ${record.status}\nRevision to review: ${contentRevision(record)}\n`);
  }
}
console.log('No approval has been created. Review the source and exact revision, then follow CONTENT_REVIEW.md.');
