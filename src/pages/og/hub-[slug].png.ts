import type { APIRoute } from 'astro';
import { getCatalog } from '../../lib/content/catalog';
import { themeHubs } from '../../lib/content/hubs';
import { renderCardImage } from '../../lib/og-image';
import { siteSettings } from '../../lib/site';

export function getStaticPaths() { return themeHubs(getCatalog()).map(hub => ({ params: { slug: hub.slug }, props: { hub } })); }
export const GET: APIRoute = async ({ props }) => {
  const { hub } = props as { hub: ReturnType<typeof themeHubs>[number] };
  const example = hub.rules[0]!;
  const png = await renderCardImage(hub.title, `${hub.rules.length} real starting rules, like ${example.gameName}: ${example.firstPlayerRule}`, 'From published rulebooks', new URL(siteSettings().url).host);
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
