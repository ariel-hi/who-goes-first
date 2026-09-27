import { test, expect } from '@playwright/test';

type FailedReplayFixture = { failures: number; cleanup: () => void };
const methods = [
  { name: 'Quick', path: '/', visual: false },
  { name: 'Card Draw', path: '/methods/cards/', visual: true },
  { name: 'Balloon Rise', path: '/methods/balloon/', visual: true },
] as const;
const names = ['王芳', 'Sam', 'Sam', '👨‍👩‍👧‍👦'];

for (const method of methods) for (const motion of ['no-preference', 'reduce'] as const) test(method.name + ' clears a previous winner when secure replay fails with ' + motion + ' motion', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 320, height: 844 });
  await page.emulateMedia({ reducedMotion: motion });
  await page.clock.install();
  await page.goto(method.path);
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
  const decline = page.getByRole('button', { name: 'No thanks', exact: true });
  if (await decline.isVisible()) await decline.click();
  for (const [index, name] of names.entries()) {
    await page.getByLabel('Name for player ' + (index + 1), { exact: true }).fill(name);
  }
  const picker = page.locator('.picker');
  const button = picker.locator('.picker-card > button.primary');
  const originalButton = await button.elementHandle();
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(picker).toHaveAttribute('data-phase', 'result');
  await expect(picker.locator('.winner-announcement')).toContainText('goes first.');
  await expect(picker.locator('.player.winner')).toHaveCount(1);
  if (method.visual) await expect(picker.locator('.reveal-stage [data-settled="true"]')).toHaveCount(1);

  // Both successful draws use native secure randomness; only this replay is failed.
  // Arm on the native target click, immediately before React's delegated handler.
  // Unrelated random calls outside that invocation keep their original behavior.
  await page.evaluate(() => {
    const button = document.querySelector<HTMLButtonElement>('.picker-card > button.primary')!;
    const own = Object.getOwnPropertyDescriptor(crypto, 'getRandomValues');
    const original = crypto.getRandomValues.bind(crypto);
    let armed = false;
    const arm = () => { armed = true; };
    const fixture: FailedReplayFixture = { failures: 0, cleanup: () => {
      button.removeEventListener('click', arm, true);
      if (own) Object.defineProperty(crypto, 'getRandomValues', own);
      else Reflect.deleteProperty(crypto, 'getRandomValues');
      Reflect.deleteProperty(window, '__failedReplayFixture');
    } };
    button.addEventListener('click', arm, true);
    Object.defineProperty(window, '__failedReplayFixture', { configurable: true, value: fixture });
    Object.defineProperty(crypto, 'getRandomValues', { configurable: true, value: (array: ArrayBufferView<ArrayBuffer>) => {
      if (armed && array instanceof Uint32Array && array.length === 1) {
        armed = false;
        fixture.failures++;
        throw new Error('Owned failed replay');
      }
      return original(array);
    } });
  });
  try {
    // Advance the existing 450ms repeat guard without changing its production value.
    await page.clock.runFor(450);
    await expect(button).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(picker.getByRole('alert')).toHaveText('Secure randomness is unavailable. No player was selected. Try again, or reload this page.');
    await expect(picker).toHaveAttribute('data-phase', 'ready');
    await expect(picker.locator('.winner-announcement')).toBeEmpty();
    await expect(picker.locator('.player.winner, .winner-dot')).toHaveCount(0);
    await expect(picker.locator('.reveal-stage .reveal-chosen, .reveal-stage .survivor, .reveal-stage .spinner-winning-slice')).toHaveCount(0);
    if (method.visual) {
      const preview = picker.locator('.reveal-stage [data-preview="true"]');
      await expect(preview).toHaveCount(1);
      expect(await preview.evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0);
    } else await expect(picker.locator('.reveal-stage')).toHaveCount(0);
    await expect(button).toHaveText('Pick a player');
    await expect(button).toBeEnabled();
    await expect(button).toBeFocused();
    expect(await button.evaluate((node, original) => node === original, originalButton)).toBe(true);
    for (const [index, name] of names.entries()) {
      await expect(page.getByLabel('Name for player ' + (index + 1), { exact: true })).toHaveValue(name);
    }
    expect(await page.evaluate(() => (window as unknown as { __failedReplayFixture: FailedReplayFixture }).__failedReplayFixture.failures)).toBe(1);
  } finally {
    await page.evaluate(() => (window as unknown as { __failedReplayFixture?: FailedReplayFixture }).__failedReplayFixture?.cleanup());
  }

  await page.clock.runFor(450);
  await page.keyboard.press('Enter');
  await expect(picker).toHaveAttribute('data-phase', 'result');
  await expect(picker.getByRole('alert')).toHaveCount(0);
  await expect(picker.locator('.winner-announcement')).toContainText('goes first.');
  await expect(picker.locator('.player.winner')).toHaveCount(1);
  await expect(button).toHaveText('Pick again');
  await expect(button).toBeFocused();
  if (method.visual) await expect(picker.locator('.reveal-stage [data-settled="true"]')).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});
