import { test, expect } from '@playwright/test';
import { getBrowseShelves } from '../../src/lib/content/board-game-browse';

const identities = [
  { id: '325853', name: 'Lama Dice', query: 'Lama Dice' },
  { id: '394889', name: 'Cabanga!', query: 'Cabanga!' },
  { id: '447384', name: 'Meister Makatsu', query: 'Maître Makatsu' },
];

for (const width of [320, 1280]) {
  test(`Amigo identities expose pending help and French search at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/board-games/');
    const search = page.getByRole('searchbox', { name: 'Search board games' });
    for (const identity of identities) {
      await search.fill(identity.query);
      const result = page.locator('[data-results] li');
      await expect(result).toHaveCount(1);
      await expect(result).toHaveAttribute('data-id', identity.id);
      await expect(result).toHaveAttribute('data-has-rule', 'false');
      await expect(result.locator('summary')).toContainText(identity.name);
      await result.locator('summary').click();
      await expect(result.getByRole('link', { name: /View game on BoardGameGeek/ })).toHaveAttribute('href', `https://boardgamegeek.com/boardgame/${identity.id}`);
      await expect(result.getByRole('link', { name: 'Pick a player', exact: true })).toHaveAttribute('href', '/');
      await expect(result.locator('a[href^="/games/"]')).toHaveCount(0);
      await page.getByRole('button', { name: 'With a rule', exact: true }).click();
      await expect(result).toHaveCount(0);
      await page.getByRole('button', { name: 'Awaiting a rule', exact: true }).click();
      await expect(page.locator(`[data-results] li[data-id="${identity.id}"]`)).toBeVisible();
      await page.getByRole('button', { name: 'All matches', exact: true }).click();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test(`Amigo identities are readable in static shelves at ${width}px`, async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 844 } });
    try {
      const page = await context.newPage();
      const shelves = getBrowseShelves().shelves;
      for (const identity of identities) {
        const shelf = shelves.find(shelf => shelf.games.some(game => game.bggId === identity.id))!;
        await page.goto(`/board-games/browse/${shelf.letter}/${shelf.page}/`);
        const result = page.locator(`[data-directory-shelf] li[data-id="${identity.id}"]`);
        await expect(result.locator('summary')).toContainText(identity.name);
        await expect(result).toHaveAttribute('data-has-rule', 'false');
        await result.locator('summary').click();
        await expect(result.getByRole('link', { name: /View game on BoardGameGeek/ })).toHaveAttribute('href', `https://boardgamegeek.com/boardgame/${identity.id}`);
        await expect(result.locator('a[href^="/games/"]')).toHaveCount(0);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      }
    } finally { await context.close(); }
  });
}
