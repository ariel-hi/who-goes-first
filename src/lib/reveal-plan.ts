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
  diceRoll: number;
  dice: readonly [number, number];
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
      matchAt: 0, diceAt: 0, diceRoll: 1650, dice: [1, 1], spinnerTurns: 5, spinnerOffset: 0, coin: { delay: 0, duration: 0, lift: 0, tilt: 0, turn: 720, drift: 0 },
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
  // Every table method eliminates the others one at a time in a fresh order,
  // then holds a beat and resolves the final two together, so nobody knows
  // until the very end. Either of the pair may land a moment first.
  const order = (window: number, perPlayer: number, start: number, hold: number, set: (piece: PlayerReveal, at: number) => void, at: (piece: PlayerReveal) => number) => {
    const sequence = shuffle(losers, random);
    const early = sequence.slice(0, -1);
    const span = Math.min(window, perPlayer * early.length);
    early.forEach((player, rank) => set(plan[player.id]!, Math.round(start + (early.length > 1 ? rank / (early.length - 1) : 0) * span + random() * 40)));
    const final = Math.max(start, ...early.map(player => at(plan[player.id]!))) + (early.length ? hold : 0);
    const offset = Math.round((random() - .5) * 90);
    set(plan[sequence.at(-1)!.id]!, final - offset / 2);
    set(plan[outcome.winnerId]!, final + offset / 2);
  };
  order(1000, 240, 520 + random() * 100, 480, (piece, time) => { piece.flipAt = time; }, piece => piece.flipAt);
  order(900, 230, 80, 420, (piece, time) => { piece.matchAt = time; }, piece => piece.matchAt);
  // Dice and coins all leave the hand together; they land one at a time instead.
  order(900, 200, 1250, 380, (piece, time) => { piece.diceRoll = time; }, piece => piece.diceRoll);
  order(1000, 240, 420, 460, (piece, time) => { piece.shell.delay = time; }, piece => piece.shell.delay);
  order(800, 200, 1300, 380, (piece, time) => { piece.coin.duration = time; }, piece => piece.coin.duration);
  // The chosen roll is always the single highest total; the totals themselves vary.
  const roll = () => 1 + Math.floor(random() * 6);
  const best = 7 + Math.floor(random() * 6);
  const first = Math.max(best - 6, 1 + Math.floor(random() * Math.min(6, best - 1)));
  plan[outcome.winnerId]!.dice = [first, best - first];
  for (const player of losers) {
    let pair: [number, number] = [roll(), roll()];
    while (pair[0] + pair[1] >= best) pair = [roll(), roll()];
    plan[player.id]!.dice = pair;
  }
  for (const player of outcome.players) {
    const piece = plan[player.id]!;
    piece.diceAt = Math.round(random() * 120);
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
      delay: Math.round(60 + random() * 120),
      duration: piece.coin.duration,
      lift: Math.round(32 + random() * 22),
      tilt: Math.round(-9 + random() * 18),
      turn: [720, -720, 1080, -1080][Math.floor(random() * 4)]!,
      drift: Math.round((random() - .5) * 10),
    };
    piece.shell.tilt = Math.round(-10 + random() * 20);
  }
  return plan;
}
