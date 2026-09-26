import { parse, type DefaultTreeAdapterMap } from 'parse5';

type Node = DefaultTreeAdapterMap['node'];
type Element = DefaultTreeAdapterMap['element'];
export type Probe = { path: string; status: number; url: string; body: string; robots: string; error?: string };
export type Metrics = {
  periodStart: string; periodEnd: string; source: string;
  scope: 'all-sessions' | 'consented-sessions';
  sessions: number | null; pageviews: number | null;
  cashRevenueUsd: number | null; cashCostsUsd: number | null;
  laborHours: number | null; laborHourlyUsd: number | null;
};
function elements(node: Node): Element[] {
  return [...('tagName' in node ? [node] : []), ...('childNodes' in node ? node.childNodes.flatMap(elements) : [])];
}
const attr = (node: Element, name: string) => node.attrs.find(a => a.name === name)?.value ?? '';

export function inspectProbe(probe: Probe, origin: string) {
  const issues: string[] = [];
  if (probe.error) issues.push(`Request failed: ${probe.error}`);
  else if (probe.status !== 200) issues.push(`HTTP ${probe.status}`);
  if (probe.status !== 200 || probe.error) return { path: probe.path, issues };
  if (probe.url !== new URL(probe.path, origin).href) issues.push('Unexpected redirect');
  if (/\b(noindex|none)\b/i.test(probe.robots)) issues.push('HTTP robots header prevents indexing');
  if (probe.path.endsWith('/')) {
    const nodes = elements(parse(probe.body));
    const canonical = nodes.filter(n => n.tagName === 'link' && attr(n, 'rel').split(/\s+/).includes('canonical'));
    if (canonical.length !== 1 || attr(canonical[0]!, 'href') !== new URL(probe.path, origin).href) issues.push('Missing or incorrect canonical');
    const robots = nodes.filter(n => n.tagName === 'meta' && /^(robots|googlebot)$/i.test(attr(n, 'name')));
    if (robots.some(n => /\b(noindex|none)\b/i.test(attr(n, 'content')))) issues.push('HTML robots tag prevents indexing');
    if (!nodes.some(n => n.tagName === 'h1')) issues.push('Missing H1');
  } else if (probe.path === '/sitemap.xml') {
    const locations = [...probe.body.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/g)].map(m => m[1]!.trim());
    if (!/<urlset\b/.test(probe.body) || !locations.length) issues.push('Missing or empty URL sitemap');
    if (locations.some(url => !url.startsWith(`${origin}/`))) issues.push('Sitemap contains an unexpected origin');
    for (const path of ['/', '/games/', '/board-games/', '/house-rules/']) {
      if (!locations.includes(new URL(path, origin).href)) issues.push(`Sitemap missing ${path}`);
    }
  } else if (probe.path === '/robots.txt') {
    if (!probe.body.includes(`Sitemap: ${origin}/sitemap.xml`)) issues.push('Missing sitemap declaration');
    const groups = probe.body.split(/(?=^\s*User-agent:)/im);
    if (groups.some(group => /^\s*User-agent:\s*(?:\*|Googlebot)\s*$/im.test(group) && /^\s*Disallow:\s*\/\s*$/im.test(group))) issues.push('Robots file blocks all pages');
  } else if (probe.path === '/pinterest.xml') {
    if (!/<rss\b/.test(probe.body) || !/<item>/.test(probe.body)) issues.push('Missing or empty curated RSS feed');
  }
  return { path: probe.path, issues };
}

export function validateMetrics(input: unknown): Metrics {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Metrics must be an object');
  const data = input as Record<string, unknown>;
  const allowed = ['periodStart', 'periodEnd', 'source', 'scope', 'sessions', 'pageviews', 'cashRevenueUsd', 'cashCostsUsd', 'laborHours', 'laborHourlyUsd'];
  if (Object.keys(data).some(key => !allowed.includes(key))) throw new Error('Unknown metrics field');
  for (const field of ['periodStart', 'periodEnd']) {
    const value = data[field];
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value) throw new Error(`Invalid ${field}`);
  }
  if (String(data.periodEnd) < String(data.periodStart)) throw new Error('Metrics period is reversed');
  if (typeof data.source !== 'string' || !data.source.trim()) throw new Error('Metrics source is required');
  if (!['all-sessions', 'consented-sessions'].includes(String(data.scope))) throw new Error('Metrics scope is required');
  for (const field of ['sessions', 'pageviews', 'cashRevenueUsd', 'cashCostsUsd', 'laborHours', 'laborHourlyUsd']) {
    const value = data[field];
    if (value !== null && (typeof value !== 'number' || !Number.isFinite(value) || value < 0)) throw new Error(`Invalid ${field}; use null for unknown`);
    if (['sessions', 'pageviews'].includes(field) && typeof value === 'number' && !Number.isInteger(value)) throw new Error(`${field} must be an integer`);
  }
  return data as Metrics;
}

export function economics(metrics: Metrics) {
  const { cashRevenueUsd: revenue, cashCostsUsd: costs, laborHours: hours, laborHourlyUsd: rate } = metrics;
  const cashContributionUsd = revenue !== null && costs !== null ? revenue - costs : null;
  const laborUsd = hours !== null && rate !== null ? hours * rate : null;
  return {
    cashContributionUsd,
    contributionAfterLaborUsd: cashContributionUsd !== null && laborUsd !== null ? cashContributionUsd - laborUsd : null,
    revenuePerSessionUsd: metrics.scope === 'all-sessions' && metrics.sessions !== null && metrics.sessions > 0 && revenue !== null ? revenue / metrics.sessions : null,
  };
}
