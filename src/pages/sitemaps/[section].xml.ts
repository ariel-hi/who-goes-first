import type { GetStaticPaths } from 'astro';
import { sitemapEntries, sitemapSections, urlset, type SitemapSection } from '../../lib/sitemap';
export const getStaticPaths: GetStaticPaths = () => sitemapSections.map(section => ({ params: { section } }));
export function GET({ params }: { params: { section: SitemapSection } }) { return urlset(sitemapEntries()[params.section]); }
