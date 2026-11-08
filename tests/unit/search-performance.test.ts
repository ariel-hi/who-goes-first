import { describe, expect, it } from 'vitest';
import {
  collectSearchPerformance, matchSearchRows, searchMetricChange, searchMetricRows, searchPerformanceWindows, searchTotals, type PerformanceRow,
} from '../../scripts/lib/search-performance';

const property = 'https://whogoesfirst.fun/';
const row = (keys: string[], impressions: number, clicks = 0, position = 8): PerformanceRow => ({
  keys, clicks, impressions, position, ctr: 0.99,
});

describe('Search Console reporting windows', () => {
  it('uses exact inclusive7/28-day windows and the existing UTC cutoff across Pacific DST', () => {
    expect(searchPerformanceWindows('2026-11-08')).toEqual({
      anchorDateUtc: '2026-11-08', reportingLagDays: 3,
      sevenDay: { current: { start: '2026-10-30', end: '2026-11-05' }, previous: { start: '2026-10-23', end: '2026-10-29' } },
      twentyEightDay: { current: { start: '2026-10-09', end: '2026-11-05' }, previous: { start: '2026-09-11', end: '2026-10-08' } },
    });
    expect(searchPerformanceWindows('2024-03-03').sevenDay).toEqual({
      current: { start: '2024-02-23', end: '2024-02-29' }, previous: { start: '2024-02-16', end: '2024-02-22' },
    });
    expect(searchPerformanceWindows('2027-01-02').twentyEightDay).toEqual({
      current: { start: '2026-12-03', end: '2026-12-30' }, previous: { start: '2026-11-05', end: '2026-12-02' },
    });
    expect(() => searchPerformanceWindows('2026-02-30')).toThrow('Invalid Search Console');
    expect(() => searchPerformanceWindows('2026-11-08', -1)).toThrow('Invalid Search Console');
  });
});

describe('retained Google metrics', () => {
  it('accepts omitted total keys, uses Google position and computes CTR from exact counts', async () => {
    const windows = searchPerformanceWindows('2026-11-08');
    const snapshot = await collectSearchPerformance(property, windows, async (start, _end, dimensions) => {
      if (!dimensions.length) return [{ clicks: start === windows.sevenDay.previous.start ? 5 : 10,
        impressions: start === windows.sevenDay.previous.start ? 200 : 100, position: start === windows.sevenDay.previous.start ? 30 : 25, ctr: 0.99 }];
      return [row(dimensions.length === 1 ? [`${property}page/`] : [`${property}page/`, 'query'], 1000, 1, 1)];
    }, [row([`${property}page/`], 1000, 1, 1)]);
    expect(snapshot.sevenDay.current.totals.data).toEqual({ clicks: 10, impressions: 100, ctr: 0.1, averagePosition: 25 });
    expect(snapshot.sevenDay.current.pages.data?.[0]?.averagePosition).toBe(1);
    expect(snapshot.sevenDay.changes.totals).toMatchObject({
      clicks: 5, impressions: -100, clicksPercent: 100, impressionsPercent: -50, averagePosition: -5,
    });
    expect(snapshot.sevenDay.changes.totals!.ctrPercentagePoints).toBeCloseTo(7.5);
    expect(snapshot).toMatchObject({ property, searchType: 'web', dataState: 'final', dateTimezone: 'America/Los_Angeles', filters: [], status: 'available' });
    expect(snapshot.dimensions).toEqual({ totals: [], pages: ['page'], pageQuery: ['page', 'query'] });
    expect(snapshot.generatedAt).toMatch(/Z$/);
    expect(snapshot.aggregation).toContain('responseAggregationType is not retained');
  });

  it('does not invent percentage or position changes from a zero-impression baseline', () => {
    expect(searchMetricChange({ clicks: 1, impressions: 10, ctr: 0.1, averagePosition: 4 }, searchTotals([]))).toEqual({
      clicks: 1, impressions: 10, clicksPercent: null, impressionsPercent: null, ctrPercentagePoints: null, averagePosition: null,
    });
  });

  it('distinguishes successful empty totals and visible row sets from request failures', async () => {
    const windows = searchPerformanceWindows('2026-11-08');
    const snapshot = await collectSearchPerformance(property, windows, async (start, _end, dimensions) => {
      if (start === windows.sevenDay.previous.start && !dimensions.length) throw new Error('request failed (403): private request details');
      return [];
    }, []);
    expect(snapshot.status).toBe('partial');
    expect(snapshot.sevenDay.current.totals).toEqual({
      status: 'available', returnedRowCount: 0, emptyResult: true, data: { clicks: 0, impressions: 0, ctr: null, averagePosition: null },
    });
    expect(snapshot.sevenDay.previous.totals).toEqual({
      status: 'unavailable', returnedRowCount: null, emptyResult: null, data: null, reason: 'Search Console request failed (HTTP 403)',
    });
    expect(snapshot.sevenDay.current.pages).toEqual({ status: 'available', returnedRowCount: 0, emptyResult: true, data: [] });
    expect(snapshot.sevenDay.changes.totals).toBeNull();
    expect(snapshot.sevenDay.changes.pages).toEqual([]);
    expect(JSON.stringify(snapshot)).not.toContain('private request details');
  });

  it('rejects malformed or duplicate rows rather than manufacturing metrics or double-counting', () => {
    expect(() => searchTotals([row(['date'], 5)])).toThrow('dimensionless');
    expect(() => searchTotals([row([], 5), row([], 5)])).toThrow('dimensionless');
    expect(() => searchMetricRows([row(['page'], 5)], 2)).toThrow('dimensions');
    expect(() => searchMetricRows([row(['page', 'q'], 5), row(['page', 'q'], 2)], 2)).toThrow('duplicate');
    for (const invalid of [{ ...row(['page'], 5), clicks: NaN }, row(['page'], -1), row(['page'], 0.5), row(['page'], 5, 1, Infinity)]) {
      expect(() => searchMetricRows([invalid], 1)).toThrow('metrics');
    }
  });
});

