import { test, expect } from '@playwright/test';

for (const width of [320, 1280]) {
  test(`typed search and sourced filter survive reload and native Back at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/');
    await page.goto('/board-games/');
    const search = page.getByRole('searchbox', { name: 'Search board games' });
    const visitLength = await page.evaluate(() => history.length);
    await search.pressSequentially('Townsfolk');
    await page.getByRole('button', { name: 'With a rule', exact: true }).click();
    await expect(page.locator('[data-results] li')).toHaveCount(1);
    await expect(page).toHaveURL(/\/board-games\/#q=Townsfolk&filter=rules$/);
    expect(await page.evaluate(() => history.length)).toBe(visitLength);
    await page.reload();
    await expect(search).toHaveValue('Townsfolk');
    await expect(page.getByRole('button', { name: 'With a rule', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-results] li')).toHaveCount(1);
    const article = page.locator('[data-results] a').first();
    const href = await article.getAttribute('href');
    await article.click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await page.goBack();
    await expect(search).toHaveValue('Townsfolk');
    await expect(page.getByRole('button', { name: 'With a rule', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-results] a')).toHaveAttribute('href', href!);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.goBack();
    expect(new URL(page.url()).pathname).toBe('/');
  });

  test(`broad pending search keeps its capped results and clearing resets state at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    const requests: string[] = [];
    page.on('request', request => requests.push(request.url()));
    await page.goto('/board-games/');
    const search = page.getByRole('searchbox', { name: 'Search board games' });
    await search.fill('a');
    await page.getByRole('button', { name: 'Awaiting a rule', exact: true }).click();
    await expect(page.locator('[data-results] li')).toHaveCount(80);
    const ids = await page.locator('[data-results] li').evaluateAll(items => items.map(item => (item as HTMLElement).dataset.id));
    const count = await page.locator('[data-count]').textContent();
    await expect(page).toHaveURL(/#q=a&filter=pending$/);
    await page.reload();
    await expect(search).toHaveValue('a');
    await expect(page.getByRole('button', { name: 'Awaiting a rule', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-count]')).toHaveText(count!);
    expect(await page.locator('[data-results] li').evaluateAll(items => items.map(item => (item as HTMLElement).dataset.id))).toEqual(ids);
    expect(await page.locator('[data-results] li').evaluateAll(items => items.every(item => (item as HTMLElement).dataset.hasRule === 'false'))).toBe(true);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/board-games\/$/);
    expect(requests.every(url => !new URL(url).hash && !new URL(url).search)).toBe(true);
    await search.fill('');
    await expect(page).toHaveURL(/\/board-games\/$/);
    await expect(page.locator('[data-results]')).toBeHidden();
    await search.fill('Townsfolk');
    await expect(page.getByRole('button', { name: 'All matches', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-results] li')).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test('fragment navigation restores Unicode punctuation and filters through Back and Forward', async ({ page }) => {
  const query = '四季 + &filter=rules 🧩';
  await page.route('**/board-games/search.json', route => route.fulfill({ json: [
    { name: query, id: '999999999', ruleCount: 0 },
    { name: 'Alpha', id: '999999998', ruleCount: 1, slug: 'azul-2018-en' },
  ] }));
  await page.goto('/board-games/#main');
  const search = page.getByRole('searchbox', { name: 'Search board games' });
  await search.fill(query);
  await expect(search).toBeFocused();
  await page.getByRole('button', { name: 'Awaiting a rule', exact: true }).click();
  await expect.poll(() => new URL(page.url()).hash).toBe(`#q=${encodeURIComponent(query)}&filter=pending`);
  await page.evaluate(() => { location.hash = '#q=Alpha&filter=rules'; });
  await expect(search).toHaveValue('Alpha');
  await expect(page.locator('[data-results] a')).toHaveAttribute('href', '/games/azul-2018-en/');
  await page.goBack();
  await expect(search).toHaveValue(query);
  await expect(page.getByRole('button', { name: 'Awaiting a rule', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-results] li')).toHaveCount(1);
  await page.goForward();
  await expect(search).toHaveValue('Alpha');
  await page.evaluate(() => { location.hash = '#main'; });
  await expect(search).toHaveValue('Alpha');
  await expect(page.getByRole('button', { name: 'With a rule', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.evaluate(() => { location.hash = ''; });
  await expect(search).toHaveValue('');
  await expect(page.locator('[data-results]')).toBeHidden();
});

test('blocked history writes still allow native typing, filtering and clearing', async ({ page }) => {
  await page.addInitScript(() => {
    history.replaceState = () => { throw new DOMException('Blocked by browser', 'SecurityError'); };
  });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/board-games/');
  const search = page.getByRole('searchbox', { name: 'Search board games' });
  await search.fill('Townsfolk');
  await expect(search).toBeFocused();
  await expect(page.locator('[data-results] li')).toHaveCount(1);
  await page.getByRole('button', { name: 'Awaiting a rule', exact: true }).click();
  await expect(page.locator('[data-empty]')).toBeVisible();
  await search.fill('');
  await expect(page.locator('[data-count]')).toBeHidden();
  await expect(page.getByRole('link', { name: 'Browse A games' })).toBeVisible();
  expect(errors).toEqual([]);
});
