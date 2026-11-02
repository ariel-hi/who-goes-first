import { expect, test, vi } from 'vitest';
import { campaignForDay, hashtagFacets, isSitePostOnDay, publicationDay, publicationKey, type SocialCampaign } from '../../scripts/lib/social-campaigns';
import { publishBluesky } from '../../scripts/lib/bluesky-publisher';
import { releaseLedger } from '../../scripts/lib/pinterest-release';
import { searchOpportunities } from '../../scripts/lib/search-opportunities';
import type { PublicRule } from '../../src/lib/content/schema';
import { toolCards } from '../../src/lib/tool-cards';

const date = new Date('2026-10-02T15:17:00Z');
const origin = 'https://whogoesfirst.fun';
const did = 'did:plc:fixture';
const campaign: SocialCampaign = { id: 'checklist', kind: 'guide', path: '/game-night-checklist/', image: '/og/game-night-checklist.png', title: 'Checklist', description: 'Plan game night.', text: 'Hosting game night? Try the checklist.' };
const value = { text: campaign.text, createdAt: date.toISOString(), embed: { external: { uri: `${origin}${campaign.path}` } } };

function fixture(options: { existing?: boolean; manual?: boolean; failure?: 'history' | 'page' | 'image' | 'concurrent'; manyOlder?: boolean; cursor?: boolean; publicationDate?: Date; campaign?: SocialCampaign; prior?: { createdAt: string; path: string; title: string }[] } = {}) {
  const selected = options.campaign ?? campaign;
  const fixtureDate = options.publicationDate ?? date;
  const fixtureUri = `at://${did}/app.bsky.feed.post/${publicationKey(fixtureDate)}`;
  let savedValue = { text: selected.text, createdAt: fixtureDate.toISOString(), embed: { external: { uri: `${origin}${selected.path}` } } };
  let saved = Boolean(options.existing);
  const bodies: Record<string, unknown>[] = [];
  const request = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    const json = (data: unknown, status = 200) => Response.json(data, { status });
    if (url.includes('createSession')) return json({ accessJwt: 'fixture-token', did });
    if (url.includes('getLatestCommit')) return new Headers(init?.headers).get('Authorization') === 'Bearer fixture-token' ? json({ cid: 'before-check' }) : json({ error: 'AuthMissing' }, 401);
    if (url.includes('getRecord')) return saved ? json({ uri: fixtureUri, value: savedValue }) : json({ error: options.failure === 'history' ? 'AuthRequired' : 'RecordNotFound' }, 400);
    if (url.includes('getAuthorFeed')) return json({ feed: options.manual ? [{ post: { uri: `at://${did}/app.bsky.feed.post/manual-key`, author: { did }, record: savedValue } }] : options.manyOlder ? Array.from({ length: 100 }, () => ({ post: { uri: fixtureUri, author: { did }, record: { ...savedValue, createdAt: '2026-09-30T15:17:00Z' } } })) : (options.prior ?? []).map((item, index) => ({ post: { uri: `at://${did}/app.bsky.feed.post/prior-${index}`, author: { did }, record: { createdAt: item.createdAt, embed: { external: { uri: `${origin}${item.path}`, title: item.title } } } } })), ...(options.manyOlder || options.cursor ? { cursor: 'older' } : {}) });
    if (url.startsWith(`${origin}/`) && init?.method === 'HEAD') return new Response(null, { status: options.failure === 'page' ? 404 : 200 });
    if (url.startsWith(`${origin}/og/`)) return new Response('png-fixture', { headers: { 'Content-Type': options.failure === 'image' ? 'text/html' : 'image/png' } });
    if (url.includes('uploadBlob')) return json({ blob: { ref: 'image-fixture' } });
    if (url.includes('createRecord')) {
      const body = JSON.parse(String(init?.body));
      bodies.push(body);
      if (options.failure === 'concurrent') return json({ error: 'InvalidSwap' }, 400);
      savedValue = body.record;
      saved = true;
      return json({ uri: fixtureUri });
    }
    throw new Error(`Unexpected request: ${url}`);
  });
  return { request: request as typeof fetch, calls: request, bodies };
}
const publish = (request: typeof fetch) => publishBluesky({ handle: 'whogoesfirst.fun', password: 'fixture-password', service: 'https://bsky.social', origin, date, campaign, request });

