import { pinQueue } from './pinterest-pins';

// Editorial campaign names are rendered into the consent loaders by the site.
// Derive Pinterest names from its actual queue so new reviewed campaigns cannot
// silently lose attribution while retaining labels used by older shared links.
export function socialCampaignNames(): string[] {
  return [...new Set([
    'first_player_picker', 'game_rules', 'house_questions', 'choose_first_player',
    ...pinQueue().map(pin => pin.campaign),
  ])];
}
