import { describe, expect, test } from 'vitest';
import { notifyChangedPages, searchOrigin, indexNowEndpoint, keyLocation } from '../../scripts/lib/indexnow';
const key = '1234567890abcdef1234567890abcdef';
const page = `${searchOrigin}/printable-game-night/`;
function fixture(robots = 'index, follow', canonical = page) {
  const requests: { url: string; method: string; body?: string }[] = [];
  const fetcher: typeof fetch = async (input, init) => {
    const url = String(input); requests.push({ url, method: init?.method || 'GET', body: typeof init?.body === 'string' ? init.body : undefined });
    if (url.endsWith('/sitemap.xml')) return new Response(`<urlset><url><loc>${page}</loc></url></urlset>`, { headers: { 'content-type': 'application/xml' } });
    if (url === keyLocation) return new Response(key, { headers: { 'content-type': 'text/plain', 'x-robots-tag': 'noindex' } });
    if (url === indexNowEndpoint) return new Response(null, { status: 202 });
    return new Response(`<html><head><meta name="robots" content="${robots}"><link rel="canonical" href="${canonical}"></head></html>`, { headers: { 'content-type': 'text/html' } });
  };
  return { requests, fetcher };
}
describe('changed-page search notifications', () => {
  test('rejects private parameters and other origins before any request', async () => {
    for (const path of ['/printable-game-night/?name=private', '/printable-game-night/#private', '//other.example/', 'https://other.example/']) { const f = fixture(); await expect(notifyChangedPages([path], key, true, [], f.fetcher)).rejects.toThrow(); expect(f.requests).toEqual([]); }
  });
  test('dry run reads public pages but never sends a notification', async () => {
    const f = fixture(); const result = await notifyChangedPages(['/printable-game-night/'], key, false, [], f.fetcher);
    expect(result.status).toBeNull(); expect(f.requests.map(request => request.url)).toEqual([`${searchOrigin}/sitemap.xml`, page]);
  });
  test('refuses unknown, preview and incorrectly canonicalized pages without posting', async () => {
    for (const [path, robots, canonical] of [['/dev/review/', 'index, follow', page], ['/printable-game-night/', 'noindex, follow', page], ['/printable-game-night/', 'index, follow', `${searchOrigin}/`]]) { const f = fixture(robots, canonical); await expect(notifyChangedPages([path!], key, true, [], f.fetcher)).rejects.toThrow(); expect(f.requests.some(request => request.method === 'POST')).toBe(false); }
  });
  test('verifies ownership, sends clean deduplicated URLs and refuses unchanged resubmission', async () => {
    const f = fixture(); const receipt = await notifyChangedPages([page, '/printable-game-night/'], key, true, [], f.fetcher);
    expect(receipt.status).toBe(202); expect(f.requests.map(request => request.url)).toEqual([`${searchOrigin}/sitemap.xml`, page, keyLocation, indexNowEndpoint]);
    expect(JSON.parse(f.requests.at(-1)!.body!)).toEqual({ host: 'whogoesfirst.fun', key, keyLocation, urlList: [page] });
    const again = fixture(); await expect(notifyChangedPages([page], key, true, receipt.pages, again.fetcher)).rejects.toThrow('unchanged'); expect(again.requests.some(request => request.method === 'POST')).toBe(false);
  });
  test('does not post when the deployed ownership file differs', async () => {
    const f = fixture(); const wrongKey: typeof fetch = async (input, init) => String(input) === keyLocation ? new Response('wrong', { headers: { 'content-type': 'text/plain' } }) : f.fetcher(input, init);
    await expect(notifyChangedPages([page], key, true, [], wrongKey)).rejects.toThrow('ownership'); expect(f.requests.some(request => request.method === 'POST')).toBe(false);
  });
});
