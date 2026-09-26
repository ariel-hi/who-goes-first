import { test, expect, type Page } from '@playwright/test';

const names = ['Mina', '王芳', '王芳', 'Alex', 'Jules', 'Noor', 'Sam', 'André', 'Ravi', 'Louisa', '春夏秋冬', 'Robin'];
async function prepare(page: Page, width: number, motion: 'no-preference' | 'reduce', count = 12, route = '/') {
  await page.setViewportSize({ width, height: 844 });
  await page.emulateMedia({ reducedMotion: motion });
  await page.addInitScript(players => {
    localStorage.setItem('wgf:preferences:v1', JSON.stringify({ version: 1, remember: true, roster: players, inputMode: 'names', mode: 'cards', sound: false, motion: 'system' }));
    // Observe secure selection calls while preserving every original random word.
    const original = crypto.getRandomValues.bind(crypto);
    let draws = 0;
    Object.defineProperty(crypto, 'getRandomValues', { configurable: true, value: (array: ArrayBufferView<ArrayBuffer>) => {
      if (array instanceof Uint32Array && array.length === 1) draws++;
      return original(array);
    } });
    Object.defineProperty(window, '__continuityDraws', { get: () => draws });
  }, Array.from({ length: count }, (_, i) => ({ id: `player-${i + 1}`, label: names[i % names.length]! })));
  await page.goto(route);
  await expect(page.getByRole('button', { name: 'Pick a player', exact: true })).toBeEnabled();
  await expect(page.locator('.picker')).toHaveAttribute('data-count', String(count));
}
const drawCount = (page: Page) => page.evaluate(() => (window as unknown as { __continuityDraws: number }).__continuityDraws);
const live = (page: Page) => page.locator('.winner-announcement');
async function pick(page: Page) {
  await page.locator('.picker button.primary').click();
  await expect(page.locator('.picker')).toHaveAttribute('data-phase', 'result');
  await expect(live(page)).toContainText('goes first.');
}
async function choose(page: Page, label: string) {
  await page.getByRole('radio', { name: label, exact: true }).check();
  await expect(page.getByRole('radio', { name: label, exact: true })).toBeChecked();
}
async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

