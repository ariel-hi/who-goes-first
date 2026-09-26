import { test, expect } from '@playwright/test';

for (const width of [320, 1280]) for (const reducedMotion of ['no-preference', 'reduce'] as const) {
  test(`first touch draw reveals a committed larger Quick group at ${width}px, ${reducedMotion}`, async ({ browser }) => {
    const context = await browser.newContext({ hasTouch: true, viewport: { width, height: 844 }, reducedMotion });
    try {
      const page = await context.newPage();
      await page.goto('/');
      const count = page.getByLabel('Player count', { exact: true });
      await expect(count).toBeEnabled();
      for (const control of [count, page.getByRole('button', { name: 'Remove a player', exact: true }), page.getByRole('button', { name: 'Add a player', exact: true })]) {
        const box = await control.boundingBox();
        expect(box?.width).toBeGreaterThanOrEqual(44);
        expect(box?.height).toBeGreaterThanOrEqual(44);
      }
      await count.tap();
      await count.press('ControlOrMeta+A');
      await count.pressSequentially('12');
      const pick = page.getByRole('button', { name: 'Pick a player', exact: true });
      const box = (await pick.boundingBox())!;
      // Native touch hits the pre-commit geometry; no second tap or blur is supplied.
      await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
      await expect(page.locator('.picker')).toHaveAttribute('data-count', '12');
      await expect(page.locator('.player')).toHaveCount(12);
      const announcement = page.locator('.winner-announcement p');
      await expect(announcement).toHaveText(/Seat \d+ goes first\./);
      await expect.poll(async () => announcement.evaluate(element => {
        const rect = element.getBoundingClientRect();
        return rect.top >= 15 && rect.bottom <= innerHeight - 15;
      })).toBe(true);
      const winnerText = await announcement.textContent();
      await page.getByRole('button', { name: 'Preferences', exact: true }).click();
      await expect(announcement).toHaveText(winnerText!);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    } finally { await context.close(); }
  });
}

test('an already visible Quick result preserves scroll and keyboard focus', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.goto('/');
  const pick = page.getByRole('button', { name: 'Pick a player', exact: true });
  await expect(pick).toBeEnabled();
  await pick.focus();
  const before = await page.evaluate(() => scrollY);
  await pick.press('Enter');
  await expect(page.locator('.winner-announcement p')).toHaveText(/Seat [1-4] goes first\./);
  await expect(page.getByRole('button', { name: 'Pick again', exact: true })).toBeFocused();
  expect(await page.evaluate(() => scrollY)).toBe(before);
});
