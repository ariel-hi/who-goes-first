import { afterEach, describe, expect, it, vi } from 'vitest';
import { analyticsCountryTraffic, type AnalyticsCountryTraffic } from '../../scripts/lib/google-api';
import { summarizeCountryTraffic } from '../../scripts/lib/country-traffic';
import { adNetworkReadiness } from '../../scripts/lib/ad-network-readiness';

const report: AnalyticsCountryTraffic = {
  rows: [
    { countryId: 'US', sessions: 500, screenPageViews: 600 },
    { countryId: 'CA', sessions: 100, screenPageViews: 120 },
    { countryId: 'GB', sessions: 50, screenPageViews: 60 },
    { countryId: 'AU', sessions: 25, screenPageViews: 30 },
    { countryId: 'NZ', sessions: 25, screenPageViews: 30 },
    { countryId: '(not set)', sessions: 50, screenPageViews: 60 },
  ],
  rowCount: 6, subjectToThresholding: true, dataLossFromOtherRow: false, dataTruncation: false,
};

describe('country traffic evidence', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('keeps named Journey countries, Raptive countries, and missing GA4 rows distinct', () => {
    const summary = summarizeCountryTraffic('2026-08-29', '2026-09-27', { sessions: 1000, screenPageViews: 1200, totalUsers: 900 }, report);
    expect(summary).toMatchObject({ namedJourneySessions: 675, raptiveCountrySessions: 700, raptiveCountryScreenPageViews: 840, unattributedSessions: 250, unattributedScreenPageViews: 300, subjectToThresholding: true });
    const text = adNetworkReadiness({ sessions: 1000, screenPageViews: 1200 }, summary);
    expect(text).toContain('675 sessions from US/CA/GB/AU (67.5% of GA4 sessions)');
    expect(text).toContain('840 screen/page views from US/CA/GB/AU/NZ (70.0% of GA4 views)');
    expect(text).toContain('shares may undercount');
    expect(text).toContain('complete Tier 1 count and eligibility unassessed');
  });

  it('rejects a country report whose metric sum exceeds undimensioned totals', () => {
    expect(() => summarizeCountryTraffic('2026-08-29', '2026-09-27', { sessions: 700, screenPageViews: 1200, totalUsers: 900 }, report)).toThrow('exceed undimensioned totals');
  });

  it('rejects truncated Data API rows instead of treating a partial country share as complete', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({
      rows: [{ dimensionValues: [{ value: 'US' }], metricValues: [{ value: '12' }, { value: '24' }] }],
      rowCount: 2, metadata: { subjectToThresholding: true },
    }), { status: 200 })));
    await expect(analyticsCountryTraffic('token', '123', '2026-08-29', '2026-09-27')).rejects.toThrow('incomplete');
  });

  it('requests country IDs with both metrics and carries GA4 quality flags', async () => {
    const request = vi.fn(async (_url: string, init: RequestInit) => {
      expect(JSON.parse(String(init.body))).toMatchObject({
        dimensions: [{ name: 'countryId' }], metrics: [{ name: 'sessions' }, { name: 'screenPageViews' }], limit: 500,
      });
      return new Response(JSON.stringify({
        rows: [{ dimensionValues: [{ value: 'GB' }], metricValues: [{ value: '12' }, { value: '24' }] }],
        rowCount: 1, metadata: { subjectToThresholding: true, dataLossFromOtherRow: false, dataTruncationReasons: [] },
      }), { status: 200 });
    });
    vi.stubGlobal('fetch', request);
    expect(await analyticsCountryTraffic('token', '123', '2026-08-29', '2026-09-27')).toEqual({
      rows: [{ countryId: 'GB', sessions: 12, screenPageViews: 24 }], rowCount: 1,
      subjectToThresholding: true, dataLossFromOtherRow: false, dataTruncation: false,
    });
    expect(request).toHaveBeenCalledOnce();
  });
});