test('a verified daily post rerun creates exactly one record, with a clean destination and commit guard', async () => {
  const mock = fixture();
  expect(await publish(mock.request)).toEqual({ status: 'published', url: `https://bsky.app/profile/${did}/post/${publicationKey(date)}` });
  expect((await publish(mock.request)).status).toBe('already-published');
  expect(mock.bodies).toHaveLength(1);
  expect(mock.bodies[0]).toMatchObject({ rkey: publicationKey(date), swapCommit: 'before-check', record: { text: campaign.text, embed: { external: { uri: `${origin}${campaign.path}` } } } });
});

test('a rule post uses a different game when the recent feed already contains that game', async () => {
  const rules = [
    { id: 'citadels-a', slug: 'citadels-a', gameName: 'Citadels', editionLabel: '2016', firstPlayerRule: 'The oldest player starts.' },
    { id: 'citadels-b', slug: 'citadels-b', gameName: 'Citadels', editionLabel: '2020', firstPlayerRule: 'The oldest player starts.' },
    { id: 'other-game', slug: 'other-game', gameName: 'Other Game', editionLabel: '2026', firstPlayerRule: 'The youngest player starts.' },
  ] as PublicRule[];
  const publicationDate = Array.from({ length: 60 }, (_, offset) => new Date(Date.UTC(2026, 9, 31 + offset, 15, 17)))
    .find(day => campaignForDay(rules, day)?.title === 'Who goes first in Citadels?')!;
  const first = campaignForDay(rules, publicationDate)!;
  const mock = fixture({ publicationDate, campaign: first, prior: [{ createdAt: new Date(publicationDate.getTime() - 3 * 86_400_000).toISOString(), path: first.path, title: first.title }] });
  const result = await publishBluesky({ handle: 'whogoesfirst.fun', password: 'fixture-password', service: 'https://bsky.social', origin, date: publicationDate, campaign: first, rulePool: rules, request: mock.request });
  expect(result.status).toBe('published');
  expect(result.selectedCampaign?.path).toBe('/games/other-game/');
  expect(mock.bodies).toHaveLength(1);
  expect(mock.bodies[0]).toMatchObject({ record: { embed: { external: { uri: `${origin}/games/other-game/` } } } });
});

test('a rule post waits when its recent history is truncated', async () => {
  const publicationDate = new Date('2026-11-02T15:17:00Z');
  const rules = [{ id: 'one', slug: 'one', gameName: 'One', editionLabel: '2026', firstPlayerRule: 'The youngest player starts.' }] as PublicRule[];
  const selected = campaignForDay(rules, publicationDate)!;
  const mock = fixture({ publicationDate, campaign: selected, cursor: true, prior: [{ createdAt: '2026-11-01T15:17:00Z', path: '/games/other/', title: 'Who goes first in Other?' }] });
  await expect(publishBluesky({ handle: 'whogoesfirst.fun', password: 'fixture-password', service: 'https://bsky.social', origin, date: publicationDate, campaign: selected, rulePool: rules, request: mock.request })).rejects.toThrow('Recent rule history is incomplete');
  expect(mock.bodies).toHaveLength(0);
});

test('an earlier manual site post consumes the daily slot before any uploads or writes', async () => {
  const mock = fixture({ manual: true });
  expect((await publish(mock.request)).status).toBe('already-published');
  expect(mock.calls.mock.calls.some(call => String(call[0]).includes('uploadBlob'))).toBe(false);
  expect(mock.bodies).toHaveLength(0);
});

