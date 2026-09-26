import { z } from 'zod';
import { identityIdSchema, identityNameKey, identityReviewRevision, evidenceUrlSchema, reviewFields, reviewProblem, type RegistryIdentity } from './identity-registry';
import { assertPublishable, contentRevision, ruleSchema, type RuleRecord } from './schema';

const text = z.string().trim().min(1);
const hash = z.string().regex(/^[a-f0-9]{64}$/);
const assignmentFields = {
  ruleId: text, ruleRevision: hash, identityId: identityIdSchema, identityRevision: hash,
  editionScope: text,
  evidence: z.array(z.object({ url: evidenceUrlSchema, sha256: hash, location: text, correspondence: text }).strict()).min(1),
  ...reviewFields,
};
export const identityAssignmentSchema = z.object(assignmentFields).strict().superRefine((record, context) => {
  const problem = reviewProblem(record);
  if (problem) context.addIssue({ code: 'custom', message: problem });
});
export const identityAssignmentsSchema = z.object({ formatVersion: z.literal(1), records: z.array(identityAssignmentSchema) }).strict();
export const assignmentReviewRevision = identityReviewRevision;
const overrideSchema = z.array(z.object({ ruleId: text, inventoryIds: z.array(z.string().regex(/^[1-9]\d*$/)), reason: text }).strict());
export function scopeLegacyOverrides(overrides: unknown, rules: readonly RuleRecord[]) {
  const ids = new Set(rules.map(rule => rule.id));
  return overrideSchema.parse(overrides).filter(override => ids.has(override.ruleId));
}
export function validateLegacyOverrideReferences(identities: readonly RegistryIdentity[], rules: readonly RuleRecord[], overrides: unknown) {
  const parsed = overrideSchema.parse(overrides), ids = new Set(identities.filter(identity => identity.origin === 'legacy').map(identity => identity.identityId));
  const ruleIds = new Set(rules.map(rule => rule.id));
  if (new Set(parsed.map(item => item.ruleId)).size !== parsed.length) throw new Error('Duplicate legacy identity override');
  for (const item of parsed) {
    if (!ruleIds.has(item.ruleId) || new Set(item.inventoryIds).size !== item.inventoryIds.length || item.inventoryIds.some(id => !ids.has(`bgg-${id}`))) throw new Error(`Unknown or duplicate legacy override reference: ${item.ruleId}`);
  }
}

export const researchIdentityAssignmentSchema = z.object({ ...assignmentFields, purpose: z.literal('research-only') }).strict().superRefine((record, context) => {
  const problem = reviewProblem(record);
  if (problem) context.addIssue({ code: 'custom', message: problem });
});
export const researchIdentityAssignmentsSchema = z.object({ formatVersion: z.literal(1), records: z.array(researchIdentityAssignmentSchema) }).strict();
/** Development-only association review; never authorizes a public answer. */
export function resolveResearchIdentityAssignments(identities: readonly RegistryIdentity[], drafts: readonly RuleRecord[], assignmentData: unknown): ReadonlyMap<string, readonly string[]> {
  const records = researchIdentityAssignmentsSchema.parse(assignmentData).records;
  const byId = new Map(identities.map(identity => [identity.identityId, identity]));
  const rules = drafts.map(rule => ruleSchema.parse(rule)), byRule = new Map(rules.map(rule => [rule.id, rule]));
  if (byId.size !== identities.length || byRule.size !== rules.length || new Set(records.map(record => record.ruleId)).size !== records.length) throw new Error('Duplicate research identity, rule or association');
  const result = new Map<string, readonly string[]>();
  for (const record of records) {
    if (record.decision !== 'accept') continue;
    const identity = byId.get(record.identityId), draft = byRule.get(record.ruleId);
    if (!identity || identity.origin !== 'publisher' || !draft) throw new Error('Unknown publisher research association reference');
    if (!['draft', 'needs-review'].includes(draft.status) || draft.approvedBy !== null || draft.approvedRevision !== null || draft.publishedAt !== null || draft.materiallyUpdatedAt !== null) throw new Error('Research-only association requires a lifecycle-null draft');
    if (identity.identityRevision !== record.identityRevision || contentRevision(draft) !== record.ruleRevision || draft.editionLabel !== record.editionScope) throw new Error('Stale or wrong-scope research association');
    result.set(record.ruleId, [record.identityId]);
  }
  return result;
}
/** New publisher entries require explicit edition correspondence; titles remain discovery only. */
export function resolveIdentityAssignments(identities: readonly RegistryIdentity[], rules: readonly RuleRecord[], legacyOverrides: unknown, assignmentData: unknown): ReadonlyMap<string, readonly string[]> {
  const overrides = overrideSchema.parse(legacyOverrides);
  const records = identityAssignmentsSchema.parse(assignmentData).records;
  const identityById = new Map(identities.map(identity => [identity.identityId, identity]));
  const parsedRules = rules.map(rule => ruleSchema.parse(rule));
  const ruleById = new Map(parsedRules.map(rule => [rule.id, rule]));
  if (identityById.size !== identities.length || ruleById.size !== rules.length) throw new Error('Duplicate identity or rule input');
  if (new Set(overrides.map(item => item.ruleId)).size !== overrides.length) throw new Error('Duplicate legacy identity override');
  if (new Set(records.map(item => item.ruleId)).size !== records.length) throw new Error('Duplicate explicit rule assignment, including inactive records');
  const explicit = new Map<string, string[]>();
  for (const override of overrides) {
    if (!ruleById.has(override.ruleId)) throw new Error(`Unknown legacy override rule: ${override.ruleId}`);
    const ids = override.inventoryIds.map(id => `bgg-${id}`);
    if (new Set(ids).size !== ids.length || ids.some(id => identityById.get(id)?.origin !== 'legacy')) throw new Error(`Unknown or duplicate legacy override identity: ${override.ruleId}`);
    explicit.set(override.ruleId, ids);
  }
  for (const record of records) {
    if (record.decision !== 'accept') continue;
    if (explicit.has(record.ruleId)) throw new Error(`Conflicting legacy and explicit assignment: ${record.ruleId}`);
    const identity = identityById.get(record.identityId), rule = ruleById.get(record.ruleId);
    if (!identity || identity.origin !== 'publisher') throw new Error(`Unknown publisher assignment identity: ${record.identityId}`);
    if (!rule) throw new Error(`Unknown assignment rule: ${record.ruleId}`);
    assertPublishable(rule);
    if (identity.identityRevision !== record.identityRevision || contentRevision(rule) !== record.ruleRevision) throw new Error(`Stale identity or rule assignment binding: ${record.ruleId}`);
    if (rule.editionLabel !== record.editionScope) throw new Error(`Assignment edition scope differs from the reviewed rule: ${record.ruleId}`);
    explicit.set(record.ruleId, [record.identityId]);
  }
  const legacyNames = new Map<string, string[]>();
  for (const identity of identities.filter(identity => identity.origin === 'legacy')) {
    const key = identityNameKey(identity.name);
    legacyNames.set(key, [...(legacyNames.get(key) ?? []), identity.identityId]);
  }
  return new Map(parsedRules.map(rule => {
    const matches = explicit.get(rule.id) ?? [...new Set([rule.gameName, ...rule.aliases].flatMap(name => legacyNames.get(identityNameKey(name)) ?? []))];
    if (matches.length > 1 && !explicit.has(rule.id)) throw new Error(`Ambiguous legacy rule identity: ${rule.id}`);
    return [rule.id, matches];
  }));
}
