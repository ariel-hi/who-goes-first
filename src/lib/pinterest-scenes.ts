import type { PinArt } from './og-image';

// Each scene occupies one existing, unpublished slot. The displaced rule is
// appended, so all other dates and all published identities remain stable.
export const sceneCampaigns: { slot?: number; replaces?: string; id: string; path: string; title: string; description: string; campaign: string; art: PinArt }[] = [
  {
    slot: 30, replaces: 'game-love-letter-2025-en', id: 'scene-woodland-first-turn', path: '/',
    title: 'Enchanted woodland game night: choose who goes first',
    description: 'An original AI-created woodland board game scene, with lanterns, tiny mushroom houses and colorful wooden meeples. Give your own game night a fair start: use our free first-player picker with names or numbered seats. No app or account needed. Fantasy artwork, not a game for sale.',
    campaign: 'scene_woodland_picker',
    art: { seed: 'woodland-first-turn', scene: 'woodland', kicker: 'A little game-night magic', title: 'Every adventure\nneeds a first turn.', body: 'Everyone’s ready. Pick your starting player fairly.', cta: 'Try the free player picker' },
  },
  {
    slot: 45, replaces: 'game-hanabi-rnr-en', id: 'scene-autumn-checklist', path: '/game-night-checklist/',
    title: 'Cozy autumn game night: a free hosting checklist',
    description: 'Save a little autumn game-night inspiration: an original AI-created miniature cabin scene with warm lanterns and colorful pawns. Plan your real gathering with our free printable game-night checklist for guests, games, table setup and packing away. Fantasy artwork, not a game for sale.',
    campaign: 'scene_autumn_checklist',
    art: { seed: 'autumn-checklist', scene: 'autumn', kicker: 'Gather around the table', title: 'Make room\nfor game night.', body: 'A cozy evening starts with a simple plan.', cta: 'Get the free hosting checklist' },
  },
  {
    slot: 60, replaces: 'game-spirit-island-gtg-en', id: 'scene-sky-railway-turn-order', path: '/turn-order-generator/',
    title: 'All aboard game night: shuffle your playing order',
    description: 'An original AI-created railway in the clouds, with jewel-colored meeples ready for their next adventure. Get everyone in playing order with our free random turn-order generator: enter names, shuffle and start playing. No app or account needed. Fantasy artwork, not a commercial board game.',
    campaign: 'scene_sky_turn_order',
    art: { seed: 'sky-railway-turn-order', scene: 'sky-railway', kicker: 'Next stop: game night', title: 'All aboard.\nWho’s up first?', body: 'Shuffle your playing order. Start the adventure.', cta: 'Try the free turn-order tool' },
  },
];
