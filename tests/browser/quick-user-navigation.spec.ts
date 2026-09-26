// Native user-navigation regression; no clock, randomness, focus or response overrides.
import { test, expect, type Page } from '@playwright/test';

async function scrollSettled(page: Page) {
  await page.evaluate(() => new Promise<void>(resolve => {
    let previous = scrollY, stable = 0;
    const frame = () => {
      stable = Math.abs(scrollY - previous) < .2 ? stable + 1 : 0;
      previous = scrollY;
      if (stable >= 8) resolve(); else requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }));
}

async function prepare(page: Page, width: number, pendingCount = false) {
  await page.setViewportSize({ width, height: width === 320 ? 844 : 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const picker = page.locator('.picker'), button = picker.locator('.picker-card > .primary');
  await expect(button).toBeEnabled();
  // The normal desktop page fits the viewport; the native disclosure supplies
  // actual scroll range without adding or modifying layout in the test.
  if (width === 1280) await page.getByRole('button', { name: 'Preferences', exact: true }).click();
  await page.getByRole('textbox', { name: 'Player count', exact: true }).click();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.type('12');
  if (!pendingCount) {
    await page.keyboard.press('Enter');
    await expect(picker).toHaveAttribute('data-count', '12');
  }
  return { picker, button };
}

for (const width of [320, 1280]) {
  test(`untouched offscreen twelve-player Quick result is recovered at ${width}px`, async ({ page }, testInfo) => {
    const { picker, button } = await prepare(page, width, width === 320);
    if (width === 1280) {
      const box = (await button.boundingBox())!;
      await page.mouse.move(width / 2, 500);
      await page.mouse.wheel(0, box.y - 100);
      await scrollSettled(page);
    }
    // Read-only observer records the first committed result before passive
    // recovery scrolling, so the test proves a real offscreen starting state.
    await page.evaluate(() => {
      const picker = document.querySelector('.picker')!;
      const observer = new MutationObserver(() => {
        if (picker.getAttribute('data-phase') !== 'result') return;
        const rect = picker.querySelector('.winner-announcement p')!.getBoundingClientRect();
        (window as unknown as { firstQuickRect: { top: number; bottom: number } }).firstQuickRect = { top: rect.top, bottom: rect.bottom };
        observer.disconnect();
      });
      observer.observe(picker, { attributes: true, attributeFilter: ['data-phase'] });
    });
    const box = (await button.boundingBox())!;
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await expect(picker).toHaveAttribute('data-count', '12');
    await expect(picker).toHaveAttribute('data-phase', 'result');
    expect(await page.evaluate(() => {
      const rect = (window as unknown as { firstQuickRect: { top: number; bottom: number } }).firstQuickRect;
      return rect.top < 16 || rect.bottom > innerHeight - 16;
    })).toBe(true);
    await expect.poll(() => picker.locator('.winner-announcement p').evaluate(element => {
      const rect = element.getBoundingClientRect();
      return rect.top >= 15 && rect.bottom <= innerHeight - 15;
    })).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`quick-untouched-${width}.png`) });
  });

  test(`Quick completion respects native wheel navigation at ${width}px`, async ({ page }, testInfo) => {
    const { picker, button } = await prepare(page, width);
    if (width === 320) {
      const box = (await button.boundingBox())!;
      await page.mouse.move(width / 2, 500);
      await page.mouse.wheel(0, box.y - 100);
      await scrollSettled(page);
    }
    const initial = await page.evaluate(() => scrollY);
    const box = (await button.boundingBox())!;
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await expect(picker).toHaveAttribute('data-phase', 'revealing');
    await page.mouse.move(width / 2, 600);
    await page.mouse.wheel(0, width === 320 ? -1100 : 1800);
    if (width === 320) await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(initial - 200);
    else await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(initial + 100);
    await scrollSettled(page);
    const before = await page.evaluate(() => ({ phase: document.querySelector('.picker')!.getAttribute('data-phase'), y: scrollY }));
    expect(before.phase).toBe('revealing');
    const destination = await page.evaluateHandle(() => document.activeElement);
    try {
      await expect(picker).toHaveAttribute('data-phase', 'result');
      await expect(picker.locator('.winner-announcement p')).toHaveText(/Seat \d+ goes first\./);
      await scrollSettled(page);
      expect(Math.abs(await page.evaluate(() => scrollY) - before.y)).toBeLessThanOrEqual(1);
      expect(await destination.evaluate(node => node === document.activeElement)).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

      await page.screenshot({ path: testInfo.outputPath(`quick-user-away-${width}.png`) });
      if (width === 1280) {
        // The user-away result stays above the desktop viewport. A subsequent
        // untouched native draw must still recover it: cancellation belongs to
        // the earlier draw only. This uses the established real scroll range,
        // without clocks, focus restoration, layout or response overrides.
        expect(await picker.locator('.winner-announcement p').evaluate(element =>
          element.getBoundingClientRect().bottom)).toBeLessThan(16);
        await page.evaluate(() => {
          const picker = document.querySelector('.picker')!;
          const observer = new MutationObserver(() => {
            if (picker.getAttribute('data-phase') !== 'result') return;
            const rect = picker.querySelector('.winner-announcement p')!.getBoundingClientRect();
            (window as unknown as { nextQuickRect: { top: number; bottom: number } }).nextQuickRect = { top: rect.top, bottom: rect.bottom };
            observer.disconnect();
          });
          observer.observe(picker, { attributes: true, attributeFilter: ['data-phase'] });
        });
        const nextBox = (await button.boundingBox())!;
        // Native coordinates must actually be in the viewport; never force an
        // offscreen click merely to manufacture the reset assertion.
        expect(nextBox.y).toBeGreaterThanOrEqual(0);
        expect(nextBox.y + nextBox.height).toBeLessThanOrEqual(900);
        await page.mouse.click(nextBox.x + nextBox.width / 2, nextBox.y + nextBox.height / 2);
        await expect(picker).toHaveAttribute('data-phase', 'revealing');
        await expect(picker).toHaveAttribute('data-phase', 'result');
        expect(await page.evaluate(() =>
          (window as unknown as { nextQuickRect: { bottom: number } }).nextQuickRect.bottom)).toBeLessThan(16);
        await expect.poll(() => picker.locator('.winner-announcement p').evaluate(element => {
          const rect = element.getBoundingClientRect();
          return rect.top >= 15 && rect.bottom <= innerHeight - 15;
        })).toBe(true);
        await page.screenshot({ path: testInfo.outputPath(`quick-next-draw-${width}.png`) });
      }
    } finally { await destination.dispose(); }
  });
}
