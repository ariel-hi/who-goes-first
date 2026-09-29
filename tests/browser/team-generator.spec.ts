import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('team results offer a selected manual copy when clipboard access fails', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/random-team-generator/');
  await page.getByRole('textbox', { name: /Names/ }).fill('Alex\nSam\nJordan\nRiley');
  await page.getByRole('button', { name: 'Make teams' }).click();
  await page.evaluate(() => Object.defineProperty(navigator.clipboard, 'writeText', { configurable: true, value: async () => { throw new Error('blocked'); } }));
  await page.getByRole('button', { name: 'Copy teams' }).click();

  const fallback = page.getByRole('textbox', { name: 'Copy this list manually' });
  await expect(fallback).toBeVisible();
  await expect(fallback).toBeFocused();
  const selected = await fallback.evaluate((field: HTMLTextAreaElement) => ({ text: field.value, start: field.selectionStart, end: field.selectionEnd }));
  expect(selected.text).toMatch(/^Team 1: .+\nTeam 2: .+$/);
  expect(selected.start).toBe(0);
  expect(selected.end).toBe(selected.text.length);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).include('.team-tool').analyze()).violations).toEqual([]);

  await page.getByRole('textbox', { name: /Names/ }).fill('Alex\nSam\nJordan\nRiley\nMorgan');
  await expect(fallback).toHaveCount(0);
  await page.getByRole('button', { name: 'Make teams' }).click();
  await page.evaluate(() => Object.defineProperty(navigator.clipboard, 'writeText', { configurable: true, value: async (text: string) => { (window as unknown as { copiedTeams: string }).copiedTeams = text; } }));
  await page.getByRole('button', { name: 'Copy teams' }).click();
  await expect(page.locator('.team-copy-actions [role="status"]')).toHaveText('Teams copied to clipboard.');
  expect(await page.evaluate(() => (window as unknown as { copiedTeams: string }).copiedTeams)).toMatch(/^Team 1: .+\nTeam 2: .+$/);
});

for (const motion of ['no-preference', 'reduce'] as const) {
  test(`team cards replay their restrained reveal with ${motion} motion`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: motion });
    await page.goto('/random-team-generator/');
    await page.getByRole('textbox', { name: /Names/ }).fill('Alex\nSam\nJordan\nRiley');
    await page.getByRole('button', { name: 'Make teams' }).click();
    const first = page.locator('.team-list li').first();
    await expect(first).toBeVisible();
    expect(await first.evaluate(element => getComputedStyle(element).animationName)).toBe(motion === 'reduce' ? 'none' : 'team-arrive');
    await first.evaluate(element => { element.dataset.previousDraw = 'yes'; });
    await page.getByRole('button', { name: 'Shuffle again' }).click();
    await expect(first).not.toHaveAttribute('data-previous-draw', 'yes');
    expect(await first.evaluate(element => getComputedStyle(element).animationName)).toBe(motion === 'reduce' ? 'none' : 'team-arrive');
  });
}
