import { test, expect } from '@playwright/test';
import type { RuleIndexEntry } from '../../src/lib/rule-index';

// Exact reviewed cohort. Rule IDs and public slugs intentionally differ.
const sourced = [
  {
    name: 'Beethupferl', identityId: 'game-2300274b-4a9d-448b-97fa-836b973bd8bf',
    ruleId: 'beethupferl-en', slug: 'beethupferl', article: '601105172', openingPage: 6,
    answer: 'The player who last ate a carrot starts.',
    detail: 'Both use the same opening criterion.',
    scope: 'solo play needs no first-player selection.',
    source: 'https://cdn.simba-dickie-group.de/downloads/601105172/601105172-Beethupferl-Anl-Zoch.pdf',
  },
  {
    name: 'Mirakel Mix', identityId: 'game-132a548d-b00a-46ce-a29b-6c40525c452b',
    ruleId: 'mirakel-mix-en', slug: 'mirakel-mix', article: '601105187', openingPage: 9,
    answer: 'The player who last had a colored drink starts.',
    detail: 'then keep the same turn order.',
    scope: 'The game ends immediately when an apprentice leaves the cave',
    source: 'https://cdn.simba-dickie-group.de/downloads/601105187/601105187-MirakelMix-rules-Zoch.pdf',
  },
] as const;
const pending = {
  name: 'Ananda', identityId: 'game-1266d398-3f70-4bb8-bac8-3c96fce358a8',
  reference: 'https://www.zoch-verlag.com/zoch_en/categories/board-games/ananda-601105197-en.html',
} as const;
type StructuredData = {
  '@type'?: string; '@graph'?: StructuredData[]; url?: string; citation?: string[];
  itemListElement?: { name: string; item: string }[];
};

