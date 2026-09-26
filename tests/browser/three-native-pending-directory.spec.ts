import { test, expect, type Locator } from '@playwright/test';
import { getBrowseShelves, shelfHref } from '../../src/lib/content/board-game-browse';

const identities = [
  ['415147', 'Spectacular', ['Заповедник: Исчезающие виды', 'Útočiště']],
  ['432834', 'The Great Library', ['Великая библиотека', 'A Nagy Könyvtár']],
  ['452684', 'Yami', ['Ями']],
] as const;

async function assertPending(row: Locator, id: string, name: string) {
  await expect(row).toHaveAttribute('data-has-rule', 'false');
  await expect(row.locator('summary')).toContainText(name);
  await expect(row.getByRole('link', { name: 'Pick a player', exact: true })).toHaveAttribute('href', '/');
  await expect(row.getByRole('link', { name: /View game on BoardGameGeek/ })).toHaveAttribute('href', `https://boardgamegeek.com/boardgame/${id}`);
  await expect(row.getByRole('link')).toHaveCount(2);
  await expect(row.locator('a[href^="/games/"]')).toHaveCount(0);
}

for (const width of [320, 1280]) {
  test(`three pending identities resolve all native names without merging Kakapo at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const [id, name, names] of identities) {
      for (const query of [name, ...names]) {
        await page.goto(`/board-games/#q=${encodeURIComponent(query)}&filter=pending`);
        await expect(page.getByRole('searchbox', { name: 'Search board games' })).toHaveValue(query);
        const row = page.locator(`[data-results] li[data-id="${id}"]`);
        await expect(row).toBeVisible();
        await row.locator('summary').focus();
        await page.keyboard.press('Enter');
        await assertPending(row, id, name);
        await expect(page.locator('[data-results] li[data-id="410097"]')).toHaveCount(0);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      }
    }
    await page.goto('/board-games/#q=The%20Kakapo%3A%20Buddy%20%26%20Party&filter=pending');
    await expect(page.locator('[data-results] li[data-id="410097"]')).toBeVisible();
    await expect(page.locator('[data-results] li[data-id="452684"]')).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test(`three pending identities have usable static shelf disclosures at ${width}px`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 844 } });
    const page = await context.newPage();
    const { shelves } = getBrowseShelves();
    try {
      for (const [id, name] of identities) {
        const shelf = shelves.find(shelf => shelf.games.some(game => game.bggId === id))!;
        await page.goto(`${baseURL}${shelfHref(shelf.letter, shelf.page)}`);
        const row = page.locator(`[data-directory-shelf] li[data-id="${id}"]`);
        await row.locator('summary').click();
        await assertPending(row, id, name);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      }
    } finally { await context.close(); }
  });
}
