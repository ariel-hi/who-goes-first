import { test, expect } from '@playwright/test';
import { getBrowseShelves } from '../../src/lib/content/board-game-browse';

for (const width of [320, 1280]) {
  test(`Brass Pittsburgh searches as a distinct pending identity at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/board-games/');
    const search = page.getByRole('searchbox', { name: 'Search board games' });
    for (const query of ['Brass: Pittsburgh', 'БРАСС ПИТТСБУРГ']) {
      await search.fill(query);
      const result = page.locator('[data-results] li');
      await expect(result).toHaveCount(1);
      await expect(result).toHaveAttribute('data-id', '452264');
      await expect(result).toHaveAttribute('data-has-rule', 'false');
      await expect(result.locator('summary')).toHaveText('Brass: PittsburghNo checked starting rule yet');
      await result.locator('summary').click();
      await expect(result.getByRole('link', { name: /View game on BoardGameGeek/ })).toHaveAttribute('href', 'https://boardgamegeek.com/boardgame/452264');
      await expect(result.getByRole('link', { name: 'Pick a player', exact: true })).toHaveAttribute('href', '/');
      await expect(result.locator('a[href^="/games/"]')).toHaveCount(0);
    }
    await page.getByRole('button', { name: 'With a rule', exact: true }).click();
    await expect(page.locator('[data-results] li')).toHaveCount(0);
    await page.getByRole('button', { name: 'Awaiting a rule', exact: true }).click();
    await expect(page.locator('[data-results] li[data-id="452264"]')).toBeVisible();
    await page.getByRole('button', { name: 'All matches', exact: true }).click();
    for (const query of ['En Route: Special Edition', 'Маршрут построен: Расширенное издание']) {
      await search.fill(query);
      await expect(page.locator('[data-results] li')).toHaveCount(0);
    }
    await search.fill('Brass');
    for (const id of ['452264', '224517', '28720']) await expect(page.locator(`[data-results] li[data-id="${id}"]`)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test(`Brass Pittsburgh remains browsable without JavaScript at ${width}px`, async ({ browser }) => {
    const shelf = getBrowseShelves().shelves.find(shelf => shelf.games.some(game => game.bggId === '452264'))!;
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 844 } });
    try {
      const page = await context.newPage();
      await page.goto(`/board-games/browse/${shelf.letter}/${shelf.page}/`);
      const result = page.locator('[data-directory-shelf] li[data-id="452264"]');
      await expect(result).toHaveAttribute('data-has-rule', 'false');
      await expect(result.locator('summary')).toContainText('Brass: Pittsburgh');
      await result.locator('summary').click();
      await expect(result.getByRole('link', { name: /View game on BoardGameGeek/ })).toHaveAttribute('href', 'https://boardgamegeek.com/boardgame/452264');
      await expect(result.locator('a[href^="/games/"]')).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    } finally { await context.close(); }
  });
}
