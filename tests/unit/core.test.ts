import { describe, expect, test } from 'vitest';
import { randomIndex, randomCollectionIndex, select } from '../../src/lib/selection';
import { spinnerRotation } from '../../src/lib/presentations';
import { displayLabel, graphemeCount, parseNames, seats } from '../../src/lib/roster';
import { pickerReducer } from '../../src/lib/state';
import { defaults, readPreferences, writePreferences, clearPreferences } from '../../src/lib/preferences';
import { cleanLink } from '../../src/lib/share';
import { siteSettings } from '../../src/lib/site';
import { createAnalytics } from '../../src/lib/analytics';

describe('uniform selection', () => {
  test('large compendium selection has no roster cap and still rejects biased words', () => {
    expect(randomCollectionIndex(1320, () => 1319)).toBe(1319);
    const words = [4294967295, 800];
    expect(randomCollectionIndex(1320, () => words.shift()!)).toBe(800);
    expect(() => randomCollectionIndex(0)).toThrow();
    expect(() => randomCollectionIndex(2 ** 32 + 1)).toThrow();
  });
  test('spinner geometry ends with every selected slice centered under the pin', () => {
    for (let count = 2; count <= 12; count++) for (let winner = 0; winner < count; winner++) {
      expect((spinnerRotation(winner, count) + winner * 360 / count) % 360).toBeCloseTo(0);
    }
  });
  test.each([1, 2, 3, 12, 13, 50])('every position is reachable for %i candidates', n => {
    for (let i = 0; i < n; i++) expect(randomIndex(n, () => i)).toBe(i);
  });
  test('rejects the incomplete bucket rather than using modulo bias', () => {
    const words = [4294967295, 4294967294, 5];
    expect(randomIndex(3, () => words.shift()!)).toBe(2);
    expect(words).toHaveLength(1); // only 2^32 - 1 is rejected for 3
    const sequence = [4294967295, 4294967294, 17];
    expect(randomIndex(50, () => sequence.shift()!)).toBe(17);
    expect(sequence).toHaveLength(0);
  });
  test.each([0, 51, -1, 2.5, NaN])('rejects invalid size %s', n => expect(() => randomIndex(n)).toThrow());
  test('source errors and impossible streams fail visibly', () => {
    expect(() => randomIndex(2, () => { throw new Error('Blocked'); })).toThrow('Blocked');
    expect(() => randomIndex(3, () => 4294967295)).toThrow('did not complete');
    expect(() => randomIndex(2, () => -1)).toThrow('Invalid');
  });
  test('snapshot cannot be altered and repeat winners are allowed', () => {
    const roster = seats(4); const one = select(roster, 1, () => 1); const two = select(roster, 2, () => 1);
    roster[1] = { id: 'replacement', label: 'Changed' };
    expect(one.players[1]!.label).toBe('Seat 2'); expect(one.winnerId).toBe(two.winnerId);
    expect(Object.isFrozen(one.players[1])).toBe(true);
  });
});
describe('roster', () => {
  test('Unicode, blank lines, stable IDs and duplicate labels', () => {
    const parsed = parseNames('  王芳\r\n\r\nSam\nSam\n👨‍👩‍👧‍👦');
    expect(parsed.errors).toEqual([]); expect(parsed.players).toHaveLength(4); expect(parsed.duplicate).toBe(true);
    expect(graphemeCount('👨‍👩‍👧‍👦')).toBe(1);
    const reordered = parseNames('Sam\n王芳\nSam\nFamily', parsed.players);
    expect(reordered.players.map(p => p.id)).toEqual(['player-2', 'player-1', 'player-3', 'player-4']);
    expect(displayLabel(reordered.players[0]!, reordered.players)).toBe('Sam · #2');
  });
  test('never truncates long names or excessive rosters', () => {
    expect(parseNames('a'.repeat(25) + '\nBo').players[0]!.label).toHaveLength(25);
    expect(parseNames('a'.repeat(25) + '\nBo').errors.join()).toContain('24');
    const parsed = parseNames(Array.from({ length: 51 }, (_, i) => `Person ${i}`).join('\n'));
    expect(parsed.players).toHaveLength(51); expect(parsed.errors.join()).toContain('51');
    expect(parseNames('Only me').errors.join()).toContain('two');
  });
});
test('duplicate finish/start and edits cannot change a locked draw', () => {
  const outcome = select(seats(4), 1, () => 2);
  const revealing = pickerReducer({ phase: 'ready', outcome: null }, { type: 'START', outcome });
  expect(pickerReducer(revealing, { type: 'EDIT', valid: true })).toBe(revealing);
  expect(pickerReducer(revealing, { type: 'START', outcome: select(seats(4), 2, () => 0) })).toBe(revealing);
  expect(pickerReducer(revealing, { type: 'FINISH', drawId: 2 })).toBe(revealing);
  const done = pickerReducer(revealing, { type: 'FINISH', drawId: 1 });
  expect(done.phase).toBe('result'); expect(done.outcome).toBe(outcome);
  expect(pickerReducer(done, { type: 'FINISH', drawId: 1 })).toBe(done);
});
test('storage is validated and fails safely', () => {
  let value: string | null = null;
  const storage = { getItem: () => value, setItem: (_: string, text: string) => { value = text; }, removeItem: () => { value = null; } };
  expect(writePreferences(storage, { ...defaults, remember: true, roster: seats(4) })).toBe(true);
  expect(readPreferences(storage).value.roster).toEqual(seats(4));
  value = '{broken'; expect(readPreferences(storage).warning).toBeTruthy(); expect(value).toBeNull();
  const blocked = { getItem: () => { throw Error(); }, setItem: () => { throw Error(); }, removeItem: () => { throw Error(); } };
  expect(readPreferences(blocked).value).toEqual(defaults); expect(writePreferences(blocked, defaults)).toBe(false); expect(clearPreferences(blocked)).toBe(false);
});
test('clean sharing contains no private state', () => expect(cleanLink('https://host.test/?names=Sam#Seat2')).toBe('https://host.test/'));
test('telemetry drops private extras and invalid values; a failed sink is harmless', () => {
  const events: unknown[] = [];
  const adapter = createAnalytics((event, data) => events.push({ event, data }));
  const context = { mode: 'quick' as const, policy: 'equal-chance' as const, names: ['Private'] };
  adapter.emit('pick_started', context);
  adapter.emit('rule_to_picker', { gameId: 'private-name' });
  expect(events).toEqual([{ event: 'pick_started', data: { mode: 'quick', policy: 'equal-chance' } }]);
  expect(() => createAnalytics(() => { throw Error(); }).emit('share_completed', { kind: 'tool' })).not.toThrow();
});
test('release config rejects placeholders and private URL state', () => {
  expect(() => siteSettings({ DEPLOY_CONTEXT: 'production' })).toThrow();
  expect(() => siteSettings({ DEPLOY_CONTEXT: 'production', SITE_URL: 'https://example.com' })).toThrow();
  expect(() => siteSettings({ SITE_URL: 'https://host.test/?name=Bo' })).toThrow();
  expect(siteSettings({ DEPLOY_CONTEXT: 'production', SITE_URL: 'https://firstplayer.site' }).production).toBe(true);
});
