import { getCatalog, getPrompts } from './content/catalog';
import { getBoardGames } from './content/board-games';
import { publisherHubs, themeHubs } from './content/hubs';
import { randomRuleEligible } from './content/random-rules';
import { siteSettings } from './site';

type Entry = { path: string; lastmod?: string };
export type SitemapSection = 'pages' | 'rules' | 'board-games' | 'hubs';
export const sitemapSections: SitemapSection[] = ['pages', 'rules', 'board-games', 'hubs'];

/** Canonical URLs grouped by section. One source for the flat sitemap, the index and each section file. */
export function sitemapEntries(): Record<SitemapSection, Entry[]> {
  const games = getCatalog(); const publishers = publisherHubs(games);
  const pages = ['/', '/about/', '/fairness/', '/privacy/', '/tools/', '/choose-who-goes-first/', '/printable-game-night/', '/finger-chooser/', '/coin-flip/', '/random-team-generator/', '/rock-paper-scissors/', '/dice-roller/', '/random-number-generator/', '/turn-order-generator/', '/embed/', '/methods/spinner/', '/methods/cards/', '/methods/towers/', '/methods/straws/', '/methods/dice/', '/methods/coin/', '/methods/shells/', ...(process.env.DISABLE_BALLOON !== 'true' ? ['/methods/balloon/'] : []), ...(getPrompts().length ? ['/house-rules/'] : [])];
  const hubs = [...(games.length ? ['/games/'] : []), ...themeHubs(games).map(hub => `/games/themes/${hub.slug}/`), ...(publishers.length ? ['/publishers/'] : []), ...publishers.map(hub => `/publishers/${hub.slug}/`), ...(games.some(randomRuleEligible) ? ['/ways-to-pick-who-goes-first/'] : [])];
  return {
    pages: pages.map(path => ({ path })),
    rules: games.map(game => ({ path: `/games/${game.slug}/`, lastmod: game.materiallyUpdatedAt ?? undefined })),
    'board-games': ['/board-games/', ...getBoardGames().filter(game => game.rules.length > 1).map(game => `/board-games/${game.routeKey}/`)].map(path => ({ path })),
    hubs: hubs.map(path => ({ path })),
  };
}

const xml = (body: string) => new Response(`<?xml version="1.0" encoding="UTF-8"?>${body}`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
export function urlset(entries: Entry[]): Response {
  const settings = siteSettings();
  const urls = settings.production ? entries.map(entry => `<url><loc>${settings.url}${entry.path}</loc>${entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : ''}</url>`).join('') : '';
  return xml(`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
}
export function sitemapIndex(): Response {
  const settings = siteSettings(); const entries = sitemapEntries();
  const items = settings.production ? sitemapSections.map(section => {
    const dates = entries[section].map(entry => entry.lastmod).filter(Boolean).sort();
    return `<sitemap><loc>${settings.url}/sitemaps/${section}.xml</loc>${dates.length ? `<lastmod>${dates.at(-1)}</lastmod>` : ''}</sitemap>`;
  }).join('') : '';
  return xml(`<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${items}</sitemapindex>`);
}
