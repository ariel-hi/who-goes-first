// On-demand GA4 behavior snapshot (what visitors do, how long, which pages).
// Prints Markdown to the job log; writes nothing. Window starts 2026-09-28,
// the first day GA loaded only on the live hostname (earlier data is CI noise).
const gaProperty = process.env.GA4_PROPERTY_ID?.trim();
const token = process.env.GOOGLE_ACCESS_TOKEN?.trim();
if (!gaProperty || !token) { console.log('GA4 property or Google token missing; skipping.'); process.exit(0); }

const startDate = process.env.VISITORS_START || '2026-09-28';
type Row = { dimensionValues?: { value?: string }[]; metricValues?: { value?: string }[] };

async function report(dimensions: string[], metrics: string[], orderBy = metrics[0], limit = 25) {
  const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${encodeURIComponent(gaProperty!)}:runReport`, {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ dateRanges: [{ startDate, endDate: 'today' }], dimensions: dimensions.map(name => ({ name })), metrics: metrics.map(name => ({ name })), orderBys: [{ metric: { metricName: orderBy }, desc: true }], limit }),
  });
  if (!response.ok) throw new Error(`GA4 ${dimensions.join(',')} failed (${response.status}): ${await response.text()}`);
  return ((await response.json()) as { rows?: Row[] }).rows ?? [];
}

const fmt = (name: string, value = '0') => {
  const n = Number(value);
  if (/Duration$/.test(name)) return `${Math.round(n)}s`;
  if (/Rate$/.test(name)) return `${(n * 100).toFixed(0)}%`;
  return Number.isFinite(n) && value !== '' ? (Number.isInteger(n) ? n.toLocaleString('en') : n.toFixed(1)) : value;
};
async function table(title: string, dimensions: string[], metrics: string[], orderBy?: string, limit?: number) {
  try {
    const rows = await report(dimensions, metrics, orderBy, limit);
    console.log(`\n## ${title}\n\n| ${[...dimensions, ...metrics].join(' | ')} |\n|${[...dimensions, ...metrics].map(() => '---').join('|')}|`);
    for (const row of rows) console.log(`| ${[...(row.dimensionValues ?? []).map(d => d.value ?? ''), ...(row.metricValues ?? []).map((m, i) => fmt(metrics[i]!, m.value))].join(' | ')} |`);
    if (!rows.length) console.log('| (no rows) |');
  } catch (error) { console.log(`\n## ${title}\n\n_${(error as Error).message}_`); }
}

console.log(`# Visitor behavior since ${startDate}`);
const engagement = ['activeUsers', 'sessions', 'engagedSessions', 'engagementRate', 'averageSessionDuration', 'userEngagementDuration', 'screenPageViews', 'eventCount'];
await table('Totals', [], engagement);
await table('By day', ['date'], ['activeUsers', 'sessions', 'engagementRate', 'averageSessionDuration', 'screenPageViews'], 'sessions', 30);
await table('New vs returning', ['newVsReturning'], ['activeUsers', 'sessions', 'engagementRate', 'averageSessionDuration']);
await table('Pages', ['pagePath'], ['screenPageViews', 'activeUsers', 'userEngagementDuration', 'eventCount'], 'screenPageViews', 40);
await table('Landing pages', ['landingPage'], ['sessions', 'engagementRate', 'averageSessionDuration', 'screenPageViews'], 'sessions', 30);
await table('Source / medium', ['sessionSourceMedium'], ['sessions', 'engagementRate', 'averageSessionDuration', 'screenPageViews'], 'sessions', 20);
await table('Events', ['eventName'], ['eventCount', 'activeUsers'], 'eventCount', 40);
await table('Devices', ['deviceCategory'], ['activeUsers', 'sessions', 'engagementRate', 'averageSessionDuration']);
await table('Countries', ['country'], ['activeUsers', 'sessions', 'engagementRate', 'averageSessionDuration'], 'sessions', 15);
await table('Hostnames (sanity check)', ['hostName'], ['sessions'], 'sessions', 10);
export {};
