import type { PublicRule } from '../../src/lib/content/schema';
import { postText, ruleForDay } from './social';

export type SocialCampaign = { id: string; kind: 'rule' | 'tool' | 'guide'; path: string; image: string; title: string; description: string; text: string };
export const publicationDay = (date: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);

/** A stable daily slot encoded as the TID required by app.bsky.feed.post. */
export function publicationKey(date: Date): string {
  const alphabet = '234567abcdefghijklmnopqrstuvwxyz';
  let bits = (BigInt(Date.parse(`${publicationDay(date)}T15:17:00Z`)) * 1000n << 10n) | 777n;
  let result = '';
  for (let index = 0; index < 13; index++) { result = alphabet[Number(bits & 31n)] + result; bits >>= 5n; }
  return result;
}
const tools: SocialCampaign[] = [
  { id: 'dice', kind: 'tool', path: '/dice-roller/', image: '/og/tool-dice-roller.png', title: 'Free dice roller for game night', description: 'Roll up to 12 dice, from d4 to d100, with the total added up.', text: 'A missing die should not end game night. This free browser dice roller handles d4 through d100, rolls several at once, and adds the total. Handy to bookmark before someone loses a d6 under the sofa.' },
  { id: 'scores', kind: 'tool', path: '/score-keeper/', image: '/og/tool-score-keeper.png', title: 'Free board game score keeper', description: 'Add players and keep the score at your table.', text: 'The game is ready. The score pad is nowhere to be found. Here is a free score keeper for board and card games: add the players and tap to update their scores. No account needed.' },
  { id: 'teams', kind: 'tool', path: '/random-team-generator/', image: '/og/tool-random-team-generator.png', title: 'Random teams for game night', description: 'Split players into random teams in your browser.', text: 'Game night with teams: put everyone’s name in once, choose the number of teams, and shuffle. A free browser tool for the moment nobody wants to be the one choosing sides.' },
  { id: 'letter', kind: 'tool', path: '/random-letter-generator/', image: '/og/tool-random-letter-generator.png', title: 'Random letter generator', description: 'Draw letters for word games, with optional exclusions and no repeats.', text: 'Lost the letter die for a word game? Draw a random letter in your browser, skip the tricky letters if your table wants, and avoid repeats. Useful for a last-minute round of Scattergories.' },
  { id: 'timer', kind: 'tool', path: '/turn-timer/', image: '/og/tool-turn-timer.png', title: 'Free game-night turn timer', description: 'Restart a countdown for the next player with a tap.', text: 'Some tables enjoy a long think. Others want the next turn before midnight. If your group agrees on a time limit, this free turn timer gives everyone the same countdown and restarts with a tap.' },
];
const guides: SocialCampaign[] = [
  { id: 'checklist', kind: 'guide', path: '/game-night-checklist/', image: '/og/game-night-checklist.png', title: 'Free printable game night checklist', description: 'Ten checks for planning, setting up, playing and packing away.', text: 'Hosting game night this weekend? Check the player counts, learn the setup, clear enough table space, and decide who starts. We put the small things in a free checklist you can print or use on your phone.' },
  { id: 'table-cards', kind: 'guide', path: '/printable-game-night/', image: '/social.png', title: 'Printable game-night table cards', description: 'Free QR cards linking your table to a first-player picker.', text: 'A little extra for the game box: free printable table cards with a QR code to a first-player picker. Scan at the table when the group wants a random start. No app or account needed.' },
  { id: 'house-questions', kind: 'guide', path: '/house-rules/', image: '/social.png', title: 'Playful questions to choose who starts', description: 'Original house prompts for a playful first turn.', text: 'When your table wants a playful way to choose who starts, try a house-rule question. Our original prompts are separate from official game rules, and there is a random picker for ties.' },
];
const tagged = (campaign: SocialCampaign | undefined) => campaign ? { ...campaign, text: `${campaign.text}\n\n#BoardGames #GameNight` } : undefined;

/** Bluesky facets use UTF-8 byte offsets, including any preceding emoji. */
export function hashtagFacets(text: string) {
  return [...text.matchAll(/#(?:BoardGames|GameNight)\b/g)].map(match => ({
    index: { byteStart: Buffer.byteLength(text.slice(0, match.index)), byteEnd: Buffer.byteLength(text.slice(0, match.index + match[0].length)) },
    features: [{ $type: 'app.bsky.richtext.facet#tag', tag: match[0].slice(1) }],
  }));
}

/** Three sourced rules, three practical tools and a Friday hosting idea per week. */
export function campaignForDay(rules: PublicRule[], date: Date): SocialCampaign | undefined {
  if (!Number.isFinite(date.getTime())) throw new Error('A valid campaign date is required.');
  const calendar = new Date(`${publicationDay(date)}T12:00:00Z`);
  const day = Math.floor(calendar.getTime() / 86_400_000);
  if (!Number.isFinite(day)) throw new Error('A valid campaign date is required.');
  const week = Math.floor(day / 7);
  const weekday = calendar.getUTCDay();
  if (weekday === 5) return tagged(guides[((week % guides.length) + guides.length) % guides.length]);
  if ([0, 2, 4].includes(weekday)) {
    const slot = [0, 2, 4].indexOf(weekday);
    return tagged(tools[((week * 3 + slot) % tools.length + tools.length) % tools.length]);
  }
  const rule = ruleForDay(rules, calendar);
  if (!rule) return undefined;
  return tagged({ id: `rule-${rule.slug}`, kind: 'rule', path: `/games/${rule.slug}/`, image: `/og/${rule.slug}.png`, title: `Who goes first in ${rule.gameName}?`, description: `${rule.firstPlayerRule} Edition: ${rule.editionLabel}.`, text: postText(rule, 270, ' Source and edition below.') });
}

/** Replies and another site's links do not consume the daily site-post slot. */
export function isSitePostOnDay(value: { createdAt?: string; text?: string; reply?: unknown; facets?: { features?: { uri?: string }[] }[]; embed?: { external?: { uri?: string } } }, date: Date, origin: string): boolean {
  if (value.reply || !value.createdAt || !Number.isFinite(Date.parse(value.createdAt)) || publicationDay(new Date(value.createdAt)) !== publicationDay(date)) return false;
  const links = [value.embed?.external?.uri, ...(value.facets ?? []).flatMap(facet => (facet.features ?? []).map(feature => feature.uri))];
  // Some manual posts use a visible bare domain instead of a preview card.
  const visibleLinks = value.text?.match(/(?:https?:\/\/)?(?:[a-z\d-]+\.)+[a-z]{2,}(?:\/[^\s]*)?/giu) ?? [];
  return [...links, ...visibleLinks].some(link => {
    if (!link) return false;
    try { return new URL(/^https?:\/\//i.test(link) ? link : `https://${link}`).origin === origin; }
    catch { return false; }
  });
}
