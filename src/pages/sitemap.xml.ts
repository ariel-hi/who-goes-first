import { getCatalog, getPrompts } from '../lib/content/catalog';
import { getBoardGames } from '../lib/content/board-games';
import { getBrowseShelves, shelfHref } from '../lib/content/board-game-browse';
import { publisherHubs, themeHubs } from '../lib/content/hubs';
import { randomRuleEligible } from '../lib/content/random-rules';
import { siteSettings } from '../lib/site';
export function GET() {
  const settings = siteSettings(); const games = getCatalog(); const boardGames = getBoardGames();
  const publishers = publisherHubs(games);
  const hubs = [...themeHubs(games).map(hub => `/games/themes/${hub.slug}/`), ...(publishers.length ? ['/publishers/'] : []), ...publishers.map(hub => `/publishers/${hub.slug}/`), ...(games.some(randomRuleEligible) ? ['/ways-to-pick-who-goes-first/'] : [])];
  const routes = ['/', '/about/', '/fairness/', '/privacy/', '/choose-who-goes-first/', '/printable-game-night/', '/board-games/', '/methods/spinner/', '/methods/cards/', '/methods/towers/', '/methods/straws/', '/methods/dice/', '/methods/coin/', '/methods/shells/', ...(process.env.DISABLE_BALLOON !== 'true' ? ['/methods/balloon/'] : []), ...(games.length ? ['/games/'] : []), ...(getPrompts().length ? ['/house-rules/'] : []), ...hubs];
  const urls = settings.production ? [...routes.map(path => `<url><loc>${settings.url}${path}</loc></url>`), ...getBrowseShelves().shelves.map(shelf => `<url><loc>${settings.url}${shelfHref(shelf.letter, shelf.page)}</loc></url>`), ...games.map(game => `<url><loc>${settings.url}/games/${game.slug}/</loc><lastmod>${game.materiallyUpdatedAt}</lastmod></url>`), ...boardGames.filter(game => game.rules.length > 1).map(game => `<url><loc>${settings.url}/board-games/${game.bggId}/</loc></url>`)].join('') : '';
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, { headers: { 'Content-Type': 'application/xml' } });
}
