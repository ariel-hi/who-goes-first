import { test, expect } from '@playwright/test';
import type { RuleIndexEntry } from '../../src/lib/rule-index';

// Source-only proposal: run only after these exact pending rules are approved and enrolled.
// Existing opaque identities are reused; rule IDs are not public route slugs.
const games = [
  {
    name: "Käpt'n Memo", identityId: 'game-20ec80fb-32d8-4764-816e-285e0d0cb292',
    ruleId: 'kaeptn-memo-en', slug: 'kaeptn-memo', openingPage: 2,
    edition: 'English summary of Zoch German rules, article 601105221',
    answer: 'The player who most recently disembarked from a ship becomes captain of the first voyage.',
    details: [
      'For each later voyage, the player to the left of the current captain becomes the new captain.',
      'this is not a separate solo mode.',
      'These comparisons do not choose the first captain.',
    ],
    sourceTitle: "Käpt'n Memo: official German rules, summarized in English",
    source: 'https://pim.simba-dickie.com/Product/Zoch/Family/601105221%20K%C3%A4pt%27n%20Memo/007%20Artwork-Manual/601105221-Ka%CC%88ptnMemo-Rules-Zoch-DE.pdf',
    citedPages: [2, 1, 4, 5, 6], locator: 'PDF/printed page 2, Spielvorbereitung',
  },
  {
    name: 'Kleiner Drache Wirbelwind', identityId: 'game-c60afcd1-5e6b-44ed-a41a-dbd91376d400',
    ruleId: 'kleiner-drache-wirbelwind-en', slug: 'kleiner-drache-wirbelwind', openingPage: 7,
    edition: 'Zoch English rules in multilingual booklet, article 601105202',
    answer: 'The player with the sunniest smile may choose who starts.',
    details: [
      'that person is not automatically the first player.',
      'the English rules do not specify a clockwise or counterclockwise direction.',
      'This does not select a new starter.',
      'With one player, there is no first-player choice to make;',
    ],
    sourceTitle: 'Kleiner Drache Wirbelwind: official multilingual rules, English section',
    source: 'https://pim.simba-dickie.com/Product/Zoch/Family/601105202%20Kleiner%20Drache%20Wirbelwind/099%20Middleware%20%28Import%20only%29/601105202-Wirbelwind-Regel.pdf',
    citedPages: [7, 6, 9, 10], locator: 'PDF7–10 have no visible printed page numbers.',
  },
  {
    name: 'Mach die Flatter', identityId: 'game-5a318f64-4fde-423e-9a63-e3887b7de5de',
    ruleId: 'mach-die-flatter-en', slug: 'mach-die-flatter', openingPage: 11,
    edition: 'Zoch English rules in multilingual booklet, article 601105203',
    answer: 'The player who last saw a parrot starts.',
    details: [
      'the English rules do not specify a clockwise or counterclockwise direction.',
      'everyone reveals their chosen location card simultaneously',
      'This does not make the game opening simultaneous.',
      'they share the win. This is not a tie-break for the opening criterion.',
    ],
    sourceTitle: 'Mach die Flatter: official multilingual rules, English section',
    source: 'https://pim.simba-dickie.com/Product/Zoch/Young%20%26%20Wild/601105203%20Mach%20die%20Flatter/099%20Middleware%20%28Import%20only%29/601105203-MachDie_Flatter-Rules.pdf',
    citedPages: [11, 9, 12, 13, 14, 16], locator: 'PDF/printed page11, Course of the Game',
  },
] as const;

type StructuredData = {
  '@type'?: string; '@graph'?: StructuredData[]; url?: string; citation?: string[];
  itemListElement?: { name: string; item: string }[];
};

