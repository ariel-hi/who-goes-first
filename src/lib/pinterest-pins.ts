import { getCatalog } from './content/catalog';
import { clip } from './og-image';
import { ruleHeading } from './rule-copy';

export type QueuedPin = { id: string; path: string; title: string; heading: string; body: string; footer: string; description: string; campaign: string; date: string };

// Drip schedule for the Pinterest RSS feed. Pinterest only creates Pins from
// items it has not seen, so new items must keep appearing. The daily
// pinterest workflow triggers a build so each day's items go live on time.
const START = Date.UTC(2026, 9, 1);
const PER_DAY = 3;
const GAMES = ['catan-2020-en', 'ticket-to-ride-2015-en', 'uno-10020-sn70-en', 'carcassonne-2021-en', 'monopoly-classic-hasbro-c1009-en', 'azul-2018-en', 'codenames-2025-en', 'wingspan-online-en', 'pandemic-2013-en', 'scrabble-hasbro-2021-en', 'exploding-kittens-original-en', 'splendor-2024-en', 'clue-classic-hasbro-en', 'king-of-tokyo-iello-en', 'sushi-go-2014-en', 'risk-hasbro-2015-en', 'dixit-2021-en', '7-wonders-2020-en', 'kingdomino-2016-en', 'qwirkle-mindware-en', 'flip-7-the-op-revised-en', 'cascadia-base-en', 'terraforming-mars-fryxgames-en', 'spot-it-blue-orange-original-en', 'blokus-mattel-bjv44-en', 'love-letter-2025-en', 'uno-flip-mattel-en', 'harmonies-libellud-en-2024', 'the-crew-2019-en', 'patchwork-lookout-mayfair-2014-en', 'forbidden-island-gamewright-en', 'camel-up-lookout-second-en', 'dominion-2021-en', 'root-leder-standard-en', 'heat-pedal-to-the-metal-dow-en', 'skull-space-cowboys-pink-en', 'santorini-roxley-en', 'jaipur-space-cowboys-en', 'hanabi-rnr-en', 'machi-koro-idw-pandasaurus-en', 'sushi-go-party-gamewright-en', 'ark-nova-capstone-en', 'mysterium-libellud-en', 'tsuro-calliope-2020-en', 'hive-gen42-en', 'coup-indie-game-studios-en-dized', '7-wonders-duel-repos-en', 'splendor-duel-space-cowboys-en', 'codenames-duet-cge-refreshed-en', 'brass-birmingham-roxley-en', 'spirit-island-gtg-en', 'lost-cities-card-game-kosmos-2018-en', 'agricola-revised-edition-lookout-en', '6-nimmt-amigo-2024-en', 'gloomhaven-cephalofair-original-en', 'pandemic-legacy-season-1-zman-en', 'game-of-life-hasbro-e4304-en', 'spades-bicycle-en', 'sorry-hasbro-00390-en', 'hearts-bicycle-en', 'go-fish-bicycle-en', 'euchre-bicycle-en', 'monopoly-junior-hasbro-1990-en', 'cribbage-bicycle-en', 'crazy-eights-bicycle-en', 'canasta-bicycle-en', 'gin-rummy-bicycle-en', 'old-maid-bicycle-en', 'candy-land-winning-moves-2023-en', 'chutes-and-ladders-winning-moves-2023-en', 'trouble-winning-moves-2022-en', 'checkers-acf-official-en', 'parcheesi-winning-moves-2023-en', 'hi-ho-cherry-o-winning-moves-2020-en', 'five-crowns-playmonster-2019-en', 'pass-the-pigs-winning-moves-en', 'connect-4-hasbro-a5640-en', 'jenga-milton-bradley-04793-en', 'phase-10-mattel-ffy05-en', 'skip-bo-mattel-42050-en', 'stratego-milton-bradley-4714-en', 'mancala-parker-brothers-41080-en', 'rummy-bicycle-en', 'upwords-milton-bradley-4312-en'];
const TOOLS = [
  { id: 'finger-chooser', path: '/finger-chooser/', heading: 'Finger chooser: everyone touch the screen', body: 'Each player puts a finger on the phone. A spotlight closes in and picks who goes first. Free, no app needed.', campaign: 'tool_finger_chooser' },
  { id: 'coin-flip', path: '/coin-flip/', heading: 'Flip a coin to see who goes first', body: 'A fair online coin flip for two players or two teams. Free, instant, and works on any phone.', campaign: 'tool_coin_flip' },
  { id: 'random-teams', path: '/random-team-generator/', heading: 'Split game night into random teams', body: 'Type the names, pick the number of teams, and get fair random teams in one tap. Free, no account.', campaign: 'tool_random_teams' },
  { id: 'rock-paper-scissors', path: '/rock-paper-scissors/', heading: 'Rock, paper, scissors for who goes first', body: 'Settle the first turn with a quick round on screen. Simple, fair and fun for kids and adults.', campaign: 'tool_rps' },
  { id: 'ways-to-pick', path: '/ways-to-pick-who-goes-first/', heading: 'Fun ways to pick who goes first', body: 'Playful, fair ways to decide the first turn in any board game, from house rules to quick random draws.', campaign: 'ways_to_pick' },
  { id: 'dice-roller', path: '/dice-roller/', heading: 'Lost the dice? Roll them online', body: 'Roll up to 12 virtual dice, from d4 to d20 and d100, with the total added up. Free and fair on any phone.', campaign: 'tool_dice_roller' },
  { id: 'turn-order', path: '/turn-order-generator/', heading: 'Random turn order for game night', body: 'Type everyone’s name and shuffle them into a fair playing order in one tap. Free, no account.', campaign: 'tool_turn_order' },
  { id: 'random-number', path: '/random-number-generator/', heading: 'Pick a random number, any range', body: 'A fair random number from 1 to 10, 1 to 100 or any range you like. Great for picking a player or seat.', campaign: 'tool_random_number' },
  { id: 'score-keeper', path: '/score-keeper/', heading: 'Lost the score pad? Keep score online', body: 'A free scoreboard for board and card games. Add players, tap to score, and see who is winning.', campaign: 'tool_score_keeper' },
  { id: 'turn-timer', path: '/turn-timer/', heading: 'Lost the sand timer? Use a turn timer', body: 'A free countdown for board and party games, from 30 seconds to 3 minutes. Tap to restart for the next player.', campaign: 'tool_turn_timer' },
  { id: 'printable', path:'/printable-game-night/', heading: 'Printable game night kit', body: 'Print free who-goes-first extras and keep them in the game box for your next game night.', campaign: 'printable' },
];

