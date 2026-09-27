// UNEXECUTED SOURCE PROPOSAL. See README.md. No approval values are embedded.
// Future execution requires Node 22 + the caller checkout's tsx loader.
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync, realpathSync, renameSync, unlinkSync, lstatSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import process from 'node:process';
import { Buffer } from 'node:buffer';
import console from 'node:console';
import { resolve, relative, dirname, isAbsolute, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const fail = message => { throw new Error(message); };
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const canonical = value => Array.isArray(value) ? `[${value.map(canonical).join(',')}]` : value !== null && typeof value === 'object' ? `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}` : JSON.stringify(value);
const same = (a, b) => canonical(a) === canonical(b);
const hash = value => /^[a-f0-9]{64}$/.test(value ?? '');
const commit = value => /^[a-f0-9]{40}$/.test(value ?? '');
const jsonBytes = value => Buffer.from(JSON.stringify(value, null, 2) + '\n');
const [nodeMajor, nodeMinor] = process.versions.node.split('.').map(Number);
if (nodeMajor !== 22 || nodeMinor < 12) fail('Use the verified checkout Node 22 runtime, version >=22.12.0 and <23.');
const args = process.argv.slice(2), mode = args.shift(), options = {};
const allowedOptions = ['--checkout', '--packet', '--packet-sha256', '--custody', '--parent', '--parent-sha256', '--decision', '--decision-sha256', '--attempt', '--plan-sha256', '--review', '--review-sha256', '--run'];
while (args.length) { const flag = args.shift(); if (!allowedOptions.includes(flag) || options[flag] !== undefined || !args.length) fail(`Unknown/repeated/incomplete option: ${flag}`); options[flag] = args.shift(); }
if (!['plan', 'apply'].includes(mode) || !options['--checkout']) fail('Only plan/apply with an explicit checkout are supported.');
const root = realpathSync(options['--checkout']);
process.chdir(root);
const gitRaw = (...arguments_) => execFileSync('git', arguments_, { cwd: root });
const git = (...arguments_) => gitRaw(...arguments_).toString('utf8').trim();
if (realpathSync(git('rev-parse', '--show-toplevel')).toLowerCase() !== root.toLowerCase() || !lstatSync(resolve(root, '.git')).isFile()) fail('Caller must select a registered isolated Git worktree, not the shared root.');
function local(path) {
  if (typeof path !== 'string' || !path || isAbsolute(path) || path.includes(':') || path.split(/[\\/]/).some(part => !part || part === '.' || part === '..')) fail(`Unsafe relative path: ${path}`);
  const absolute = resolve(root, path), rel = relative(root, absolute);
  if (!rel || rel === '..' || rel.startsWith(`..${sep}`) || isAbsolute(rel)) fail('Path escapes checkout.');
  let ancestor = absolute; while (!existsSync(ancestor)) ancestor = dirname(ancestor);
  const actual = relative(root, realpathSync(ancestor));
  if (actual === '..' || actual.startsWith(`..${sep}`) || isAbsolute(actual)) fail('Resolved path escapes checkout.');
  // Refuse all symlink/reparse redirection inside the selected checkout.
  let cursor = root;
  for (const part of rel.split(sep)) { cursor = resolve(cursor, part); if (existsSync(cursor) && lstatSync(cursor).isSymbolicLink()) fail(`Symlink target is unsupported: ${path}`); }
  return absolute;
}
const bytes = path => readFileSync(local(path));
const text = path => bytes(path).toString('utf8').replace(/^\uFEFF/, '');
const load = path => JSON.parse(text(path));
const ignored = path => { gitRaw('check-ignore', '-q', '--no-index', path); };
const clean = () => { if (git('status', '--porcelain=v1', '--untracked-files=all')) fail('Selected isolated checkout must be entirely clean, excluding ignored evidence only.'); };
const head = git('rev-parse', 'HEAD');
clean();
const indexStageBefore = gitRaw('ls-files', '--stage', '-z');
const tracked = gitRaw('ls-files', '-z').toString('utf8').split('\0').filter(Boolean).sort();
const trackedInputs = tracked.map(path => { const raw = bytes(path); return { path, bytes: raw.length, sha256: sha(raw) }; });
const helperPath = relative(root, realpathSync(fileURLToPath(import.meta.url))).split(sep).join('/');
if (!helperPath.startsWith('scripts/') || helperPath.includes('..') || !git('ls-files', '--error-unmatch', helperPath)) fail('Root must review and commit the exact helper under scripts/ in the caller checkout before execution.');
const helperRaw = readFileSync(fileURLToPath(import.meta.url));
if (sha(gitRaw('show', `HEAD:${helperPath}`)) !== sha(helperRaw)) fail('Installed helper differs from its committed HEAD source.');
for (const name of ['packet', 'parent', 'decision']) if (!options[`--${name}`] || !hash(options[`--${name}-sha256`])) fail(`Explicit ${name} path and SHA256 required.`);
for (const name of ['packet', 'custody', 'parent', 'decision', 'attempt']) {
  const path = options[`--${name}`];
  if (!path || (!path.startsWith('artifacts/') && !path.startsWith('research/source-files/'))) fail(`${name} must reside in ignored checkout-local evidence.`);
  ignored(path + (['packet', 'custody', 'attempt'].includes(name) ? '/probe.json' : ''));
}
const packet = options['--packet'], custody = options['--custody'], attempt = options['--attempt'];
if (mode === 'plan' && existsSync(local(attempt))) fail('Plan attempt must be a unique absent ignored directory.');
if (mode === 'apply' && (!hash(options['--plan-sha256']) || !options['--review'] || !hash(options['--review-sha256']) || !/^[A-Za-z0-9-]+$/.test(options['--run'] ?? ''))) fail('Apply requires the reviewed exact plan hash, explicit review receipt/hash and unique run name.');
if (mode === 'plan' && ['--plan-sha256', '--review', '--review-sha256', '--run'].some(key => options[key] !== undefined)) fail('Plan mode must omit apply-only options.');
function guard(path, expected, count) {
  const raw = bytes(path);
  if (!hash(expected) || sha(raw) !== expected || (count !== undefined && raw.length !== count)) fail(`Guard mismatch: ${path}`);
  return raw;
}
function custodyManifest(folder, expected, count, filename = 'manifest.json') {
  guard(`${folder}/${filename}`, expected);
  const body = load(`${folder}/${filename}`), members = Array.isArray(body) ? body : body.members ?? body.files;
  if (!Array.isArray(members) || members.length !== count || new Set(members.map(member => member.path)).size !== members.length) fail(`Manifest inventory mismatch: ${folder}`);
  for (const member of members) guard(`${folder}/${member.path}`, member.sha256, member.bytes ?? member.byteCount);
  return members;
}
const packetMembers = custodyManifest(packet, options['--packet-sha256'], 25);
if (sha(bytes(`${packet}/cutover.mjs`)) !== sha(helperRaw)) fail('Committed runtime helper differs from the exact source-only packet helper.');
const policy = load(`${packet}/policy.json`);
if (policy.formatVersion !== 1 || policy.purpose !== 'architects-and-five-zoch-labels-only') fail('Wrong bounded cutover policy.');
guard(`${packet}/public-copy-conditions.md`, policy.publicCopyConditionsSha256);
guard(`${packet}/root-next-content-decisions.md`, policy.rootDecisionSha256);
guard(`${packet}/architects-pending.json`, policy.architectsPendingSha256);
custodyManifest(`${packet}/zoch`, policy.zochManifestSha256, 13);
custodyManifest(custody, policy.architectsCustodyManifestSha256, policy.architectsCustodyMembers);
const pdfMember = load(`${custody}/manifest.json`).members?.find(member => member.sha256 === policy.architectsSourceSha256) ?? load(`${custody}/manifest.json`).files?.find(member => member.sha256 === policy.architectsSourceSha256);
if (!pdfMember) fail('Durable Architects custody lacks the exact original official PDF.');
guard(`${custody}/${pdfMember.path}`, policy.architectsSourceSha256, policy.architectsSourceBytes);
for (const member of policy.modules) guard(member.path, member.sha256, member.bytes);
guard(options['--parent'], options['--parent-sha256']);
guard(options['--decision'], options['--decision-sha256']);
const parent = load(options['--parent']), decision = load(options['--decision']);
if (parent.formatVersion !== 1 || parent.auditClosed !== true || parent.isLatestVerifiedParent !== true || parent.verifiedHead !== head || !commit(parent.verifiedHead) || parent.helperCommit !== head || parent.helperSha256 !== sha(helperRaw) || !parent.verificationReceipt) fail('Fresh explicit latest VERIFIED parent/audit closure and committed helper binding required.');
if (!parent.verificationReceipt.path?.startsWith('artifacts/') && !parent.verificationReceipt.path?.startsWith('research/source-files/')) fail('The actual parent verification receipt must be checkout-local ignored evidence.');
ignored(parent.verificationReceipt.path);
guard(parent.verificationReceipt.path, parent.verificationReceipt.sha256, parent.verificationReceipt.bytes);
const realDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value ?? '') && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value && value <= new Date().toISOString().slice(0, 10);
const expectedIds = ['7-wonders-architects-repos-en', 'beethupferl-en', 'mirakel-mix-en', 'kaeptn-memo-en', 'kleiner-drache-wirbelwind-en', 'mach-die-flatter-en'];
if (decision.formatVersion !== 1 || decision.actualReviewerDecision !== true || typeof decision.reviewedBy !== 'string' || !decision.reviewedBy.trim() || !realDate(decision.reviewedAt) || !realDate(decision.architectsPublicationDate) || !same(decision.ruleIds, expectedIds) || decision.publicCopyConditionsSha256 !== policy.publicCopyConditionsSha256 || decision.rootDecisionSha256 !== policy.rootDecisionSha256 || !['include-youngest', 'exclude'].includes(decision.architectsPortable) || decision.preserveFiveAssignmentReviewLifecycle !== true || decision.preserveFivePublicDatesAndApprover !== true) fail('Actual runtime root copy/publication/portable decision required; no dates or approval values are inferred.');
if (typeof decision.publicationTimeZone !== 'string' || !decision.publicationTimeZone) fail('Explicit publication calendar time zone required.');
const publicationParts = new Intl.DateTimeFormat('en-US', { timeZone: decision.publicationTimeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
const publicationPart = name => publicationParts.find(part => part.type === name)?.value;
const actualPublicationDay = `${publicationPart('year')}-${publicationPart('month')}-${publicationPart('day')}`;
if (decision.architectsPublicationDate !== actualPublicationDay) fail('The new Architects publication date must be the actual current date in the declared publication time zone; create a fresh plan if it changes.');

// No project imports/getters occur before exact source and caller authority guards.
const importSource = path => import(pathToFileURL(local(path)).href);
const schema = await importSource('src/lib/content/schema.ts');
const registryLib = await importSource('src/lib/content/identity-registry.ts');
const assignmentLib = await importSource('src/lib/content/identity-assignments.ts');
const randomLib = await importSource('src/lib/content/random-rules.ts');
const board = await importSource('src/lib/content/board-games.ts');
registryLib.publisherRegistrySchema.parse(load('research/coverage/publisher-identities.json'));
const identities = board.getBoardGameRegistry();
const readRules = directory => readdirSync(local(directory)).filter(name => name.endsWith('.json')).sort().map(name => ({ path: `${directory}/${name}`, record: schema.ruleSchema.parse(load(`${directory}/${name}`)) }));
const publicBefore = readRules('src/content/games'), researchBefore = readRules('research/games');
publicBefore.forEach(({ record }) => schema.assertPublishable(record));
for (const collection of [publicBefore, researchBefore]) for (const key of ['id', 'slug']) if (new Set(collection.map(row => row.record[key])).size !== collection.length) fail(`Duplicate ${key} in record input.`);
const nullDraft = record => ['draft', 'needs-review'].includes(record.status) && ['approvedBy', 'approvedRevision', 'publishedAt', 'materiallyUpdatedAt'].every(key => record[key] === null);
const architect = load(`${packet}/architects-pending.json`), overrideRows = load(`${packet}/architects-override.json`);
if (!Array.isArray(overrideRows) || overrideRows.length !== 1) fail('Exactly one saved Architects override proposal required.');
const overrideProposal = overrideRows[0];
const architectPath = 'src/content/games/7-wonders-architects-repos-en.json', architectResearchPath = 'research/games/7-wonders-architects-repos-en.json';
if (existsSync(local(architectPath)) || publicBefore.some(({ record }) => record.id === architect.id || record.slug === architect.slug) || !nullDraft(architect)) fail('Architects must be a new absent production leaf and pending research record.');
guard(architectResearchPath, policy.architectsPendingSha256);
const poolPath = 'src/content/random-rule-pool.json', assignmentPath = 'research/coverage/identity-assignments.json', overridePath = 'research/coverage/identity-overrides.json';
const poolBefore = load(poolPath), assignmentsBefore = assignmentLib.identityAssignmentsSchema.parse(load(assignmentPath)), overridesBefore = load(overridePath);
if (Object.keys(poolBefore.revisions).length !== policy.priorPortableCount || policy.priorPortableCount !== 393 || Object.hasOwn(poolBefore.revisions, architect.id)) fail('Expected exactly the 393 preserved prior portable entries, with no Architects entry.');
const matchingOverride = overridesBefore.filter(row => row.ruleId === architect.id);
if (matchingOverride.length !== 1 || !same(matchingOverride[0], overrideProposal) || !same(overrideProposal.inventoryIds, ['346703'])) fail('The exact previously reviewed 346703 legacy override must already exist once; this helper never changes overrides.');
if (assignmentsBefore.records.some(row => row.ruleId === architect.id) || identities.filter(row => row.identityId === 'bgg-346703' && row.origin === 'legacy' && row.bggId === '346703').length !== 1) fail('Architects numeric scope must be the sole saved legacy 346703 identity with no publisher reassignment.');
const zoch = load(`${packet}/zoch/proposal.json`).records, baselineAssignments = load(`${packet}/zoch/baseline/identity-assignments-five.json`);
if (zoch.length !== 5 || !same(zoch.map(row => row.ruleId), expectedIds.slice(1))) fail('Only the exact five reviewed Zoch label changes are permitted.');
const changes = [], publicFinal = publicBefore.map(row => row.record), researchFinal = researchBefore.map(row => row.record), assignmentUpdates = new Map();

// Locate JSON spans without regex or reserializing unrelated array objects.
function skipSpace(body, start) { while (/\s/.test(body[start] ?? '') && start < body.length) start++; return start; }
function valueEnd(body, start) {
  start = skipSpace(body, start);
  if (body[start] === '"') { for (let i = start + 1; i < body.length; i++) { if (body[i] === '\\') { i++; continue; } if (body[i] === '"') return i + 1; } fail('Unclosed JSON string.'); }
  if (body[start] === '{' || body[start] === '[') { const close = body[start] === '{' ? '}' : ']'; let i = skipSpace(body, start + 1); while (body[i] !== close) { if (i >= body.length) fail('Unclosed JSON container.'); if (body[i] === ',' || body[i] === ':') i++; else i = valueEnd(body, i); i = skipSpace(body, i); } return i + 1; }
  let end = start; while (end < body.length && !/[\s,}\]]/.test(body[end])) end++; if (end === start) fail('Invalid JSON token.'); return end;
}
function objectMembers(body, start = 0) {
  start = skipSpace(body, start); if (body[start] !== '{') fail('Expected JSON object.');
  const members = []; let cursor = skipSpace(body, start + 1);
  while (body[cursor] !== '}') { const keyStart = cursor, keyEnd = valueEnd(body, cursor), key = JSON.parse(body.slice(cursor, keyEnd)); cursor = skipSpace(body, keyEnd); if (body[cursor++] !== ':') fail('Missing JSON colon.'); const valueStart = skipSpace(body, cursor), end = valueEnd(body, valueStart); members.push({ key, keyStart, valueStart, end }); cursor = skipSpace(body, end); if (body[cursor] === ',') cursor = skipSpace(body, cursor + 1); else if (body[cursor] !== '}') fail('Missing JSON comma.'); }
  if (new Set(members.map(member => member.key)).size !== members.length) fail('Duplicate JSON key.'); return { members, close: cursor };
}
function arrayMembers(body, start) { if (body[start] !== '[') fail('Expected JSON array.'); let cursor = skipSpace(body, start + 1); const members = []; while (body[cursor] !== ']') { const end = valueEnd(body, cursor); members.push({ start: cursor, end, value: JSON.parse(body.slice(cursor, end)) }); cursor = skipSpace(body, end); if (body[cursor] === ',') cursor = skipSpace(body, cursor + 1); else if (body[cursor] !== ']') fail('Missing array comma.'); } return members; }
const lineEnding = body => body.includes('\r\n') ? '\r\n' : '\n';
function formatted(value, body, start = 0) { const line = body.lastIndexOf('\n', start - 1) + 1, indent = body.slice(line, start).match(/^\s*/)[0], nl = lineEnding(body); return JSON.stringify(value, null, 2).replace(/\n/g, nl + indent); }
function encodeLike(path, body) { const original = bytes(path), bom = original.subarray(0, 3).equals(Buffer.from([239, 187, 191])); return Buffer.concat([bom ? original.subarray(0, 3) : Buffer.alloc(0), Buffer.from(body)]); }
function replaceFields(path, fields) { let body = text(path); const spans = objectMembers(body).members; const patches = Object.entries(fields).map(([key, value]) => { const span = spans.find(member => member.key === key); if (!span) fail(`Missing field ${key}: ${path}`); return { start: span.valueStart, end: span.end, value: formatted(value, body, span.valueStart) }; }); for (const patch of patches.sort((a, b) => b.start - a.start)) body = body.slice(0, patch.start) + patch.value + body.slice(patch.end); return encodeLike(path, body); }
function addChange(path, after, allowedFields, description) { const before = existsSync(local(path)) ? bytes(path) : null; if (before && before.equals(after)) fail(`No-op planned write: ${path}`); changes.push({ path, before, after, allowedFields, description }); }
for (const row of zoch) {
  const expectedPublic = load(`${packet}/zoch/baseline/${row.publicPath}`), expectedResearch = load(`${packet}/zoch/baseline/${row.researchPath}`);
  guard(row.publicPath, sha(bytes(`${packet}/zoch/baseline/${row.publicPath}`)));
  guard(row.researchPath, sha(bytes(`${packet}/zoch/baseline/${row.researchPath}`)));
  const priorPublic = publicBefore.find(item => item.record.id === row.ruleId)?.record, priorResearch = researchBefore.find(item => item.record.id === row.ruleId)?.record;
  const assignment = assignmentsBefore.records.filter(item => item.ruleId === row.ruleId), expectedAssignment = baselineAssignments.find(item => item.ruleId === row.ruleId);
  const identity = identities.find(item => item.identityId === row.identityId);
  if (!same(priorPublic, expectedPublic) || !same(priorResearch, expectedResearch) || !nullDraft(priorResearch) || assignment.length !== 1 || !same(assignment[0], expectedAssignment) || assignment[0].decision !== 'accept' || identity?.identityRevision !== row.identityRevisionUnchanged || identity.origin !== 'publisher' || Object.hasOwn(poolBefore.revisions, row.ruleId)) fail(`Exact current Zoch pair/assignment/identity/portable scope differs: ${row.ruleId}`);
  const revisedPublic = schema.ruleSchema.parse({ ...priorPublic, editionLabel: row.proposedEditionLabel, approvedRevision: null });
  revisedPublic.approvedRevision = schema.contentRevision(revisedPublic);
  schema.assertPublishable(revisedPublic);
  const revisedResearch = schema.ruleSchema.parse({ ...priorResearch, editionLabel: row.proposedEditionLabel });
  if (!nullDraft(revisedResearch) || schema.contentRevision(revisedResearch) !== schema.contentRevision(revisedPublic)) fail('Zoch revised null research pair and public revision disagree.');
  publicFinal[publicFinal.findIndex(record => record.id === row.ruleId)] = revisedPublic;
  researchFinal[researchFinal.findIndex(record => record.id === row.ruleId)] = revisedResearch;
  const updatedAssignment = { ...assignment[0], ruleRevision: schema.contentRevision(revisedPublic), editionScope: revisedPublic.editionLabel, acceptedRevision: null };
  updatedAssignment.acceptedRevision = assignmentLib.assignmentReviewRevision(updatedAssignment);
  assignmentLib.identityAssignmentSchema.parse(updatedAssignment);
  assignmentUpdates.set(row.ruleId, updatedAssignment);
  addChange(row.publicPath, replaceFields(row.publicPath, { editionLabel: revisedPublic.editionLabel, approvedRevision: revisedPublic.approvedRevision }), ['editionLabel', 'approvedRevision'], 'Only suffix removal and actual installed canonical approval revision; existing dates/approver retained under explicit current root decision.');
  addChange(row.researchPath, replaceFields(row.researchPath, { editionLabel: revisedResearch.editionLabel }), ['editionLabel'], 'Only suffix removal; all pending research lifecycle fields retained null.');
}
const privateNotes = `${architect.internalEvidence}\nPrivate limitations retained from the immutable pending uncertainty list: ${JSON.stringify(architect.uncertainty)}\nRoot operative public-copy conditions accept the completed official-source answer and retain only the reader opening-age tie uncertainty. Actual cutover reviewer/date and exact plan approval are recorded separately in the future application receipt; no printing or raw HTTP custody upgrade is inferred.`;
const revisedArchitectDraft = schema.ruleSchema.parse({ ...architect, internalEvidence: privateNotes, uncertainty: policy.readerUncertainty });
const revisedArchitectPublic = schema.ruleSchema.parse({ ...revisedArchitectDraft, status: 'approved', approvedBy: decision.reviewedBy, approvedRevision: null, publishedAt: decision.architectsPublicationDate, materiallyUpdatedAt: decision.architectsPublicationDate });
revisedArchitectPublic.approvedRevision = schema.contentRevision(revisedArchitectPublic);
schema.assertPublishable(revisedArchitectPublic);
if (!nullDraft(revisedArchitectDraft) || schema.contentRevision(revisedArchitectDraft) !== revisedArchitectPublic.approvedRevision) fail('Architects pending/public pairing invalid.');
publicFinal.push(revisedArchitectPublic);
researchFinal[researchFinal.findIndex(record => record.id === architect.id)] = revisedArchitectDraft;
addChange(architectPath, jsonBytes(revisedArchitectPublic), Object.keys(revisedArchitectPublic), 'New approved production leaf only after actual runtime decision, canonical approval and exact plan review.');
addChange(architectResearchPath, replaceFields(architectResearchPath, { internalEvidence: privateNotes, uncertainty: policy.readerUncertainty }), ['internalEvidence', 'uncertainty'], 'Only reader uncertainty/private provenance placement; lifecycle remains pending/null.');
let assignmentText = text(assignmentPath);
const recordsSpan = objectMembers(assignmentText).members.find(member => member.key === 'records');
if (!recordsSpan) fail('Assignment envelope has no records.');
const replacements = arrayMembers(assignmentText, recordsSpan.valueStart).filter(member => assignmentUpdates.has(member.value.ruleId)).map(member => ({ ...member, next: assignmentUpdates.get(member.value.ruleId) }));
if (replacements.length !== 5) fail('Five exact assignment slots required.');
for (const member of replacements.sort((a, b) => b.start - a.start)) assignmentText = assignmentText.slice(0, member.start) + formatted(member.next, assignmentText, member.start) + assignmentText.slice(member.end);
const assignmentsFinal = assignmentLib.identityAssignmentsSchema.parse(JSON.parse(assignmentText));
if (assignmentsFinal.records.length !== assignmentsBefore.records.length || assignmentsFinal.records.some((row, i) => !assignmentUpdates.has(row.ruleId) && !same(row, assignmentsBefore.records[i]))) fail('An unrelated assignment changed.');
addChange(assignmentPath, encodeLike(assignmentPath, assignmentText), ['five.records.ruleRevision', 'five.records.editionScope', 'five.records.acceptedRevision'], 'Replace only the five exact existing object spans; retain every other literal array entry and envelope.');
const poolFinal = globalThis.structuredClone(poolBefore);
if (decision.architectsPortable === 'include-youngest') {
  poolFinal.revisions[architect.id] = randomLib.randomRuleRevision(schema.publicRule(revisedArchitectPublic));
  let body = text(poolPath); const span = objectMembers(body).members.find(member => member.key === 'revisions'); if (!span) fail('Missing portable revisions object.');
  const map = objectMembers(body, span.valueStart), last = map.members.at(-1); if (!last) fail('Expected prior portable map.');
  const line = body.lastIndexOf('\n', last.keyStart - 1) + 1, indentation = body.slice(line, last.keyStart); if (!/^\s*$/.test(indentation)) fail('Portable map formatting is unsupported.');
  body = body.slice(0, last.end) + ',' + lineEnding(body) + indentation + JSON.stringify(architect.id) + ': ' + JSON.stringify(poolFinal.revisions[architect.id]) + body.slice(last.end);
  if (!same(JSON.parse(body), poolFinal)) fail('Portable append differs from the expected one-entry projection.');
  addChange(poolPath, encodeLike(poolPath, body), [`revisions.${architect.id}`], 'Only explicitly conditional Architects youngest fingerprint from actual publicRule/randomRuleRevision; all 393 prior entries and envelope metadata remain identical.');
}
for (const [id, revision] of Object.entries(poolBefore.revisions)) if (poolFinal.revisions[id] !== revision) fail(`Prior portable entry changed: ${id}`);
const testChanges = [
  { path: 'tests/browser/publisher-zoch-existing.spec.ts', edits: [
    ["edition: 'English summary of Zoch German rules, article 601105221'", "edition: 'English summary of Zoch German rules'"],
    ["edition: 'Zoch English rules in multilingual booklet, article 601105202'", "edition: 'Zoch English rules in multilingual booklet'"],
    ["edition: 'Zoch English rules in multilingual booklet, article 601105203'", "edition: 'Zoch English rules in multilingual booklet'"],
  ] },
  { path: 'tests/browser/publisher-zoch-next.spec.ts', edits: [
    ['.toHaveText(`Zoch English rules in multilingual booklet, article ${game.article}`)', ".toHaveText('Zoch English rules in multilingual booklet')"],
  ] },
];
for (const test of testChanges) {
  const baseline = `${packet}/browser-baseline/${test.path.split('/').at(-1)}`;
  guard(test.path, sha(bytes(baseline)));
  let body = text(test.path);
  for (const [old, next] of test.edits) { if (body.split(old).length !== 2) fail(`Exact single browser expectation missing: ${test.path}`); body = body.replace(old, next); }
  addChange(test.path, encodeLike(test.path, body), test.edits.map(([old, next]) => ({ old, next })), 'Only the three edition data strings and one shared two-game expectation; retain source/article/page assertions and test inventory.');
}

