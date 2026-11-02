import type { PublicRule } from '../../src/lib/content/schema';
import { campaignForDay, hashtagFacets, isSitePostOnDay, publicationDay, publicationKey, type SocialCampaign } from './social-campaigns';

type Options = { handle: string; password: string; service: string; origin: string; date: Date; campaign: SocialCampaign; rulePool?: PublicRule[]; request?: typeof fetch };
type RecordResult = { uri: string; value?: Parameters<typeof isSitePostOnDay>[0] };

/** Repository date key + optimistic commit guard make reruns and concurrent runs safe. */
export async function publishBluesky(options: Options): Promise<{ status: 'published' | 'already-published'; url: string; selectedCampaign?: SocialCampaign }> {
  const { handle, password, service, origin, date, campaign, rulePool, request = fetch } = options;
  const rkey = publicationKey(date);
  const collection = 'app.bsky.feed.post';
  async function xrpc<T>(method: string, init: RequestInit = {}): Promise<T> {
    const response = await request(`${service}/xrpc/${method}`, { ...init, signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error(`Bluesky ${method.split('?')[0]} failed (${response.status}).`);
    return await response.json() as T;
  }
  const session = await xrpc<{ accessJwt: string; did: string }>('com.atproto.server.createSession', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ identifier: handle, password }) });
  const auth = { Authorization: `Bearer ${session.accessJwt}` };
  const parameters = new URLSearchParams({ repo: session.did, collection, rkey });
  const permalink = (uri: string) => `https://bsky.app/profile/${session.did}/post/${uri.split('/').at(-1)}`;
  // Capture the commit BEFORE checking records, so another publisher cannot
  // insert a date key between our check and write without invalidating the write.
  const commit = await xrpc<{ cid: string }>(`com.atproto.sync.getLatestCommit?${new URLSearchParams({ did: session.did })}`, { headers: auth });
  const existingResponse = await request(`${service}/xrpc/com.atproto.repo.getRecord?${parameters}`, { signal: AbortSignal.timeout(15000) });
  if (existingResponse.ok) return { status: 'already-published', url: permalink((await existingResponse.json() as RecordResult).uri) };
  const missing = await existingResponse.json() as { error?: string };
  if (missing.error !== 'RecordNotFound') throw new Error(`Cannot verify today's Bluesky record (${existingResponse.status}).`);
  // The app view sorts by publication time; repository keys do not. This also
  // finds manual posts using ordinary TIDs after months of dated bot records.
  const recentResponse = await request(`https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?${new URLSearchParams({ actor: session.did, filter: 'posts_no_replies', limit: '100' })}`, { signal: AbortSignal.timeout(15000) });
  if (!recentResponse.ok) throw new Error('Cannot check recent Bluesky posts; skipping publication.');
  const recent = await recentResponse.json() as { feed: { post: { uri: string; author: { did: string }; record: Parameters<typeof isSitePostOnDay>[0] } }[]; cursor?: string };
  const earlier = recent.feed.find(item => item.post.author.did === session.did && isSitePostOnDay(item.post.record, date, origin));
  if (earlier) return { status: 'already-published', url: permalink(earlier.post.uri) };
  // Never treat a full same-day page as proof there was no manual/legacy post.
  const lastDate = recent.feed.at(-1)?.post.record.createdAt;
  if (recent.cursor && (!lastDate || !Number.isFinite(Date.parse(lastDate)) || publicationDay(new Date(lastDate)) >= publicationDay(date))) throw new Error('Daily post history is incomplete; skipping publication to avoid a duplicate.');
  let activeCampaign = campaign;
  if (campaign.kind === 'rule') {
    if (!rulePool?.length) throw new Error('Reviewed rule pool is unavailable; skipping publication.');
    const dayNumber = (value: string) => Date.parse(`${value}T12:00:00Z`) / 86_400_000;
    const today = dayNumber(publicationDay(date));
    if (recent.cursor && dayNumber(publicationDay(new Date(lastDate!))) >= today - 20) throw new Error('Recent rule history is incomplete; skipping publication to avoid a repeat.');
    const prior = recent.feed.filter(item => {
      const createdAt = item.post.record.createdAt;
      if (item.post.author.did !== session.did || !createdAt || !Number.isFinite(Date.parse(createdAt))) return false;
      const age = today - dayNumber(publicationDay(new Date(createdAt)));
      return age >= 1 && age <= 20;
    });
    const paths = new Set(prior.map(item => item.post.record.embed?.external?.uri));
    const titles = new Set(prior.map(item => item.post.record.embed?.external?.title));
    const excluded = new Set(rulePool.filter(rule => paths.has(`${origin}/games/${rule.slug}/`) || titles.has(`Who goes first in ${rule.gameName}?`)).map(rule => rule.slug));
    const distinct = campaignForDay(rulePool, date, excluded);
    if (!distinct) throw new Error('No distinct reviewed rule campaign is available today.');
    activeCampaign = distinct;
  }
  const live = await request(`${origin}${activeCampaign.path}`, { method: 'HEAD', redirect: 'manual', signal: AbortSignal.timeout(15000) });
  if (live.status !== 200) throw new Error(`Campaign destination is not live (${live.status}): ${activeCampaign.path}`);
  const image = await request(`${origin}${activeCampaign.image}`, { redirect: 'error', signal: AbortSignal.timeout(15000) });
  if (!image.ok || !image.headers.get('content-type')?.startsWith('image/png')) throw new Error('Campaign image is unavailable; skipping publication.');
  const thumb = (await xrpc<{ blob: unknown }>('com.atproto.repo.uploadBlob', { method: 'POST', headers: { ...auth, 'Content-Type': 'image/png' }, body: new Uint8Array(await image.arrayBuffer()) })).blob;
  const result = await xrpc<RecordResult>('com.atproto.repo.createRecord', { method: 'POST', headers: { ...auth, 'Content-Type': 'application/json' }, body: JSON.stringify({
    repo: session.did, collection, rkey, swapCommit: commit.cid,
    record: { $type: collection, text: activeCampaign.text, facets: hashtagFacets(activeCampaign.text), createdAt: date.toISOString(), langs: ['en'],
      embed: { $type: 'app.bsky.embed.external', external: { uri: `${origin}${activeCampaign.path}`, title: activeCampaign.title, description: activeCampaign.description, thumb } } },
  }) });
  const verified = await xrpc<RecordResult>(`com.atproto.repo.getRecord?${parameters}`);
  if (verified.uri !== result.uri || verified.value?.text !== activeCampaign.text || verified.value?.createdAt !== date.toISOString() || verified.value?.embed?.external?.uri !== `${origin}${activeCampaign.path}`) throw new Error('Published Bluesky record did not match the campaign.');
  return { status: 'published', url: permalink(result.uri), ...(activeCampaign.id !== campaign.id ? { selectedCampaign: activeCampaign } : {}) };
}
