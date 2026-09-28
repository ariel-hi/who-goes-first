import { afterEach, describe, expect, it, vi } from 'vitest';
import { analyticsAffiliateOpens } from '../../scripts/lib/google-api';
import { affiliateEventsReport, affiliateEventsSummary, type AffiliateEventsSnapshot } from '../../scripts/lib/affiliate-events';

describe('GA4 affiliate-open evidence', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('requests only the fixed event and counts it without claiming sales', async () => {
    const request = vi.fn(async (_url: string, init: RequestInit) => {
      expect(JSON.parse(String(init.body))).toMatchObject({
        dateRanges: [{ startDate: '2026-09-28', endDate: '2026-10-04' }],
        dimensionFilter: { filter: { fieldName: 'eventName', stringFilter: { matchType: 'EXACT', value: 'affiliate_outbound' } } },
        metrics: [{ name: 'eventCount' }],
      });
      return new Response(JSON.stringify({ rows: [{ metricValues: [{ value: '12' }] }], rowCount: 1 }), { status: 200 });
    });
    vi.stubGlobal('fetch', request);
    const result = await analyticsAffiliateOpens('token', '123', '2026-09-28', '2026-10-04');
    expect(result).toMatchObject({ eventCount: 12, subjectToThresholding: false });
    const summary = affiliateEventsSummary('2026-09-28', '2026-10-04', result);
    expect(affiliateEventsReport(summary)).toContain('12** reported events');
    expect(affiliateEventsReport(summary)).toContain('not verified purchases, commissions, or revenue');
    expect(affiliateEventsReport(summary)).not.toContain('%');
    expect(request).toHaveBeenCalledOnce();
  });

  it('distinguishes an empty event response from an unavailable request', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ rowCount: 0 }), { status: 200 })));
    expect((await analyticsAffiliateOpens('token', '123', '2026-09-28', '2026-10-04')).eventCount).toBe(0);
    const pending: AffiliateEventsSnapshot = { status: 'pending', periodStart: '2026-09-28', periodEnd: '2026-09-27', reason: 'No completed measurement day' };
    const unavailable: AffiliateEventsSnapshot = { ...pending, status: 'unavailable', reason: 'GA4 query failed' };
    expect(affiliateEventsReport(pending)).toContain('No completed measurement day');
    expect(affiliateEventsReport(unavailable)).toContain('GA4 query failed');
    expect(affiliateEventsReport(unavailable)).not.toContain('**0**');
  });

  it('rejects malformed counts and carries GA4 quality flags', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ rows: [{ metricValues: [{ value: '-1' }] }], rowCount: 1 }), { status: 200 })));
    await expect(analyticsAffiliateOpens('token', '123', '2026-09-28', '2026-10-04')).rejects.toThrow('invalid count');
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({
      rows: [{ metricValues: [{ value: '3' }] }], rowCount: 1,
      metadata: { subjectToThresholding: true, dataTruncationReasons: ['threshold'] },
    }), { status: 200 })));
    const summary = affiliateEventsSummary('2026-09-28', '2026-10-04',
      await analyticsAffiliateOpens('token', '123', '2026-09-28', '2026-10-04'));
    expect(summary).toMatchObject({ subjectToThresholding: true, dataTruncation: true });
    expect(affiliateEventsReport(summary)).toContain('may be incomplete');
  });
});
