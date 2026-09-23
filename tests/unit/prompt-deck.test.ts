import { expect, test } from 'vitest';
import { shuffledPromptDeck } from '../../src/lib/prompt-deck';

test('a question cycle has no repeats and a new cycle cannot repeat its boundary', () => {
  const first = shuffledPromptDeck(60, -1, () => 0);
  expect(new Set(first).size).toBe(60);
  expect(first).toEqual(expect.arrayContaining(Array.from({ length: 60 }, (_, index) => index)));
  const last = first[0]!; // Draws pop from the end.
  const second = shuffledPromptDeck(60, last, () => 0);
  expect(new Set(second).size).toBe(60);
  expect(second[59]).not.toBe(last);
});
