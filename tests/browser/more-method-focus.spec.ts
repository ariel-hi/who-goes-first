import { test, expect } from '@playwright/test';

test.use({ hasTouch: true });

test('delayed More methods focus preserves a newly edited count and the first mode tap', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    const original = crypto.getRandomValues.bind(crypto);
    Object.defineProperty(crypto, 'getRandomValues', { configurable: true, value: (array: ArrayBufferView<ArrayBuffer>) => {
      if (array instanceof Uint32Array && array.length === 1) { array[0] = 23; return array; }
      return original(array);
    } });
  });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Pick a player', exact: true })).toBeEnabled();
  // Hold only the disclosure's next animation-frame callback. Restore the real
  // scheduler immediately so typing and the native tap retain their timing.
  await page.evaluate(() => {
    const more = document.querySelector<HTMLButtonElement>('.more-modes')!;
    more.addEventListener('click', () => {
      const original = window.requestAnimationFrame;
      window.requestAnimationFrame = callback => {
        window.requestAnimationFrame = original;
        (window as unknown as { releaseMoreFocus: () => void }).releaseMoreFocus = () => callback(performance.now());
        return -1;
      };
    }, { once: true, capture: true });
  });
  await page.getByRole('button', { name: 'More methods', exact: true }).click();
  const count = page.getByRole('textbox', { name: 'Player count', exact: true });
  await count.fill('24');
  await expect(count).toBeFocused();
  await expect(count).toHaveValue('24');
  await expect(page.locator('.picker')).toHaveAttribute('data-count', '4');

  await page.evaluate(() => (window as unknown as { releaseMoreFocus: () => void }).releaseMoreFocus());
  await expect(count).toBeFocused();
  await expect(count).toHaveValue('24');
  await expect(page.locator('.picker')).toHaveAttribute('data-count', '4');
  const dice = page.getByRole('radio', { name: 'Dice Roll', exact: true });
  await dice.tap();
  await expect(dice).toBeChecked();
  await expect(page.locator('.picker')).toHaveAttribute('data-count', '24');
  await page.getByRole('button', { name: 'Pick a player', exact: true }).click();
  await expect(page.locator('.winner-announcement')).toContainText('Seat 24 goes first.');
});

test('keyboard More methods still focuses the first newly revealed method', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Pick a player', exact: true })).toBeEnabled();
  const more = page.getByRole('button', { name: 'More methods', exact: true });
  await more.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('radio', { name: 'Instant', exact: true })).toBeFocused();
  await expect(page.getByRole('radio', { name: 'Quick', exact: true })).toBeChecked();
});
