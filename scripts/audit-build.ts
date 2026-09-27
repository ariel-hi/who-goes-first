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
  if (!/\.(html|js|css|json|xml|txt|svg|webmanifest)$/.test(file)) continue;
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
let largestRulePayload = 0;
for (const path of files.filter(path => /[\\/]games[\\/].+[\\/]index.html$/.test(path))) {
  const html = readFileSync(path, 'utf8');
  if (/astro-island|component-url|BalloonRise/.test(html)) throw new Error('Static answer eagerly loads picker');
  // Keep the same conservative 350 KiB allowance when licensed art is added.
  // Inline SVG is already included in compressed HTML; count each local image once.
  const images = new Set([...html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)].map(match => match[1]!));
  let imageBytes = 0;
  for (const image of images) {
    if (!image.startsWith('/') || image.startsWith('//')) throw new Error(`Rule artwork must be local: ${image}`);
    const bytes = readFileSync(join(output, image));
    imageBytes += image.endsWith('.svg') ? gzipSync(bytes).length : bytes.length;
  }
  const payload = initialJs + css + gzipSync(html).length + imageBytes + statSync(join(output, 'favicon.svg')).size;
  if (payload > 350 * 1024) throw new Error(`Rule page exceeds 350 KiB: ${path} (${payload} B)`);
  largestRulePayload = Math.max(largestRulePayload, payload);
}
console.log(`Largest conservative rule-page payload: ${largestRulePayload} B (350 KiB limit).`);
const ads = settings.adsenseRuleSlot ? settings.adsenseClient : '';
if (ads) {
  const adFree = files.filter(path => /^(index\.html|404\.html|methods\/[^/]+\/index\.html)$/.test(relative(output, path).replaceAll('\\', '/')));
  for (const path of adFree) if (!readFileSync(path, 'utf8').includes('data-ads="off"')) throw new Error(`Picker or error page would load ads: ${relative(output, path)}`);
}
for (const file of files.filter(path => path.endsWith('.html'))) {
  const html = readFileSync(file, 'utf8');
  const route = relative(output, file).replaceAll('\\', '/');
  const units = [...html.matchAll(/<ins\b[^>]*data-ad-slot=/g)].length;
  if (units && (!ads || units !== 1 || !/^games\/[^/]+\/index\.html$/.test(route))) throw new Error(`Unexpected ad unit: ${route}`);
  if (units && html.indexOf('class="rule-ad"') < html.indexOf('class="source-actions"')) throw new Error(`Ad precedes the answer source: ${route}`);
  if (!ads && /src="\/google-tags\.js"/.test(html)) throw new Error(`Ad loader enabled without an explicit rule slot: ${route}`);
  if (/^board-games\/browse\//.test(route) && !html.includes('content="noindex, follow"')) throw new Error(`Indexable directory shelf: ${route}`);
}
const googleSources = settings.production ? ' https://www.googletagmanager.com https://*.google-analytics.com' : '';
// AdSense, its consent message, and ad frames load from many Google hosts and
// report to ad-tech partners, so ads mode allows HTTPS images/beacons broadly.
// Scripts and frames stay limited to Google's ad and consent hosts.
const adScripts = ads ? ' https://pagead2.googlesyndication.com https://*.googlesyndication.com https://fundingchoicesmessages.google.com https://*.adtrafficquality.google https://www.googletagservices.com https://*.doubleclick.net https://www.google.com https://*.gstatic.com' : '';
const adFrames = ads ? '; frame-src https://*.googlesyndication.com https://*.doubleclick.net https://www.google.com https://*.google.com https://fundingchoicesmessages.google.com https://*.adtrafficquality.google' : '';
const csp = ads
  ? `default-src 'none'; manifest-src 'self'; script-src 'self' ${[...hashes].join(' ')} https://www.googletagmanager.com${adScripts}; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https:${adFrames}; base-uri 'none'; object-src 'none'; form-action 'none'; frame-ancestors 'none'`
  : `default-src 'none'; manifest-src 'self'; script-src 'self' ${[...hashes].join(' ')}${settings.production ? ' https://www.googletagmanager.com' : ''}; style-src 'self' 'unsafe-inline'; img-src 'self' data:${googleSources}; font-src 'self'; connect-src 'self'${googleSources}; base-uri 'none'; object-src 'none'; form-action 'none'; frame-ancestors 'none'`;
if (`  Content-Security-Policy: ${csp}`.length > 2000) throw new Error('CSP exceeds Cloudflare Pages header line limit; split policies by route before expanding the catalog.');
if (settings.adsenseClient) writeFileSync(join(output, 'ads.txt'), `google.com, ${settings.adsenseClient.slice(3)}, DIRECT, f08c47fec0942fa0\n`);
// Bind automated notifications to the actual apex deployment, not a preview
// check sharing the same Git commit. Cloudflare supplies this public commit ID.
const releaseCommit = process.env.CF_PAGES_COMMIT_SHA;
if (settings.production && releaseCommit) {
  if (!/^[a-f0-9]{40}$/i.test(releaseCommit)) throw new Error('Invalid Cloudflare release commit');
  writeFileSync(join(output, 'release.json'), `${JSON.stringify({ commit: releaseCommit })}\n`);
}
writeFileSync(join(output, '_headers'), `/*\n  Content-Security-Policy: ${csp}\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: ${ads ? 'strict-origin-when-cross-origin' : 'no-referrer'}\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n${settings.production ? '  Strict-Transport-Security: max-age=31536000\n' : ''}${!settings.production ? '  X-Robots-Tag: noindex, follow\n' : ''}\n/site.webmanifest\n  Content-Type: application/manifest+json\n  X-Robots-Tag: noindex\n\n/indexnow-key.txt\n  X-Robots-Tag: noindex\n\n/release.json\n  X-Robots-Tag: noindex\n\n/sitemap.xml\n  Content-Type: application/xml; charset=utf-8\n\n/sitemap-index.xml\n  Content-Type: application/xml; charset=utf-8\n\n/sitemaps/*\n  Content-Type: application/xml; charset=utf-8\n\n/rss.xml\n  Content-Type: application/rss+xml; charset=utf-8\n\n/downloads/who-goes-first-game-night-cards.pdf\n  Link: <${settings.url}/printable-game-night/>; rel="canonical"\n\n/_astro/*\n  Cache-Control: public, max-age=31536000, immutable\n\n/rule-index.json\n  Cache-Control: public, max-age=300, must-revalidate\n\n/board-games/search.json\n  Cache-Control: public, max-age=300, must-revalidate\n`);
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
if (searchEntries.length !== browse.games.length || searchIds.size !== browse.games.length || browse.games.some(game => !searchIds.has(game.routeKey))) throw new Error('Search index must include every board-game identity exactly once');
const shelvesById = new Map(browse.shelves.flatMap(shelf => shelf.games.map(game => [game.routeKey, shelfHref(shelf.letter, shelf.page)] as const)));
const gamesById = new Map(browse.games.map(game => [game.routeKey, game]));
const originalIds = (JSON.parse(readFileSync('research/coverage/discovery-index.json', 'utf8')) as { games: { bggId: string }[] }).games.map(game => game.bggId);
const redirects = originalIds.flatMap(id => {
  const game = gamesById.get(id)!;
  if (game.rules.length > 1) return [];
  return [`/board-games/${id}/ ${game.rules.length ? boardGameHref(game) : shelvesById.get(id)!} 301`];
});
if (redirects.length > 2_000) throw new Error('Legacy board-game redirects exceed the Cloudflare Pages static redirect limit');
writeFileSync(join(output, '_redirects'), `${redirects.join('\n')}\n`);
console.log(`Build audit passed (${settings.production ? 'production' : 'preview'}): private-content exclusion, canonicals, indexing, headers, static answer isolation.\nConservative gzip budgets: initial JS ${initialJs} B; Balloon ${optionalJs} B; basic home ${aboveFold} B.`);
