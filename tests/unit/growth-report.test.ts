import { describe, expect, it } from 'vitest';
import { economics, inspectProbe, validateMetrics, type Metrics, type Probe } from '../../scripts/lib/growth-report';

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
  it('subtracts cash costs and valued labor separately', () => {
    expect(economics(validateMetrics(metrics))).toEqual({ cashContributionUsd: 722, contributionAfterLaborUsd: -278, revenuePerSessionUsd: 0.00822 });
  });
  it('keeps missing values unknown, and does not divide revenue by consented sessions', () => {
    expect(economics({ ...metrics, scope: 'consented-sessions', cashCostsUsd: null })).toEqual({ cashContributionUsd: null, contributionAfterLaborUsd: null, revenuePerSessionUsd: null });
    expect(economics({ ...metrics, sessions: 0 }).revenuePerSessionUsd).toBeNull();
    expect(economics({ ...metrics, cashRevenueUsd: 0, cashCostsUsd: 0 }).cashContributionUsd).toBe(0);
  });
  it('rejects malformed periods, missing values, and extra fields', () => {
    expect(() => validateMetrics({ ...metrics, periodEnd: '2026-02-30' })).toThrow('Invalid periodEnd');
    expect(() => validateMetrics({ ...metrics, periodEnd: '2026-08-01' })).toThrow('reversed');
    expect(() => validateMetrics({ ...metrics, sessions: undefined })).toThrow('Invalid sessions');
    expect(() => validateMetrics({ ...metrics, sessions: -1 })).toThrow('Invalid sessions');
    expect(() => validateMetrics({ ...metrics, playerNames: ['private'] })).toThrow('Unknown metrics field');
  });
});
