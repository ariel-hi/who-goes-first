import { test, expect } from '@playwright/test';
import { DEV } from './urls';

test('repeated rule searches retain ranked links and clearing restores the complete original order', async ({ page, browserName }) => {
  await page.goto('/games/');
  const rules = page.locator('[data-game-directory]');
  const search = rules.getByRole('searchbox');
  const original = await rules.locator('.game-list a').evaluateAll(links => links.map(link => link.getAttribute('href')));
  expect(original.length).toBeGreaterThan(800);
  await search.fill('TTR');
  const matches = rules.locator('.game-list li:visible a');
  await expect(matches).toHaveCount(4);
  await expect(search).toBeFocused();
  const aliases = await matches.evaluateAll(links => links.map(link => link.getAttribute('href')));
  await search.fill('Azl');
  await expect(matches).toHaveCount(1);
  await expect(matches.first()).toHaveAttribute('href', '/games/azul-2018-en/');
  await search.fill('TTR');
  await expect(matches).toHaveCount(4);
  expect(await matches.evaluateAll(links => links.map(link => link.getAttribute('href')))).toEqual(aliases);
  await search.fill('');
  await expect(rules.locator('.game-list li:visible')).toHaveCount(original.length);
  expect(await rules.locator('.game-list a').evaluateAll(links => links.map(link => link.getAttribute('href')))).toEqual(original);
  await search.fill('Azul');
  await expect(matches.first()).toHaveAttribute('href', '/games/azul-2018-en/');
  // Windows WebKit skips anchors on Tab; still require native link focus and
  // keyboard activation. Chromium/Firefox additionally verify sequential order.
  if (browserName === 'webkit') await matches.first().focus();
  else await search.press('Tab');
  await expect(matches.first()).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/games\/azul-2018-en\/$/);
});

test('home search ranks prepared names, aliases and edition labels across repeated input', async ({ page }) => {
  await page.route('**/rule-index.json', route => route.fulfill({ json: [
    { n: 'Azul: Summer Pavilion', a: [], e: 'English', s: 'prefix' },
    { n: 'Azl', a: [], e: 'English', s: 'fuzzy' },
    { n: 'My Azul', a: [], e: 'English', s: 'contained' },
    { n: 'Azul', a: ['Blå'], e: 'Édition française', s: 'exact' },
  ] }));
  await page.goto('/');
  const home = page.locator('[data-rule-lookup]');
  const search = home.getByRole('searchbox');
  const results = home.locator('[data-results] a');
  await search.fill('Azul');
  await expect(results).toHaveCount(4);
  expect(await results.evaluateAll(links => links.map(link => link.getAttribute('href')))).toEqual(['/games/exact/', '/games/prefix/', '/games/contained/', '/games/fuzzy/']);
  for (const [query, count] of [['BLA', 1], ['francaise', 1], ['Azul', 4]] as const) {
    await search.fill(query);
    await expect(results).toHaveCount(count);
    await expect(results.first()).toHaveAttribute('href', '/games/exact/');
  }
  await search.fill('');
  await expect(home.locator('[data-results]')).toBeHidden();
  await expect(home.getByRole('link', { name: 'Browse all board games' })).toHaveAttribute('href', '/board-games/');
});

test('a rules-page no-match search finds an unreviewed Unicode game through a keyboard directory link', async ({ page }) => {
  const query = 'Unreviewed 四季 Étoile & 🧩';
  const directoryRequests: string[] = [];
  page.on('request', request => {
    if (['/board-games/', '/board-games/search.json'].includes(new URL(request.url()).pathname)) directoryRequests.push(request.url());
  });
  await page.route('**/board-games/search.json', route => route.fulfill({ json: [{ name: query, id: '999999999', ruleCount: 0 }] }));
  await page.goto('/games/');
  const rules = page.locator('[data-game-directory]');
  await rules.getByRole('searchbox').fill(`  ${query}  `);
  await expect(rules.locator('[data-count]')).toHaveText('0 rules found');
  await expect(rules.locator('[data-empty]')).toBeVisible();
  const bridge = rules.getByRole('link', { name: 'Find this game in the directory' });
  await expect(bridge).toHaveAttribute('href', `/board-games/#q=${encodeURIComponent(query)}`);
  expect((await bridge.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await expect(rules.getByRole('link', { name: 'Pick a starting player instead' })).toHaveAttribute('href', '/');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/games\/$/);
  await bridge.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('searchbox', { name: 'Search board games' })).toHaveValue(query);
  await expect(page.locator('[data-results] li')).toHaveCount(1);
  await expect(page.locator('[data-results]')).toContainText(query);
  await expect(page.locator('[data-count]')).toHaveText('1 game found');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/board-games\/$/);
  expect(directoryRequests.length).toBeGreaterThanOrEqual(2);
  for (const request of directoryRequests) {
    expect(new URL(request).search).toBe('');
    expect(new URL(request).hash).toBe('');
  }
});

test('rules-page recovery follows the latest query and bounds its Unicode fragment', async ({ page }) => {
  await page.goto('/games/');
  const rules = page.locator('[data-game-directory]');
  const search = rules.getByRole('searchbox');
  const bridge = rules.locator('[data-directory-search]');
  await search.fill('Synthetic missing Alpha');
  await search.fill('Synthetic missing Beta');
  await expect(bridge).toHaveAttribute('href', '/board-games/#q=Synthetic%20missing%20Beta');
  // Exercise the bridge's bound even if a script bypasses the input maxlength.
  await search.evaluate((input: HTMLInputElement, value) => {
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }, 'x'.repeat(99) + '🧩');
  await expect(bridge).toHaveAttribute('href', `/board-games/#q=${'x'.repeat(99)}`);
  await search.fill('');
  await expect(bridge).toHaveAttribute('href', '/board-games/');
  await expect(rules.locator('[data-empty]')).toBeHidden();
  await expect(rules.locator('.game-list li:visible').first()).toBeVisible();
});

test('draft rule directories do not acquire the public directory recovery', async ({ page }) => {
  await page.goto(`${DEV}/dev/games/`);
  const rules = page.locator('[data-game-directory]');
  await rules.getByRole('searchbox').fill('Synthetic missing 四季');
  await expect(rules.locator('[data-empty]')).toBeVisible();
  await expect(rules.locator('[data-directory-search]')).toHaveCount(0);
  await expect(rules.getByRole('link', { name: 'Find this game in the directory', includeHidden: true })).toHaveCount(0);
  await expect(rules.getByRole('link', { name: 'Pick a starting player instead' })).toHaveAttribute('href', '/');
});

test('rules-page directory recovery remains an ordinary link without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto('/games/');
    const rules = page.locator('[data-game-directory]');
    await expect(rules.locator('.game-list li').first()).toBeVisible();
    const bridge = rules.getByRole('link', { name: 'Find this game in the directory' });
    await expect(bridge).toHaveAttribute('href', '/board-games/');
    expect((await bridge.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await bridge.click();
    await page.getByRole('link', { name: 'Browse A games' }).click();
    await expect(page).toHaveURL(/\/board-games\/browse\/a\/1\/$/);
    await expect(page.locator('[data-directory-shelf] li').first()).toBeVisible();
  } finally {
    await context.close();
  }
});

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
