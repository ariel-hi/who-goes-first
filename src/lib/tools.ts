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

/** One name per line or comma; blank entries are dropped. Duplicates stay: two lines are two entries. */
export function parseNames(text: string): string[] {
  return text.split(/[\n,]/).map(name => name.trim()).filter(Boolean).slice(0, 200);
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
