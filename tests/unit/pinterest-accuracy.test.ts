import { expect, test } from 'vitest';
import { getCatalog } from '../../src/lib/content/catalog';
import { pinQueue } from '../../src/lib/pinterest-pins';

test('queued campaigns do not recommend choosing a starter when their approved rule excludes it', () => {
  const catalog = new Map(getCatalog().map(rule => [`/games/${rule.slug}/`, rule]));
  const excluded = pinQueue().filter(pin => {
    const rule = catalog.get(pin.path);
    return rule && (rule.pickerSuggestionApplicable === false || rule.tieBreakApplicable === false);
  });
  expect(excluded.map(pin => pin.id)).toContain('game-sushi-go-2014-en');
  expect(excluded.map(pin => pin.id)).toContain('game-7-wonders-2020-en');
  for (const pin of excluded) {
    const rule = catalog.get(pin.path)!;
    expect(pin.description).not.toContain('a fair picker for ties');
    expect(pin.art.cta).toBe('Full rule + source');
    expect(pin.body).toBe(rule.firstPlayerRule);
    expect(pin.art.body).toBe(rule.firstPlayerRule);
    expect(pin.description).toContain(rule.editionLabel);
    expect(pin.description).toContain('rulebook source');
  }
});

test('already-released first-day game campaigns retain their original picker copy and identities', () => {
  const firstDay = pinQueue().filter(pin => pin.date === '2026-10-01');
  expect(firstDay.map(pin => pin.id)).toEqual([
    'game-catan-2020-en', 'game-ticket-to-ride-2015-en', 'game-uno-10020-sn70-en',
    'game-carcassonne-2021-en', 'game-monopoly-classic-hasbro-c1009-en',
  ]);
  for (const pin of firstDay) {
    expect(pin.campaign).toBe('game_rule_pin');
    expect(pin.art.cta).toBe('Full rule + fair picker');
    expect(pin.description).toContain('with its rulebook source and a fair picker for ties.');
  }
});

test('November replenishment follows the existing queue with distinct sourced rules', () => {
  const queue = pinQueue();
  const catalog = new Map(getCatalog().map(rule => [rule.slug, rule]));
  expect(queue[147]).toMatchObject({ id: 'game-star-realms-white-wizard-en', date: '2026-10-30' });
  const added = queue.slice(148);
  expect(added).toHaveLength(20);
  expect(new Set(added.map(pin => pin.id)).size).toBe(20);
  expect(added.at(0)?.date).toBe('2026-10-30');
  expect(added.at(-1)?.date).toBe('2026-11-03');
  for (const pin of added) {
    const rule = catalog.get(pin.id.slice('game-'.length));
    expect(rule?.sources.length).toBeGreaterThan(0);
    expect(pin.path).toBe(`/games/${rule?.slug}/`);
    expect(pin.body).toBe(rule?.firstPlayerRule);
  }
});
