import { getCatalog, getPrompts } from '../lib/content/catalog';
import { siteSettings } from '../lib/site';

const escapeXml = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

export function GET() {
  const site = siteSettings().url;
  // Keep this small and intentional. The full rule catalog is for visitors and
  // search, not hundreds of near-identical auto-published Pins.
  const items = [
    {
      id: 'first-player-picker', path: '/',
      title: 'Who Goes First? Free Random First-Player Picker',
      description: 'Start game night with an equal-chance draw for 2–50 players. Use numbered seats or names. Free, with no account needed.',
      image: '/pins/first-player-picker.png', campaign: 'first_player_picker',
    },
    ...(getCatalog().length ? [{
      id: 'starting-rules', path: '/games/',
      title: 'Who Goes First in Your Board Game? Find the Rule',
      description: 'Search publisher-checked starting-player rules by board game and edition. Each answer links to its source.',
      image: '/pins/starting-rules.png', campaign: 'game_rules',
    }] : []),
    ...(getPrompts().length ? [{
      id: 'fun-questions', path: '/house-rules/',
      title: 'Fun Questions to Decide Who Goes First',
      description: 'Try an original house-rule question for a playful start to game night. Break ties with the fair picker.',
      image: '/pins/fun-questions.png', campaign: 'house_questions',
    }] : []),
  ];
  const entries = items.map(item => {
    const link = `${site}${item.path}?utm_source=pinterest&amp;utm_medium=organic_social&amp;utm_campaign=${item.campaign}`;
    return `<item><title>${escapeXml(item.title)}</title><link>${link}</link><guid isPermaLink="false">wgf:${item.id}:v1</guid><pubDate>Fri, 25 Sep 2026 00:00:00 GMT</pubDate><description>${escapeXml(item.description)}</description><media:content url="${site}${item.image}" type="image/png" medium="image" /></item>`;
  }).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/"><channel><title>Who Goes First? Game Night Ideas</title><link>${site}/</link><description>Selected ways to start your board game night.</description>${entries}</channel></rss>`, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}
