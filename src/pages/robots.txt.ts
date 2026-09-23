import { siteSettings } from '../lib/site';
export function GET() {
  const site = siteSettings();
  return new Response(`User-agent: *\nAllow: /\n${site.production ? `Sitemap: ${site.url}/sitemap.xml\n` : '# Preview: page-level noindex; crawling allowed so it can be read.\n'}`, { headers: { 'Content-Type': 'text/plain' } });
}
