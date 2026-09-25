import { expect, test } from 'vitest';
import { createRevealPlan, playerColor } from '../../src/lib/reveal-plan';
import { revealDuration, supportsGroup } from '../../src/lib/presentations';
import { seats } from '../../src/lib/roster';
import { select } from '../../src/lib/selection';

function random(seed: number) {
  return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 2 ** 32; };
}

test('large groups keep the compact reveals and result timing follows the last visible action', () => {
  expect(['quick', 'instant', 'dice', 'coin'].filter(mode => supportsGroup(mode, 13))).toEqual(['quick', 'instant', 'dice', 'coin']);
  expect(['quick', 'instant', 'dice', 'coin'].filter(mode => supportsGroup(mode, 50))).toEqual(['quick', 'instant']);
  const outcome = select(seats(4), 1, () => 2);
  const plan = createRevealPlan(outcome, random(92));
  const pieces = Object.values(plan);
  expect(revealDuration('balloon', plan)).toBe(Math.max(...pieces.map(piece => (piece.popAt ?? 0) + 600)) + 120);
  expect(revealDuration('dice', plan)).toBe(Math.max(...pieces.map(piece => piece.diceAt + 1920)) + 120);
  expect(revealDuration('balloon', plan)).toBeLessThan(3600);
  expect(revealDuration('dice', plan)).toBeLessThan(2300);
  expect(revealDuration('shells', plan)).toBeLessThan(1900);
  expect(revealDuration('quick', plan)).toBe(1242);
  const large = select(seats(50), 2, () => 12);
  expect(revealDuration('quick', createRevealPlan(large, () => .5))).toBe(1530);
});

test('every supported player has a distinct color that follows their identity', () => {
  const players = seats(50);
  const colors = players.map(playerColor);
  expect(new Set(colors).size).toBe(50);
  for (const player of [...players].reverse()) expect(playerColor({ ...player, label: 'Renamed' })).toBe(colors[players.indexOf(player)]);
});

test('balloons shuffle with uneven gaps; cards overlap in a fresh order each draw', () => {
  const outcome = select(seats(12), 1, () => 4);
  const plan = createRevealPlan(outcome, random(92));
  const next = createRevealPlan(outcome, random(109));
  const pops = outcome.players.filter(player => player.id !== outcome.winnerId).map(player => plan[player.id]!.popAt!);
  expect(plan[outcome.winnerId]!.popAt).toBeNull();
  expect(pops).not.toEqual([...pops].sort((a, b) => a - b));
  const sorted = [...pops].sort((a, b) => a - b);
  expect(new Set(sorted.slice(1).map((time, i) => time - sorted[i]!)).size).toBeGreaterThan(5);
  expect(new Set(outcome.players.filter(player => player.id !== outcome.winnerId).map(player => plan[player.id]!.balloon.style)).size).toBe(4);
  const flips = outcome.players.map(player => plan[player.id]!.flipAt);
  expect(flips).not.toEqual([...flips].sort((a, b) => a - b));
  expect(Math.max(...flips)).toBeLessThan(Math.min(...Object.values(plan).map(p => p.flipAt + p.flipDuration)));
  expect(next).not.toEqual(plan);
  expect(outcome.winnerId).toBe('player-5');
  const star = plan[outcome.winnerId]!;
  for (const player of outcome.players.filter(player => player.id !== outcome.winnerId)) {
    const card = plan[player.id]!;
    expect(star.flipAt).toBeGreaterThan(card.flipAt);
    expect(star.flipAt + star.flipDuration).toBeGreaterThan(card.flipAt + card.flipDuration);
  }
});

test('every animation finishes within its deadline', () => {
  for (let count = 2; count <= 12; count++) for (let winner = 0; winner < count; winner++) {
    const outcome = select(seats(count), 1, () => winner);
    const plan = createRevealPlan(outcome, random(192 + count * 40 + winner));
    const star = plan[outcome.winnerId]!;
    for (const player of outcome.players) {
      const p = plan[player.id]!;
      if (p.popAt !== null) { expect(p.popAt).toBeGreaterThanOrEqual(1100); expect(p.popAt + 600).toBeLessThan(3600); }
      expect(p.flipAt + p.flipDuration).toBeLessThan(2600);
      expect(p.coin.delay + p.coin.duration).toBeLessThan(2800);
      expect(Math.abs(p.coin.turn) % 360).toBe(0);
      expect([4, 5, 6, -4, -5, -6]).toContain(p.spinnerTurns);
      expect(Math.abs(p.spinnerOffset)).toBeGreaterThanOrEqual(.09);
      expect(Math.abs(p.spinnerOffset)).toBeLessThan(.34);
      expect(p.balloon.bobDuration).toBeGreaterThanOrEqual(1300);
      expect(p.shell.delay + 820).toBeLessThan(1700);
      if (player.id !== outcome.winnerId) {
        expect(star.flipAt).toBeGreaterThan(p.flipAt);
        expect(star.flipAt + star.flipDuration).toBeGreaterThan(p.flipAt + p.flipDuration);
      }
    }
  }
});
