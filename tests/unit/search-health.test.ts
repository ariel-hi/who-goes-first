import { describe, expect, test } from 'vitest';
import { evaluateSearchHealth, type Coverage, type Performance } from '../../scripts/lib/search-health';

const now = new Date('2026-11-23T12:00:00Z');
const recent = '2026-11-22T12:00:00Z';
const performance = (current: number, previous: number, generatedAt = recent): Performance => ({
  status: 'available', generatedAt,
  sevenDay: {
    current: { window: { start: '2026-11-13', end: '2026-11-19' }, totals: { status: 'available', data: { clicks: 1, impressions: current, averagePosition: 10 } } },
    previous: { window: { start: '2026-11-06', end: '2026-11-12' }, totals: { status: 'available', data: { clicks: 1, impressions: previous, averagePosition: 10 } } },
  },
});
const coverage = (pages: Coverage['pages'], updatedAt = recent): Coverage => ({ updatedAt, pages });
const pass = { verdict: 'PASS', coverageState: 'Submitted and indexed', checkedAt: recent };
const excluded = { verdict: 'NEUTRAL', coverageState: 'Crawled - currently not indexed', checkedAt: recent };
const base = { now, corePaths: ['/', '/coin-flip/'], indexedRules: 150 };

describe('search health', () => {
  test('quiet when data is fresh and nothing regressed', () => {
    const result = evaluateSearchHealth({ ...base, performance: performance(100, 90), coverage: coverage({ '/': pass, '/coin-flip/': excluded }) });
    expect(result.alerts).toEqual([]);
    expect(result.report).toContain('/coin-flip/ (Crawled - currently not indexed)');
    expect(result.state.coreIndexed).toEqual({ '/': true, '/coin-flip/': false });
  });

  test('alerts on a sharp drop but ignores tiny numbers', () => {
    expect(evaluateSearchHealth({ ...base, performance: performance(40, 100), coverage: coverage({ '/': pass }) }).alerts.join()).toMatch(/fell 60%/);
    expect(evaluateSearchHealth({ ...base, performance: performance(2, 20), coverage: coverage({ '/': pass }) }).alerts).toEqual([]);
  });

  test('alerts when a core page drops out after being indexed', () => {
    const previous = { checkedAt: recent, coreIndexed: { '/coin-flip/': true }, weekly: [] };
    const result = evaluateSearchHealth({ ...base, previous, performance: performance(100, 100), coverage: coverage({ '/': pass, '/coin-flip/': excluded }) });
    expect(result.alerts).toEqual(['/coin-flip/ was indexed and is now "Crawled - currently not indexed".']);
  });

  test('alerts on stale or missing data feeds and an unindexed home page', () => {
    const result = evaluateSearchHealth({ ...base, performance: performance(100, 100, '2026-11-10T00:00:00Z'), coverage: coverage({ '/': excluded }, '2026-11-15T00:00:00Z') });
    expect(result.alerts.join('\n')).toMatch(/performance data is 13 days old/);
    expect(result.alerts.join('\n')).toMatch(/coverage is 8 days old/);
    expect(result.alerts.join('\n')).toMatch(/home page is not indexed/);
    expect(evaluateSearchHealth({ ...base }).alerts.length).toBe(2);
  });

  test('keeps a rolling weekly history without duplicates', () => {
    const first = evaluateSearchHealth({ ...base, performance: performance(100, 90), coverage: coverage({ '/': pass }) });
    const again = evaluateSearchHealth({ ...base, previous: first.state, performance: performance(100, 90), coverage: coverage({ '/': pass }) });
    expect(again.state.weekly).toEqual([{ end: '2026-11-19', impressions: 100, clicks: 1 }]);
  });
});
