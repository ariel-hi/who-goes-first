import { test, expect, type Page } from '@playwright/test';
import { getBrowseShelves } from '../../src/lib/content/board-game-browse';

// Reviewed Dropbox sharing viewers retain their exact source URLs and plain citations.
// Keep explicit fixtures independent of the production PDF detection helper.
const sharingViewerSources: Record<string, readonly { href: string; pages: readonly number[] }[]> = {
  'john-company-second-edition-wehrlegig-en': [
    { href: 'https://www.dropbox.com/scl/fi/v1p712l0dkgiqa0jx0vr8/John-Company-Rules.pdf?dl=0&rlkey=xtek9x06fla1cb5d8b8ov3q7b', pages: [13, 10, 11, 4, 5, 2, 43, 44, 48] },
  ],
  'the-game-pandasaurus-kwanchai-moriya-en': [
    { href: 'https://www.dropbox.com/scl/fi/rux1sfbevshr8x593n0a2/P_TG_Rulebook_Print.pdf?dl=0&rlkey=6bbw1wlsych1lrxznas12g6ty&st=sn56zvzr', pages: [1, 2] },
  ],
  'cubirds-pandasaurus-en-2023': [
    { href: 'https://www.dropbox.com/scl/fi/gzz5r4pttiz304zkgymcg/PANCUBIRCORE-cubirds_rules_ENG-1st_Printing.pdf?dl=0&rlkey=e92ddts66hwvxdnb93yn3iiuv', pages: [2, 3, 8, 1] },
  ],
  'nucleum-board-and-dice-2023-en': [
    { href: 'https://www.dropbox.com/scl/fi/6mtcwklpiuanocyk7tia4/nucleum_rulebook_ENG_web.pdf?rlkey=dhh8nrsnw8dgk33tu4j4y36zv&e=1&dl=0', pages: [5, 6, 8, 4, 1, 27] },
    { href: 'https://www.dropbox.com/scl/fi/fyptmj5kkcb70slql68zi/nucleum_rulebook_solo_ENG_web.pdf?rlkey=adhuw09dzhrxfsugq0vnzo6u6&e=1&dl=0', pages: [2, 1, 4] },
  ],
};

