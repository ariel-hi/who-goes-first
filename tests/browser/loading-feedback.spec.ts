import { test, expect, type Route } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

for (const motion of ['reduce', 'no-preference'] as const) for (const [name, label] of [
  ['CJK', '王芳'.repeat(12)],
  ['emoji', '👨‍👩‍👧‍👦'.repeat(24)],
] as const) test(`tall ${name} loading feedback stays below the sticky result with ${motion} motion`, async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.emulateMedia({ reducedMotion: motion });
  const roster = Array.from({ length: 24 }, (_, index) => ({ id: `player-${index + 1}`, label }));
  await page.addInitScript(players => {
    localStorage.setItem('wgf:preferences:v1', JSON.stringify({ version: 1, remember: true, roster: players, inputMode: 'names', mode: 'coin', sound: false, motion: 'system' }));
  }, roster);
  let releaseChunk!: () => void;
  const gate = new Promise<void>(resolve => { releaseChunk = resolve; });
  const holdChunk = async (route: Route) => { await gate; await route.continue(); };
  await page.route('**/_astro/TableReveals.*.js*', holdChunk);
  const geometry = () => page.evaluate(() => {
    const stage = document.querySelector('.picker .reveal-stage')!;
    const result = document.querySelector('.picker .result-area')!.getBoundingClientRect();
    const range = document.createRange();
    range.selectNodeContents(stage.querySelector('.loading-message')!);
    const text = range.getBoundingClientRect();
    const rect = stage.getBoundingClientRect();
    return { textTop: text.top, textBottom: text.bottom, resultBottom: result.bottom, stageTop: rect.top, stageHeight: rect.height, viewportHeight: innerHeight, scrollY, overflow: document.documentElement.scrollWidth > innerWidth };
  });
  try {
    await page.goto('/methods/coin/', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('button', { name: 'Pick a player', exact: true })).toBeEnabled();
    await expect(page.locator('.picker')).toHaveAttribute('data-count', '24');
    await expect(page.locator('.loading-message')).toBeVisible();
    await page.getByRole('button', { name: 'Pick a player', exact: true }).click();
    // Check after the draw requests its scroll; the deadline remains independent of the chunk.
    await expect.poll(async () => {
      const measured = await geometry();
      return measured.textTop >= measured.resultBottom + 8 && measured.textBottom <= measured.viewportHeight;
    }).toBe(true);
    const revealing = await geometry();
    expect(revealing.stageHeight).toBeGreaterThan(revealing.viewportHeight);
    expect(revealing.overflow).toBe(false);
    await expect(page.getByRole('button', { name: 'Pick again', exact: true })).toBeEnabled();
    const settled = await geometry();
    expect(settled.textTop).toBeGreaterThanOrEqual(settled.resultBottom + 8);
    expect(settled.textBottom).toBeLessThanOrEqual(settled.viewportHeight);
    const path = testInfo.outputPath('loading-feedback.json');
    await writeFile(path, JSON.stringify({ name, motion, revealing, settled }, null, 2), 'utf8');
    await testInfo.attach('loading-feedback', { path, contentType: 'application/json' });
    releaseChunk();
    await expect(page.locator('.coin-reveal[data-settled="true"]')).toBeVisible();
    await expect(page.locator('.loading-message')).toHaveCount(0);
  } finally {
    releaseChunk();
    await page.unrouteAll({ behavior: 'wait' });
  }
});
