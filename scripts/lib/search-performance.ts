import type { SearchRow } from './google-api';

export type SearchWindow = { start: string; end: string };
export type PerformanceRow = Omit<SearchRow, 'keys'> & { keys?: string[] };
export type SearchMetrics = { clicks: number; impressions: number; ctr: number | null; averagePosition: number | null };
export type SearchMetricRow = SearchMetrics & { keys: string[] };
type SearchData<T> =
  | { status: 'available'; returnedRowCount: number; emptyResult: boolean; data: T }
  | { status: 'unavailable'; returnedRowCount: null; emptyResult: null; data: null; reason: string };
type SearchQuery = (start: string, end: string, dimensions: string[]) => Promise<PerformanceRow[]>;

/** Dates use the existing job's UTC cutoff; Search Console interprets them as inclusive Pacific reporting dates. */
export function searchPerformanceWindows(anchorDateUtc: string, lagDays = 3) {
  const anchor = Date.parse(`${anchorDateUtc}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(anchorDateUtc) || !Number.isFinite(anchor)
    || new Date(anchor).toISOString().slice(0, 10) !== anchorDateUtc || !Number.isSafeInteger(lagDays) || lagDays < 0) {
    throw new Error('Invalid Search Console reporting date or lag');
  }
  const date = (offset: number) => new Date(anchor + offset * 86_400_000).toISOString().slice(0, 10);
  const window = (start: number, end: number): SearchWindow => ({ start: date(start - lagDays), end: date(end - lagDays) });
  return {
    anchorDateUtc, reportingLagDays: lagDays,
    sevenDay: { current: window(-6, 0), previous: window(-13, -7) },
    twentyEightDay: { current: window(-27, 0), previous: window(-55, -28) },
  };
}

function metrics(row: PerformanceRow): SearchMetrics {
  if (!Number.isSafeInteger(row.clicks) || row.clicks < 0 || !Number.isSafeInteger(row.impressions) || row.impressions < 0
    || !Number.isFinite(row.position) || row.position < 0) throw new Error('Invalid Search Console metrics');
  return {
    clicks: row.clicks, impressions: row.impressions,
    ctr: row.impressions ? row.clicks / row.impressions : null,
    averagePosition: row.impressions ? row.position : null,
  };
}

/** A successful empty dimensionless response has no impressions; a failed request must never call this with []. */
export function searchTotals(rows: PerformanceRow[]): SearchMetrics {
  if (!rows.length) return { clicks: 0, impressions: 0, ctr: null, averagePosition: null };
  if (rows.length !== 1 || (rows[0]!.keys?.length ?? 0) !== 0) throw new Error('Invalid Search Console dimensionless response');
  return metrics(rows[0]!);
}

/** Preserve actual API tuples; a separate page table and query table cannot establish these associations. */
export function searchMetricRows(rows: PerformanceRow[], dimensions: number): SearchMetricRow[] {
  const seen = new Set<string>();
  return rows.map(row => {
    if (!Array.isArray(row.keys) || row.keys.length !== dimensions || row.keys.some(key => typeof key !== 'string')) {
      throw new Error('Invalid Search Console dimensions');
    }
    const key = JSON.stringify(row.keys);
    if (seen.has(key)) throw new Error('Invalid Search Console duplicate dimension tuple');
    seen.add(key);
    return { keys: [...row.keys], ...metrics(row) };
  });
}

export function searchMetricChange(current: SearchMetrics | null, previous: SearchMetrics | null) {
  if (!current || !previous) return null;
  return {
    clicks: current.clicks - previous.clicks,
    impressions: current.impressions - previous.impressions,
    clicksPercent: previous.clicks ? (current.clicks - previous.clicks) / previous.clicks * 100 : null,
    impressionsPercent: previous.impressions ? (current.impressions - previous.impressions) / previous.impressions * 100 : null,
    ctrPercentagePoints: current.ctr !== null && previous.ctr !== null ? (current.ctr - previous.ctr) * 100 : null,
    averagePosition: current.averagePosition !== null && previous.averagePosition !== null
      ? current.averagePosition - previous.averagePosition : null,
  };
}

export function matchSearchRows(current: SearchMetricRow[] | null, previous: SearchMetricRow[] | null) {
  if (!current || !previous) return null;
  const now = new Map(current.map(row => [JSON.stringify(row.keys), row]));
  const before = new Map(previous.map(row => [JSON.stringify(row.keys), row]));
  return [...new Set([...now.keys(), ...before.keys()])].sort().map(key => {
    const currentRow = now.get(key) ?? null;
    const previousRow = before.get(key) ?? null;
    return {
      keys: (currentRow ?? previousRow)!.keys,
      presence: currentRow && previousRow ? 'returned_both' : currentRow ? 'current_only_returned' : 'previous_only_returned',
      current: currentRow, previous: previousRow,
      change: searchMetricChange(currentRow, previousRow),
    };
  });
}

function safeReason(error: unknown): string {
  const message = String((error as Error)?.message ?? error);
  if (message.startsWith('Invalid Search Console ')) return message;
  const status = message.match(/(?:request failed \(|HTTP\s+)(\d{3})/i)?.[1];
  return status ? `Search Console request failed (HTTP ${status})` : 'Search Console request unavailable';
}

async function capture<T>(query: () => Promise<PerformanceRow[]>, parse: (rows: PerformanceRow[]) => T): Promise<SearchData<T>> {
  try {
    const rows = await query();
    return { status: 'available', returnedRowCount: rows.length, emptyResult: !rows.length, data: parse(rows) };
  } catch (error) {
    return { status: 'unavailable', returnedRowCount: null, emptyResult: null, data: null, reason: safeReason(error) };
  }
}

export function searchPerformanceMetadata(property: string, windows: ReturnType<typeof searchPerformanceWindows>) {
  return {
    generatedAt: new Date().toISOString(), property,
    source: 'Google Search Console Search Analytics API', searchType: 'web', dataState: 'final',
    dateTimezone: 'America/Los_Angeles', filters: [],
    dimensions: { totals: [], pages: ['page'], pageQuery: ['page', 'query'] },
    anchorDateUtc: windows.anchorDateUtc, reportingLagDays: windows.reportingLagDays,
    aggregation: 'auto (API default); responseAggregationType is not retained by the existing API client',
    totalsSource: 'Independent dimensionless requests; sitewide position is Google-provided, never a page-position average.',
    notes: [
      'Web is the API default. All dates are inclusive Pacific reporting dates; final data is requested with the stated lag.',
      'CTR is total clicks divided by total impressions. Zero impressions have null CTR and average position.',
      'Successful empty dimensionless responses retain zero counts and an explicit emptyResult flag; failed requests are unavailable, not zero.',
      'All rows returned by the existing paginated API client are retained. Google returns top rows and does not guarantee complete row coverage.',
      'Page and query groupings can use different aggregation from dimensionless totals. Do not sum these rows to reconstruct sitewide metrics.',
      'Visible page/query tuples are privacy-filtered and need not reconcile with page totals. Changing query, device, country and page mix can affect comparisons.',
      'An absent dimensioned row means not returned, not zero impressions or proof of a new/disappearing ranking page. Its comparison is null.',
      'Average-position change is current minus previous; a lower number is better. These comparisons do not establish release causality.',
    ],
    documentation: 'https://developers.google.com/webmaster-tools/v1/searchanalytics/query',
  };
}

/** Eleven additional queries, at most three concurrently; reuse the existing current-28-day page response. */
export async function collectSearchPerformance(
  property: string, windows: ReturnType<typeof searchPerformanceWindows>, query: SearchQuery, current28Pages: PerformanceRow[],
) {
  const period = async (window: SearchWindow, reusedPages?: PerformanceRow[]) => {
    const [totals, pages, pageQuery] = await Promise.all([
      capture(() => query(window.start, window.end, []), searchTotals),
      capture(() => reusedPages === undefined ? query(window.start, window.end, ['page']) : Promise.resolve(reusedPages), rows => searchMetricRows(rows, 1)),
      capture(() => query(window.start, window.end, ['page', 'query']), rows => searchMetricRows(rows, 2)),
    ]);
    return { window, totals, pages, pageQuery };
  };
  // Sequential periods bound request concurrency without discarding a healthy
  // period when a different period or dimension fails.
  const current7 = await period(windows.sevenDay.current);
  const previous7 = await period(windows.sevenDay.previous);
  const current28 = await period(windows.twentyEightDay.current, current28Pages);
  const previous28 = await period(windows.twentyEightDay.previous);
  const comparison = (current: typeof current7, previous: typeof current7) => ({
    current, previous,
    changes: {
      totals: searchMetricChange(current.totals.data, previous.totals.data),
      pages: matchSearchRows(current.pages.data, previous.pages.data),
      pageQuery: matchSearchRows(current.pageQuery.data, previous.pageQuery.data),
    },
  });
  const datasets = [current7, previous7, current28, previous28].flatMap(value => [value.totals, value.pages, value.pageQuery]);
  const available = datasets.filter(value => value.status === 'available').length;
  return {
    ...searchPerformanceMetadata(property, windows),
    status: available === datasets.length ? 'available' : available ? 'partial' : 'unavailable',
    sevenDay: comparison(current7, previous7), twentyEightDay: comparison(current28, previous28),
  };
}
