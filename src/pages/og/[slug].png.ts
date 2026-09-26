import type { APIRoute } from 'astro';
import { getCatalog } from '../../lib/content/catalog';
import { renderRuleImage } from '../../lib/og-image';
import { siteSettings } from '../../lib/site';
import type { PublicRule } from '../../lib/content/schema';
export function getStaticPaths() { return getCatalog().map(rule => ({ params: { slug: rule.slug }, props: { rule } })); }
export const GET: APIRoute = async ({ props, params }) => {
  const rule = (props.rule as PublicRule | undefined) ?? getCatalog().find(game => game.slug === params.slug);
  if (!rule) return new Response('Not found', { status: 404 });
  const png = await renderRuleImage(rule.gameName, rule.firstPlayerRule, new URL(siteSettings().url).host);
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
