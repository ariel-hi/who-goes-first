import { test, expect, type Locator, type Page } from '@playwright/test';

const azulLinks = [
  '/games/azul-2018-en/',
  '/games/azul-master-chocolatier-next-move-en-2022/',
  '/games/azul-sintra-next-move-en-2024/',
];

async function nativeType(input: Locator, value: string) {
  await input.click();
  await input.press('ControlOrMeta+A');
  await input.press('Backspace');
  if (value) await input.pressSequentially(value);
}

async function countDraws(page: Page) {
  await page.addInitScript(() => {
    const original = crypto.getRandomValues.bind(crypto);
    let draws = 0;
    Object.defineProperty(crypto, 'getRandomValues', { configurable: true, value: (array: ArrayBufferView<ArrayBuffer>) => {
      if (array instanceof Uint32Array && array.length === 1) { array[0] = 2; draws++; return array; }
      return original(array);
    } });
    Object.defineProperty(window, '__homeContinuityDraws', { get: () => draws });
  });
}

const draws = (page: Page) => page.evaluate(() => (window as unknown as { __homeContinuityDraws: number }).__homeContinuityDraws);
const hrefs = (links: Locator) => links.evaluateAll(nodes => nodes.map(node => node.getAttribute('href')));

async function ready(page: Page) {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Pick a player', exact: true })).toBeEnabled();
}

