import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import { ruleSchema } from '../../src/lib/content/schema';

const manifest = JSON.parse(readFileSync('research/claude-batches/codex-sep26-13.json', 'utf8')) as { id: string; bggId: string; random: boolean }[];
const affected = [...manifest, { id: 'citadels-zman-2016-en', bggId: '205398', random: true }, { id: 'love-letter-2025-en', bggId: '277085', random: true }];
const games = affected.map(entry => ({ ...entry, rule: ruleSchema.parse(JSON.parse(readFileSync(`src/content/games/${entry.id}.json`, 'utf8'))) }));
const canonicalOrigin = process.env.EXPECTED_SITE_ORIGIN ?? process.env.SITE_URL ?? 'http://localhost:4321';

const noOpeningTie = new Set(["7-wonders-repos-original-en", "micromacro-crime-city-spielwiese-en", "apples-apples-mattel-en", "great-western-trail-eggert-original-en", "hero-realms-white-wizard-en", "kemet-matagot-original-en", "dominion-rio-grande-original-en"]);
const officialTieRequired = new Set(['gloomhaven-cephalofair-original-en', 'kingsburg-fantasy-flight-original-en', 'love-letter-aeg-original-en']);

for (const game of games) {
  test(`popular batch 13: ${game.id} keeps its exact directory answer and clean share`, async ({ page, request }) => {
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
    if (noOpeningTie.has(game.id)) {
      await expect(page.locator('.game-article').getByRole('heading', { name: 'If there’s a tie', exact: true })).toHaveCount(0);
    }
    if (officialTieRequired.has(game.id)) {
      expect(game.rule.officialTieBreak).toBeTruthy();
      await expect(page.locator('.opening-tie')).toBeVisible();
      await expect(page.locator('.opening-tie')).toContainText(game.rule.officialTieBreak!);
    }

    expect(await page.locator('.source-document').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')))).toEqual(game.rule.sources.map(source => source.url));
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${canonicalOrigin}/games/${game.id}/`);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', `${canonicalOrigin}/games/${game.id}/`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.evaluate(() => history.replaceState({}, '', '?participant=private#result'));
    await page.getByRole('button', { name: 'Share this rule', exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('data-shared-url', new URL(`/games/${game.id}/`, page.url()).href);
  });
}

test('popular batch 13 stays searchable in the rule library and homepage', async ({ page }) => {
  for (const path of ['/games/', '/']) {
    await page.goto(path);
    const surface = page.locator(path === '/' ? '[data-rule-lookup]' : '[data-game-directory]');
    for (const game of games) {
      await surface.getByRole('searchbox').fill(game.rule.gameName);
      await expect(surface.locator(`a[href="/games/${game.id}/"]`).first()).toBeVisible();
    }
  }
});

test('original editions and later editions retain separate directory destinations', async ({ request }) => {
  const rows = await (await request.get('/board-games/search.json')).json() as { id: string; ruleCount: number; slug?: string }[];
  const expected = [
    ['68448', '7-wonders-repos-original-en'], ['316377', '7-wonders-2020-en'],
    ['36218', 'dominion-rio-grande-original-en'], ['209418', 'dominion-2021-en'],
    ['129622', 'love-letter-aeg-original-en'], ['277085', 'love-letter-2025-en'],
    ['478', 'citadels-fantasy-flight-original-en'], ['205398', 'citadels-zman-2016-en'],
    ['84876', 'castles-burgundy-alea-original-en'], ['271320', 'the-castles-of-burgundy-alea-2019-en'],
    ['174430', 'gloomhaven-cephalofair-original-en'], ['390478', 'gloomhaven-second-edition-cephalofair-en'],
    ['193738', 'great-western-trail-eggert-original-en'], ['341169', 'great-western-trail-second-edition-en'],
  ];
  for (const [id, slug] of expected) expect(rows.find(row => row.id === id)).toMatchObject({ ruleCount: 1, slug });
});
