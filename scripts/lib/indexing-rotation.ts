export type Coverage = {
  path: string; coverageState: string; verdict: string; lastCrawlTime?: string;
  checkedAt: string; lastAttemptedAt?: string;
};

export const coverageFreshDays = 3;
const dayMs = 86_400_000;

export function inspectionBudget(value?: string): number {
  const budget = value?.trim() ? Number(value) : 150;
  if (!Number.isSafeInteger(budget) || budget < 1 || budget > 1600) {
    throw new Error('INSPECTION_BUDGET must be an integer from 1 to 1600 (default 150).');
  }
  return budget;
}

const timestamp = (value?: string) => Date.parse(value ?? '') || 0;

// Reserve at least 75% of each run for the oldest attempts, regardless of the
// saved verdict. A nonindexed backlog must never hide a formerly indexed URL.
// Failed attempts rotate too; checkedAt still records only successful results.
export function inspectionQueue(
  paths: readonly string[], pages: Record<string, Coverage>, budget: number, priorities: readonly string[] = [],
): string[] {
  inspectionBudget(String(budget));
  const inventory = [...new Set(paths)];
  const allowed = new Set(inventory);
  const oldest = (a: string, b: string) =>
    timestamp(pages[a]?.lastAttemptedAt ?? pages[a]?.checkedAt) - timestamp(pages[b]?.lastAttemptedAt ?? pages[b]?.checkedAt)
    || a.localeCompare(b);
  const limit = Math.min(budget, inventory.length);
  const priority = [...new Set(priorities)].filter(path => allowed.has(path)).sort(oldest).slice(0, Math.floor(limit / 4));
  return [...new Set([...priority, ...inventory.sort(oldest)])].slice(0, limit);
}

export function recordInspectionAttempt(pages: Record<string, Coverage>, path: string, attemptedAt: string): void {
  pages[path] = {
    ...(pages[path] ?? { path, coverageState: 'Inspection unavailable', verdict: 'VERDICT_UNSPECIFIED', checkedAt: '' }),
    lastAttemptedAt: attemptedAt,
  };
}

export function coverageFreshness(paths: readonly string[], pages: Record<string, Coverage>, now: number) {
  const fresh: Coverage[] = [];
  const historical: Coverage[] = [];
  const unavailable: Coverage[] = [];
  const uninspected: string[] = [];
  for (const path of new Set(paths)) {
    const page = pages[path];
    const checked = timestamp(page?.checkedAt);
    const attempted = timestamp(page?.lastAttemptedAt);
    if (!page || (!checked && !attempted)) uninspected.push(path);
    else if (!checked || checked > now || attempted > checked) unavailable.push(page);
    else if (now - checked <= coverageFreshDays * dayMs) fresh.push(page);
    else historical.push(page);
  }
  return { fresh, historical, unavailable, uninspected };
}

export function coverageReport(
  paths: readonly string[], pages: Record<string, Coverage>, successfulPaths: readonly string[], failed: number, now: number,
): string {
  const { fresh, historical, unavailable, uninspected } = coverageFreshness(paths, pages, now);
  const current = [...new Set(successfulPaths)].map(path => pages[path]!).filter(Boolean);
  const indexed = (observations: Coverage[]) => observations.filter(page => page.verdict === 'PASS').length;
  const states = new Map<string, number>();
  current.forEach(page => states.set(page.coverageState, (states.get(page.coverageState) ?? 0) + 1));
  return `## Coverage freshness (${new Set(paths).size} sitemap URLs)
- This run: ${current.length} successful inspections; ${failed} failed. Indexed (PASS) in this run: ${indexed(current)} of ${current.length}.
- Recent observations (last ${coverageFreshDays} days, latest attempt successful): ${fresh.length}; indexed (PASS) in those observations: ${indexed(fresh)}.
- Historical observations (older than ${coverageFreshDays} days): ${historical.length}; last observed PASS: ${indexed(historical)}. These are not current indexing counts.
- Latest inspection unavailable: ${unavailable.length}; previous PASS retained as historical only: ${indexed(unavailable)}.
- Not yet inspected: ${uninspected.length}.

These are observations of Google's indexed data at inspection time, not live fetch tests or a current site-wide indexing percentage. Recent results can still change before the next inspection.

## Index states observed this run
${states.size ? [...states].sort((a, b) => b[1] - a[1]).map(([state, count]) => `- ${state}: ${count}`).join('\n') : '- No successful inspection results this run.'}
`;
}

export function requestIndexingCandidates(
  paths: readonly string[], pages: Record<string, Coverage>, priorities: readonly string[], now: number,
): Coverage[] {
  const ranks = new Map(priorities.map((path, index) => [path, index]));
  return coverageFreshness(paths, pages, now).fresh.filter(page => page.verdict !== 'PASS')
    .sort((a, b) => (ranks.get(a.path) ?? Infinity) - (ranks.get(b.path) ?? Infinity)
      || timestamp(b.checkedAt) - timestamp(a.checkedAt) || a.path.localeCompare(b.path))
    .slice(0, 10);
}
