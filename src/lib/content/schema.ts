import { createHash } from 'node:crypto';
import { z } from 'zod';

const nonempty = z.string().trim().min(1);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => !isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value && value <= new Date().toISOString().slice(0, 10), 'Expected a real date, not in the future');
const status = z.enum(['draft', 'approved', 'published', 'needs-review', 'retired']);
const approval = {
  status, approvedBy: nonempty.nullable(), approvedRevision: z.string().regex(/^[a-f0-9]{64}$/).nullable(),
  publishedAt: date.nullable(), materiallyUpdatedAt: date.nullable(),
};
const identity = { id: nonempty.regex(/^[a-z0-9-]+$/), slug: nonempty.regex(/^[a-z0-9-]+$/), language: z.literal('en') };
export const ruleSchema = z.object({
  ...identity, ...approval,
  slug: identity.slug.refine(value => value !== 'themes', 'The rule slug themes is reserved for theme hubs'),
  gameName: nonempty, aliases: z.array(nonempty), editionLabel: nonempty,
  firstPlayerRule: nonempty, officialTieBreak: nonempty.nullable(), houseFallback: nonempty.nullable(),
  tieBreakApplicable: z.boolean().optional(),
  clarifications: z.array(nonempty), interpretation: nonempty.nullable(),
  sources: z.array(z.object({
    url: z.url().refine(value => new URL(value).protocol === 'https:' && !new URL(value).username && !new URL(value).password),
    title: nonempty, publisher: nonempty, printedPages: z.array(nonempty), pdfPagesOneBased: z.array(z.number().int().positive()),
    location: nonempty, checkedAt: date,
  }).strict()).min(1),
  internalEvidence: nonempty, uncertainty: z.array(nonempty),
}).strict();
export const promptSchema = z.object({
  ...identity, ...approval, sourceType: z.literal('original-house-rule'), prompt: nonempty, internalReviewNotes: nonempty,
}).strict();
export type RuleRecord = z.infer<typeof ruleSchema>;
export type PromptRecord = z.infer<typeof promptSchema>;
type Record = RuleRecord | PromptRecord;
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value !== null && typeof value === 'object') return `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, val]) => `${JSON.stringify(key)}:${canonical(val)}`).join(',')}}`;
  return JSON.stringify(value);
}
export function contentRevision(record: Record): string {
  const fields = Object.fromEntries(Object.entries(record).filter(([key]) => !['status', 'approvedBy', 'approvedRevision', 'publishedAt', 'materiallyUpdatedAt'].includes(key)));
  return createHash('sha256').update(canonical(fields)).digest('hex');
}
export function assertPublishable(record: Record): void {
  if (!['approved', 'published'].includes(record.status)) throw new Error(`${record.id}: content is not approved`);
  if (!record.approvedBy || !record.approvedRevision || record.approvedRevision !== contentRevision(record)) throw new Error(`${record.id}: missing or stale editorial approval`);
  if (!record.publishedAt || !record.materiallyUpdatedAt) throw new Error(`${record.id}: publication dates required`);
  const publicCopy = 'firstPlayerRule' in record ? [record.firstPlayerRule, record.gameName, record.editionLabel, ...record.clarifications].join(' ') : record.prompt;
  if (/\b(TODO|TBD|placeholder|lorem ipsum)\b/i.test(publicCopy)) throw new Error(`${record.id}: placeholder content cannot be published`);
}
export type PublicRule = Pick<RuleRecord, 'id' | 'slug' | 'gameName' | 'aliases' | 'editionLabel' | 'language' | 'firstPlayerRule' | 'officialTieBreak' | 'houseFallback' | 'tieBreakApplicable' | 'clarifications' | 'interpretation' | 'sources' | 'materiallyUpdatedAt'>;
export function publicRule(record: RuleRecord): PublicRule {
  return {
    id: record.id, slug: record.slug, gameName: record.gameName, aliases: record.aliases,
    editionLabel: record.editionLabel, language: record.language, firstPlayerRule: record.firstPlayerRule,
    officialTieBreak: record.officialTieBreak, houseFallback: record.houseFallback,
    ...(record.tieBreakApplicable === undefined ? {} : { tieBreakApplicable: record.tieBreakApplicable }),
    clarifications: record.clarifications,
    interpretation: record.interpretation, sources: record.sources, materiallyUpdatedAt: record.materiallyUpdatedAt,
  };
}
