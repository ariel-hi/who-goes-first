import { test, expect } from '@playwright/test';
import { getBrowseShelves, shelfHref } from '../../src/lib/content/board-game-browse';

const identities = [
  ['273910', 'Stars of Akarios'], ['322421', 'Aqua Garden'],
  ['360899', 'Harrow County: The Game of Gothic Conflict'], ['447999', 'Dino Garden'],
] as const;

for (const width of [320, 1280]) {
  test(`new CrowD identities remain searchable pending games at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const [id, name] of identities) {
      await page.goto(`/board-games/#q=${encodeURIComponent(name)}&filter=pending`);
      await expect(page.getByRole('searchbox', { name: 'Search board games' })).toHaveValue(name);
      const row = page.locator(`[data-results] li[data-id="${id}"]`);
      await expect(row).toBeVisible();
      await expect(row).toHaveAttribute('data-has-rule', 'false');
      await expect(row.locator('summary')).toContainText(name);
      await row.locator('summary').focus();
      await page.keyboard.press('Enter');
      await expect(row.getByRole('link', { name: 'Pick a player', exact: true })).toHaveAttribute('href', '/');
      await expect(row.getByRole('link', { name: /View game on BoardGameGeek/ })).toHaveAttribute('href', `https://boardgamegeek.com/boardgame/${id}`);
      await expect(row.getByRole('link')).toHaveCount(2);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    expect(errors).toEqual([]);
  });

  test(`new CrowD identities appear on ordinary shelves without JavaScript at ${width}px`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 844 } });
    const page = await context.newPage();
    const { shelves } = getBrowseShelves();
    try {
      for (const [id, name] of identities) {
        const shelf = shelves.find(shelf => shelf.games.some(game => game.bggId === id))!;
        await page.goto(`${baseURL}${shelfHref(shelf.letter, shelf.page)}`);
        const row = page.locator(`[data-directory-shelf] li[data-id="${id}"]`);
        await expect(row).toHaveAttribute('data-has-rule', 'false');
        await expect(row.locator('summary')).toContainText(name);
        await row.locator('summary').click();
        await expect(row.getByRole('link', { name: 'Pick a player', exact: true })).toHaveAttribute('href', '/');
        await expect(row.getByRole('link', { name: /View game on BoardGameGeek/ })).toHaveAttribute('href', `https://boardgamegeek.com/boardgame/${id}`);
        await expect(row.getByRole('link')).toHaveCount(2);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      }
    } finally { await context.close(); }
  });
}
