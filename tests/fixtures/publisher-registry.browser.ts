// Explicit copied-site suite: outside tests/browser and normal discovery.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
const base = process.env.IDENTITY_FIXTURE_BASE;
const directory = process.env.IDENTITY_FIXTURE_DIR;
if (!base || !directory || new URL(base).hostname !== '127.0.0.1') throw new Error('An owned loopback fixture URL and copied fixture directory are required');
const fixture = JSON.parse(readFileSync(join(directory, 'identity-fixture.json'), 'utf8')) as { neverDeploy: boolean; identities: { identityId: string; name: string; shelf: string }[]; article: string; chooser: string; draft: string };
if (!fixture.neverDeploy) throw new Error('Expected a synthetic copied site');
for (const width of [320, 1280]) {
  test(`no-BGG directory filters and exact edition lookup at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${base}/board-games/`);
    await page.getByRole('searchbox').fill('Offline Fixture');
    await expect(page.locator('[data-results] > li')).toHaveCount(4);
    await page.getByRole('button', { name: 'With a rule', exact: true }).click();
    await expect(page.locator('[data-results] > li')).toHaveCount(2);
    await expect(page.locator(`[data-results] [data-id="${fixture.chooser}"] > a`)).toHaveAttribute('href', `/board-games/${fixture.chooser}/`);
    await page.getByRole('button', { name: 'Awaiting a rule', exact: true }).click();
    await expect(page.locator('[data-results] > li')).toHaveCount(2);
    await page.locator(`[data-results] [data-id="${fixture.identities[1]!.identityId}"] summary`).click();
    await expect(page.locator('[data-results]')).not.toContainText('BGG');
    await expect(page.locator(`[data-results] [data-id="${fixture.identities[1]!.identityId}"] a.directory-picker-link`)).toHaveAttribute('href', '/');
    await page.goto(`${base}/`);
    await page.locator('[data-rule-lookup] input').fill('Offline alternate Article');
    await page.locator(`[data-rule-lookup] a[href="/games/${fixture.article}/"]`).click();
    await expect(page.locator('h1')).toContainText('Offline Fixture Article');
    await expect(page.locator('.rule-answer')).toContainText('fictional fixture');
    const index = await (await page.request.get(`${base}/rule-index.json`)).json() as { s: string; p: boolean }[];
    expect(index.find(rule => rule.s === fixture.article)?.p).toBe(false);
    expect(index.some(rule => rule.s === fixture.draft)).toBe(false);
    expect((await page.request.get(`${base}/dev/rules/${fixture.draft}/`)).status()).toBe(404);
    await page.goto(`${base}/games/`);
    await page.locator('[data-game-directory] input').fill('Offline alternate Article');
    await expect(page.locator('[data-game-directory] li:visible')).toHaveCount(1);
    await expect(page.locator('[data-game-directory] li:visible > a')).toHaveAttribute('href', `/games/${fixture.article}/`);
  });
  test(`no-JS no-BGG shelves, chooser and source article at ${width}`, async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 900 } });
    try {
      const page = await context.newPage();
      for (const identity of fixture.identities) {
        await page.goto(`${base}${identity.shelf}`);
        const row = page.locator(`[data-directory-shelf] [data-id="${identity.identityId}"]`);
        await expect(row).toContainText(identity.name);
        await expect(row).not.toContainText('BoardGameGeek');
      }
      await page.goto(`${base}/board-games/${fixture.chooser}/`);
      await expect(page.locator('.game-list > li')).toHaveCount(2);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(`/board-games/${fixture.chooser}/$`));
      await page.goto(`${base}/games/${fixture.article}/`);
      await expect(page.locator('h1')).toContainText('Offline Fixture Article');
      await expect(page.locator('a[href="https://publisher.example/manual/"]').first()).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    } finally { await context.close(); }
  });
}
