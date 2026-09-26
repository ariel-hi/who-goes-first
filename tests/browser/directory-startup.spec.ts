import { test, expect } from '@playwright/test';
import { DEV } from './urls';

for (const destination of ['dev', 'public'] as const) {
  test(`${destination} directory reconciles text entered before its module initializes`, async ({ page }) => {
    let releaseModule!: () => void;
    let signalModuleRequested!: () => void;
    const heldModule = new Promise<void>(resolve => { releaseModule = resolve; });
    const moduleRequested = new Promise<void>(resolve => { signalModuleRequested = resolve; });
    await page.route(url => url.pathname === '/src/components/GameDirectory.astro' && url.searchParams.get('type') === 'script', async route => {
      signalModuleRequested();
      await heldModule;
      await route.continue();
    });
    try {
      // Waiting for load would deadlock on the deliberately held module.
      const path = destination === 'dev' ? '/dev/games/' : '/games/';
      await page.goto(`${DEV}${path}#main`, { waitUntil: 'commit' });
      await moduleRequested;
      const input = page.getByRole('searchbox', { name: 'Search by game or another name' });
      const rows = page.locator('[data-game-directory] .game-list li');
      // This node follows the complete static list; commit need not finish parsing it.
      await expect(page.locator('[data-game-directory] [data-empty]')).toBeAttached();
      const initialCount = await rows.count();
      expect(initialCount).toBeGreaterThan(3);
      const query = destination === 'dev' ? 'TTR' : '  missing-四季-🧩-directory-startup  ';
      await input.fill(query);
      await expect(input).toHaveValue(query);
      // Prove the query was entered while the real module was still blocked.
      await expect(page.locator('[data-game-directory] .game-list li:visible')).toHaveCount(initialCount);
      releaseModule();
      // Do not dispatch a second input event: startup must consume the old value.
      await expect(page.locator('[data-game-directory] .game-list li:visible')).toHaveCount(destination === 'dev' ? 3 : 0);
      await expect(page.locator('[data-game-directory] [data-count]')).toHaveText(destination === 'dev' ? '3 rules found' : '0 rules found');
      await expect(input).toHaveValue(query);
      expect(new URL(page.url()).hash).toBe('#main');
      if (destination === 'public') {
        await expect(page.locator('[data-game-directory] [data-empty]')).toBeVisible();
        await expect(page.getByRole('link', { name: 'Find this game in the directory', exact: true })).toHaveAttribute('href', `/board-games/#q=${encodeURIComponent(query.trim())}`);
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/games\/$/);
      } else {
        await expect(page.locator('[data-game-directory] [data-directory-search]')).toHaveCount(0);
      }
      await input.fill('');
      await expect(page.locator('[data-game-directory] .game-list li:visible')).toHaveCount(initialCount);
      await expect(page.locator('[data-game-directory] [data-empty]')).toBeHidden();
    } finally {
      releaseModule();
    }
  });
}
