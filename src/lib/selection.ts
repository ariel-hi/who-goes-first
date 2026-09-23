export type Player = Readonly<{ id: string; label: string }>;
export type Outcome = Readonly<{
  drawId: number;
  players: readonly Player[];
  winnerId: string;
  policy: 'equal-chance';
}>;
export type RandomWord = () => number;

export function secureWord(): number {
  if (!globalThis.crypto?.getRandomValues) throw new Error('Secure randomness unavailable.');
  return globalThis.crypto.getRandomValues(new Uint32Array(1))[0]!;
}

// Rejection removes the incomplete bucket at the top of the 32-bit range.
// The injected source is a module-level testing seam, never a URL/UI option.
export function randomIndex(count: number, word: RandomWord = secureWord): number {
  if (!Number.isInteger(count) || count < 1 || count > 50) throw new RangeError('Expected 1–50 candidates.');
  return randomCollectionIndex(count, word);
}

// Collections can grow independently of the 50-player roster limit.
export function randomCollectionIndex(count: number, word: RandomWord = secureWord): number {
  if (!Number.isInteger(count) || count < 1 || count > 2 ** 32) throw new RangeError('Invalid collection size.');
  const range = 2 ** 32;
  const limit = range - (range % count);
  for (let attempt = 0; attempt < 128; attempt++) {
    const value = word();
    if (!Number.isInteger(value) || value < 0 || value >= range) throw new Error('Invalid random source.');
    if (value < limit) return value % count;
  }
  throw new Error('Secure randomness did not complete. Try again.');
}

export function select(players: readonly Player[], drawId: number, word?: RandomWord): Outcome {
  if (players.length < 2 || players.length > 50 || new Set(players.map(p => p.id)).size !== players.length) {
    throw new Error('Expected 2–50 distinct players.');
  }
  const snapshot = Object.freeze(players.map(p => Object.freeze({ ...p })));
  return Object.freeze({ drawId, players: snapshot, winnerId: snapshot[randomIndex(snapshot.length, word)]!.id, policy: 'equal-chance' });
}
