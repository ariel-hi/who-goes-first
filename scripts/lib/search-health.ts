type Totals = { clicks: number; impressions: number; averagePosition: number | null };
type Window = { window: { start: string; end: string }; totals?: { status: string; data?: Totals } };
export type Performance = { status: string; generatedAt: string; sevenDay?: { current: Window; previous: Window } };
type Observation = { verdict?: string; coverageState?: string; checkedAt?: string; lastAttemptedAt?: string };
export type Coverage = { updatedAt: string; pages: Record<string, Observation> };
export type HealthState = { checkedAt: string; coreIndexed: Record<string, boolean>; weekly: { end: string; impressions: number; clicks: number }[] };

const day = 24 * 60 * 60 * 1000;
/** Ignore impression swings below this weekly base; tiny numbers are noise. */
export const minimumImpressionBase = 30;
/** Alert when a week's impressions fall by at least this share of the previous week's. */
export const impressionDropShare = 0.5;

export function evaluateSearchHealth(input: { now: Date; performance?: Performance; coverage?: Coverage; previous?: HealthState; corePaths: string[]; indexedRules: number }) {
  const { now, performance, coverage, previous, corePaths, indexedRules } = input;
  const alerts: string[] = [];
  const notes: string[] = [];
  const age = (iso?: string) => iso ? (now.getTime() - Date.parse(iso)) / day : Infinity;

  // 1. Data feeds: an automation that silently stops is the worst failure.
  if (!performance || performance.status !== 'available') alerts.push('Search Console performance data is unavailable. Check the weekly growth job and Google credentials.');
  else if (age(performance.generatedAt) > 6) alerts.push(`Search Console performance data is ${Math.floor(age(performance.generatedAt))} days old. The weekly growth job may be failing.`);
  if (!coverage) alerts.push('Indexing coverage data is missing. Check the daily indexing job.');
  else if (age(coverage.updatedAt) > 3) alerts.push(`Indexing coverage is ${Math.floor(age(coverage.updatedAt))} days old. The daily indexing job may be failing.`);

  // 2. Impressions trend.
  const weekly = [...(previous?.weekly ?? [])];
  const current = performance?.sevenDay?.current; const prior = performance?.sevenDay?.previous;
  const now7 = current?.totals?.data; const before7 = prior?.totals?.data;
  if (current && now7) {
    if (!weekly.some(week => week.end === current.window.end)) weekly.push({ end: current.window.end, impressions: now7.impressions, clicks: now7.clicks });
    notes.push(`Last 7 days of final data (${current.window.start} to ${current.window.end}): ${now7.impressions} impressions, ${now7.clicks} clicks${before7 ? ` (previous 7 days: ${before7.impressions} impressions, ${before7.clicks} clicks)` : ''}.`);
    if (before7 && before7.impressions >= minimumImpressionBase && now7.impressions <= before7.impressions * (1 - impressionDropShare)) {
      alerts.push(`Google impressions fell ${Math.round((1 - now7.impressions / before7.impressions) * 100)}% week over week (${before7.impressions} to ${now7.impressions}). Check Search Console for a manual action or a Google update.`);
    }
  }
  weekly.sort((a, b) => a.end.localeCompare(b.end));
  const history = weekly.slice(-26);

  // 3. Core pages: alert on regressions only; pages still waiting for Google are noted, not alerted.
  const coreIndexed: Record<string, boolean> = { ...(previous?.coreIndexed ?? {}) };
  const waiting: string[] = [];
  for (const path of corePaths) {
    const page = coverage?.pages[path];
    if (!page?.verdict || age(page.checkedAt) > 7) continue;
    const indexed = page.verdict === 'PASS';
    if (!indexed && coreIndexed[path]) alerts.push(`${path} was indexed and is now "${page.coverageState ?? page.verdict}".`);
    if (!indexed) waiting.push(`${path} (${page.coverageState ?? page.verdict})`);
    coreIndexed[path] = indexed;
  }
  if (coverage && coverage.pages['/']?.verdict && coverage.pages['/']!.verdict !== 'PASS' && !alerts.some(alert => alert.startsWith('/ was'))) alerts.push('The home page is not indexed.');

  // 4. Indexing progress across the sitemap.
  if (coverage) {
    const recent = Object.values(coverage.pages).filter(page => page.verdict && age(page.checkedAt) <= 7);
    const pass = recent.filter(page => page.verdict === 'PASS').length;
    notes.push(`Indexed in Google's latest inspections (last 7 days): ${pass} of ${recent.length} inspected sitemap URLs.`);
  }
  notes.push(`Rule pages offered for indexing: ${indexedRules}.`);
  if (waiting.length) notes.push(`Core pages Google has not indexed yet (it recrawls on its own): ${waiting.join(', ')}.`);

  const trend = history.length > 1 ? `\n## Weekly impressions\n${history.map(week => `- Week ending ${week.end}: ${week.impressions} impressions, ${week.clicks} clicks`).join('\n')}\n` : '';
  const report = `# Search health ${now.toISOString().slice(0, 10)}

## Alerts
${alerts.length ? alerts.map(alert => `- ${alert}`).join('\n') : '- None.'}

## Status
${notes.map(note => `- ${note}`).join('\n')}
${trend}`;
  const state: HealthState = { checkedAt: now.toISOString(), coreIndexed, weekly: history };
  return { alerts, report, state };
}
