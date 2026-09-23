import { expect, test } from '@playwright/test';

test('fun questions use the full pool before repeating', async ({ page }) => {
  await page.goto('/house-rules/');
  await expect(page.locator('.prompt-list li')).toHaveCount(60);
  const draw = page.getByRole('button', { name: 'Choose a question' });
  const seen = new Set<string>();
  for (let i = 0; i < 60; i++) {
    await draw.click();
    const question = await page.locator('[data-prompt]').textContent();
    expect(seen.has(question!)).toBe(false);
    seen.add(question!);
  }
  const previous = await page.locator('[data-prompt]').textContent();
  await draw.click();
  await expect(page.locator('[data-prompt]')).not.toHaveText(previous!);
  await page.goto('http://127.0.0.1:4321/dev/house-rules/');
  await expect(page.locator('.prompt-list li')).toHaveCount(60);
});
