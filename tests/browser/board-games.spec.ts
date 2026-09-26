import { test, expect } from '@playwright/test';
import { getBrowseShelves } from '../../src/lib/content/board-game-browse';

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
  await expect(page).toHaveURL(/\/board-games\/$/);
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

test('a sourced article links directly to its checked PDF passage and retains the complete rulebook', async ({ page }) => {
  await page.goto('/games/beyond-the-sun-rio-grande-en/');
  await expect(page.getByRole('link', { name: 'View cited page (PDF page 25)', exact: true })).toHaveAttribute('href', /Beyond-the-Sun-Combined-Rules\.pdf#page=25$/);
  await expect(page.getByRole('link', { name: 'Read the publisher’s rulebook', exact: true })).toHaveAttribute('href', /Beyond-the-Sun-Combined-Rules\.pdf$/);
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
