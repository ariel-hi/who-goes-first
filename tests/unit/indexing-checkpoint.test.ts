import { describe, expect, it, vi } from 'vitest';
import { checkpointInspection, checkpointOrigin, checkpointRelease, checkpointTargets, collectIndexingCheckpoint, indexingCheckpointMarkdown } from '../../scripts/lib/indexing-checkpoint';
import type { Probe } from '../../scripts/lib/growth-report';
import { inspectIndexedUrl } from '../../scripts/lib/google-api';

const now = () => new Date('2026-10-21T16:02:00Z');
const url = `${checkpointOrigin}${checkpointTargets[0].path}`;
const healthy = async (path: string): Promise<Probe> => ({
  path, status: 200, url: `${checkpointOrigin}${path}`, robots: '',
  body: `<h1>Game</h1><link rel="canonical" href="${checkpointOrigin}${path}">`,
});
const indexed = { verdict: 'PASS', coverageState: 'Submitted and indexed', lastCrawlTime: '2026-10-21T12:00:00Z', googleCanonical: url };
const excluded = { verdict: 'NEUTRAL', coverageState: 'Crawled - currently not indexed' };

describe('October indexing checkpoint', () => {
  it('passes a cancellation signal through URL Inspection to the HTTP request', async () => {
    const signal = AbortSignal.timeout(25000);
    const fetcher = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ inspectionResult: { indexStatusResult: indexed } })));
    try {
      await expect(inspectIndexedUrl('test', `${checkpointOrigin}/`, url, signal)).resolves.toEqual(indexed);
      expect(fetcher).toHaveBeenCalledWith('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', expect.objectContaining({ signal }));
    } finally { fetcher.mockRestore(); }
  });

  it('classifies explicit PASS and exclusions, treating missing and malformed evidence as unknown', () => {
    expect(checkpointInspection(indexed, url, now().toISOString()).state).toBe('indexed');
    expect(checkpointInspection(excluded, url, now().toISOString()).state).toBe('not indexed');
    expect(checkpointInspection({ ...excluded, verdict: 'FAIL' }, url, now().toISOString()).state).toBe('not indexed');
    for (const input of [undefined, null, [], {}, { verdict: 'PASS' }, { verdict: true, coverageState: 'Indexed' }, { verdict: 'VERDICT_UNSPECIFIED', coverageState: 'Unknown' }]) {
      expect(checkpointInspection(input, url, now().toISOString()).state).toBe('unknown');
    }
  });

  it('distinguishes predeployment, postdeployment and unusable crawl dates', () => {
    const inspect = (lastCrawlTime: unknown) => checkpointInspection({ ...indexed, lastCrawlTime }, url, now().toISOString());
    expect(inspect('2026-10-18T12:00:00Z').crawledAfterRelease).toBe(false);
    expect(inspect('2026-10-20T22:29:20Z').crawledAfterRelease).toBe(false);
    expect(inspect(checkpointRelease).crawledAfterRelease).toBe(false);
    expect(inspect('2026-10-20T22:29:22Z').crawledAfterRelease).toBe(true);
    for (const date of [undefined, 'invalid', '2026-10-22T00:00:00Z']) expect(inspect(date).crawledAfterRelease).toBeNull();
  });

  it('checks all three exact URLs and preserves partial API and live failures without raw errors', async () => {
    const inspect = vi.fn(async (_token: string, _property: string, inspectedUrl: string) => {
      if (inspectedUrl.includes('wingspan')) throw new Error('searchconsole.googleapis.com request failed (403): SECRET_TOKEN <script>raw body</script>');
      return inspectedUrl.includes('burgundy') ? excluded : indexed;
    });
    const report = await collectIndexingCheckpoint('SECRET_TOKEN', 'available', { now, inspect, probe: async path => {
      if (path.includes('burgundy')) throw new Error('PRIVATE_NETWORK_DETAIL');
      return healthy(path);
    } });
    expect(inspect.mock.calls.map(call => call[2])).toEqual(checkpointTargets.map(target => `${checkpointOrigin}${target.path}`));
    expect(report.counts).toEqual({ indexed: 1, notIndexed: 1, unknown: 1 });
    expect(report.technicalFailure).toBe(true);
    expect(report.pages[1]!.google.reason).toBe('Google inspection unavailable (HTTP 403).');
    expect(report.pages[2]!.live.issues).toEqual(['Live fetch unavailable.']);
    expect(JSON.stringify(report)).not.toMatch(/SECRET_TOKEN|raw body|PRIVATE_NETWORK_DETAIL/);
  });

  it('records missing or failed authentication as unavailable while still checking live pages', async () => {
    for (const authentication of ['missing', 'failed'] as const) {
      const inspect = vi.fn();
      const probe = vi.fn(healthy);
      const report = await collectIndexingCheckpoint(undefined, authentication, { now, inspect, probe });
      expect(inspect).not.toHaveBeenCalled();
      expect(probe).toHaveBeenCalledTimes(3);
      expect(report.counts).toEqual({ indexed: 0, notIndexed: 0, unknown: 3 });
      expect(report.technicalFailure).toBe(true);
      expect(indexingCheckpointMarkdown(report)).toContain('Google authentication');
    }
  });

  it('does not fail merely because pages remain excluded, but reports live blockers', async () => {
    const report = await collectIndexingCheckpoint('test', 'available', { now, inspect: async () => excluded, probe: healthy });
    expect(report.counts.notIndexed).toBe(3);
    expect(report.technicalFailure).toBe(false);
    const blocked = await collectIndexingCheckpoint('test', 'available', { now, inspect: async () => indexed, probe: async path => ({ ...await healthy(path), robots: 'noindex' }) });
    expect(blocked.technicalFailure).toBe(true);
    expect(blocked.pages[0]!.live.issues).toContain('HTTP robots header prevents indexing');
  });

  it('reports canonical mismatches and escapes Markdown, HTML and mentions from source fields', async () => {
    const report = await collectIndexingCheckpoint('test', 'available', { now, probe: healthy, inspect: async () => ({
      ...indexed, googleCanonical: 'https://example.com/other/', userCanonical: 'javascript:alert(1)',
      coverageState: 'Indexed | forged\n## @everyone [click](https://bad.test) <script>alert</script>',
    }) });
    expect(report.pages[0]!.google.googleCanonicalMatchesRequested).toBe(false);
    expect(report.pages[0]!.google.userCanonical).toBeNull();
    const markdown = indexingCheckpointMarkdown(report);
    expect(markdown).not.toContain('@everyone');
    expect(markdown).not.toContain('<script>');
    expect(markdown).not.toContain('[click](https://bad.test)');
    expect(markdown).toContain('&#64;everyone');
    expect(markdown).toContain('\\| forged');
    expect(markdown).toContain('Google canonical matches requested URL: No');
  });
});
