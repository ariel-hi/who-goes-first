import { test, expect, type Route } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

const methods = [
  { mode: 'cards', route: 'cards', scene: '.cards-reveal' },
  { mode: 'dice', route: 'dice', scene: '.dice-reveal' },
  { mode: 'coin', route: 'coin', scene: '.coin-reveal' },
  { mode: 'tower', route: 'towers', scene: '.tower-reveal' },
  { mode: 'straws', route: 'straws', scene: '.straws-reveal' },
  { mode: 'shells', route: 'shells', scene: '.shells-reveal' },
  { mode: 'balloon', route: 'balloon', scene: '.balloon-field' },
] as const;
const names = ['Magnificent Eucalyptus', '王芳', '王芳', 'Alexandra Montgomery', 'Nathaniel Hawthorne', 'Louisa May Alcott', "Player seven's name", 'André François Dupont', 'Elizabeth Bennet', 'Long Lasting Evening', 'Seat eleven extended', 'Christopher Robin'];
const extendedNames = [...names, ...names.map(name => `${name.slice(0, 15)} extended`)];
const roster = extendedNames.map((label, index) => ({ id: `player-${index + 1}`, label }));

for (const width of [320, 1280]) for (const count of [4, 12, 24]) for (const method of methods) {
  if (count === 24 && method.mode !== 'dice' && method.mode !== 'coin') continue;
  test(`${method.mode} loading preserves a Preferences press at ${width}px with ${count} players`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: width === 320 ? 844 : 720 });
    let releaseChunk!: () => void;
    const gate = new Promise<void>(resolve => { releaseChunk = resolve; });
    let requested = 0;
    let pointerHeld = false;
    const chunk = method.mode === 'balloon' ? 'BalloonRise' : 'TableReveals';
    const holdChunk = async (route: Route) => { requested++; await gate; await route.continue(); };
    await page.route(`**/_astro/${chunk}.*.js*`, holdChunk);
    if (count > 4) await page.addInitScript(({ players, mode }) => {
      localStorage.setItem('wgf:preferences:v1', JSON.stringify({ version: 1, remember: true, roster: players, inputMode: 'names', mode, sound: false, motion: 'system' }));
    }, { players: roster.slice(0, count), mode: method.mode });
    try {
      await page.goto(`/methods/${method.route}/`, { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('button', { name: 'Pick a player', exact: true })).toBeEnabled();
      await expect(page.locator('.picker')).toHaveAttribute('data-count', String(count));
      await expect.poll(() => requested).toBeGreaterThan(0);
      const loading = page.locator(`.picker [data-loading-reveal="${method.mode}"]`);
      const realScene = page.locator(`.picker ${method.scene}`);
      const preview = page.locator(`.picker ${method.scene}[data-preview="true"]`);
      const preferences = page.getByRole('button', { name: 'Preferences', exact: true });
      await expect(loading).toBeVisible();
      await expect(loading.locator('.loading-message')).toBeVisible();
      // The scaffold cannot masquerade as a real scene, even for plain selectors.
      await expect(realScene).toHaveCount(0);
      await expect(loading.locator('bdi')).toHaveCount(count);
      expect(await loading.locator('bdi').evaluateAll(labels => labels.every(label => getComputedStyle(label).visibility === 'hidden' && label.getBoundingClientRect().height > 0))).toBe(true);
      expect(await loading.evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0);
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
        return {
          preferences: position(picker.querySelector('button[aria-controls="picker-settings"]')!),
          stage: position(stage),
          scene: position(stage.querySelector('.loading-table,.loading-balloon,[data-preview="true"]')!),
          labels: [...stage.querySelectorAll('bdi')].map(label => ({ text: label.textContent, ...position(label) })),
          scrollX, scrollY,
        };
      });
      const before = await geometry();
      const button = (await preferences.boundingBox())!;
      const point = { x: button.x + button.width / 2, y: button.y + button.height / 2 };
      await page.mouse.move(point.x, point.y);
      await page.mouse.down(); pointerHeld = true;
      releaseChunk();
      await expect(preview).toHaveCount(1);
      await expect(preview).toBeVisible();
      await expect(loading).toHaveCount(0);
      const after = await geometry();
      const evidencePath = testInfo.outputPath('lazy-scene-geometry.json');
      const evidence = { width, count, method: method.mode, requested, point, before, after };
      await writeFile(evidencePath, JSON.stringify(evidence, null, 2), 'utf8');
      await testInfo.attach('lazy-scene-geometry', { path: evidencePath, contentType: 'application/json' });
      for (const part of ['preferences', 'stage', 'scene'] as const) {
        for (const dimension of ['left', 'top', 'width', 'height'] as const) {
          expect(Math.abs(after[part][dimension] - before[part][dimension]), `${part} ${dimension} changed`).toBeLessThanOrEqual(0.5);
        }
      }
      expect(after.labels.map(label => label.text)).toEqual(before.labels.map(label => label.text));
      for (const [index, label] of before.labels.entries()) {
        for (const dimension of ['left', 'top', 'width', 'height'] as const) {
          expect(Math.abs(after.labels[index]![dimension] - label[dimension]), `label ${index + 1} ${dimension} changed`).toBeLessThanOrEqual(0.5);
        }
      }
      if (count > 4) expect(after.labels.map(label => label.text)).toEqual(extendedNames.slice(0, count).map((name, index) => name === '王芳' || (count === 24 && name === '王芳 extended') ? `${name} · #${index + 1}` : name));
      expect(Math.abs(after.scrollX - before.scrollX)).toBeLessThanOrEqual(0.5);
      expect(Math.abs(after.scrollY - before.scrollY)).toBeLessThanOrEqual(0.5);
      await page.mouse.move(point.x, point.y);
      await page.mouse.up(); pointerHeld = false;
      await expect(preferences).toHaveAttribute('aria-expanded', 'true');
      await expect(page.getByLabel('Remember this group')).toBeVisible();
      const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      expect(horizontalOverflow).toBe(false);
      await writeFile(evidencePath, JSON.stringify({ ...evidence, preferencesOpened: await preferences.getAttribute('aria-expanded') === 'true', horizontalOverflow }, null, 2), 'utf8');
    } finally {
      releaseChunk();
      if (pointerHeld) await page.mouse.up();
      await page.unrouteAll({ behavior: 'wait' });
    }
  });
}
