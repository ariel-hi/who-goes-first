import { expect, test } from '@playwright/test';

test('the rules library downloads random answers on demand and recovers from a failed download', async ({ page }) => {
  let requests = 0;
  await page.route('**/rule-index.json', route => {
    requests++;
    return requests === 1 ? route.abort('failed') : route.continue();
  });
  await page.goto('/games/');
  const root = page.locator('[data-random-rule]');
  await expect(root).not.toHaveAttribute('data-choices');
  expect(requests).toBe(0);
  await page.getByRole('button', { name: 'Pick a rule' }).click();
  await expect(page.locator('[data-rule-error]')).toBeVisible();
  await expect(root).not.toHaveAttribute('aria-busy');
  await page.getByRole('button', { name: 'Pick a rule' }).click();
  await expect(page.locator('[data-rule-result]')).toBeVisible();
  await expect(page.locator('[data-rule-error]')).toBeHidden();
  const prior = await page.locator('[data-rule-link]').getAttribute('href');
  await page.getByRole('button', { name: 'Another rule' }).click();
  await expect(page.locator('[data-rule-link]')).not.toHaveAttribute('href', prior!);
  expect(requests).toBe(2);
  const game = await page.locator('[data-rule-game]').textContent();
  await page.locator('[data-rule-link]').click();
  await expect(page.locator('h1')).toContainText(game!);
});

for (const width of [320, 1280]) test(`the homepage has one usable random-rule panel at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Try a random rule' })).toHaveCount(1);
  await expect(page.getByRole('link', { name: 'Try a random rule' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Browse game rules' })).toHaveCount(0);
  const prior = await page.locator('[data-home-rule-source]').getAttribute('href');
  await page.getByRole('button', { name: 'Another rule' }).click();
  await expect(page.locator('[data-home-rule-source]')).not.toHaveAttribute('href', prior!);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('letter shelves remain navigable with noindex while sourced theme guides remain available', async ({ page }) => {
  await page.goto('/board-games/browse/a/1/');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow');
  await expect(page.locator('[data-directory-shelf] a').first()).toBeVisible();
  const sitemap = await (await page.request.get('/sitemap.xml')).text();
  expect(sitemap).not.toContain('/board-games/browse/');
  await page.goto('/games/themes/youngest-player/');
  await expect(page.locator('h1')).toContainText('youngest');
  await expect(page.locator('main')).toContainText('resolve a tie');
  await expect(page.locator('main a[href^="/games/"]').last()).toBeVisible();
});
