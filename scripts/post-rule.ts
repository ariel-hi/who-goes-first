import { appendFileSync } from 'node:fs';
import { getCatalog } from '../src/lib/content/catalog';
import { randomRuleEligible } from '../src/lib/content/random-rules';
import { campaignForDay } from './lib/social-campaigns';
import { publishBluesky } from './lib/bluesky-publisher';

// One daily practical campaign. Only reviewed portable rules are eligible.
// Production is hosted in GitHub Actions; no desktop session is required.
const origin = new URL(process.env.SITE_URL || 'https://whogoesfirst.fun').origin;
const date = new Date();
const campaign = campaignForDay(getCatalog().filter(randomRuleEligible), date);
if (!campaign) throw new Error('No reviewed campaign is available today.');
const dryRun = process.argv.includes('--dry-run');
const handle = process.env.BLUESKY_HANDLE?.trim().replace(/^@/, '');
const password = process.env.BLUESKY_APP_PASSWORD?.trim();
const service = process.env.BLUESKY_SERVICE?.trim() || 'https://bsky.social';
const instance = process.env.MASTODON_INSTANCE?.trim().replace(/\/$/, '');
const token = process.env.MASTODON_TOKEN?.trim();
const summaries: string[] = [];
if (dryRun) {
  console.log(JSON.stringify({ status: 'dry-run', ...campaign, url: `${origin}${campaign.path}` }, null, 2));
} else {
  if (!(handle && password) && !(instance && token)) throw new Error('No publishing account is configured. Set Bluesky credentials or run --dry-run.');
  if (handle && password) {
    const result = await publishBluesky({ handle, password, service, origin, date, campaign });
    summaries.push(`Bluesky: ${result.status} — ${result.url}`);
  }
  if (instance && token) {
    const live = await fetch(`${origin}${campaign.path}`, { method: 'HEAD', redirect: 'manual', signal: AbortSignal.timeout(15000) });
    if (live.status !== 200) throw new Error('Mastodon campaign destination is not live.');
    const response = await fetch(`${instance}/api/v1/statuses`, { method: 'POST', signal: AbortSignal.timeout(15000), headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'Idempotency-Key': `wgf-${date.toISOString().slice(0, 10)}` }, body: JSON.stringify({ status: `${campaign.text}\n\n${origin}${campaign.path}`, visibility: 'public', language: 'en' }) });
    if (!response.ok) throw new Error(`Mastodon publication failed (${response.status}).`);
    const published = await response.json() as { url: string };
    summaries.push(`Mastodon: published — ${published.url}`);
  }
  console.log(summaries.join('\n'));
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## Daily discovery campaign\n\n${campaign.kind}: ${campaign.title}\n\n${summaries.join('\n\n')}\n`);
}
