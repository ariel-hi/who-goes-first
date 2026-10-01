import type { APIRoute } from 'astro';
import { getCatalog } from '../../lib/content/catalog';
import { publisherHubs } from '../../lib/content/hubs';
import { renderCardImage } from '../../lib/og-image';
import { siteSettings } from '../../lib/site';

export function getStaticPaths() { return publisherHubs(getCatalog()).map(hub => ({ params: { slug: hub.slug }, props: { hub } })); }
export const GET: APIRoute = async ({ props }) => {
  const { hub } = props as { hub: ReturnType<typeof publisherHubs>[number] };
  const names = hub.rules.slice(0, 4).map(rule => rule.gameName).join(', ');
  const png = await renderCardImage(`Who goes first in ${hub.name} games?`, `${hub.rules.length} starting rules from the publisher’s rulebooks, including ${names}.`, 'From the publisher’s rulebooks', new URL(siteSettings().url).host);
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
