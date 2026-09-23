import type { Player } from './selection';

const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
export const graphemeCount = (text: string) => [...segmenter.segment(text)].length;
export const hasControls = (text: string) => [...text].some(char => { const point = char.codePointAt(0)!; return point < 32 || point === 127 || (point >= 0x202a && point <= 0x202e) || (point >= 0x2066 && point <= 0x2069); });
export const seats = (count: number): Player[] => Array.from({ length: count }, (_, i) => ({ id: `player-${i + 1}`, label: `Seat ${i + 1}` }));

export function parseNames(text: string, previous: readonly Player[] = []): { players: Player[]; errors: string[]; duplicate: boolean } {
  const names = text.split(/\r?\n|\r/u).map(name => name.trim()).filter(Boolean);
  const errors: string[] = [];
  if (text.length > 20000) errors.push('This list is too large. Use up to 50 names, with 24 characters per name.');
  if (names.length < 2) errors.push('Add at least two players.');
  if (names.length > 50) errors.push(`There are ${names.length} players. The limit is 50; no one has been removed. Shorten the list to continue.`);
  const tooLong = names.findIndex(n => graphemeCount(n) > 24);
  if (tooLong >= 0) errors.push(`Name on line ${tooLong + 1} is longer than 24 characters. Shorten it to continue; it has not been cut off.`);
  if (names.some(hasControls)) errors.push('Remove invisible control characters from the names.');
  // Reuse exact entries first (including reordered names), then edited rows.
  const used = new Set<string>();
  const allocated = names.map(label => {
    const match = previous.find(p => p.label === label && !used.has(p.id));
    if (match) used.add(match.id);
    return match;
  });
  let next = Math.max(0, ...previous.map(p => Number(p.id.replace('player-', '')) || 0));
  const players = names.map((label, i) => {
    let id = allocated[i]?.id;
    if (!id && previous[i] && !used.has(previous[i]!.id)) id = previous[i]!.id;
    if (!id) id = `player-${++next}`;
    used.add(id);
    return { id, label };
  });
  return { players, errors, duplicate: new Set(names).size !== names.length };
}

export function displayLabel(player: Player, players: readonly Player[]): string {
  const matches = players.filter(p => p.label === player.label);
  return matches.length > 1 ? `${player.label} · #${player.id.replace('player-', '')}` : player.label;
}
