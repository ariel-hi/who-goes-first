import { sitemapEntries, sitemapSections, urlset } from '../lib/sitemap';
// The flat sitemap stays for existing submissions and scripts; /sitemap-index.xml splits the same URLs by section.
export function GET() {
  const entries = sitemapEntries();
  return urlset(sitemapSections.flatMap(section => entries[section]));
}
