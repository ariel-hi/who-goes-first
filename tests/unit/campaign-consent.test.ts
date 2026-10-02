import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { pinQueue } from '../../src/lib/pinterest-pins';
import { socialCampaignNames } from '../../src/lib/social-attribution';

const script = readFileSync('public/analytics-consent.js', 'utf8');

function runCampaign(search: string, savedChoice: string | null, hash = '', pathname = '/games/', campaignDataset: string | undefined = JSON.stringify(socialCampaignNames())) {
  const order: string[] = [];
  const elements = new Map(['[data-analytics-consent]', '[data-analytics-settings]', '[data-analytics-allow]', '[data-analytics-decline]'].map(selector => [selector, {
    hidden: true,
    addEventListener() { /* no click in this test */ },
    focus() { /* no click in this test */ },
  }]));
  const document = {
    currentScript: { dataset: { campaigns: campaignDataset } },
    addEventListener() { /* share bridge tested separately */ },
    title: 'Who Goes First?',
    head: { append() { order.push('tag requested'); } },
    createElement() { return { async: false, src: '' }; },
    querySelector(selector: string) { return elements.get(selector); },
  };
  const location = { origin: 'https://whogoesfirst.fun', hostname: 'whogoesfirst.fun', pathname, search, hash };
  const window = {
    document,
    location,
    URLSearchParams,
    history: { state: null, replaceState(_state: null, _title: string, path: string) { order.push(`cleaned ${path}`); } },
    localStorage: { getItem() { return savedChoice; } },
    dataLayer: [] as IArguments[],
  };
  runInNewContext(script, { globalThis: window, URLSearchParams, Date });
  const config = window.dataLayer.find(args => args[0] === 'config');
  return { config: config?.[2] as Record<string, unknown> | undefined, order, panel: elements.get('[data-analytics-consent]')! };
}

describe('consented campaign attribution', () => {
  test('attributes every reviewed Pinterest campaign after consent using the rendered finite list', () => {
    for (const name of new Set(pinQueue().map(pin => pin.campaign))) {
      const search = `?utm_source=pinterest&utm_medium=organic_social&utm_campaign=${name}&names=Private`;
      expect(runCampaign(search, 'allow').config).toMatchObject({ campaign_source: 'pinterest', campaign_medium: 'organic_social', campaign_name: name });
      expect(runCampaign(search, null).config).toBeUndefined();
      expect(runCampaign(search, 'decline').config).toBeUndefined();
    }
    const result = runCampaign('?utm_source=pinterest&utm_medium=organic_social&utm_campaign=private_player_name', 'allow');
    expect(result.config).not.toHaveProperty('campaign_name');
    expect(JSON.stringify(result.config)).not.toContain('private_player_name');
  });
  test('malformed or missing rendered configuration falls back to legacy labels', () => {
    for (const dataset of ['', '{broken', '{"private_player_name":true}', '["tool_coin_flip",12]']) {
      const search = '?utm_source=pinterest&utm_medium=organic_social&utm_campaign=tool_coin_flip';
      expect(runCampaign(search, 'allow', '', '/coin-flip/', dataset).config).not.toHaveProperty('campaign_name');
      expect(runCampaign(search.replace('tool_coin_flip', 'game_rules'), 'allow', '', '/coin-flip/', dataset).config?.campaign_name).toBe('game_rules');
    }
  });
  test('sends only fixed campaign labels and a clean page address', () => {
    const result = runCampaign('?utm_source=pinterest&utm_medium=organic_social&utm_campaign=game_rules&player=secret', 'allow');
    expect(result.config).toMatchObject({
      page_location: 'https://whogoesfirst.fun/games/',
      campaign_source: 'pinterest', campaign_medium: 'organic_social', campaign_name: 'game_rules',
    });
    expect(JSON.stringify(result.config)).not.toContain('secret');
    expect(result.order).toEqual(['cleaned /games/', 'tag requested']);
  });

  test('does not pass unknown or user-supplied campaign values', () => {
    const result = runCampaign('?utm_source=player-name&utm_medium=organic_social&utm_campaign=game_rules', 'allow');
    expect(result.config).not.toHaveProperty('campaign_source');
    expect(result.config?.page_location).toBe('https://whogoesfirst.fun/games/');
  });

  test('does not load analytics before consent', () => {
    const result = runCampaign('?utm_source=bluesky&utm_medium=organic_social&utm_campaign=game_rules', null);
    expect(result.config).toBeUndefined();
    expect(result.order).toEqual([]);
    expect(result.panel.hidden).toBe(false);
  });

  test('initial consented configuration excludes bookmarked searches and keeps their fragment during campaign cleanup', () => {
    const hash = '#q=%E5%9B%9B%E5%AD%A3%20private&filter=pending';
    const result = runCampaign('?utm_source=bluesky&utm_medium=organic_social&utm_campaign=game_rules&private=secret', 'allow', hash, '/board-games/');
    expect(result.config?.page_location).toBe('https://whogoesfirst.fun/board-games/');
    expect(JSON.stringify(result.config)).not.toMatch(/private|secret|filter|%E5/);
    expect(result.order).toEqual([`cleaned /board-games/${hash}`, 'tag requested']);
    const unconsented = runCampaign('', null, hash, '/board-games/');
    expect(unconsented.config).toBeUndefined();
    expect(unconsented.order).toEqual([]);
  });
});