for (const width of [320, 1280]) {
  for (const motion of ['no-preference', 'reduce'] as const) {
    test(`keyboard draws retain their native button and repeat safely at ${width}px with ${motion} motion`, async ({ page }) => {
      await countDraws(page);
      await page.setViewportSize({ width, height: 844 });
      await page.emulateMedia({ reducedMotion: motion });
      await ready(page);
      // Reduced motion finishes synchronously: pause the test clock to check
      // its repeat cooldown independently of tracing/protocol latency.
      if (motion === 'reduce') {
        await page.clock.install({ time: new Date('2026-09-26T08:00:00Z') });
        await page.clock.pauseAt(new Date('2026-09-26T10:00:00Z'));
      }
      const picker = page.locator('.picker');
      const button = picker.locator('.picker-card > .primary');
      const original = await button.elementHandle();
      expect(original).not.toBeNull();
      try {
        await button.focus();
        await page.keyboard.press('Enter');
        await expect.poll(() => draws(page)).toBe(1);
        if (motion === 'reduce') {
          await expect(picker).toHaveAttribute('data-phase', 'result');
          await page.keyboard.press('Enter');
          expect(await draws(page)).toBe(1);
        }
        await expect(picker).toHaveAttribute('data-phase', 'result');
        await expect(picker.locator('.winner-announcement')).toHaveText('Seat 3 goes first.');
        await expect(button).toHaveText('Pick again');
        await expect(button).toBeFocused();
        expect(await original!.evaluate(node => node === document.querySelector('.picker-card > .primary'))).toBe(true);
        await expect(button).toHaveAttribute('aria-disabled', 'false');
        if (motion === 'reduce') await page.clock.runFor(500);
        await page.keyboard.press('Enter');
        await expect.poll(() => draws(page)).toBe(2);
        await expect(picker).toHaveAttribute('data-phase', 'result');
        await expect(button).toBeFocused();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        if (motion === 'no-preference') {
          // The uninterrupted keyboard draws above use real time. Isolate the
          // busy guard on a fresh page with its timer paused, so a slow trace
          // cannot turn the pointer check into a valid post-completion draw.
          await page.clock.install({ time: new Date('2026-09-26T08:00:00Z') });
          await page.reload();
          await expect(button).toHaveText('Pick a player');
          await expect(button).toBeEnabled();
          await page.clock.pauseAt(new Date('2026-09-26T10:00:00Z'));
          try {
            await button.focus();
            await page.keyboard.press('Enter');
            await expect(picker).toHaveAttribute('data-phase', 'revealing');
            await expect(button).toHaveAttribute('aria-disabled', 'true');
            expect(await button.evaluate(node => (node as HTMLButtonElement).disabled)).toBe(false);
            await expect(button).toBeFocused();
            await page.keyboard.press('Enter');
            expect(await draws(page)).toBe(1);
            // Real pointer events retain each engine's native focus behavior.
            const box = await button.boundingBox();
            expect(box).not.toBeNull();
            await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
            await expect(picker).toHaveAttribute('data-phase', 'revealing');
            expect(await draws(page)).toBe(1);
            const pointerDestination = await page.evaluateHandle(() => document.activeElement);
            try {
              await page.clock.resume();
              await expect(picker).toHaveAttribute('data-phase', 'result');
              expect(await pointerDestination.evaluate(node => node === document.activeElement)).toBe(true);
              expect(await draws(page)).toBe(1);
            } finally { await pointerDestination.dispose(); }
          } finally { await page.clock.resume(); }
        }
      } finally { await original?.dispose(); }
    });
  }

  test(`animation completion preserves the user's native Tab destination at ${width}px`, async ({ page }) => {
    await countDraws(page);
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await ready(page);
    const picker = page.locator('.picker');
    const button = picker.locator('.picker-card > .primary');
    await button.focus();
    await page.keyboard.press('Enter');
    await expect(picker).toHaveAttribute('data-phase', 'revealing');
    await page.keyboard.press('Tab');
    const destination = await page.evaluateHandle(() => document.activeElement);
    try {
      // Keep each engine's native order: Windows WebKit skips ordinary links.
      expect(await destination.evaluate(node => node !== document.body && node !== document.querySelector('.picker-card > .primary'))).toBe(true);
      await expect(picker).toHaveAttribute('data-phase', 'result');
      expect(await destination.evaluate(node => node === document.activeElement)).toBe(true);
      expect(await draws(page)).toBe(1);
    } finally { await destination.dispose(); }
  });

  test(`home lookup retains ordered results through native Back, reload and clear at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    const indexRequests: string[] = [];
    page.on('request', request => { if (new URL(request.url()).pathname === '/rule-index.json') indexRequests.push(request.url()); });
    // A route disables the HTTP cache, so Back must also work without relying
    // on a preserved document. No response or application state is fabricated.
    await page.route('**/rule-index.json', route => route.continue());
    await ready(page);
    expect(indexRequests).toEqual([]);
    const lookup = page.locator('[data-rule-lookup]');
    const input = lookup.getByRole('searchbox');
    const links = lookup.locator('[data-results] a');
    const visitLength = await page.evaluate(() => history.length);
    await nativeType(input, 'Azul');
    await expect(lookup.locator('[data-lookup-status]')).toHaveText('3 checked rules shown.');
    await expect(links).toHaveCount(3);
    expect(await hrefs(links)).toEqual(azulLinks);
    await expect(page).toHaveURL(/\/#q=Azul$/);
    expect(await page.evaluate(() => history.length)).toBe(visitLength);
    expect(indexRequests).toHaveLength(1);
    await links.first().focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/games\/azul-2018-en\/$/);
    await page.goBack();
    await expect(input).toHaveValue('Azul');
    await expect(links).toHaveCount(3);
    expect(await hrefs(links)).toEqual(azulLinks);
    await expect(lookup.locator('[data-directory-search]')).toHaveAttribute('href', '/board-games/#q=Azul');
    await page.reload();
    await expect(input).toHaveValue('Azul');
    await expect(lookup.locator('[data-lookup-status]')).toHaveText('3 checked rules shown.');
    await expect(links).toHaveCount(3);
    expect(await hrefs(links)).toEqual(azulLinks);
    const reloadedLength = await page.evaluate(() => history.length);
    const requestsAfterReload = indexRequests.length;
    await nativeType(input, 'a');
    await expect(links).toHaveCount(6);
    await expect(lookup.locator('[data-lookup-status]')).toHaveText('6 checked rules shown.');
    await nativeType(input, '');
    await expect(page).toHaveURL(/\/$/);
    await expect(lookup.locator('[data-results]')).toBeHidden();
    await expect(lookup.locator('[data-lookup-status]')).toBeEmpty();
    await expect(lookup.getByRole('link', { name: 'Browse all board games', exact: true })).toHaveAttribute('href', '/board-games/');
    expect(indexRequests).toHaveLength(requestsAfterReload);
    expect(await page.evaluate(() => history.length)).toBe(reloadedLength);
    await page.reload();
    await expect(input).toHaveValue('');
    await expect(lookup.locator('[data-results]')).toBeHidden();
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', /\/$/);
    expect(indexRequests.every(url => !new URL(url).hash && !new URL(url).search)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test(`home bookmarks, hash changes and cached pageshow reuse bounded search at ${width}px`, async ({ page, browserName }) => {
    await page.setViewportSize({ width, height: 844 });
    const query = '四季 + &filter=rules 🧩';
    const lookup = page.locator('[data-rule-lookup]');
    const input = lookup.getByRole('searchbox');
    const links = lookup.locator('[data-results] a');
    await page.goto(`/#q=${encodeURIComponent(query)}`);
    await expect(input).toHaveValue(query);
    await expect(lookup.locator('[data-lookup-status]')).toContainText('No checked rule matches');
    await expect(lookup.locator('[data-directory-search]')).toHaveAttribute('href', `/board-games/#q=${encodeURIComponent(query)}`);
    await page.reload();
    await expect(input).toHaveValue(query);
    await expect(lookup.locator('[data-lookup-status]')).toContainText('No checked rule matches');
    await page.goto('/#main');
    await expect(input).toHaveValue(query);
    await expect(page).toHaveURL(/\/#main$/);
    await page.goto('/#q=Azul');
    await expect(input).toHaveValue('Azul');
    await expect(links).toHaveCount(3);
    expect(await hrefs(links)).toEqual(azulLinks);
    // Exercise persisted-pageshow when a cached UI and its URL differ; actual
    // native Back is checked above without assuming an engine's BFCache choice.
    await nativeType(input, 'Catan');
    await expect(lookup.locator('[data-lookup-status]')).toContainText('checked rule');
    await page.evaluate(() => {
      history.replaceState(history.state, '', '/#q=Azul');
      window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
    });
    await expect(input).toHaveValue('Azul');
    await expect(links).toHaveCount(3);
    expect(await hrefs(links)).toEqual(azulLinks);
    // An unchanged cached lookup must keep its focused native link, rather
    // than replacing the result nodes. This event is simulated, not native Back.
    await links.first().focus();
    const cachedLink = await links.first().elementHandle();
    expect(cachedLink).not.toBeNull();
    try {
      await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
      await expect(input).toHaveValue('Azul');
      await expect(links.first()).toBeFocused();
      expect(await cachedLink!.evaluate(node => node.isConnected && node === document.querySelector('[data-rule-lookup] [data-results] a'))).toBe(true);
      expect(await hrefs(links)).toEqual(azulLinks);
    } finally { await cachedLink?.dispose(); }
    await input.focus();
    for (const link of await links.all()) {
      // Use native Tab where anchors participate. Default WebKit skips links;
      // establish keyboard modality before native DOM focus in that engine.
      if (browserName === 'webkit') { await page.keyboard.press('Shift'); await link.focus(); }
      else await page.keyboard.press('Tab');
      await expect(link).toBeFocused();
      const bounds = await link.evaluate(node => {
        const row = node.getBoundingClientRect(), list = node.closest('ul')!.getBoundingClientRect(), style = getComputedStyle(node);
        const outset = parseFloat(style.outlineWidth) + parseFloat(style.outlineOffset);
        return { visible: node.matches(':focus-visible'), width: parseFloat(style.outlineWidth), height: row.height,
          inside: row.left - outset >= list.left && row.right + outset <= list.right && row.top - outset >= list.top && row.bottom + outset <= list.bottom };
      });
      expect(bounds.visible).toBe(true);
      expect(bounds.width).toBeGreaterThan(0);
      expect(bounds.height).toBeGreaterThanOrEqual(44);
      expect(bounds.inside).toBe(true);
    }
    await page.getByRole('link', { name: 'Skip to content', exact: true }).focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/#main$/);
    await expect(input).toHaveValue('Azul');
    await expect(links).toHaveCount(3);
    await page.goto('/#q=%00');
    await expect(input).toHaveValue('');
    await expect(lookup.locator('[data-results]')).toBeHidden();
    await expect(lookup.locator('[data-lookup-status]')).toContainText('This search link could not be read');
    await nativeType(input, 'Azul');
    await expect(links).toHaveCount(3);
    await expect(page).toHaveURL(/\/#q=Azul$/);
  });
}

test('blocked home history writes preserve native search, directory recovery and clearing', async ({ page }) => {
  await page.addInitScript(() => { history.replaceState = () => { throw new DOMException('Blocked by browser', 'SecurityError'); }; });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await ready(page);
  const lookup = page.locator('[data-rule-lookup]');
  const input = lookup.getByRole('searchbox');
  await nativeType(input, 'Azul');
  await expect(input).toBeFocused();
  await expect(lookup.locator('[data-results] a')).toHaveCount(3);
  await expect(lookup.locator('[data-directory-search]')).toHaveAttribute('href', '/board-games/#q=Azul');
  await expect(page).toHaveURL(/\/$/);
  await nativeType(input, '');
  await expect(lookup.locator('[data-results]')).toBeHidden();
  await expect(lookup.locator('[data-lookup-status]')).toBeEmpty();
  await expect(lookup.locator('[data-directory-search]')).toHaveAttribute('href', '/board-games/');
  expect(errors).toEqual([]);
});
