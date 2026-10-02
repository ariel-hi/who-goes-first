import { renderCardImage } from '../../lib/og-image';
import { siteSettings } from '../../lib/site';

export async function GET() {
  const png = await renderCardImage('Your game-night checklist', 'Plan, set up, play and pack away. A free checklist to print or use on your phone, with tools for the table.', 'Free printable checklist + game-night tools', new URL(siteSettings().url).host);
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
}
