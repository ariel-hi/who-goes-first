import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { googleAccessToken, inspectIndexedUrl, searchSitemaps, submitSitemap } from './lib/google-api';
import { indexingSamplePaths } from './lib/indexing-diagnostics';
import { coverageReport, inspectionBudget, inspectionQueue, recordInspectionAttempt, requestIndexingCandidates, type Coverage } from './lib/indexing-rotation';

// Daily Search Console upkeep: confirm the live sitemaps load, submit missing
// sitemaps once, and inspect a rotating batch of sitemap URLs so
// indexing coverage builds up across the whole site within about two weeks.
// Google offers no API to "request indexing" for ordinary pages; that stays a
// manual Search Console action, so the report lists the pages worth requesting.

const property = process.env.GSC_PROPERTY || 'https://whogoesfirst.fun/';
const origin = new URL(process.env.SITE_URL || 'https://whogoesfirst.fun').origin;
const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
const federatedToken = process.env.GOOGLE_ACCESS_TOKEN?.trim();
const budget = inspectionBudget(process.env.INSPECTION_BUDGET); // Leave headroom below the 2,000/day property quota.
const coverageFile = 'research/demand/indexing-coverage.json';
const sitemapIndex = `${origin}/sitemap-index.xml`;

if (!federatedToken && !credentials) {
  console.log('No Google credentials configured; skipping indexing upkeep.');
  process.exit(0);
}
const token = federatedToken || await googleAccessToken(credentials!, ['https://www.googleapis.com/auth/webmasters']);

type CoverageFile = { updatedAt: string; property: string; pages: Record<string, Coverage> };

const locs = (xml: string) => [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map(match => match[1]!);

// 1. Live sitemaps: every file must answer 200 with URLs in it.
const liveProblems: string[] = [];
const sitemapFiles = [sitemapIndex];
const pageUrls = new Set<string>();
const indexResponse = await fetch(sitemapIndex);
if (!indexResponse.ok) liveProblems.push(`${sitemapIndex} answered HTTP ${indexResponse.status}`);
else {
  for (const child of locs(await indexResponse.text())) {
    sitemapFiles.push(child);
    const response = await fetch(child);
    if (!response.ok) { liveProblems.push(`${child} answered HTTP ${response.status}`); continue; }
    const urls = locs(await response.text());
    if (!urls.length) liveProblems.push(`${child} lists no URLs`);
    urls.forEach(url => pageUrls.add(url));
  }
}

// A partial live inventory must not erase saved coverage or trigger submissions.
if (liveProblems.length || !pageUrls.size) {
  throw new Error(`Live sitemap validation failed; no submissions or coverage changes: ${liveProblems.join('; ') || 'empty inventory'}`);
}

// 2. Missing download timestamps do not establish a failed fetch. Preserve the
// original submission date for diagnosis instead of resetting it every 3 days.
const sitemapActions: string[] = [];
let submitDenied = false;
const known = new Map((await searchSitemaps(token, property)).map(item => [item.path, item]));
for (const path of sitemapFiles) {
  const item = known.get(path);
  const reason = !item ? 'not submitted yet' : null;
  if (!reason) {
    sitemapActions.push(`- ${path}: ${Number(item?.errors ?? 0) > 0 ? `${item?.errors} errors; investigate the Sitemaps report before resubmitting` : item?.lastDownloaded ? `read by Google ${item.lastDownloaded}` : `submitted ${item?.lastSubmitted}, no download recorded; check the Sitemaps report. No automatic resubmission`}`);
    continue;
  }
  try {
    await submitSitemap(token, property, path);
    sitemapActions.push(`- ${path}: submitted (${reason})`);
  } catch (error) {
    const denied = /\((401|403)\)/.test(String((error as Error).message));
    submitDenied ||= denied;
    sitemapActions.push(`- ${path}: needs submitting (${reason}) but ${denied ? 'the service account lacks Full permission in Search Console' : 'the request failed'}`);
  }
}

// 3. A small priority sample plus oldest attempts across every indexing state.
// These recovery/control pages help track the October visibility loss; priority
// is bounded so it cannot starve the rest of the sitemap.
const priorityPaths = [
  '/coin-flip/', '/games/rummy-bicycle-en/', '/games/sherlock-thames-murders-space-cowboys-en/',
  '/games/7-wonders-duel-repos-en/', '/ways-to-pick-who-goes-first/', ...indexingSamplePaths,
];
const coverage: CoverageFile = existsSync(coverageFile)
  ? JSON.parse(readFileSync(coverageFile, 'utf8'))
  : { updatedAt: '', property, pages: {} };
const allPaths = [...new Set([...pageUrls].map(url => new URL(url).pathname))];
const inventory = new Set(allPaths);
for (const path of Object.keys(coverage.pages)) if (!inventory.has(path)) delete coverage.pages[path];
const queue = inspectionQueue(allPaths, coverage.pages, budget, priorityPaths);

const saveCoverage = () => {
  coverage.updatedAt = new Date().toISOString();
  coverage.property = property;
  mkdirSync('research/demand', { recursive: true });
  writeFileSync(coverageFile, `${JSON.stringify(coverage, null, 2)}\n`);
};
let inspectionErrors = 0;
const successfulPaths: string[] = [];
for (let i = 0; i < queue.length; i += 5) {
  await Promise.all(queue.slice(i, i + 5).map(async path => {
    const lastAttemptedAt = new Date().toISOString();
    recordInspectionAttempt(coverage.pages, path, lastAttemptedAt);
    try {
      const result = await inspectIndexedUrl(token, property, new URL(path, origin).href);
      coverage.pages[path] = {
        path, coverageState: result.coverageState ?? 'unknown', verdict: result.verdict ?? 'VERDICT_UNSPECIFIED',
        ...(result.lastCrawlTime ? { lastCrawlTime: result.lastCrawlTime } : {}), checkedAt: new Date().toISOString(), lastAttemptedAt,
      };
      successfulPaths.push(path);
    } catch { inspectionErrors++; }
  }));
  // A full refresh can take over half an hour. Preserve completed results if
  // the runner is interrupted; the workflow commits coverage even on failure.
  if ((i + 5) % 25 === 0) saveCoverage();
}
saveCoverage();

// 4. Report.
const now = Date.now();
const requestable = requestIndexingCandidates(allPaths, coverage.pages, priorityPaths, now);

const report = `# Indexing upkeep ${new Date().toISOString().slice(0, 10)}

## Live sitemaps
${liveProblems.length ? liveProblems.map(problem => `- ${problem}`).join('\n') : `- All ${sitemapFiles.length} sitemap files load; ${pageUrls.size} URLs listed.`}

## Search Console sitemaps
${sitemapActions.join('\n')}${submitDenied ? '\n\nTo let this job submit sitemaps, give the service account **Full** permission in Search Console (Settings → Users and permissions).' : ''}

${coverageReport(allPaths, coverage.pages, successfulPaths, inspectionErrors, now)}

## Worth a manual "Request indexing"
${requestable.length ? requestable.map(page => `- ${origin}${page.path} (${page.coverageState}; inspected ${page.checkedAt})`).join('\n') : '- No recent non-PASS observations available. Historical or unavailable results do not establish current indexing.'}
`;
console.log(report);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, report);
writeFileSync('research/demand/indexing-upkeep.md', report);
