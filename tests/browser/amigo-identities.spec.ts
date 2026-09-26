import { test, expect, type Locator, type Page } from '@playwright/test';
import { getBrowseShelves } from '../../src/lib/content/board-game-browse';

// Exact approved English files. Native identity search terms are projected by
// the search indexes; they do not change these records' approved aliases.
const reviewed = [
  {
    "id": "325853",
    "name": "Lama Dice",
    "slug": "lama-dice-amigo-en-v1-0",
    "edition": "AMIGO English rules, Version 1.0",
    "opening": "The youngest player starts the first round.",
    "clarifications": [
      "These English rules cover 2–6 players. Play proceeds clockwise.",
      "In later rounds, the last player to take an action in the previous round starts.",
      "The instructions for the last active player apply during a round after everyone else has quit."
    ],
    "sourceUrl": "https://blog.amigo-spiele.de/content/ap/rule/02103-GB-AmigoRule.pdf",
    "sourceTitle": "Lama Dice — AMIGO English rules, Version 1.0",
    "sourceLocation": "PDF page 1: Setting Up the Game and Playing the Game. PDF page 2: Scoring, final paragraph before The End of the Game, and copyright/version footer; no visible printed page numbers.",
    "houseFallback": "If the criterion cannot select one player, agree to choose randomly. This is a house rule."
  },
  {
    "id": "394889",
    "name": "Cabanga!",
    "slug": "cabanga-amigo-en-v1-0",
    "edition": "AMIGO English rules, Version 1.0",
    "opening": "The first player to spell Cabanga! backwards starts the first round.",
    "clarifications": [
      "These English rules cover 3–6 players. The first player plays one card, then play passes to their left.",
      "In later rounds, the player to the left of whoever went last in the previous round starts.",
      "A round ends at the end of a turn after any required penalty draws. Playing or throwing the last card does not bypass those draws."
    ],
    "sourceUrl": "https://blog.amigo-spiele.de/content/ap/rule/02353-GB-AmigoRule.pdf",
    "sourceTitle": "Cabanga! — AMIGO English rules, Version 1.0",
    "sourceLocation": "PDF page 1: Setup and Gameplay. PDF page 2: End of a round, including its final paragraph, and copyright/version footer; no visible printed page numbers.",
    "houseFallback": "If the criterion cannot select one player, agree to choose randomly. This is a house rule."
  },
  {
    "id": "447384",
    "name": "Meister Makatsu",
    "slug": "meister-makatsu-amigo-en-v1-0",
    "edition": "AMIGO English rules, Version 1.0",
    "opening": "The player who most recently meditated takes the Meister Makatsu figure and starts the first round.",
    "clarifications": [
      "These English rules cover 2–6 players. Each player begins with a shuffled 24-card dojo deck and four hand cards.",
      "The figure holder starts each round. Everyone plays one card in order to the left, then a second card in the same order.",
      "After the round, the player with the highest purple card takes the figure and starts the next round. Among tied highest purple cards, the last one played receives the figure. If no one played purple, the current holder keeps it.",
      "The meditation criterion is used at initial setup. Later rounds and phases use the current figure holder."
    ],
    "sourceUrl": "https://blog.amigo-spiele.de/content/ap/rule/02553-GB-AmigoRule.pdf",
    "sourceTitle": "Meister Makatsu — AMIGO English rules, Version 1.0",
    "sourceLocation": "PDF page 1: Setup and How to Play. PDF page 2: Distribute tokens and The next phase, and copyright/version footer; no visible printed page numbers.",
    "houseFallback": "If the criterion cannot select one player, agree to choose randomly. This is a house rule."
  }
] as const;

const pending = [
  { id: '15828', name: 'Schnapp, Land, Fluss!' },
  { id: '146149', name: 'Speed Cups' },
  { id: '433340', name: 'Fischfutter' },
] as const;
type Reviewed = (typeof reviewed)[number];
type Pending = (typeof pending)[number];

