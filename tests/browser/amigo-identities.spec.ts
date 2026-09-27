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
,
  {
    "id": "15828",
    "name": "Schnapp, Land, Fluss!",
    "slug": "schnapp-land-fluss-amigo-en-v4-1-family",
    "edition": "AMIGO English rules, Version 4.1 — Family Game (2–6 players)",
    "opening": "Family Game: the oldest player reveals the first category. Everyone then plays at the same time.",
    "clarifications": [
      "This answer covers the Family Game for 2–6 players. The manual offers four play options and does not declare an official default. The Family Game can also be played in teams.",
      "Shuffle all 50 letter/category cards and display eight with their letter sides up. The rest form a letter-side-up draw deck. The oldest player flips any one display card to its category side.",
      "Everyone competes to find a fitting word and letter. A successful player shouts their word and touches its letter card together; players do not take individual turns in seating order.",
      "For later categories, replenish the display to eight when possible, turn the old category back to its letter side and reveal another category. This passage does not assign a new revealer-selection or succession rule.",
      "Race for Words (2–6 players): each player draws a letter card, then reveal the top deck card as a category and race to find words. The source does not assign an individual category revealer.",
      "Duel (2 players): split the cards evenly into a letter-side-up deck and a category-side-up deck. Both players reveal their top cards at the same time, lifting them toward the middle. Equally quick answers or no answer lead to two additional cards and another race.",
      "Turbo Round (3 or more players): the person closest to the draw deck reveals and announces the category and newly exposed letter, then everyone competes. The source does not resolve equal distance from the deck.",
      "Shared endgame wins and the Duel response tie procedure do not break a tie for the Family Game’s opening revealer."
    ],
    "sourceUrl": "https://blog.amigo-spiele.de/content/ap/rule/07930-GB-AmigoRule.pdf",
    "sourceTitle": "Schnapp, Land, Fluss! — English rules, Version 4.1",
    "sourceLocation": "PDF page 1: cover/Contents/Idea of the Game; Family Game → Setup → Playing the Game (opening and later-category handling) → The End of the Game. PDF page 2: Race for Words, Duel, Turbo Round and Version 4.1/copyright footer. Two complete tall pages; no visible printed page numbers.",
    "houseFallback": "If age cannot select one opening revealer, agree to choose that revealer randomly. This is an original house convention; everyone still plays at the same time after the reveal.",
    "pdfPages": [
      1,
      2
    ]
  },
  {
    "id": "146149",
    "name": "Speed Cups",
    "slug": "speed-cups-amigo-en-v2-0",
    "edition": "AMIGO English rules, Version 2.0 (2–4 players)",
    "opening": "The fastest player to build a tower with their own cups reveals the first card. Everyone then arranges their cups at the same time.",
    "clarifications": [
      "These rules cover 2–4 players. Each receives five cups in five different colors; put the bell in the middle and the shuffled face-down card deck beside it. The opening tower uses each player’s own cups.",
      "After each reveal, everyone arranges their cups simultaneously to match the picture. Check bell ringers in ringing order; the first correct arrangement earns the card. This task-award procedure does not supply an opening tower-race tie-break.",
      "Leave cups as they are for the next round. The person who won the last card reveals the next card; the opening tower race is not repeated as a stated later-round rule.",
      "If nobody solves a task, put its card aside and continue. The source gives no separate instruction for choosing a revealer after an unsolved card; its last-card-winner instruction remains the stated continuation rule.",
      "At game end, tied highest card totals share the win. This is separate from choosing the opening revealer."
    ],
    "sourceUrl": "https://blog.amigo-spiele.de/content/ap/rule/03780-GB-AmigoRule.pdf",
    "sourceTitle": "Speed Cups — English rules, Version 2.0",
    "sourceLocation": "PDF page 2 first: left printed page 2, Preparation → How to Play (own-cups opening tower/first reveal); right printed page 3, arrangement and bell-order correctness. PDF page 1: left printed page 4, unsolved card/last-card-winner continuation/End of the Game/Version 2.0 copyright footer; right printed page 1, cover/components/credits. Original two-page imposed spreads, not PDF-page equals printed-page.",
    "houseFallback": "If the tower race cannot select one opening revealer, agree to choose that revealer randomly. This is an original house convention; everyone still arranges cups at the same time after the reveal.",
    "pdfPages": [
      2,
      1
    ]
  },
  {
    "id": "433340",
    "name": "Fischfutter",
    "slug": "fischfutter-amigo-en-v1-0-base",
    "edition": "AMIGO English rules, Version 1.0 — competitive base game (2–5 players)",
    "opening": "In the competitive base game, the bravest player goes first. Play then proceeds clockwise.",
    "clarifications": [
      "Base-game setup uses 36 double-sided piranha cards, one hand card and five bandage tokens per player, a central draw deck and an initial pond card whose two sides are shown. The four protection cards are only for the cooperative variant; 36 piranha cards plus four protection cards explain the 40-card component total.",
      "The active player plays a card, flips matching other pond cards, resolves attacks, draws a replacement card, then passes clockwise. Reshuffling set-aside cards when the deck runs out does not introduce a new starting-player criterion.",
      "The cooperative Super-Bitey variant uses shared steps and four protection cards. It does not assign an individual starter, and the competitive bravery criterion and clockwise turns are not transferred to it.",
      "In Super-Bitey, a tie for the majority color before the flip lets the group choose one of the tied colors to flip. A tie for the most piranhas after the flip means there is no attack and the challenge continues.",
      "The product describes luck or memory approaches, but this manual does not define separate Luck/Memory modes with their own opening rules.",
      "In the competitive game, players tied for the most remaining bandages share victory. The optional scoring over several games does not specify a winner-starts or other carry-over opening rule."
    ],
    "sourceUrl": "https://blog.amigo-spiele.de/content/ap/rule/02503-GB-AmigoRule.pdf",
    "sourceTitle": "Fischfutter — English rules, Version 1.0",
    "sourceLocation": "PDF page 1: cover/Components → Setup → Playing the Game (opening sentence and clockwise continuation) → Attack. PDF page 2: attack/deck continuation; The End of the Game and consecutive-game scoring; Cooperative Variant → Super-Bitey steps 1–4/outcomes A–C; Version 1.0/copyright footer. Two complete tall pages with no visible printed page numbers; circled 1–4 are cooperative example steps.",
    "houseFallback": "If the group cannot agree who is bravest, choose a player randomly. This is an original house convention.",
    "pdfPages": [
      1,
      2
    ]
  }
] as const;

