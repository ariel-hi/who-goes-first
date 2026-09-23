import { getCatalog, getPrompts } from '../lib/content/catalog';
import { siteSettings } from '../lib/site';
export function GET() {
  const settings = siteSettings(); const games = getCatalog();
  const routes = ['/', '/about/', '/fairness/', '/privacy/', '/methods/spinner/', '/methods/cards/', '/methods/towers/', '/methods/straws/', '/methods/dice/', '/methods/race/', ...(process.env.DISABLE_BALLOON !== 'true' ? ['/methods/balloon/'] : []), ...(games.length ? ['/games/'] : []), ...(getPrompts().length ? ['/house-rules/'] : [])];
  const urls = settings.production ? [...routes.map(path => `<url><loc>${settings.url}${path}</loc></url>`), ...games.map(game => `<url><loc>${settings.url}/games/${game.slug}/</loc><lastmod>${game.materiallyUpdatedAt}</lastmod></url>`)].join('') : '';
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, { headers: { 'Content-Type': 'application/xml' } });
}