test('a long older author history does not disable future publication', async () => {
  const mock = fixture({ manyOlder: true });
  expect((await publish(mock.request)).status).toBe('published');
});

test.each(['history', 'page', 'image'] as const)('a %s failure prevents external publication', async failure => {
  const mock = fixture({ failure });
  await expect(publish(mock.request)).rejects.toThrow();
  expect(mock.bodies).toHaveLength(0);
});

test('a concurrent repository change fails safely without retrying an uncertain publication', async () => {
  const mock = fixture({ failure: 'concurrent' });
  await expect(publish(mock.request)).rejects.toThrow('createRecord failed');
  expect(mock.bodies).toHaveLength(1);
});

test('the daily cap uses the Pacific calendar and ignores replies or unrelated destinations', () => {
  const evening = new Date('2026-10-02T03:00:00Z');
  expect(publicationDay(evening)).toBe('2026-10-01');
  expect(publicationKey(date)).toMatch(/^[234567abcdefghij][234567abcdefghijklmnopqrstuvwxyz]{12}$/);
  expect(publicationKey(evening)).toBe(publicationKey(new Date('2026-10-01T15:17:00Z')));
  expect(publicationKey(evening)).not.toBe(publicationKey(date));
  const earlier = { ...value, createdAt: '2026-10-01T15:17:00Z' };
  expect(isSitePostOnDay(earlier, evening, origin)).toBe(true);
  expect(isSitePostOnDay({ ...earlier, reply: {} }, evening, origin)).toBe(false);
  expect(isSitePostOnDay({ ...earlier, createdAt: 'invalid' }, evening, origin)).toBe(false);
  expect(isSitePostOnDay({ createdAt: earlier.createdAt, text: 'Try whogoesfirst.fun/dice-roller/' }, evening, origin)).toBe(true);
  expect(isSitePostOnDay({ createdAt: earlier.createdAt, facets: [{ features: [{ uri: `${origin}/` }] }] }, evening, origin)).toBe(true);
  expect(isSitePostOnDay({ ...earlier, embed: { external: { uri: 'https://example.org/' } } }, evening, origin)).toBe(false);
});