for (const width of [320, 1280]) {
  test(`Zoch next cohort has exact direct answers and pending Ananda recovery at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/board-games/');
    const search = page.getByRole('searchbox', { name: 'Search board games' });
    const results = page.locator('[data-board-directory] [data-results] > li');
    for (const game of sourced) {
      await search.fill(game.name);
      await expect(results).toHaveCount(1);
      await expect(results).toHaveAttribute('data-id', game.identityId);
      await expect(results).toHaveAttribute('data-has-rule', 'true');
      await expect(results.getByRole('link')).toHaveCount(1);
      await expect(results.getByRole('link')).toHaveAttribute('href', `/games/${game.slug}/`);
      await expect(results.getByRole('link')).toContainText(game.name);
      await expect(results.locator('summary')).toHaveCount(0);
      await results.getByRole('link').click();
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(`Who goes first in ${game.name}?`);
      await expect(page.locator('.rule-answer')).toHaveText(game.answer);
      await page.goBack();
      await expect(search).toHaveValue(game.name);
      await expect(results).toHaveAttribute('data-id', game.identityId);
    }
    await search.fill(pending.name);
    await expect(results).toHaveCount(1);
    await expect(results).toHaveAttribute('data-id', pending.identityId);
    await expect(results).toHaveAttribute('data-has-rule', 'false');
    await expect(results.locator('summary')).toContainText('AnandaNo checked starting rule yet');
    await results.locator('summary').click();
    await expect(results.locator('details')).toHaveAttribute('open', '');
    await expect(results.getByRole('link', { name: /Publisher reference/ })).toHaveAttribute('href', pending.reference);
    await expect(results.getByRole('link', { name: 'Pick a player', exact: true })).toHaveAttribute('href', '/');
    await expect(results.getByRole('link')).toHaveCount(2);
    await expect(results.locator('a[href*="boardgamegeek.com"], a[href^="/games/"], a[href^="/board-games/"]')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole('button', { name: 'With a rule', exact: true }).click();
    await expect(results).toHaveCount(0);
    await page.getByRole('button', { name: 'Awaiting a rule', exact: true }).click();
    await expect(results).toHaveAttribute('data-id', pending.identityId);
    await results.locator('summary').click();
    await results.getByRole('link', { name: 'Pick a player', exact: true }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('button', { name: 'Pick a player', exact: true })).toBeEnabled();
  });

  test(`real lazy lookup and public library discover only the two approved answers at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    const indexRequests: string[] = [];
    page.on('request', request => { if (new URL(request.url()).pathname === '/rule-index.json') indexRequests.push(request.url()); });
    await page.goto('/');
    const lookup = page.locator('[data-rule-lookup]');
    const search = lookup.getByRole('searchbox');
    const links = lookup.locator('[data-results]').getByRole('link');
    await expect(search).toBeVisible();
    expect(indexRequests).toHaveLength(0);
    const indexResponse = page.waitForResponse(response => new URL(response.url()).pathname === '/rule-index.json');
    await search.fill(sourced[0].name);
    const response = await indexResponse;
    expect(response.ok()).toBe(true);
    const index = await response.json() as RuleIndexEntry[];
    for (const game of sourced) {
      await search.fill(game.name);
      await expect(links).toHaveCount(1);
      await expect(links).toHaveAttribute('href', `/games/${game.slug}/`);
      await expect(links).toContainText(game.answer);
      expect(index.find(rule => rule.s === game.slug)).toMatchObject({ n: game.name, r: game.answer, p: false });
      expect(index.some(rule => rule.s === game.ruleId)).toBe(false);
    }
    await search.fill(pending.name);
    await expect(lookup.locator('[data-lookup-status]')).toContainText('No checked rule matches');
    await expect(links).toHaveCount(0);
    expect(index.some(rule => rule.n === pending.name)).toBe(false);
    expect(indexRequests).toHaveLength(1);
    const bridge = lookup.getByRole('link', { name: 'Find this game in the directory', exact: true });
    await expect(bridge).toHaveAttribute('href', '/board-games/#q=Ananda');
    await bridge.click();
    await expect(page.getByRole('searchbox', { name: 'Search board games' })).toHaveValue('Ananda');
    await expect(page.locator('[data-results] > li')).toHaveAttribute('data-id', pending.identityId);
    await expect(page.locator('[data-results] > li')).toHaveAttribute('data-has-rule', 'false');
    await page.goto('/games/');
    const library = page.locator('[data-game-directory]');
    const librarySearch = library.getByRole('searchbox');
    const libraryLinks = library.locator('.game-list').getByRole('link');
    for (const game of sourced) {
      await librarySearch.fill(game.name);
      await expect(libraryLinks).toHaveCount(1);
      await expect(libraryLinks).toHaveAttribute('href', `/games/${game.slug}/`);
    }
    await librarySearch.fill(pending.name);
    await expect(library.locator('[data-count]')).toHaveText('0 rules found');
    await expect(libraryLinks).toHaveCount(0);
    await expect(library.getByRole('link', { name: 'Find this game in the directory', exact: true })).toHaveAttribute('href', '/board-games/#q=Ananda');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test(`two English articles preserve pages 6 and 9, generic tie guidance, sharing and metadata at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    for (const game of sourced) {
      await page.goto(`/games/${game.slug}/`);
      const article = page.locator('.game-article');
      await expect(article.getByRole('heading', { level: 1 })).toHaveText(`Who goes first in ${game.name}?`);
      await expect(page.locator('.game-article > p').first()).toHaveText(`Zoch English rules in multilingual booklet, article ${game.article}`);
      await expect(article.locator('.rule-answer')).toHaveText(game.answer);
      const details = article.locator('.rule-section').filter({ has: page.getByRole('heading', { name: 'Rule details', exact: true }) });
      await expect(details).toContainText(game.detail);
      await expect(details).toContainText(game.scope);
      await expect(article.locator('.source-list > li')).toHaveCount(1);
      await expect(article.locator('.source-document')).toContainText('official multilingual rules, English section');
      await expect(article.locator('.source-document')).toHaveAttribute('href', game.source);
      await expect(article.getByRole('link', { name: 'Read the publisher’s rulebook', exact: true })).toHaveAttribute('href', game.source);
      await expect(article.getByRole('link', { name: `View cited page (PDF page ${game.openingPage})`, exact: true })).toHaveAttribute('href', `${game.source}#page=${game.openingPage}`);
      await expect(article.getByRole('heading', { name: 'Official tie-break or fallback', exact: true })).toHaveCount(0);
      await expect(article.locator('.fallback')).toHaveCount(0);
      const tie = article.locator('.rule-section').filter({ has: page.getByRole('heading', { name: 'If there’s a tie', exact: true }) });
      await expect(tie).toContainText('The rulebook doesn’t say.');
      await expect(tie.getByRole('link', { name: 'pick a player at random', exact: true })).toHaveAttribute('href', '/');
      await expect(article.getByRole('link', { name: 'use the player picker', exact: true })).toHaveAttribute('href', '/');
      const share = article.getByRole('button', { name: 'Share this rule', exact: true });
      await expect(share).toBeVisible();
      await expect(share).toBeEnabled();
      const target = await share.boundingBox();
      expect(target).not.toBeNull();
      expect(target!.height).toBeGreaterThanOrEqual(44);
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical).not.toBeNull();
      expect(new URL(canonical!).pathname).toBe(`/games/${game.slug}/`);
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', canonical!);
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', new RegExp(`/og/${game.slug}\\.png$`));
      const schemas = (await page.locator('script[type="application/ld+json"]').allTextContents()).map(text => JSON.parse(text) as StructuredData);
      const nodes = schemas.flatMap(schema => schema['@graph'] ?? [schema]);
      expect(nodes.find(node => node['@type'] === 'WebPage')).toMatchObject({ url: canonical, citation: [game.source] });
      expect(nodes.find(node => node['@type'] === 'BreadcrumbList')?.itemListElement?.at(-1)).toMatchObject({ name: game.name, item: canonical });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  });
}
