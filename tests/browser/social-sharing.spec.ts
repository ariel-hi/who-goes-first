import { test, expect } from '@playwright/test';
import { getCatalog } from '../../src/lib/content/catalog';
import { getBoardGames } from '../../src/lib/content/board-games';
import { getBrowseShelves, shelfHref } from '../../src/lib/content/board-game-browse';

const rule = getCatalog().find(rule => rule.id === 'catan-2020-en') ?? getCatalog()[0]!;
const chooser = getBoardGames().find(game => game.rules.length > 1)!;
const shelf = getBrowseShelves().letters[0]!;
const paths = ['/', '/games/', '/house-rules/', '/board-games/', shelfHref(shelf.letter), `/board-games/${chooser.routeKey}/`, `/games/${rule.slug}/`, '/printable-game-night/'];
const labels = ['Save on Pinterest', 'Share on Bluesky', 'Share on X', 'Share on Facebook', 'Share on WhatsApp', 'Share on Telegram', 'Share on Reddit', 'Share on LinkedIn', 'Share on Threads', 'Share by email'];
const featured = new Set(['Save on Pinterest', 'Share on WhatsApp', 'Share on Facebook']);

for (const width of [320, 1280]) {
  for (const path of paths) {
    test(`sharing is consistent and points to the current page at ${width}px on ${path}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path + '?names=PrivatePlayer&utm_source=test#private-winner');
      const consent = page.getByRole('button', { name: 'No thanks', exact: true });
      if (await consent.isVisible()) await consent.click();
      const toolbar = page.getByRole('group', { name: 'Share this page', exact: true });
      await expect(toolbar).toHaveCount(1);
      const more = toolbar.getByRole('button', { name: 'More sharing options' });
      await expect(more).toBeVisible();
      await expect(more).toBeEnabled();
      await expect(toolbar.locator('[data-share-button]')).toBeHidden();
      expect((await toolbar.boundingBox())!.height).toBeLessThanOrEqual(45);
      const production = await page.locator('meta[name="google-site-verification"]').count() > 0;
      if (production) {
        await expect(toolbar.locator('.share-quick .share-bubble')).toHaveCount(3);
        for (const label of featured) await expect(toolbar.getByRole('link', { name: new RegExp('^' + label) })).toBeVisible();
        await expect(toolbar.locator('[data-instagram-open]')).toBeHidden();
        await more.focus();
        await page.keyboard.press('Enter');
        await expect(more).toHaveAttribute('aria-expanded', 'true');
        await expect(toolbar.locator('[data-share-button]')).toBeVisible();
        const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
        await expect(toolbar.getByRole('link', { name: 'Open Instagram and copy link (opens in a new tab)' })).toBeVisible();
        for (const label of labels) {
          const link = toolbar.getByRole('link', { name: new RegExp('^' + label) });
          await expect(link).toBeVisible();
          const href = (await link.getAttribute('href'))!;
          const destination = new URL(href);
          const params = destination.searchParams;
          const shared = params.get('url') ?? params.get('u') ?? params.get('text') ?? params.get('body');
          expect(shared).toContain(canonical);
          expect(href).not.toMatch(/PrivatePlayer|private-winner|utm_source|%5Cn/);
          if (label !== 'Share by email') {
            await expect(link).toHaveAttribute('target', '_blank');
            await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
          }
          const box = await link.boundingBox();
          if (featured.has(label)) {
            expect(Math.round(box!.width)).toBe(45);
            expect(Math.round(box!.height)).toBe(45);
          } else {
            await expect(link).toContainText(label === 'Share by email' ? 'Email' : label.replace('Share on ', ''));
            expect(box!.width).toBeGreaterThan(100);
            expect(box!.height).toBeGreaterThanOrEqual(45);
          }
          await link.hover();
        }
        await more.click();
        await expect(more).toHaveAttribute('aria-expanded', 'false');
        await expect(toolbar.locator('[data-instagram-open]')).toBeHidden();
      } else {
        await expect(toolbar.getByRole('link')).toHaveCount(0);
        await more.click();
        await expect(toolbar.locator('[data-share-button]')).toBeVisible();
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      if (path === '/games/' + rule.slug + '/' && width === 320) {
        const decline = page.getByRole('button', { name: 'No thanks', exact: true });
        if (await decline.isVisible()) await decline.click();
        await toolbar.scrollIntoViewIfNeeded();
        await page.screenshot({ path: 'artifacts/sharing-mobile-' + test.info().project.name + '.png', fullPage: false });
      }
    });
  }
}

test('sharing copies a clean link and offers a selectable fallback when clipboard fails', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async (text: string) => { (window as unknown as { copied: string }).copied = text; } } });
  });
  await page.goto(`/games/${rule.slug}/?names=PrivatePlayer#private-winner`);
  const consent = page.getByRole('button', { name: 'No thanks', exact: true });
  if (await consent.isVisible()) await consent.click();
  const toolbar = page.getByRole('group', { name: 'Share this page', exact: true });
  await toolbar.getByRole('button', { name: 'More sharing options' }).click();
  await toolbar.locator('[data-share-button]').click();
  await expect(toolbar.locator('[data-share-status]')).toHaveText('Link copied.');
  expect(await page.evaluate(() => (window as unknown as { copied: string }).copied)).toBe(new URL(`/games/${rule.slug}/`, page.url()).href);
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new Error('Clipboard blocked'); } } });
  });
  await toolbar.locator('[data-share-button]').click();
  await expect(toolbar.locator('[data-share-link]')).toBeVisible();
  await expect(toolbar.locator('[data-share-link]')).toHaveValue(new URL(`/games/${rule.slug}/`, page.url()).href);
  if (await toolbar.locator('[data-instagram-open]').count()) {
    const instagramRequests: string[] = [];
    const instagramRoute = async (route: import('@playwright/test').Route) => {
      instagramRequests.push(route.request().url());
      await route.fulfill({status:200,contentType:'text/html',body:'<!doctype html><title>Owned Instagram test tab</title>'});
    };
    await page.context().route('https://www.instagram.com/**', instagramRoute);
    const opened = page.context().waitForEvent('page');
    await toolbar.locator('[data-instagram-open]').click();
    const instagram = await opened;
    try {
      await expect(instagram).toHaveURL('https://www.instagram.com/');
      await instagram.waitForLoadState('domcontentloaded');
      expect(await instagram.evaluate(() => window.opener === null)).toBe(true);
      expect(instagramRequests).toEqual(['https://www.instagram.com/']);
    } finally {
      await instagram.close();
      await page.context().unroute('https://www.instagram.com/**',instagramRoute);
    }
    await expect(toolbar.locator('[data-instagram-link]')).toBeFocused();
    await expect(toolbar.locator('[data-instagram-link]')).toHaveValue(new URL(`/games/${rule.slug}/`, page.url()).href);
  }
});
