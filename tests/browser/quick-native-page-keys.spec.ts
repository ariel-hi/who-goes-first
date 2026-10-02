// Native page-navigation regression; native clocks, randomness and focus.
import { test, expect, type JSHandle, type Page } from '@playwright/test';

async function scrollSettled(page: Page, destination?: JSHandle<Element | null>) {
  return page.evaluate(destination => new Promise<{ phase: string | null; y: number; focusPreserved: boolean }>(resolve => {
    let previous = scrollY, stable = 0;
    const frame = () => {
      stable = Math.abs(scrollY - previous) < .2 ? stable + 1 : 0;
      previous = scrollY;
      if (stable >= 8) resolve({
        phase: document.querySelector('.picker')!.getAttribute('data-phase'),
        y: scrollY,
        focusPreserved: !destination || destination === document.activeElement,
      });
      else requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }), destination);
}

for (const width of [320, 1280]) {
  for (const navigation of ['space', 'arrow'] as const) {
    test(`Quick respects native ${navigation} page navigation at ${width}px`, async ({ page }, testInfo) => {
      const height = 640;
      await page.setViewportSize({ width, height });
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
      const initialButton = (await button.boundingBox())!;
      // A tall roster can put the draw control below the viewport at either width.
      // Bring it into view with native scrolling before the pointer activation.
      if (width === 320 || initialButton.y < 0 || initialButton.y + initialButton.height > height) {
        await page.mouse.move(width / 2, 500);
        await page.mouse.wheel(0, initialButton.y - (width === 320 ? height - 100 : 100));
        await scrollSettled(page);
      }
      const box = (await button.boundingBox())!;
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.y + box.height).toBeLessThanOrEqual(height);
      // Plan the native interaction before the short reveal starts.
      const card = (await picker.locator('.picker-card').boundingBox())!;
      const padding = { x: card.x + 4, y: box.y + box.height / 2 };
      expect(await page.evaluate(({ x, y }) => {
        const element = document.elementFromPoint(x, y);
        return !!element?.closest('.picker') && !element?.closest('button,input,textarea,select,a,summary');
      }, padding)).toBe(true);
      // A compact mobile viewport puts the result offscreen with fewer real
      // keys, leaving time to observe settlement within Quick's normal reveal.
      const arrowPresses = width === 320 ? 8 : Math.max(6, Math.ceil((Math.max(0, card.y) + 80) / 32));
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
      await page.mouse.click(padding.x, padding.y);
      expect(await page.evaluate(() => ['BODY', 'MAIN'].includes(document.activeElement!.tagName))).toBe(true);
      const destination = await page.evaluateHandle(() => document.activeElement);
      try {
        const initial = await page.evaluate(() => scrollY);
        const key = navigation === 'space' ? (width === 320 ? 'Shift+Space' : 'Space') : (width === 320 ? 'ArrowUp' : 'ArrowDown');
        // The opening changes the card's position. Native arrow steps vary by
        // engine, so allow enough real presses to move past its result heading.
        const presses = navigation === 'space' ? (width === 320 ? 2 : 1) : arrowPresses;
        for (let i = 0; i < presses; i++) await page.keyboard.press(key);
        if (width === 320) await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(initial - 200);
        else await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(initial + 100);
        const settled = await scrollSettled(page, destination);
        // Observe the phase at the settling frame, before a delayed browser
        // command could sample a result that has since legitimately completed.
        expect(settled.phase).toBe('revealing');
        expect(settled.focusPreserved).toBe(true);
        expect(await destination.evaluate(node => node === document.activeElement)).toBe(true);
        const before = settled.y;
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
