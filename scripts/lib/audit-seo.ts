import { parse, type DefaultTreeAdapterMap } from 'parse5';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import assert from 'node:assert/strict';

type Node = DefaultTreeAdapterMap['node'];
type Element = DefaultTreeAdapterMap['element'];
function elements(node: Node): Element[] {
  return [...('tagName' in node ? [node] : []), ...('childNodes' in node ? node.childNodes.flatMap(elements) : [])];
}
const attr = (element: Element, name: string) => element.attrs.find(value => value.name === name)?.value;
function text(node: Node): string { return 'value' in node ? node.value : 'childNodes' in node ? node.childNodes.map(text).join('') : ''; }

/** Audits the actual HTML artifact, including links when JavaScript is disabled. */
export function auditSeo(output: string, files: string[], origin: string, production: boolean) {
  const pages = files.filter(path => path.endsWith('.html')).map(path => {
    const file = relative(output, path).replaceAll('\\', '/');
    const nodes = elements(parse(readFileSync(path, 'utf8')));
    const route = file === '404.html' ? '/404.html' : `/${file.replace(/index\.html$/, '')}`;
    const canonical = new URL(route, origin).href;
    const tags = (tag: string) => nodes.filter(node => node.tagName === tag);
    const meta = (name: string) => nodes.filter(node => node.tagName === 'meta' && (attr(node, 'name') === name || attr(node, 'property') === name));
    const one = (items: Element[], label: string) => { assert.equal(items.length, 1, `${file}: exactly one ${label} required`); return items[0]!; };
    const title = text(one(tags('title'), 'title')).trim();
    const description = attr(one(meta('description'), 'description'), 'content');
    assert.ok(title.length > 5 && description && description.length > 30, `${file}: meaningful title/description required`);
    assert.ok(text(one(tags('h1'), 'h1')).trim(), `${file}: empty h1`);
    one(tags('main'), 'main landmark');
    assert.equal(attr(one(tags('html'), 'html'), 'lang'), 'en', `${file}: document language`);
    assert.equal(attr(one(tags('link').filter(node => attr(node, 'rel') === 'canonical'), 'canonical'), 'href'), canonical, `${file}: exact canonical path`);
    assert.equal(attr(one(meta('og:url'), 'og:url'), 'content'), canonical, `${file}: social URL must match canonical`);
    for (const name of ['og:title', 'twitter:title']) assert.equal(attr(one(meta(name), name), 'content'), title, `${file}: ${name}`);
    for (const name of ['og:description', 'twitter:description']) assert.equal(attr(one(meta(name), name), 'content'), description, `${file}: ${name}`);
    for (const name of ['og:image', 'twitter:image']) {
      const image = attr(one(meta(name), name), 'content')!;
      assert.ok(image === `${origin}/social.png` || (/^\/og\/[a-z0-9-]+\.png$/.test(image.slice(origin.length)) && image.startsWith(`${origin}/`) && existsSync(join(output, image.slice(origin.length)))), `${file}: ${name} must be a local generated social image`);
    }
    const robots = attr(one(meta('robots'), 'robots'), 'content')!;
    const indexable = !robots.split(/[,\s]+/).includes('noindex');
    if (!production || file === '404.html') assert.equal(indexable, false, `${file}: must not be indexed`);
    const json = tags('script').filter(node => attr(node, 'type') === 'application/ld+json').map(node => JSON.parse(text(node)) as Record<string, unknown>);
    assert.ok(json.length, `${file}: missing structured data`);
    const graph = json.flatMap(node => Array.isArray(node['@graph']) ? node['@graph'] as Record<string, unknown>[] : [node]);
    const page = graph.find(node => ['WebPage', 'CollectionPage', 'AboutPage'].includes(String(node['@type'])));
    assert.equal(page?.url, canonical, `${file}: structured page URL`);
    assert.equal(page?.name, title, `${file}: structured title`);
    assert.equal(page?.description, description, `${file}: structured description`);
    assert.equal(graph.filter(node => node['@type'] === 'WebSite').length, route === '/' ? 1 : 0, `${file}: WebSite belongs on home`);
    if (route === '/') {
      const website = graph.find(node => node['@type'] === 'WebSite')!;
      assert.equal(website.url, `${origin}/`); assert.equal(website.name, 'Who Goes First?');
    }
    if (/^\/games\/.+\/$/.test(route)) {
      const breadcrumb = graph.find(node => node['@type'] === 'BreadcrumbList');
      const items = breadcrumb?.itemListElement as { position: number; item: string; name: string }[];
      assert.equal(items?.length, 3, `${file}: rule breadcrumbs required`);
      items.forEach((item, index) => { assert.equal(item.position, index + 1); assert.ok(item.name); assert.ok(item.item.startsWith(origin + '/')); });
      assert.equal(items.at(-1)?.item, canonical);
    }
    // Keep only the fields needed for cross-page checks. Retaining every parsed
    // DOM makes the audit's memory grow with the full board-game directory.
    const links = tags('a').map(node => ({ href: attr(node, 'href'), label: text(node).trim(), ariaLabel: attr(node, 'aria-label') }));
    const ids = new Set(nodes.map(node => attr(node, 'id')).filter((id): id is string => Boolean(id)));
    return { file, links, ids, canonical, title, description, indexable };
  });
  assert.equal(new Set(pages.map(page => page.title)).size, pages.length, 'Duplicate page titles');
  assert.equal(new Set(pages.map(page => page.description)).size, pages.length, 'Duplicate meta descriptions');
  const pagesByCanonical = new Map(pages.map(page => [page.canonical, page]));
  let links = 0;
  for (const page of pages) for (const anchor of page.links) {
    const href = anchor.href;
    assert.ok(href && !/^javascript:/i.test(href), `${page.file}: non-crawlable link`);
    assert.ok(anchor.label || anchor.ariaLabel, `${page.file}: unnamed link`);
    const url = new URL(href, page.canonical);
    if (url.origin !== origin) continue;
    links++;
    const target = resolve(output, `.${decodeURIComponent(url.pathname)}`);
    assert.ok(target.startsWith(resolve(output) + sep) || target === resolve(output), 'Link outside output');
    const targetFile = existsSync(target) && statSync(target).isDirectory() ? join(target, 'index.html') : target;
    assert.ok(existsSync(targetFile), `${page.file}: broken internal link ${href}`);
    if (url.hash) {
      const targetIds = pagesByCanonical.get(`${url.origin}${url.pathname}`)?.ids;
      assert.ok(targetIds?.has(decodeURIComponent(url.hash.slice(1))), `${page.file}: broken fragment ${href}`);
    }
  }
  const sitemap = readFileSync(join(output, 'sitemap.xml'), 'utf8');
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]!);
  const expected = production ? pages.filter(page => page.indexable).map(page => page.canonical) : [];
  assert.deepEqual(locations.toSorted(), expected.toSorted(), 'Sitemap must contain exactly the indexable canonical pages');
  assert.equal(locations.length, new Set(locations).size, 'Duplicate sitemap entries');
  console.log(`SEO artifact audit passed: ${pages.length} pages, ${links} internal links, exact canonicals, unique metadata, structured data, and sitemap parity.`);
}
