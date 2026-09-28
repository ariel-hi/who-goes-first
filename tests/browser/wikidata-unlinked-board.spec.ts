import { expect, test } from '@playwright/test';

const pending = [
  { id: 'game-2f551211-4e97-464a-9edc-7c471ab34e35', name: 'Above and Below', reference: 'https://red-raven-board-games.myshopify.com/products/above-and-below' },
  { id: 'game-04af0ef9-cf38-4e9f-9c22-5a274fec0134', name: 'Escape the Dark Castle (First Edition)', reference: 'https://themeborne.com/products/escape-the-dark-castle' },
] as const;

for (const width of [320, 1280]) {
  test(`Wikidata publisher identities search and browse as pending at ${width}px`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/board-games/');
    const search = page.getByRole('searchbox', { name: 'Search board games' });
    const results = page.locator('[data-board-directory] [data-results] > li');
    for (const game of pending) {
      await search.fill(game.name);
      await expect(results).toHaveCount(1);
      await expect(results).toHaveAttribute('data-id', game.id);
      await expect(results).toHaveAttribute('data-has-rule', 'false');
      await expect(results.locator('summary')).toContainText(`${game.name}No checked starting rule yet`);
      await results.locator('summary').click();
      await expect(results.getByRole('link', { name: /Publisher reference/ })).toHaveAttribute('href', game.reference);
      await expect(results.locator('a[href*="boardgamegeek.com"], a[href^="/games/"]')).toHaveCount(0);
      await page.getByRole('button', { name: 'With a rule', exact: true }).click();
      await expect(results).toHaveCount(0);
      await page.getByRole('button', { name: 'Awaiting a rule', exact: true }).click();
      await expect(results).toHaveAttribute('data-id', game.id);
    }
    expect(errors).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
