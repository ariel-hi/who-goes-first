import { DEV } from './helpers';
import { expect, test } from '@playwright/test';

test('fun questions use the full pool before repeating', async ({ page }) => {
  test.slow();
  await page.goto('/house-rules/');
  await expect(page.locator('.prompt-list li')).toHaveCount(60);
  const draw = page.locator('[data-next]');
  await expect(page.getByRole('button', { name: 'Skip', exact: true })).toHaveCount(0);
  const seen = new Set<string>();
  for (let i = 0; i < 60; i++) {
    await draw.click();
    if (i === 0) await expect(draw).toHaveText('Another question');
    const question = await page.locator('[data-prompt]').textContent();
    expect(seen.has(question!)).toBe(false);
    seen.add(question!);
  }
  const previous = await page.locator('[data-prompt]').textContent();
  await draw.click();
  await expect(page.locator('[data-prompt]')).not.toHaveText(previous!);
});

test('development house rules list the full question pool', async ({ page }) => {
  await page.goto(`${DEV}/dev/house-rules/`);
  await expect(page.locator('.prompt-list li')).toHaveCount(60);
});
