import { inspectIndexedUrl, searchSitemaps, type IndexStatus, type SearchSitemap } from './google-api';

export const indexingSamplePaths = [
  '/', '/games/', '/board-games/',
  '/games/catan-2020-en/', '/games/ticket-to-ride-2015-en/', '/games/wingspan-online-en/',
] as const;

export type SitemapObservation = {
  path: string; lastSubmitted: string | null; lastDownloaded: string | null;
  isPending: boolean; errors: number; warnings: number; submittedUrls: number | null;
};
export type InspectionObservation = {
  path: string; status: 'available' | 'unavailable'; reason?: string;
  verdict?: string; coverageState?: string; robotsTxtState?: string; indexingState?: string;
  pageFetchState?: string; lastCrawlTime?: string; googleCanonical?: string; userCanonical?: string;
  knownSitemaps?: string[];
};
export type IndexingSnapshot = {
  generatedAt: string; property: string; source: string; scope: string;
  sitemapsStatus: 'available' | 'unavailable'; sitemapsReason?: string;
  submittedSitemaps: SitemapObservation[];
  inspections: InspectionObservation[];
};

function safeCount(value: string | number | undefined): number {
  const number = Number(value ?? 0);
  if (!Number.isSafeInteger(number) || number < 0) throw new Error('Search Console returned an invalid sitemap count');
  return number;
}

export function sitemapObservation(input: SearchSitemap): SitemapObservation {
  if (!input.path?.startsWith('https://')) throw new Error('Search Console returned an invalid sitemap URL');
  const submitted = input.contents?.reduce((sum, item) => sum + safeCount(item.submitted), 0);
  return {
    path: input.path, lastSubmitted: input.lastSubmitted ?? null, lastDownloaded: input.lastDownloaded ?? null,
    isPending: input.isPending === true, errors: safeCount(input.errors), warnings: safeCount(input.warnings),
    submittedUrls: submitted ?? null,
  };
}

export function inspectionObservation(path: string, result: IndexStatus): InspectionObservation {
  return {
    path, status: 'available', verdict: result.verdict ?? 'VERDICT_UNSPECIFIED',
    coverageState: result.coverageState ?? '', robotsTxtState: result.robotsTxtState ?? 'ROBOTS_TXT_STATE_UNSPECIFIED',
    indexingState: result.indexingState ?? 'INDEXING_STATE_UNSPECIFIED',
    pageFetchState: result.pageFetchState ?? 'PAGE_FETCH_STATE_UNSPECIFIED',
    ...(result.lastCrawlTime ? { lastCrawlTime: result.lastCrawlTime } : {}),
    ...(result.googleCanonical ? { googleCanonical: result.googleCanonical } : {}),
    ...(result.userCanonical ? { userCanonical: result.userCanonical } : {}),
    knownSitemaps: result.sitemap ?? [],
  };
}

function safeReason(error: unknown): string {
  const match = String((error as Error)?.message ?? error).match(/request failed \((\d{3})\)/);
  return match ? `Search Console API HTTP ${match[1]}` : 'Search Console API response unavailable';
}

export async function indexingSnapshot(token: string, property: string, origin: string): Promise<IndexingSnapshot> {
  const base = new URL(origin).origin;
  const [sitemapResult, ...inspectionResults] = await Promise.allSettled([
    searchSitemaps(token, property),
    ...indexingSamplePaths.map(path => inspectIndexedUrl(token, property, new URL(path, base).href)),
  ]);
  let submittedSitemaps: SitemapObservation[] = [];
  let sitemapsReason: string | undefined;
  if (sitemapResult.status === 'fulfilled') {
    try { submittedSitemaps = sitemapResult.value.map(sitemapObservation); }
    catch { sitemapsReason = 'Search Console returned an invalid sitemap response'; }
  } else sitemapsReason = safeReason(sitemapResult.reason);
  const inspections = inspectionResults.map((result, index): InspectionObservation => {
    const path = indexingSamplePaths[index]!;
    return result.status === 'fulfilled'
      ? inspectionObservation(path, result.value)
      : { path, status: 'unavailable', reason: safeReason(result.reason) };
  });
  return {
    generatedAt: new Date().toISOString(), property,
    source: 'Google Search Console Sitemaps and URL Inspection APIs',
    scope: 'Six named URLs in Google’s index; URL Inspection does not test the current live page or prove site-wide indexing.',
    sitemapsStatus: sitemapsReason ? 'unavailable' : 'available',
    ...(sitemapsReason ? { sitemapsReason } : {}),
    submittedSitemaps, inspections,
  };
}

export function indexingReport(snapshot: IndexingSnapshot): string {
  const sitemaps = snapshot.sitemapsStatus === 'available'
    ? snapshot.submittedSitemaps.length
      ? snapshot.submittedSitemaps.map(item => item.lastDownloaded
        ? `- Submitted sitemap: ${item.path} · last downloaded ${item.lastDownloaded} · ${item.errors} errors, ${item.warnings} warnings${item.isPending ? ' · latest submission not processed yet' : ''}`
        : `- Submitted sitemap: ${item.path} · submitted ${item.lastSubmitted ?? 'at an unknown time'} · no download recorded · ${item.isPending ? 'not processed yet' : 'processing state unknown'}; fetch outcome unconfirmed`).join('\n')
      : '- Search Console lists no submitted sitemaps for this property.'
    : `- Submitted sitemap status unavailable: ${snapshot.sitemapsReason}.`;
  const sitemapCaveat = snapshot.sitemapsStatus === 'available' && snapshot.submittedSitemaps.some(item => !item.lastDownloaded)
    ? "\n\nThe Search Console API does not provide the Sitemaps report's fetch label. Zero errors without a download timestamp does not establish a successful read; check the Sitemaps UI for fetch errors."
    : '';
  const inspections = snapshot.inspections.map(item => item.status === 'available'
    ? `- ${item.path}: ${item.verdict}; ${item.coverageState || 'coverage unknown'}; last crawl ${item.lastCrawlTime ?? 'unknown'}; fetch ${item.pageFetchState}.`
    : `- ${item.path}: inspection unavailable (${item.reason}).`).join('\n');
  return `## Google indexing sample\n${sitemaps}${sitemapCaveat}\n${inspections}\n\nThis checks six named URLs in Google's indexed data, not the current live pages or the full site.\n`;
}
