import { readFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { getCatalog } from './catalog';

const inventorySchema = z.object({
  discoveredAt: z.string(),
  indexSource: z.url(),
  scope: z.string(),
  games: z.array(z.object({
    name: z.string().min(1),
    bggId: z.string().regex(/^\d+$/),
    discoveryUrl: z.url().refine(url => new URL(url).hostname === 'boardgamegeek.com'),
    status: z.literal('needs-primary-source'),
  }).strict()),
}).strict();
const overridesSchema = z.array(z.object({
  ruleId: z.string(), inventoryIds: z.array(z.string()), reason: z.string(),
}).strict());
const nameKey = (name: string) => name.normalize('NFKD').replace(/\p{M}/gu, '').toLocaleLowerCase('en').replace(/[^\p{L}\p{N}]/gu, '');

const wikidataSchema = z.object({
  retrievedOn: z.string(),
  source: z.object({ statementSha256: z.string().regex(/^[a-f0-9]{64}$/) }),
  games: z.array(z.object({
    name: z.string().min(1), bggId: z.string().regex(/^\d+$/),
    wikidataUrl: z.url(), alreadyListed: z.boolean(), reviewFlags: z.array(z.string()),
    wikidataItems: z.array(z.object({ id: z.string().regex(/^Q\d+$/), name: z.string().min(1) })),
  })),
});
const reviewSchema = z.object({
  sourceSnapshot: z.literal('research/coverage/wikidata-board-games.json'),
  sourceSnapshotStatementSha256: z.string().regex(/^[a-f0-9]{64}$/),
  sources: z.record(z.string(), z.object({ url: z.url() })),
  decisions: z.array(z.object({
    bggId: z.string().regex(/^\d+$/), wikidataId: z.string().regex(/^Q\d+$/),
    snapshotName: z.string().min(1), displayName: z.string().min(1),
    decision: z.enum(['accept', 'hold', 'reject']), startingRuleApproved: z.literal(false),
    evidence: z.object({
      primarySourceIds: z.array(z.string()),
      wikidata: z.array(z.object({
        wikidataId: z.string().regex(/^Q\d+$/),
        bggIdClaims: z.array(z.object({ value: z.string() })),
      })),
    }),
  })),
});

const nativeSnapshotPath = 'research/coverage/wikidata-native-title-leads.json';
const nativeDecisionsPath = 'research/coverage/wikidata-native-title-decisions.json';
const hashSchema = z.string().regex(/^[a-f0-9]{64}$/);
const qidSchema = z.string().regex(/^Q\d+$/);
const nativeTitleSchema = z.looseObject({ text: z.string().min(1), language: z.string().min(1), source: z.enum(['label', 'P1476']) });
const nativeSnapshotSchema = z.object({
  retrievedOn: z.string(),
  source: z.object({ statementSha256: hashSchema, entitiesSha256: hashSchema }),
  candidates: z.array(z.object({
    bggId: z.string().regex(/^\d+$/), alreadyListed: z.boolean(), reviewFlags: z.array(z.string()),
    startingRuleApproved: z.literal(false),
    items: z.array(z.object({
      wikidataId: qidSchema, revision: z.number().int().positive(), entitySha256: hashSchema,
      titleOptions: z.array(nativeTitleSchema), bggIdClaims: z.array(z.record(z.string(), z.unknown())),
      entity: z.record(z.string(), z.unknown()),
    })).min(1),
  })),
});
const nativeDecisionsSchema = z.object({
  sourceSnapshot: z.literal(nativeSnapshotPath), sourceSnapshotSha256: hashSchema,
  sourceSnapshotStatementSha256: hashSchema, sourceSnapshotEntitiesSha256: hashSchema,
  sources: z.record(z.string(), z.object({
    url: z.url(), kind: z.enum(['primary-author', 'primary-publisher', 'primary-author-publisher']),
    status: z.string(), sha256: hashSchema,
  })),
  decisions: z.array(z.object({
    bggId: z.string().regex(/^\d+$/), wikidataItems: z.array(qidSchema).min(1),
    displayName: z.string().min(1), selectedTitle: nativeTitleSchema.extend({ wikidataId: qidSchema }),
    decision: z.enum(['accept', 'hold']), reviewed: z.boolean(), identityEvidence: z.array(z.string()),
    sourceIds: z.array(z.string()), snapshotReviewFlags: z.array(z.string()),
    idProvenance: z.array(z.object({ wikidataId: qidSchema, revision: z.number().int().positive(), entitySha256: hashSchema, statements: z.array(z.string()) })),
    startingRuleApproved: z.literal(false), editionRuleTransferApproved: z.literal(false),
  })),
});
const nativeClaimSchema = z.object({
  id: z.string(), rank: z.enum(['normal', 'preferred', 'deprecated']),
  mainsnak: z.object({ property: z.literal('P2339'), snaktype: z.string(), datavalue: z.object({ type: z.string(), value: z.unknown() }).optional() }),
});
// Match Python's canonical CC0 snapshot hashing without losing unknown entity fields.
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record).sort().map(key => `${JSON.stringify(key)}:${canonical(record[key])}`).join(',')}}`;
  }
  return JSON.stringify(value)!;
}
const sha256 = (text: string) => createHash('sha256').update(text).digest('hex');

export function nativeIdentityAdditions(snapshotText: string, decisionsText: string, existing: readonly { name: string; bggId: string }[]) {
  const snapshot = nativeSnapshotSchema.parse(JSON.parse(snapshotText));
  const review = nativeDecisionsSchema.parse(JSON.parse(decisionsText));
  const entities = Object.fromEntries(snapshot.candidates.flatMap(candidate => candidate.items.map(item => [item.wikidataId, item.entity])));
  const statements = snapshot.candidates.flatMap(candidate => candidate.items.map(item => [candidate.bggId, item.wikidataId]));
  if (review.sourceSnapshotSha256 !== sha256(snapshotText)
    || review.sourceSnapshotStatementSha256 !== snapshot.source.statementSha256
    || review.sourceSnapshotEntitiesSha256 !== snapshot.source.entitiesSha256
    || snapshot.source.statementSha256 !== sha256(canonical(statements))
    || snapshot.source.entitiesSha256 !== sha256(canonical(entities))) throw new Error('Native identity review belongs to a different snapshot');
  const candidates = new Map(snapshot.candidates.map(candidate => [candidate.bggId, candidate]));
  const decisions = new Map(review.decisions.map(decision => [decision.bggId, decision]));
  if (candidates.size !== snapshot.candidates.length || decisions.size !== review.decisions.length) throw new Error('Duplicate native identity reference');
  if (decisions.size !== candidates.size || [...decisions.keys()].some(id => !candidates.has(id))) throw new Error('Incomplete native identity decisions');
  const ids = new Set(existing.map(game => game.bggId));
  const names = new Set(existing.map(game => nameKey(game.name)));
  const additions: z.infer<typeof inventorySchema>['games'] = [];
  for (const decision of review.decisions) {
    if (decision.decision !== 'accept') continue;
    const candidate = candidates.get(decision.bggId)!;
    const item = candidate.items.find(item => item.wikidataId === decision.selectedTitle.wikidataId);
    const { wikidataId: selectedQid, ...selectedTitle } = decision.selectedTitle;
    if (!decision.reviewed || !decision.identityEvidence.length || !decision.sourceIds.length
      || candidate.alreadyListed || candidate.reviewFlags.length || decision.snapshotReviewFlags.length
      || canonical(decision.wikidataItems) !== canonical(candidate.items.map(item => item.wikidataId))
      || !item || !item.titleOptions.some(title => canonical(title) === canonical(selectedTitle))
      || decision.displayName !== selectedTitle.text) throw new Error(`Invalid native identity title: ${decision.bggId}`);
    if (decision.sourceIds.some(id => !review.sources[id] || review.sources[id]!.status !== 'retrieved')) throw new Error(`Unknown or unavailable native primary source: ${decision.bggId}`);
    const labels = item.entity.labels as Record<string, { language: string; value: string }> | undefined;
    const originalTitles = (item.entity.claims as Record<string, unknown[]> | undefined)?.P1476 ?? [];
    const originalTitleSchema = z.object({
      id: z.string(), rank: z.string(), mainsnak: z.object({ datavalue: z.object({ type: z.string(), value: z.object({ text: z.string(), language: z.string() }) }) }),
    });
    const sourceTitleExists = selectedTitle.source === 'label'
      ? labels?.[selectedTitle.language]?.value === selectedTitle.text && labels[selectedTitle.language]!.language === selectedTitle.language
      : originalTitles.some(value => {
        const parsed = originalTitleSchema.safeParse(value);
        return parsed.success && parsed.data.id === selectedTitle.statementId && parsed.data.rank !== 'deprecated'
          && parsed.data.mainsnak.datavalue.type === 'monolingualtext'
          && parsed.data.mainsnak.datavalue.value.text === selectedTitle.text && parsed.data.mainsnak.datavalue.value.language === selectedTitle.language;
      });
    if (!sourceTitleExists) throw new Error(`Missing native entity title: ${decision.bggId}`);
    for (const entityItem of candidate.items) {
      const entity = entityItem.entity;
      const claimRecords = (entity.claims as Record<string, unknown> | undefined)?.P2339;
      const claims = z.array(nativeClaimSchema).parse(claimRecords);
      const matching = claims.filter(claim => claim.rank !== 'deprecated' && claim.mainsnak.snaktype === 'value'
        && claim.mainsnak.datavalue?.type === 'string' && claim.mainsnak.datavalue.value === decision.bggId);
      const provenance = decision.idProvenance.find(value => value.wikidataId === entityItem.wikidataId);
      if (entity.id !== entityItem.wikidataId || entity.lastrevid !== entityItem.revision
        || sha256(canonical(entity)) !== entityItem.entitySha256 || canonical(claimRecords) !== canonical(entityItem.bggIdClaims)
        || !matching.length || !provenance || provenance.revision !== entityItem.revision || provenance.entitySha256 !== entityItem.entitySha256
        || canonical(provenance.statements) !== canonical(matching.map(claim => claim.id))) throw new Error(`Invalid native P2339 evidence: ${decision.bggId}`);
    }
    if (decision.idProvenance.length !== candidate.items.length || !decision.idProvenance.some(value => value.wikidataId === selectedQid)) throw new Error(`Invalid native identity provenance: ${decision.bggId}`);
    if (ids.has(decision.bggId) || names.has(nameKey(decision.displayName))) throw new Error(`Duplicate native board game identity: ${decision.bggId}`);
    ids.add(decision.bggId); names.add(nameKey(decision.displayName));
    additions.push({ name: decision.displayName, bggId: decision.bggId, discoveryUrl: `https://boardgamegeek.com/boardgame/${decision.bggId}`, status: 'needs-primary-source' });
  }
  return { games: additions, retrievedOn: snapshot.retrievedOn };
}

