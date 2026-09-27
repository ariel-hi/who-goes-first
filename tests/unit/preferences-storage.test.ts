import { expect, test } from 'vitest';
import { defaults, readPreferences, writePreferences, type Preferences } from '../../src/lib/preferences';

function stored(text: string | null) {
  const state = { text, writes: 0, removes: 0 };
  return { state, port: {
    getItem: () => state.text,
    setItem: (_: string, value: string) => { state.text = value; state.writes++; },
    removeItem: () => { state.text = null; state.removes++; },
  } };
}
const group: Preferences = { ...defaults, remember: true, inputMode: 'names', roster: [
  { id: 'player-1', label: '王芳' }, { id: 'player-2', label: '王芳' },
] };

test('saved groups reject extra private fields, duplicate identities and missing consent', () => {
  const invalid: unknown[] = [
    { ...group, names: ['Private'] },
    { ...group, roster: [{ ...group.roster![0]!, secret: 'Private' }, group.roster![1]!] },
    { ...group, roster: [group.roster![0]!, group.roster![0]!] },
    { ...group, remember: false },
  ];
  for (const raw of invalid) {
    const read = stored(JSON.stringify(raw));
    expect(readPreferences(read.port)).toEqual({
      value: defaults, warning: 'Saved settings could not be read. You can keep playing on this page.',
    });
    expect(read.state).toEqual({ text: null, writes: 0, removes: 1 });
    const write = stored(null);
    expect(writePreferences(write.port, raw as Preferences)).toBe(false);
    expect(write.state).toEqual({ text: null, writes: 0, removes: 0 });
  }
});

test('saved labels preserve duplicate Unicode names and enforce grapheme and code-unit bounds', () => {
  const combining = ('a' + '\u0301'.repeat(19)).repeat(24) + '\u0301'.repeat(20);
  const validLabels = ['👨‍👩‍👧‍👦'.repeat(24), combining];
  const invalidLabels = ['👨‍👩‍👧‍👦'.repeat(25), combining + '\u0301', ' 王芳', '王芳\u202e'];
  for (const label of validLabels) {
    const value = { ...group, roster: group.roster!.map(player => ({ ...player, label })) };
    const storage = stored(null);
    expect(writePreferences(storage.port, value)).toBe(true);
    expect(readPreferences(storage.port)).toEqual({ value, warning: '' });
  }
  for (const label of invalidLabels) {
    const value = { ...group, roster: group.roster!.map(player => ({ ...player, label })) };
    const storage = stored(JSON.stringify(value));
    expect(readPreferences(storage.port).value).toEqual(defaults);
    expect(storage.state.removes).toBe(1);
    expect(writePreferences(storage.port, value)).toBe(false);
  }
});

test('unknown or missing saved modes fall back without discarding a consented group', () => {
  for (const mode of ['removed-mode', null, 42, undefined]) {
    const storage = stored(JSON.stringify({ ...group, mode }));
    expect(readPreferences(storage.port)).toEqual({
      value: { ...group, mode: 'quick' }, warning: 'Your saved reveal is unavailable. Quick is selected.',
    });
    expect(storage.state.removes).toBe(0);
    expect(writePreferences(storage.port, { ...group, mode } as unknown as Preferences)).toBe(true);
    expect(JSON.parse(storage.state.text!)).toEqual({ ...group, mode: 'quick' });
  }
});

test('the stored-text limit accepts 35000 code units and rejects the next one', () => {
  const text = JSON.stringify(group).padEnd(35000, ' ');
  const boundary = stored(text);
  expect(readPreferences(boundary.port)).toEqual({ value: group, warning: '' });
  expect(boundary.state.removes).toBe(0);
  const overflow = stored(text + ' ');
  expect(readPreferences(overflow.port).value).toEqual(defaults);
  expect(overflow.state).toEqual({ text: null, writes: 0, removes: 1 });
});
