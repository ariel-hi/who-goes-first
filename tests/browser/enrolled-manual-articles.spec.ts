import { test, expect } from '@playwright/test';

const cases = [
  { slug: 'immunowars-2023-en-second-edition', query: 'ImmunoWars', title: 'Who goes first in ImmunoWars?', page: 13, opening: 'highest roller begins the startup turn', detail: 'does not separately identify who takes the first normal turn', edition: '2023 second edition', tieHeading: 'If there’s a tie' },
  { slug: 'townsfolk-tussle-frosted-2024-de-base', query: 'Townsfolk Tussle', title: 'Who goes first in Townsfolk Tussle?', page: 11, opening: 'bottom of the turn-order track', detail: 'move the top villager token to the bottom', edition: 'English summary of the German', tieHeading: null },
  { slug: 'final-titan-gaga-2026-ru-main', query: 'Final Titan', title: 'Who goes first in Final Titan?', page: 9, opening: 'highest speed', detail: 'youngest player starts the setup draft', edition: 'English summary of the Russian', tieHeading: 'Official tie-break or fallback' },
] as const;
for (const game of cases) test(`${game.query} search leads to its scoped source answer`, async ({ page }) => {
  await page.goto('/board-games/');
  await page.getByRole('searchbox', { name: 'Search board games' }).fill(game.query);
  const answer = page.locator(`[data-results] a[href="/games/${game.slug}/"]`);
  await expect(answer).toHaveAttribute('href', `/games/${game.slug}/`);
  await answer.click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(game.title);
  await expect(page.locator('.game-article > p').first()).toContainText(game.edition);
  await expect(page.locator('.rule-answer')).toContainText(game.opening);
  await expect(page.locator('.rule-section').filter({ hasText: 'Rule details' })).toContainText(game.detail);
  await expect(page.getByRole('link', { name: `View cited page (PDF page ${game.page})`, exact: true })).toHaveAttribute('href', new RegExp(`#page=${game.page}$`));
  for (const heading of ['If there’s a tie', 'Official tie-break or fallback']) {
    await expect(page.getByRole('heading', { name: heading, exact: true })).toHaveCount(game.tieHeading === heading ? 1 : 0);
  }
  await expect(page.getByRole('link', { name: 'use the player picker', exact: true })).toHaveAttribute('href', '/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('reviewed editions and Northgard pending guidance work without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 844 } });
  const page = await context.newPage();
  try {
    for (const game of cases) {
      await page.goto(`${baseURL}/games/${game.slug}/`);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(game.title);
      await expect(page.locator('.rule-answer')).toContainText(game.opening);
      await expect(page.locator('.game-article > p').first()).toContainText(game.edition);
      await expect(page.getByRole('link', { name: `View cited page (PDF page ${game.page})`, exact: true })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    await page.goto(`${baseURL}/board-games/browse/n/1/`);
    const pending = page.locator('.directory-pending').filter({ hasText: 'Northgard: Uncharted Lands' });
    await pending.locator('summary').click();
    await expect(pending).toHaveAttribute('open', '');
    await expect(pending.getByRole('link', { name: /pick/i })).toHaveAttribute('href', '/');
    await expect(pending.getByRole('link', { name: 'View game on BoardGameGeek', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  } finally { await context.close(); }
});

test('a bookmarked Russian title reaches Final Titan and survives native Back with its filter', async ({ page }) => {
  const query = 'Последний Титан';
  await page.goto(`/board-games/#q=${encodeURIComponent(query)}&filter=rules`);
  const search = page.getByRole('searchbox', { name: 'Search board games' });
  await expect(search).toHaveValue(query);
  await expect(page.getByRole('button', { name: 'With a rule', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-results] li')).toHaveCount(1);
  await expect(page.locator('[data-results] li')).toHaveAttribute('data-id', '428280');
  await page.locator('[data-results] a').click();
  await expect(page).toHaveURL(/\/games\/final-titan-gaga-2026-ru-main\/$/);
  await expect(page.locator('.rule-section').filter({ hasText: 'Official tie-break or fallback' })).toContainText('draw lots');
  await expect(page.locator('.rule-section').filter({ hasText: 'Rule details' })).toContainText('previous contender');
  await expect(page.getByRole('link', { name: 'PDF page 14', exact: true })).toHaveAttribute('href', /#page=14$/);
  await page.goBack();
  await expect(search).toHaveValue(query);
  await expect(page.getByRole('button', { name: 'With a rule', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-results] li')).toHaveCount(1);
});
