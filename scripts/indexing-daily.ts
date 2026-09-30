import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { googleAccessToken, inspectIndexedUrl, searchSitemaps, submitSitemap } from './lib/google-api';
import { indexingSamplePaths } from './lib/indexing-diagnostics';

// Daily Search Console upkeep: confirm the live sitemaps load, (re)submit any
// sitemap Google has not read, and inspect a rotating batch of sitemap URLs so
// indexing coverage builds up across the whole site within about two weeks.
// Google offers no API to "request indexing" for ordinary pages; that stays a
// manual Search Console action, so the report lists the pages worth requesting.

const property = process.env.GSC_PROPERTY || 'https://whogoesfirst.fun/';
const origin = new URL(process.env.SITE_URL || 'https://whogoesfirst.fun').origin;
const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
const federatedToken = process.env.GOOGLE_ACCESS_TOKEN?.trim();
const budget = Number(process.env.INSPECTION_BUDGET || 150); // API quota is 2,000/day per property
const resubmitAfterDays = 3;
const coverageFile = 'research/demand/indexing-coverage.json';
const sitemapIndex = `${origin}/sitemap-index.xml`;

if (!federatedToken && !credentials) {
  console.log('No Google credentials configured; skipping indexing upkeep.');
  process.exit(0);
}
const token = federatedToken || await googleAccessToken(credentials!, ['https://www.googleapis.com/auth/webmasters']);

type Coverage = { path: string; coverageState: string; verdict: string; lastCrawlTime?: string; checkedAt: string };
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

// 2. Submitted sitemaps: submit missing ones, resubmit ones Google has not read.
const now = Date.now();
const sitemapActions: string[] = [];
let submitDenied = false;
const known = new Map((await searchSitemaps(token, property)).map(item => [item.path, item]));
for (const path of sitemapFiles) {
  const item = known.get(path);
  const submittedAgo = item?.lastSubmitted ? (now - Date.parse(item.lastSubmitted)) / 86_400_000 : Infinity;
  const reason = !item ? 'not submitted yet'
    : !item.lastDownloaded && submittedAgo >= resubmitAfterDays ? `still unread ${Math.floor(submittedAgo)} days after submission`
    : Number(item.errors ?? 0) > 0 && submittedAgo >= 1 ? `${item.errors} errors reported`
    : null;
  if (!reason) {
    sitemapActions.push(`- ${path}: ${item?.lastDownloaded ? `read by Google ${item.lastDownloaded}` : `submitted ${item?.lastSubmitted}, waiting`}`);
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

// 3. Rotating URL inspections: key pages, then never-checked, then not-indexed, then oldest.
const coverage: CoverageFile = existsSync(coverageFile)
  ? JSON.parse(readFileSync(coverageFile, 'utf8'))
  : { updatedAt: '', property, pages: {} };
const allPaths = [...pageUrls].map(url => new URL(url).pathname);
for (const path of Object.keys(coverage.pages)) if (!allPaths.includes(path)) delete coverage.pages[path];
const indexed = (path: string) => coverage.pages[path]?.verdict === 'PASS';
const age = (path: string) => coverage.pages[path]?.checkedAt ?? '';
const queue = [...new Set([
  ...indexingSamplePaths,
  ...allPaths.filter(path => !coverage.pages[path]),
  ...allPaths.filter(path => !indexed(path)).sort((a, b) => age(a).localeCompare(age(b))),
  ...allPaths.sort((a, b) => age(a).localeCompare(age(b))),
])].slice(0, budget);

let inspectionErrors = 0;
for (let i = 0; i < queue.length; i += 5) {
  await Promise.all(queue.slice(i, i + 5).map(async path => {
    try {
      const result = await inspectIndexedUrl(token, property, new URL(path, origin).href);
      coverage.pages[path] = {
        path, coverageState: result.coverageState ?? 'unknown', verdict: result.verdict ?? 'VERDICT_UNSPECIFIED',
        ...(result.lastCrawlTime ? { lastCrawlTime: result.lastCrawlTime } : {}), checkedAt: new Date().toISOString(),
      };
    } catch { inspectionErrors++; }
  }));
}
coverage.updatedAt = new Date().toISOString();
coverage.property = property;
mkdirSync('research/demand', { recursive: true });
writeFileSync(coverageFile, `${JSON.stringify(coverage, null, 2)}\n`);

// 4. Report.
const pages = Object.values(coverage.pages);
const states = new Map<string, number>();
pages.forEach(page => states.set(page.coverageState, (states.get(page.coverageState) ?? 0) + 1));
const indexedCount = pages.filter(page => page.verdict === 'PASS').length;
const requestable = pages.filter(page => page.verdict !== 'PASS')
  .sort((a, b) => (indexingSamplePaths as readonly string[]).indexOf(b.path) - (indexingSamplePaths as readonly string[]).indexOf(a.path) || a.path.length - b.path.length)
  .slice(0, 10);

const report = `# Indexing upkeep ${new Date().toISOString().slice(0, 10)}

## Live sitemaps
${liveProblems.length ? liveProblems.map(problem => `- ${problem}`).join('\n') : `- All ${sitemapFiles.length} sitemap files load; ${pageUrls.size} URLs listed.`}

## Search Console sitemaps
${sitemapActions.join('\n')}${submitDenied ? '\n\nTo let this job submit sitemaps, give the service account **Full** permission in Search Console (Settings → Users and permissions).' : ''}

## Coverage (${pages.length} of ${allPaths.length} URLs inspected so far)
- Indexed: ${indexedCount} (${pages.length ? Math.round(100 * indexedCount / pages.length) : 0}%)
${[...states].sort((a, b) => b[1] - a[1]).map(([state, count]) => `- ${state}: ${count}`).join('\n')}
- Inspected this run: ${queue.length - inspectionErrors}${inspectionErrors ? ` (${inspectionErrors} failed)` : ''}

## Worth a manual "Request indexing"
${requestable.length ? requestable.map(page => `- ${origin}${page.path} (${page.coverageState})`).join('\n') : '- Nothing: every inspected URL is indexed.'}
`;
console.log(report);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, report);
writeFileSync('research/demand/indexing-upkeep.md', report);
if (liveProblems.length) process.exitCode = 1;