async function expectReviewedRow(row: Locator, game: Reviewed) {
  await expect(row).toHaveAttribute('data-id', game.id);
  await expect(row).toHaveAttribute('data-has-rule', 'true');
  await expect(row.locator('summary')).toHaveCount(0);
  const link = row.locator('a');
  await expect(link).toHaveCount(1);
  await expect(link).toContainText(game.name);
  await expect(link).toContainText('Starting rule available');
  await expect(link).toHaveAttribute('href', `/games/${game.slug}/`);
}

async function expectPendingRow(row: Locator, game: Pending) {
  await expect(row).toHaveAttribute('data-id', game.id);
  await expect(row).toHaveAttribute('data-has-rule', 'false');
  await expect(row.locator('summary')).toContainText(game.name);
  await expect(row.locator('summary')).toContainText('No checked starting rule yet');
  await row.locator('summary').click();
  await expect(row.locator('details')).toHaveAttribute('open', '');
  await expect(row.locator('.directory-pending-help')).toContainText('Follow the rulebook in your box');
  await expect(row.getByRole('link', { name: /View game on BoardGameGeek/ })).toHaveAttribute('href', `https://boardgamegeek.com/boardgame/${game.id}`);
  await expect(row.getByRole('link', { name: 'Pick a player', exact: true })).toHaveAttribute('href', '/');
  await expect(row.locator('a[href^="/games/"]')).toHaveCount(0);
}

