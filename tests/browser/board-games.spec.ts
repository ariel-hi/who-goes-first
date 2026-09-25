import { test, expect } from '@playwright/test';

test('all board games are searchable and lead to the right game page', async ({ page }) => {
  await page.goto('/board-games/');
  await expect(page.locator('[data-board-directory] li')).toHaveCount(1320);
  await page.getByRole('searchbox', { name: 'Search board games' }).fill('Azul');
  await expect(page.locator('[data-board-directory] li:visible').first()).toContainText('Azul');
  // A game with one sourced edition links straight to its rule.
  await page.locator('[data-board-directory] li:visible').filter({ hasText: 'Azul' }).first().getByRole('link').click();
  await expect(page).toHaveURL(/\/games\/azul-2018-en\/$/);
  await page.goBack();
  await page.setViewportSize({ width: 320, height: 750 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.goto('/board-games/174476/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText("10' to Kill");
  await expect(page.getByRole('link', { name: /La Boîte de Jeu English rulebook/ })).toHaveAttribute('href', '/games/10-to-kill-la-boite-de-jeu-en/');
});
