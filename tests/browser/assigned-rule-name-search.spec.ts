import { test, expect, type Locator } from '@playwright/test';

const query = '7 Wonders (Second Edition)';
const answerHref = '/games/7-wonders-2020-en/';
const originalSlug = '7-wonders-repos-original-en';
const originalAnswerHref = `/games/${originalSlug}/`;
const opening = 'Everyone chooses a card at the same time, then reveals and plays it together. There is no single starting player in normal play.';

async function nativeType(input: Locator, value: string) {
  await input.click();
  await input.press('ControlOrMeta+A');
  await input.press('Backspace');
  await input.pressSequentially(value);
}

for (const width of [320, 1280]) {
  test(`assigned second-edition name reaches its checked answer while keeping the original edition separate at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));

    // Actual lazy compiled index, not a mocked search payload or a mapper import.
    await page.goto('/');
    const home = page.locator('[data-rule-lookup]');
    const indexResponse = page.waitForResponse(response => new URL(response.url()).pathname === '/rule-index.json');
    await nativeType(home.getByRole('searchbox'), query);
    const homeLinks = home.locator('[data-results] a');
    await expect(homeLinks).toHaveCount(1);
    await expect(homeLinks).toBeVisible();
    await expect(homeLinks.locator('span').first()).toHaveText('7 Wonders');
    await expect(homeLinks).toHaveAttribute('href', answerHref);
    const index = await (await indexResponse).json() as { s: string; p: boolean }[];
    const editions = index.filter(entry => entry.s === '7-wonders-2020-en');
    expect(editions).toHaveLength(1);
    expect(editions[0]!.p).toBe(false); // Discovery must not enroll this simultaneous answer in the random-rule pool.
    const originals = index.filter(entry => entry.s === originalSlug);
    expect(originals.length).toBeLessThanOrEqual(1);
    await homeLinks.click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Who goes first in 7 Wonders?');
    await expect(page.locator('.rule-answer')).toHaveText(opening);

    // Public SSR search projection must agree with the homepage index.
    await page.goto('/games/');
    const library = page.locator('[data-game-directory]');
    await nativeType(library.getByRole('searchbox'), query);
    const libraryLinks = library.locator('.game-list li:not([hidden]) a');
    await expect(libraryLinks).toHaveCount(1);
    await expect(libraryLinks).toBeVisible();
    await expect(libraryLinks).toContainText('7 Wonders');
    await expect(libraryLinks).toHaveAttribute('href', answerHref);

    // The original may gain its own checked article; it must never inherit the 2020 answer.
    await page.goto('/board-games/');
    await nativeType(page.getByRole('searchbox', { name: 'Search board games' }), '7 Wonders');
    const original = page.locator('[data-results] li[data-id="68448"]');
    const second = page.locator('[data-results] li[data-id="316377"]');
    // The independent public index detects an article whose directory attachment is missing.
    await expect(original).toHaveAttribute('data-has-rule', String(originals.length === 1));
    await expect(original.locator(`a[href="${answerHref}"]`)).toHaveCount(0);
    if (originals.length === 1) {
      const originalAnswer = original.locator('a[href^="/games/"]');
      await expect(originalAnswer).toHaveCount(1);
      await expect(originalAnswer).toContainText('7 Wonders');
      await expect(originalAnswer).toHaveAttribute('href', originalAnswerHref);
      await expect(original.locator('summary')).toHaveCount(0);
    } else {
      await expect(original.locator('summary')).toContainText('7 Wonders');
      await original.locator('summary').click();
      await expect(original.getByText(/We haven’t checked this game’s starting rule yet/)).toBeVisible();
      await expect(original.getByRole('link', { name: 'Pick a player', exact: true })).toHaveAttribute('href', '/');
      await expect(original.locator('a[href^="/games/"]')).toHaveCount(0);
    }
    await expect(second).toHaveAttribute('data-has-rule', 'true');
    const secondAnswer = second.locator('a[href^="/games/"]');
    await expect(secondAnswer).toContainText(query);
    await expect(secondAnswer).toHaveAttribute('href', answerHref);
    await secondAnswer.click();
    await expect(page).toHaveURL(/\/games\/7-wonders-2020-en\/$/);
    await expect(page.locator('.rule-answer')).toHaveText(opening);
    await expect(page.locator('article')).toContainText('2020 edition');
    expect(errors).toEqual([]);
  });
}