type Reviewed = (typeof reviewed)[number];

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

async function expectArticle(page: Page, game: Reviewed) {
  await expect(page).toHaveURL(new RegExp(`/games/${game.slug}/$`));
  const article = page.locator('.game-article');
  await expect(article.getByRole('heading', { level: 1 })).toHaveText(game.name === 'Cabanga!' ? 'Starting rule for Cabanga!' : game.name === 'Schnapp, Land, Fluss!' ? 'Starting rule for Schnapp, Land, Fluss!' : `Who goes first in ${game.name}?`);
  await expect(page.locator('.game-article .rule-edition')).toHaveText(game.edition);
  await expect(article.locator('.rule-answer')).toHaveText(game.opening);
  const details = article.locator('.rule-section').filter({ has: page.getByRole('heading', { name: 'Rule details', exact: true }) });
  await expect(details.locator('p')).toHaveText([...game.clarifications]);
  await expect(article.getByRole('heading', { name: 'Official tie-break or fallback', exact: true })).toHaveCount(0);
  const tie = article.locator('.rule-section').filter({ has: page.getByRole('heading', { name: 'If there’s a tie', exact: true }) });
  await expect(tie.locator('p')).toHaveText('The rulebook doesn’t say.');
  await expect(article.locator('.source-actions a')).toHaveCount(2);
  const pdfPages = 'pdfPages' in game ? game.pdfPages : [1, 2];
  await expect(article.getByRole('link', { name: `View cited page (PDF page ${pdfPages[0]})`, exact: true })).toHaveAttribute('href', `${game.sourceUrl}#page=${pdfPages[0]}`);
  await expect(article.getByRole('link', { name: 'Read the publisher’s rulebook', exact: true })).toHaveAttribute('href', game.sourceUrl);
  const source = article.locator('.source-list > li');
  await expect(source).toHaveCount(1);
  await expect(source.locator('.source-document')).toHaveText(game.sourceTitle);
  await expect(source.locator('.source-document')).toHaveAttribute('href', game.sourceUrl);
  await expect(source.locator('small')).toHaveText(`AMIGO Spiel + Freizeit GmbH · ${game.sourceLocation} · Checked 2026-09-26`);
  await expect(source.locator('.source-cited-pages a')).toHaveText(pdfPages.map(number => `PDF page ${number}`));
  for (const number of pdfPages) {
    await expect(source.getByRole('link', { name: `PDF page ${number}`, exact: true })).toHaveAttribute('href', `${game.sourceUrl}#page=${number}`);
  }
  const fallback = article.locator('.fallback');
  await expect(fallback.locator('.eyebrow')).toHaveText('Optional house rule');
  await expect(fallback.locator('p')).toHaveText(game.houseFallback);
  await expect(fallback.getByRole('link', { name: 'Pick a player at random', exact: true })).toHaveAttribute('href', '/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

for (const width of [320, 1280]) {
  test(`Amigo reviewed identities have exact directory links and filters at ${width}px`, async ({ page }) => {
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
    // A separately named product is not an alias for the base Speed Cups ID.
    // Other identities may match this query; no catalog-wide count is assumed.
    await search.fill('Speed Cups 6');
    await expect(page.locator('[data-results] li[data-id="146149"]')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test(`Amigo reviewed rows remain ordinary static shelf links at ${width}px`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 844 } });
    try {
      const page = await context.newPage();
      const shelves = getBrowseShelves().shelves;
      for (const game of reviewed) {
        const shelf = shelves.find(shelf => shelf.games.some(item => item.bggId === game.id));
        expect(shelf, `Static shelf for ${game.name}`).toBeDefined();
        await page.goto(`${baseURL}/board-games/browse/${shelf!.letter}/${shelf!.page}/`);
        const row = page.locator(`[data-directory-shelf] li[data-id="${game.id}"]`);
        await expectReviewedRow(row, game);
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
