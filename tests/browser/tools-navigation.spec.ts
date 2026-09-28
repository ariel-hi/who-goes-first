import { test, expect } from '@playwright/test';

for (const width of [320, 1280]) {
  test('keyboard tool discovery and native Back preserve directory search at ' + width + 'px', async ({ page }) => {
    const errors: string[] = [];
    const requests: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => {
      const url = new URL(request.url());
      if (url.origin === new URL(page.url()).origin) requests.push(request.url());
    });
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/board-games/');
    const decline = page.getByRole('button', { name: 'No thanks', exact: true });
    if (await decline.isVisible()) await decline.click();
    const search = page.getByRole('searchbox', { name: 'Search board games' });
    await search.fill('Townsfolk');
    await page.getByRole('button', { name: 'With a rule', exact: true }).click();
    await expect(page.locator('[data-results] li')).toHaveCount(1);
    await expect(page).toHaveURL(/\/board-games\/#q=Townsfolk&filter=rules$/);
    const nav = page.getByRole('navigation', { name: 'Main navigation', exact: true });
    expect(await nav.locator('a').allTextContents()).toEqual(['All games', 'Starting rules', 'Tools', 'About']);
    const tools = nav.getByRole('link', { name: 'Tools', exact: true });
    await tools.focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/tools\/$/);
    await expect(tools).toHaveAttribute('aria-current', 'page');
    const team = page.getByRole('list', { name: 'Decision tools', exact: true }).getByRole('link', { name: /^Random team generator/ });
    await team.focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/random-team-generator\/$/);
    const back = page.locator('main').getByRole('link', { name: /All decision tools/ });
    await expect(back).toHaveAttribute('href', '/tools/');
    expect((await back.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await back.focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/tools\/$/);

    // Return through actual native history, including the tool's hub return visit.
    await page.goBack();
    await expect(page).toHaveURL(/\/random-team-generator\/$/);
    await page.goBack();
    await expect(page).toHaveURL(/\/tools\/$/);
    await page.goBack();
    await expect(page).toHaveURL(/\/board-games\/#q=Townsfolk&filter=rules$/);
    await expect(search).toHaveValue('Townsfolk');
    await expect(page.getByRole('button', { name: 'With a rule', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-results] li')).toHaveCount(1);
    expect(requests.every(value => !new URL(value).search && !new URL(value).hash)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });

  test('tools and return links remain discoverable without JavaScript at ' + width + 'px', async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 844 } });
    try {
      const page = await context.newPage();
      await page.goto(baseURL + '/games/azul-2018-en/');
      const nav = page.getByRole('navigation', { name: 'Main navigation', exact: true });
      const link = nav.getByRole('link', { name: 'Tools', exact: true });
      expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      await link.focus();
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(/\/tools\/$/);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Decision tools.');
      const choices = page.getByRole('list', { name: 'Decision tools', exact: true }).locator('a');
      expect(await choices.evaluateAll(links => links.map(link => link.getAttribute('href')))).toEqual([
        '/', '/finger-chooser/', '/coin-flip/', '/random-team-generator/', '/rock-paper-scissors/',
      ]);
      for (const choice of await choices.all()) expect((await choice.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      const rule = page.locator('main').getByRole('link', { name: 'Check its starting-player rule', exact: true });
      await expect(rule).toHaveAttribute('href', '/games/');
      await choices.filter({ hasText: 'Coin flip' }).click();
      await expect(page).toHaveURL(/\/coin-flip\/$/);
      const back = page.locator('main').getByRole('link', { name: /All decision tools/ });
      expect((await back.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      const intro = await page.locator('.intro').boundingBox();
      expect((await back.boundingBox())!.y).toBeLessThan(intro!.y);
      await back.focus();
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(/\/tools\/$/);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    } finally { await context.close(); }
  });
}
