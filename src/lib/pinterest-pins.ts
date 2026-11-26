import { getCatalog } from './content/catalog';
import { clip, type PinArt } from './og-image';
import { ruleHeading } from './rule-copy';
import { sceneCampaigns } from './pinterest-scenes';

export type QueuedPin = { id: string; path: string; title: string; heading: string; body: string; art: PinArt; description: string; campaign: string; date: string };

// Drip schedule for the Pinterest RSS feed. Pinterest only creates Pins from
// items it has not seen, so new items must keep appearing. The daily
// pinterest workflow triggers a build so each day's items go live on time.
const START = Date.UTC(2026, 9, 1);
const PER_DAY = 5;
const GAMES = ['catan-2020-en', 'ticket-to-ride-2015-en', 'uno-10020-sn70-en', 'carcassonne-2021-en', 'monopoly-classic-hasbro-c1009-en', 'azul-2018-en', 'codenames-2025-en', 'wingspan-online-en', 'pandemic-2013-en', 'scrabble-hasbro-2021-en', 'exploding-kittens-original-en', 'splendor-2024-en', 'clue-classic-hasbro-en', 'king-of-tokyo-iello-en', 'sushi-go-2014-en', 'risk-hasbro-2015-en', 'dixit-2021-en', '7-wonders-2020-en', 'kingdomino-2016-en', 'qwirkle-mindware-en', 'flip-7-the-op-revised-en', 'cascadia-base-en', 'terraforming-mars-fryxgames-en', 'spot-it-blue-orange-original-en', 'blokus-mattel-bjv44-en', 'love-letter-2025-en', 'uno-flip-mattel-en', 'harmonies-libellud-en-2024', 'the-crew-2019-en', 'patchwork-lookout-mayfair-2014-en', 'forbidden-island-gamewright-en', 'camel-up-lookout-second-en', 'dominion-2021-en', 'root-leder-standard-en', 'heat-pedal-to-the-metal-dow-en', 'skull-space-cowboys-pink-en', 'santorini-roxley-en', 'jaipur-space-cowboys-en', 'hanabi-rnr-en', 'machi-koro-idw-pandasaurus-en', 'sushi-go-party-gamewright-en', 'ark-nova-capstone-en', 'mysterium-libellud-en', 'tsuro-calliope-2020-en', 'hive-gen42-en', 'coup-indie-game-studios-en-dized', '7-wonders-duel-repos-en', 'splendor-duel-space-cowboys-en', 'codenames-duet-cge-refreshed-en', 'brass-birmingham-roxley-en', 'spirit-island-gtg-en', 'lost-cities-card-game-kosmos-2018-en', 'agricola-revised-edition-lookout-en', '6-nimmt-amigo-2024-en', 'gloomhaven-cephalofair-original-en', 'pandemic-legacy-season-1-zman-en', 'game-of-life-hasbro-e4304-en', 'spades-bicycle-en', 'sorry-hasbro-00390-en', 'hearts-bicycle-en', 'go-fish-bicycle-en', 'euchre-bicycle-en', 'monopoly-junior-hasbro-1990-en', 'cribbage-bicycle-en', 'crazy-eights-bicycle-en', 'canasta-bicycle-en', 'gin-rummy-bicycle-en', 'old-maid-bicycle-en', 'candy-land-winning-moves-2023-en', 'chutes-and-ladders-winning-moves-2023-en', 'trouble-winning-moves-2022-en', 'checkers-acf-official-en', 'parcheesi-winning-moves-2023-en', 'hi-ho-cherry-o-winning-moves-2020-en', 'five-crowns-playmonster-2019-en', 'pass-the-pigs-winning-moves-en', 'connect-4-hasbro-a5640-en', 'jenga-milton-bradley-04793-en', 'phase-10-mattel-ffy05-en', 'skip-bo-mattel-42050-en', 'stratego-milton-bradley-4714-en', 'mancala-parker-brothers-41080-en', 'rummy-bicycle-en', 'upwords-milton-bradley-4312-en', 'catan-junior-second-edition-en', 'sleeping-queens-gamewright-original-en', 'crocodile-dentist-milton-bradley-4153-en', 'scotland-yard-milton-bradley-4500-en', 'mexican-train-cardinal-20-domino-en', 'cootie-milton-bradley-4782-en', 'clue-jr-parker-brothers-1994-en', 'uno-show-em-no-mercy-mattel-hwv18-en', 'dominoes-draw-cardinal-en', 'memory-ravensburger-01035-en', 'left-center-right-bicycle-en', 'yeti-in-my-spaghetti-playmonster-en', '5-second-rule-playmonster-en', 'farkle-playmonster-en', 'snails-pace-race-ravensburger-22052-en', 'utter-nonsense-family-playmonster-en'];
// Reviewed additions for the October 16 queue extension. These are explicit
// sourced rules, not an automatic export of the full catalog.
const OCTOBER_RULES = [
  'chess-fide-laws-2023-en',
  'concordia-rio-grande-en',
  'power-grid-recharged-rio-grande-en',
  'scout-one-more-game-en',
  'battleship-hasbro-en',
  'backgammon-usbgf-basics-standard-en',
  'yahtzee-hasbro-en',
  'guess-who-hasbro-en',
  'operation-hasbro-en',
  'rummikub-original-en',
  'labyrinth-ravensburger-en-2017',
  'point-salad-aeg-en',
  'trekking-national-parks-underdog-en-second-edition',
  'bunny-kingdom-iello-2017-en',
  'quacks-of-quedlinburg-schmidt-en',
  'kingdom-builder-queen-en',
  'small-world-days-of-wonder-en',
  'betrayal-at-house-on-the-hill-avalon-hill-2e-en',
  'decrypto-scorpion-masque-en',
  'sea-salt-paper-bombyx-en',
  'no-thanks-amigo-en',
  'colt-express-ludonaute-2016-en',
  'telestrations-the-op-second-en',
  'just-one-repos-refresh-2025-en',
  'wavelength-cmyk-en',
  'clank-direwolf-en-2016',
  'twilight-imperium-fourth-edition-en',
  'star-realms-white-wizard-en',
];
// Small sourced-rule replenishment after the October 30 queue end. These
// destinations already have reviewed edition-specific answers and sources.
const NOVEMBER_RULES = [
  '7-wonders-architects-repos-en',
  'a-feast-for-odin-feuerland-en',
  'aeons-end-indie-original-en',
  'akropolis-gigamic-en',
  'alhambra-queen-revised-en',
  'android-netrunner-ffg-2012-en',
  'architects-of-the-west-kingdom-garphill-2018-en',
  'bohnanza-rio-grande-en',
  'calico',
  'flamecraft-cardboard-alchemy-en',
  'horrified-ravensburger-it-2021',
  'lost-ruins-of-arnak-cge-en',
  'micromacro-crime-city-spielwiese-en',
  'parks-keymaster-en-v12',
  'photosynthesis-blue-orange-en',
  'star-wars-rebellion-ffg-en',
  'isle-of-cats-city-of-games-en',
  'the-quest-for-el-dorado-ravensburger-en-2023',
  'viticulture-essential-stonemaier-en',
  'zoo-vadis-bitewing-2023-en',
];
// Reviewed November follow-up. Append after the first 168 campaigns so the
// release ledger keeps every published ID and date unchanged.
const NOVEMBER_FOLLOWUP_RULES = [
  '7-wonders-repos-original-en',
  'abandon-all-artichokes-gamewright-en',
  'abyss-bombyx-us-en',
  'acquire-renegade-en',
  'agent-avenue-nerdlab-en',
  'aggravation-winning-moves-2023-en',
  'agricola-zman-original-en',
  'alchemists-cge-en',
  'animal-upon-animal-haba-en',
  'ankh-gods-of-egypt-cmon-en',
  'apples-apples-mattel-en',
  'cahoots-gamewright-en',
  'cryptid-osprey-original-en',
  'arcs-leder-base-en',
  'azul-sintra-next-move-en-2024',
  'baerenpark-lookout-en',
  'bang-dice-game-dv-giochi-en',
  'bang-dv-giochi-en',
  'barrage-cranio-original-en',
  'beacon-patrol-pandasaurus-en',
  'bears-vs-babies-exploding-kittens-2023-en',
  'beyond-the-sun-rio-grande-en',
  'blokus-junior-mattel-t8138-en',
  'bomb-busters-cocktail-games-2024-en',
  'brass-lancashire-roxley-en',
  'castle-combo-asmodee-en-2024',
  'cacao-abacus-base-en',
  'camel-up-eggertspiele-original-en',
  'candy-land-hasbro-g1726-2025-en',
  'canopy-weird-city-en',
  'clue-hasbro-2023-en',
  'crokinole-nca-en',
  'cartographers-thunderworks-en',
  'castles-burgundy-alea-original-en',
  'castles-mad-king-ludwig-bezier-second-en',
  'caverna-cave-farmers-lookout-en',
  'century-spice-road-plan-b-big-box-en',
  'citadels-zman-2016-en',
  'cosmic-encounter-ffg-2018-en',
  'dice-forge-libellud-en',
];
const TOOLS = [
  { id: 'silly-contests', path: '/games/themes/silly-contests/', heading: '42 silly ways to decide who goes first', body: 'Hold your breath, make the best monkey sound, or have the stinkiest feet: real starting rules from published games.', campaign: 'hub_silly_contests' },
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
  { id: 'random-letter', path: '/random-letter-generator/', heading: 'Random letter generator for Scattergories', body: 'Lost the letter die? Draw a fair random letter, skip the hard ones, and avoid repeats. Free on any phone.', campaign: 'tool_random_letter' },
  { id: 'printable', path:'/printable-game-night/', heading: 'Printable game night kit', body: 'Print free who-goes-first extras and keep them in the game box for your next game night.', campaign: 'printable' },
];

