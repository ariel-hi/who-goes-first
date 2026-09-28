import { test, expect } from '@playwright/test';

for (const motion of ['no-preference', 'reduce'] as const) test(`rock paper scissors keeps choices private and reveals a readable result with ${motion} motion`, async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 780 });
  await page.emulateMedia({ reducedMotion: motion });
  await page.goto('/rock-paper-scissors/');
  await page.getByRole('button', { name: 'Rock' }).click();
  await expect(page.getByRole('heading', { name: /Locked in/ })).toBeVisible();
  await expect(page.locator('.rps-arena')).toHaveCount(0);
  await page.getByRole('button', { name: 'I’m Player 2' }).click();
  await page.getByRole('button', { name: 'Scissors' }).click();
  await expect(page.getByRole('status')).toContainText('Player 1 wins and goes first.');
  await expect(page.locator('.rps-arena')).toHaveAttribute('data-winner', '1');
  await expect(page.locator('.rps-victor')).toContainText('Rock');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const animation = await page.locator('.rps-contender').first().evaluate(element => getComputedStyle(element).animationName);
  expect(animation).toBe(motion === 'reduce' ? 'none' : 'rps-enter-left');
  await page.getByRole('button', { name: 'Play again' }).click();
  await expect(page.locator('.rps-arena')).toHaveCount(0);
  await expect(page.locator('.rps-score')).toContainText('Player 1 1');
});
