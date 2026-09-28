import { test, expect } from '@playwright/test';

for (const width of [320, 1280]) {
  test(`SimplyFun linked rules keep mode, tie and role distinctions at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));

    await page.goto('/#q=Sumology');
    const lookup = page.locator('[data-rule-lookup]');
    await expect(lookup.getByRole('searchbox')).toHaveValue('Sumology');
    await expect(lookup.locator('[data-results] a')).toHaveAttribute('href', '/games/sumology-simplyfun-en/');
    await lookup.locator('[data-results] a').click();
    await expect(page.locator('.rule-answer')).toContainText('lowest number');
    await expect(page.locator('.opening-tie')).toContainText('second-lowest');
    await expect(page.locator('.source-cited-pages a').first()).toContainText('PDF page 3');
    await expect(page.locator('.source-actions a').last()).toHaveAttribute('href', /Sumology_Rules-003\.pdf/);

    await page.goto('/games/math-medalist-simplyfun-en/');
    await expect(page.locator('.rule-answer')).toContainText('Multiplication Zones');
    await expect(page.locator('.rule-answer')).toContainText('Field of Hundreds');
    await expect(page.locator('.rule-answer')).toContainText('100 + 90 + 10');
    await expect(page.locator('.opening-tie')).toHaveCount(0);
    await expect(page.locator('.fallback')).toContainText('house rule');

    await page.goto('/games/trifusion-simplyfun-en/');
    await expect(page.locator('.rule-answer')).toContainText('youngest player');
    await expect(page.locator('article')).toContainText('oldest player keeps score');

    const directory = await page.request.get('/board-games/search.json');
    expect(directory.ok()).toBe(true);
    const entries = await directory.json() as Array<{ name: string; ruleCount: number; slug?: string }>;
    for (const name of ['Nebulous Connections', 'Poles Apart', 'Team Digger']) {
      expect(entries.find(item => item.name === name)).toMatchObject({ ruleCount: 0 });
    }
    expect(errors).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
