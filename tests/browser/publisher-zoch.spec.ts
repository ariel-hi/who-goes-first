import { test, expect } from '@playwright/test';
import type { RuleIndexEntry } from '../../src/lib/rule-index';

// Literal reviewed cohort expectations, independent of inventory/getter output.
const sourced = [
  {
    name: 'Die Zausel vom Zauberwald', id: 'game-0eba6647-2448-47d5-b70e-850ff0545067',
    slug: 'die-zausel-vom-zauberwald-zoch-601105206-en', article: '601105206', page: 3,
    answer: 'The player who most recently stumbled starts.',
    detail: 'They do not select a new starting player.', officialTie: false,
    source: 'https://pim.simba-dickie.com/Product/Zoch/Kids/601105206%20Die%20Zausel%20vom%20Zauberwald/007%20Artwork-Manual/601105206-DieZauselVomZauberwald-Rules-Zoch-EN.pdf',
  },
  {
    name: 'Das Schloss der 7 Schlösser', id: 'game-866dabc4-1dd7-4557-bc7b-f87f68a59e72',
    slug: 'das-schloss-der-7-schloesser-zoch-601105204-en', article: '601105204', page: 4,
    answer: 'The player who most recently opened a lock starts.',
    detail: 'the player-order instruction passes the die to your left neighbor.', officialTie: false,
    source: 'https://pim.simba-dickie.com/Product/Zoch/Family/601105204%20Das%20Schloss%20der%207%20Schl%C3%B6sser/007%20Artwork-Manual/601105204-Sd7S-Rules-Zoch-EN.pdf',
  },
  {
    name: 'Über den Wolken', id: 'game-442193d6-20c4-41d7-a261-37b34b8c19dc',
    slug: 'ueber-den-wolken-zoch-601105207-en', article: '601105207', page: 2,
    answer: 'The player with the most of their birds in the front row of the flock starts.',
    detail: 'the same front-row, front-two-rows and random tie-break procedure.', officialTie: true,
    source: 'https://pim.simba-dickie.com/Product/Zoch/Family/601105207%20%C3%9Cber%20den%20Wolken/007%20Artwork-Manual/601105207-UeberDenWolken-Regel-low-EN.pdf',
  },
  {
    name: 'Flitze Flatze Bärentatze', id: 'game-bab1eb8c-f3f5-4b38-a0d6-3cf63c41e407',
    slug: 'flitze-flatze-baerentatze-zoch-601105211-en', article: '601105211', page: 9,
    answer: 'The player who most recently saw a fish in the water starts.',
    detail: 'It does not specify the direction of player turns.', officialTie: false,
    source: 'https://pim.simba-dickie.com/Product/Zoch/Kids/601105211%20Flitze%20Flatze%20B%C3%A4rentatze/007%20Artwork-Manual/601105211-FlitzeFlatzeB%C3%A4rentatze-Rules-Zoch.pdf',
  },
  {
    name: 'Gigi Gacker am Würfelacker', id: 'game-60b6d1ae-767a-42cb-bce2-df3a41f28efb',
    slug: 'gigi-gacker-am-wuerfelacker-zoch-601105222-en', article: '601105222', page: 7,
    answer: 'The player with the biggest appetite takes the starting-player worm and goes first.',
    detail: 'The Robo chicken never gets the starting-player worm', officialTie: false,
    source: 'https://pim.simba-dickie.com/Product/Zoch/Young%20&%20Wild/601105222%20Gigi%20Gacker%20am%20W%C3%BCrfelacker/099%20Middleware%20(Import%20only)/601105222-GGamWuerfelacker-Regel.pdf',
  },
] as const;

const pending = [
  { name: "Käpt'n Memo", id: 'game-20ec80fb-32d8-4764-816e-285e0d0cb292', reference: 'https://www.zoch-verlag.com/zoch_en/categories/children-s-games/kaeptn-memo-601105221-en.html' },
  { name: 'Kleiner Drache Wirbelwind', id: 'game-c60afcd1-5e6b-44ed-a41a-dbd91376d400', reference: 'https://www.zoch-verlag.com/zoch_en/categories/children-s-games/kleiner-drache-wirbelwind-601105202-en.html' },
  { name: 'Mach die Flatter', id: 'game-5a318f64-4fde-423e-9a63-e3887b7de5de', reference: 'https://www.zoch-verlag.com/zoch_en/categories/family-games/mach-die-flatter-601105203-en.html' },
  { name: 'Mille Fiori', id: '346501', reference: 'https://boardgamegeek.com/boardgame/346501' },
] as const;

type StructuredData = {
  '@type'?: string;
  '@graph'?: StructuredData[];
  url?: string;
  citation?: string[];
  itemListElement?: { name: string; item: string }[];
};

