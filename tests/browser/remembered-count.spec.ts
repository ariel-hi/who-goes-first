import { test, expect } from '@playwright/test';

for (const width of [320, 1280]) for (const input of ['fill', 'keyboard'] as const) {
  test(`remembered count is coherent before the first ${input} edit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    // Explicit saved-preference fixture; selection randomness and clocks remain native.
    await page.addInitScript(() => {
      localStorage.setItem('wgf:preferences:v1', JSON.stringify({ version: 1, remember: true, roster: Array.from({ length: 12 }, (_, index) => ({ id: `player-${index + 1}`, label: `Friend ${index + 1}` })), inputMode: 'names', mode: 'coin', sound: false, motion: 'system' }));
      const observations: Array<{ count: string | null; value: string }> = [];
      Object.assign(window, { __firstEnabledCounts: observations });
      const observer = new MutationObserver(() => {
        const count = document.querySelector<HTMLInputElement>('#player-count');
        if (count?.matches(':enabled') && !observations.length) observations.push({ count: count.closest('.picker')?.getAttribute('data-count') ?? null, value: count.value });
      });
      observer.observe(document, { childList: true, subtree: true, attributes: true });
    });
    await page.goto('/methods/coin/');
    const count = page.getByLabel('Player count', { exact: true });
    await expect(count).toBeEnabled();
    // Do not wait for a separate passive count synchronization before editing.
    if (input === 'fill') await count.fill('25');
    else { await count.focus(); await count.press('ControlOrMeta+A'); await count.pressSequentially('25'); }
    await count.blur();
    await expect(count).toHaveValue('25');
    await expect(page.locator('.picker')).toHaveAttribute('data-count', '25');
    await expect(page.locator('.player')).toHaveCount(25);
    await expect(page.getByLabel('Name for player 12', { exact: true })).toHaveValue('Friend 12');
    await expect(page.getByText('Coin Flip fits up to 24 players. Quick is selected for your group of 25.', { exact: true })).toBeVisible();
    const first = await page.evaluate(() => (window as unknown as { __firstEnabledCounts: Array<{ count: string; value: string }> }).__firstEnabledCounts);
    expect(first).toEqual([{ count: '12', value: '12' }]);
    await page.getByRole('button', { name: 'Preferences', exact: true }).click();
    await page.getByRole('button', { name: 'Forget this group', exact: true }).click();
    await expect(count).toHaveValue('4');
    await expect(page.locator('.player')).toHaveCount(4);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
