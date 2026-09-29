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
  const shelf = directory.locator('#rule-letter-z');
  await expect(shelf).toHaveAttribute('open', '');
  await expect(shelf.locator('summary')).toBeInViewport();

  const search = directory.getByRole('searchbox', { name: 'Search by game or another name' });
  await search.fill('Azul');
  await expect(alphabet).toBeHidden();
  await expect(directory.locator('[data-rule-groups]')).toBeHidden();
  await expect(directory.locator('[data-search-results] li a').first()).toContainText('Azul');
  await search.clear();
  await expect(alphabet).toBeVisible();
  await expect(directory.locator('[data-rule-groups]')).toBeVisible();
  await expect(directory.locator('[data-search-results]')).toBeHidden();
});

test('letter shelves keep the full static catalog usable without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  try {
    const page = await context.newPage();
    await page.goto(`${baseURL}/games/`);
    const directory = page.locator('[data-game-directory]');
    const shelves = directory.locator('.rule-letter-group');
    await expect(shelves).toHaveCount(27);
    const links = await directory.locator('[data-rule-groups] .game-list a').evaluateAll(items => items.map(item => item.getAttribute('href')));
    expect(links.length).toBeGreaterThan(1000);
    expect(new Set(links).size).toBe(links.length);
    expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThan(5000);
    const z = directory.locator('#rule-letter-z');
    await z.locator('summary').click();
    await expect(z).toHaveAttribute('open', '');
    await expect(z.locator('.game-list a').first()).toBeVisible();
    await z.locator('.game-list a').first().click();
    await expect(page).toHaveURL(/\/games\/[^/]+\/$/);
  } finally { await context.close(); }
});
