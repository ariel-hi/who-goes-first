// Native page-navigation regression; native clocks, randomness and focus.
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

for (const width of [320, 1280]) {
  for (const navigation of ['space', 'arrow'] as const) {
    test(`Quick respects native ${navigation} page navigation at ${width}px`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: width === 320 ? 844 : 900 });
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.goto('/');
      const picker = page.locator('.picker'), button = picker.locator('.picker-card > .primary');
      await expect(button).toBeEnabled();
      if (width === 1280) await page.getByRole('button', { name: 'Preferences', exact: true }).click();
      await page.getByRole('textbox', { name: 'Player count', exact: true }).click();
      await page.keyboard.press('ControlOrMeta+A');
      await page.keyboard.type('12');
      await page.keyboard.press('Enter');
      await expect(picker).toHaveAttribute('data-count', '12');
      if (width === 320) {
        const box = (await button.boundingBox())!;
        await page.mouse.move(width / 2, 500);
        await page.mouse.wheel(0, box.y - 100);
        await scrollSettled(page);
      }
      const box = (await button.boundingBox())!;
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.y + box.height).toBeLessThanOrEqual(width === 320 ? 844 : 900);
      // Read-only record of first committed answer before passive recovery.
      await page.evaluate(() => {
        const picker = document.querySelector('.picker')!;
        const observer = new MutationObserver(() => {
          if (picker.getAttribute('data-phase') !== 'result') return;
          const rect = picker.querySelector('.winner-announcement p')!.getBoundingClientRect();
          (window as unknown as { pageKeyRect: { top: number; bottom: number } }).pageKeyRect = { top: rect.top, bottom: rect.bottom };
          observer.disconnect();
        });
        observer.observe(picker, { attributes: true, attributeFilter: ['data-phase'] });
      });
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await expect(picker).toHaveAttribute('data-phase', 'revealing');
      const card = (await picker.locator('.picker-card').boundingBox())!;
      const padding = { x: card.x + 4, y: box.y + box.height / 2 };
      expect(await page.evaluate(({ x, y }) => {
        const element = document.elementFromPoint(x, y);
        return !!element?.closest('.picker') && !element?.closest('button,input,textarea,select,a,summary');
      }, padding)).toBe(true);
      await page.mouse.click(padding.x, padding.y);
      expect(await page.evaluate(() => ['BODY', 'MAIN'].includes(document.activeElement!.tagName))).toBe(true);
      const destination = await page.evaluateHandle(() => document.activeElement);
      try {
        const initial = await page.evaluate(() => scrollY);
        const key = navigation === 'space' ? (width === 320 ? 'Shift+Space' : 'Space') : (width === 320 ? 'ArrowUp' : 'ArrowDown');
        const presses = navigation === 'space' ? (width === 320 ? 2 : 1) : (width === 320 ? 26 : 6);
        for (let i = 0; i < presses; i++) await page.keyboard.press(key);
        if (width === 320) await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(initial - 200);
        else await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(initial + 100);
        await scrollSettled(page);
        await expect(picker).toHaveAttribute('data-phase', 'revealing');
        expect(await destination.evaluate(node => node === document.activeElement)).toBe(true);
        const before = await page.evaluate(() => scrollY);
        await expect(picker).toHaveAttribute('data-phase', 'result');
        await expect(picker.locator('.winner-announcement p')).toHaveText(/Seat \d+ goes first\./);
        expect(await page.evaluate(() => {
          const rect = (window as unknown as { pageKeyRect: { top: number; bottom: number } }).pageKeyRect;
          return rect.top < 16 || rect.bottom > innerHeight - 16;
        })).toBe(true);
        await scrollSettled(page);
        expect(Math.abs(await page.evaluate(() => scrollY) - before)).toBeLessThanOrEqual(1);
        expect(await destination.evaluate(node => node === document.activeElement)).toBe(true);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await page.screenshot({ path: testInfo.outputPath(`quick-native-${navigation}-${width}.png`) });
      } finally { await destination.dispose(); }
    });
  }
}
