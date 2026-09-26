import { createHash } from 'node:crypto';
import { parse, type DefaultTreeAdapterMap } from 'parse5';

export const searchOrigin = 'https://whogoesfirst.fun';
export const indexNowEndpoint = 'https://api.indexnow.org/indexnow';
export const keyLocation = `${searchOrigin}/indexnow-key.txt`;
type Element = DefaultTreeAdapterMap['element'];
type Node = DefaultTreeAdapterMap['node'];
function elements(node: Node): Element[] {
  return [...('tagName' in node ? [node] : []), ...('childNodes' in node ? node.childNodes.flatMap(elements) : [])];
}
const attr = (node: Element, name: string) => node.attrs.find(value => value.name === name)?.value;
const excluded = /\b(?:noindex|none)\b/i;
/** Cloudflare randomizes email-link encoding; hash its decoded destination instead. */
export function pageContentDigest(html: string): string {
  const changes: { start: number; end: number; text: string }[] = [];
  for (const node of elements(parse(html, { sourceCodeLocationInfo: true }))) {
    const href = attr(node, 'href');
    const encoded = node.tagName === 'a' && href?.match(/^\/cdn-cgi\/l\/email-protection#((?:[a-f0-9]{2}){2,})$/i)?.[1];
    const location = node.sourceCodeLocation?.attrs?.href;
    if (!encoded || !location) continue;
    const bytes = Buffer.from(encoded, 'hex');
    try {
      const decoded = new TextDecoder('utf-8', { fatal: true }).decode(bytes.subarray(1).map(byte => byte ^ bytes[0]!));
      if (!decoded || [...decoded].some(char => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127)) continue;
      changes.push({ start: location.startOffset, end: location.endOffset, text: `href=${JSON.stringify(`mailto:${decoded}`)}` });
    } catch { /* Keep invalid encodings in the hash unchanged. */ }
  }
  for (const change of changes.sort((a, b) => b.start - a.start)) html = html.slice(0, change.start) + change.text + html.slice(change.end);
  return createHash('sha256').update(html).digest('hex');
}
export interface PageDigest { url: string; digest: string; digestAlgorithm?: 'email-link-normalized-v1' }
export interface SubmissionReceipt { checkedAt: string; endpoint: string; keyLocation: string; pages: PageDigest[]; status: 200 | 202 | null }

/** Select live canonical pages explicitly; never send visitor input or tracking URLs. */
export async function notifyChangedPages(paths: string[], key: string, send = false, previous: PageDigest[] = [], fetcher: typeof fetch = fetch): Promise<SubmissionReceipt> {
  if (!/^[a-f0-9]{32}$/i.test(key)) throw new Error('Invalid local IndexNow verification key.');
  const urls = [...new Set(paths.map(path => {
    if (!path.startsWith('/') && !path.startsWith(`${searchOrigin}/`)) throw new Error('Use clean production URLs or absolute paths.');
    const url = new URL(path, searchOrigin);
    if (url.origin !== searchOrigin || url.username || url.password || url.search || url.hash) throw new Error('Only clean production URLs are allowed.');
    return url.href;
  }))];
  if (!urls.length || urls.length > 20) throw new Error('Select 1–20 meaningfully changed pages; use the sitemap for the full inventory.');
  async function get(url: string, contentType: RegExp, requireIndexable = true) {
    const response = await fetcher(url, { redirect: 'error', signal: AbortSignal.timeout(20_000), headers: { 'User-Agent': 'WhoGoesFirst search notification preflight/1.0' } });
    if (response.status !== 200 || (requireIndexable && excluded.test(response.headers.get('x-robots-tag') || '')) || !contentType.test(response.headers.get('content-type') || '')) throw new Error('Public preflight failed; nothing was submitted.');
    return response.text();
  }
  const sitemap = await get(`${searchOrigin}/sitemap.xml`, /(?:application|text)\/xml/i);
  const published = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]));
  if (urls.some(url => !published.has(url))) throw new Error('A selected URL is absent from the live canonical sitemap; nothing was submitted.');
  const pages: PageDigest[] = [];
  for (const url of urls) {
    const html = await get(url, /text\/html/i);
    const nodes = elements(parse(html));
    const canonicals = nodes.filter(node => node.tagName === 'link' && attr(node, 'rel')?.split(/\s+/).includes('canonical'));
    const robots = nodes.filter(node => node.tagName === 'meta' && /^(?:robots|bingbot)$/i.test(attr(node, 'name') || ''));
    if (canonicals.length !== 1 || attr(canonicals[0]!, 'href') !== url || !robots.length || robots.some(node => excluded.test(attr(node, 'content') || ''))) throw new Error('Canonical or indexing preflight failed; nothing was submitted.');
    pages.push({ url, digest: pageContentDigest(html), digestAlgorithm: 'email-link-normalized-v1' });
  }
  if (send && pages.some(page => previous.some(old => old.url === page.url && old.digest === page.digest))) throw new Error('An unchanged page was already received from this checkout; nothing was resubmitted.');
  let status: SubmissionReceipt['status'] = null;
  if (send) {
    if ((await get(keyLocation, /text\/plain/i, false)).trim() !== key) throw new Error('The live ownership file does not match; nothing was submitted.');
    const response = await fetcher(indexNowEndpoint, { method: 'POST', redirect: 'error', signal: AbortSignal.timeout(20_000), headers: { 'Content-Type': 'application/json; charset=utf-8', 'User-Agent': 'WhoGoesFirst changed-page notification/1.0' }, body: JSON.stringify({ host: new URL(searchOrigin).host, key, keyLocation, urlList: urls }) });
    if (response.status !== 200 && response.status !== 202) throw new Error(`IndexNow returned HTTP ${response.status}; investigate before another attempt.`);
    status = response.status;
  }
  return { checkedAt: new Date().toISOString(), endpoint: indexNowEndpoint, keyLocation, pages, status };
}
