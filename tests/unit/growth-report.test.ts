import { describe, expect, it } from 'vitest';
import { economics, ga4MeasurementNote, ga4MeasurementWindow, ga4TrafficMetrics, inspectProbe, validateMetrics, type Metrics, type Probe } from '../../scripts/lib/growth-report';

const origin = 'https://whogoesfirst.fun';
const probe = (body: string, extra: Partial<Probe> = {}): Probe => ({ path: '/', status: 200, url: `${origin}/`, body, robots: '', ...extra });
const metrics: Metrics = { periodStart: '2026-09-01', periodEnd: '2026-09-25', source: 'Test fixture', scope: 'all-sessions', sessions: 100000, pageviews: 150000, cashRevenueUsd: 822, cashCostsUsd: 100, laborHours: 20, laborHourlyUsd: 50 };

describe('growth check decisions', () => {
  it('finds canonical and indexing failures regardless of HTML attribute order', () => {
    const result = inspectProbe(probe(`<h1>Picker</h1><link href="${origin}/wrong/" rel="canonical"><meta content="noindex,follow" name="robots">`), origin);
    expect(result.issues).toEqual(['Missing or incorrect canonical', 'HTML robots tag prevents indexing']);
    expect(inspectProbe(probe(`<h1>Picker</h1><link href="${origin}/" rel="canonical">`, { robots: 'googlebot: noindex' }), origin).issues).toEqual(['HTTP robots header prevents indexing']);
  });
  it('reports request failure without treating an empty response as content evidence', () => {
    expect(inspectProbe(probe('', { status: 0, error: 'TimeoutError' }), origin).issues).toEqual(['Request failed: TimeoutError']);
  });
  it('catches an empty sitemap and robots blocking the whole site', () => {
    expect(inspectProbe(probe('<urlset></urlset>', { path: '/sitemap.xml', url: `${origin}/sitemap.xml` }), origin).issues).toContain('Missing or empty URL sitemap');
    expect(inspectProbe(probe(`User-agent: *\nDisallow: /\nSitemap: ${origin}/sitemap.xml`, { path: '/robots.txt', url: `${origin}/robots.txt` }), origin).issues).toContain('Robots file blocks all pages');
  });
  it('accepts a healthy page without creating alerts from changed copy', () => {
    expect(inspectProbe(probe(`<h1>New heading</h1><link rel="canonical" href="${origin}/"><meta name="robots" content="index,follow">`), origin).issues).toEqual([]);
  });
});

describe('observed economics', () => {
  it('excludes known earlier CI contamination and identifies the partial guard window', () => {
    expect(ga4MeasurementWindow('2026-09-01', '2026-09-30')).toEqual({ start: '2026-09-28', end: '2026-09-30', days: 3, isFull30Days: false, includesRolloutDay: true });
    const note = ga4MeasurementNote('2026-09-28', '2026-09-30');
    expect(note).toContain('rollout day is partial');
    expect(note).toContain('3-day observation, not a complete 30-day comparison');
    expect(note).toContain('do not establish verified human traffic');
  });
  it('keeps the requested rolling window once thirty post-guard days are available', () => {
    expect(ga4MeasurementWindow('2026-09-29', '2026-10-28')).toEqual({ start: '2026-09-29', end: '2026-10-28', days: 30, isFull30Days: true, includesRolloutDay: false });
    expect(ga4MeasurementNote('2026-09-29', '2026-10-28')).not.toContain('not a complete 30-day');
    expect(ga4MeasurementWindow('2026-09-01', '2026-10-27').isFull30Days).toBe(false);
    expect(ga4MeasurementWindow('2026-09-01', '2026-09-27').days).toBe(0);
  });
  it('warns when a historical GA4 snapshot still contains pre-guard data', () => {
    const snapshot = ga4TrafficMetrics('2026-09-01', '2026-09-30', 1800, 3000);
    expect(snapshot.source).toContain('includes known earlier CI contamination');
    expect(snapshot.sessions).toBe(1800);
    expect(snapshot.pageviews).toBe(3000);
  });
  it('subtracts cash costs and valued labor separately', () => {
    expect(economics(validateMetrics(metrics))).toEqual({ cashContributionUsd: 722, contributionAfterLaborUsd: -278, revenuePerSessionUsd: 0.00822 });
  });
  it('keeps missing values unknown, and does not divide revenue by consented sessions', () => {
    expect(economics({ ...metrics, scope: 'consented-sessions', cashCostsUsd: null })).toEqual({ cashContributionUsd: null, contributionAfterLaborUsd: null, revenuePerSessionUsd: null });
    expect(economics({ ...metrics, sessions: 0 }).revenuePerSessionUsd).toBeNull();
    expect(economics({ ...metrics, cashRevenueUsd: 0, cashCostsUsd: 0 }).cashContributionUsd).toBe(0);
  });
  it('records GA4 traffic with an exact period without claiming total sessions or revenue', () => {
    const observed = ga4TrafficMetrics('2026-08-29', '2026-09-27', 1730, 2909);
    expect(observed).toMatchObject({ periodStart: '2026-08-29', periodEnd: '2026-09-27', scope: 'ga4-reported-sessions', sessions: 1730, pageviews: 2909, cashRevenueUsd: null });
    expect(economics({ ...observed, cashRevenueUsd: 10 }).revenuePerSessionUsd).toBeNull();
  });
  it('rejects malformed periods, missing values, and extra fields', () => {
    expect(() => validateMetrics({ ...metrics, periodEnd: '2026-02-30' })).toThrow('Invalid periodEnd');
    expect(() => validateMetrics({ ...metrics, periodEnd: '2026-08-01' })).toThrow('reversed');
    expect(() => validateMetrics({ ...metrics, sessions: undefined })).toThrow('Invalid sessions');
    expect(() => validateMetrics({ ...metrics, sessions: -1 })).toThrow('Invalid sessions');
    expect(() => validateMetrics({ ...metrics, playerNames: ['private'] })).toThrow('Unknown metrics field');
  });
});
