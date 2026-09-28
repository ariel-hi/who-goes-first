import { afterEach, describe, expect, it, vi } from 'vitest';
import { analyticsAcquisition, type AnalyticsAcquisition } from '../../scripts/lib/google-api';
import { acquisitionReport, summarizeAcquisition } from '../../scripts/lib/acquisition';

const report: AnalyticsAcquisition = {
  rows: [
    { channel: 'Direct', sourceMedium: '(direct) / (none)', sessions: 500, engagedSessions: 300 },
    { channel: 'Organic Social', sourceMedium: 'bluesky / organic_social', sessions: 200, engagedSessions: 110 },
    { channel: 'Organic Social', sourceMedium: 'reddit / organic_social', sessions: 100, engagedSessions: 20 },
  ],
  rowCount: 3, subjectToThresholding: false, dataLossFromOtherRow: false, dataTruncation: false,
};

describe('GA4 acquisition evidence', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('groups session channels and keeps missing sessions outside attribution shares', () => {
    const summary = summarizeAcquisition('2026-08-29', '2026-09-27',
      { sessions: 900, screenPageViews: 1200, totalUsers: 800 }, report);
    expect(summary).toMatchObject({ attributedSessions: 800, unattributedSessions: 100,
      channels: [{ name: 'Direct', sessions: 500, engagedSessions: 300 }, { name: 'Organic Social', sessions: 300, engagedSessions: 130 }] });
    expect(acquisitionReport(summary)).toContain('Direct: 500 sessions (55.6% of GA4 sessions)');
    expect(acquisitionReport(summary)).toContain('100 sessions are outside the returned rows');
  });

  it('rejects a report whose source sessions exceed the undimensioned total', () => {
    expect(() => summarizeAcquisition('2026-08-29', '2026-09-27',
      { sessions: 700, screenPageViews: 1200, totalUsers: 600 }, report)).toThrow('exceed undimensioned');
  });

  it('requests session-scoped dimensions and rejects incomplete API rows', async () => {
    const request = vi.fn(async (_url: string, init: RequestInit) => {
      expect(JSON.parse(String(init.body))).toMatchObject({
        dimensions: [{ name: 'sessionDefaultChannelGroup' }, { name: 'sessionSourceMedium' }],
        metrics: [{ name: 'sessions' }, { name: 'engagedSessions' }], limit: 1000,
      });
      return new Response(JSON.stringify({
        rows: [{ dimensionValues: [{ value: 'Direct' }, { value: '(direct) / (none)' }],
          metricValues: [{ value: '12' }, { value: '6' }] }], rowCount: 2,
      }), { status: 200 });
    });
    vi.stubGlobal('fetch', request);
    await expect(analyticsAcquisition('token', '123', '2026-08-29', '2026-09-27')).rejects.toThrow('incomplete');
    expect(request).toHaveBeenCalledOnce();
  });

  it('rejects engaged sessions above sessions and carries quality flags', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({
      rows: [{ dimensionValues: [{ value: 'Referral' }, { value: 'site.example / referral' }],
        metricValues: [{ value: '12' }, { value: '13' }] }], rowCount: 1,
    }), { status: 200 })));
    await expect(analyticsAcquisition('token', '123', '2026-08-29', '2026-09-27')).rejects.toThrow('invalid row');
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({
      rows: [{ dimensionValues: [{ value: 'Referral' }, { value: 'site.example / referral' }],
        metricValues: [{ value: '12' }, { value: '6' }] }], rowCount: 1,
      metadata: { subjectToThresholding: true, dataLossFromOtherRow: false, dataTruncationReasons: ['limit'] },
    }), { status: 200 })));
    expect(await analyticsAcquisition('token', '123', '2026-08-29', '2026-09-27')).toMatchObject({
      rows: [{ channel: 'Referral', sourceMedium: 'site.example / referral', sessions: 12, engagedSessions: 6 }],
      subjectToThresholding: true, dataLossFromOtherRow: false, dataTruncation: true,
    });
  });
});