async function expectArticle(page: Page, game: Reviewed) {
  await expect(page).toHaveURL(new RegExp(`/games/${game.slug}/$`));
  const article = page.locator('.game-article');
  await expect(article.getByRole('heading', { level: 1 })).toHaveText(`Who goes first in ${game.name}?`);
  await expect(page.locator('.game-article > p').first()).toHaveText(game.edition);
  await expect(article.locator('.rule-answer')).toHaveText(game.opening);
  const details = article.locator('.rule-section').filter({ has: page.getByRole('heading', { name: 'Rule details', exact: true }) });
  await expect(details.locator('p')).toHaveText([...game.clarifications]);
  await expect(article.getByRole('heading', { name: 'Official tie-break or fallback', exact: true })).toHaveCount(0);
  const tie = article.locator('.rule-section').filter({ has: page.getByRole('heading', { name: 'If there’s a tie', exact: true }) });
  await expect(tie.locator('p')).toHaveText('The rulebook doesn’t say.');
  await expect(article.locator('.source-actions a')).toHaveCount(2);
  await expect(article.getByRole('link', { name: 'View cited page (PDF page 1)', exact: true })).toHaveAttribute('href', `${game.sourceUrl}#page=1`);
  await expect(article.getByRole('link', { name: 'Read the publisher’s rulebook', exact: true })).toHaveAttribute('href', game.sourceUrl);
  const source = article.locator('.source-list > li');
  await expect(source).toHaveCount(1);
  await expect(source.locator('.source-document')).toHaveText(game.sourceTitle);
  await expect(source.locator('.source-document')).toHaveAttribute('href', game.sourceUrl);
  await expect(source.locator('small')).toHaveText(`AMIGO Spiel + Freizeit GmbH · ${game.sourceLocation} · Checked 2026-09-26`);
  await expect(source.locator('.source-cited-pages a')).toHaveText(['PDF page 1', 'PDF page 2']);
  for (const number of [1, 2]) {
    await expect(source.getByRole('link', { name: `PDF page ${number}`, exact: true })).toHaveAttribute('href', `${game.sourceUrl}#page=${number}`);
  }
  const fallback = article.locator('.fallback');
  await expect(fallback.locator('.eyebrow')).toHaveText('Optional house rule');
  await expect(fallback.locator('p')).toHaveText(game.houseFallback);
  await expect(fallback.getByRole('link', { name: 'Pick a player at random', exact: true })).toHaveAttribute('href', '/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

for (const width of [320, 1280]) {
  test(`Amigo reviewed and pending identities have distinct directory links and filters at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/board-games/');
    const search = page.getByRole('searchbox', { name: 'Search board games' });
    const filter = (name: string) => page.getByRole('button', { name, exact: true });
    for (const game of reviewed) {
      await search.fill(game.name);
      const row = page.locator(`[data-results] li[data-id="${game.id}"]`);
      await expectReviewedRow(row, game);
      await filter('With a rule').click();
      await expect(filter('With a rule')).toHaveAttribute('aria-pressed', 'true');
      await expectReviewedRow(row, game);
      await filter('Awaiting a rule').click();
      await expect(row).toHaveCount(0);
      await filter('All matches').click();
      await expectReviewedRow(row, game);
    }
    for (const game of pending) {
      await search.fill(game.name);
      const row = page.locator(`[data-results] li[data-id="${game.id}"]`);
      await expectPendingRow(row, game);
      await filter('With a rule').click();
      await expect(row).toHaveCount(0);
      await filter('Awaiting a rule').click();
      await expect(filter('Awaiting a rule')).toHaveAttribute('aria-pressed', 'true');
      await expectPendingRow(row, game);
      await filter('All matches').click();
    }
    // A separately named product is not an alias for the base Speed Cups ID.
    // Other identities may match this query; no catalog-wide count is assumed.
    await search.fill('Speed Cups 6');
    await expect(page.locator('[data-results] li[data-id="146149"]')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test(`Amigo reviewed and pending rows remain ordinary static shelf links at ${width}px`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 844 } });
    try {
      const page = await context.newPage();
      const shelves = getBrowseShelves().shelves;
      for (const game of [...reviewed, ...pending]) {
        const shelf = shelves.find(shelf => shelf.games.some(item => item.bggId === game.id));
        expect(shelf, `Static shelf for ${game.name}`).toBeDefined();
        await page.goto(`${baseURL}/board-games/browse/${shelf!.letter}/${shelf!.page}/`);
        const row = page.locator(`[data-directory-shelf] li[data-id="${game.id}"]`);
        if ('slug' in game) await expectReviewedRow(row, game);
        else await expectPendingRow(row, game);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      }
    } finally { await context.close(); }
  });

  test(`Amigo English articles preserve exact source and house-rule scope without JavaScript at ${width}px`, async ({ browser, baseURL }, testInfo) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 844 } });
    try {
      const page = await context.newPage();
      for (const game of reviewed) {
        await page.goto(`${baseURL}/games/${game.slug}/`);
        await expectArticle(page, game);
        await page.screenshot({ path: testInfo.outputPath(`${game.slug}-article.png`), fullPage: true });
      }
    } finally { await context.close(); }
  });

  for (const route of ['/board-games/', '/', '/games/']) {
    test(`French Maître Makatsu reaches the exact English article and survives native Back from ${route} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      const game = reviewed[2];
      const query = 'Maître Makatsu';
      const home = route === '/';
      const directory = route === '/board-games/';
      await page.goto(route);
      const root = page.locator(directory ? '[data-board-directory]' : home ? '[data-rule-lookup]' : '[data-game-directory]');
      const input = root.getByRole('searchbox');
      await input.fill(query);
      const links = root.locator(directory || home ? '[data-results] a' : '.game-list li:not([hidden]) a');
      await expect(links).toHaveCount(1);
      await expect(links).toHaveAttribute('href', `/games/${game.slug}/`);
      if (directory) await expectReviewedRow(root.locator(`[data-results] li[data-id="${game.id}"]`), game);
      else await expect(links.locator('span').first()).toHaveText(game.name);
      if (home) await expect(links.locator('.rule-lookup-answer')).toHaveText(game.opening);
      await expect(page).toHaveURL(new RegExp(`#q=${encodeURIComponent(query)}$`));
      await links.click();
      await expectArticle(page, game);
      await page.goBack();
      await expect(input).toHaveValue(query);
      await expect(links).toHaveCount(1);
      await expect(links).toHaveAttribute('href', `/games/${game.slug}/`);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
  }
}
