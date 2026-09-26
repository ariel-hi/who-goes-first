import { test, expect } from '@playwright/test';
import { getBrowseShelves } from '../../src/lib/content/board-game-browse';

test('board games are browsable without search and searchable on demand', async ({ page }) => {
  const { games, shelves } = getBrowseShelves();
  expect(shelves.flatMap(shelf => shelf.games).map(game => game.bggId).toSorted()).toEqual(games.map(game => game.bggId).toSorted());
  await page.goto('/board-games/');
  await expect(page.getByRole('link', { name: 'Browse A games' })).toBeVisible();
  await page.getByRole('link', { name: 'Browse A games' }).click();
  await expect(page).toHaveURL(/\/board-games\/browse\/a\/1\/$/);
  await expect(page.locator('[data-directory-shelf] li')).toHaveCount(shelves.find(shelf => shelf.letter === 'a' && shelf.page === 1)!.games.length);
  await page.goto('/board-games/');
  await page.getByRole('searchbox', { name: 'Search board games' }).fill('Azul');
  await expect(page.locator('[data-results] li').first()).toContainText('Azul');
  await page.getByRole('searchbox', { name: 'Search board games' }).fill('Acquire');
  await page.getByRole('button', { name: 'Awaiting a rule' }).click();
  await expect(page.locator('[data-results] li').first()).toHaveAttribute('data-has-rule', 'false');
  await page.getByRole('button', { name: 'All matches' }).click();
  await page.getByRole('searchbox', { name: 'Search board games' }).fill('10 to kill');
  await expect(page.locator('[data-results] li')).toHaveCount(1);
  await page.getByRole('searchbox', { name: 'Search board games' }).fill('Azul');
  // A game with one sourced edition links straight to its rule.
  await page.locator('[data-results] li').filter({ hasText: 'Azul' }).first().getByRole('link').click();
  await expect(page).toHaveURL(/\/games\/azul-2018-en\/$/);
  await page.goBack();
  await page.setViewportSize({ width: 320, height: 750 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.goto('/board-games/15512/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Incan Gold');
  await expect(page.getByRole('link', { name: /Eagle-Gryphon English rules, ©2018/ })).toHaveAttribute('href', '/games/incan-gold-eagle-gryphon-en-2018/');
});
