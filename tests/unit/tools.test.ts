import { describe, expect, it } from 'vitest';
import { flipCoin, parseNames, rpsWinner, shuffle, splitTeams } from '../../src/lib/tools';

const sequence = (...words: number[]) => { let i = 0; return () => words[i++ % words.length]!; };

describe('decision tools', () => {
  it('shuffles without losing or duplicating entries', () => {
    const names = ['a', 'b', 'c', 'd', 'e'];
    const result = shuffle(names, sequence(7, 3, 11, 2));
    expect([...result].sort()).toEqual(names);
    expect(names).toEqual(['a', 'b', 'c', 'd', 'e']);
  });
  it('splits teams evenly and keeps every name', () => {
    const teams = splitTeams(['a', 'b', 'c', 'd', 'e', 'f', 'g'], 3, sequence(5, 1, 9));
    expect(teams.map(team => team.length).sort()).toEqual([2, 2, 3]);
    expect(teams.flat().sort()).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
    expect(() => splitTeams(['a'], 2)).toThrow();
  });
  it('parses names from lines and commas', () => {
    expect(parseNames('Alex, Sam\n\n  Jordan \n,')).toEqual(['Alex', 'Sam', 'Jordan']);
  });
  it('detects extra names without building an unbounded roster', () => {
    const roster = Array.from({ length: 5000 }, (_, i) => 'Player ' + (i + 1)).join(',\n');
    const names = parseNames(roster, true);
    expect(names).toHaveLength(201);
    expect(names[200]).toBe('Player 201');
    expect(parseNames(roster)).toHaveLength(200);
    expect(parseNames(' 王芳,👨‍👩‍👧‍👦\n王芳 ', true)).toEqual(['王芳', '👨‍👩‍👧‍👦', '王芳']);
    expect(parseNames(' ,\n ' + Array.from({ length: 200 }, (_, i) => 'Player ' + (i + 1)).join(', ,\n'), true)).toHaveLength(200);
  });
  it('flips both sides', () => {
    expect(flipCoin(() => 0)).toBe('heads');
    expect(flipCoin(() => 1)).toBe('tails');
  });
  it('scores rock paper scissors', () => {
    expect(rpsWinner('rock', 'scissors')).toBe(1);
    expect(rpsWinner('rock', 'paper')).toBe(2);
    expect(rpsWinner('paper', 'paper')).toBe(0);
  });
});
