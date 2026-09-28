import { afterEach, describe, expect, it, vi } from 'vitest';
import { indexingReport, indexingSamplePaths, indexingSnapshot } from '../../scripts/lib/indexing-diagnostics';

describe('Search Console indexing diagnostics', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('requests the submitted sitemap list and indexed versions of six canonical URLs', async () => {
    const requests: string[] = [];
    vi.stubGlobal('fetch', vi.fn(async (input: string, init?: RequestInit) => {
      requests.push(input);
      if (input.endsWith('/sitemaps')) return new Response(JSON.stringify({ sitemap: [{
        path: 'https://whogoesfirst.fun/sitemap-index.xml', lastDownloaded: '2026-09-27T12:00:00Z',
        errors: '0', warnings: '1', contents: [{ type: 'web', submitted: '1115' }],
      }] }), { status: 200 });
      expect(init?.method).toBe('POST');
      const body = JSON.parse(String(init?.body)) as { inspectionUrl: string; siteUrl: string };
      expect(body.siteUrl).toBe('https://whogoesfirst.fun/');
      expect(new URL(body.inspectionUrl).origin).toBe('https://whogoesfirst.fun');
      return new Response(JSON.stringify({ inspectionResult: { indexStatusResult: {
        verdict: 'NEUTRAL', coverageState: 'Discovered - currently not indexed',
        robotsTxtState: 'ALLOWED', indexingState: 'INDEXING_ALLOWED',
      } } }), { status: 200 });
    }));

    const snapshot = await indexingSnapshot('token', 'https://whogoesfirst.fun/', 'https://whogoesfirst.fun');
    expect(requests).toHaveLength(indexingSamplePaths.length + 1);
    expect(snapshot.sitemapsStatus).toBe('available');
    expect(snapshot.submittedSitemaps).toMatchObject([{ errors: 0, warnings: 1, submittedUrls: 1115 }]);
    expect(snapshot.inspections).toHaveLength(6);
    expect(snapshot.inspections.every(item => item.status === 'available' && item.verdict === 'NEUTRAL')).toBe(true);
    const report = indexingReport(snapshot);
    expect(report).toContain('Google indexing sample');
    expect(report).toContain('indexed data, not the current live pages or the full site');
  });

  it('records API failures as unavailable without leaking or reusing an old verdict', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('Sensitive API detail', { status: 403 })));
    const snapshot = await indexingSnapshot('token', 'https://whogoesfirst.fun/', 'https://whogoesfirst.fun');
    expect(snapshot.sitemapsStatus).toBe('unavailable');
    expect(snapshot.submittedSitemaps).toEqual([]);
    expect(snapshot.inspections).toHaveLength(6);
    expect(snapshot.inspections.every(item => item.status === 'unavailable' && item.reason === 'Search Console API HTTP 403')).toBe(true);
    expect(JSON.stringify(snapshot)).not.toContain('Sensitive API detail');
  });
});
