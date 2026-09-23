export const presentations = [
  { id: 'quick', label: 'Quick', duration: 1200 },
  { id: 'instant', label: 'Instant', duration: 0 },
  { id: 'spinner', label: 'Spinner', duration: 3200 },
  { id: 'cards', label: 'Card Draw', duration: 2600 },
  { id: 'balloon', label: 'Balloon Rise', duration: 3600 },
  { id: 'tower', label: 'Towers', duration: 3000 },
  { id: 'straws', label: 'Shortest Match', duration: 2600 },
  { id: 'dice', label: 'Dice Roll', duration: 2600 },
  { id: 'race', label: 'Marble Race', duration: 3600 },
] as const;

export const revealHints = {
  instant: '', quick: 'Picking a player…', spinner: 'Spin to pick a player.',
  cards: 'The star card goes first.', balloon: 'Last balloon goes first.', tower: 'Last tower standing goes first.',
  straws: 'The shortest match goes first.', dice: 'Highest total goes first.', race: 'First marble across wins.',
};

// A slice is centered at twelve o'clock before rotation. Turning by whole
// revolutions minus its center angle puts the already-chosen player at the pin.
export function spinnerRotation(winnerIndex: number, count: number): number {
  return 5 * 360 - winnerIndex * (360 / count);
}