for (const width of [320, 1280]) {
  test(`nine-identity cohort links directly to reviewed answers or honest pending help at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/board-games/');
    const search = page.getByRole('searchbox', { name: 'Search board games' });
    const results = page.locator('[data-board-directory] [data-results] > li');
    for (const game of sourced) {
      await search.fill(game.name);
      await expect(results).toHaveCount(1);
      await expect(results).toHaveAttribute('data-id', game.id);
      await expect(results).toHaveAttribute('data-has-rule', 'true');
      await expect(results.getByRole('link')).toHaveCount(1);
      await expect(results.getByRole('link')).toHaveAttribute('href', `/games/${game.slug}/`);
      await expect(results.getByRole('link')).toContainText(game.name);
      await expect(results.locator('summary')).toHaveCount(0);
    }
    for (const game of pending) {
      await search.fill(game.name);
      await expect(results).toHaveCount(1);
      await expect(results).toHaveAttribute('data-id', game.id);
      await expect(results).toHaveAttribute('data-has-rule', 'false');
      await expect(results.locator('summary')).toContainText(`${game.name}No checked starting rule yet`);
      await results.locator('summary').click();
      await expect(results.locator('details')).toHaveAttribute('open', '');
      await expect(results.getByRole('link', { name: 'Pick a player', exact: true })).toHaveAttribute('href', '/');
      const referenceName = game.id === '346501' ? /View game on BoardGameGeek/ : /Publisher reference/;
      await expect(results.getByRole('link', { name: referenceName })).toHaveAttribute('href', game.reference);
      await expect(results.getByRole('link')).toHaveCount(2);
      await expect(results.locator('a[href^="/games/"], a[href^="/board-games/"]')).toHaveCount(0);
      if (game.id !== '346501') await expect(results.locator('a[href*="boardgamegeek.com"]')).toHaveCount(0);
    }
    // The same known pending/sourced identities respect both public filters.
    await page.getByRole('button', { name: 'With a rule', exact: true }).click();
    await expect(results).toHaveCount(0);
    await page.getByRole('button', { name: 'Awaiting a rule', exact: true }).click();
    await expect(results).toHaveAttribute('data-id', '346501');
    await search.fill(sourced[0].name);
    await expect(results).toHaveCount(0);
    await page.getByRole('button', { name: 'With a rule', exact: true }).click();
    await expect(results).toHaveAttribute('data-id', sourced[0].id);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await results.getByRole('link').click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(`Who goes first in ${sourced[0].name}?`);
  });

  test(`real lazy home lookup and rule library include the five answers, excluding pending and portable transfers at ${width}px`, async ({ page }) => {
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
    await search.fill(sourced[0].name);
    const index = await (await response).json() as RuleIndexEntry[];
    for (const game of sourced) {
      await search.fill(game.name);
      await expect(links).toHaveCount(1);
      await expect(links).toHaveAttribute('href', `/games/${game.slug}/`);
      await expect(links).toContainText(game.name);
      await expect(links).toContainText(game.answer);
      expect(index.find(rule => rule.s === game.slug)).toMatchObject({ n: game.name, r: game.answer, p: false });
    }
    for (const game of pending) {
      await search.fill(game.name);
      await expect(lookup.locator('[data-lookup-status]')).toContainText('No checked rule matches');
      await expect(links).toHaveCount(0);
      await expect(lookup.getByRole('link', { name: 'Find this game in the directory', exact: true })).toHaveAttribute('href', `/board-games/#q=${encodeURIComponent(game.name)}`);
      expect(index.some(rule => rule.n === game.name)).toBe(false);
    }
    expect(requests).toHaveLength(1);
    await search.fill(sourced[0].name);
    await expect(links).toHaveCount(1);
    await links.click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(`Who goes first in ${sourced[0].name}?`);
    await page.goto('/games/');
    const library = page.locator('[data-game-directory]');
    const librarySearch = library.getByRole('searchbox');
    const libraryLinks = library.locator('.game-list').getByRole('link');
    for (const game of sourced) {
      await librarySearch.fill(game.name);
      await expect(libraryLinks).toHaveCount(1);
      await expect(libraryLinks).toHaveAttribute('href', `/games/${game.slug}/`);
    }
    for (const game of pending) {
      await librarySearch.fill(game.name);
      await expect(library.locator('[data-count]')).toHaveText('0 rules found');
      await expect(libraryLinks).toHaveCount(0);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test(`five approved English articles preserve exact sources, scope and publication metadata at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    for (const game of sourced) {
      await page.goto(`/games/${game.slug}/`);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(`Who goes first in ${game.name}?`);
      await expect(page.locator('.game-article > p').first()).toHaveText('Zoch English rules');
      await expect(page.locator('.rule-answer')).toHaveText(game.answer);
      await expect(page.locator('.rule-section').filter({ has: page.getByRole('heading', { name: 'Rule details', exact: true }) })).toContainText(game.detail);
      await expect(page.locator('.source-list > li')).toHaveCount(1);
      await expect(page.locator('.source-document')).toContainText(`article ${game.article}`);
      await expect(page.locator('.source-document')).toHaveAttribute('href', game.source);
      await expect(page.getByRole('link', { name: 'Read the publisher’s rulebook', exact: true })).toHaveAttribute('href', game.source);
      await expect(page.getByRole('link', { name: `View cited page (PDF page ${game.page})`, exact: true })).toHaveAttribute('href', `${game.source}#page=${game.page}`);
      await expect(page.getByRole('heading', { name: 'Official tie-break or fallback', exact: true })).toHaveCount(game.officialTie ? 1 : 0);
      if (game.officialTie) {
        await expect(page.locator('.opening-tie')).toContainText('front two rows');
        await expect(page.locator('.opening-tie')).toContainText('determine the starting player randomly');
        await expect(page.locator('.fallback')).toHaveCount(0);
      } else {
        await expect(page.locator('.fallback')).toContainText('Optional house rule');
        await expect(page.locator('.fallback')).toContainText('This is a house rule.');
      }
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
