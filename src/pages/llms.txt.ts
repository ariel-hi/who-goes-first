import { getCatalog } from '../lib/content/catalog';
import { siteSettings } from '../lib/site';
// A plain-text map for AI answer engines (llmstxt.org): what the site answers and where.
export function GET() {
  const { url } = siteSettings();
  const rules = [...getCatalog()].sort((a, b) => a.gameName.localeCompare(b.gameName));
  const lines = [
    '# Who Goes First?',
    '',
    '> Free, fair first-player picker for board games, plus official starting-player rules for ' + rules.length + ' games. Each rule names its edition and links to the publisher rulebook it comes from.',
    '',
    '## Tools',
    `- [First-player picker](${url}/): equal-chance random pick for 2–50 players`,
    `- [Finger chooser](${url}/finger-chooser/): everyone touches the phone; one finger is picked`,
    `- [Coin flip](${url}/coin-flip/)`,
    `- [Random team generator](${url}/random-team-generator/)`,
    `- [Rock paper scissors](${url}/rock-paper-scissors/)`,
    `- [Ways to pick who goes first](${url}/ways-to-pick-who-goes-first/): starting rules from real rulebooks that work for any game`,
    '',
    '## Who goes first in each game',
    ...rules.map(rule => `- [${rule.gameName} (${rule.editionLabel})](${url}/games/${rule.slug}/): ${rule.firstPlayerRule.replace(/\s+/g, ' ')}`),
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