let cache: QueuedPin[] | undefined;
export function pinQueue(): QueuedPin[] {
  if (cache) return cache;
  const bySlug = new Map(getCatalog().map(rule => [rule.slug, rule]));
  const makeGamePin = (slug: string) => {
    const rule = bySlug.get(slug);
    if (!rule) return null;
    const heading = ruleHeading(rule.gameName);
    // Simultaneous play and other ineligible rules need no first-player draw.
    // Keep their sourced answer, without promising a picker for nonexistent ties.
    const canSuggestPicker = rule.pickerSuggestionApplicable !== false && rule.tieBreakApplicable !== false;
    const sourceDescription = `The official ${rule.gameName} rule (${rule.editionLabel}), with its rulebook source${canSuggestPicker ? ' and a fair picker for ties.' : '.'}`;
    return { id: `game-${slug}`, path: `/games/${slug}/`, title: `${heading} Official Starting Player Rule`, heading, body: rule.firstPlayerRule, art: { seed: slug, kicker: 'Official rule', lead: /[.!?…]$/u.test(rule.gameName) ? 'Starting rule for' : 'Who goes first in', title: /[.!?…]$/u.test(rule.gameName) ? rule.gameName : `${rule.gameName}?`, body: rule.firstPlayerRule, cta: canSuggestPicker ? 'Full rule + fair picker' : 'Full rule + source' }, description: clip(`${rule.firstPlayerRule} ${sourceDescription}`, 480), campaign: 'game_rule_pin' };
  };
  const games = GAMES.flatMap(slug => {
    const pin = makeGamePin(slug);
    return pin ? [pin] : [];
  });
  const tools = TOOLS.map(tool => ({ ...tool, id: `tool-${tool.id}`, title: tool.heading, art: { seed: tool.id, kicker: 'Free game night tool', title: tool.heading, body: tool.body, cta: 'Try it free' }, description: tool.body }));
  // One tool after every five games keeps the board varied.
  const ordered: Omit<QueuedPin, 'date'>[] = [];
  games.forEach((pin, index) => { ordered.push(pin); if (index % 5 === 4 && tools.length) ordered.push(tools.shift()!); });
  ordered.push(...tools);
  // Append new campaigns so published GUIDs keep their original release dates.
  ordered.push({ id: 'guide-game-night-checklist', path: '/game-night-checklist/', title: 'Free printable game night checklist', heading: 'Your game-night checklist', body: 'Plan the guests, choose the games, set up the table and get playing. A free checklist to print or use on your phone.', art: { seed: 'game-night-checklist', kicker: 'Free printable checklist', title: 'Your game-night checklist', body: 'Plan, set up, play and pack away. Ten simple checks and free tools for the table.', cta: 'Open the free checklist' }, description: 'A free board game night checklist for hosts, clubs and café tables: guests, games, starting player, teams, scores and packing away. Print it or use it on your phone, with no account or app.', campaign: 'game_night_checklist' });
  ordered.push({ id: 'guide-holiday-game-night', path: '/holiday-game-night/', title: 'Holiday family game night: who goes first?', heading: 'Holiday game night: who goes first?', body: 'The official starting rule for Monopoly, UNO, Clue, Catan and more family classics, each linked to its rulebook.', art: { seed: 'holiday-game-night', kicker: 'Thanksgiving & holiday games', title: 'Holiday game night: who goes first?', body: 'Official starting rules for 30+ family classics, from Monopoly and Clue to UNO and Catan.', cta: 'See every starting rule' }, description: 'Planning a Thanksgiving or holiday family game night? See who goes first in Monopoly, UNO, Clue, Sorry!, Catan, Ticket to Ride and more, from the official rules, plus free picker, team and score tools.', campaign: 'holiday_game_night' });
  const futureScenes: Omit<QueuedPin, 'date'>[] = [];
  for (const { slot, replaces, ...scene } of sceneCampaigns) {
    const pin = { ...scene, heading: scene.art.title.replaceAll('\n', ' '), body: scene.art.body };
    // New batches append by default. Catalog-free builds (including the release
    // fixtures) have no game slots to replace, so keep their tool/scene queue valid.
    if (slot === undefined) { futureScenes.push(pin); continue; }
    if (games.length === 0) { ordered.push(pin); continue; }
    const displaced = ordered[slot];
    if (!displaced || displaced.id !== replaces) throw new Error(`Pinterest scene slot ${slot} no longer matches its reviewed schedule`);
    ordered[slot] = pin;
    ordered.push(displaced);
  }
  const extraGames: Omit<QueuedPin, 'date'>[] = (games.length ? OCTOBER_RULES : []).map(slug => {
    const pin = makeGamePin(slug);
    if (!pin || !bySlug.get(slug)?.sources.length) throw new Error(`Unreviewed Pinterest rule: ${slug}`);
    return pin;
  });
  const [coral, observatory, ...laterScenes] = futureScenes;
  if (!coral || !observatory) throw new Error('Pinterest queue is missing its reviewed October scenes');
  // Spread new scenes among rules, after every old campaign. Existing IDs and
  // dates stay fixed; no scheduled day contains more than five Pins.
  extraGames.splice(5, 0, coral);
  extraGames.splice(20, 0, observatory);
  ordered.push(...extraGames);
  for (const slug of games.length ? [...NOVEMBER_RULES, ...NOVEMBER_FOLLOWUP_RULES] : []) {
    const pin = makeGamePin(slug);
    if (!pin || !bySlug.get(slug)?.sources.length || ordered.some(item => item.id === pin.id)) {
      throw new Error(`Unreviewed or duplicate Pinterest rule: ${slug}`);
    }
    ordered.push(pin);
  }
  // New scene batches use the earliest unused future slots. Earlier IDs and
  // release dates stay stable even when a long rule queue delays these scenes.
  const november11SceneIds = new Set(['scene-orchard-picnic-turn-order', 'scene-pottery-studio-score', 'scene-vineyard-hillside-ideas']);
  const november12SceneIds = new Set(['scene-library-path-ideas', 'scene-lighthouse-path-teams', 'scene-theater-stage-picker']);
  const november13SceneIds = new Set(['scene-bakery-tabletop-checklist', 'scene-clockwork-workshop-timer', 'scene-rooftop-terrace-picker']);
  const november14SceneIds = new Set(['scene-hedge-maze-teams', 'scene-textile-atelier-score', 'scene-treetop-village-turn-order']);
  const november15SceneIds = new Set(['scene-marble-gallery-picker', 'scene-stone-garden-teams', 'scene-mountain-campsite-checklist']);
  const november17SceneIds = new Set(['scene-mossy-watermill-picker', 'scene-rainy-puzzle-nook-score', 'scene-crystal-cavern-turn-order']);
  const november18SceneIds = new Set(['scene-sunflower-boardwalk-picker', 'scene-camper-van-score', 'scene-volcanic-archipelago-turn-order']);
  const november20SceneIds = new Set(['scene-lantern-plaza-teams', 'scene-kitchen-table-checklist', 'scene-tea-garden-picker']);
  const november23SceneIds = new Set(['scene-train-carriage-timer', 'scene-airship-dock-teams', 'scene-ceramic-studio-score']);
  const november24SceneIds = new Set(['scene-houseboat-checklist', 'scene-alpine-cable-turn-order', 'scene-cactus-courtyard-number', 'scene-origami-city-teams']);
  const november26SceneIds = new Set(['scene-castle-bridge-teams', 'scene-lily-pond-picker', 'scene-glassworks-score']);
  const november27SceneIds = new Set(['scene-balloon-meadow-turn-order', 'scene-moon-observatory-number', 'scene-harvest-barn-checklist']);
  const november28SceneIds = new Set(['scene-atlas-room-teams', 'scene-snowglobe-picker', 'scene-coral-display-number']);
  const november29SceneIds = new Set(['scene-neon-mosaic-score', 'scene-kite-garden-turn-order', 'scene-quilt-fort-checklist']);
  const november30SceneIds = new Set(['scene-vinyl-room-score', 'scene-fossil-path-number', 'scene-orchid-archway-picker']);
  const december1SceneIds = new Set(['scene-cinema-room-turn-order', 'scene-cedar-cabin-checklist', 'scene-river-pebble-teams']);
  ordered.push(...laterScenes.filter(scene => !november11SceneIds.has(scene.id) && !november12SceneIds.has(scene.id) && !november13SceneIds.has(scene.id) && !november14SceneIds.has(scene.id) && !november15SceneIds.has(scene.id) && !november17SceneIds.has(scene.id) && !november18SceneIds.has(scene.id) && !november20SceneIds.has(scene.id) && !november23SceneIds.has(scene.id) && !november24SceneIds.has(scene.id) && !november26SceneIds.has(scene.id) && !november27SceneIds.has(scene.id) && !november28SceneIds.has(scene.id) && !november29SceneIds.has(scene.id) && !november30SceneIds.has(scene.id) && !december1SceneIds.has(scene.id)));
  // Two distinct utility cards complete the small November 10 creative batch.
  // They follow the scene majority and preserve every prior queue position.
  ordered.push({ id: 'tool-card-draw-dealer-nov', path: '/card-draw/', title: 'No deck? Draw a card to choose the dealer', heading: 'Draw a card for the deal', body: 'Take turns drawing from a shuffled 52-card deck. Cards do not repeat until you reshuffle.', art: { seed: 'card-draw-dealer-nov', kicker: 'A deck in your browser', title: 'Who deals\nfirst?', body: 'Draw a card each from a shuffled deck.', cta: 'Open the free card draw' }, description: 'Need to choose a dealer without a deck? Draw cards from a shuffled 52-card deck in your browser. Cards do not repeat until you reshuffle. Free, no account needed.', campaign: 'tool_card_draw_dealer' });
  ordered.push({ id: 'tool-score-keeper-save-nov', path: '/score-keeper/', title: 'Keep game-night scores on your phone', heading: 'Keep score on your phone', body: 'Add players and points as you play. Scores stay on this device, even after a refresh.', art: { seed: 'score-keeper-save-nov', kicker: 'Put down the score pad', title: 'Keep every\npoint in view.', body: 'Add players and tap to score.', cta: 'Try the free score keeper' }, description: 'Keep board and card game scores on your phone. Add players and points, see the leader, and keep scores on this device after a refresh. Free, no account needed.', campaign: 'tool_score_keeper_local' });
  // Keep the November 11 batch scene-led, with two distinct practical tools.
  ordered.push(...laterScenes.filter(scene => november11SceneIds.has(scene.id)));
  ordered.push({ id: 'tool-turn-timer-sand-nov', path: '/turn-timer/', title: 'Lost the sand timer? Keep turns moving', heading: 'Keep turns moving', body: 'Set a 30-second to 3-minute turn limit and restart for the next player.', art: { seed: 'turn-timer-sand-nov', kicker: 'A timer for every turn', title: 'No sand timer?\nNo problem.', body: 'Set a limit and restart for the next player.', cta: 'Try the free turn timer' }, description: 'Lost the sand timer for a word, drawing or board game? Pick 30 seconds to 3 minutes, start the free browser timer, and restart it for the next player. No account needed.', campaign: 'tool_turn_timer_sand' });
  ordered.push({ id: 'tool-random-letter-skip-nov', path: '/random-letter-generator/', title: 'Pick a random letter and skip the tricky ones', heading: 'A letter for the next round', body: 'Draw a random letter for word games, skip hard letters and avoid repeats.', art: { seed: 'random-letter-skip-nov', kicker: 'Make word games easy to start', title: 'Pick a letter.\nStart the round.', body: 'Skip tricky letters and avoid repeats.', cta: 'Try the free letter tool' }, description: 'Pick a random letter for Scattergories or another word game. Skip Q, U, V, X, Y and Z if your table wants, and prevent a letter from repeating in the same game. Free browser tool.', campaign: 'tool_random_letter_skip' });
  // November 12 originals follow all earlier IDs and dates. The two cards are
  // practical minority companions to three fully reviewed scene backgrounds.
  ordered.push(...laterScenes.filter(scene => november12SceneIds.has(scene.id)));
  ordered.push({ id: 'tool-numbered-seats-picker-nov', path: '/', title: 'Use numbered seats to choose who starts', heading: 'A fair start without typing names', body: 'Number the seats around the table, set the player count and pick one at random.', art: { seed: 'numbered-seats-picker-nov', kicker: 'No names to enter', title: 'Number seats.\nPick a starter.', body: 'Give each seat a number and draw one fairly.', cta: 'Open the free picker' }, description: 'Need a quick first player without typing names? Number the seats around your table and use the free first-player picker to select one fairly. No app or account needed.', campaign: 'tool_numbered_seats_picker' });
  ordered.push({ id: 'guide-checklist-packup-nov', path: '/game-night-checklist/', title: 'A game-night checklist from setup to pack-up', heading: 'Plan the whole game night', body: 'Use ten simple checks for guests, games, table setup and packing away.', art: { seed: 'checklist-packup-nov', kicker: 'Free hosting checklist', title: 'Plan. Play.\nPack away.', body: 'Ten simple checks from setup to the end.', cta: 'Open the free checklist' }, description: 'A free game-night checklist for guests, games, table setup, the first turn and packing away. Print it or keep it on your phone. No account needed.', campaign: 'game_night_checklist' });
  ordered.push(...laterScenes.filter(scene => november13SceneIds.has(scene.id)));
  ordered.push({ id: 'tool-coin-flip-two-player-nov', path: '/coin-flip/', title: 'Two players? Flip a coin for the first turn', heading: 'A quick two-player start', body: 'Assign heads and tails, then flip a virtual coin to decide who starts.', art: { seed: 'coin-flip-two-player-nov', kicker: 'A fair two-player start', title: 'Heads or tails?\nOne flip decides.', body: 'Assign sides and flip for the first turn.', cta: 'Try the free coin flip' }, description: 'For a two-player game, assign heads and tails before flipping the free virtual coin. Agree whether the winner starts or gets to choose. No account needed.', campaign: 'tool_coin_flip_two_player' });
  ordered.push({ id: 'tool-dice-roller-lost-d20-nov', path: '/dice-roller/', title: 'Lost a d20? Roll virtual dice on your phone', heading: 'A missing die need not stop play', body: 'Roll virtual d4 through d100 dice and see the total immediately.', art: { seed: 'dice-roller-lost-d20-nov', kicker: 'For a missing die', title: 'Lost your d20?\nKeep playing.', body: 'Roll d4 through d100 dice in your browser.', cta: 'Open the free dice roller' }, description: 'A missing die need not stop game night. Roll up to 12 virtual d4, d6, d8, d10, d12, d20 or d100 dice in your browser and see the total. Free, no account needed.', campaign: 'tool_dice_roller_missing_d20' });
  ordered.push(...laterScenes.filter(scene => november14SceneIds.has(scene.id)));
  ordered.push({ id: 'tool-rps-one-phone-nov', path: '/rock-paper-scissors/', title: 'Rock paper scissors on one phone for two players', heading: 'A secret two-player decider', body: 'Pass one phone so both players choose in secret. Reveal together and replay a tie.', art: { seed: 'rps-one-phone-nov', kicker: 'A two-player decider', title: 'Secret picks.\nOne phone.', body: 'Pass the phone and reveal both throws.', cta: 'Play rock paper scissors' }, description: 'Play rock paper scissors with one phone: each player picks in secret, then both throws appear together. A tie means throw again. Free, no account needed.', campaign: 'tool_rps_one_phone' });
  ordered.push({ id: 'tool-random-number-range-nov', path: '/random-number-generator/', title: 'Pick a fair random number in any range', heading: 'A number for your next game', body: 'Choose the low and high whole numbers, then draw a number with equal chance for each result.', art: { seed: 'random-number-range-nov', kicker: 'For a numbered draw', title: 'Pick a number\nin any range.', body: 'Choose both ends and draw fairly.', cta: 'Try the number generator' }, description: 'Need a number for a game, seat or draw? Set the low and high whole numbers and get a fair random result, including both ends of the range. Free, no account needed.', campaign: 'tool_random_number_range' });
  ordered.push(...laterScenes.filter(scene => november15SceneIds.has(scene.id)));
  ordered.push({ id: 'guide-printable-qr-cards-nov', path: '/printable-game-night/', title: 'Print two QR table cards for game night', heading: 'A quick first turn at every table', body: 'Print two cut-out cards with a QR shortcut to the free first-player picker.', art: { seed: 'printable-qr-cards-nov', kicker: 'A free table extra', title: 'Two cards.\nOne easy start.', body: 'Print QR cards for the game table.', cta: 'Get the free table cards' }, description: 'Print a free one-page sheet with two cut-out game-night cards. Each card has a QR shortcut to the first-player picker, so guests can scan to choose who starts. No account needed.', campaign: 'guide_printable_qr_cards' });
  ordered.push({ id: 'guide-sourced-starting-ideas-nov', path: '/ways-to-pick-who-goes-first/', title: 'Borrow starting ideas from real game rulebooks', heading: 'New ways to choose the first turn', body: 'Browse starting-player rules from published game rulebooks, grouped by theme.', art: { seed: 'sourced-starting-ideas-nov', kicker: 'From published rulebooks', title: 'Real rules.\nFresh first turns.', body: 'Browse starting ideas grouped by theme.', cta: 'Browse the starting ideas' }, description: 'Find playful starting-player ideas from published board-game rulebooks, grouped by theme. Each reviewed idea works without that game’s pieces; use the random picker for ties. Free to browse.', campaign: 'guide_sourced_starting_ideas' });
  ordered.push(...laterScenes.filter(scene => november17SceneIds.has(scene.id)));
  ordered.push({ id: 'guide-three-starting-choices-nov', path: '/choose-who-goes-first/', title: 'Three clear ways to choose who starts a board game', heading: 'Choose the kind of first turn', body: 'Check the rulebook, make an equal-chance draw, or agree on a playful question.', art: { seed: 'three-starting-choices-nov', kicker: 'Before the first turn', title: 'Rulebook?\nFair draw?\nFun question?', body: 'See three ways to choose who starts.', cta: 'Compare the three choices' }, description: 'Use the game’s own starting rule when it has one. Otherwise, give everyone an equal-chance draw or agree on a playful house-rule question. The free guide explains when each choice fits and how to settle ties.', campaign: 'guide_three_starting_choices' });
  ordered.push({ id: 'guide-playful-house-rules-nov', path: '/house-rules/', title: 'Playful house-rule questions for who starts', heading: 'Make the first turn playful', body: 'Draw an original house-rule question and let the group decide who fits best. These prompts are not equal-chance draws.', art: { seed: 'playful-house-rules-nov', kicker: 'For a casual game night', title: 'Ask a question.\nPick who starts.', body: 'Playful prompts, not random draws.', cta: 'Browse the house rules' }, description: 'Try an original playful question to choose a starting player. These house rules are separate from official game rules and do not give everyone equal odds; if the table cannot agree, skip the question or use the fair picker for a tie.', campaign: 'guide_playful_house_rules' });
  ordered.push(...laterScenes.filter(scene => november18SceneIds.has(scene.id)));
  ordered.push({ id: 'tool-finger-chooser-group-nov', path: '/finger-chooser/', title: 'Everyone touches the phone. One player starts.', heading: 'A group draw on one phone', body: 'Each player puts a finger on the screen. The spotlight chooses one at random.', art: { seed: 'finger-chooser-group-nov', kicker: 'One phone, one fair pick', title: 'Everyone\njoins the draw.', body: 'Touch the screen to choose one player.', cta: 'Try the finger chooser' }, description: 'Gather around one phone and let each player touch the screen with a finger. A spotlight chooses one starting player at random. Free, no account needed.', campaign: 'tool_finger_chooser_group' });
  ordered.push({ id: 'guide-holiday-family-starters-nov', path: '/holiday-game-night/', title: 'Find first-player rules for family holiday games', heading: 'Start the holiday games fairly', body: 'Browse sourced starting-player rules for more than 30 family games.', art: { seed: 'holiday-family-starters-nov', kicker: 'For holiday game night', title: 'Who starts\nthe classics?', body: 'Find sourced first-player rules for family games.', cta: 'Browse holiday game rules' }, description: 'Planning a family game night? Browse starting-player rules for more than 30 familiar games, each tied to its publisher rulebook, plus free tools for a fair fallback. No account needed.', campaign: 'guide_holiday_family_starters' });
  ordered.push(...laterScenes.filter(scene => november20SceneIds.has(scene.id)));
  ordered.push(...laterScenes.filter(scene => november23SceneIds.has(scene.id)));
  // Complete November 24's three occupied slots, then seed a full November 25.
  // The seven new items make a real future buffer while keeping scenes the majority.
  ordered.push({ id: 'guide-fair-draw-how-it-works-nov', path: '/fairness/', title: 'How a fair first-player draw works', heading: 'Give each player one equal chance', body: 'Enter each player once. The winner is chosen before the animation reveals it.', art: { seed: 'fair-draw-how-it-works-nov', kicker: 'A fair first turn', title: 'One entry.\nOne equal chance.', body: 'See how the picker chooses a starter.', cta: 'See how the draw works' }, description: 'Learn how the free first-player picker gives each listed player one equal chance. The winner is chosen before the reveal animation; repeated winners can happen in independent draws. Casual game-night utility, not a certified prize draw.', campaign: 'guide_fair_draw_how_it_works' });
  ordered.push({ id: 'tool-spinner-reveal-nov', path: '/methods/spinner/', title: 'Spin to reveal who starts the game', heading: 'Let the spinner reveal the first player', body: 'Add players, make a fair draw, then watch the spinner reveal the chosen name.', art: { seed: 'spinner-reveal-nov', kicker: 'A playful reveal', title: 'Spin to reveal\nwho starts.', body: 'The fair pick happens before the spin.', cta: 'Try the free spinner' }, description: 'Add names or numbered seats to the free first-player picker. A fair result is selected first, then the spinner reveals it; the animation does not change the outcome. No account needed.', campaign: 'tool_spinner_reveal' });
  ordered.push(...laterScenes.filter(scene => november24SceneIds.has(scene.id)));
  ordered.push({ id: 'tool-dice-roller-many-dice-nov', path: '/dice-roller/', title: 'Roll up to 12 dice together on your phone', heading: 'Roll the dice your game needs', body: 'Pick up to 12 virtual dice, choose d4 through d100 and see the total.', art: { seed: 'dice-roller-many-dice-nov', kicker: 'The dice are ready', title: 'Roll up to\n12 dice.', body: 'Choose d4 through d100 and see the total.', cta: 'Open the free dice roller' }, description: 'Need more dice for game night? Roll up to 12 virtual dice in one go, choose d4, d6, d8, d10, d12, d20 or d100 and see the total. Free on your phone, no account needed.', campaign: 'tool_dice_roller_many' });
  // Two full future days restore a real buffer after the November 25 queue end.
  // New scene backgrounds are reviewed separately; utility cards test precise hooks.
  ordered.push(...laterScenes.filter(scene => november26SceneIds.has(scene.id)));
  ordered.push({ id: 'method-go-card-reveal-nov', path: '/methods/cards/', title: 'Deal GO cards to choose who starts', heading: 'One GO card chooses the starter', body: 'Deal one card to each player. The GO card reveals who starts.', art: { seed: 'go-card-reveal-nov', kicker: 'A different fair reveal', title: 'Deal a card.\nFind the GO.', body: 'One GO card reveals the first player.', cta: 'Try the free card method' }, description: 'Give every player one card in the free browser method. Exactly one GO card reveals who starts, so everyone has an equal chance. No account needed.', campaign: 'method_go_card_reveal' });
  ordered.push({ id: 'tool-uneven-team-split-nov', path: '/random-team-generator/', title: 'Split seven players into two random teams', heading: 'Seven players can still make teams', body: 'Enter seven names, choose two teams, and get a random four-and-three split.', art: { seed: 'uneven-team-split-nov', kicker: 'For an odd-sized group', title: 'Seven players.\nTwo teams.', body: 'Shuffle into a four-and-three split.', cta: 'Try the free team maker' }, description: 'Have seven players? Enter their names and choose two teams. The random team generator makes teams of four and three. Free on your phone, no account needed.', campaign: 'tool_uneven_team_split' });
  ordered.push(...laterScenes.filter(scene => november27SceneIds.has(scene.id)));
  ordered.push({ id: 'tool-turn-timer-next-player-nov', path: '/turn-timer/', title: 'Restart a short timer for each turn', heading: 'Time each player’s turn', body: 'Choose 30 seconds to 3 minutes, then restart for the next player.', art: { seed: 'turn-timer-next-player-nov', kicker: 'Keep turns moving', title: 'One timer.\nEvery player.', body: 'Pick a limit and restart each turn.', cta: 'Try the free turn timer' }, description: 'Set the free browser turn timer from 30 seconds to 3 minutes. It beeps at the end; restart for the next player. No account needed.', campaign: 'tool_turn_timer_next_player' });
  ordered.push({ id: 'tool-coin-flip-tally-nov', path: '/coin-flip/', title: 'Keep a running tally of coin flips', heading: 'A coin flip with a tally', body: 'Choose heads or tails, flip, and see a tally until you refresh.', art: { seed: 'coin-flip-tally-nov', kicker: 'For a quick decision', title: 'Flip a coin.\nSee the tally.', body: 'Track flips during this visit.', cta: 'Try the free coin flip' }, description: 'Call heads or tails before each free browser coin flip. A running tally shows completed flips during this visit and clears when the page refreshes. No account needed.', campaign: 'tool_coin_flip_tally' });
  // November 25 replenishment: six original reviewed scenes and four distinct
  // utility hooks fill two new future days without changing prior queue slots.
  ordered.push(...laterScenes.filter(scene => november28SceneIds.has(scene.id)));
  ordered.push({ id: 'tool-low-card-dealer-nov', path: '/card-draw/', title: 'Draw a low card to choose the first dealer', heading: 'A low-card dealer draw', body: 'Agree on low card first, then let each player draw once from the shuffled deck.', art: { seed: 'low-card-dealer-nov', kicker: 'A shared deck on your phone', title: 'Low card\ndeals first.', body: 'Agree on the rule and draw once each.', cta: 'Open the free card draw' }, description: 'Cribbage and Euchre use a low-card draw to choose the first dealer. Agree on your game’s rule before drawing; pass the phone and draw one card per player from a shuffled 52-card deck. No repeats until reshuffle.', campaign: 'tool_low_card_dealer' });
  ordered.push({ id: 'tool-three-random-teams-nov', path: '/random-team-generator/', title: 'Make three random teams for game night', heading: 'Three teams without choosing sides', body: 'Enter everyone’s name once, choose three teams, and shuffle into balanced groups.', art: { seed: 'three-random-teams-nov', kicker: 'For a bigger group', title: 'Three teams.\nOne shuffle.', body: 'Split names into balanced random groups.', cta: 'Try the free team maker' }, description: 'Need three groups for a party game or trivia round? Enter names, choose three teams and shuffle. Team sizes differ by no more than one player. Free in your browser, no account needed.', campaign: 'tool_three_random_teams' });
  ordered.push(...laterScenes.filter(scene => november29SceneIds.has(scene.id)));
  ordered.push({ id: 'tool-fifty-player-picker-nov', path: '/', title: 'Choose one starter from a large group', heading: 'One fair starter from the whole group', body: 'Add up to 50 names or numbered seats and draw one first player at random.', art: { seed: 'fifty-player-picker-nov', kicker: 'For the whole gathering', title: 'One starter.\nUp to 50 players.', body: 'Give every listed player an equal chance.', cta: 'Try the free player picker' }, description: 'Big group at one table? Add 2–50 player names or numbered seats to the free first-player picker, then draw one starter at random. Each listed player has one equal chance. No account needed.', campaign: 'tool_fifty_player_picker' });
  ordered.push({ id: 'guide-rulebook-random-fallback-nov', path: '/choose-who-goes-first/', title: 'When the rulebook says choose at random', heading: 'A fair draw for an open starting rule', body: 'Check the game’s starting rule, then make an equal-chance draw when it leaves the choice open.', art: { seed: 'rulebook-random-fallback-nov', kicker: 'Before the first turn', title: 'Rule says\n“at random”?', body: 'Give everyone one equal chance.', cta: 'See the fair-start guide' }, description: 'When a game rulebook tells your group to choose the first player at random, give each participant one equal-chance entry. This free guide explains the rulebook-first approach and when a playful house rule is different.', campaign: 'guide_rulebook_random_fallback' });
  // November 26 replenishment appends two reviewed future days. The scene
  // majority tests new compositions while four cards address specific tasks.
  ordered.push(...laterScenes.filter(scene => november30SceneIds.has(scene.id)));
  ordered.push({ id: 'tool-card-draw-no-repeat-nov', path: '/card-draw/', title: 'Draw cards without repeats on one phone', heading: 'Pass the deck, draw once each', body: 'Each draw comes from the same shuffled 52-card deck until you reshuffle.', art: { seed: 'card-draw-no-repeat-nov', kicker: 'A shared virtual deck', title: 'Draw a card.\nPass the phone.', body: 'No repeats until you reshuffle.', cta: 'Try the free card draw' }, description: 'Need a shared deck for a quick game-night decision? Pass one phone and draw from the same shuffled 52-card deck. Cards do not repeat until you reshuffle. Free, no account needed.', campaign: 'tool_card_draw_no_repeat' });
  ordered.push({ id: 'tool-four-balanced-teams-nov', path: '/random-team-generator/', title: 'Make four balanced random teams', heading: 'Four teams from one name list', body: 'Enter names once, choose four teams and shuffle; sizes differ by at most one.', art: { seed: 'four-balanced-teams-nov', kicker: 'For a larger gathering', title: 'Four teams.\nOne shuffle.', body: 'Split the whole list into balanced groups.', cta: 'Try the free team maker' }, description: 'Running four tables or a team game? Enter player names, choose four teams and shuffle into balanced random groups. Team sizes differ by no more than one. Free in your browser.', campaign: 'tool_four_balanced_teams' });
  ordered.push(...laterScenes.filter(scene => december1SceneIds.has(scene.id)));
  ordered.push({ id: 'tool-one-minute-turn-limit-nov', path: '/turn-timer/', title: 'Give every player a one-minute turn', heading: 'One minute for every turn', body: 'Set a 60-second turn limit, then restart the browser timer for the next player.', art: { seed: 'one-minute-turn-limit-nov', kicker: 'A shared pace for the table', title: 'One minute\nper turn.', body: 'Set the limit and restart each turn.', cta: 'Try the free turn timer' }, description: 'Want a shared pace for a fast round? Set the free browser turn timer to 60 seconds and restart for each player. Agree on the limit with your group before play. No account needed.', campaign: 'tool_one_minute_turn_limit' });
  ordered.push({ id: 'guide-holiday-setup-checklist-nov', path: '/game-night-checklist/', title: 'Plan a holiday game night in ten checks', heading: 'Keep holiday hosting simple', body: 'Work through ten checks for guests, games, setup and pack-up.', art: { seed: 'holiday-setup-checklist-nov', kicker: 'For a gathering at home', title: 'Guests. Games.\nReady to play.', body: 'Ten simple checks for the whole night.', cta: 'Open the free checklist' }, description: 'Hosting friends or family for games? Use this free ten-step checklist to plan guests, choose games, prepare the table and pack up. Print it or use it on your phone; no account needed.', campaign: 'guide_holiday_setup_checklist' });
  const november24FillIds = new Set(['guide-fair-draw-how-it-works-nov', 'tool-spinner-reveal-nov']);
  const november25FillIds = new Set([...november24SceneIds, 'tool-dice-roller-many-dice-nov']);
  const november26FillIds = new Set([...november26SceneIds, 'method-go-card-reveal-nov', 'tool-uneven-team-split-nov']);
  const november27FillIds = new Set([...november27SceneIds, 'tool-turn-timer-next-player-nov', 'tool-coin-flip-tally-nov']);
  const november28FillIds = new Set([...november28SceneIds, 'tool-low-card-dealer-nov', 'tool-three-random-teams-nov']);
  const november29FillIds = new Set([...november29SceneIds, 'tool-fifty-player-picker-nov', 'guide-rulebook-random-fallback-nov']);
  const november30FillIds = new Set([...november30SceneIds, 'tool-card-draw-no-repeat-nov', 'tool-four-balanced-teams-nov']);
  const december1FillIds = new Set([...december1SceneIds, 'tool-one-minute-turn-limit-nov', 'guide-holiday-setup-checklist-nov']);
  return cache = ordered.map((pin, index) => ({
    ...pin,
    // Explicit dates keep reviewed append-only batches out of earlier releases.
    date: november20SceneIds.has(pin.id) ? '2026-11-21' : november23SceneIds.has(pin.id) || november24FillIds.has(pin.id) ? '2026-11-24' : november25FillIds.has(pin.id) ? '2026-11-25' : november26FillIds.has(pin.id) ? '2026-11-26' : november27FillIds.has(pin.id) ? '2026-11-27' : november28FillIds.has(pin.id) ? '2026-11-28' : november29FillIds.has(pin.id) ? '2026-11-29' : november30FillIds.has(pin.id) ? '2026-11-30' : december1FillIds.has(pin.id) ? '2026-12-01' : new Date(START + Math.floor(index / PER_DAY) * 86_400_000).toISOString().slice(0, 10),
  }));
}

// A deployment shortly after UTC midnight must not expose that day's queue
// before the scheduled 13:07 UTC Pinterest release workflow.
export const releasedPins = (now = new Date()) => pinQueue().filter(pin => new Date(`${pin.date}T13:07:00Z`) <= now);
