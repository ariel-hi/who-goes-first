import type { RevealPlan } from './reveal-plan';

export const presentations = [
  { id: 'quick', label: 'Quick', duration: 1600 },
  { id: 'instant', label: 'Instant', duration: 0 },
  { id: 'spinner', label: 'Spinner', duration: 3200 },
  { id: 'cards', label: 'Card Draw', duration: 2600 },
  { id: 'balloon', label: 'Balloon Rise', duration: 3600 },
  { id: 'tower', label: 'Towers', duration: 3000 },
  { id: 'straws', label: 'Shortest Match', duration: 2600 },
  { id: 'dice', label: 'Dice Roll', duration: 2600 },
  { id: 'coin', label: 'Coin Flip', duration: 2800 },
  { id: 'shells', label: 'Shell Game', duration: 2700 },
] as const;

export function supportsGroup(mode: string, count: number): boolean {
  return count <= 12 || mode === 'quick' || mode === 'instant' || (count <= 24 && (mode === 'dice' || mode === 'coin'));
}

export function revealDuration(mode: string, plan: RevealPlan): number {
  const pieces = Object.values(plan);
  const last = (end: (piece: (typeof pieces)[number]) => number) => Math.max(0, ...pieces.map(end));
  const end = {
    instant: 0,
    quick: 1050 + Math.min((pieces.length - 1) * 24, 360),
    spinner: 3000,
    cards: last(piece => piece.flipAt + piece.flipDuration),
    balloon: last(piece => (piece.popAt ?? 0) + 600),
    tower: last(piece => piece.tower.fallAt + piece.tower.stagger * 2 + piece.tower.fallDuration),
    straws: last(piece => piece.matchAt + 1980),
    dice: last(piece => piece.diceAt + 1920),
    coin: last(piece => piece.coin.delay + piece.coin.duration),
    shells: last(piece => piece.shell.delay + 820),
  }[mode];
  const maximum = presentations.find(item => item.id === mode)?.duration ?? 0;
  return end === undefined ? 0 : Math.min(maximum, Math.ceil(end + (mode === 'instant' ? 0 : 120)));
}

// A slice is centered at twelve o'clock before rotation. Whole revolutions in
// either direction still put the already-chosen player at the pin.
export function spinnerRotation(winnerIndex: number, count: number, turns = 5, offset = 0): number {
  return turns * 360 - winnerIndex * (360 / count) + offset * (360 / count);
}
