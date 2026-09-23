import { randomCollectionIndex } from './selection';

// Draw every question once before starting a fresh shuffled cycle. Keep the
// first question of the new cycle different from the previous cycle's last.
export function shuffledPromptDeck(count: number, previous = -1, pick = randomCollectionIndex): number[] {
  const deck = Array.from({ length: count }, (_, index) => index);
  for (let i = deck.length - 1; i > 0; i--) {
    const j = pick(i + 1);
    [deck[i], deck[j]] = [deck[j]!, deck[i]!];
  }
  if (count > 1 && deck[count - 1] === previous) [deck[0], deck[count - 1]] = [deck[count - 1]!, deck[0]!];
  return deck;
}
