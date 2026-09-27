import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse, type DefaultTreeAdapterMap } from 'parse5';
import { normalizedEmailLinks, type PageDigest } from './indexnow';

type Node = DefaultTreeAdapterMap['node'];
type Element = DefaultTreeAdapterMap['element'];
const attr = (node: Element, name: string) => node.attrs.find(value => value.name === name)?.value;
export const publishedDigestAlgorithm = 'published-editorial-email-v1' as const;
function protectedEmailText(node: Element): string | undefined {
  const encoded = attr(node, 'data-cfemail');
  if (!attr(node, 'class')?.split(/\s+/).includes('__cf_email__') || !encoded || !/^(?:[a-f0-9]{2}){2,}$/i.test(encoded)) return;
  const bytes = Buffer.from(encoded, 'hex');
  try {
    const decoded = new TextDecoder('utf-8', { fatal: true }).decode(bytes.subarray(1).map(byte => byte ^ bytes[0]!));
    return decoded && ![...decoded].some(char => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127) ? decoded : undefined;
  } catch { return; }
}
function elements(node: Node): Element[] {
  return [...('tagName' in node ? [node] : []), ...('childNodes' in node ? node.childNodes.flatMap(elements) : [])];
}
function content(node: Node): string {
  if (node.nodeName === '#text') return (node as DefaultTreeAdapterMap['textNode']).value;
  if ('tagName' in node && (['script', 'style', 'ins'].includes(node.tagName) || attr(node, 'class')?.split(/\s+/).includes('rule-ad'))) return '';
  if ('tagName' in node) {
    const email = protectedEmailText(node);
    if (email !== undefined) return email;
  }
  return 'childNodes' in node ? node.childNodes.map(content).join(' ') : '';
}
/** Compare editorial content and source links, ignoring asset hashes and presentation. */
export function publishedPage(html: string): { url: string; digest: string } | undefined {
  const nodes = elements(parse(normalizedEmailLinks(html)));
  const robots = nodes.find(node => node.tagName === 'meta' && attr(node, 'name') === 'robots');
  if (!robots || /\b(noindex|none)\b/i.test(attr(robots, 'content') || '')) return;
  const url = nodes.find(node => node.tagName === 'link' && attr(node, 'rel') === 'canonical');
  const canonical = url && attr(url, 'href');
  if (!canonical) throw new Error('Indexable page has no canonical URL');
  const main = nodes.find(node => node.tagName === 'main');
  const title = nodes.find(node => node.tagName === 'title');
  const description = nodes.find(node => node.tagName === 'meta' && attr(node, 'name') === 'description');
  const payload = [title && content(title), description && attr(description, 'content'), main && content(main),
    ...(main ? elements(main).filter(node => node.tagName === 'a').map(node => attr(node, 'href')) : [])];
  const normalized = payload.map(value => typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : value);
  return { url: canonical, digest: createHash('sha256').update(JSON.stringify(normalized)).digest('hex') };
}
export function publishedPages(directory: string): Map<string, string> {
  const pages = new Map<string, string>();
  function walk(path: string) {
    for (const file of readdirSync(path, { withFileTypes: true })) {
      const full = join(path, file.name);
      if (file.isDirectory()) walk(full);
      else if (file.name.endsWith('.html')) {
        const page = publishedPage(readFileSync(full, 'utf8'));
        if (page) pages.set(page.url, page.digest);
      }
    }
  }
  walk(directory);
  return pages;
}
export function changedPublishedPages(before: Map<string, string>, after: Map<string, string>): string[] {
  return [...after].filter(([url, digest]) => before.get(url) !== digest).map(([url]) => url).sort();
}
/** A preview check cannot prove the apex has received this editorial revision. */
export function assertPublishedCandidate(expected: ReadonlyMap<string, string>, url: string, html: string): void {
  const live = publishedPage(html);
  if (!live || live.url !== url || !expected.has(url) || expected.get(url) !== live.digest) {
    throw new Error('Live editorial content does not match the candidate build; nothing was submitted.');
  }
}
/** A partial acknowledgment survives later presentation-only deployments. */
export function latestAcknowledgedPages(previous: readonly PageDigest[]): PageDigest[] {
  return [...new Map(previous.map(page => [page.url, page])).values()];
}
export function unacknowledgedPublishedPages(pages: readonly PageDigest[], previous: readonly PageDigest[], current: ReadonlyMap<string, string>): string[] {
  const latest = latestAcknowledgedPages(previous);
  return pages.filter(page => !latest.some(old => old.url === page.url && (old.editorialDigestAlgorithm === publishedDigestAlgorithm
    ? current.has(page.url) && old.editorialDigest !== undefined && old.editorialDigest === current.get(page.url)
    : old.digest === page.digest))).map(page => page.url);
}