describe('matched Search Console rows', () => {
  it('matches real tuples without delimiter collisions and leaves missing counterparts/deltas null', () => {
    const current = searchMetricRows([row([`${property}a|b/`, 'c'], 10, 2, 6), row([`${property}a`, 'b/|c'], 4)], 2);
    const previous = searchMetricRows([row([`${property}a|b/`, 'c'], 5, 1, 9), row([`${property}old/`, 'quoted "query"'], 8)], 2);
    const matched = matchSearchRows(current, previous)!;
    expect(matched).toHaveLength(3);
    expect(matched.find(value => value.keys[0] === `${property}a|b/`)).toMatchObject({
      presence: 'returned_both', change: { clicks: 1, impressions: 5, impressionsPercent: 100, ctrPercentagePoints: 0, averagePosition: -3 },
    });
    expect(matched.find(value => value.keys[0] === `${property}a`)).toMatchObject({
      presence: 'current_only_returned', previous: null, change: null,
    });
    expect(matched.find(value => value.keys[0] === `${property}old/`)).toMatchObject({
      presence: 'previous_only_returned', current: null, change: null,
    });
    expect(matchSearchRows(null, previous)).toBeNull();
  });

  it('preserves healthy periods, all returned rows and current28 reuse with bounded query concurrency', async () => {
    const windows = searchPerformanceWindows('2026-11-08');
    const requests: Array<{ start: string; end: string; dimensions: string[] }> = [];
    let active = 0;
    let peak = 0;
    const cached = Array.from({ length: 35 }, (_, i) => row([`${property}cached-${i}/`], i + 1));
    const snapshot = await collectSearchPerformance(property, windows, async (start, end, dimensions) => {
      requests.push({ start, end, dimensions });
      peak = Math.max(peak, ++active);
      await Promise.resolve();
      active--;
      if (start === windows.sevenDay.current.start && dimensions.length === 2) throw new Error('temporary failure');
      return !dimensions.length ? [row([], 10, 1, 7)]
        : [row(dimensions.length === 1 ? [`${property}page/`] : [`${property}page/`, 'query'], 5)];
    }, cached);
    expect(requests).toHaveLength(11);
    expect(peak).toBeLessThanOrEqual(3);
    expect(requests.filter(value => value.start === windows.twentyEightDay.current.start && value.dimensions.length === 1)).toEqual([]);
    expect(snapshot.twentyEightDay.current.pages.data).toHaveLength(35);
    expect(snapshot.sevenDay.current.pageQuery.status).toBe('unavailable');
    expect(snapshot.sevenDay.changes.pageQuery).toBeNull();
    expect(snapshot.sevenDay.changes.pages).toHaveLength(1);
    expect(snapshot.twentyEightDay.previous.totals.status).toBe('available');
    expect(snapshot.twentyEightDay.changes.pageQuery).toHaveLength(1);
    expect(snapshot.notes.join(' ')).toMatch(/privacy-filtered.*not zero impressions/);
  });
});
