import { test, expect, type Route } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

for (const viewport of [{ width: 1280, height: 720 }, { width: 320, height: 844 }]) {
  test(`Spinner chunk replacement preserves a Preferences pointer press at ${viewport.width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport);
    const chunkPattern = '**/_astro/TableReveals.*.js*';
    let releaseChunk!: () => void;
    const chunkGate = new Promise<void>(resolve => { releaseChunk = resolve; });
    let chunkRequests = 0;
    let pointerHeld = false;
    const holdChunk = async (route: Route) => {
      chunkRequests++;
      await chunkGate;
      await route.continue();
    };
    await page.route(chunkPattern, holdChunk);
    try {
      // Do not wait for load while deliberately holding a preload/import.
      await page.goto('/methods/spinner/', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('button', { name: 'Pick a player', exact: true })).toBeEnabled();
      await expect.poll(() => chunkRequests).toBeGreaterThan(0);
      const loading = page.locator('.picker .reveal-stage .reveal-loading');
      const preview = page.locator('.picker .spinner-stage[data-preview="true"]');
      const preferences = page.getByRole('button', { name: 'Preferences', exact: true });
      await expect(loading).toBeVisible();
      await expect(preview).toHaveCount(0);
      await expect(preferences).toBeEnabled();
      await expect(preferences).toHaveAttribute('aria-expanded', 'false');
      await preferences.scrollIntoViewIfNeeded();

      const geometry = () => page.evaluate(() => {
        const position = (element: Element) => {
          const rect = element.getBoundingClientRect();
          return { left: rect.left + scrollX, top: rect.top + scrollY, width: rect.width, height: rect.height };
        };
        const picker = document.querySelector('.picker')!;
        const stage = picker.querySelector('.reveal-stage')!;
        const stageStyle = getComputedStyle(stage);
        return {
          preferences: position(picker.querySelector('button[aria-controls="picker-settings"]')!),
          stage: position(stage),
          scene: position(stage.querySelector('.reveal-loading, .spinner-stage')!),
          stageContentWidth: stage.getBoundingClientRect().width - ['border-left-width', 'border-right-width', 'padding-left', 'padding-right'].reduce((sum, property) => sum + parseFloat(stageStyle.getPropertyValue(property)), 0),
          scrollX, scrollY,
        };
      });
      const before = await geometry();
      const button = (await preferences.boundingBox())!;
      const point = { x: button.x + button.width / 2, y: button.y + button.height / 2 };
      await page.mouse.move(point.x, point.y);
      await page.mouse.down();
      pointerHeld = true;

      // Replace the loading scene during an actual native pointer press.
      releaseChunk();
      await expect(preview).toHaveCount(1);
      await expect(preview).toBeVisible();
      await expect(loading).toHaveCount(0);
      const after = await geometry();
      const evidencePath = testInfo.outputPath('spinner-lazy-transition-geometry.json');
      await writeFile(evidencePath, JSON.stringify({ viewport, chunkRequests, point, before, after }, null, 2), 'utf8');
      await testInfo.attach('spinner-lazy-transition-geometry', {
        path: evidencePath,
        contentType: 'application/json',
      });
      for (const part of ['preferences', 'stage', 'scene'] as const) {
        for (const dimension of ['left', 'top', 'width', 'height'] as const) {
          expect(Math.abs(after[part][dimension] - before[part][dimension]), `${part} ${dimension} changed`).toBeLessThanOrEqual(0.5);
        }
      }
      expect(Math.abs(before.scene.width - before.scene.height)).toBeLessThanOrEqual(0.5);
      expect(before.scene.width).toBeLessThanOrEqual(235.5);
      expect(Math.abs(before.scene.width - Math.min(before.stageContentWidth, 235))).toBeLessThanOrEqual(0.5);
      // Scroll anchoring must not move the viewport under the held pointer.
      expect(Math.abs(after.scrollX - before.scrollX)).toBeLessThanOrEqual(0.5);
      expect(Math.abs(after.scrollY - before.scrollY)).toBeLessThanOrEqual(0.5);

      await page.mouse.move(point.x, point.y);
      await page.mouse.up();
      pointerHeld = false;
      await expect(preferences).toHaveAttribute('aria-expanded', 'true');
      await expect(page.getByLabel('Remember this group')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    } finally {
      releaseChunk();
      if (pointerHeld) await page.mouse.up();
      // This isolated page has only this gate; release all in-flight handlers.
      await page.unrouteAll({ behavior: 'wait' });
    }
  });
}
