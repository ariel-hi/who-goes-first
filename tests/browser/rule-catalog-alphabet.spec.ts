import { expect, test } from '@playwright/test';

test('rule catalog letter jumps work alongside title search', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/games/');
  const directory = page.locator('[data-game-directory]');
  const alphabet = directory.getByRole('navigation', { name: 'Jump to starting rules by letter' });
  const z = alphabet.getByRole('link', { name: /Jump to Z rules/ });
  await expect(z).toHaveAttribute('href', '#rule-letter-z');
  await z.click();
  await expect(page).toHaveURL(/\/games\/#rule-letter-z$/);
  await expect(directory.locator('h2#rule-letter-z')).toBeInViewport();

  const search = directory.getByRole('searchbox', { name: 'Search by game or another name' });
  await search.fill('Azul');
  await expect(alphabet).toBeHidden();
  await expect(directory.locator('.rule-letter-heading:visible')).toHaveCount(0);
  await expect(directory.locator('.game-list li:visible a').first()).toContainText('Azul');
  await search.clear();
  await expect(alphabet).toBeVisible();
  await expect(directory.locator('.rule-letter-heading:visible')).not.toHaveCount(0);
});
