import { inspectIndexedUrl } from './google-api';
import { inspectProbe, type Probe } from './growth-report';

export const checkpointOrigin = 'https://whogoesfirst.fun';
export const checkpointProperty = `${checkpointOrigin}/`;
export const checkpointRelease = '2026-10-17T16:25:45Z';
export const checkpointTargets = [
  { name: 'CATAN', path: '/games/catan-2020-en/' },
  { name: 'Wingspan', path: '/games/wingspan-online-en/' },
  { name: 'The Castles of Burgundy', path: '/games/the-castles-of-burgundy-alea-2019-en/' },
] as const;

type Authentication = 'available' | 'missing' | 'failed';
type IndexingState = 'indexed' | 'not indexed' | 'unknown';
export type CheckpointInspection = {
  state: IndexingState; reason: string | null; verdict: string | null; coverageState: string | null;
  lastCrawlTime: string | null; crawledAfterRelease: boolean | null;
  googleCanonical: string | null; userCanonical: string | null; googleCanonicalMatchesRequested: boolean | null;
  pageFetchState: string | null; robotsTxtState: string | null; indexingState: string | null;
};
export type CheckpointLive = { httpStatus: number | null; finalUrl: string | null; issues: string[] };
export type IndexingCheckpoint = {
  checkedAt: string; releaseBaseline: string; property: string; authentication: Authentication;
  pages: Array<{ name: string; path: string; url: string; google: CheckpointInspection; live: CheckpointLive }>;
  counts: { indexed: number; notIndexed: number; unknown: number };
  technicalFailure: boolean;
};

const text = (value: unknown): string | null => typeof value === 'string' && value.trim()
  ? value.replace(/\p{Cc}/gu, ' ').trim().slice(0, 500) : null;
function safeUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href.slice(0, 2000) : null;
  } catch { return null; }
}

export function checkpointInspection(input: unknown, requestedUrl: string, checkedAt: string, unavailableReason?: string): CheckpointInspection {
  const data = input && typeof input === 'object' && !Array.isArray(input) ? input as Record<string, unknown> : {};
  const verdict = text(data.verdict);
  const coverageState = text(data.coverageState);
  const recognized = verdict !== null && ['PASS', 'NEUTRAL', 'FAIL'].includes(verdict) && coverageState !== null;
  const state: IndexingState = !recognized || unavailableReason ? 'unknown' : verdict === 'PASS' ? 'indexed' : 'not indexed';
  const crawl = typeof data.lastCrawlTime === 'string' ? Date.parse(data.lastCrawlTime) : NaN;
  const lastCrawlTime = Number.isFinite(crawl) && crawl <= Date.parse(checkedAt) ? new Date(crawl).toISOString() : null;
  const googleCanonical = safeUrl(data.googleCanonical);
  return {
    state, reason: unavailableReason ?? (state === 'unknown' ? 'Google returned missing or unrecognized indexing evidence.' : null),
    verdict, coverageState, lastCrawlTime,
    crawledAfterRelease: lastCrawlTime ? crawl > Date.parse(checkpointRelease) : null,
    googleCanonical, userCanonical: safeUrl(data.userCanonical),
    googleCanonicalMatchesRequested: googleCanonical ? googleCanonical === requestedUrl : null,
    pageFetchState: text(data.pageFetchState), robotsTxtState: text(data.robotsTxtState), indexingState: text(data.indexingState),
  };
}

async function liveProbe(path: string): Promise<Probe> {
  const response = await fetch(new URL(path, checkpointOrigin), { signal: AbortSignal.timeout(15000), redirect: 'follow' });
  return { path, status: response.status, url: response.url, body: await response.text(), robots: response.headers.get('x-robots-tag') ?? '' };
}

// Do not expose raw API error bodies, response HTML, tokens or credential objects.
const inspectionFailure = (error: unknown): string => {
  const status = error instanceof Error ? error.message.match(/request failed \(([1-5]\d{2})\)/)?.[1] : undefined;
  return status ? `Google inspection unavailable (HTTP ${status}).` : 'Google inspection unavailable.';
};