let cachedInventory: z.infer<typeof inventorySchema> | undefined;
let inventoryRevision = '';
export function getBoardGameInventory() {
  const revision = ['research/coverage/discovery-index.json', 'research/coverage/wikidata-board-games.json', 'research/coverage/wikidata-identity-review.json', nativeSnapshotPath, nativeDecisionsPath].map(path => {
    const file = statSync(path);
    return `${file.mtimeMs}:${file.size}`;
  }).join('|');
  if (cachedInventory && revision === inventoryRevision) return cachedInventory;
  const original = inventorySchema.parse(JSON.parse(readFileSync('research/coverage/discovery-index.json', 'utf8')));
  const wikidata = wikidataSchema.parse(JSON.parse(readFileSync('research/coverage/wikidata-board-games.json', 'utf8')));
  const review = reviewSchema.parse(JSON.parse(readFileSync('research/coverage/wikidata-identity-review.json', 'utf8')));
  if (review.sourceSnapshotStatementSha256 !== wikidata.source.statementSha256) throw new Error('Wikidata identity review belongs to a different snapshot');
  const ids = new Set(original.games.map(game => game.bggId));
  const names = new Set(original.games.map(game => nameKey(game.name)));
  const snapshotById = new Map(wikidata.games.map(game => [game.bggId, game]));
  const decisions = new Map(review.decisions.map(decision => [decision.bggId, decision]));
  if (decisions.size !== review.decisions.length) throw new Error('Duplicate Wikidata identity review');
  for (const decision of review.decisions) {
    const game = snapshotById.get(decision.bggId);
    if (!game || ids.has(decision.bggId) || decision.snapshotName !== game.name || !game.wikidataItems.some(item => item.id === decision.wikidataId)) throw new Error(`Invalid Wikidata review reference: ${decision.bggId}`);
    if (decision.evidence.primarySourceIds.some(id => !review.sources[id])) throw new Error(`Unknown Wikidata review source: ${decision.bggId}`);
    if (decision.decision === 'accept' && (!decision.evidence.primarySourceIds.length || !decision.evidence.wikidata.some(item => item.wikidataId === decision.wikidataId && item.bggIdClaims.some(claim => claim.value === decision.bggId)))) throw new Error(`Missing accepted identity evidence: ${decision.bggId}`);
  }
  const additions = wikidata.games.filter(game => {
    if (ids.has(game.bggId)) return false;
    const decision = decisions.get(game.bggId);
    return decision ? decision.decision === 'accept' : game.reviewFlags.length === 0 && !names.has(nameKey(game.name));
  }).map(game => ({
    name: decisions.get(game.bggId)?.displayName ?? game.name, bggId: game.bggId,
    discoveryUrl: `https://boardgamegeek.com/boardgame/${game.bggId}`,
    status: 'needs-primary-source' as const,
  }));
  if (new Set(additions.map(game => game.bggId)).size !== additions.length) throw new Error('Duplicate Wikidata board game identity');
  const addedNames = new Set<string>();
  for (const game of additions) {
    const key = nameKey(game.name);
    if (names.has(key) || addedNames.has(key)) throw new Error(`Wikidata discovery label needs qualification: ${game.name}`);
    addedNames.add(key);
  }
  const native = nativeIdentityAdditions(readFileSync(nativeSnapshotPath, 'utf8'), readFileSync(nativeDecisionsPath, 'utf8'), [...original.games, ...additions]);
  cachedInventory = { ...original, scope: `${original.scope} Plus ${additions.length} English-labeled Wikidata P2339 identity leads from ${wikidata.retrievedOn}, including accepted identity reviews; plus ${native.games.length} native and language-neutral identities corroborated by primary sources from ${native.retrievedOn}; no rule text imported.`, games: [...original.games, ...additions, ...native.games] };
  inventoryRevision = revision;
  return cachedInventory;
}

