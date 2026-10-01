import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('desktop finger chooser offers a usable phone handoff and picker', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/finger-chooser/');

  const handoff = page.locator('.finger-handoff');
  await expect(handoff.getByRole('heading', { name: 'Bring everyone to the screen' })).toBeVisible();
  await expect(page.locator('.finger-area')).toHaveCount(0);
  await expect(handoff.getByRole('link', { name: 'whogoesfirst.fun/finger-chooser' })).toHaveAttribute('href', 'https://whogoesfirst.fun/finger-chooser/');
  expect(await handoff.locator('img').evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  expect((await handoff.boundingBox())!.height).toBeLessThan(350);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).include('.finger-handoff').analyze()).violations).toEqual([]);

  await handoff.getByRole('link', { name: /Use the first-player picker on this computer/ }).click();
  await expect(page).toHaveURL(/\/$/);
});

test('touch finger chooser still draws a full turn order', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ hasTouch: true, viewport: { width: 390, height: 844 } });
  // Some touch browsers report zero here; the coarse-pointer fallback must keep the tool usable.
  await context.addInitScript(() => Object.defineProperty(navigator, 'maxTouchPoints', { configurable: true, value: 0 }));
  try {
    const page = await context.newPage();
    await page.goto(baseURL + '/finger-chooser/');
    await expect(page.locator('.finger-area')).toBeVisible();
    await expect(page.locator('.finger-handoff')).toHaveCount(0);
    await page.getByRole('button', { name: 'Full turn order' }).click();
    const area = page.locator('.finger-area');
    for (const pointerId of [1, 2]) await area.dispatchEvent('pointerdown', { pointerId, pointerType: 'touch', clientX: 100 + pointerId * 80, clientY: 500 });
    await expect(area.locator('.finger-ranked')).toHaveCount(2, { timeout: 5000 });
    expect(await area.locator('.finger-ranked b').allTextContents()).toEqual(expect.arrayContaining(['1', '2']));
    for (const pointerId of [1, 2]) await area.dispatchEvent('pointerup', { pointerId, pointerType: 'touch' });
    // Results stay on screen after everyone lifts; the next touch starts over.
    await expect(area.locator('.finger-ranked')).toHaveCount(2);
    await expect(page.locator('#finger-status')).toHaveText('Turn order is set. Touch the screen to play again.');
    await area.dispatchEvent('pointerdown', { pointerId: 3, pointerType: 'touch', clientX: 120, clientY: 500 });
    await expect(area.locator('.finger-ranked')).toHaveCount(0);
    await expect(area.locator('.finger-dot')).toHaveCount(1);
    await area.dispatchEvent('pointerup', { pointerId: 3, pointerType: 'touch' });
    await expect(area.locator('.finger-dot')).toHaveCount(0);
    await expect(page.locator('#finger-status')).toHaveText('Everyone put one finger on the screen and hold still.');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  } finally { await context.close(); }
});
