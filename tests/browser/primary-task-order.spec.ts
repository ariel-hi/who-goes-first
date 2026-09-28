import { test, expect } from '@playwright/test';

test('mobile search and question choice appear before sharing', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto('/board-games/');
  const search = page.getByRole('searchbox', { name: 'Search board games' });
  await expect(search).toBeEnabled();
  const searchBox = await search.boundingBox();
  const directoryShare = await page.locator('.social-links').boundingBox();
  expect(searchBox && directoryShare).toBeTruthy();
  expect(searchBox!.y + searchBox!.height).toBeLessThan(directoryShare!.y);

  await page.goto('/house-rules/');
  const choose = page.getByRole('button', { name: 'Choose a question' });
  await expect(choose).toBeEnabled();
  const chooseBox = await choose.boundingBox();
  const questionShare = await page.locator('.social-links').boundingBox();
  expect(chooseBox && questionShare).toBeTruthy();
  expect(chooseBox!.y + chooseBox!.height).toBeLessThan(questionShare!.y);
});

test('the Go rule link shows the edition that gives its short title context', async ({ page }) => {
  await page.goto('/games/');
  const link = page.locator('.game-list a[href="/games/go-bga-tournament-rules-2009-en/"]');
  await expect(link).toContainText('Go');
  await expect(link.locator('small')).toContainText('BGA Tournament rules');
});
