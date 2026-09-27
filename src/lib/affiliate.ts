// A search link, not a product link: a guessed product ID could send readers to
// an unrelated game that shares the name (Chomp, Vienna). Game name only, so no
// reader data enters the URL.
export function amazonSearchUrl(gameName: string, tag: string): string {
  const url = new URL('https://www.amazon.com/s');
  url.searchParams.set('k', `${gameName} board game`);
  url.searchParams.set('tag', tag);
  return url.href;
}
export const amazonDisclosure = 'As an Amazon Associate, we earn from qualifying purchases. Amazon and its logo are trademarks of Amazon.com, Inc. or its affiliates.';

// Readers of a rule page usually own the game already, so accessories fit better
// than the box itself. Generic search terms only; no reader data in the URL.
const gear = [
  { query: 'first player token board game', label: 'First-player tokens', note: 'Mark who starts' },
  { query: 'dice tray board game', label: 'Dice trays', note: 'Keep rolls on the table' },
  { query: 'board game card sleeves', label: 'Card sleeves', note: 'Protect your cards' },
  { query: 'board game organizer insert', label: 'Box organizers', note: 'Faster setup' },
];
export function gearLinks(tag: string) {
  return gear.map(item => {
    const url = new URL('https://www.amazon.com/s');
    url.searchParams.set('k', item.query);
    url.searchParams.set('tag', tag);
    return { label: item.label, note: item.note, href: url.href };
  });
}
