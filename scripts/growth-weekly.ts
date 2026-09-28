import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { getBoardGames } from '../src/lib/content/board-games';
import { getCatalog } from '../src/lib/content/catalog';
import { analyticsAcquisition, analyticsAffiliateOpens, analyticsCountryTraffic, analyticsTotals, daysAgo, googleAccessToken, searchAnalytics, type AnalyticsTotals, type SearchRow } from './lib/google-api';
import { rankDemand } from './lib/demand';
import { adNetworkReadiness } from './lib/ad-network-readiness';
import { ga4TrafficMetrics } from './lib/growth-report';
import { summarizeCountryTraffic, type CountryTrafficSummary, type UnavailableCountryTraffic } from './lib/country-traffic';
import { indexingReport, indexingSnapshot } from './lib/indexing-diagnostics';
import { acquisitionReport, summarizeAcquisition, type AcquisitionSummary, type UnavailableAcquisition } from './lib/acquisition';
import { affiliateEventsReport, affiliateEventsSummary, affiliateMeasurementStart, type AffiliateEventsSnapshot } from './lib/affiliate-events';

// Weekly job: turns Search Console demand into a research queue for the rule
// pipeline and writes a traffic report with ad-network readiness.
//   GOOGLE_ACCESS_TOKEN          short-lived token from keyless GitHub OIDC auth (preferred)
//   GOOGLE_SERVICE_ACCOUNT_JSON  or a service account key (added as a user in Search Console / GA)
//   GSC_PROPERTY                 e.g. sc-domain:whogoesfirst.fun
//   GA4_PROPERTY_ID              optional numeric GA4 property ID
//   SITE_URL                     canonical origin
const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
const property = process.env.GSC_PROPERTY || 'https://whogoesfirst.fun/';
const gaProperty = process.env.GA4_PROPERTY_ID?.trim();
const origin = new URL(process.env.SITE_URL || 'https://whogoesfirst.fun').origin;
const federatedToken = process.env.GOOGLE_ACCESS_TOKEN?.trim();
if (!federatedToken && !credentials) { console.log('No Google credentials are configured; skipping the weekly growth job.'); process.exit(0); }

const token = federatedToken || await googleAccessToken(credentials!, ['https://www.googleapis.com/auth/webmasters.readonly', ...(gaProperty ? ['https://www.googleapis.com/auth/analytics.readonly'] : [])]);
const end = daysAgo(3);
const window28 = { start: daysAgo(30), end };
const [queries, pages, thisWeek, lastWeek] = await Promise.all([
  searchAnalytics(token, property, window28.start, end, ['query']),
  searchAnalytics(token, property, window28.start, end, ['page']),
  searchAnalytics(token, property, daysAgo(9), end, ['date']),
  searchAnalytics(token, property, daysAgo(16), daysAgo(10), ['date']),
]);
const games = getBoardGames().map(game => ({ identityId: game.identityId, name: game.name, ...(game.bggId ? { bggId: game.bggId } : {}), hasRule: game.rules.length > 0 }));
const demand = rankDemand(queries, pages, games, origin);
const sum = (rows: SearchRow[]) => rows.reduce((total, row) => ({ clicks: total.clicks + row.clicks, impressions: total.impressions + row.impressions }), { clicks: 0, impressions: 0 });
const weekNow = sum(thisWeek); const weekBefore = sum(lastWeek);
const indexing = await indexingSnapshot(token, property, origin);
let traffic: AnalyticsTotals | undefined;
let country: CountryTrafficSummary | undefined;
let acquisition: AcquisitionSummary | undefined;
const trafficWindow = { start: daysAgo(30), end: daysAgo(1) };
const affiliateWindow = { start: trafficWindow.start < affiliateMeasurementStart ? affiliateMeasurementStart : trafficWindow.start, end: trafficWindow.end };
let affiliateEvents: AffiliateEventsSnapshot | undefined;
if (gaProperty) {
  try { traffic = await analyticsTotals(token, gaProperty, trafficWindow.start, trafficWindow.end); }
  catch (error) { console.warn(`GA4 report skipped: ${(error as Error).message}`); }
  if (traffic) {
    try { country = summarizeCountryTraffic(trafficWindow.start, trafficWindow.end, traffic,
      await analyticsCountryTraffic(token, gaProperty, trafficWindow.start, trafficWindow.end)); }
    catch (error) { console.warn(`GA4 country report skipped: ${(error as Error).message}`); }
    try { acquisition = summarizeAcquisition(trafficWindow.start, trafficWindow.end, traffic,
      await analyticsAcquisition(token, gaProperty, trafficWindow.start, trafficWindow.end)); }
    catch (error) { console.warn(`GA4 acquisition report skipped: ${(error as Error).message}`); }
  }
  if (affiliateWindow.start <= affiliateWindow.end) {
    try { affiliateEvents = affiliateEventsSummary(affiliateWindow.start, affiliateWindow.end,
      await analyticsAffiliateOpens(token, gaProperty, affiliateWindow.start, affiliateWindow.end)); }
    catch (error) { console.warn(`GA4 affiliate event report skipped: ${(error as Error).message}`); }
  }
}