// Validate every intended final file and complete projected correspondence BEFORE writes.
for (const change of changes) {
  if (change.path.endsWith('.json')) {
    const record = JSON.parse(change.after.toString('utf8').replace(/^\uFEFF/, ''));
    if (change.path.startsWith('src/content/games/')) { schema.assertPublishable(schema.ruleSchema.parse(record)); if (!same(record, publicFinal.find(rule => rule.id === record.id))) fail('Final public bytes differ from validated projection.'); }
    else if (change.path.startsWith('research/games/')) { schema.ruleSchema.parse(record); if (!nullDraft(record) || !same(record, researchFinal.find(rule => rule.id === record.id))) fail('Pending lifecycle or final research bytes differ.'); }
    else if (change.path === assignmentPath) { assignmentLib.identityAssignmentsSchema.parse(record); if (!same(record, assignmentsFinal)) fail('Final assignment bytes differ.'); }
    else if (change.path === poolPath && !same(record, poolFinal)) fail('Portable serialization differs.');
  }
}
if (publicFinal.length !== publicBefore.length + 1 || researchFinal.length !== researchBefore.length) fail('Only one new public record and no new research/identity entries are permitted.');
for (const key of ['id', 'slug']) if (new Set(publicFinal.map(record => record[key])).size !== publicFinal.length) fail(`Final public ${key} collision.`);
const allRules = new Map(researchFinal.map(record => [record.id, record])); for (const record of publicFinal) allRules.set(record.id, record);
assignmentLib.validateLegacyOverrideReferences(identities, [...allRules.values()], overridesBefore);
const resolved = assignmentLib.resolveIdentityAssignments(identities, publicFinal, assignmentLib.scopeLegacyOverrides(overridesBefore, publicFinal), assignmentsFinal);
const previousResolved = assignmentLib.resolveIdentityAssignments(identities, publicBefore.map(row => row.record), assignmentLib.scopeLegacyOverrides(overridesBefore, publicBefore.map(row => row.record)), assignmentsBefore);
for (const { record } of publicBefore) if (!same(previousResolved.get(record.id), resolved.get(record.id))) fail(`Previously published identity attachment changed: ${record.id}`);
if (!same(resolved.get(architect.id), ['bgg-346703'])) fail('Architects assigned outside exact legacy scope.');
for (const row of zoch) if (!same(resolved.get(row.ruleId), [row.identityId])) fail(`Zoch assignment scope changed: ${row.ruleId}`);
const historical = load('research/coverage/draft-identity-assignments.json');
assignmentLib.resolveResearchIdentityAssignments(identities, researchFinal.filter(record => !publicFinal.some(rule => rule.id === record.id)), historical);
for (const [id, revision] of Object.entries(poolFinal.revisions)) { const record = publicFinal.find(rule => rule.id === id); if (!record || randomLib.randomRuleRevision(schema.publicRule(record)) !== revision) fail(`Stale projected portable fingerprint: ${id}`); }
const wantedPaths = [...zoch.flatMap(row => [row.publicPath, row.researchPath]), architectPath, architectResearchPath, assignmentPath, ...testChanges.map(row => row.path), ...(decision.architectsPortable === 'include-youngest' ? [poolPath] : [])].sort();
if (!same(changes.map(change => change.path).sort(), wantedPaths) || changes.length !== new Set(changes.map(change => change.path)).size) fail('Unexpected final write scope.');
const inputCopies = [
  ...packetMembers.map(member => ({ path: `${packet}/${member.path}`, bytes: member.bytes ?? member.byteCount, sha256: member.sha256 })),
  { path: `${packet}/manifest.json`, bytes: bytes(`${packet}/manifest.json`).length, sha256: options['--packet-sha256'] },
  ...custodyManifest(custody, policy.architectsCustodyManifestSha256, policy.architectsCustodyMembers).map(member => ({ path: `${custody}/${member.path}`, bytes: member.bytes ?? member.byteCount, sha256: member.sha256 })),
  { path: `${custody}/manifest.json`, bytes: bytes(`${custody}/manifest.json`).length, sha256: policy.architectsCustodyManifestSha256 },
  { path: options['--parent'], bytes: bytes(options['--parent']).length, sha256: options['--parent-sha256'] },
  { path: options['--decision'], bytes: bytes(options['--decision']).length, sha256: options['--decision-sha256'] },
  parent.verificationReceipt,
];
const plan = {
  formatVersion: 1, purpose: policy.purpose, checkout: root, head, helperPath, helperSha256: sha(helperRaw), options: Object.fromEntries(['--packet', '--packet-sha256', '--custody', '--parent', '--parent-sha256', '--decision', '--decision-sha256', '--attempt'].map(key => [key, options[key]])),
  trackedInputs, indexStageBeforeBytes: indexStageBefore.length, indexStageBeforeSha256: sha(indexStageBefore), inputCopies, reviewerDecision: decision, writePathsSorted: wantedPaths,
  writes: changes.map(change => ({ path: change.path, beforeBytes: change.before?.length ?? null, beforeSha256: change.before ? sha(change.before) : null, afterBytes: change.after.length, afterSha256: sha(change.after), allowedFields: change.allowedFields, description: change.description })),
  results: { actualNodeVersion: process.versions.node, publicCountBefore: publicBefore.length, publicCountAfter: publicFinal.length, researchCountBefore: researchBefore.length, researchCountAfter: researchFinal.length, identitiesUnchanged: identities.length, priorPortablePreserved: 393, finalPortableCount: Object.keys(poolFinal.revisions).length, architectContentRevision: revisedArchitectPublic.approvedRevision, architectPublicRule: schema.publicRule(revisedArchitectPublic), architectRandomRuleRevision: randomLib.randomRuleRevision(schema.publicRule(revisedArchitectPublic)), fiveAssignmentRevisions: [...assignmentUpdates.values()].map(row => ({ ruleId: row.ruleId, ruleRevision: row.ruleRevision, editionScope: row.editionScope, acceptedRevision: row.acceptedRevision })), allIntendedFilesValidated: true, noUnrelatedAssignmentsOrResearchLifecycleChanges: true, noIdentityOrOverrideOrSourceEnvelopeWrite: true, noOtherPendingDraftPublication: true },
};
const planRaw = jsonBytes(plan), planSha = sha(planRaw);
function recheckInputs() {
  if (git('rev-parse', 'HEAD') !== head) fail('HEAD changed.');
  if (!gitRaw('ls-files', '--stage', '-z').equals(indexStageBefore)) fail('Exact index blob/mode/stage/path entries changed.');
  for (const member of [...trackedInputs, ...inputCopies]) guard(member.path, member.sha256, member.bytes);
}
function writeEvidence(path, raw) { mkdirSync(dirname(local(path)), { recursive: true }); writeFileSync(local(path), raw, { flag: 'wx' }); }
if (mode === 'plan') {
  recheckInputs(); clean();
  mkdirSync(local(attempt));
  writeEvidence(`${attempt}/index-stage-before.bin`, indexStageBefore);
  for (const change of changes) {
    if (change.before) writeEvidence(`${attempt}/before/${change.path}`, change.before);
    writeEvidence(`${attempt}/planned/${change.path}`, change.after);
    const beforePath = change.before ? `${attempt}/before/${change.path}` : `${attempt}/diff-before-empty/${change.path}`;
    if (!change.before) writeEvidence(`${attempt}/absent/${change.path}.json`, jsonBytes({ originallyAbsent: true, path: change.path }));
    if (!change.before) writeEvidence(beforePath, Buffer.alloc(0)); // Diff-only empty baseline; never a claimed source preimage.
    try {
      const output = execFileSync('git', ['diff', '--no-index', '--', local(beforePath), local(`${attempt}/planned/${change.path}`)], { cwd: root });
      writeEvidence(`${attempt}/diffs/${change.path}.diff`, output);
    } catch (error) { if (error.status !== 1 || !error.stdout) throw error; writeEvidence(`${attempt}/diffs/${change.path}.diff`, error.stdout); }
  }
  writeEvidence(`${attempt}/write-plan.json`, planRaw);
  writeEvidence(`${attempt}/plan-receipt.json`, jsonBytes({ mode, executedAt: new Date().toISOString(), planSha256: planSha, trackedWrites: 0, helperCommittedAt: head, validations: plan.results, noBuildBrowserOrDeploymentGateClaim: true }));
  console.log(JSON.stringify({ mode, planPath: `${attempt}/write-plan.json`, planSha256: planSha, writes: wantedPaths, trackedWrites: 0 }, null, 2));
} else {
  guard(`${attempt}/write-plan.json`, options['--plan-sha256']);
  if (options['--plan-sha256'] !== planSha || !same(load(`${attempt}/write-plan.json`), plan)) fail('Dry-run plan does not reproduce exactly with current inputs/helper/decision.');
  if (!options['--review'].startsWith('artifacts/') && !options['--review'].startsWith('research/source-files/')) fail('Exact plan review must be ignored checkout-local evidence.');
  ignored(options['--review']); guard(options['--review'], options['--review-sha256']);
  const review = load(options['--review']);
  if (review.formatVersion !== 1 || review.actualReviewerDecision !== true || review.approved !== true || review.planSha256 !== planSha || review.helperSha256 !== sha(helperRaw) || review.parentHead !== head || review.reviewedBy !== decision.reviewedBy || review.reviewedAt !== decision.reviewedAt || review.allFinalFilesRead !== true || !same(review.writePaths, wantedPaths)) fail('Actual root full-file review of the exact dry-run plan is required before apply.');
  const run = `${attempt}/${options['--run']}`; if (existsSync(local(run))) fail('Apply run must be unique and absent.'); mkdirSync(local(run));
  guard(`${attempt}/index-stage-before.bin`, sha(indexStageBefore), indexStageBefore.length);
  writeEvidence(`${run}/index-stage-before.bin`, indexStageBefore);
  for (const change of changes) {
    if (change.before) { guard(`${attempt}/before/${change.path}`, sha(change.before), change.before.length); writeEvidence(`${run}/rollback/${change.path}`, change.before); }
    else writeEvidence(`${run}/rollback-absence/${change.path}.json`, jsonBytes({ originallyAbsent: true, path: change.path }));
    guard(`${attempt}/planned/${change.path}`, sha(change.after), change.after.length);
    writeEvidence(`${run}/staging/${change.path}`, change.after);
  }
  writeEvidence(`${run}/authority.json`, jsonBytes({ parent, decision, review, parentSha256: options['--parent-sha256'], decisionSha256: options['--decision-sha256'], reviewSha256: options['--review-sha256'], exactPlanSha256: planSha }));
  writeEvidence(`${run}/authority/parent-raw.json`, bytes(options['--parent']));
  writeEvidence(`${run}/authority/decision-raw.json`, bytes(options['--decision']));
  writeEvidence(`${run}/authority/exact-plan-review-raw.json`, bytes(options['--review']));
  recheckInputs(); guard(options['--review'], options['--review-sha256']); clean();
  const written = [], startedAt = new Date().toISOString();
  try {
    for (const change of changes) {
      if (change.before) guard(change.path, sha(change.before), change.before.length); else if (existsSync(local(change.path))) fail('Originally absent production leaf appeared.');
      writeEvidence(`${run}/journal/${written.length}.json`, jsonBytes({ path: change.path, beforeSha256: change.before ? sha(change.before) : null, afterSha256: sha(change.after), stage: 'intent-before-atomic-rename' }));
      written.push(change); // Include this intended slot in guarded recovery if rename succeeds then throws.
      renameSync(local(`${run}/staging/${change.path}`), local(change.path));
      guard(change.path, sha(change.after), change.after.length);
    }
    for (const member of trackedInputs.filter(member => !changes.some(change => change.path === member.path))) guard(member.path, member.sha256, member.bytes);
    for (const member of inputCopies) guard(member.path, member.sha256, member.bytes);
    guard(options['--review'], options['--review-sha256']);
    if (git('rev-parse', 'HEAD') !== head || !gitRaw('ls-files', '--stage', '-z').equals(indexStageBefore)) fail('HEAD or exact index blob/mode/stage/path entries changed during application.');
    const changedTracked = gitRaw('diff', '--name-only', '-z').toString('utf8').split('\0').filter(Boolean).sort();
    if (!same(changedTracked, wantedPaths.filter(path => tracked.includes(path)))) fail('Unrelated tracked change appeared.');
    const untracked = gitRaw('ls-files', '--others', '--exclude-standard', '-z').toString('utf8').split('\0').filter(Boolean).sort();
    if (!same(untracked, [architectPath])) fail('Unexpected untracked final source appeared.');
    const minimalTrackedDiff = gitRaw('diff', '--', ...wantedPaths);
    // Final success boundary: recheck every generated target, including early writes.
    // A foreign mutation must enter guarded rollback/hold rather than get a false receipt.
    for (const change of changes) guard(change.path, sha(change.after), change.after.length);
    if (git('rev-parse', 'HEAD') !== head || !gitRaw('ls-files', '--stage', '-z').equals(indexStageBefore)) fail('HEAD or exact index changed at the final success boundary.');
    writeEvidence(`${run}/minimal-tracked.diff`, minimalTrackedDiff);
    writeEvidence(`${run}/application.json`, jsonBytes({ applied: true, startedAt, closedAt: new Date().toISOString(), exactPlanSha256: planSha, parentHead: head, reviewer: review, writes: plan.writes, results: plan.results, processHandles: 'All execFileSync Git calls returned; no subprocesses/background tasks/server/browser/network started.', noBuildOrDeploymentGateClaim: true }));
    console.log(JSON.stringify({ applied: true, receipt: `${run}/application.json`, planSha256: planSha, trackedWrites: written.length }, null, 2));
  } catch (error) {
    const rollback = [];
    for (const change of written.reverse()) {
      try {
        const current = existsSync(local(change.path)) ? bytes(change.path) : null;
        if (current && sha(current) === sha(change.after)) {
          if (change.before) { const restored = bytes(`${run}/rollback/${change.path}`); if (sha(restored) !== sha(change.before)) fail('Rollback preimage changed.'); writeEvidence(`${run}/restore/${change.path}`, restored); renameSync(local(`${run}/restore/${change.path}`), local(change.path)); }
          else unlinkSync(local(change.path)); // Only this guarded originally-absent owned leaf; never recursive.
          rollback.push({ path: change.path, restored: true });
        } else if ((!current && !change.before) || (current && change.before && sha(current) === sha(change.before))) rollback.push({ path: change.path, alreadyBefore: true });
        else rollback.push({ path: change.path, heldForeignChange: true });
      } catch (rollbackError) { rollback.push({ path: change.path, error: String(rollbackError) }); }
    }
    writeEvidence(`${run}/failure.json`, jsonBytes({ applied: false, startedAt, closedAt: new Date().toISOString(), error: String(error), rollback, indexStageExpectedSha256: sha(indexStageBefore), indexStageObservedSha256: sha(gitRaw('ls-files', '--stage', '-z')), foreignIndexNeverRestored: true, allEarlierAttemptsRetained: true, approvalAndGateClaim: false }));
    throw error;
  }
}
