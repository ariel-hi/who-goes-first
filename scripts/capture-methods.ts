import { chromium, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
const directory = 'artifacts/screenshots/refinement';
mkdirSync(directory, { recursive: true });
const browser = await chromium.launch();
const errors: string[] = [];
try {
  const captures: [string, string, number][] = [['spinner', '.spinner-stage', 4], ['cards', '.cards-reveal', 4], ['towers', '.tower-reveal', 4], ['balloon', '.balloon-field', 4], ['straws', '.straws-reveal', 4], ['dice', '.dice-reveal', 4], ['coin', '.coin-reveal', 4], ['shells', '.shells-reveal', 4], ['cards', '.cards-reveal', 12], ['balloon', '.balloon-field', 12]];
  for (const [method, stage, count] of captures) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    // String source avoids transpiler-generated helper references in the page.
    await page.addInitScript({ content: `
      const original = crypto.getRandomValues.bind(crypto);
      Object.defineProperty(crypto, 'getRandomValues', { configurable: true, value: (array) => {
        if (array instanceof Uint32Array && array.length === 1) { array[0] = 2; return array; }
        return original(array);
      } });
    ` });
    await page.clock.install({ time: new Date('2026-09-22T12:00:00Z') });
    await page.goto(`http://127.0.0.1:4322/methods/${method}/`);
    await expect(page.getByRole('button', { name: 'Pick a player' })).toBeEnabled();
    await page.getByLabel('Player count', { exact: true }).selectOption(String(count));
    expect(await page.evaluate(() => crypto.getRandomValues(new Uint32Array(1))[0])).toBe(2);
    for (const [index, name] of ['Magnificent Eucalyptus', '王芳', 'Ari', 'Jo'].entries()) await page.getByLabel(`Name for player ${index + 1}`, { exact: true }).fill(name);
    await page.clock.pauseAt(new Date('2026-09-22T12:30:00Z'));
    const downloaded = page.waitForResponse(response => /(?:TableReveals|BalloonRise).*\.js/.test(response.url()));
    await page.getByRole('button', { name: 'Pick a player' }).click({ force: true });
    await downloaded;
    await page.clock.runFor(500);
    await expect(page.locator(stage!)).toBeVisible();
    const suffix = count === 12 ? '-12' : '';
    const sceneTime = count === 12 ? method === 'cards' ? 1250 : 2100 : 3200;
    await page.evaluate(time => document.getAnimations().forEach(animation => { animation.pause(); animation.currentTime = time; }), sceneTime);
    await page.screenshot({ path: `${directory}/mobile-${method}${suffix}-controlled.png`, fullPage: true });
    await page.getByRole('button', { name: 'Show result now' }).click({ force: true });
    await page.clock.runFor(100);
    await expect(page.locator('.winner-announcement')).toContainText('Ari goes first.');
    await page.screenshot({ path: `${directory}/mobile-${method}${suffix}-result.png`, fullPage: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await context.close();
  }
  expect(errors).toEqual([]);
  console.log('Captured method screenshots, including twelve-player flips and pops. Persistent scenes, text results and mobile reflow verified; no page errors.');
} finally { await browser.close(); }