for (const width of [320, 1280]) {
  for (const game of games) test(`${game.ruleId} leads to its exact scoped article and restores native Back at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/board-games/');
    const search = page.getByRole('searchbox', { name: 'Search board games' });
    const rows = page.locator('[data-board-directory] [data-results] > li');
    {
      await search.fill(game.name);
      await expect(rows).toHaveCount(1);
      await expect(rows).toHaveAttribute('data-id', game.identityId);
      await expect(rows).toHaveAttribute('data-has-rule', 'true');
      await expect(rows.getByRole('link')).toHaveCount(1);
      await expect(rows.getByRole('link')).toHaveAttribute('href', `/games/${game.slug}/`);
      await expect(rows.getByRole('link')).toContainText(game.name);
      await expect(rows.locator('summary, a[href*="boardgamegeek.com"]')).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await rows.getByRole('link').click();

      const article = page.locator('.game-article');
      await expect(article.getByRole('heading', { level: 1 })).toHaveText(`Who goes first in ${game.name}?`);
      await expect(article.locator('.rule-edition')).toHaveText(game.edition);
      await expect(article.locator('.rule-answer')).toHaveText(game.answer);
      const details = article.locator('.rule-section').filter({ has: page.getByRole('heading', { name: 'Rule details', exact: true }) });
      for (const detail of game.details) await expect(details).toContainText(detail);
      await expect(article.locator('.source-list > li')).toHaveCount(1);
      await expect(article.locator('.source-document')).toHaveText(game.sourceTitle);
      await expect(article.locator('.source-document')).toHaveAttribute('href', game.source);
      await expect(article.locator('.source-list > li > small')).toContainText(game.locator);
      await expect(article.getByRole('link', { name: 'Read the publisher’s rulebook', exact: true })).toHaveAttribute('href', game.source);
      await expect(article.getByRole('link', { name: `View cited page (PDF page ${game.openingPage})`, exact: true })).toHaveAttribute('href', `${game.source}#page=${game.openingPage}`);
      const citations = article.locator('.source-cited-pages a');
      await expect(citations).toHaveText(game.citedPages.map(number => `PDF page ${number}`));
      expect(await citations.evaluateAll(links => links.map(link => link.getAttribute('href')))).toEqual(game.citedPages.map(number => `${game.source}#page=${number}`));
      if (game.openingPage === 7) await expect(article.locator('.source-list')).not.toContainText(/printed\s+page\s*7\b/i);

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
      await page.goBack();
      await expect(search).toHaveValue(game.name);
      await expect(rows).toHaveCount(1);
      await expect(rows).toHaveAttribute('data-id', game.identityId);
      await expect(rows.getByRole('link')).toHaveAttribute('href', `/games/${game.slug}/`);
    }
  });

  test(`lazy home and library discover the three scoped answers without portable or rule-ID routes at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    const requests: string[] = [];
    page.on('request', request => { if (new URL(request.url()).pathname === '/rule-index.json') requests.push(request.url()); });
    await page.goto('/');
    const lookup = page.locator('[data-rule-lookup]');
    const search = lookup.getByRole('searchbox');
    const links = lookup.locator('[data-results]').getByRole('link');
    await expect(search).toBeVisible();
    expect(requests).toHaveLength(0);
    const response = page.waitForResponse(response => new URL(response.url()).pathname === '/rule-index.json');
    await search.fill(games[0].name);
    const loaded = await response;
    expect(loaded.ok()).toBe(true);
    const index = await loaded.json() as RuleIndexEntry[];
    for (const game of games) {
      await search.fill(game.name);
      await expect(links).toHaveCount(1);
      await expect(links).toHaveAttribute('href', `/games/${game.slug}/`);
      await expect(links).toContainText(game.name);
      await expect(links).toContainText(game.answer);
      expect(index.find(rule => rule.s === game.slug)).toMatchObject({ n: game.name, e: game.edition, r: game.answer, p: false });
      expect(index.some(rule => rule.s === game.ruleId)).toBe(false);
    }
    expect(requests).toHaveLength(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await links.click();
    await expect(page.locator('.rule-answer')).toHaveText(games[2].answer);
    await page.goto('/games/');
    const library = page.locator('[data-game-directory]');
    const librarySearch = library.getByRole('searchbox');
    const libraryLinks = library.locator('.game-list').getByRole('link');
    for (const game of games) {
      await librarySearch.fill(game.name);
      await expect(library.locator('[data-count]')).toHaveText('1 rule found');
      await expect(libraryLinks).toHaveCount(1);
      await expect(libraryLinks).toHaveAttribute('href', `/games/${game.slug}/`);
      await expect(libraryLinks).toContainText(game.name);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  });
}
