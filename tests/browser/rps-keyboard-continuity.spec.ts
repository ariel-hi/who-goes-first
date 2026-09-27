import { test, expect } from '@playwright/test';

for (const motion of ['no-preference', 'reduce'] as const) test('secret choices retain keyboard focus through handoff, result and replay with ' + motion + ' motion', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 320, height: 844 });
  await page.emulateMedia({ reducedMotion: motion });
  await page.goto('/rock-paper-scissors/');
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
  const decline = page.getByRole('button', { name: 'No thanks', exact: true });
  if (await decline.isVisible()) await decline.click();
  const tool = page.locator('.rps-tool');
  const rock = tool.getByRole('button', { name: 'Rock', exact: true });
  expect(await tool.evaluate(element => element.contains(document.activeElement))).toBe(false);
  await rock.focus();

  // Enter locks a secret choice and carries focus to the handoff control.
  await page.keyboard.press('Enter');
  const pass = tool.getByRole('button', { name: 'I’m Player 2', exact: true });
  await expect(pass).toBeFocused();
  await expect(tool.getByRole('heading')).toHaveText('Locked in. Pass the phone to Player 2.');
  await expect(tool.getByText('Rock', { exact: true })).toHaveCount(0);
  await expect(tool.locator('.rps-reveal')).toHaveCount(0);
  await page.keyboard.press('Enter');
  await expect(rock).toBeFocused();
  await expect(tool.getByRole('heading')).toHaveText('Player 2, choose in secret');
  await page.keyboard.press('Tab');
  await expect(tool.getByRole('button', { name: 'Paper', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  const again = tool.getByRole('button', { name: 'Play again', exact: true });
  await expect(again).toBeFocused();
  await expect(tool.locator('.tool-result')).toHaveText('Player 2 wins and goes first.');
  await expect(tool.locator('.rps-score')).toHaveAttribute('aria-label', 'Score: Player 1 0, Player 2 1');
  await expect(tool.getByRole('status')).toHaveAttribute('aria-live', 'polite');

  // Space completes a tie and returns to the first choice without adding a win.
  await page.keyboard.press('Space');
  await expect(rock).toBeFocused();
  await expect(tool.locator('.rps-reveal')).toHaveCount(0);
  await page.keyboard.press('Space');
  await expect(pass).toBeFocused();
  await page.keyboard.press('Space');
  await expect(rock).toBeFocused();
  await page.keyboard.press('Space');
  await expect(tool.getByRole('button', { name: 'Throw again', exact: true })).toBeFocused();
  await expect(tool.locator('.tool-result')).toHaveText('Tie! Throw again.');
  await expect(tool.locator('.rps-score')).toHaveAttribute('aria-label', 'Score: Player 1 0, Player 2 1');

  // A subsequent round remains keyboard operable and the other player can win.
  await page.keyboard.press('Enter');
  await expect(rock).toBeFocused();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(tool.getByRole('button', { name: 'Scissors', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(pass).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(rock).toBeFocused();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(again).toBeFocused();
  await expect(tool.locator('.tool-result')).toHaveText('Player 1 wins and goes first.');
  await expect(tool.locator('.rps-score')).toHaveAttribute('aria-label', 'Score: Player 1 1, Player 2 1');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});
