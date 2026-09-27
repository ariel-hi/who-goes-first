import { test, expect } from '@playwright/test';

for (const motion of ['no-preference', 'reduce'] as const) test('coin reset cancels the old session and fresh flips replay with ' + motion + ' motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: motion });
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
  await page.goto('/coin-flip/');
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
  const decline = page.getByRole('button', { name: 'No thanks', exact: true });
  if (await decline.isVisible()) await decline.click();
  const tool = page.locator('.coin-tool');
  const coin = tool.locator('.coin');
  const status = tool.getByRole('status');
  const firstFlip = tool.getByRole('button', { name: 'Flip the coin', exact: true });
  const checkAnimation = async () => {
    const animations = await coin.evaluate(element => element.getAnimations()
      .filter(animation => animation instanceof CSSAnimation)
      .map(animation => ({ name: (animation as CSSAnimation).animationName, duration: animation.effect?.getComputedTiming().duration })));
    if (motion === 'reduce') expect(animations).toEqual([]);
    else {
      expect(animations).toHaveLength(1);
      expect(animations[0]!.name).toMatch(/^coin-(heads|tails)$/);
      expect(animations[0]!.duration).toBe(1100);
    }
  };
  await firstFlip.click();
  await expect(status).toHaveText(/^(Heads|Tails)$/);
  await expect(tool.locator('.tool-tally')).toContainText(/This session: (1 heads, 0 tails|0 heads, 1 tails)\./);
  await expect(coin).not.toHaveClass(/coin-spinning/);

  // Pause after a completed flip. Its removed animation must restart on the next draw.
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000));
  if (await decline.isVisible()) await decline.click();
  await tool.getByRole('button', { name: 'Flip again', exact: true }).click();
  await expect(status).toHaveText(motion === 'reduce' ? /^(Heads|Tails)$/ : 'Flipping…');
  await checkAnimation();
  await tool.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(status).toHaveText('Ready');
  await expect(firstFlip).toBeEnabled();
  await expect(coin).not.toHaveClass(/coin-spinning/);
  await expect(coin).toHaveAttribute('aria-hidden', 'true');
  await expect(tool.locator('.tool-tally')).toHaveCount(0);

  // The canceled reveal must not resurrect the old session, including its 0 ms reduced-motion timer.
  await page.clock.runFor(2200);
  await expect(status).toHaveText('Ready');
  await expect(tool.locator('.tool-tally')).toHaveCount(0);
  await firstFlip.click();
  await expect(status).toHaveText(motion === 'reduce' ? /^(Heads|Tails)$/ : 'Flipping…');
  await checkAnimation();
  await page.clock.runFor(1100);
  await expect(status).toHaveText(/^(Heads|Tails)$/);
  await expect(coin).not.toHaveClass(/coin-spinning/);
  await expect(tool.locator('.tool-tally')).toContainText(/This session: (1 heads, 0 tails|0 heads, 1 tails)\./);
});
