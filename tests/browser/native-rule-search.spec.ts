import { test, expect } from '@playwright/test';

const checked = [
  ['Звёзды Акариоса', 'Stars of Akarios', 'stars-of-akarios-crowd-ru-base-manual'],
  ['Округ Хэрроу: Готическое противостояние', 'Harrow County: The Game of Gothic Conflict', 'harrow-county-off-the-page-en-2023-full'],
  ['Зоосад: Вода', 'Aqua Garden', 'aqua-garden-uchibacoya-en-rulebook'],
  ['Зоосад: Дино', 'Dino Garden', 'dino-garden-uchibacoya-en-rulebook'],
  ['Заповедник: Исчезающие виды', 'Spectacular', 'spectacular-crowd-ru-base-manual'],
  ['Ями', 'Yami', 'yami-crowd-ru-training-manual'],
] as const;

for (const width of [320, 1280]) {
  test(`two Russian manual articles retain honest openings and usable source citations without JavaScript at ${width}px`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 844 } });
    try {
      const page = await context.newPage();
      for (const [slug, name, folder, filename, pageNumber] of [
        ['spectacular-crowd-ru-base-manual', 'Spectacular', 'avf_1T19WUChTg', 'Заповедник. Исчезающие виды. Правила игры.pdf', 6],
        ['yami-crowd-ru-training-manual', 'Yami', 'zNyTWDsIvJsItA', 'Ями. Правила игры.pdf', 4],
      ] as const) {
        await page.goto(`${baseURL}/games/${slug}/`);
        await expect(page.getByRole('heading', {level:1})).toHaveText(`Who goes first in ${name}?`);
        await expect(page.locator('article')).toContainText('English summary of the Russian');
        await expect(page.locator('.rule-answer')).toContainText(name === 'Spectacular' ? 'Players act simultaneously' : 'a human must start');
        await expect(page.getByRole('heading', {name: 'If there’s a tie', exact:true})).toHaveCount(0);
        await expect(page.locator('.source-actions a')).toHaveCount(1);
        await expect(page.locator('.source-actions a')).toHaveAttribute('href', `https://disk.yandex.ru/d/${folder}`);
        await expect(page.locator('.source-cited-pages a')).toHaveCount(0);
        await expect(page.locator('.source-list')).toContainText(filename);
        await expect(page.locator('.source-list')).toContainText(`Cited PDF pages: ${pageNumber},`);
        await expect(page.locator('.fallback')).toContainText('Optional house rule');
        await expect(page.locator('.fallback a')).toHaveAttribute('href', '/');
        if (name === 'Yami') {
          await expect(page.locator('article')).toContainText('opening training mission');
          await expect(page.locator('article')).toContainText('The separate travel journal');
          await expect(page.locator('article')).toContainText('Automa may lead a later trick, but never receives the Kakapo pawn');
        } else await expect(page.locator('.fallback')).toContainText('does not give that player the first move');
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      }
    } finally { await context.close(); }
  });

  for (const route of ['/', '/games/']) {
    test(`validated native names reach the checked edition from ${route === '/' ? 'home' : 'library'} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      const home = route === '/';
      const root = page.locator(home ? '[data-rule-lookup]' : '[data-game-directory]');
      const links = root.locator(home ? '[data-results] a' : '.game-list li:not([hidden]) a');
      for (const [query, name, slug] of checked) {
        await page.goto(`${route}#q=${encodeURIComponent(query)}`);
        await expect(root.getByRole('searchbox')).toHaveValue(query);
        await expect(links).toHaveCount(1);
        await expect(links).toHaveText(name);
        await expect(links).toHaveAttribute('href', `/games/${slug}/`);
        await links.click();
        await expect(page.getByRole('heading', {level:1})).toHaveText(`Who goes first in ${name}?`);
        await page.goBack();
        await expect(root.getByRole('searchbox')).toHaveValue(query);
        await expect(links).toHaveAttribute('href', `/games/${slug}/`);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      }
      for (const query of ['Великая библиотека', 'Брасс: Питтсбург']) {
        await page.goto(`${route}#q=${encodeURIComponent(query)}`);
        await expect(root.getByRole('searchbox')).toHaveValue(query);
        await expect(home ? root.locator('[data-lookup-status]') : root.locator('[data-count]')).toContainText(home ? 'No checked rule matches' : '0 rules found');
        await expect(links).toHaveCount(0);
        await expect(root.locator('[data-directory-search]')).toHaveAttribute('href', `/board-games/#q=${encodeURIComponent(query)}`);
      }
      const input = root.getByRole('searchbox');
      await input.click();
      await input.press('ControlOrMeta+A');
      await input.pressSequentially('Ями');
      await expect(links).toHaveAttribute('href', '/games/yami-crowd-ru-training-manual/');
      await input.press('ControlOrMeta+A');
      await input.press('Backspace');
      await expect(input).toHaveValue('');
      if (home) await expect(root.locator('[data-results]')).toBeHidden();
      else await expect(root.locator('[data-count]')).toContainText('rules found');
      expect(errors).toEqual([]);
    });
  }
}
