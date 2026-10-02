import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('home discovery works without JavaScript and stays below the picker', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('/');
  const library = page.getByRole('heading', { name: 'Who goes first in your game?' });
  await expect(library).toBeVisible();
  const pickerBox = await page.locator('.home-picker').boundingBox();
  const libraryBox = await library.boundingBox();
  expect(libraryBox!.y).toBeGreaterThan(pickerBox!.y + pickerBox!.height);
  await page.locator('.discovery-rules a').first().click();
  await expect(page.locator('.rule-answer')).toBeVisible();
  await context.close();
});

test('tool sharing strips private URL state and recommendations work on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/dice-roller/?private=names#private-result');
  const decline = page.getByRole('button', { name: 'No thanks', exact: true });
  if (await decline.isVisible()) await decline.click();
  await page.getByRole('button', { name: 'More sharing options' }).click();
  // Deterministically exercise the existing clipboard fallback, without sending a post.
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async (value: string) => { Object.assign(window, { copiedToolLink: value }); } } });
  });
  await page.getByRole('button', { name: 'Share this tool', exact: true }).click();
  const copied = await page.evaluate(() => (window as unknown as { copiedToolLink: string }).copiedToolLink);
  expect(new URL(copied).pathname).toBe('/dice-roller/');
  expect(new URL(copied).search).toBe('');
  expect(new URL(copied).hash).toBe('');
  const pinterest = page.getByRole('link', { name: /^Save on Pinterest/ });
  if (await pinterest.count()) {
    const image = new URL((await pinterest.getAttribute('href'))!).searchParams.get('media')!;
    expect(image).not.toContain('/pins/starting-rules.png');
    const response = await page.request.get(new URL(image).pathname);
    expect(response.ok()).toBe(true);
    expect(response.headers()['content-type']).toContain('image/png');
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('.tool-next').getByRole('link', { name: /Score keeper/ }).click();
  await expect(page).toHaveURL(/\/score-keeper\/$/);
});

test('checklist supports keyboard checks, reset, print and accessible mobile layout', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/game-night-checklist/');
  const decline = page.getByRole('button', { name: 'No thanks', exact: true });
  if (await decline.isVisible()) await decline.click();
  const checks = page.getByRole('checkbox');
  await expect(checks).toHaveCount(10);
  await checks.first().focus();
  await page.keyboard.press('Space');
  await expect(checks.first()).toBeChecked();
  await checks.last().check();
  await page.getByRole('button', { name: 'Clear checkmarks' }).click();
  await expect(page.getByRole('checkbox', { checked: true })).toHaveCount(0);
  await expect(page.locator('[data-checklist-status]')).toHaveText('Checkmarks cleared.');
  await page.evaluate(() => Object.assign(window, { print: () => { Object.assign(window, { checklistPrinted: true }); } }));
  await page.getByRole('button', { name: 'Print the checklist' }).click();
  expect(await page.evaluate(() => (window as unknown as { checklistPrinted: boolean }).checklistPrinted)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze()).violations).toEqual([]);
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.site-header')).toBeHidden();
  await expect(page.locator('.checklist-print-address')).toBeVisible();
  await expect(page.locator('.checklist-extras')).toBeHidden();
  if (test.info().project.name === 'chromium') {
    await page.setViewportSize({ width: 816, height: 1056 });
    await page.screenshot({ path: 'artifacts/growth-release/checklist-print.png', fullPage: true });
    await page.pdf({ path: 'artifacts/growth-release/game-night-checklist.pdf', format: 'Letter', printBackground: true });
  }
});
