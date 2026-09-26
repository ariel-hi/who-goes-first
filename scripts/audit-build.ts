import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { siteSettings } from '../src/lib/site';
import { readRecords } from '../src/lib/content/catalog';
import { ruleSchema, promptSchema } from '../src/lib/content/schema';
import { auditSeo } from './lib/audit-seo';
import { editorialGuard } from './lib/audit-editorial';
import { boardGameHref, getBrowseShelves, shelfHref } from '../src/lib/content/board-game-browse';
const output = process.env.BUILD_OUT_DIR || 'dist';
const settings = siteSettings();
function walk(dir: string): string[] { return readdirSync(dir).flatMap(name => { const path = join(dir, name); return statSync(path).isDirectory() ? walk(path) : [path]; }); }
const files = walk(output);
if (files.length + 2 > 20_000) throw new Error(`Build has ${files.length + 2} files; Cloudflare Pages Free supports at most 20,000 files. Keep unverified identities on browse shelves rather than generating one page per game.`);
const checkEditorial = editorialGuard(
  readRecords('src/content/games').map(raw => ruleSchema.parse(raw)),
  readRecords('src/content/prompts').flatMap(raw => Array.isArray(raw) ? raw : [raw]).map(raw => promptSchema.parse(raw)),
  readRecords('research/games').map(raw => ruleSchema.parse(raw)),
  readRecords('research/prompts').map(raw => promptSchema.parse(raw)),
);
const hashes = new Set<string>();
for (const path of files) {
  const file = relative(output, path).replaceAll('\\', '/');
  if (/(^|\/)(research|dev|node_modules)(\/|$)|\.map$/.test(file)) throw new Error(`Private path leaked: ${file}`);
  if (!/\.(html|js|css|json|xml|txt|svg)$/.test(file)) continue;
  const text = readFileSync(path, 'utf8');
  checkEditorial(file, text);
  if (file.endsWith('.html')) {
    if (!text.includes('name="robots"')) throw new Error(`Missing robots meta: ${file}`);
    if (!text.includes(`rel="canonical" href="${settings.url}`)) throw new Error(`Wrong canonical: ${file}`);
    if (!settings.production && !text.includes('content="noindex, follow"')) throw new Error(`Indexable preview: ${file}`);
    // Non-executable JSON-LD is a data block, not inline JavaScript. Hash only
    // executable scripts, so adding editorial pages does not grow this header.
    for (const match of text.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
      if (match[2] && !/\btype=["']application\/ld\+json["']/i.test(match[1]!)) hashes.add(`'sha256-${createHash('sha256').update(match[2]).digest('base64')}'`);
    }
  }
}
const home = readFileSync(join(output, 'index.html'), 'utf8');
auditSeo(output, files, settings.url, settings.production);
if (settings.production && !home.includes('content="index, follow"')) throw new Error('Production home has noindex');
if (readFileSync(join(output, 'sitemap.xml'), 'utf8').includes('/404')) throw new Error('404 in sitemap');
const jsFiles = files.filter(path => path.endsWith('.js'));
const initialJs = jsFiles.filter(path => !/BalloonRise|HousePrompts/.test(path)).reduce((sum, path) => sum + gzipSync(readFileSync(path)).length, 0);
const optionalJs = jsFiles.filter(path => /BalloonRise/.test(path)).reduce((sum, path) => sum + gzipSync(readFileSync(path)).length, 0);
const css = files.filter(path => path.endsWith('.css')).reduce((sum, path) => sum + gzipSync(readFileSync(path)).length, 0);
// Conservative: count every non-Balloon/non-house-rule JS asset, even if another page owns it.
if (initialJs > 120 * 1024) throw new Error(`Initial JS exceeds 120 KiB: ${initialJs}`);
if (optionalJs > 200 * 1024) throw new Error(`Balloon exceeds 200 KiB: ${optionalJs}`);
const aboveFold = initialJs + css + gzipSync(home).length + statSync(join(output, 'favicon.svg')).size;
if (aboveFold > 350 * 1024) throw new Error(`Home exceeds 350 KiB: ${aboveFold}`);
for (const path of files.filter(path => /[\\/]games[\\/].+[\\/]index.html$/.test(path))) {
  const html = readFileSync(path, 'utf8');
  if (/astro-island|component-url|BalloonRise/.test(html)) throw new Error('Static answer eagerly loads picker');
}
const googleSources = settings.production ? ' https://www.googletagmanager.com https://*.google-analytics.com' : '';
const csp = `default-src 'none'; script-src 'self' ${[...hashes].join(' ')}${settings.production ? ' https://www.googletagmanager.com' : ''}; style-src 'self' 'unsafe-inline'; img-src 'self' data:${googleSources}; font-src 'self'; connect-src 'self'${googleSources}; base-uri 'none'; object-src 'none'; form-action 'none'; frame-ancestors 'none'`;
if (`  Content-Security-Policy: ${csp}`.length > 2000) throw new Error('CSP exceeds Cloudflare Pages header line limit; split policies by route before expanding the catalog.');
writeFileSync(join(output, '_headers'), `/*\n  Content-Security-Policy: ${csp}\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: no-referrer\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n${!settings.production ? '  X-Robots-Tag: noindex, follow\n' : ''}\n/_astro/*\n  Cache-Control: public, max-age=31536000, immutable\n\n/rule-index.json\n  Cache-Control: public, max-age=300, must-revalidate\n\n/board-games/search.json\n  Cache-Control: public, max-age=300, must-revalidate\n`);
// Audit the emitted host policy: public caching is confined to hashed assets
// and these short-lived lookup indexes, never an HTML or private-path wildcard.
const expectedCachePolicies = new Map([
  ['/_astro/*', 'public, max-age=31536000, immutable'],
  ['/rule-index.json', 'public, max-age=300, must-revalidate'],
  ['/board-games/search.json', 'public, max-age=300, must-revalidate'],
]);
const cachedRoutes = new Set<string>();
let headerRoute = '';
for (const line of readFileSync(join(output, '_headers'), 'utf8').split('\n')) {
  if (!line.trim()) continue;
  if (!/^\s/.test(line)) { headerRoute = line.trim(); continue; }
  const header = line.match(/^\s+([^:]+):\s*(.*?)\s*$/);
  if (!header) throw new Error(`Malformed emitted header: ${line}`);
  if (header[1]!.trim().toLowerCase() !== 'cache-control') continue;
  const expected = expectedCachePolicies.get(headerRoute);
  if (!expected) throw new Error(`Public caching must not apply to ${headerRoute || 'an unspecified route'}`);
  if (cachedRoutes.has(headerRoute)) throw new Error(`Duplicate cache policy for ${headerRoute}`);
  if (header[2] !== expected) throw new Error(`Wrong cache policy for ${headerRoute}: ${header[2]}`);
  cachedRoutes.add(headerRoute);
}
for (const route of expectedCachePolicies.keys()) {
  if (!cachedRoutes.has(route)) throw new Error(`Missing cache policy for ${route}`);
}
// Previous builds emitted a thin /board-games/<id>/ page for every original
// identity. Redirect those URLs to the researched answer or the exact browse
// shelf, while retaining only multi-edition chooser pages as HTML assets.
const browse = getBrowseShelves();
const searchEntries = JSON.parse(readFileSync(join(output, 'board-games/search.json'), 'utf8')) as { id: string }[];
const searchIds = new Set(searchEntries.map(game => game.id));
if (searchEntries.length !== browse.games.length || searchIds.size !== browse.games.length || browse.games.some(game => !searchIds.has(game.bggId))) throw new Error('Search index must include every board-game identity exactly once');
const shelvesById = new Map(browse.shelves.flatMap(shelf => shelf.games.map(game => [game.bggId, shelfHref(shelf.letter, shelf.page)] as const)));
const gamesById = new Map(browse.games.map(game => [game.bggId, game]));
const originalIds = (JSON.parse(readFileSync('research/coverage/discovery-index.json', 'utf8')) as { games: { bggId: string }[] }).games.map(game => game.bggId);
const redirects = originalIds.flatMap(id => {
  const game = gamesById.get(id)!;
  if (game.rules.length > 1) return [];
  return [`/board-games/${id}/ ${game.rules.length ? boardGameHref(game) : shelvesById.get(id)!} 301`];
});
if (redirects.length > 2_000) throw new Error('Legacy board-game redirects exceed the Cloudflare Pages static redirect limit');
writeFileSync(join(output, '_redirects'), `${redirects.join('\n')}\n`);
console.log(`Build audit passed (${settings.production ? 'production' : 'preview'}): private-content exclusion, canonicals, indexing, headers, static answer isolation.\nConservative gzip budgets: initial JS ${initialJs} B; Balloon ${optionalJs} B; basic home ${aboveFold} B.`);
