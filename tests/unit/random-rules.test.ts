import { expect, test } from 'vitest';
import { getCatalog, readRecords } from '../../src/lib/content/catalog';
import { publicRule, ruleSchema } from '../../src/lib/content/schema';
import { randomRuleEligible } from '../../src/lib/content/random-rules';
import pool from '../../src/content/random-rule-pool.json';

test('every random suggestion has an approved source review for this exact revision', () => {
  const catalog = getCatalog();
  const eligible = catalog.filter(randomRuleEligible);
  expect(eligible.length).toBe(Object.keys(pool.revisions).length);
  expect(eligible.length).toBeGreaterThan(50);
  expect(eligible.some(rule => rule.id === 'azul-2018-en')).toBe(true);
});

test('simultaneous play, assigned roles, components and circular random rules stay out', () => {
  const research = readRecords('research/games').map(raw => publicRule(ruleSchema.parse(raw)));
  for (const id of ['sushi-go-2014-en', '7-wonders-2020-en', 'chomp-gamewright-en', 'codenames-2025-en', 'the-crew-2019-en', 'pandemic-2013-en', 'kingdomino-2016-en', 'uno-10020-sn70-en', 'wingspan-online-en', 'three-of-a-crime-gamewright-en']) {
    const rule = research.find(rule => rule.id === id)!;
    expect(rule, id).toBeDefined();
    expect(randomRuleEligible(rule), id).toBe(false);
  }
  expect(getCatalog().find(rule => rule.id === 'sushi-go-2014-en')).toBeDefined();
});

test('unreviewed additions and changed answers or sources fail closed', () => {
  const rule = getCatalog().find(rule => rule.id === 'azul-2018-en')!;
  expect(randomRuleEligible({ ...rule, id: 'new-unreviewed-game' })).toBe(false);
  expect(randomRuleEligible({ ...rule, firstPlayerRule: 'Everyone starts simultaneously.' })).toBe(false);
  expect(randomRuleEligible({ ...rule, sources: [{ ...rule.sources[0]!, url: 'https://publisher.example/other-edition.pdf' }] })).toBe(false);
  expect(randomRuleEligible({ ...rule, materiallyUpdatedAt: '2026-09-19' })).toBe(true);
});
