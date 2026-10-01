import type { APIRoute } from 'astro';
import { renderPinImage } from '../../../lib/og-image';
import { pinQueue, type QueuedPin } from '../../../lib/pinterest-pins';
import { siteSettings } from '../../../lib/site';

export function getStaticPaths() { return pinQueue().map(pin => ({ params: { id: pin.id }, props: { pin } })); }
export const GET: APIRoute = async ({ props }) => {
  const pin = props.pin as QueuedPin;
  const png = await renderPinImage(pin.heading, pin.body, pin.footer, new URL(siteSettings().url).host);
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
