import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('social icons keep accessible labels and share clean public links', async ({ page }) => {
  await page.goto('/?private=names#private-result');
  const shares = page.getByRole('group', { name: 'Share this page', exact: true });
  const instagramLink = shares.getByRole('link', { name: 'Open Instagram and copy link (opens in a new tab)', exact: true });
  test.skip(await shares.locator('[data-instagram-open]').count() === 0, 'Social links only appear in production builds.');
  const decline = page.getByRole('button', { name: 'No thanks', exact: true });
  if (await decline.isVisible()) await decline.click();
  await shares.locator('summary').click();
  for (const name of ['Save on Pinterest', 'Share on Bluesky', 'Share on X', 'Share on Facebook']) {
    const link = shares.getByRole('link', { name: new RegExp(name) });
    await expect(link).toBeVisible();
    const destination = new URL((await link.getAttribute('href'))!);
    expect(destination.href).not.toContain('private');
    const box = await link.boundingBox();
    const target = await page.evaluate(() => matchMedia('(max-width:640px),(pointer:coarse)').matches ? 44 : 36);
    expect(box!.width).toBeCloseTo(target, 3);
    expect(box!.height).toBeCloseTo(target, 3);
  }
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async (value: string) => { Object.assign(window, { copiedInstagramLink: value }); } } }));
  const instagramRequests: string[] = [];
  const instagramRoute = async (route: import('@playwright/test').Route) => {
    instagramRequests.push(route.request().url());
    await route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>Owned Instagram test tab</title>' });
  };
  await page.context().route('https://www.instagram.com/**', instagramRoute);
  const openInstagram = async () => {
    const opened = page.context().waitForEvent('page');
    await instagramLink.click();
    const popup = await opened;
    try {
      await expect(popup).toHaveURL('https://www.instagram.com/');
      await popup.waitForLoadState('domcontentloaded');
      expect(await popup.evaluate(() => window.opener === null)).toBe(true);
    }
    finally { await popup.close(); }
  };
  try {
    await openInstagram();
    await expect(shares.locator('[data-instagram-status]')).toHaveText('Link copied. Instagram opened in a new tab.');
    expect(await page.evaluate(() => (window as unknown as { copiedInstagramLink: string }).copiedInstagramLink)).toBe(new URL('/', page.url()).href);
    await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new Error('Clipboard denied'); } } }));
    await openInstagram();
    await expect(shares.getByRole('textbox', { name: 'Link to copy for Instagram' })).toHaveValue(new URL('/', page.url()).href);
    expect(instagramRequests).toEqual(['https://www.instagram.com/', 'https://www.instagram.com/']);
  } finally { await page.context().unroute('https://www.instagram.com/**', instagramRoute); }
});

test('comma-separated names work and shell cards follow the dark theme', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Paste a list' }).click();
  await page.getByRole('textbox', { name: /Player names/ }).fill('Ada, Bo, Cy, Dee');
  await expect(page.locator('.roster .player-name')).toHaveCount(4);
  await expect(page.locator('.roster .player-name').first()).toHaveValue('Ada');
  await page.getByRole('button', { name: 'Done', exact: true }).click();
  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await page.getByRole('button', { name: 'More methods' }).click();
  await page.getByLabel('Shell Game', { exact: true }).check();
  const card = page.locator('.shells-reveal .reveal-player').first();
  await expect(card).toBeVisible();
  const background = await card.evaluate(element => getComputedStyle(element).backgroundColor);
  expect(background).not.toBe('rgb(255, 253, 249)');
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze()).violations).toEqual([]);
  await page.screenshot({ path: test.info().outputPath('shells-dark.png'), fullPage: true });
});

