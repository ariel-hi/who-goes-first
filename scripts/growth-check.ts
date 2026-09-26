import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { economics, inspectProbe, validateMetrics, type Metrics, type Probe } from './lib/growth-report';

const origin = 'https://whogoesfirst.fun';
const output = new URL('../artifacts/growth/', import.meta.url);
await mkdir(output, { recursive: true });
const paths = ['/', '/games/', '/board-games/', '/house-rules/', '/robots.txt', '/sitemap.xml', '/pinterest.xml'];
// Seven bounded, independent requests; no browser, remote AI, or visitor data.
const checks = await Promise.all(paths.map(async path => {
  let probe: Probe;
  try {
    const response = await fetch(new URL(path, origin), { signal: AbortSignal.timeout(15000) });
    probe = { path, status: response.status, url: response.url, body: await response.text(), robots: response.headers.get('x-robots-tag') ?? '' };
  } catch (error) {
    probe = { path, status: 0, url: '', body: '', robots: '', error: error instanceof Error ? error.name : 'Unknown request error' };
  }
  return inspectProbe(probe, origin);
}));

let metrics: Metrics | null = null;
let metricsIssue: string | null = null;
try { metrics = validateMetrics(JSON.parse(await readFile(new URL('metrics.json', output), 'utf8'))); }
catch (error) {
  if (!(error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT')) metricsIssue = error instanceof Error ? error.message : 'Unreadable metrics';
}
const checkedAt = new Date().toISOString();
const metricsAgeDays = metrics ? Math.max(0, Math.floor((Date.now() - Date.parse(metrics.periodEnd)) / 86400000)) : null;
const metricsStatus = metricsIssue ? 'invalid' : !metrics ? 'unavailable' : Date.parse(metrics.periodEnd) > Date.now() ? 'future-period' : metricsAgeDays! > 14 ? 'stale' : 'available';
const observed = metrics ? economics(metrics) : null;
const summary = { checks, metrics, metricsIssue, metricsStatus };
// Ignore timestamps, volatile page copy, and catalog additions when detecting alerts.
const fingerprint = createHash('sha256').update(JSON.stringify(summary)).digest('hex');
let previous: { fingerprint?: string; weeklyReviewAt?: string } = {};
try { previous = JSON.parse(await readFile(new URL('state.json', output), 'utf8')); }
catch (error) { if (!(error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT')) throw error; }
const changed = previous.fingerprint !== fingerprint;
const failures = checks.filter(check => check.issues.length);
const weeklyReviewDue = !previous.weeklyReviewAt || Date.now() - Date.parse(previous.weeklyReviewAt) >= 7 * 86400000;
const state = { fingerprint, weeklyReviewAt: previous.weeklyReviewAt ?? null };
const report = { checkedAt, changed, weeklyReviewDue, failures: failures.length, ...summary, observed };
const money = (value: number | null | undefined) => value == null ? 'unknown' : `$${value.toFixed(2)}`;
const text = [
  '# Who Goes First growth check', '',
  `Checked: ${checkedAt}. Changed: ${changed}. Weekly review due: ${weeklyReviewDue}.`, '',
  ...checks.map(check => `- ${check.path}: ${check.issues.length ? check.issues.join('; ') : 'passed'}`), '',
  'These are HTTP and page checks, not proof of Google indexing, ranking, picker completion, or Pinterest account readiness.', '',
  `Metrics: ${metricsStatus}${metricsIssue ? ` (${metricsIssue})` : ''}.`,
  ...(metrics ? [
    `Period: ${metrics.periodStart} to ${metrics.periodEnd}; source: ${metrics.source}; scope: ${metrics.scope}.`,
    `Sessions: ${metrics.sessions ?? 'unknown'}; pageviews: ${metrics.pageviews ?? 'unknown'}.`,
    `Cash contribution: ${money(observed?.cashContributionUsd)}. After valued labor: ${money(observed?.contributionAfterLaborUsd)}.`,
    `Revenue per total session: ${observed?.revenuePerSessionUsd == null ? 'unknown (requires total sessions and actual revenue)' : `$${observed.revenuePerSessionUsd.toFixed(5)}`}.`,
  ] : ['No real traffic or revenue snapshot is available. Do not substitute the economics planning model or report missing values as zero.']), '',
  'Next action: fix a newly verified failure, inspect new metrics, or complete the weekly review. Otherwise stop after this check.', '',
].join('\n');
await writeFile(new URL('report.json', output), `${JSON.stringify(report, null, 2)}\n`);
await writeFile(new URL('report.md', output), text);
await writeFile(new URL('state.json', output), `${JSON.stringify(state, null, 2)}\n`);
console.log(JSON.stringify({ changed, weeklyReviewDue, failures: failures.length, metricsStatus, report: fileURLToPath(new URL('report.md', output)) }));
if (failures.length || metricsIssue) process.exitCode = 1;
