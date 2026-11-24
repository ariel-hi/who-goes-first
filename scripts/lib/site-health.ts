/**
 * Pure evaluation for a small sister site's weekly search health (scripts/wordking-health.ts).
 * Alerts are reserved for things that need attention; everything else is a status note.
 */
export type Totals = { clicks: number; impressions: number; position: number | null };
export type Inspection = { path: string; verdict?: string; coverageState?: string };
export type SiteHealthState = { checkedAt: string; indexed: Record<string, boolean>; weekly: { end: string; impressions: number; clicks: number }[] };
export const minimumImpressionBase = 30;
export const impressionDropShare = 0.5;

export function evaluateSiteHealth(input: { site: string; now: Date; window?: { start: string; end: string }; totals?: Totals; previousTotals?: Totals; inspections?: Inspection[]; previous?: SiteHealthState; errors?: string[] }) {
  const { site, now, window, totals, previousTotals, inspections, previous } = input;
  const alerts = [...(input.errors ?? [])];
  const notes: string[] = [];
  const weekly = [...(previous?.weekly ?? [])];
  if (totals && window) {
    if (!weekly.some(week => week.end === window.end)) weekly.push({ end: window.end, impressions: totals.impressions, clicks: totals.clicks });
    notes.push(`Last 7 days of final data (${window.start} to ${window.end}): ${totals.impressions} impressions, ${totals.clicks} clicks${totals.position === null ? '' : `, average position ${totals.position.toFixed(1)}`}${previousTotals ? ` (previous 7 days: ${previousTotals.impressions} impressions, ${previousTotals.clicks} clicks)` : ''}.`);
    if (previousTotals && previousTotals.impressions >= minimumImpressionBase && totals.impressions <= previousTotals.impressions * (1 - impressionDropShare)) {
      alerts.push(`Google impressions fell ${Math.round((1 - totals.impressions / previousTotals.impressions) * 100)}% week over week (${previousTotals.impressions} to ${totals.impressions}). Check Search Console for a manual action or a Google update.`);
    }
  }
  weekly.sort((a, b) => a.end.localeCompare(b.end));
  const indexed = { ...(previous?.indexed ?? {}) };
  if (inspections?.length) {
    const lines = inspections.map(page => `${page.path}: ${page.coverageState ?? page.verdict ?? 'unknown'}`);
    notes.push(`Sitemap pages indexed: ${inspections.filter(page => page.verdict === 'PASS').length} of ${inspections.length} (${lines.join('; ')}).`);
    const dropped = inspections.filter(page => page.verdict !== 'PASS' && indexed[page.path]);
    if (dropped.length) alerts.push(`Indexed pages dropped out: ${dropped.map(page => `${page.path} (${page.coverageState ?? page.verdict})`).join(', ')}.`);
    const home = inspections.find(page => page.path === '/');
    if (home && home.verdict !== 'PASS') alerts.push(`The home page is not indexed (${home.coverageState ?? home.verdict}).`);
    for (const page of inspections) indexed[page.path] = page.verdict === 'PASS';
  }
  const history = weekly.slice(-26);
  const trend = history.length > 1 ? `\n## Weekly impressions\n${history.map(week => `- Week ending ${week.end}: ${week.impressions} impressions, ${week.clicks} clicks`).join('\n')}\n` : '';
  const report = `# ${site} search health ${now.toISOString().slice(0, 10)}

## Alerts
${alerts.length ? alerts.map(alert => `- ${alert}`).join('\n') : '- None.'}

## Status
${notes.map(note => `- ${note}`).join('\n')}
${trend}`;
  return { alerts, report, state: { checkedAt: now.toISOString(), indexed, weekly: history } satisfies SiteHealthState };
}
