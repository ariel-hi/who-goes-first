import type { Outcome, Player } from './selection';

// One palette follows player IDs through edits, reordering and every method.
const palette = ['#e49a8b', '#8ebfa5', '#94a9dd', '#e7c35f', '#bf9bd0', '#79bdc6', '#df9dbe', '#b9c77c', '#e7b27e', '#9cbbd0', '#b7a1e2', '#c4b39d'];
export function playerColor(player: Player): string {
  const index = Number(player.id.replace('player-', '')) - 1;
  return palette[index] ?? `hsl(${((index - palette.length) * 137.508 + 12) % 360} 54% ${70 + index % 3 * 5}%)`;
}

export interface PlayerReveal {
  popAt: number | null;
  flipAt: number;
  flipDuration: number;
  matchTilt: number;
  matchAt: number;
  diceAt: number;
  spinnerTurns: number;
  spinnerOffset: number;
  coin: { delay: number; duration: number; lift: number; tilt: number; turn: number; drift: number };
  balloon: { style: number; driftX: number; driftY: number; turn: number; bobDelay: number; bobDuration: number; bobX: number; bobY: number; bobTurn: number };
  shell: { delay: number; tilt: number };
  tower: { style: number; fallAt: number; fallDuration: number; stagger: number; drift: number };
}
export type RevealPlan = Readonly<Record<string, PlayerReveal>>;

function shuffle<T>(values: readonly T[], random: () => number): T[] {
  const shuffled = [...values];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  return shuffled;
}

// Cosmetic randomness is sampled once in the click handler, after the secure
// draw. It never selects a player and never changes on a render or a skip.
export function createRevealPlan(outcome: Outcome, random: () => number = Math.random): RevealPlan {
  const plan: Record<string, PlayerReveal> = {};
  for (const player of outcome.players) {
    plan[player.id] = {
      popAt: null, flipAt: 0, flipDuration: 900 + random() * 160, matchTilt: -8 + random() * 16,
      matchAt: 0, diceAt: 0, spinnerTurns: 5, spinnerOffset: 0, coin: { delay: 0, duration: 0, lift: 0, tilt: 0, turn: 720, drift: 0 },
      balloon: { style: 0, driftX: 0, driftY: 0, turn: 0, bobDelay: 0, bobDuration: 0, bobX: 0, bobY: 0, bobTurn: 0 },
      shell: { delay: 0, tilt: 0 },
      tower: { style: 0, fallAt: 0, fallDuration: 0, stagger: 0, drift: 0 },
    };
  }
  const losers = shuffle(outcome.players.filter(player => player.id !== outcome.winnerId), random);
  const gaps = losers.slice(1).map(() => .15 + random() ** 2 * 2.5);
  const gapTotal = gaps.reduce((sum, gap) => sum + gap, 0);
  let popAt = 1100 + random() * 250;
  const popWindow = 1350 + random() * 200;
  losers.forEach((player, index) => {
    if (index) popAt += gaps[index - 1]! / gapTotal * popWindow;
    plan[player.id]!.popAt = Math.round(popAt);
    plan[player.id]!.balloon = {
      ...plan[player.id]!.balloon,
      style: index % 4,
      driftX: Math.round((random() - .5) * 26),
      driftY: Math.round(-12 - random() * 18),
      turn: Math.round((random() - .5) * 80),
    };
    plan[player.id]!.tower = {
      style: index % 6,
      fallAt: Math.round(1180 + index % 6 * 110 + random() * 150),
      fallDuration: Math.round(520 + random() * 190),
      stagger: Math.round(45 + random() * 45),
      drift: random() * 7 - 3.5,
    };
  });
  // The star is the final reveal, regardless of card layout or flip speed.
  const cards = shuffle(losers, random);
  const flipStart = 550 + random() * 120;
  cards.forEach((player, rank) => {
    // All flips overlap, with shuffled start order and slightly different speeds.
    plan[player.id]!.flipAt = Math.round(flipStart + rank / Math.max(1, cards.length) * 600 + random() * 35);
  });
  const lastLoser = Math.max(...cards.map(player => plan[player.id]!.flipAt));
  plan[outcome.winnerId]!.flipAt = lastLoser + 180;
  for (const player of outcome.players) {
    const piece = plan[player.id]!;
    piece.matchAt = Math.round(random() * 190);
    piece.diceAt = Math.round(random() * 180);
    piece.spinnerTurns = [4, 5, 6, -4, -5, -6][Math.floor(random() * 6)]!;
    // Keep the pointer comfortably inside the chosen slice, but rarely dead center.
    piece.spinnerOffset = (random() < .5 ? -1 : 1) * (.09 + random() * .24);
    // Every balloon receives motion from the same distribution, including the survivor.
    piece.balloon.bobDelay = Math.round(-random() * 900);
    piece.balloon.bobDuration = Math.round(1300 + random() * 550);
    piece.balloon.bobX = Math.round((random() - .5) * 8);
    piece.balloon.bobY = Math.round(-4 - random() * 5);
    piece.balloon.bobTurn = Math.round((random() - .5) * 6);
    piece.coin = {
      delay: Math.round(110 + random() * 220),
      duration: Math.round(1580 + random() * 270),
      lift: Math.round(32 + random() * 22),
      tilt: Math.round(-9 + random() * 18),
      turn: [720, -720, 1080, -1080][Math.floor(random() * 4)]!,
      drift: Math.round((random() - .5) * 10),
    };
    piece.shell = { delay: Math.round(620 + random() * 460), tilt: Math.round(-10 + random() * 20) };
  }
  return plan;
}