mkdirSync('research/demand', { recursive: true });
if (traffic) writeFileSync('research/demand/traffic-metrics.json', `${JSON.stringify(ga4TrafficMetrics(trafficWindow.start, trafficWindow.end, traffic.sessions, traffic.screenPageViews), null, 2)}\n`);
const countrySnapshot = country ?? {
  status: 'unavailable', periodStart: trafficWindow.start, periodEnd: trafficWindow.end,
  reason: !gaProperty ? 'GA4 property not configured' : !traffic ? 'GA4 totals unavailable' : 'GA4 country report unavailable',
} satisfies UnavailableCountryTraffic;
writeFileSync('research/demand/country-traffic.json', `${JSON.stringify({ ...countrySnapshot, generatedAt: new Date().toISOString() }, null, 2)}\n`);
const acquisitionSnapshot = acquisition ?? {
  status: 'unavailable', periodStart: trafficWindow.start, periodEnd: trafficWindow.end,
  reason: !gaProperty ? 'GA4 property not configured' : !traffic ? 'GA4 totals unavailable' : 'GA4 acquisition report unavailable',
} satisfies UnavailableAcquisition;
writeFileSync('research/demand/acquisition.json', `${JSON.stringify({ ...acquisitionSnapshot, generatedAt: new Date().toISOString() }, null, 2)}\n`);
const affiliateSnapshot = affiliateEvents ?? {
  status: affiliateWindow.start > affiliateWindow.end ? 'pending' : 'unavailable',
  periodStart: affiliateWindow.start, periodEnd: affiliateWindow.end,
  reason: affiliateWindow.start > affiliateWindow.end ? 'No completed GA4 measurement day since affiliate tracking began'
    : !gaProperty ? 'GA4 property not configured' : 'GA4 affiliate event report unavailable',
} satisfies AffiliateEventsSnapshot;
writeFileSync('research/demand/affiliate-events.json', `${JSON.stringify({ ...affiliateSnapshot, generatedAt: new Date().toISOString() }, null, 2)}\n`);
writeFileSync('research/demand/indexing.json', `${JSON.stringify(indexing, null, 2)}\n`);
writeFileSync('research/demand/search-console.json', `${JSON.stringify({
  generatedAt: new Date().toISOString(), property, window: window28,
  note: 'Research priority input. Games are ranked by Search Console impressions for starting-player queries that name them. Demand never substitutes for a primary source.',
  ...demand,
}, null, 2)}\n`);

const change = (now: number, before: number) => before ? `${now >= before ? '+' : ''}${Math.round(((now - before) / before) * 100)}%` : 'new';
const pct = (value: number) => `${(value * 100).toFixed(1)}%`;
const topQueries = queries.toSorted((a, b) => b.clicks - a.clicks || b.impressions - a.impressions).slice(0, 10);
const topPages = pages.toSorted((a, b) => b.clicks - a.clicks || b.impressions - a.impressions).slice(0, 10);
const report = `# Weekly growth report — ${new Date().toISOString().slice(0, 10)}

## Search (Google, last 7 days of final data vs the 7 before)
- Clicks: **${weekNow.clicks.toLocaleString('en')}** (${change(weekNow.clicks, weekBefore.clicks)})
- Impressions: **${weekNow.impressions.toLocaleString('en')}** (${change(weekNow.impressions, weekBefore.impressions)})
- Published rules: ${getCatalog().length}

${indexingReport(indexing)}
${traffic ? `## Traffic (GA4, last 30 days)
- Sessions: **${traffic.sessions.toLocaleString('en')}** · Screen/page views: **${traffic.screenPageViews.toLocaleString('en')}** · Users: ${traffic.totalUsers.toLocaleString('en')}
- Screen/page views per session: ${traffic.sessions ? (traffic.screenPageViews / traffic.sessions).toFixed(2) : '—'}
${country ? `- Named US/CA/GB/AU subtotal: ${country.namedJourneySessions.toLocaleString('en')} sessions. Five-country US/CA/GB/AU/NZ subtotal: ${country.raptiveCountryScreenPageViews.toLocaleString('en')} screen/page views. These are GA4 observations, not ad-network qualification.\n` : '- Country breakdown unavailable for this run.\n'}
` : '_GA4 totals unavailable: set GA4_PROPERTY_ID and give the service account Viewer access._\n'}
${acquisitionReport(acquisitionSnapshot)}
${affiliateEventsReport(affiliateSnapshot)}
${adNetworkReadiness(traffic, country)}
## Research queue (last 28 days)
${demand.missingRules.length ? demand.missingRules.slice(0, 15).map((game, index) => `${index + 1}. **${game.name}**${game.bggId ? ` (BGG ${game.bggId})` : ""} — ${game.impressions} impressions: ${game.queries.map(query => `“${query}”`).join(', ')}`).join('\n') : 'No starting-rule searches for games without a sourced rule yet.'}

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
