import { test, expect } from '@playwright/test';
import { DEV } from './urls';

for (const width of [320, 1280]) {
  test(`a Rules Reference seeker can open the exact full document at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(`${DEV}/games/star-wars-rebellion-ffg-en/`);

    const sources = page.getByRole('navigation', { name: 'Rulebook sources', exact: true });
    await expect(sources.getByRole('link')).toHaveCount(3);
    await expect(sources.getByRole('link', { name: 'View cited page (PDF page 4)', exact: true })).toHaveAttribute('href', /sw03_learn_to_play_web\.pdf#page=4$/);
    await expect(sources.getByRole('link', { name: 'Read Star Wars: Rebellion: Learn to Play (PDF)', exact: true })).toHaveAttribute('href', /sw03_learn_to_play_web\.pdf$/);
    const reference = sources.getByRole('link', { name: 'Read Star Wars: Rebellion: Rules Reference (PDF)', exact: true });
    await expect(reference).toHaveAttribute('href', 'https://images-cdn.fantasyflightgames.com/filer_public/d9/76/d97645d4-3973-41b6-ad78-6c9b927d3bc1/sw03_rules_reference_web.pdf');
    await reference.scrollIntoViewIfNeeded();
    await expect(reference).toBeVisible();
    expect(await reference.evaluate(link => {
      const bounds = link.getBoundingClientRect();
      return bounds.left >= 0 && bounds.right <= window.innerWidth && bounds.height >= 44;
    })).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator('.rule-answer')).toContainText('The Rebel player goes first');
  });
}
