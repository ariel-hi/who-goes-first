import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import { ruleSchema } from '../../src/lib/content/schema';

const manifest = JSON.parse(readFileSync('research/claude-batches/codex-sep26-12.json', 'utf8')) as { id: string; bggId: string; random: boolean }[];
const games = manifest.map(entry => ({ ...entry, rule: ruleSchema.parse(JSON.parse(readFileSync(`src/content/games/${entry.id}.json`, 'utf8'))) }));
const canonicalOrigin = process.env.EXPECTED_SITE_ORIGIN ?? process.env.SITE_URL ?? 'http://localhost:4321';

for (const game of games) {
  test(`popular batch 12: ${game.rule.gameName} keeps its exact directory answer and clean share`, async ({ page, request }) => {
    await page.setViewportSize({ width: 320, height: 844 });
    await page.addInitScript(() => Object.defineProperty(navigator, 'share', { configurable: true, value: async (data: { url: string }) => { document.documentElement.dataset.sharedUrl = data.url; } }));
    const directory = await (await request.get('/board-games/search.json')).json() as { id: string; ruleCount: number; slug?: string }[];
    expect(directory.find(row => row.id === game.bggId)).toMatchObject({ ruleCount: 1, slug: game.id });
    await page.goto('/board-games/');
    await page.getByRole('searchbox', { name: 'Search board games' }).fill(game.rule.gameName);
    const link = page.locator(`[data-board-directory] [data-results] a[href="/games/${game.id}/"]`);
    await expect(link).toBeVisible();
    await link.click();
    await expect(page.locator('.rule-answer')).toHaveText(game.rule.firstPlayerRule);
    await expect(page.locator('.game-article')).toContainText(game.rule.editionLabel);
    expect(await page.locator('.source-document').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')))).toEqual(game.rule.sources.map(source => source.url));
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${canonicalOrigin}/games/${game.id}/`);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', `${canonicalOrigin}/games/${game.id}/`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.evaluate(() => history.replaceState({}, '', '?participant=private#result'));
    await page.getByRole('button', { name: 'More sharing options', exact: true }).click();
    await page.getByRole('button', { name: 'Share this rule', exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('data-shared-url', new URL(`/games/${game.id}/`, page.url()).href);
  });
}

test('popular batch 12 stays searchable in the rule library and homepage', async ({ page }) => {
  for (const path of ['/games/', '/']) {
    await page.goto(path);
    const surface = page.locator(path === '/' ? '[data-rule-lookup]' : '[data-game-directory]');
    for (const game of games) {
      await surface.getByRole('searchbox').fill(game.rule.gameName);
      await expect(surface.locator(`${path === '/' ? '[data-results]' : '[data-search-results]'} a[href="/games/${game.id}/"]`)).toBeVisible();
    }
  }
});
