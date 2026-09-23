import { cpSync, existsSync, mkdirSync, readFileSync, symlinkSync, writeFileSync, mkdtempSync, readdirSync, unlinkSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { contentRevision, ruleSchema, promptSchema } from '../src/lib/content/schema';
const root = resolve('.');
mkdirSync('artifacts/release-fixtures', { recursive: true });
const fixtureRoot = mkdtempSync(resolve('artifacts/release-fixtures/run-'));
for (const name of ['src', 'public', 'research', 'scripts']) cpSync(join(root, name), join(fixtureRoot, name), { recursive: true, filter: source => !source.includes('source-files') });
// Exercise the empty-catalog states even after real reviewed rules are added.
// Remove only JSON records in the isolated copy, never the working catalog.
for (const kind of ['games', 'prompts']) for (const name of readdirSync(join(fixtureRoot, 'src/content', kind))) {
  if (name.endsWith('.json')) unlinkSync(join(fixtureRoot, 'src/content', kind, name));
}
for (const name of ['astro.config.ts', 'tsconfig.json', 'package.json']) cpSync(join(root, name), join(fixtureRoot, name));
if (!existsSync(join(fixtureRoot, 'node_modules'))) symlinkSync(join(root, 'node_modules'), join(fixtureRoot, 'node_modules'), 'junction');
const node = process.execPath;
const astro = join(root, 'node_modules/astro/bin/astro.mjs');
const tsx = join(root, 'node_modules/tsx/dist/cli.mjs');
const origin = 'https://who-goes-first.release-check.net';
const releaseDetails = { CONTACT_EMAIL: 'owner@release-check.net', PRIVACY_HOST_NAME: 'Fixture Host', PRIVACY_LOGGING_POLICY: 'Fixture access logs are deleted after 30 days.' };
function build(name: string, extra: Record<string, string>) {
  const out = join(fixtureRoot, name);
  const env = { ...process.env, ASTRO_TELEMETRY_DISABLED: '1', DEPLOY_CONTEXT: 'preview', SITE_URL: origin, BUILD_OUT_DIR: out, ...extra };
  const result = spawnSync(node, [astro, 'build'], { cwd: fixtureRoot, env, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stdout + result.stderr);
  const audit = spawnSync(node, [tsx, 'scripts/audit-build.ts'], { cwd: fixtureRoot, env, encoding: 'utf8' });
  if (audit.status !== 0) throw new Error(audit.stdout + audit.stderr);
  console.log(`${name}: built and audited`);
  return out;
}
const preview = build('preview-empty', {});
assert.match(readFileSync(join(preview, 'index.html'), 'utf8'), /content="noindex, follow"/);
assert.doesNotMatch(readFileSync(join(preview, 'sitemap.xml'), 'utf8'), /<loc>/);
assert.match(readFileSync(join(preview, '_headers'), 'utf8'), /X-Robots-Tag: noindex/);
const production = build('production-empty', { DEPLOY_CONTEXT: 'production', ...releaseDetails });
assert.match(readFileSync(join(production, 'index.html'), 'utf8'), /content="index, follow"/);
assert.match(readFileSync(join(production, 'games/index.html'), 'utf8'), /content="noindex, follow"/);
assert.doesNotMatch(readFileSync(join(production, 'sitemap.xml'), 'utf8'), /\/games\/|\/house-rules\/|\/dev\//);
assert.doesNotMatch(readFileSync(join(production, '_headers'), 'utf8'), /X-Robots-Tag/);
const record = ruleSchema.parse({
  id: 'synthetic-fixture', slug: 'synthetic-fixture', gameName: 'Synthetic Fixture Game', aliases: ['Fixture Alias'], editionLabel: 'Invented test edition', language: 'en',
  firstPlayerRule: 'This synthetic answer exists only to exercise a build test.', officialTieBreak: null, houseFallback: 'Use the test picker.', clarifications: ['Synthetic setup clarification.'], interpretation: null,
  sources: [{ url: 'https://publisher.example.org/fixture.pdf', title: 'Synthetic source — no real research claim', publisher: 'Test fixture', printedPages: ['1'], pdfPagesOneBased: [1], location: 'Synthetic page 1', checkedAt: '2026-09-19' }],
  internalEvidence: 'PRIVATE_BUILD_CANARY_7H3', uncertainty: [], status: 'approved', approvedBy: 'AUTOMATED FIXTURE ONLY — NOT HUMAN APPROVAL', approvedRevision: null, publishedAt: '2026-09-19', materiallyUpdatedAt: '2026-09-19',
});
record.approvedRevision = contentRevision(record);
writeFileSync(join(fixtureRoot, 'src/content/games/synthetic-fixture.json'), JSON.stringify(record));
// Enough distinct metadata blocks to catch a global-CSP-hash-per-page design.
// These invented pages remain only inside this ignored test copy.
for (let index = 1; index <= 40; index++) {
  const extra = { ...record, id: `synthetic-scale-${index}`, slug: `synthetic-scale-${index}`, gameName: `Synthetic Scale Game ${index}` };
  extra.approvedRevision = contentRevision(extra);
  writeFileSync(join(fixtureRoot, `src/content/games/${extra.id}.json`), JSON.stringify(extra));
}
const prompt = promptSchema.parse({ id: 'synthetic-prompt', slug: 'synthetic-prompt', language: 'en', sourceType: 'original-house-rule', prompt: 'Which fictional test participant volunteers?', internalReviewNotes: 'PRIVATE_PROMPT_CANARY_8J2', status: 'approved', approvedBy: 'AUTOMATED FIXTURE ONLY — NOT HUMAN APPROVAL', approvedRevision: null, publishedAt: '2026-09-19', materiallyUpdatedAt: '2026-09-19' });
prompt.approvedRevision = contentRevision(prompt);
writeFileSync(join(fixtureRoot, 'src/content/prompts/synthetic-prompt.json'), JSON.stringify(prompt));
const populated = build('production-fixtures', { DEPLOY_CONTEXT: 'production', ...releaseDetails });
const privacy = readFileSync(join(populated, 'privacy/index.html'), 'utf8');
assert.match(privacy, /The hosting provider is Fixture Host\. Fixture access logs are deleted after 30 days\./);
assert.doesNotMatch(privacy, /This local version has no public hosting service configured/);
const answer = readFileSync(join(populated, 'games/synthetic-fixture/index.html'), 'utf8');
assert.match(answer, /This synthetic answer exists only/);
assert.match(answer, /publisher.example.org/);
assert.match(answer, /content="index, follow"/);
assert.doesNotMatch(answer, /PRIVATE_BUILD_CANARY|AUTOMATED FIXTURE|astro-island|component-url/);
assert.match(readFileSync(join(populated, 'sitemap.xml'), 'utf8'), /\/games\/synthetic-fixture\//);
assert.match(readFileSync(join(populated, 'sitemap.xml'), 'utf8'), /\/house-rules\//);
assert.match(readFileSync(join(populated, 'house-rules/index.html'), 'utf8'), /Which fictional test participant volunteers/);
assert.doesNotMatch(readFileSync(join(populated, 'house-rules/index.html'), 'utf8'), /PRIVATE_PROMPT_CANARY/);
const disabled = build('balloon-disabled', { DISABLE_BALLOON: 'true' });
assert.doesNotMatch(readFileSync(join(disabled, 'index.html'), 'utf8'), /href="\/methods\/balloon\/"|value="balloon"/);
const disabledBalloon = readFileSync(join(disabled, 'methods/balloon/index.html'), 'utf8');
assert.match(disabledBalloon, /Balloon Rise is unavailable\. You can still pick a player\./);
assert.match(disabledBalloon, /content="noindex, follow"/);
assert.match(disabledBalloon, /&quot;initialMode&quot;:\[0,&quot;quick&quot;\]/);
assert.doesNotMatch(disabledBalloon, /value="balloon"|How Balloon Rise works/);
const invalid = spawnSync(node, [astro, 'build'], { cwd: fixtureRoot, env: { ...process.env, DEPLOY_CONTEXT: 'production', SITE_URL: 'https://example.com', BUILD_OUT_DIR: join(fixtureRoot, 'invalid') }, encoding: 'utf8' });
assert.notEqual(invalid.status, 0);
for (const [name, details, expected] of [
  ['missing-contact', { ...releaseDetails, CONTACT_EMAIL: '' }, 'CONTACT_EMAIL'],
  ['missing-host', { ...releaseDetails, PRIVACY_HOST_NAME: '' }, 'PRIVACY_HOST_NAME'],
  ['missing-logging', { ...releaseDetails, PRIVACY_LOGGING_POLICY: '' }, 'PRIVACY_LOGGING_POLICY'],
] as const) {
  const rejected = spawnSync(node, [astro, 'build'], { cwd: fixtureRoot, env: { ...process.env, DEPLOY_CONTEXT: 'production', SITE_URL: origin, BUILD_OUT_DIR: join(fixtureRoot, name), ...details }, encoding: 'utf8' });
  assert.notEqual(rejected.status, 0);
  assert.match(rejected.stdout + rejected.stderr, new RegExp(expected));
}
console.log('Release matrix passed: preview, empty production, isolated synthetic content, disabled mode, and missing-domain/contact/hosting rejection. Fixture output is never deployable content.');
writeFileSync('artifacts/release-fixtures/latest.json', JSON.stringify({ createdAt: new Date().toISOString(), fixtureRoot, production, populated }, null, 2));