test('home pairs the picker with rules on desktop and preserves the mobile stack', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Pick a starting player');
  await expect(page.locator('#home-picker-heading')).toHaveClass(/sr-only/);
  await expect(page.getByRole('navigation', { name: 'Footer' }).getByRole('link', { name: 'Coin flip' })).toHaveCount(0);
  await expect(page.locator('.picker-utilities').getByRole('button', { name: 'Share' })).toHaveCount(0);
  await expect(page.getByRole('group', { name: 'Share this page' })).toHaveCount(1);
  const picker = await page.locator('.home-picker').boundingBox();
  const directory = await page.locator('.home-rules').boundingBox();
  expect(directory!.x).toBeGreaterThanOrEqual(picker!.x + picker!.width);
  await expect(page.locator('[data-home-random-rule]')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Playing a specific game?' })).toBeVisible();
  // The rule catalog is fetched on demand instead of being embedded in the page.
  expect((await page.content()).length).toBeLessThan(60000);
  await expect(page.locator('[data-random-rule]')).toHaveCount(0);
  const search = page.getByRole('searchbox', { name: /Search .* games/ });
  await search.fill('catan');
  await expect(page.locator('.rule-lookup-results a').first()).toHaveAttribute('href', '/games/catan-2020-en/');
  await expect(page.locator('.rule-lookup-answer').first()).not.toBeEmpty();
  await search.fill('qqqzzzz');
  await expect(page.locator('[data-lookup-status]')).toContainText('No checked rule matches');
  await expect(page.getByRole('link', { name: 'Find this game in the directory' })).toHaveAttribute('href', '/board-games/#q=qqqzzzz');
  await expect(page.locator('.rule-lookup-results')).toBeHidden();
  await search.fill('');
  // Four methods up front; the rest one tap away.
  await expect(page.locator('input[name=presentation]')).toHaveCount(4);
  await page.getByRole('button', { name: 'More methods' }).click();
  await expect(page.locator('input[name=presentation]')).toHaveCount(10);
  await expect(page.getByRole('button', { name: 'More methods' })).toHaveCount(0);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze()).violations).toEqual([]);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  const mobilePicker = await page.locator('.home-picker').boundingBox();
  const mobileRules = await page.locator('.home-rules').boundingBox();
  expect(mobileRules!.y).toBeGreaterThanOrEqual(mobilePicker!.y + mobilePicker!.height);
  await expect(page.locator('[data-home-random-rule]')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Try a random rule' })).toHaveCount(0);
  const button = await page.getByRole('button', { name: 'Pick a player', exact: true }).boundingBox();
  expect(button!.y + button!.height).toBeLessThan(844);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Pick a player', exact: true }).click();
  await expect(page.locator('.picker')).toHaveAttribute('data-phase', 'result');
  const winnerSize = await page.locator('.winner-announcement p').evaluate(element => parseFloat(getComputedStyle(element).fontSize));
  expect(winnerSize).toBeGreaterThanOrEqual(21);
  await page.screenshot({ path: test.info().outputPath('home-mobile.png'), fullPage: true });
});

test('appearance persists across reloads and answer pages with accessible dark colors', async ({ page }) => {
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Switch to dark mode' });
  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByRole('button', { name: 'Switch to light mode' })).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze()).violations).toEqual([]);
  // The skip-link is visually hidden until focused, so axe only sees its real
  // contrast once something actually tabs to it.
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze()).violations).toEqual([]);
  // The winner checkmark badge only exists after a result, and its
  // background rides each player's own palette color.
  await page.getByRole('button', { name: 'Pick a player' }).click();
  await expect(page.locator('.picker')).toHaveAttribute('data-phase', 'result');
  await expect(page.locator('.winner-dot')).toBeVisible();
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze()).violations).toEqual([]);
  await page.getByRole('searchbox', { name: /Search .* games/ }).fill('Wingspan');
  await page.locator('.rule-lookup-results a').first().click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze()).violations).toEqual([]);
  await page.getByRole('button', { name: 'Switch to light mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('home discovery shares the lazy search index and recovers from failed randomness', async ({ page }) => {
  let requests = 0;
  page.on('request', request => { if (new URL(request.url()).pathname === '/rule-index.json') requests++; });
  await page.goto('/');
  expect(requests).toBe(0);
  const root = page.locator('[data-home-random-rule]');
  const before = await root.locator('[data-home-rule-source]').getAttribute('href');
  await root.getByRole('button', { name: 'Another rule' }).click();
  await expect(root.locator('[data-home-rule-source]')).not.toHaveAttribute('href', before!);
  await page.getByRole('searchbox', { name: /Search .* games/ }).fill('Wingspan');
  await expect(page.locator('.rule-lookup-answer').first()).toContainText('random');
  expect(requests).toBe(1);
  await page.evaluate(() => {
    const original = crypto.getRandomValues.bind(crypto);
    Object.defineProperty(crypto, 'getRandomValues', { configurable: true, value: () => { throw new Error('Unavailable'); } });
    Object.assign(window, { restoreRandomness: () => Object.defineProperty(crypto, 'getRandomValues', { configurable: true, value: original }) });
  });
  await root.getByRole('button', { name: 'Another rule' }).click();
  await expect(root.getByRole('alert')).toBeVisible();
  await expect(root.getByRole('button', { name: 'Another rule' })).toBeEnabled();
  await page.evaluate(() => (window as unknown as { restoreRandomness: () => void }).restoreRandomness());
  await root.getByRole('button', { name: 'Another rule' }).click();
  await expect(root.getByRole('alert')).toBeHidden();
});

test('the theme switch still works when local storage is blocked', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { configurable: true, get: () => { throw new Error('Storage blocked'); } });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Switch to light mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('a method chosen elsewhere stays visible without opening More', async ({ page }) => {
  await page.goto('/methods/shells/');
  await expect(page.getByRole('radio', { name: 'Shell Game', exact: true })).toBeChecked();
  await expect(page.getByRole('button', { name: 'More methods' })).toHaveCount(0);
});
