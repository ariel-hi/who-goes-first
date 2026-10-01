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
    `- [Dice roller](${url}/dice-roller/): d4 to d100, up to 12 dice`,
    `- [Turn order generator](${url}/turn-order-generator/): shuffle players into a random playing order`,
    `- [Score keeper](${url}/score-keeper/): free scoreboard for any game`,
    `- [Turn timer](${url}/turn-timer/): countdown sand timer for turns`,
    `- [Random letter generator](${url}/random-letter-generator/): letters for Scattergories and word games`,
    `- [Draw a card](${url}/card-draw/): random cards from a shuffled 52-card deck`,
    `- [Random number generator](${url}/random-number-generator/)`,
    `- [Ways to pick who goes first](${url}/ways-to-pick-who-goes-first/): starting rules from real rulebooks that work for any game`,
    '',
    '## Who goes first in each game',
    ...rules.map(rule => `- [${rule.gameName} (${rule.editionLabel})](${url}/games/${rule.slug}/): ${rule.firstPlayerRule.replace(/\s+/g, ' ')}`),
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
