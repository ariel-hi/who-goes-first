import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('home starts with the picker and keeps game rules below and within its section', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Pick a player');
  await expect(page.getByRole('heading', { name: 'Who goes first?', exact: true })).toHaveCount(0);
  await expect(page.getByText('From the rulebook', { exact: true })).toHaveCount(0);
  await expect(page.getByText('A fair draw', { exact: true })).toHaveCount(0);
  const picker = await page.locator('.home-picker').boundingBox();
  const directory = await page.locator('.home-rules').boundingBox();
  expect(directory!.y).toBeGreaterThanOrEqual(picker!.y + picker!.height);
  await expect(page.locator('.home-picker .home-rule-picker')).toBeVisible();
  await page.locator('.home-rule-picker summary').click();
  await page.getByRole('button', { name: 'Pick a rule' }).click();
  await expect(page.locator('[data-rule-answer]')).not.toBeEmpty();
  const choices = JSON.parse((await page.locator('[data-random-rule]').getAttribute('data-choices'))!) as { id: string }[];
  expect(choices.some(choice => choice.id === 'sushi-go-2014-en')).toBe(false);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze()).violations).toEqual([]);
  await page.locator('.home-rule-picker summary').click();
  await page.setViewportSize({ width: 390, height: 844 });
  const button = await page.getByRole('button', { name: 'Pick a player', exact: true }).boundingBox();
  expect(button!.y + button!.height).toBeLessThan(844);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: test.info().outputPath('home-mobile.png'), fullPage: true });
});
