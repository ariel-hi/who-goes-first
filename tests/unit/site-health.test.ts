import { describe, expect, test } from 'vitest';
import { evaluateSiteHealth } from '../../scripts/lib/site-health';

const now = new Date('2026-11-26T08:00:00Z');
const window = { start: '2026-11-17', end: '2026-11-23' };
const pass = (path: string) => ({ path, verdict: 'PASS', coverageState: 'Submitted and indexed' });
const out = (path: string) => ({ path, verdict: 'NEUTRAL', coverageState: 'Crawled - currently not indexed' });

describe('sister site health', () => {
  test('quiet when stable; unindexed subpages are status, not alerts', () => {
    const result = evaluateSiteHealth({ site: 'Word King', now, window, totals: { clicks: 5, impressions: 120, position: 4 }, previousTotals: { clicks: 4, impressions: 100, position: 4 }, inspections: [pass('/'), out('/tips')] });
    expect(result.alerts).toEqual([]);
    expect(result.report).toContain('Sitemap pages indexed: 1 of 2');
  });
  test('alerts on a sharp drop, a home page out of the index, a dropped page and errors', () => {
    expect(evaluateSiteHealth({ site: 'W', now, window, totals: { clicks: 0, impressions: 20, position: 9 }, previousTotals: { clicks: 0, impressions: 100, position: 5 } }).alerts.join()).toMatch(/fell 80%/);
    expect(evaluateSiteHealth({ site: 'W', now, inspections: [out('/')] }).alerts.join()).toMatch(/home page is not indexed/);
    const previous = { checkedAt: '', weekly: [], indexed: { '/tips': true } };
    expect(evaluateSiteHealth({ site: 'W', now, previous, inspections: [pass('/'), out('/tips')] }).alerts).toEqual(['Indexed pages dropped out: /tips (Crawled - currently not indexed).']);
    expect(evaluateSiteHealth({ site: 'W', now, errors: ['failed'] }).alerts).toEqual(['failed']);
  });
});