export function getBoardGames() {
  const inventory = getBoardGameInventory();
  const overrides = overridesSchema.parse(JSON.parse(readFileSync('research/coverage/identity-overrides.json', 'utf8')));
  const rules = getCatalog();
  const ids = new Set(inventory.games.map(game => game.bggId));
  if (ids.size !== inventory.games.length) throw new Error('Duplicate board game identity');
  for (const override of overrides) {
    if (!rules.some(rule => rule.id === override.ruleId)) continue;
    if (override.inventoryIds.some(id => !ids.has(id))) throw new Error(`Unknown board game identity for ${override.ruleId}`);
  }
  const byName = new Map<string, string[]>();
  for (const game of inventory.games) {
    const key = nameKey(game.name);
    byName.set(key, [...(byName.get(key) ?? []), game.bggId]);
  }
  const byRule = new Map(inventory.games.map(game => [game.bggId, [] as typeof rules]));
  const overridesByRule = new Map(overrides.map(item => [item.ruleId, item.inventoryIds]));
  for (const rule of rules) {
    const explicit = overridesByRule.get(rule.id);
    const matches = explicit ?? [...new Set([rule.gameName, ...rule.aliases].flatMap(name => byName.get(nameKey(name)) ?? []))];
    if (matches.length > 1 && !explicit) throw new Error(`Ambiguous board game identity for ${rule.id}: ${matches.join(', ')}; add an explicit identity override`);
    for (const id of matches) byRule.get(id)!.push(rule);
  }
  return inventory.games.map(game => ({ name: game.name, bggId: game.bggId, discoveryUrl: game.discoveryUrl, rules: byRule.get(game.bggId)! }));
}
