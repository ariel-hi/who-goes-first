import { expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const script = readFileSync('public/google-tags.js', 'utf8');
function run(ads: boolean, saved: Record<string, string> = {}, cleanupFails = false) {
  const order: string[] = [];
  const scripts: string[] = [];
  const dataLayer: IArguments[] = [];
  const listeners = new Map<string, (event: { target: Element }) => void>();
  class Element { closest(selector: string) { return selector === '[data-analytics-off]'; } }
  const status = { textContent: '' };
  const document = {
    currentScript: { dataset: { client: 'ca-pub-1234567890123456', ads: ads ? 'on' : 'off' } },
    title: 'Public rule', cookie: '_ga=old',
    head: { append(node: { src: string }) { order.push('script'); scripts.push(node.src); } },
    createElement() { return {}; },
    querySelector() { return status; },
    addEventListener(type: string, callback: (event: { target: Element }) => void) { listeners.set(type, callback); },
  };
  const window = {
    document, dataLayer, URLSearchParams, Element, frames: { googlefcPresent: true },
    location: { origin: 'https://whogoesfirst.fun', hostname: 'whogoesfirst.fun', pathname: '/games/test/', search: '?utm_source=bluesky&utm_medium=organic_social&utm_campaign=game_rules&names=Private', hash: '#q=Private' },
    localStorage: { getItem(key: string) { return saved[key] ?? null; }, setItem(key: string, value: string) { saved[key] = value; } },
    history: { state: null, replaceState(_state: unknown, _title: string, url: string) { if (cleanupFails) throw Error('blocked'); order.push(url); } },
  };
  runInNewContext(script, { globalThis: window, Date });
  return { scripts, order, dataLayer, window, saved, optOut: () => listeners.get('click')!({ target: new Element() }), status };
}

test('ads mode keeps picker pages ad free and cleans private query values before third-party scripts', () => {
  const page = run(false);
  expect(page.order[0]).toBe('/games/test/#q=Private');
  expect(page.scripts.some(url => url.includes('adsbygoogle'))).toBe(false);
  expect(page.scripts.some(url => url.includes('fundingchoicesmessages'))).toBe(true);
  const config = page.dataLayer.find(args => args[0] === 'config')![2];
  expect(config).toMatchObject({ page_location: 'https://whogoesfirst.fun/games/test/', campaign_source: 'bluesky' });
  expect(JSON.stringify(config)).not.toMatch(/Private|names|#q/);
  expect(run(true).scripts.some(url => url.includes('adsbygoogle'))).toBe(true);
  expect(run(true, {}, true).scripts).toEqual([]);
});

test('ads mode preserves current and legacy analytics opt-outs', () => {
  for (const key of ['wgf:analytics-choice:v1', 'wgf:analytics-choice:v2']) {
    const page = run(true, { [key]: 'decline' });
    expect(page.scripts.some(url => url.includes('googletagmanager'))).toBe(false);
    expect(page.dataLayer.some(args => args[0] === 'config')).toBe(false);
    expect(page.scripts.some(url => url.includes('adsbygoogle'))).toBe(true);
  }
  const page = run(true);
  page.optOut();
  expect(page.saved['wgf:analytics-choice:v2']).toBe('decline');
  expect(page.window).toHaveProperty('ga-disable-G-XDVR78FJXY', true);
  expect(page.status.textContent).toBe('Analytics is off on this device.');
});
