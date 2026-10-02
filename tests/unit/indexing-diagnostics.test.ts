import { afterEach, describe, expect, it, vi } from 'vitest';
import { indexingReport, indexingSamplePaths, indexingSnapshot } from '../../scripts/lib/indexing-diagnostics';

describe('Search Console indexing diagnostics', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('inspects the original key pages plus the tools hub and new checklist', async () => {
    const requests: string[] = [];
    const inspectionUrls: string[] = [];
    vi.stubGlobal('fetch', vi.fn(async (input: string, init?: RequestInit) => {
      requests.push(input);
      if (input.endsWith('/sitemaps')) return new Response(JSON.stringify({ sitemap: [{
        path: 'https://whogoesfirst.fun/sitemap-index.xml', lastDownloaded: '2026-09-27T12:00:00Z',
        errors: '0', warnings: '1', contents: [{ type: 'web', submitted: '1115' }],
      }] }), { status: 200 });
      expect(init?.method).toBe('POST');
      const body = JSON.parse(String(init?.body)) as { inspectionUrl: string; siteUrl: string };
      inspectionUrls.push(body.inspectionUrl);
      expect(body.siteUrl).toBe('https://whogoesfirst.fun/');
      expect(new URL(body.inspectionUrl).origin).toBe('https://whogoesfirst.fun');
      return new Response(JSON.stringify({ inspectionResult: { indexStatusResult: {
        verdict: 'NEUTRAL', coverageState: 'Discovered - currently not indexed',
        robotsTxtState: 'ALLOWED', indexingState: 'INDEXING_ALLOWED',
      } } }), { status: 200 });
    }));

    const snapshot = await indexingSnapshot('token', 'https://whogoesfirst.fun/', 'https://whogoesfirst.fun');
    expect(requests).toHaveLength(indexingSamplePaths.length + 1);
    expect(inspectionUrls).toEqual([
      'https://whogoesfirst.fun/', 'https://whogoesfirst.fun/games/', 'https://whogoesfirst.fun/board-games/',
      'https://whogoesfirst.fun/games/catan-2020-en/', 'https://whogoesfirst.fun/games/ticket-to-ride-2015-en/',
      'https://whogoesfirst.fun/games/wingspan-online-en/', 'https://whogoesfirst.fun/tools/',
      'https://whogoesfirst.fun/game-night-checklist/',
    ]);
    expect(new Set(inspectionUrls).size).toBe(inspectionUrls.length);
    expect(snapshot.sitemapsStatus).toBe('available');
    expect(snapshot.submittedSitemaps).toMatchObject([{ errors: 0, warnings: 1, submittedUrls: 1115 }]);
    expect(snapshot.inspections.map(item => `https://whogoesfirst.fun${item.path}`)).toEqual(inspectionUrls);
    expect(snapshot.scope).toContain(`${snapshot.inspections.length} named URLs`);
    expect(snapshot.inspections.every(item => item.status === 'available' && item.verdict === 'NEUTRAL')).toBe(true);
    const report = indexingReport(snapshot);
    expect(report).toContain('Google indexing sample');
    expect(report).toContain(`This checks ${snapshot.inspections.length} named URLs`);
    expect(report).toContain('indexed data, not the current live pages or the full site');
  });

  it('records API failures as unavailable without leaking or reusing an old verdict', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('Sensitive API detail', { status: 403 })));
    const snapshot = await indexingSnapshot('token', 'https://whogoesfirst.fun/', 'https://whogoesfirst.fun');
    expect(snapshot.sitemapsStatus).toBe('unavailable');
    expect(snapshot.submittedSitemaps).toEqual([]);
    expect(snapshot.inspections).toHaveLength(indexingSamplePaths.length);
    expect(snapshot.inspections.every(item => item.status === 'unavailable' && item.reason === 'Search Console API HTTP 403')).toBe(true);
    expect(JSON.stringify(snapshot)).not.toContain('Sensitive API detail');
  });

  it('keeps the checklist result available when the tools inspection fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async (input: string, init?: RequestInit) => {
      if (input.endsWith('/sitemaps')) return new Response(JSON.stringify({ sitemap: [] }), { status: 200 });
      const body = JSON.parse(String(init?.body)) as { inspectionUrl: string };
      if (body.inspectionUrl === 'https://whogoesfirst.fun/tools/') return new Response('Sensitive API detail', { status: 403 });
      return new Response(JSON.stringify({ inspectionResult: { indexStatusResult: {
        verdict: 'PASS', coverageState: 'Submitted and indexed', pageFetchState: 'SUCCESSFUL',
      } } }), { status: 200 });
    }));
    const snapshot = await indexingSnapshot('token', 'https://whogoesfirst.fun/', 'https://whogoesfirst.fun');
    expect(snapshot.inspections.find(item => item.path === '/tools/')).toEqual({
      path: '/tools/', status: 'unavailable', reason: 'Search Console API HTTP 403',
    });
    expect(snapshot.inspections.find(item => item.path === '/game-night-checklist/')).toMatchObject({
      path: '/game-night-checklist/', status: 'available', verdict: 'PASS', pageFetchState: 'SUCCESSFUL',
    });
    const report = indexingReport(snapshot);
    expect(report).toContain('/tools/: inspection unavailable (Search Console API HTTP 403).');
    expect(report).toContain('/game-night-checklist/: PASS; Submitted and indexed;');
    expect(report).not.toContain('Sensitive API detail');
  });

  it('does not present zero errors as a successful sitemap read before any download is recorded', () => {
    const report = indexingReport({
      generatedAt: '2026-09-28T20:23:12Z', property: 'https://whogoesfirst.fun/',
      source: 'Google Search Console API', scope: 'sample', sitemapsStatus: 'available',
      submittedSitemaps: [{
        path: 'https://whogoesfirst.fun/sitemap-index.xml', lastSubmitted: '2026-09-27T23:27:43Z',
        lastDownloaded: null, isPending: true, errors: 0, warnings: 0, submittedUrls: null,
      }], inspections: [],
    });
    expect(report).toContain('no download recorded · not processed yet; fetch outcome unconfirmed');
    expect(report).toContain('check the Sitemaps UI for fetch errors');
    expect(report).not.toContain('0 errors, 0 warnings');
    expect(report).toContain('This checks 0 named URLs');
  });
});
