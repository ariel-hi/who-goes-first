import { test, expect } from '@playwright/test';
import { getBrowseShelves, shelfHref } from '../../src/lib/content/board-game-browse';

const identities = [
  ['273910', 'Stars of Akarios', null], ['322421', 'Aqua Garden', 'aqua-garden-uchibacoya-en-rulebook'],
  ['360899', 'Harrow County: The Game of Gothic Conflict', 'harrow-county-off-the-page-en-2023-full'], ['447999', 'Dino Garden', 'dino-garden-uchibacoya-en-rulebook'],
] as const;

async function assertArticle(page: import('@playwright/test').Page, name: string, id: string) {
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(`Who goes first in ${name}?`);
  await expect(page.locator('.rule-answer')).toContainText(id === '360899' ? 'reveals the First Player Token Bonus Tile' : 'Choose the starting player by any method');
  const folder = id === '360899' ? 'https://disk.yandex.ru/d/IjsvmsDwtKGLPQ' : 'https://disk.yandex.ru/d/_tSRueefX4dKjQ';
  await expect(page.locator('.source-actions a')).toHaveCount(1);
  await expect(page.locator('.source-actions a')).toHaveAttribute('href', folder);
  await expect(page.locator('.source-cited-pages a')).toHaveCount(0);
  await expect(page.locator('.source-list')).toContainText('Cited PDF pages:');
  await expect(page.locator('.opening-tie')).toHaveCount(0);
  await expect(page.locator('.fallback')).toContainText('Optional house rule');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

for (const width of [320, 1280]) {
  test(`CrowD identities link only their reviewed rules and retain pending Stars at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const [id, name, slug] of identities) {
      await page.goto(`/board-games/#q=${encodeURIComponent(name)}&filter=${slug ? 'rules' : 'pending'}`);
      await expect(page.getByRole('searchbox', { name: 'Search board games' })).toHaveValue(name);
      const row = page.locator(`[data-results] li[data-id="${id}"]`);
      await expect(row).toBeVisible();
      await expect(row).toHaveAttribute('data-has-rule', String(slug !== null));
      if (slug) {
        const link = row.locator('a');
        await expect(link).toHaveAttribute('href', `/games/${slug}/`);
        await expect(link).toContainText(name);
        await expect(row.locator('summary')).toHaveCount(0);
        await link.focus();
        await page.keyboard.press('Enter');
        await assertArticle(page, name, id);
        continue;
      }
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
      for (const [id, name, slug] of identities) {
        const shelf = shelves.find(shelf => shelf.games.some(game => game.bggId === id))!;
        await page.goto(`${baseURL}${shelfHref(shelf.letter, shelf.page)}`);
        const row = page.locator(`[data-directory-shelf] li[data-id="${id}"]`);
        await expect(row).toHaveAttribute('data-has-rule', String(slug !== null));
        if (slug) {
          const link = row.locator('a');
          await expect(link).toHaveAttribute('href', `/games/${slug}/`);
          await expect(link).toContainText(name);
          await expect(row.locator('summary')).toHaveCount(0);
          await link.click();
          await assertArticle(page, name, id);
          continue;
        }
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