export async function collectIndexingCheckpoint(
  token: string | undefined, authentication: Authentication,
  dependencies: {
    inspect?: (token: string, property: string, url: string, signal?: AbortSignal) => Promise<unknown>;
    probe?: (path: string) => Promise<Probe>;
    now?: () => Date;
  } = {},
): Promise<IndexingCheckpoint> {
  const checkedAt = (dependencies.now ?? (() => new Date()))().toISOString();
  const authenticated = authentication === 'available' && Boolean(token?.trim());
  const auth = authenticated ? 'available' : authentication === 'failed' ? 'failed' : 'missing';
  const pages = await Promise.all(checkpointTargets.map(async target => {
    const url = new URL(target.path, checkpointOrigin).href;
    const [inspection, probe] = await Promise.allSettled([
      authenticated ? (dependencies.inspect ?? inspectIndexedUrl)(token!, checkpointProperty, url, AbortSignal.timeout(25000)) : Promise.resolve(undefined),
      (dependencies.probe ?? liveProbe)(target.path),
    ]);
    const reason = !authenticated ? `Google authentication ${auth === 'failed' ? 'failed' : 'is not configured'}.`
      : inspection.status === 'rejected' ? inspectionFailure(inspection.reason) : undefined;
    const google = checkpointInspection(inspection.status === 'fulfilled' ? inspection.value : undefined, url, checkedAt, reason);
    // Only fixed diagnostics from inspectProbe enter the report, never error text from a remote response.
    const live: CheckpointLive = probe.status === 'fulfilled'
      ? { httpStatus: probe.value.status || null, finalUrl: safeUrl(probe.value.url), issues: inspectProbe({ ...probe.value, path: target.path, ...(probe.value.error ? { error: 'Live fetch unavailable' } : {}) }, checkpointOrigin).issues }
      : { httpStatus: null, finalUrl: null, issues: ['Live fetch unavailable.'] };
    return { ...target, url, google, live };
  }));
  return {
    checkedAt, releaseBaseline: checkpointRelease, property: checkpointProperty, authentication: auth, pages,
    counts: {
      indexed: pages.filter(page => page.google.state === 'indexed').length,
      notIndexed: pages.filter(page => page.google.state === 'not indexed').length,
      unknown: pages.filter(page => page.google.state === 'unknown').length,
    },
    technicalFailure: pages.some(page => page.google.state === 'unknown' || page.live.issues.length > 0),
  };
}

// Treat API fields as text: no HTML, Markdown links, tables, or mentions supplied by a response.
export const checkpointMarkdownText = (value: string | null): string => (value ?? 'Unknown')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/[\\`*_{}[\]()#+.!|~]/g, '\\$&').replace(/@/g, '&#64;').replace(/[\r\n]+/g, ' ');

export function indexingCheckpointMarkdown(report: IndexingCheckpoint): string {
  const safe = checkpointMarkdownText;
  const sections = report.pages.map(page => `## ${page.name}

${page.url}

- Google indexing: **${page.google.state}**; verdict ${safe(page.google.verdict)}; ${safe(page.google.coverageState)}
${page.google.reason ? `- Evidence issue: ${safe(page.google.reason)}\n` : ''}- Last Google crawl: ${safe(page.google.lastCrawlTime)}
- Crawl after deployment: ${page.google.crawledAfterRelease === null ? 'Unknown' : page.google.crawledAfterRelease ? 'Yes' : 'No'}
- Google canonical: ${safe(page.google.googleCanonical)}
- Declared canonical in Google evidence: ${safe(page.google.userCanonical)}
- Google canonical matches requested URL: ${page.google.googleCanonicalMatchesRequested === null ? 'Unknown' : page.google.googleCanonicalMatchesRequested ? 'Yes' : 'No'}
- Google crawl evidence: fetch ${safe(page.google.pageFetchState)}; robots ${safe(page.google.robotsTxtState)}; indexing ${safe(page.google.indexingState)}
- Live HTTP status: ${page.live.httpStatus ?? 'Unavailable'}; final URL ${safe(page.live.finalUrl)}
- Live diagnostics: ${page.live.issues.length ? page.live.issues.map(safe).join('; ') : 'No issues detected in HTTP status, redirects, canonical, robots meta/header and H1.'}
`).join('\n');
  return `# Google indexing checkpoint — CATAN, Wingspan and Burgundy

Checked: ${report.checkedAt}. Deployment baseline: ${report.releaseBaseline}.

${report.counts.indexed} indexed; ${report.counts.notIndexed} not indexed; ${report.counts.unknown} unknown. Technical check: ${report.technicalFailure ? 'incomplete or issues detected' : 'completed'}.

These are fresh observations of Google's indexed data. The separate live fetch is an HTTP/HTML diagnostic, not Google's live URL test. A crawl after deployment does not prove indexing, and indexing does not prove impression recovery. This check makes no indexing requests, sitemap submissions, content changes or repairs.

${sections}`;
}
