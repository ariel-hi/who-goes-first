import type { SearchRow } from './google-api';

export type SearchOpportunity = { path: string; impressions: number; clicks: number; ctr: number; position: number; readiness: 'experiment' | 'watch'; action: string };

/** Observed demand across tools, guides and rules; small samples stay in watch. */
export function searchOpportunities(rows: SearchRow[], origin: string, indexablePaths: Set<string>): SearchOpportunity[] {
  const opportunities: SearchOpportunity[] = [];
  for (const row of rows) {
    let url: URL;
    try { url = new URL(row.keys[0] ?? ''); } catch { continue; }
    if (url.origin !== origin || url.search || url.hash || !indexablePaths.has(url.pathname)) continue;
    if (![row.impressions, row.clicks, row.ctr, row.position].every(Number.isFinite) || row.impressions < 5 || row.clicks < 0 || row.clicks > row.impressions || row.ctr < 0 || row.ctr >= 0.05 || row.position < 1 || row.position > 30) continue;
    opportunities.push({ path: url.pathname, impressions: row.impressions, clicks: row.clicks, ctr: row.ctr, position: row.position, readiness: row.impressions >= 50 ? 'experiment' : 'watch', action: row.impressions >= 50 ? 'Check the live search intent, title, description and opening answer; change only with supporting query evidence.' : 'Keep observing; this sample is too small to judge the title or click rate.' });
  }
  return opportunities.sort((a, b) => Number(b.readiness === 'experiment') - Number(a.readiness === 'experiment') || b.impressions - a.impressions || a.position - b.position || a.path.localeCompare(b.path)).slice(0, 20);
}
