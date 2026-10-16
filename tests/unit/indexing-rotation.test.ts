import { describe, expect, it } from 'vitest';
import {
  coverageFreshness, coverageReport, inspectionBudget, inspectionQueue, recordInspectionAttempt,
  requestIndexingCandidates, type Coverage,
} from '../../scripts/lib/indexing-rotation';

const observation = (path: string, verdict = 'PASS', checkedAt = '2026-10-01T12:00:00Z'): Coverage => ({
  path, verdict, checkedAt, coverageState: verdict === 'PASS' ? 'Submitted and indexed' : 'Crawled - currently not indexed',
});

describe('indexing inspection rotation', () => {
  it('refreshes old PASS pages despite a nonindexed backlog larger than the daily budget', () => {
    const paths = Array.from({ length: 25 }, (_, i) => `/page-${String(i).padStart(2, '0')}/`);
    const pages = Object.fromEntries(paths.map((path, i) => [path, observation(path, i < 20 ? 'NEUTRAL' : 'PASS')]));
    const visited = new Set<string>();
    // Six of 25 URLs can be checked per day. One priority URL cannot consume
    // the five rotating slots, even while the same 20 pages remain nonindexed.
    for (let day = 2; day <= 6; day++) {
      const checkedAt = `2026-10-0${day}T12:00:00Z`;
      for (const path of inspectionQueue(paths, pages, 6, [paths[0]!])) {
        visited.add(path);
        recordInspectionAttempt(pages, path, checkedAt);
        pages[path]!.checkedAt = checkedAt;
      }
    }
    expect(visited.size).toBe(25);
    expect(paths.slice(20).every(path => pages[path]!.checkedAt !== '2026-10-01T12:00:00Z')).toBe(true);
  });

  it('rotates repeated API failures instead of spending every run on the same unavailable URLs', () => {
    const paths = ['/a/', '/b/', '/c/', '/d/'];
    const pages: Record<string, Coverage> = {};
    const first = inspectionQueue(paths, pages, 2);
    first.forEach(path => recordInspectionAttempt(pages, path, '2026-10-15T12:00:00Z'));
    const second = inspectionQueue(paths, pages, 2);
    expect(second).toEqual(['/c/', '/d/']);
    second.forEach(path => recordInspectionAttempt(pages, path, '2026-10-16T12:00:00Z'));
    expect(inspectionQueue(paths, pages, 2)).toEqual(first);
    expect(Object.values(pages).every(page => page.checkedAt === '')).toBe(true);
  });

  it('limits priorities, removes duplicates and excludes retired URLs', () => {
    const paths = ['/old-1/', '/old-2/', '/old-3/', '/p1/', '/p2/', '/p3/'];
    const pages = Object.fromEntries(paths.map(path => [path, observation(path, 'PASS', path.startsWith('/p') ? '2026-10-15T12:00:00Z' : '2026-10-01T12:00:00Z')]));
    const queue = inspectionQueue([...paths, paths[0]!], pages, 4, ['/removed/', '/p1/', '/p1/', '/p2/', '/p3/']);
    expect(queue).toEqual(['/p1/', '/old-1/', '/old-2/', '/old-3/']);
    expect(inspectionQueue(paths, pages, 1, ['/p1/'])).toEqual(['/old-1/']);
  });

  it('allows a bounded one-off refresh of the complete 1505 URL inventory', () => {
    const paths = Array.from({ length: 1505 }, (_, i) => `/page-${i}/`);
    const queue = inspectionQueue(paths, {}, inspectionBudget('1600'), paths.slice(0, 13));
    expect(queue).toHaveLength(1505);
    expect(new Set(queue)).toEqual(new Set(paths));
  });

  it('keeps the default budget and rejects invalid or quota-consuming overrides', () => {
    expect(inspectionBudget()).toBe(150);
    expect(inspectionBudget('')).toBe(150);
    expect(inspectionBudget('  ')).toBe(150);
    expect(inspectionBudget('1505')).toBe(1505);
    expect(inspectionBudget('1')).toBe(1);
    for (const value of ['0', '-1', '1.5', 'NaN', 'Infinity', '1601', '2000']) {
      expect(() => inspectionBudget(value)).toThrow('integer from 1 to 1600');
    }
  });
});

describe('indexing observation freshness', () => {
  const now = Date.parse('2026-10-15T12:00:00Z');

  it('separates this-run, recent, historical and failed observations without reusing an old PASS', () => {
    const pages = {
      '/stale-pass/': observation('/stale-pass/'),
      '/failed-pass/': { ...observation('/failed-pass/', 'PASS', '2026-10-14T12:00:00Z'), lastAttemptedAt: '2026-10-15T12:00:00Z' },
      '/fresh-pass/': observation('/fresh-pass/', 'PASS', '2026-10-12T12:00:00Z'),
      '/newly-excluded/': observation('/newly-excluded/', 'NEUTRAL', '2026-10-15T12:00:00Z'),
    };
    const paths = [...Object.keys(pages), '/uninspected/'];
    const groups = coverageFreshness(paths, pages, now);
    expect(groups.fresh.map(page => page.path)).toEqual(['/fresh-pass/', '/newly-excluded/']);
    expect(groups.historical.map(page => page.path)).toEqual(['/stale-pass/']);
    expect(groups.unavailable.map(page => page.path)).toEqual(['/failed-pass/']);
    expect(groups.uninspected).toEqual(['/uninspected/']);
    const report = coverageReport(paths, pages, ['/newly-excluded/'], 1, now);
    expect(report).toContain('This run: 1 successful inspections; 1 failed. Indexed (PASS) in this run: 0 of 1.');
    expect(report).toContain('Recent observations (last 3 days, latest attempt successful): 2; indexed (PASS) in those observations: 1.');
    expect(report).toContain('Historical observations (older than 3 days): 1; last observed PASS: 1. These are not current indexing counts.');
    expect(report).toContain('Latest inspection unavailable: 1; previous PASS retained as historical only: 1.');
    expect(report).toContain('Crawled - currently not indexed: 1');
    expect(report).not.toContain('- Submitted and indexed:');
    expect(report).not.toMatch(/\b\d+%/);
  });

  it('only recommends recent successful non-PASS observations, with recovery targets first', () => {
    const pages = {
      '/stale/': observation('/stale/', 'NEUTRAL'),
      '/failed/': { ...observation('/failed/', 'NEUTRAL', '2026-10-14T12:00:00Z'), lastAttemptedAt: '2026-10-15T12:00:00Z' },
      '/recent/': observation('/recent/', 'NEUTRAL', '2026-10-15T12:00:00Z'),
      '/recovery/': observation('/recovery/', 'NEUTRAL', '2026-10-14T12:00:00Z'),
      '/indexed/': observation('/indexed/', 'PASS', '2026-10-15T12:00:00Z'),
    };
    expect(requestIndexingCandidates(Object.keys(pages), pages, ['/stale/', '/recovery/'], now).map(page => page.path))
      .toEqual(['/recovery/', '/recent/']);
  });
});
