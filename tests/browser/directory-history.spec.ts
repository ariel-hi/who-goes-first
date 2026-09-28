import { test, expect } from '@playwright/test';
import { getBoardGames } from '../../src/lib/content/board-games';

for (const width of [320, 1280]) {
  test(`typed search and sourced filter survive reload and native Back at ${width}px`, async ({ page }, testInfo) => {
    // Observe actual native navigation separately from the simulated diagnostics below.
    await page.addInitScript(() => {
      const observations: { persisted: boolean; href: string }[] = [];
      Object.defineProperty(window, '__directoryNativePageShows', { value: observations });
      window.addEventListener('pageshow', event => observations.push({ persisted: event.persisted, href: location.href }));
    });
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
    await article.focus();
    const focusedBeforeNativeVisit = await article.evaluate(link => document.activeElement === link);
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await page.goBack();
    await expect(search).toHaveValue('Townsfolk');
    await expect(page.getByRole('button', { name: 'With a rule', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-results] a')).toHaveAttribute('href', href!);
    await expect.poll(() => page.evaluate(() => (window as unknown as { __directoryNativePageShows: unknown[] }).__directoryNativePageShows.length)).toBeGreaterThan(0);
    const nativeBack = await page.evaluate(() => ({
      pageshowEvents: (window as unknown as { __directoryNativePageShows: { persisted: boolean; href: string }[] }).__directoryNativePageShows,
      activeElement: { tag: document.activeElement?.tagName, href: document.activeElement?.getAttribute('href') },
    }));
    await testInfo.attach('actual-native-back-observations.json', {
      body: JSON.stringify({ simulated: false, width, focusedBeforeNativeVisit, href, ...nativeBack }, null, 2), contentType: 'application/json',
    });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.goBack();
    expect(new URL(page.url()).pathname).toBe('/');
  });

  test(`simulated unchanged persisted pageshow preserves the focused directory result node at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/board-games/#q=Townsfolk&filter=rules');
    const row = page.locator('[data-results] li[data-id="312859"]');
    const link = row.locator('a');
    await expect(link).toHaveAttribute('href', '/games/townsfolk-tussle-frosted-2024-de-base/');
    await expect(page.getByRole('button', { name: 'With a rule', exact: true })).toHaveAttribute('aria-pressed', 'true');
    const original = await link.elementHandle();
    expect(original).not.toBeNull();
    try {
      await link.focus();
      // Explicit diagnostic event; this does not establish native BFCache use.
      await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
      await expect(link).toBeFocused();
      const retained = await original!.evaluate(node => node.isConnected && node === document.querySelector('[data-results] li[data-id="312859"] a'));
      expect(retained).toBe(true);
      await expect(page.getByRole('searchbox', { name: 'Search board games' })).toHaveValue('Townsfolk');
      await expect(page).toHaveURL(/#q=Townsfolk&filter=rules$/);
      await testInfo.attach('simulated-persisted-focused-result.json', { body: JSON.stringify({ simulated: true, width, retained, focused: true }), contentType: 'application/json' });
    } finally { await original?.dispose(); }
  });

  test(`simulated unchanged persisted pageshow keeps a pending disclosure open and its link focused at ${width}px`, async ({ page }, testInfo) => {
    // Confirm the actual content getter's status; do not silently skip an enrolled fixture.
    const pending = getBoardGames().find(game => game.bggId === '1806');
    expect(pending?.name).toBe('Rüsselbande');
    expect(pending?.rules).toHaveLength(0);
    await page.setViewportSize({ width, height: 800 });
    await page.goto(`/board-games/#q=${encodeURIComponent('Rüsselbande')}&filter=pending`);
    const row = page.locator('[data-results] li[data-id="1806"]');
    await expect(row).toHaveAttribute('data-has-rule', 'false');
    const disclosure = row.locator('details');
    await row.locator('summary').click();
    await expect(disclosure).toHaveAttribute('open', '');
    const link = row.getByRole('link', { name: 'Pick a player', exact: true });
    await expect(link).toHaveAttribute('href', '/');
    const originalDisclosure = await disclosure.elementHandle();
    const originalLink = await link.elementHandle();
    expect(originalDisclosure).not.toBeNull(); expect(originalLink).not.toBeNull();
    try {
      await link.focus();
      // Only this diagnostic event is simulated; no external identity link is visited.
      await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
      await expect(link).toBeFocused();
      await expect(disclosure).toHaveAttribute('open', '');
      const retainedDisclosure = await originalDisclosure!.evaluate(node => node.isConnected && node === document.querySelector('[data-results] li[data-id="1806"] details'));
      const retainedLink = await originalLink!.evaluate(node => node.isConnected && node === document.querySelector('[data-results] li[data-id="1806"] .directory-picker-link'));
      expect(retainedDisclosure).toBe(true); expect(retainedLink).toBe(true);
      await expect(page.getByRole('button', { name: 'Awaiting a rule', exact: true })).toHaveAttribute('aria-pressed', 'true');
      await testInfo.attach('simulated-persisted-open-pending-result.json', { body: JSON.stringify({ simulated: true, width, id: '1806', retainedDisclosure, retainedLink, open: true, focused: true }), contentType: 'application/json' });
    } finally { await originalDisclosure?.dispose(); await originalLink?.dispose(); }
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
  await expect(page.getByRole('link', { name: /^A\s+\d+ games$/ })).toBeVisible();
  expect(errors).toEqual([]);
});

test('simulated persisted restoration retries a failed search and restores changed or invalid state', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 });
  let attempts = 0;
  await page.route('**/board-games/search.json', route => {
    // Abort one real local request; retry reads the actual compiled index, not mock data.
    attempts++;
    return attempts === 1 ? route.abort('failed') : route.continue();
  });
  await page.goto('/board-games/#q=Townsfolk&filter=rules');
  await expect(page.locator('[data-count]')).toHaveText('Search is unavailable. Browse by letter below.');
  expect(attempts).toBe(1);
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
  await expect(page.locator('[data-results] li[data-id="312859"] a')).toHaveAttribute('href', '/games/townsfolk-tussle-frosted-2024-de-base/');
  expect(attempts).toBe(2);
  await page.evaluate(() => {
    history.replaceState(history.state, '', '/board-games/#q=Townsfolk&filter=pending');
    window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
  });
  await expect(page.getByRole('button', { name: 'Awaiting a rule', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-empty]')).toBeVisible();
  await page.evaluate(() => {
    history.replaceState(history.state, '', `/board-games/#q=${encodeURIComponent('Rüsselbande')}&filter=pending`);
    window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
  });
  await expect(page.getByRole('searchbox', { name: 'Search board games' })).toHaveValue('Rüsselbande');
  await expect(page.getByRole('button', { name: 'Awaiting a rule', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-results] li[data-id="1806"]')).toHaveAttribute('data-has-rule', 'false');
  await page.evaluate(() => {
    history.replaceState(history.state, '', '/board-games/#q=%00');
    window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
  });
  await expect(page.getByRole('searchbox', { name: 'Search board games' })).toHaveValue('');
  await expect(page.locator('[data-results]')).toBeHidden();
  await expect(page.locator('[data-count]')).toHaveText('This search link could not be read. Search by name or browse by letter below.');
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
  await expect(page.locator('[data-count]')).toHaveText('This search link could not be read. Search by name or browse by letter below.');
  expect(attempts).toBe(2);
  await testInfo.attach('simulated-persisted-error-and-invalid-recovery.json', { body: JSON.stringify({ simulated: true, attempts, retryUsesActualIndex: true, changedQueryAndFilterRestored: true, invalidMessageRetained: true }), contentType: 'application/json' });
});
