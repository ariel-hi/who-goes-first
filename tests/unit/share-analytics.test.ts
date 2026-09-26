import { afterEach, describe, expect, test, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { analytics } from '../../src/lib/analytics';

const script = readFileSync('public/analytics-consent.js', 'utf8');

function setup(saved: Record<string, string> = {}, cleanupFails = false) {
  const listeners = new Map<string, (event: { detail?: unknown }) => void>();
  const clicks = new Map<string, () => void>();
  const dataLayer: IArguments[] = [];
  let reloads = 0;
  const elements = new Map(['consent', 'settings', 'allow', 'decline'].map(name => [`[data-analytics-${name}]`, {
    hidden: true, focus() {},
    addEventListener(_type: string, callback: () => void) { clicks.set(name, callback); },
  }]));
  const location = { origin: 'https://whogoesfirst.fun', pathname: '/', search: '?names=Private', hash: '#winner', hostname: 'whogoesfirst.fun', reload() { reloads++; } };
  const document = {
    title: 'Who Goes First?', cookie: '_ga=old',
    querySelector(selector: string) { return elements.get(selector); },
    addEventListener(type: string, callback: (event: { detail?: unknown }) => void) { listeners.set(type, callback); },
    head: { append() {} }, createElement() { return {}; },
  };
  const window = {
    document, location, URLSearchParams, dataLayer,
    localStorage: { getItem(key: string) { return saved[key] ?? null; }, setItem(key: string, value: string) { saved[key] = value; } },
    history: { state: null, replaceState() { if (cleanupFails) throw Error('blocked'); } },
  };
  runInNewContext(script, { globalThis: window, Date });
  return {
    share(detail: unknown) { listeners.get('wgf:share-completed')!({ detail }); },
    click(name: string) { clicks.get(name)!(); },
    events: () => dataLayer.filter(args => args[0] === 'event').map(args => Array.from(args)),
    config: () => dataLayer.find(args => args[0] === 'config'),
    reloads: () => reloads,
  };
}

describe('sharing measurement consent boundary', () => {
  test('does not replay earlier shares or accept the previous page-view-only choice', () => {
    const app = setup({ 'wgf:analytics-choice:v1': 'allow' });
    app.share('tool');
    expect(app.config()).toBeUndefined();
    app.click('allow');
    expect(app.events()).toEqual([]);
    app.share('tool');
    expect(app.events()).toEqual([['event', 'share', {
      method: 'link', content_type: 'tool', item_id: 'first_player_picker',
      page_location: 'https://whogoesfirst.fun/', page_title: 'Who Goes First?', send_to: 'G-XDVR78FJXY',
    }]]);
  });

  test('drops arbitrary payloads and stops immediately when consent is withdrawn', () => {
    const app = setup({ 'wgf:analytics-choice:v2': 'allow' });
    app.share({ kind: 'tool', names: ['Private'] });
    app.share('Private');
    expect(app.events()).toEqual([]);
    app.share('tool');
    app.click('decline');
    app.share('tool');
    expect(app.events()).toHaveLength(1);
    expect(JSON.stringify(app.events())).not.toMatch(/Private|winner/);
    expect(app.reloads()).toBe(1);
  });

  test('cannot send a share when URL cleanup prevents analytics from loading', () => {
    const app = setup({ 'wgf:analytics-choice:v2': 'allow' }, true);
    app.share('tool');
    expect(app.events()).toEqual([]);
  });
});

afterEach(() => vi.unstubAllGlobals());
test('the picker transport forwards only a fixed share label', () => {
  const dispatchEvent = vi.fn();
  vi.stubGlobal('document', { dispatchEvent });
  vi.stubGlobal('CustomEvent', class { constructor(public type: string, public init: { detail: unknown }) {} });
  analytics.emit('pick_started', { mode: 'quick', policy: 'equal-chance' });
  analytics.emit('share_completed', { kind: 'tool', names: ['Private'] } as { kind: 'tool' });
  expect(dispatchEvent).toHaveBeenCalledTimes(1);
  expect(dispatchEvent.mock.calls[0]?.[0]).toEqual({ type: 'wgf:share-completed', init: { detail: 'tool' } });
});
