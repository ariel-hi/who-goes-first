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

for (const theme of ['light', 'dark'] as const) {
  test(`team text retains contrast at an intermediate reveal phase in ${theme} mode`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/random-team-generator/');
    await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
    if (theme === 'dark') await page.getByRole('button', { name: 'Switch to dark mode', exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    await page.getByRole('textbox', { name: /Names/ }).fill('Alex\nSam\nJordan\nRiley\nMorgan\nCasey');
    await page.getByRole('combobox', { name: 'Teams', exact: true }).selectOption('3');
    await page.getByRole('button', { name: 'Make teams', exact: true }).click();
    const cards = page.locator('.team-list li');
    await expect(cards).toHaveCount(3);
    // Sample each real CSS animation one quarter into its active duration,
    // accounting for its stagger. Only these team animations are paused.
    const sample = await cards.evaluateAll(async elements => Promise.all(elements.map(async element => {
      const animation = element.getAnimations().find(animation => animation instanceof CSSAnimation && animation.animationName === 'team-arrive');
      if (!animation?.effect) throw new Error('The team arrival animation is missing.');
      const { delay = 0, duration = 0 } = animation.effect.getTiming();
      animation.pause();
      animation.currentTime = delay + Number(duration) / 4;
      await animation.ready;
      const style = getComputedStyle(element);
      return {
        duration, delay, phase: animation.effect.getComputedTiming().progress,
        state: animation.playState, opacity: style.opacity,
        movement: new DOMMatrixReadOnly(style.transform).m42,
      };
    })));
    for (const [index, card] of sample.entries()) {
      expect(card.duration).toBe(320);
      expect(card.delay).toBe(index * 45);
      expect(card.state).toBe('paused');
      expect(card.phase).toBeGreaterThan(0);
      expect(card.phase).toBeLessThan(1);
      expect(card.movement).toBeGreaterThan(0);
      expect(card.movement).toBeLessThan(9);
    }
    expect((await new AxeBuilder({ page }).include('.team-list').analyze()).violations).toEqual([]);
    expect(sample.map(card => card.opacity)).toEqual(['1', '1', '1']);
  });
}