let cache: QueuedPin[] | undefined;
export function pinQueue(): QueuedPin[] {
  if (cache) return cache;
  const bySlug = new Map(getCatalog().map(rule => [rule.slug, rule]));
  const games = GAMES.flatMap(slug => {
    const rule = bySlug.get(slug);
    if (!rule) return [];
    const heading = ruleHeading(rule.gameName);
    return [{ id: `game-${slug}`, path: `/games/${slug}/`, title: `${heading} Official Starting Player Rule`, heading, body: rule.firstPlayerRule, footer: 'From the publisher’s rulebook', description: clip(`${rule.firstPlayerRule} The official ${rule.gameName} rule (${rule.editionLabel}), with its rulebook source and a fair picker for ties.`, 480), campaign: 'game_rule_pin' }];
  });
  const tools = TOOLS.map(tool => ({ ...tool, id: `tool-${tool.id}`, title: tool.heading, footer: 'Free game night tool', description: tool.body }));
  // One tool after every five games keeps the board varied.
  const ordered: Omit<QueuedPin, 'date'>[] = [];
  games.forEach((pin, index) => { ordered.push(pin); if (index % 5 === 4 && tools.length) ordered.push(tools.shift()!); });
  ordered.push(...tools);
  return cache = ordered.map((pin, index) => ({ ...pin, date: new Date(START + Math.floor(index / PER_DAY) * 86_400_000).toISOString().slice(0, 10) }));
}

export const releasedPins = (now = new Date()) => pinQueue().filter(pin => pin.date <= now.toISOString().slice(0, 10));
