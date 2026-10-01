import type { APIRoute } from 'astro';
import { renderCardImage } from '../../lib/og-image';
import { siteSettings } from '../../lib/site';
import { toolCards } from '../../lib/tool-cards';

export function getStaticPaths() { return Object.keys(toolCards).map(id => ({ params: { id } })); }
export const GET: APIRoute = async ({ params }) => {
  const card = toolCards[params.id!];
  if (!card) return new Response('Not found', { status: 404 });
  const png = await renderCardImage(card.heading, card.body, 'Free game-night tool', new URL(siteSettings().url).host);
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
