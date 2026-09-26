import { createHash } from 'node:crypto';
import { z } from 'zod';

const text = z.string().trim().min(1);
const hash = z.string().regex(/^[a-f0-9]{64}$/);
const bggId = z.string().regex(/^[1-9]\d*$/);
const publisherId = z.string().regex(/^game-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
export const identityIdSchema = z.union([z.string().regex(/^bgg-[1-9]\d*$/), publisherId]);
export const evidenceUrlSchema = z.url().refine(value => {
  const url = new URL(value);
  return url.protocol === 'https:' && !url.username && !url.password;
}, 'Expected an HTTPS URL without credentials');
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
  const time = Date.parse(value);
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value && value <= new Date().toISOString().slice(0, 10);
}, 'Expected a real review date, not in the future');

export const reviewFields = {
  decision: z.enum(['draft', 'hold', 'reject', 'accept']),
  reviewedBy: text.nullable(), reviewedAt: date.nullable(), acceptedRevision: hash.nullable(),
};
export type Review = z.infer<z.ZodObject<typeof reviewFields>>;
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value !== null && typeof value === 'object') return `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`).join(',')}}`;
  return JSON.stringify(value)!;
}
/** Review lifecycle is excluded; source facts and collision acknowledgments are bound. */
export function identityReviewRevision(record: object): string {
  const payload = Object.fromEntries(Object.entries(record).filter(([key]) => !Object.hasOwn(reviewFields, key)));
  return createHash('sha256').update(canonical(payload)).digest('hex');
}
export function reviewProblem(record: Review & object): string | undefined {
  if ((record.reviewedBy === null) !== (record.reviewedAt === null)) return 'Reviewer and review date must be supplied together';
  if (record.decision !== 'accept') return record.acceptedRevision !== null ? 'Only accepted records can carry an accepted revision' : undefined;
  if (!record.reviewedBy || !record.reviewedAt) return 'Acceptance requires a reviewer and date';
  if (record.acceptedRevision !== identityReviewRevision(record)) return 'Missing or stale acceptance revision';
}
const sourceSchema = z.object({
  id: text, kind: z.enum(['primary-publisher', 'primary-author', 'identifier-reference']),
  url: evidenceUrlSchema, sha256: hash, byteCount: z.number().int().positive(), location: text,
}).strict();
export const publisherIdentitySchema = z.object({
  identityId: publisherId, routeKey: publisherId, name: text, searchNames: z.array(text),
  publisher: text, identityScope: text, identityEvidence: text,
  publisherReferenceSourceId: text,
  sources: z.array(sourceSchema),
  bggId: bggId.optional(),
  bggIdEvidence: z.object({ value: bggId, sourceId: text, location: text }).strict().optional(),
  collisionReviews: z.array(z.object({ identityId: identityIdSchema, reason: text, sourceIds: z.array(text).min(1) }).strict()),
  ...reviewFields,
}).strict().superRefine((record, context) => {
  const issue = (message: string) => context.addIssue({ code: 'custom', message });
  if (record.routeKey !== record.identityId) issue('A publisher identity keeps its allocated opaque route key');
  if (new Set(record.sources.map(source => source.id)).size !== record.sources.length) issue('Duplicate identity source ID');
  const sources = new Map(record.sources.map(source => [source.id, source]));
  if (record.bggId !== undefined ? record.bggIdEvidence?.value !== record.bggId : record.bggIdEvidence !== undefined) issue('External BGG ID requires matching explicit evidence');
  if (record.bggIdEvidence && !sources.has(record.bggIdEvidence.sourceId)) issue('Unknown external-ID source');
  if (new Set(record.collisionReviews.map(item => item.identityId)).size !== record.collisionReviews.length) issue('Duplicate collision acknowledgment');
  if (record.collisionReviews.some(item => item.identityId === record.identityId || item.sourceIds.some(id => !sources.has(id)))) issue('Invalid collision evidence reference');
  const problem = reviewProblem(record);
  if (problem) issue(problem);
  if (record.decision === 'accept') {
    if (!record.sources.some(source => source.kind === 'primary-publisher')) issue('Acceptance requires primary publisher evidence');
    if (sources.get(record.publisherReferenceSourceId)?.kind !== 'primary-publisher') issue('Publisher reference must bind a primary publisher source');
  }
});
export type PublisherIdentityRecord = z.infer<typeof publisherIdentitySchema>;
export const publisherRegistrySchema = z.object({ formatVersion: z.literal(1), records: z.array(publisherIdentitySchema) }).strict();

export type RegistryIdentity = {
  identityId: string; routeKey: string; name: string; searchNames: string[];
  origin: 'legacy' | 'publisher'; bggId?: string; identityRevision?: string;
  publisher?: string; identityScope?: string;
  reference?: { url: string; label: string };
};
const legacySchema = z.object({
  name: z.string().min(1), bggId, discoveryUrl: z.url().refine(value => {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && url.hostname === 'boardgamegeek.com';
  }), status: z.literal('needs-primary-source'), searchNames: z.array(z.string().min(1)).optional(),
}).strict();
export function normalizeLegacyIdentities(records: readonly unknown[]): RegistryIdentity[] {
  return records.map(value => {
    const record = legacySchema.parse(value);
    return { identityId: `bgg-${record.bggId}`, routeKey: record.bggId, origin: 'legacy', name: record.name,
      bggId: record.bggId, searchNames: record.searchNames ?? [], reference: { url: record.discoveryUrl, label: 'BoardGameGeek' } };
  });
}
export const identityNameKey = (name: string) => name.normalize('NFKD').replace(/\p{M}/gu, '').toLocaleLowerCase('en').replace(/[^\p{L}\p{N}]/gu, '');
/** Historical numeric evidence remains untouched and is not relabeled publisher verified. */
export function createIdentityRegistry(legacyRecords: readonly unknown[], publisherData: unknown): RegistryIdentity[] {
  const legacy = normalizeLegacyIdentities(legacyRecords);
  const records = publisherRegistrySchema.parse(publisherData).records;
  if (new Set(records.map(record => record.identityId)).size !== records.length) throw new Error('Duplicate publisher identity ID, including inactive records');
  const accepted = records.filter(record => record.decision === 'accept');
  const additions: RegistryIdentity[] = accepted.map(record => ({
    identityId: record.identityId, routeKey: record.routeKey, origin: 'publisher', name: record.name,
    searchNames: record.searchNames, publisher: record.publisher, identityScope: record.identityScope,
    identityRevision: record.acceptedRevision!, ...(record.bggId ? { bggId: record.bggId } : {}),
    reference: { url: record.sources.find(source => source.id === record.publisherReferenceSourceId)!.url, label: 'Publisher reference' },
  }));
  const identities = [...legacy, ...additions];
  for (const [label, keys] of [['identity ID', identities.map(identity => identity.identityId)], ['route key', identities.map(identity => identity.routeKey)], ['external BGG ID', identities.flatMap(identity => identity.bggId ? [identity.bggId] : [])]] as const) {
    if (new Set(keys).size !== keys.length) throw new Error(`Duplicate registry ${label}`);
  }
  const ids = new Set(identities.map(identity => identity.identityId));
  for (const record of accepted) {
    if (record.collisionReviews.some(item => !ids.has(item.identityId))) throw new Error(`Unknown collision identity: ${record.identityId}`);
  }
  const acceptedById = new Map(accepted.map(record => [record.identityId, record]));
  for (let i = legacy.length; i < identities.length; i++) for (let j = 0; j < i; j++) {
    const a = identities[i]!, b = identities[j]!;
    const aNames = new Set([a.name, ...a.searchNames].map(identityNameKey));
    const sameName = [b.name, ...b.searchNames].some(name => aNames.has(identityNameKey(name)));
    const sameReference = a.reference && b.reference && a.reference.url === b.reference.url;
    if (!sameName && !sameReference) continue;
    const reviewedDistinct = acceptedById.get(a.identityId)?.collisionReviews.some(item => item.identityId === b.identityId)
      || acceptedById.get(b.identityId)?.collisionReviews.some(item => item.identityId === a.identityId);
    if (!reviewedDistinct) throw new Error(`Identity collision requires explicit distinct-identity review: ${a.identityId}, ${b.identityId}`);
  }
  return identities;
}
