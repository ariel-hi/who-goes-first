import { expect, test } from 'vitest';
import { editorialGuard } from '../../scripts/lib/audit-editorial';
import { readRecords } from '../../src/lib/content/catalog';
import { contentRevision, promptSchema, ruleSchema, type RuleRecord } from '../../src/lib/content/schema';

const draft = ruleSchema.parse(readRecords('research/games')[0]);
const prompt = promptSchema.parse(readRecords('research/prompts')[0]);
const approval = (record: RuleRecord): RuleRecord => ({
  ...record, status: 'approved', approvedBy: 'AUTOMATED TEST FIXTURE', approvedRevision: contentRevision(record),
  publishedAt: '2026-09-19', materiallyUpdatedAt: '2026-09-19',
});
const publicRecord = approval({ ...draft, id: 'public-fixture', slug: 'public-fixture', firstPlayerRule: 'Choose the starting player randomly.' });
const privateRecord = { ...draft, id: 'private-fixture', slug: 'private-fixture', firstPlayerRule: publicRecord.firstPlayerRule };

test('an approved answer may match an unrelated unapproved draft', () => {
  const guard = editorialGuard([publicRecord], [], [privateRecord], []);
  expect(() => guard('games/public-fixture/index.html', publicRecord.firstPlayerRule)).not.toThrow();
  expect(() => guard('games/index.html', publicRecord.firstPlayerRule)).not.toThrow();
});

test('a built draft page cannot authorize itself, even with a shared approved answer', () => {
  const guard = editorialGuard([publicRecord], [], [privateRecord], []);
  expect(() => guard('games/private-fixture/index.html', publicRecord.firstPlayerRule)).toThrow('Unapproved game page');
});

test('draft-only answers and original prompts are still private', () => {
  const uniqueDraft = { ...privateRecord, firstPlayerRule: 'A unique unpublished fixture answer.' };
  const guard = editorialGuard([publicRecord], [], [uniqueDraft], [prompt]);
  expect(() => guard('games/index.html', uniqueDraft.firstPlayerRule)).toThrow('Private content leaked');
  expect(() => guard('_astro/fixture.js', prompt.prompt)).toThrow('Private content leaked');
});

test('internal evidence remains private even for approved records', () => {
  const guard = editorialGuard([publicRecord], [], [privateRecord], [prompt]);
  expect(() => guard('games/public-fixture/index.html', publicRecord.internalEvidence)).toThrow('Private content leaked');
  expect(() => guard('house-rules/index.html', prompt.internalReviewNotes)).toThrow('Private content leaked');
});

test('shared text cannot be authorized with draft or stale approval metadata', () => {
  expect(() => editorialGuard([privateRecord], [], [], [])).toThrow('not approved');
  expect(() => editorialGuard([{ ...publicRecord, firstPlayerRule: 'A changed answer.' }], [], [], [])).toThrow('stale');
});
