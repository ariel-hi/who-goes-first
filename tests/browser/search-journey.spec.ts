import { test, expect } from '@playwright/test';

test('a home no-match search carries Unicode to the directory through a keyboard link', async ({ page }) => {
  const query = '四季 Étoile & 🧩';
  const searchRequests: string[] = [];
  page.on('request', request => {
    if (['/board-games/', '/board-games/search.json', '/rule-index.json'].includes(new URL(request.url()).pathname)) searchRequests.push(request.url());
  });
  await page.route('**/rule-index.json', route => route.fulfill({ json: [] }));
  await page.route('**/board-games/search.json', route => route.fulfill({ json: [{ name: query, id: '999999999', ruleCount: 0 }] }));
  await page.goto('/');
  const home = page.locator('[data-rule-lookup]');
  await home.getByRole('searchbox').fill(`  ${query}  `);
  await expect(home.getByRole('status')).toContainText('No checked rule matches');
  const bridge = home.getByRole('link', { name: 'Find this game in the directory' });
  await expect(bridge).toHaveAttribute('href', `/board-games/#q=${encodeURIComponent(query)}`);
  expect((await bridge.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await bridge.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('searchbox', { name: 'Search board games' })).toHaveValue(query);
  await expect(page.locator('[data-results] li')).toHaveCount(1);
  await expect(page.locator('[data-results] li')).toContainText(query);
  await expect(page.locator('[data-count]')).toHaveText('1 game found');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/board-games\/$/);
  expect(searchRequests.length).toBeGreaterThanOrEqual(3);
  for (const request of searchRequests) {
    expect(new URL(request).search).toBe('');
    expect(new URL(request).hash).toBe('');
  }
});

test('unavailable home lookup still offers the directory and unavailable directory search retains browsing', async ({ page }) => {
  await page.route('**/rule-index.json', route => route.fulfill({ status: 503, body: 'Unavailable' }));
  await page.route('**/board-games/search.json', route => route.fulfill({ status: 503, body: 'Unavailable' }));
  await page.goto('/');
  const home = page.locator('[data-rule-lookup]');
  await home.getByRole('searchbox').fill('Missing game');
  await expect(home.getByRole('status')).toContainText('Rule search is unavailable');
  await home.getByRole('link', { name: 'Find this game in the directory' }).click();
  await expect(page.getByRole('searchbox', { name: 'Search board games' })).toHaveValue('Missing game');
  await expect(page.locator('[data-count]')).toHaveText('Search is unavailable. Browse by letter below.');
  await expect(page.getByRole('link', { name: 'Browse A games' })).toBeVisible();
  await expect(page.locator('[data-results]')).toBeHidden();
});

test('delayed home and directory responses show only the latest query', async ({ page }) => {
  let releaseHome!: () => void;
  let releaseDirectory!: () => void;
  const homeReady = new Promise<void>(resolve => { releaseHome = resolve; });
  const directoryReady = new Promise<void>(resolve => { releaseDirectory = resolve; });
  await page.route('**/rule-index.json', async route => {
    await homeReady;
    await route.fulfill({ json: [
      { n: 'Synthetic Alpha', a: [], e: 'Test edition', s: 'synthetic-alpha' },
      { n: 'Synthetic Beta', a: [], e: 'Test edition', s: 'synthetic-beta' },
    ] });
  });
  await page.route('**/board-games/search.json', async route => {
    await directoryReady;
    await route.fulfill({ json: [
      { name: 'Synthetic Alpha', id: '999999998', ruleCount: 0 },
      { name: 'Synthetic Beta', id: '999999999', ruleCount: 0 },
    ] });
  });
  await page.goto('/');
  const home = page.locator('[data-rule-lookup]');
  await home.getByRole('searchbox').fill('Synthetic Alpha');
  await home.getByRole('searchbox').fill('Synthetic Beta');
  releaseHome();
  await expect(home.locator('[data-results] li')).toHaveCount(1);
  await expect(home.locator('[data-results]')).toContainText('Synthetic Beta');
  await expect(home.getByRole('link', { name: 'Find this game in the directory' })).toHaveAttribute('href', '/board-games/#q=Synthetic%20Beta');
  await page.goto('/board-games/#q=Synthetic%20Alpha');
  await page.getByRole('searchbox', { name: 'Search board games' }).fill('Synthetic Beta');
  releaseDirectory();
  await expect(page.locator('[data-results] li')).toHaveCount(1);
  await expect(page.locator('[data-results]')).toContainText('Synthetic Beta');
});

test('a late home lookup failure cannot overwrite a cleared query', async ({ page }) => {
  let release!: () => void;
  const ready = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/rule-index.json', async route => { await ready; await route.fulfill({ status: 503, body: 'Unavailable' }); });
  await page.goto('/');
  const home = page.locator('[data-rule-lookup]');
  await home.getByRole('searchbox').fill('Synthetic Alpha');
  await home.getByRole('searchbox').fill('');
  const response = page.waitForResponse('**/rule-index.json');
  release();
  await response;
  const clearedStatus = home.getByRole('status', { includeHidden: true });
  await expect(clearedStatus).toBeEmpty();
  await expect(clearedStatus).toBeHidden();
  await expect(home.locator('[data-results]')).toBeHidden();
  await expect(home.getByRole('link', { name: 'Browse all board games' })).toHaveAttribute('href', '/board-games/');
});

test('malformed and overlong fragment searches fail clearly without fetching the index', async ({ page }) => {
  let lookups = 0;
  await page.route('**/board-games/search.json', route => { lookups++; return route.fulfill({ json: [] }); });
  for (const fragment of ['%E0%A4%A', encodeURIComponent('x'.repeat(101)), '%00']) {
    await page.goto(`/board-games/#q=${fragment}`);
    await expect(page.getByRole('searchbox', { name: 'Search board games' })).toHaveValue('');
    await expect(page.locator('[data-count]')).toContainText('This search link could not be read');
    await expect(page.getByRole('link', { name: 'Browse A games' })).toBeVisible();
  }
  expect(lookups).toBe(0);
});

test('the home directory link and static shelves remain usable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto('/');
    const bridge = page.locator('[data-rule-lookup]').getByRole('link', { name: 'Browse all board games' });
    await expect(bridge).toHaveAttribute('href', '/board-games/');
    await bridge.click();
    await page.getByRole('link', { name: 'Browse A games' }).click();
    await expect(page).toHaveURL(/\/board-games\/browse\/a\/1\/$/);
    await expect(page.locator('[data-directory-shelf] li').first()).toBeVisible();
  } finally {
    await context.close();
  }
});