for (const width of [320, 1280]) for (const motion of ['no-preference', 'reduce'] as const) {
  test(`completed outcomes keep their scene across preferences and list disclosure at ${width}px with ${motion} motion`, async ({ page }) => {
    // Two real reveals plus repeated scene/live-node checks in WebKit.
    test.setTimeout(60000);
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await prepare(page, width, motion);
    await pick(page);
    const answer = await live(page).innerText();
    const scene = await page.locator('.picker .cards-reveal').elementHandle();
    const winner = await page.locator('.player.winner').elementHandle();
    const announcement = await live(page).locator('p').elementHandle();
    const draws = await drawCount(page);
    const preserved = async () => {
      await expect(page.locator('.picker')).toHaveAttribute('data-phase', 'result');
      await expect(live(page)).toHaveText(answer);
      expect(await page.locator('.picker .cards-reveal').evaluate((node, original) => node === original, scene)).toBe(true);
      expect(await page.locator('.player.winner').evaluate((node, original) => node === original, winner)).toBe(true);
      expect(await live(page).locator('p').evaluate((node, original) => node === original, announcement)).toBe(true);
      await expect(page.locator('.picker')).toHaveAttribute('data-visual', 'true');
      await expect(page.locator('.picker .coin-reveal, .picker .balloon-field')).toHaveCount(0);
      expect(await drawCount(page)).toBe(draws);
      await noOverflow(page);
    };
    await page.getByRole('button', { name: 'More methods', exact: true }).click();
    await expect(page.getByRole('radio', { name: 'Instant', exact: true })).toBeFocused();
    await preserved();
    for (const label of ['Coin Flip', 'Quick', 'Instant']) { await choose(page, label); await preserved(); }
    await page.getByRole('button', { name: 'Paste a list', exact: true }).click();
    await expect(page.getByLabel('Player names')).toHaveValue(names.join('\n'));
    await preserved();
    await page.getByRole('button', { name: 'Done', exact: true }).click();
    await preserved();
    await page.getByRole('button', { name: 'Preferences', exact: true }).click();
    await page.getByRole('button', { name: 'Reset settings', exact: true }).click();
    await expect(page.getByRole('radio', { name: 'Quick', exact: true })).toBeChecked();
    await preserved();
    await page.getByRole('button', { name: 'Preferences', exact: true }).click();
    await choose(page, 'Coin Flip');
    if (motion === 'reduce') await page.waitForTimeout(500);
    await pick(page);
    expect(await drawCount(page)).toBe(draws + 1);
    await expect(page.locator('.picker .cards-reveal')).toHaveCount(0);
    await expect(page.locator('.picker .coin-reveal[data-settled="true"]')).toHaveCount(1);
    await expect(live(page).locator('p')).toHaveCount(1);
    await page.getByLabel('Name for player 1', { exact: true }).fill('Edited Mina');
    await expect(page.locator('.picker')).toHaveAttribute('data-phase', 'ready');
    await expect(live(page)).toBeEmpty();
    await expect(page.locator('.player.winner')).toHaveCount(0);
    await expect(page.locator('.picker .coin-reveal[data-preview="true"]')).toHaveCount(1);
    await noOverflow(page);
    expect(errors).toEqual([]);
  });

  test(`next reveal loads only on a new draw and real list edits clear the result at ${width}px with ${motion} motion`, async ({ page }) => {
    await prepare(page, width, motion);
    await choose(page, 'Quick');
    await pick(page);
    const answer = await live(page).innerText();
    const draws = await drawCount(page);
    const requests: string[] = [];
    page.on('request', request => { if (request.resourceType() === 'script') requests.push(request.url()); });
    await choose(page, 'Balloon Rise');
    await expect(live(page)).toHaveText(answer);
    await expect(page.locator('.picker')).toHaveAttribute('data-phase', 'result');
    await expect(page.locator('.picker')).toHaveAttribute('data-visual', 'false');
    await expect(page.locator('.picker .reveal-stage')).toHaveCount(0);
    expect(requests).toEqual([]);
    expect(await drawCount(page)).toBe(draws);
    // The existing 450ms repeat guard still applies to reduced/Instant draws.
    if (motion === 'reduce') await page.waitForTimeout(500);
    await pick(page);
    expect(await drawCount(page)).toBe(draws + 1);
    await expect(page.locator('.picker .balloon-field')).toHaveCount(1);
    expect(requests.some(url => /BalloonRise/.test(url))).toBe(true);
    await page.getByRole('button', { name: 'Paste a list', exact: true }).click();
    await expect(page.locator('.picker')).toHaveAttribute('data-phase', 'result');
    await page.getByLabel('Player names').fill('Only me');
    await expect(page.locator('.picker')).toHaveAttribute('data-phase', 'editing');
    await expect(live(page)).toBeEmpty();
    await expect(page.locator('.picker .reveal-stage')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Pick a player', exact: true })).toBeDisabled();
    await page.getByLabel('Player names').fill('Mina\n王芳');
    await expect(page.locator('.picker .balloon-field[data-preview="true"]')).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Pick a player', exact: true })).toBeEnabled();
    await noOverflow(page);
  });

  test(`fallback draws keep their own presentation until a new supported draw at ${width}px with ${motion} motion`, async ({ page }) => {
    await prepare(page, width, motion, 13, '/methods/spinner/');
    await expect(page.getByText('Spinner fits up to 12 players. Quick is selected for your group of 13.', { exact: true })).toBeVisible();
    await pick(page);
    const answer = await live(page).innerText();
    const draws = await drawCount(page);
    await choose(page, 'Coin Flip');
    await expect(live(page)).toHaveText(answer);
    await expect(page.locator('.picker')).toHaveAttribute('data-phase', 'result');
    await expect(page.locator('.picker')).toHaveAttribute('data-visual', 'false');
    await expect(page.locator('.picker .reveal-stage')).toHaveCount(0);
    expect(await drawCount(page)).toBe(draws);
    if (motion === 'reduce') await page.waitForTimeout(500);
    await pick(page);
    await expect(page.locator('.picker .coin-reveal .reveal-player')).toHaveCount(13);
    expect(await drawCount(page)).toBe(draws + 1);
    const count = page.getByLabel('Player count', { exact: true });
    await count.fill('25'); await count.press('Enter');
    await expect(page.locator('.picker')).toHaveAttribute('data-phase', 'ready');
    await expect(live(page)).toBeEmpty();
    await expect(page.locator('.picker .reveal-stage')).toHaveCount(0);
    await expect(page.getByText('Coin Flip fits up to 24 players. Quick is selected for your group of 25.', { exact: true })).toBeVisible();
    await pick(page);
    expect(await drawCount(page)).toBe(draws + 2);
    await expect(page.locator('.picker')).toHaveAttribute('data-visual', 'false');
    await page.getByRole('button', { name: 'Preferences', exact: true }).click();
    await page.getByRole('button', { name: 'Forget this group', exact: true }).click();
    await expect(page.locator('.picker')).toHaveAttribute('data-phase', 'ready');
    await expect(page.locator('.picker')).toHaveAttribute('data-count', '4');
    await expect(live(page)).toBeEmpty();
    await expect(page.locator('.picker .coin-reveal[data-preview="true"]')).toHaveCount(1);
    await noOverflow(page);
  });
}
