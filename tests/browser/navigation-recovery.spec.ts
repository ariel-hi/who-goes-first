import { test, expect } from '@playwright/test';

for (const width of [320, 1280]) {
  test(`rules search survives reload and native article Back at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    const requests: string[] = [];
    page.on('request', request => requests.push(request.url()));
    await page.goto('/');
    await page.goto('/games/');
    const directory = page.locator('[data-game-directory]');
    const search = directory.getByRole('searchbox');
    const original = await directory.locator('.game-list a').evaluateAll(links => links.map(link => link.getAttribute('href')));
    const visitLength = await page.evaluate(() => history.length);
    await search.pressSequentially('Azul');
    const matches = directory.locator('.game-list li:visible a');
    await expect(matches).toHaveCount(3);
    const hrefs = await matches.evaluateAll(links => links.map(link => link.getAttribute('href')));
    await expect(page).toHaveURL(/\/games\/#q=Azul$/);
    expect(await page.evaluate(() => history.length)).toBe(visitLength);
    await page.reload();
    await expect(search).toHaveValue('Azul');
    await expect(matches).toHaveCount(3);
    expect(await matches.evaluateAll(links => links.map(link => link.getAttribute('href')))).toEqual(hrefs);
    await matches.first().click();
    await expect(page).toHaveURL(/\/games\/azul-2018-en\/$/);
    await page.goBack();
    await expect(search).toHaveValue('Azul');
    await expect(matches).toHaveCount(3);
    await expect(directory.locator('[data-count]')).toHaveText('3 rules found');
    expect(await matches.evaluateAll(links => links.map(link => link.getAttribute('href')))).toEqual(hrefs);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/games\/$/);
    await search.fill('');
    await expect(page).toHaveURL(/\/games\/$/);
    await expect(directory.locator('.game-list li:visible')).toHaveCount(original.length);
    expect(await directory.locator('.game-list a').evaluateAll(links => links.map(link => link.getAttribute('href')))).toEqual(original);
    expect(requests.every(url => !new URL(url).search && !new URL(url).hash)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test(`long-shelf page controls and Privacy return work without JavaScript at ${width}px`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 844 } });
    const page = await context.newPage();
    try {
      await page.goto(`${baseURL}/board-games/browse/a/2/`);
      // Firefox leaves page-context promises pending with JavaScript disabled.
      // Check font state synchronously; native geometry below verifies layout.
      expect(await page.evaluate(() => document.fonts.status)).toBe('loaded');
      const top = page.getByRole('navigation', { name: 'Directory pages above games', exact: true });
      const bottom = page.getByRole('navigation', { name: 'Directory pages below games', exact: true });
      await expect(top).toContainText('Page 2 of 2');
      const topLinks = await top.locator('a').evaluateAll(links => links.map(link => ({ text: link.textContent, href: link.getAttribute('href') })));
      expect(await bottom.locator('a').evaluateAll(links => links.map(link => ({ text: link.textContent, href: link.getAttribute('href') })))).toEqual(topLinks);
      const previous = top.getByRole('link', { name: '← Previous page', exact: true });
      const box = (await previous.boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.y + box.height).toBeLessThanOrEqual(844);
      expect(box.y).toBeLessThan((await page.locator('[data-directory-shelf] li').first().boundingBox())!.y);
      await previous.click();
      await expect(page).toHaveURL(/\/board-games\/browse\/a\/1\/$/);
      await page.getByRole('navigation', { name: 'Directory pages above games', exact: true }).getByRole('link', { name: '← 0–9', exact: true }).click();
      await expect(page).toHaveURL(/\/board-games\/browse\/0-9\/1\/$/);
      await expect(page.getByRole('navigation', { name: 'Directory pages below games', exact: true }).locator('a')).toHaveCount(1);
      await page.goto(`${baseURL}/board-games/browse/a/2/`);
      await page.getByRole('navigation', { name: 'Directory pages above games', exact: true }).getByRole('link', { name: 'B →', exact: true }).click();
      await expect(page).toHaveURL(/\/board-games\/browse\/b\/1\/$/);
      await page.goto(`${baseURL}/board-games/browse/other/1/`);
      const last = page.getByRole('navigation', { name: 'Directory pages below games', exact: true });
      await expect(last.locator('a')).toHaveCount(1);
      await expect(last.getByRole('link', { name: '← Z', exact: true })).toHaveAttribute('href', '/board-games/browse/z/1/');
      await page.goto(`${baseURL}/privacy/`);
      const back = page.locator('main').getByRole('link', { name: 'Back to the picker', exact: true });
      await back.scrollIntoViewIfNeeded();
      expect((await back.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await back.click();
      await expect(page).toHaveURL(/\/$/);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Pick a player');
    } finally { await context.close(); }
  });
}

test('rules bookmarks restore Unicode and keep ordinary anchors separate', async ({ page }) => {
  const directory = page.locator('[data-game-directory]');
  const search = directory.getByRole('searchbox');
  await page.goto(`/games/#q=${encodeURIComponent('Последний Титан')}`);
  await expect(search).toHaveValue('Последний Титан');
  await expect(directory.locator('.game-list li:visible a')).toHaveAttribute('href', '/games/final-titan-gaga-2026-ru-main/');
  const query = '四季 + &filter=rules 🧩';
  await search.fill(query);
  await expect.poll(() => new URL(page.url()).hash).toBe(`#q=${encodeURIComponent(query)}`);
  await page.reload();
  await expect(search).toHaveValue(query);
  await expect(directory.locator('[data-empty]')).toBeVisible();
  await expect(directory.locator('[data-directory-search]')).toHaveAttribute('href', `/board-games/#q=${encodeURIComponent(query)}`);
  await page.evaluate(() => { location.hash = '#random-rule'; });
  await expect(search).toHaveValue(query);
  await page.evaluate(() => { location.hash = ''; });
  await expect(search).toHaveValue('');
  await expect(directory.locator('[data-empty]')).toBeHidden();
  await page.goto('/games/#q=%00');
  await expect(search).toHaveValue('');
  await expect(directory.locator('[data-empty]')).toBeHidden();
  await expect(directory.locator('.game-list li:visible')).toHaveCount(await directory.locator('.game-list li').count());
});

test('blocked rules history writes leave native search and clearing usable', async ({ page }) => {
  await page.addInitScript(() => { history.replaceState = () => { throw new DOMException('Blocked', 'SecurityError'); }; });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/games/');
  const directory = page.locator('[data-game-directory]');
  const search = directory.getByRole('searchbox');
  await search.fill('Azul');
  await expect(search).toBeFocused();
  await expect(directory.locator('.game-list li:visible')).toHaveCount(3);
  await search.fill('');
  await expect(directory.locator('.game-list li:visible')).toHaveCount(await directory.locator('.game-list li').count());
  expect(errors).toEqual([]);
});