test('the campaign week mixes practical tools, hosting advice and sourced rules without tracking URLs', () => {
  const rules = [{ id: 'fixture', slug: 'fixture', gameName: 'Fixture', editionLabel: '2026 edition', firstPlayerRule: 'The tallest player starts.' }] as PublicRule[];
  const week = Array.from({ length: 7 }, (_, day) => campaignForDay(rules, new Date(Date.UTC(2026, 9, 4 + day, 15, 17)))!);
  expect(week.filter(item => item.kind === 'rule')).toHaveLength(3);
  expect(week.filter(item => item.kind === 'tool')).toHaveLength(3);
  expect(new Set(week.filter(item => item.kind === 'tool').map(item => item.id)).size).toBe(3);
  expect(week.filter(item => item.kind === 'guide')).toHaveLength(1);
  for (let day = 0; day < 42; day++) {
    const item = campaignForDay(rules, new Date(Date.UTC(2026, 9, 4 + day, 15, 17)))!;
    expect(item.path).not.toMatch(/[?#]/);
    if (item.kind === 'tool') {
      const id = item.path.replaceAll('/', '');
      expect(toolCards[id]).toBeDefined();
      expect(item.image).toBe(`/og/tool-${id}.png`);
    }
    expect([...new Intl.Segmenter('en', { granularity: 'grapheme' }).segment(item.text)].length).toBeLessThanOrEqual(300);
    if (item.kind === 'rule') expect(item.description).toContain('2026 edition');
  }
  expect(campaignForDay(rules, new Date('2026-10-02T03:00:00Z'))?.id).toBe(campaignForDay(rules, new Date('2026-10-01T15:17:00Z'))?.id);
});

test('the expanded rotation avoids recent live campaigns across its October 22 cutover', () => {
  const recent: { day: string; id: string; kind: 'tool' | 'guide' }[] = [
    { day: '2026-10-02', id: 'checklist', kind: 'guide' },
    { day: '2026-10-04', id: 'letter', kind: 'tool' },
    { day: '2026-10-06', id: 'timer', kind: 'tool' },
    { day: '2026-10-08', id: 'letter', kind: 'tool' },
    { day: '2026-10-09', id: 'checklist', kind: 'guide' },
    { day: '2026-10-11', id: 'scores', kind: 'tool' },
    { day: '2026-10-13', id: 'teams', kind: 'tool' },
    { day: '2026-10-15', id: 'timer', kind: 'tool' },
    { day: '2026-10-16', id: 'table-cards', kind: 'guide' },
    { day: '2026-10-18', id: 'letter', kind: 'tool' },
    { day: '2026-10-20', id: 'dice', kind: 'tool' },
    { day: '2026-10-22', id: 'scores', kind: 'tool' },
  ];
  const dayNumber = (day: string) => Date.parse(`${day}T12:00:00Z`) / 86_400_000;
  for (let offset = 0; offset < 60; offset++) {
    const date = new Date(Date.UTC(2026, 9, 23 + offset, 15, 17));
    const selected = campaignForDay([], date);
    if (!selected || selected.kind === 'rule') continue;
    const day = publicationDay(date);
    const repeats = recent.filter(previous => previous.kind === selected.kind && dayNumber(day) - dayNumber(previous.day) <= 20).map(previous => previous.id);
    expect(repeats, `recent ${selected.kind} campaigns before ${day}`).not.toContain(selected.id);
    recent.push({ day, id: selected.id, kind: selected.kind });
  }
});

test('Pinterest reruns are idempotent and recover overdue items without releasing future items', () => {
  const pins = [{ id: 'old', date: '2026-10-01' }, { id: 'due', date: '2026-10-02' }, { id: 'future', date: '2026-10-03' }];
  const ledger = releaseLedger('2026-10-01 old\n2026-10-01 old\n', pins, '2026-10-02');
  expect(ledger).toBe('2026-10-01 old\n2026-10-02 due\n');
  expect(releaseLedger(ledger, pins, '2026-10-02')).toBe(ledger);
});

test('discovery hashtags remain clickable after Unicode text and fit the platform limit', () => {
  const text = '🎲 Let’s play. #BoardGames #GameNight';
  const facets = hashtagFacets(text);
  expect(facets).toHaveLength(2);
  for (const facet of facets) expect(Buffer.from(text).subarray(facet.index.byteStart, facet.index.byteEnd).toString()).toBe(`#${facet.features[0]!.tag}`);
  const longRule = [{ id: 'long', slug: 'long', gameName: 'Long Game', editionLabel: '2026', firstPlayerRule: 'The player who most recently visited '.repeat(30) }] as PublicRule[];
  const generated = campaignForDay(longRule, new Date('2026-10-03T15:17:00Z'))!;
  expect([...new Intl.Segmenter('en', { granularity: 'grapheme' }).segment(generated.text)].length).toBeLessThanOrEqual(300);
  expect(hashtagFacets(generated.text)).toHaveLength(2);
});

test('search opportunities include tools but exclude private URLs, noindex pages and unreliable samples', () => {
  const paths = new Set(['/dice-roller/', '/game-night-checklist/', '/games/fixture/']);
  const row = (path: string, impressions = 100, position = 8) => ({ keys: [`${origin}${path}`], impressions, clicks: 0, ctr: 0, position });
  const ranked = searchOpportunities([row('/dice-roller/'), row('/game-night-checklist/', 10), row('/games/fixture/', 4), row('/dice-roller/?players=private'), row('/games/a/'), row('/dice-roller/', 120, NaN), { ...row('/dice-roller/'), keys: ['https://example.org/dice-roller/'] }], origin, paths);
  expect(ranked.map(item => [item.path, item.readiness])).toEqual([['/dice-roller/', 'experiment'], ['/game-night-checklist/', 'watch']]);
});
