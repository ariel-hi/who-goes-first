import { getCatalog } from '../src/lib/content/catalog';
import { randomRuleEligible } from '../src/lib/content/random-rules';
import { postText, ruleForDay } from './lib/social';

// Daily "rule of the day" post. Draws only from the reviewed portable criteria,
// which make sense without the game in front of you. Each network is optional:
//   BLUESKY_HANDLE + BLUESKY_APP_PASSWORD (+ BLUESKY_SERVICE, default https://bsky.social)
//   MASTODON_INSTANCE + MASTODON_TOKEN (an app token with write:statuses only)
// With neither set, or with --dry-run, it prints the post instead.
const origin = new URL(process.env.SITE_URL || 'https://whogoesfirst.fun').origin;
const dryRun = process.argv.includes('--dry-run');
const rule = ruleForDay(getCatalog().filter(randomRuleEligible), new Date());
if (!rule) { console.log('No eligible rules to post.'); process.exit(0); }
const url = `${origin}/games/${rule.slug}/`;

// Never link a page that isn't live yet (approved but not deployed).
if (!dryRun) {
  const live = await fetch(url, { method: 'HEAD', redirect: 'manual' });
  if (live.status !== 200) { console.log(`Skipping: ${url} returned ${live.status}.`); process.exit(0); }
}

const bluesky = { handle: process.env.BLUESKY_HANDLE?.trim(), password: process.env.BLUESKY_APP_PASSWORD?.trim(), service: process.env.BLUESKY_SERVICE?.trim() || 'https://bsky.social' };
const mastodon = { instance: process.env.MASTODON_INSTANCE?.trim().replace(/\/$/, ''), token: process.env.MASTODON_TOKEN?.trim() };
const failures: string[] = [];

async function xrpc<T>(method: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${bluesky.service}/xrpc/${method}`, init);
  if (!response.ok) throw new Error(`Bluesky ${method} failed (${response.status}): ${await response.text()}`);
  return await response.json() as T;
}

if (bluesky.handle && bluesky.password && !dryRun) {
  try {
    const session = await xrpc<{ accessJwt: string; did: string }>('com.atproto.server.createSession', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ identifier: bluesky.handle, password: bluesky.password }) });
    const auth = { Authorization: `Bearer ${session.accessJwt}` };
    // The link card carries the page's own share image.
    let thumb: unknown;
    const image = await fetch(`${origin}/og/${rule.slug}.png`);
    if (image.ok) thumb = (await xrpc<{ blob: unknown }>('com.atproto.repo.uploadBlob', { method: 'POST', headers: { ...auth, 'Content-Type': 'image/png' }, body: new Uint8Array(await image.arrayBuffer()) })).blob;
    await xrpc('com.atproto.repo.createRecord', { method: 'POST', headers: { ...auth, 'Content-Type': 'application/json' }, body: JSON.stringify({
      repo: session.did, collection: 'app.bsky.feed.post',
      record: { $type: 'app.bsky.feed.post', text: postText(rule, 300), createdAt: new Date().toISOString(), langs: ['en'],
        embed: { $type: 'app.bsky.embed.external', external: { uri: url, title: `Who goes first in ${rule.gameName}?`, description: rule.firstPlayerRule, ...(thumb ? { thumb } : {}) } } },
    }) });
    console.log(`Posted to Bluesky: ${rule.gameName}`);
  } catch (error) { failures.push((error as Error).message); }
}

if (mastodon.instance && mastodon.token && !dryRun) {
  try {
    // Mastodon counts every link as 23 characters; the card comes from the page's Open Graph tags.
    const response = await fetch(`${mastodon.instance}/api/v1/statuses`, { method: 'POST', headers: { Authorization: `Bearer ${mastodon.token}`, 'Content-Type': 'application/json', 'Idempotency-Key': `wgf-${new Date().toISOString().slice(0, 10)}` }, body: JSON.stringify({ status: `${postText(rule, 500 - 23 - 2)}\n\n${url}`, visibility: 'public', language: 'en' }) });
    if (!response.ok) throw new Error(`Mastodon post failed (${response.status}): ${await response.text()}`);
    console.log(`Posted to Mastodon: ${rule.gameName}`);
  } catch (error) { failures.push((error as Error).message); }
}

if (dryRun || (!(bluesky.handle && bluesky.password) && !(mastodon.instance && mastodon.token))) {
  console.log(`${dryRun ? 'Dry run' : 'No social accounts configured'}. Today's post:\n\n${postText(rule, 300)}\n${url}`);
}
if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