async function expectReviewedSourceCitation(page: Page, slug: string, pdfPage: number) {
  const documents = sharingViewerSources[slug];
  if (!documents) {
    await expect(page.getByRole('link', { name: `View cited page (PDF page ${pdfPage})`, exact: true })).toHaveAttribute('href', new RegExp(`#page=${pdfPage}$`));
    return;
  }
  await expect(page.getByRole('link', { name: /View cited page/ })).toHaveCount(0);
  await expect(page.locator('.source-cited-pages')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Read the source rules', exact: true })).toHaveAttribute('href', documents[0]!.href);
  const sources = page.locator('.source-list > li');
  await expect(sources).toHaveCount(documents.length);
  for (const [index, document] of documents.entries()) {
    const source = sources.nth(index);
    await expect(source.locator('.source-document')).toHaveAttribute('href', document.href);
    await expect(source.getByText(`Cited PDF pages: ${document.pages.join(', ')}`, { exact: true })).toBeVisible();
  }
}

test('mobile alphabet keeps keyboard focus visible at horizontal scroll edges', async ({ page, browserName }) => {
  await page.setViewportSize({ width: 320, height: 750 });
  await page.goto('/board-games/browse/a/1/');
  const letters = page.locator('.directory-alphabet a');
  const count = await letters.count();
  for (const target of [6, count - 2]) {
    await page.keyboard.press('Tab');
    if (browserName === 'webkit') {
      // This runner skips ordinary links on Tab. Check native anchor focus and
      // its keyboard indicator; sequential traversal is covered below elsewhere.
      await letters.nth(target).focus();
    } else {
      await letters.first().focus();
      for (let step = 0; step < target; step++) await page.keyboard.press('Tab');
    }
    await expect(letters.nth(target)).toBeFocused();
    const ring = await letters.nth(target).evaluate(link => {
      const tile = link.getBoundingClientRect();
      const viewport = link.closest('.directory-alphabet')!.getBoundingClientRect();
      const style = getComputedStyle(link);
      const outer = parseFloat(style.outlineOffset) + parseFloat(style.outlineWidth);
      return { visible: link.matches(':focus-visible'), thickness: parseFloat(style.outlineWidth), height: tile.height, left: tile.left - outer, right: tile.right + outer, viewportLeft: viewport.left, viewportRight: viewport.right };
    });
    expect(ring.visible).toBe(true);
    expect(ring.thickness).toBeGreaterThanOrEqual(3);
    expect(ring.height).toBeGreaterThanOrEqual(44);
    expect(ring.left).toBeGreaterThanOrEqual(ring.viewportLeft);
    expect(ring.right).toBeLessThanOrEqual(ring.viewportRight);
  }
});

test('board games are browsable without search and searchable on demand', async ({ page }) => {
  const { games, shelves } = getBrowseShelves();
  expect(shelves.flatMap(shelf => shelf.games).map(game => game.bggId).toSorted()).toEqual(games.map(game => game.bggId).toSorted());
  await page.goto('/board-games/');
  await expect(page.getByRole('link', { name: 'Browse A games' })).toBeVisible();
  await page.getByRole('link', { name: 'Browse A games' }).click();
  await expect(page).toHaveURL(/\/board-games\/browse\/a\/1\/$/);
  await expect(page.locator('[data-directory-shelf] li')).toHaveCount(shelves.find(shelf => shelf.letter === 'a' && shelf.page === 1)!.games.length);
  await page.goto('/board-games/');
  await page.getByRole('searchbox', { name: 'Search board games' }).fill('zzzz-no-matching-game');
  await expect(page.getByRole('heading', { name: 'No matching games' })).toBeVisible();
  await expect(page.locator('[data-empty]').getByRole('link', { name: 'pick a starting player' })).toHaveAttribute('href', '/');
  await page.getByRole('searchbox', { name: 'Search board games' }).fill('Azul');
  await expect(page.locator('[data-results] li').first()).toContainText('Azul');
  await page.getByRole('searchbox', { name: 'Search board games' }).fill('Acquire');
  await page.getByRole('button', { name: 'Awaiting a rule' }).click();
  await expect(page.locator('[data-results] li').first()).toHaveAttribute('data-has-rule', 'false');
  const pending = page.locator('[data-results] li').first();
  await pending.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(pending.getByRole('link', { name: 'Pick a player', exact: true })).toHaveAttribute('href', '/');
  await expect(pending.getByRole('link', { name: /View game on BoardGameGeek/ })).toHaveAttribute('href', /boardgamegeek\.com\/boardgame\/\d+/);
  await expect(page).toHaveURL(/\/board-games\/#q=Acquire&filter=pending$/);
  await page.getByRole('button', { name: 'All matches' }).click();
  await page.getByRole('searchbox', { name: 'Search board games' }).fill('Backgammon');
  await expect(page.locator('[data-results] li[data-id="2397"]')).toContainText('Backgammon');
  await page.getByRole('searchbox', { name: 'Search board games' }).fill('10 to kill');
  await expect(page.locator('[data-results] li')).toHaveCount(1);
  await page.getByRole('searchbox', { name: 'Search board games' }).fill('Azul');
  // A game with one sourced edition links straight to its rule.
  await page.locator('[data-results] li').filter({ hasText: 'Azul' }).first().getByRole('link').click();
  await expect(page).toHaveURL(/\/games\/azul-2018-en\/$/);
  await page.goBack();
  await page.setViewportSize({ width: 320, height: 750 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.goto('/board-games/15512/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Incan Gold');
  await expect(page.getByRole('link', { name: /Eagle-Gryphon English rules, ©2018/ })).toHaveAttribute('href', '/games/incan-gold-eagle-gryphon-en-2018/');
});

for (const width of [320, 1280]) {
  test(`accepted native names preserve their directory identity and rule status at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/board-games/');
    const input = page.getByRole('searchbox', { name: 'Search board games' });
    for (const [query, id, name, slug] of [
      ['ЗВЕЗДЫ АКАРИОСА', '273910', 'Stars of Akarios', null],
      ['Зоосад: Вода', '322421', 'Aqua Garden', 'aqua-garden-uchibacoya-en-rulebook'],
      ['Округ Хэрроу: Готическое противостояние', '360899', 'Harrow County: The Game of Gothic Conflict', 'harrow-county-off-the-page-en-2023-full'],
      ['Зоосад Дино', '447999', 'Dino Garden', 'dino-garden-uchibacoya-en-rulebook'],
    ] as const) {
      await input.fill(query);
      const results = page.locator('[data-results] li');
      await expect(results).toHaveCount(1);
      await expect(results).toHaveAttribute('data-id', id);
      await expect(results).toHaveAttribute('data-has-rule', String(slug !== null));
      if (slug) {
        await expect(results.locator('a[href^="/games/"]')).toHaveAttribute('href', `/games/${slug}/`);
        await expect(results.locator('a[href^="/games/"]')).toContainText(name);
        await expect(results.locator('summary')).toHaveCount(0);
      } else {
        await expect(results.locator('summary')).toHaveText(`${name}No checked starting rule yet`);
        await results.locator('summary').click();
        await expect(results.getByRole('link', { name: 'Pick a player', exact: true })).toHaveAttribute('href', '/');
        await expect(results.getByRole('link', { name: /View game on BoardGameGeek/ })).toHaveAttribute('href', `https://boardgamegeek.com/boardgame/${id}`);
        await expect(results.locator('a[href^="/games/"]')).toHaveCount(0);
      }
      await expect(page.locator('[data-count]')).toHaveText('1 game found');
    }
    await page.getByRole('button', { name: 'With a rule', exact: true }).click();
    await expect(page.locator('[data-results] li[data-id="447999"]')).toBeVisible();
    await page.getByRole('button', { name: 'Awaiting a rule', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'No matching games', exact: true })).toBeVisible();
    await input.fill('Звёзды Акариоса');
    await expect(page.locator('[data-results] li[data-id="273910"]')).toBeVisible();
    await input.fill('Брасс: Питтсбург');
    await expect(page.locator('[data-results] li')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'No matching games', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test('a sourced article links directly to its checked PDF passage and retains the complete rulebook', async ({ page }) => {
  await page.goto('/games/beyond-the-sun-rio-grande-en/');
  await expect(page.getByRole('link', { name: 'View cited page (PDF page 25)', exact: true })).toHaveAttribute('href', /Beyond-the-Sun-Combined-Rules\.pdf#page=25$/);
  await expect(page.getByRole('link', { name: 'Read the publisher’s rulebook', exact: true })).toHaveAttribute('href', /Beyond-the-Sun-Combined-Rules\.pdf$/);
});

test('three reviewed manuals preserve edition scope and viewer citations', async ({ page }) => {
  await page.goto('/games/ironwood-mindclash-en-publisher-rulebook/');
  await expect(page.locator('.rule-answer')).toContainText('Woodwalker Chieftain goes first');
  await expect(page.getByRole('link', { name: 'View cited page (PDF page 4)', exact: true })).toHaveAttribute('href', /Ironwood-rulebook-websafe\.pdf#page=4$/);
  await page.goto('/games/wroth-chip-theory-en-v1-0/');
  await expect(page.locator('.rule-answer')).toContainText('Randomly choose');
  await expect(page.getByText('Keep the token with the chosen player in Round 1.', { exact: false })).toBeVisible();
  await expect(page.getByRole('link', { name: /View cited page/ })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Read the source rules', exact: true })).toHaveAttribute('href', /www\.dropbox\.com\/scl\/fi\/.+&dl=0$/);
  await expect(page.getByText('Cited PDF pages: 8, 9, 10, 3, 1, 20, 7', { exact: true })).toBeVisible();
  await page.goto('/games/beyond-the-horizon-super-meeple-fr-rulebook/');
  await expect(page.getByText(/English summary of French rules/)).toBeVisible();
  await expect(page.locator('.rule-answer')).toContainText('Play proceeds clockwise');
  await expect(page.getByText(/begin with the last player, then continue counterclockwise/)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'If there’s a tie', exact: true })).toHaveCount(0);
});

test('traditional rules preserve fixed roles, handicap starts and actual opening ties', async ({ page }) => {
  await page.goto('/games/chess-fide-laws-2023-en/');
  await expect(page.locator('.rule-answer')).toContainText('White');
  await expect(page.getByRole('heading', { name: 'If there’s a tie', exact: true })).toHaveCount(0);
  await page.goto('/games/go-bga-tournament-rules-2009-en/');
  await expect(page.locator('.rule-answer')).toContainText('Black moves first');
  await expect(page.locator('.rule-answer')).toContainText('White moves first after all handicap stones');
  await expect(page.getByRole('heading', { name: 'If there’s a tie', exact: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'View cited page (PDF page 2)', exact: true })).toHaveAttribute('href', /rulesofplayfull\.pdf#page=2$/);
  await page.goto('/games/backgammon-usbgf-basics-standard-en/');
  await expect(page.locator('.rule-answer')).toContainText('without rolling again');
  await expect(page.getByRole('heading', { name: 'Official tie-break or fallback', exact: true })).toBeVisible();
  await expect(page.getByText('If the opening dice match, both players roll again until their numbers differ.', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Read the source rules', exact: true })).toHaveAttribute('href', 'https://usbgf.org/backgammon-basics-how-to-play/');
  // Resolve the opening before optional stake and match-play details.
  expect(await page.locator('.opening-tie').evaluate(section => Boolean(section.compareDocumentPosition(document.querySelector('.rule-section:not(.opening-tie)')!) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
  const sourceTarget = await page.getByRole('navigation', { name: 'Rulebook source', exact: true }).getByRole('link').boundingBox();
  expect(sourceTarget!.height).toBeGreaterThanOrEqual(44);
});

test('pending game help works on static shelves without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 750 } });
  const page = await context.newPage();
  await page.goto('/board-games/browse/a/1/');
  const pending = page.locator('[data-directory-shelf] li[data-has-rule="false"]').first();
  await pending.locator('summary').click();
  await expect(pending.getByText(/Follow the rulebook in your box/)).toBeVisible();
  await expect(pending.getByRole('link', { name: /View game on BoardGameGeek/ })).toBeVisible();
  await pending.getByRole('link', { name: 'Pick a player', exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await context.close();
});

test('six reviewed editions retain their opening instructions and direct source pages', async ({ page }) => {
  const cases = [
    ['samurai-fantasy-flight-2015-en', 5, 'The youngest player', 'clockwise'],
    ['shogun-queen-2006-en', 9, 'earliest turn-order position', 'special cards'],
    ['john-company-second-edition-wehrlegig-en', 13, 'skip the London Season', 'Chairman'],
    ['summoner-wars-second-edition-plaid-hat-en-v1-2', 5, 'Randomly choose', 'opponent begins with 3 magic'],
    ['london-second-edition-osprey-en-2017', 6, 'player who set up the game', 'clockwise'],
    ['the-game-pandasaurus-kwanchai-moriya-en', 1, 'group agrees', 'clockwise'],
  ] as const;
  for (const [slug, pdfPage, opening, context] of cases) {
    await page.goto(`/games/${slug}/`);
    await expect(page.locator('.rule-answer')).toContainText(opening);
    await expect(page.locator('.rule-answer')).toContainText(context);
    await expectReviewedSourceCitation(page, slug, pdfPage);
    if (slug.startsWith('shogun-')) {
      await expect(page.locator('.opening-tie')).toContainText('shuffle the tied');
      await expect(page.locator('.rule-section').filter({ hasText: 'Rule details' })).toContainText('oldest player begins claiming');
    }
    if (slug.startsWith('john-company-') || slug.startsWith('summoner-wars-') || slug.startsWith('the-game-')) {
      await expect(page.getByRole('heading', { name: 'If there’s a tie', exact: true })).toHaveCount(0);
    }
  }
});

test('modern editions distinguish first turns, later rounds and variant limits', async ({ page }) => {
  const cases = [
    ['cubirds-pandasaurus-en-2023', 2, 'dealer takes the first turn', 'becomes the new dealer', false],
    ['skyjo-magilano-en', 4, 'highest total goes first', 'ended the preceding round', true],
    ['samurai-sword-dv-undated-en', 4, 'Shogun role', 'With three players', false],
    ['nucleum-board-and-dice-2023-en', 5, 'choose the first player at random', 'human takes the First Player marker', false],
    ['spicy-heidelbaer-en-2020', 2, 'youngest player', 'challenge loser', true],
    ['dune-imperium-uprising-dire-wolf-en-2023', 5, 'randomly dealt Objective', 'outside this answer’s scope', false],
  ] as const;
  for (const [slug, pdfPage, opening, details, tieApplicable] of cases) {
    await page.goto(`/games/${slug}/`);
    await expect(page.locator('.rule-answer')).toContainText(opening);
    await expect(page.locator('.rule-section').filter({ hasText: 'Rule details' })).toContainText(details.replace('’', "'"));
    await expectReviewedSourceCitation(page, slug, pdfPage);
    await expect(page.getByRole('heading', { name: 'If there’s a tie', exact: true })).toHaveCount(tieApplicable ? 1 : 0);
  }
});

test('new native rule articles preserve cooperative choice and later-era distinctions', async ({ page }) => {
  for (const [slug, pageNumber, opening, detail] of [
    ['the-7th-citadel-serious-poulp-en-2023', 10, 'collectively chooses', 'On a later turn'],
    ['stonesaga-open-owl-en-rulebook-1-1', 24, 'any player may take the first turn', 'simultaneous day turns'],
    ['civolution-deep-print-us-en-1-0', 10, 'does not state how', 'that era’s scoring category'],
  ] as const) {
    await page.goto(`/games/${slug}/`);
    await expect(page.locator('.rule-answer')).toContainText(opening);
    await expect(page.locator('.rule-section').filter({ hasText: 'Rule details' })).toContainText(detail);
    await expect(page.getByRole('link', { name: `View cited page (PDF page ${pageNumber})`, exact: true })).toHaveAttribute('href', new RegExp(`#page=${pageNumber}$`));
    await expect(page.getByRole('heading', { name: 'If there’s a tie', exact: true })).toHaveCount(0);
  }
});

test('archived German summaries distinguish opening selection from action and feeding order', async ({ page }) => {
  await page.goto('/games/magalon-ravensburger-de-1998/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Who goes first in Magalon?');
  await expect(page.locator('.rule-answer')).toContainText('highest value takes the first action turn');
  await expect(page.locator('.game-article > p').first()).toContainText('German summary; archived');
  await expect(page.locator('.source-actions a').first()).toHaveAttribute('href', /#page=4$/);
  await page.goto('/games/hick-hack-in-gackelwack-zoch-de-printout-2007/');
  await expect(page.locator('.rule-answer')).toContainText('only after all players have chosen');
  await expect(page.locator('.source-actions a').first()).toHaveAttribute('href', /#page=2$/);
  await expect(page.getByRole('heading', { name: 'If there’s a tie' })).toHaveCount(0);
});
