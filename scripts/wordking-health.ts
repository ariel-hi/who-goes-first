/**
 * Weekly search health for the sister site Word King (https://wordking.web.app/).
 *
 * Word King's repository deploys by hand and holds no Google credentials, so this check runs here, using
 * the same keyless Google token as the weekly growth job. The growth-reader service account has
 * Restricted (read-only) access to the Word King Search Console property. Writes
 * research/demand/wordking-health.{md,json} and prints `alerts=<n>` to GITHUB_OUTPUT; the workflow
 * raises an issue labelled wordking-search-health.
 */
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { googleAccessToken, inspectIndexedUrl, searchAnalytics } from './lib/google-api';
import { evaluateSiteHealth, type Inspection, type SiteHealthState, type Totals } from './lib/site-health';

const property = 'https://wordking.web.app/';
const origin = 'https://wordking.web.app';
const statePath = 'research/demand/wordking-health.json';
const day = 24 * 60 * 60 * 1000;
const iso = (date: Date) => date.toISOString().slice(0, 10);
const now = new Date();
const end = new Date(now.getTime() - 3 * day);
const window = { start: iso(new Date(end.getTime() - 6 * day)), end: iso(end) };
const previousWindow = { start: iso(new Date(end.getTime() - 13 * day)), end: iso(new Date(end.getTime() - 7 * day)) };
const previous = existsSync(statePath) ? JSON.parse(readFileSync(statePath, 'utf8')) as SiteHealthState : undefined;

async function totals(token: string, range: { start: string; end: string }): Promise<Totals> {
  const rows = await searchAnalytics(token, property, range.start, range.end, ['date']);
  const clicks = rows.reduce((sum, row) => sum + row.clicks, 0);
  const impressions = rows.reduce((sum, row) => sum + row.impressions, 0);
  const position = impressions ? rows.reduce((sum, row) => sum + row.position * row.impressions, 0) / impressions : null;
  return { clicks, impressions, position };
}

const errors: string[] = [];
let current: Totals | undefined, prior: Totals | undefined, inspections: Inspection[] | undefined;
try {
  const token = process.env.GOOGLE_ACCESS_TOKEN?.trim() || await googleAccessToken(process.env.GOOGLE_SERVICE_ACCOUNT_JSON ?? '', ['https://www.googleapis.com/auth/webmasters.readonly']);
  [current, prior] = await Promise.all([totals(token, window), totals(token, previousWindow)]);
  const sitemap = await fetch(`${origin}/sitemap.xml`).then(response => { if (!response.ok) throw new Error(`sitemap returned HTTP ${response.status}`); return response.text(); });
  const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => new URL(match[1]!).pathname);
  inspections = [];
  for (const path of paths) {
    const status = await inspectIndexedUrl(token, property, origin + path);
    inspections.push({ path, verdict: status.verdict, coverageState: status.coverageState });
  }
} catch (error) {
  errors.push(`The weekly Word King Search Console check failed: ${error instanceof Error ? error.message.slice(0, 200) : 'unknown error'}. Check that the growth service account has Restricted access to ${property}.`);
}
const result = evaluateSiteHealth({ site: 'Word King', now, window, totals: current, previousTotals: prior, inspections, previous, errors });
if (current || inspections) writeFileSync(statePath, `${JSON.stringify(result.state, null, 2)}\n`);
writeFileSync('research/demand/wordking-health.md', result.report);
console.log(result.report);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, result.report);
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `wordking_alerts=${result.alerts.length}\n`);
