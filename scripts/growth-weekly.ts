import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { getBoardGames } from '../src/lib/content/board-games';
import { getCatalog } from '../src/lib/content/catalog';
import { analyticsTotals, daysAgo, googleAccessToken, searchAnalytics, type AnalyticsTotals, type SearchRow } from './lib/google-api';
import { rankDemand } from './lib/demand';

// Weekly job: turns Search Console demand into a research queue for the rule
// pipeline and writes a traffic report with ad-network readiness.
//   GOOGLE_SERVICE_ACCOUNT_JSON  service account key (added as a user in Search Console / GA)
//   GSC_PROPERTY                 e.g. sc-domain:whogoesfirst.fun
//   GA4_PROPERTY_ID              optional numeric GA4 property ID
//   SITE_URL                     canonical origin
const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
const property = process.env.GSC_PROPERTY || 'sc-domain:whogoesfirst.fun';
const gaProperty = process.env.GA4_PROPERTY_ID?.trim();
const origin = new URL(process.env.SITE_URL || 'https://whogoesfirst.fun').origin;
if (!credentials) { console.log('GOOGLE_SERVICE_ACCOUNT_JSON is not set; skipping the weekly growth job.'); process.exit(0); }

// Monthly minimums as the networks published them in 2025. They change; confirm
// on the network's own site before applying. Ezoic and AdSense have none.
const adNetworks = [
  { name: 'Mediavine Journey', metric: 'sessions', monthly: 10_000 },
  { name: 'Raptive', metric: 'screenPageViews', monthly: 25_000 },
  { name: 'Mediavine', metric: 'sessions', monthly: 50_000 },
] as const;

const token = await googleAccessToken(credentials, ['https://www.googleapis.com/auth/webmasters.readonly', ...(gaProperty ? ['https://www.googleapis.com/auth/analytics.readonly'] : [])]);
const end = daysAgo(3);
const window28 = { start: daysAgo(30), end };
const [queries, pages, thisWeek, lastWeek] = await Promise.all([
  searchAnalytics(token, property, window28.start, end, ['query']),
  searchAnalytics(token, property, window28.start, end, ['page']),
  searchAnalytics(token, property, daysAgo(9), end, ['date']),
  searchAnalytics(token, property, daysAgo(16), daysAgo(10), ['date']),
]);
const games = getBoardGames().map(game => ({ name: game.name, bggId: game.bggId, hasRule: game.rules.length > 0 }));
const demand = rankDemand(queries, pages, games, origin);
const sum = (rows: SearchRow[]) => rows.reduce((total, row) => ({ clicks: total.clicks + row.clicks, impressions: total.impressions + row.impressions }), { clicks: 0, impressions: 0 });
const weekNow = sum(thisWeek); const weekBefore = sum(lastWeek);
let traffic: AnalyticsTotals | undefined;
if (gaProperty) {
  try { traffic = await analyticsTotals(token, gaProperty, '30daysAgo', 'yesterday'); }
  catch (error) { console.warn(`GA4 report skipped: ${(error as Error).message}`); }
}

mkdirSync('research/demand', { recursive: true });
writeFileSync('research/demand/search-console.json', `${JSON.stringify({
  generatedAt: new Date().toISOString(), property, window: window28,
  note: 'Research priority input. Games are ranked by Search Console impressions for starting-player queries that name them. Demand never substitutes for a primary source.',
  ...demand,
}, null, 2)}\n`);

const change = (now: number, before: number) => before ? `${now >= before ? '+' : ''}${Math.round(((now - before) / before) * 100)}%` : 'new';
const pct = (value: number) => `${(value * 100).toFixed(1)}%`;
const topQueries = queries.toSorted((a, b) => b.clicks - a.clicks || b.impressions - a.impressions).slice(0, 10);
const topPages = pages.toSorted((a, b) => b.clicks - a.clicks || b.impressions - a.impressions).slice(0, 10);
const readiness = traffic ? adNetworks.map(network => {
  const value = traffic[network.metric];
  return `| ${network.name} | ${network.monthly.toLocaleString('en')} ${network.metric === 'sessions' ? 'sessions' : 'pageviews'} | ${value.toLocaleString('en')} | ${value >= network.monthly ? '**Eligible — apply**' : `${Math.round((value / network.monthly) * 100)}%`} |`;
}).join('\n') : '';
const report = `# Weekly growth report — ${new Date().toISOString().slice(0, 10)}

## Search (Google, last 7 days of final data vs the 7 before)
- Clicks: **${weekNow.clicks.toLocaleString('en')}** (${change(weekNow.clicks, weekBefore.clicks)})
- Impressions: **${weekNow.impressions.toLocaleString('en')}** (${change(weekNow.impressions, weekBefore.impressions)})
- Published rules: ${getCatalog().length}

${traffic ? `## Traffic (GA4, last 30 days)
- Sessions: **${traffic.sessions.toLocaleString('en')}** · Pageviews: **${traffic.screenPageViews.toLocaleString('en')}** · Users: ${traffic.totalUsers.toLocaleString('en')}
- Pageviews per session: ${traffic.sessions ? (traffic.screenPageViews / traffic.sessions).toFixed(2) : '—'}

## Ad network readiness
Thresholds were published in 2025 and change; confirm before applying.

| Network | Monthly minimum | Current | Status |
| --- | --- | --- | --- |
${readiness}
` : '_GA4 totals unavailable: set GA4_PROPERTY_ID and give the service account Viewer access._\n'}
## Research queue (last 28 days)
${demand.missingRules.length ? demand.missingRules.slice(0, 15).map((game, index) => `${index + 1}. **${game.name}** (BGG ${game.bggId}) — ${game.impressions} impressions: ${game.queries.map(query => `“${query}”`).join(', ')}`).join('\n') : 'No starting-rule searches for games without a sourced rule yet.'}

${demand.unmatchedQueries.length ? `Starting-rule searches that match no known game (possible new games):\n${demand.unmatchedQueries.slice(0, 10).map(row => `- “${row.query}” — ${row.impressions}`).join('\n')}\n` : ''}
${demand.lowClickPages.length ? `## Rule pages seen but rarely clicked\n${demand.lowClickPages.slice(0, 10).map(row => `- ${row.page} — ${row.impressions} impressions, ${pct(row.ctr)} CTR, position ${row.position}`).join('\n')}\n` : ''}
## Top queries (28 days)
${topQueries.map(row => `- “${row.keys[0]}” — ${row.clicks} clicks, ${row.impressions} impressions`).join('\n') || '—'}

## Top pages (28 days)
${topPages.map(row => `- ${row.keys[0]!.replace(origin, '') || '/'} — ${row.clicks} clicks, ${row.impressions} impressions`).join('\n') || '—'}
`;
writeFileSync('research/demand/weekly-report.md', report);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, report);
console.log(report);
