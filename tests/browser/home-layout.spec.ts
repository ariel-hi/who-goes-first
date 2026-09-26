import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('home pairs the picker with rules on desktop and preserves the mobile stack', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Pick a player');
  await expect(page.getByRole('heading', { name: 'Who goes first?', exact: true })).toHaveCount(0);
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
  await expect(page.locator('[data-home-random-rule]')).toBeHidden();
  await expect(page.getByRole('link', { name: 'Try a random rule' })).toHaveAttribute('href', '/games/#random-rule');
  const button = await page.getByRole('button', { name: 'Pick a player', exact: true }).boundingBox();
  expect(button!.y + button!.height).toBeLessThan(844);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
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
