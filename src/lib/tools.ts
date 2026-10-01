import { randomCollectionIndex, secureWord, type RandomWord } from './selection';

/** Unbiased Fisher–Yates shuffle on a copy, using the same rejection-sampled source as the picker. */
export function shuffle<T>(items: readonly T[], word: RandomWord = secureWord): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randomCollectionIndex(i + 1, word);
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

/** Deals shuffled names round-robin, so team sizes differ by at most one. */
export function splitTeams(names: readonly string[], teamCount: number, word: RandomWord = secureWord): string[][] {
  if (!Number.isInteger(teamCount) || teamCount < 2) throw new RangeError('Expected at least 2 teams.');
  if (names.length < teamCount) throw new RangeError('Add at least one name per team.');
  const teams: string[][] = Array.from({ length: teamCount }, () => []);
  shuffle(names, word).forEach((name, index) => teams[index % teamCount]!.push(name));
  return teams;
}

export const MAX_TEAM_NAMES = 200;

/** Blank entries are dropped; duplicates stay. Request one extra entry to detect overflow. */
export function parseNames(text: string, detectOverflow = false): string[] {
  const limit = detectOverflow ? MAX_TEAM_NAMES + 1 : MAX_TEAM_NAMES;
  const names: string[] = [];
  for (const entry of text.matchAll(/[^\n,]+/g)) {
    const name = entry[0].trim();
    if (name) names.push(name);
    if (names.length === limit) break;
  }
  return names;
}

export type Side = 'heads' | 'tails';
export const flipCoin = (word: RandomWord = secureWord): Side => (randomCollectionIndex(2, word) === 0 ? 'heads' : 'tails');

export type Throw = 'rock' | 'paper' | 'scissors';
export const throws: Throw[] = ['rock', 'paper', 'scissors'];
const beats: Record<Throw, Throw> = { rock: 'scissors', paper: 'rock', scissors: 'paper' };
/** 0 for a tie, 1 if the first throw wins, 2 if the second does. */
export function rpsWinner(first: Throw, second: Throw): 0 | 1 | 2 {
  if (first === second) return 0;
  return beats[first] === second ? 1 : 2;
}

export const DIE_SIDES = [4, 6, 8, 10, 12, 20, 100] as const;
export const MAX_DICE = 12;
/** Rolls `count` fair dice with `sides` faces each. */
export function rollDice(count: number, sides: number, word: RandomWord = secureWord): number[] {
  if (!Number.isInteger(count) || count < 1 || count > MAX_DICE) throw new RangeError(`Roll 1–${MAX_DICE} dice.`);
  if (!Number.isInteger(sides) || sides < 2) throw new RangeError('Dice need at least 2 sides.');
  return Array.from({ length: count }, () => randomCollectionIndex(sides, word) + 1);
}

/** A uniform whole number from min to max inclusive. */
export function randomInteger(min: number, max: number, word: RandomWord = secureWord): number {
  if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max) || max < min) throw new RangeError('Use whole numbers, with the second at least the first.');
  if (max - min + 1 > 2 ** 32) throw new RangeError('That range is too large.');
  return min + randomCollectionIndex(max - min + 1, word);
}
