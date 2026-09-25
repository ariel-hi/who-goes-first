import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('home starts with the picker, then a game-rule lookup below it', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Pick a player');
  await expect(page.getByRole('heading', { name: 'Who goes first?', exact: true })).toHaveCount(0);
  const picker = await page.locator('.home-picker').boundingBox();
  const directory = await page.locator('.home-rules').boundingBox();
  expect(directory!.y).toBeGreaterThanOrEqual(picker!.y + picker!.height);
  await expect(page.getByRole('heading', { name: 'Playing a specific game?' })).toBeVisible();
  // The rule catalog is fetched on demand instead of being embedded in the page.
  expect((await page.content()).length).toBeLessThan(60000);
  await expect(page.locator('[data-random-rule]')).toHaveCount(0);
  const search = page.getByRole('searchbox', { name: /Search .* games/ });
  await search.fill('catan');
  await expect(page.locator('.rule-lookup-results a').first()).toHaveAttribute('href', '/games/catan-2020-en/');
  await search.fill('qqqzzzz');
  await expect(page.locator('[data-lookup-status]')).toContainText('No rule for that game yet');
  await expect(page.locator('.rule-lookup-results')).toBeHidden();
  await search.fill('');
  await expect(page.getByRole('link', { name: 'Try a random rule' })).toHaveAttribute('href', '/games/#random-rule');
  // Four methods up front; the rest one tap away.
  await expect(page.locator('input[name=presentation]')).toHaveCount(4);
  await page.getByRole('button', { name: 'More methods' }).click();
  await expect(page.locator('input[name=presentation]')).toHaveCount(10);
  await expect(page.getByRole('button', { name: 'More methods' })).toHaveCount(0);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze()).violations).toEqual([]);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  const button = await page.getByRole('button', { name: 'Pick a player', exact: true }).boundingBox();
  expect(button!.y + button!.height).toBeLessThan(844);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: test.info().outputPath('home-mobile.png'), fullPage: true });
});

test('a method chosen elsewhere stays visible without opening More', async ({ page }) => {
  await page.goto('/methods/shells/');
  await expect(page.getByRole('radio', { name: 'Shell Game', exact: true })).toBeChecked();
  await expect(page.getByRole('button', { name: 'More methods' })).toHaveCount(0);
});
