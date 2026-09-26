import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { showAllMethods, DEV, STATIC } from './helpers';

async function controlledRandom(page: Page, value = 2) {
  await page.addInitScript((word: number) => {
    const original = crypto.getRandomValues.bind(crypto);
    let draws = 0;
    Object.defineProperty(crypto, 'getRandomValues', { configurable: true, value: (array: ArrayBufferView<ArrayBuffer>) => {
      if (array instanceof Uint32Array && array.length === 1) { array[0] = word; draws++; return array; }
      return original(array);
    } });
    Object.defineProperty(window, '__testDrawCount', { get: () => draws });
  }, value);
}
async function ready(page: Page, url = '/') { await page.goto(url); await expect(page.getByRole('button', { name: 'Pick a player' })).toBeEnabled(); }
const announcement = (page: Page) => page.locator('.winner-announcement');

test('typed counts commit once without losing named players during partial input', async ({ page }) => {
  await ready(page);
  await page.getByRole('button', { name: 'Paste a list' }).click();
  const names = Array.from({ length: 24 }, (_, i) => `Named player ${i + 1}`);
  await page.getByLabel('Player names').fill(names.join('\n'));
  await page.getByRole('button', { name: 'Done', exact: true }).click();
  const count = page.getByLabel('Player count', { exact: true });
  await count.fill('');
  await count.pressSequentially('30');
  await expect(page.locator('.player')).toHaveCount(24);
  await expect(page.getByLabel('Name for player 24', { exact: true })).toHaveValue(names[23]!);
  await count.press('Enter');
  await expect(page.locator('.player')).toHaveCount(30);
  for (let i = 0; i < names.length; i++) {
    await expect(page.getByLabel(`Name for player ${i + 1}`, { exact: true })).toHaveValue(names[i]!);
  }
  await count.fill('3');
  await count.press('Escape');
  await expect(count).toHaveValue('30');
  await expect(page.locator('.player')).toHaveCount(30);
  await count.fill('12');
  await count.blur();
  await expect(page.locator('.player')).toHaveCount(12);
  await page.getByRole('button', { name: 'Remove a player', exact: true }).click();
  await expect(page.locator('.player')).toHaveCount(11);
  await page.getByRole('button', { name: 'Add a player', exact: true }).click();
  await expect(page.locator('.player')).toHaveCount(12);
});

for (const method of ['spinner', 'balloon']) test(`${method} stays usable while a pasted roster is empty or invalid`, async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await ready(page, `/methods/${method}/`);
  await page.getByRole('button', { name: 'Paste a list' }).click();
  const names = page.getByLabel('Player names');
  await names.fill('');
  await expect(page.locator('.picker')).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('Add at least two players.');
  await expect(page.getByRole('button', { name: 'Pick a player', exact: true })).toBeDisabled();
  await expect(page.locator('.reveal-stage')).toHaveCount(0);
  await names.fill('Only one');
  await expect(page.getByRole('button', { name: 'Pick a player', exact: true })).toBeDisabled();
  await names.fill('Mina\nAlex');
  await expect(page.getByRole('button', { name: 'Pick a player', exact: true })).toBeEnabled();
  await expect(page.locator('.reveal-stage')).toBeVisible();
  await page.getByRole('button', { name: 'Pick a player', exact: true }).click();
  await expect(announcement(page)).toContainText(/(?:Mina|Alex) goes first\./);
  expect(errors).toEqual([]);
});

test.describe('count commits on first activation', () => {
  test.use({ hasTouch: true });
  for (const activation of ['click', 'tap'] as const) test(`the first ${activation === 'click' ? 'pointer click' : 'touch tap'} after a typed count draws from the committed named group`, async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await controlledRandom(page, 11);
  await ready(page, '/methods/spinner/');
  await page.getByLabel('Name for player 1', { exact: true }).fill('Mina');
  const count = page.getByLabel('Player count', { exact: true });
  await count.fill('12');
  await expect(page.locator('.player')).toHaveCount(4);
  // A real pointer press must reach the same button before and after input blur.
  await page.getByRole('button', { name: 'Pick a player', exact: true })[activation]();
  await expect(page.locator('.picker')).toHaveAttribute('data-phase', 'result');
  await expect(page.locator('.player')).toHaveCount(12);
  await expect(count).toHaveValue('12');
  await expect(page.getByLabel('Name for player 1', { exact: true })).toHaveValue('Mina');
  await expect(announcement(page)).toContainText('Seat 12 goes first.');
  expect(await page.evaluate(() => (window as unknown as { __testDrawCount: number }).__testDrawCount)).toBe(1);
  });
});

test('an abandoned Pick press commits the typed count without drawing', async ({ page }) => {
  await ready(page, '/methods/spinner/');
  await page.getByLabel('Player count', { exact: true }).fill('12');
  const button = await page.getByRole('button', { name: 'Pick a player', exact: true }).boundingBox();
  await page.mouse.move(button!.x + button!.width / 2, button!.y + button!.height / 2);
  await page.mouse.down();
  await page.mouse.move(button!.x - 20, button!.y + button!.height / 2);
  await page.mouse.up();
  await expect(page.locator('.player')).toHaveCount(12);
  await expect(page.locator('.picker')).toHaveAttribute('data-phase', 'ready');
  await expect(announcement(page)).toBeEmpty();
});

test('unsupported selected and remembered methods explain their player limits', async ({ page }) => {
  await ready(page, '/methods/spinner/');
  await page.getByRole('button', { name: 'Preferences', exact: true }).click();
  await page.getByLabel('Remember this group').check();
  const count = page.getByLabel('Player count', { exact: true });
  await count.fill('13'); await count.blur();
  const spinnerNotice = page.getByText('Spinner fits up to 12 players. Quick is selected for your group of 13.', { exact: true });
  await expect(spinnerNotice).toBeVisible();
  await expect(page.getByRole('radio', { name: 'Quick', exact: true })).toBeChecked();
  expect(await spinnerNotice.evaluate(element => element.closest('[aria-live], [role="status"]'))).toBeNull();
  await ready(page);
  await expect(spinnerNotice).toBeVisible();
  await count.fill('12'); await count.blur();
  await expect(spinnerNotice).toHaveCount(0);
  await expect(page.getByRole('radio', { name: 'Spinner', exact: true })).toBeChecked();
  await ready(page, '/methods/coin/');
  await count.fill('25'); await count.blur();
  await expect(page.getByText('Coin Flip fits up to 24 players. Quick is selected for your group of 25.', { exact: true })).toBeVisible();
});

for (const motion of ['no-preference', 'reduce'] as const) test(`mobile visual reveal scrolls into view once with ${motion} motion`, async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.emulateMedia({ reducedMotion: motion });
  await page.addInitScript(() => {
    const original = window.scrollBy.bind(window);
    (window as unknown as { revealScrolls: ScrollToOptions[] }).revealScrolls = [];
    window.scrollBy = ((options: ScrollToOptions) => {
      (window as unknown as { revealScrolls: ScrollToOptions[] }).revealScrolls.push(options);
      original(options);
    }) as typeof window.scrollBy;
  });
  await ready(page, '/methods/coin/');
  await expect(page.locator('.coin-reveal')).toBeVisible();
  expect(await page.locator('.reveal-stage').evaluate(element => element.getBoundingClientRect().bottom > innerHeight)).toBe(true);
  await page.getByRole('button', { name: 'Pick a player', exact: true }).click();
  await expect.poll(() => page.locator('.reveal-stage').evaluate(element => {
    const rect = element.getBoundingClientRect();
    return rect.top >= 0 && rect.bottom <= innerHeight;
  })).toBe(true);
  await expect(page.locator('.picker')).toHaveAttribute('data-phase', 'result');
  const scrolls = await page.evaluate(() => (window as unknown as { revealScrolls: ScrollToOptions[] }).revealScrolls);
  expect(scrolls).toHaveLength(1);
  expect(scrolls[0]!.behavior).toBe(motion === 'reduce' ? 'auto' : 'smooth');
});

for (const motion of ['no-preference', 'reduce'] as const) test(`tall mobile visual reveals keep the single winner announcement visible with ${motion} motion`, async ({ page }) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 320, height: 844 });
  await page.emulateMedia({ reducedMotion: motion });
  await controlledRandom(page, 11);
  for (const method of ['coin', 'cards', 'spinner']) {
    await ready(page, `/methods/${method}/`);
    await page.getByLabel('Player count', { exact: true }).fill('12');
    await page.getByLabel('Player count', { exact: true }).blur();
    await page.getByRole('button', { name: 'Pick a player', exact: true }).click();
    await expect(page.locator('.picker')).toHaveAttribute('data-phase', 'result');
    await expect(announcement(page)).toContainText('Seat 12 goes first.');
    await expect.poll(() => announcement(page).evaluate(element => {
      const rect = element.getBoundingClientRect();
      return rect.top >= 0 && rect.bottom <= innerHeight;
    })).toBe(true);
    await expect(page.locator('.winner-announcement[aria-live="polite"]')).toHaveCount(1);
  }
});

test('a fully visible desktop reveal and Quick draws do not request reveal scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 1400 });
  await page.addInitScript(() => {
    (window as unknown as { revealScrolls: number }).revealScrolls = 0;
    const original = window.scrollBy.bind(window);
    window.scrollBy = ((options: ScrollToOptions) => {
      (window as unknown as { revealScrolls: number }).revealScrolls++;
      original(options);
    }) as typeof window.scrollBy;
  });
  await ready(page, '/methods/coin/');
  await expect(page.locator('.coin-reveal')).toBeVisible();
  await page.getByRole('button', { name: 'Pick a player', exact: true }).click();
  await expect(page.locator('.picker')).toHaveAttribute('data-phase', 'result');
  expect(await page.evaluate(() => (window as unknown as { revealScrolls: number }).revealScrolls)).toBe(0);
  await page.setViewportSize({ width: 320, height: 844 });
  await page.getByRole('radio', { name: 'Quick', exact: true }).check();
  await page.getByRole('button', { name: 'Pick a player', exact: true }).click();
  await expect(page.locator('.picker')).toHaveAttribute('data-phase', 'result');
  expect(await page.evaluate(() => (window as unknown as { revealScrolls: number }).revealScrolls)).toBe(0);
});

test('default seats, rapid activation and one winner announcement', async ({ page }) => {
  await controlledRandom(page); await ready(page);
  await expect(page.locator('.player')).toHaveCount(4);
  await expect(page.getByLabel('Name for player 1', { exact: true })).toHaveValue('Seat 1');
  await page.getByRole('button', { name: 'Pick a player' }).dblclick();
  await expect(announcement(page)).toContainText('Seat 3 goes first.');
  expect(await page.evaluate(() => (window as unknown as { __testDrawCount: number }).__testDrawCount)).toBe(1);
  await expect(page.locator('.winner-announcement[aria-live="polite"]')).toHaveCount(1);
  await expect(page.locator('.player')).toHaveCount(4);
  await page.getByRole('button', { name: 'Pick again' }).click();
  await expect(announcement(page)).toContainText('Seat 3 goes first.');
});

test('inline names survive count changes; large groups reflow without an internal scrollbar', async ({ page }) => {
  test.setTimeout(90000);
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await ready(page);
  await page.getByLabel('Name for player 1', { exact: true }).fill('Magnificent Eucalyptus');
  await page.getByLabel('Name for player 2', { exact: true }).fill('王芳');
  for (const width of [1366, 390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    for (const count of [2, 5, 8, 12, 20, 50, 4]) {
      await page.getByLabel('Player count', { exact: true }).fill(String(count));
      await page.getByLabel('Player count', { exact: true }).blur();
      await expect(page.locator('.player')).toHaveCount(count);
      await expect(page.getByLabel('Name for player 1', { exact: true })).toHaveValue('Magnificent Eucalyptus');
      await expect(page.getByLabel('Name for player 2', { exact: true })).toHaveValue('王芳');
      const layout = await page.locator('.roster').evaluate(element => ({ overflow: getComputedStyle(element).overflowY, width: document.documentElement.scrollWidth, viewport: innerWidth }));
      expect(layout.overflow).toBe('visible'); expect(layout.width).toBeLessThanOrEqual(layout.viewport);
      await expect.poll(() => page.locator('.player-name').evaluateAll(fields => fields.every(field => field.scrollHeight <= field.clientHeight + 2))).toBe(true);
    }
  }
  expect(errors).toEqual([]);
});

test('new reveal download failure preserves the selected player with a visible fallback', async ({ page }) => {
  await controlledRandom(page, 3);
  await page.route('**/*TableReveals*.js*', route => route.abort());
  await ready(page, '/methods/spinner/');
  await page.getByRole('button', { name: 'Pick a player' }).click();
  await expect(announcement(page)).toContainText('Seat 4 goes first');
  await expect(page.getByText('Visual unavailable. The selected player is shown below.')).toBeVisible();
});

test('reduced motion preserves the result and settled visual', async ({ page }) => {
  await controlledRandom(page, 3);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await ready(page, '/methods/towers/');
  await page.getByRole('button', { name: 'Pick a player' }).click();
  await expect(announcement(page)).toContainText('Seat 4 goes first');
  await expect(page.locator('.table-reveal')).toHaveAttribute('data-settled', 'true');
});

test('the in-app motion setting stops the winner glow', async ({ page }) => {
  await controlledRandom(page, 1);
  await ready(page);
  await page.getByRole('button', { name: 'Preferences' }).click();
  await page.getByLabel('Reduce motion').check();
  await page.getByRole('button', { name: 'Pick a player' }).click();
  await expect(announcement(page)).toContainText('Seat 2 goes first');
  await expect(page.locator('.picker')).toHaveAttribute('data-reduced', 'true');
  await expect(page.locator('.player.winner .seat-token')).toHaveCSS('animation-name', 'none');
});

test('a long winner name has its own space on a narrow phone', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 750 });
  await controlledRandom(page, 0);
  await ready(page);
  await page.getByLabel('Name for player 1', { exact: true }).fill('Magnificent Eucalyptus');
  await showAllMethods(page);
  await page.getByRole('radio', { name: /^Instant/ }).check();
  await page.getByRole('button', { name: 'Pick a player' }).click();
  await expect(announcement(page)).toContainText('Magnificent Eucalyptus');
  const boxes = await page.evaluate(() => {
    const winner = document.querySelector('.winner-announcement p')!.getBoundingClientRect();
    const tools = document.querySelector('.roster-tools')!.getBoundingClientRect();
    return { winnerTop: winner.top, toolsBottom: tools.bottom, width: document.documentElement.scrollWidth, viewport: innerWidth };
  });
  expect(boxes.winnerTop).toBeGreaterThan(boxes.toolsBottom);
  expect(boxes.width).toBeLessThanOrEqual(boxes.viewport);
});

for (const mode of ['Instant', 'Quick', 'Spinner', 'Card Draw', 'Balloon Rise', 'Towers', 'Shortest Match', 'Dice Roll', 'Coin Flip', 'Shell Game']) test(`${mode} reveals the same preselected outcome`, async ({ page }) => {
  await controlledRandom(page, 1); await ready(page); await showAllMethods(page);
  await page.getByRole('radio', { name: new RegExp(`^${mode}`) }).check();
  await page.getByRole('button', { name: 'Pick a player' }).click();
  await expect(announcement(page)).toContainText('Seat 2 goes first.');
});

test('resize and tab interruption preserve the locked outcome without an early reveal control', async ({ page }) => {
  await controlledRandom(page, 3); await ready(page, '/methods/balloon/');
  await page.getByRole('button', { name: 'Pick a player' }).click();
  await expect(page.getByRole('button', { name: 'Show result now' })).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('.picker')).toHaveAttribute('data-phase', 'result');
  await expect(announcement(page)).toContainText('Seat 4 goes first.');
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Pick again' }).click();
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await expect(announcement(page)).toContainText('Seat 4 goes first.');
  await page.waitForTimeout(3800);
  expect(await page.evaluate(() => (window as unknown as { __testDrawCount: number }).__testDrawCount)).toBe(2);
});

test('Unicode, duplicate disambiguation, invalid input and literal HTML', async ({ page }) => {
  await controlledRandom(page, 1); await ready(page);
  await page.getByRole('button', { name: 'Paste a list' }).click();
  await page.getByLabel('Player names').fill(' 王芳\n\nSam\nSam\n👨‍👩‍👧‍👦\n<img src=x>');
  await expect(page.locator('.player')).toHaveCount(5);
  await expect(page.getByText(/Matching names are separate/)).toBeVisible();
  await expect(page.locator('.player img')).toHaveCount(0);
  await showAllMethods(page); await page.getByRole('radio', { name: /^Instant/ }).check();
  await page.getByRole('button', { name: 'Pick a player' }).click();
  await expect(announcement(page)).toContainText('Sam · #');
  await page.getByLabel('Player names').fill('Only me');
  await expect(page.getByRole('button', { name: 'Pick a player' })).toBeDisabled();
  await expect(page.getByRole('alert')).toContainText('at least two');
  await page.getByLabel('Player names').fill('A'.repeat(25) + '\nBo');
  await expect(page.getByRole('alert')).toContainText('24');
  await expect(page.getByLabel('Player names')).toHaveValue('A'.repeat(25) + '\nBo');
});

test('counts 2, 12, 13, 50 and 51 never drop a player', async ({ page }) => {
  await ready(page);
  const count = page.getByLabel('Player count');
  await expect(count).toHaveAttribute('type', 'text');
  await count.fill('1'); await expect(page.locator('.player')).toHaveCount(4);
  await count.fill('51'); await expect(page.locator('.player')).toHaveCount(4);
  await count.blur(); await expect(count).toHaveValue('4');
  await count.fill('2'); await count.blur(); await expect(page.locator('.player')).toHaveCount(2);
  await expect(page.getByRole('button', { name: 'Remove a player' })).toBeDisabled();
  await count.fill('12'); await count.blur(); await expect(page.getByRole('radio', { name: /^Balloon Rise/ })).toBeEnabled();
  await count.fill('13'); await count.blur(); await expect(page.locator('input[value=quick]')).toBeChecked();
  await expect(page.getByRole('radio', { name: 'Dice Roll' })).toBeEnabled();
  await expect(page.getByRole('radio', { name: 'Coin Flip' })).toBeEnabled();
  await expect(page.locator('input[name=presentation]')).toHaveCount(4);
  await count.fill('50'); await count.blur(); await expect(page.locator('.player')).toHaveCount(50);
  await expect(page.locator('input[name=presentation]')).toHaveCount(2);
  await expect(page.getByRole('radio', { name: 'Quick' })).toBeEnabled();
  await page.getByRole('button', { name: 'Pick a player' }).click(); await expect(announcement(page)).toContainText('goes first');
  await page.getByRole('button', { name: 'Paste a list' }).click();
  await page.getByLabel('Player names').fill(Array.from({ length: 51 }, (_, i) => `Player ${i + 1}`).join('\n'));
  await expect(page.locator('.player')).toHaveCount(51); await expect(page.getByRole('alert')).toContainText('no one has been removed');
});

test('larger groups can use dice and coins while the toolbar stays visible during a reveal', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await controlledRandom(page, 12); await ready(page);
  await page.getByLabel('Player count').fill('13');
  await page.getByLabel('Player count').blur();
  await page.getByRole('radio', { name: 'Dice Roll' }).check();
  const toolbar = page.locator('.roster-tools');
  const before = await toolbar.locator('button').evaluate(button => getComputedStyle(button).opacity);
  await page.getByRole('button', { name: 'Pick a player' }).click();
  await expect(toolbar).toBeVisible();
  await expect(toolbar).toContainText('Paste a list');
  expect(await toolbar.evaluate(element => (element.closest('fieldset') as HTMLElement).inert)).toBe(true);
  expect(await toolbar.locator('button').evaluate(button => getComputedStyle(button).opacity)).toBe(before);
  expect(await page.locator('.reveal-options').evaluate(element => (element as HTMLElement).inert)).toBe(true);
  await expect(page.locator('.picker')).toHaveAttribute('data-phase', 'result');
  await expect(announcement(page)).toContainText('Seat 13 goes first');
  await expect(page.locator('.dice-reveal .reveal-player')).toHaveCount(13);
  await page.getByLabel('Player count').fill('24');
  await page.getByLabel('Player count').blur();
  await page.getByRole('radio', { name: 'Coin Flip' }).check();
  await page.getByRole('button', { name: 'Pick a player' }).click();
  await expect(announcement(page)).toContainText('Seat 13 goes first');
  await expect(page.locator('.coin-reveal .reveal-player')).toHaveCount(24);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('secure RNG failure is recoverable with no fallback winner', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(crypto, 'getRandomValues', { configurable: true, value: () => { throw new Error('Blocked for test'); } }); });
  await ready(page); await page.getByRole('button', { name: 'Pick a player' }).click();
  await expect(page.getByRole('alert')).toContainText('No player was selected'); await expect(announcement(page)).toBeEmpty();
  await page.evaluate(() => { Object.defineProperty(crypto, 'getRandomValues', { value: (array: Uint32Array) => { array[0] = 0; return array; } }); });
  await page.waitForTimeout(500); await page.getByRole('button', { name: 'Pick a player' }).click();
  await expect(announcement(page)).toContainText('Seat 1 goes first');
});

test('remember, reload, forget and corrupt storage recovery', async ({ page }) => {
  await page.addInitScript(() => {
    const violations: string[] = [];
    Object.defineProperty(window, '__policyViolations', { value: violations });
    window.addEventListener('securitypolicyviolation', event => violations.push(event.violatedDirective));
  });
  await ready(page); await page.getByRole('button', { name: 'Paste a list' }).click();
  await page.getByLabel('Player names').fill('Mina\n王芳\nAlex');
  expect(await page.evaluate(() => localStorage.getItem('wgf:preferences:v1'))).not.toContain('Mina');
  await page.getByRole('button', { name: 'Preferences' }).click();
  await page.getByLabel('Remember this group').check();
  expect(await page.evaluate(() => (window as unknown as { __policyViolations: string[] }).__policyViolations)).toEqual([]);
  await page.reload(); await expect(page.getByLabel('Name for player 1', { exact: true })).toHaveValue('Mina'); await expect(page.getByLabel('Name for player 2', { exact: true })).toHaveValue('王芳'); await expect(page.getByLabel('Name for player 3', { exact: true })).toHaveValue('Alex');
  await expect(announcement(page)).toBeEmpty();
  await page.getByRole('button', { name: 'Preferences' }).click(); await page.getByRole('button', { name: 'Forget this group' }).click();
  await expect(page.locator('.player')).toHaveCount(4);
  expect(await page.evaluate(() => localStorage.getItem('wgf:preferences:v1'))).not.toContain('Mina');
  await page.evaluate(() => localStorage.setItem('wgf:preferences:v1', '{broken')); await page.reload();
  await expect(page.getByText(/Saved settings could not be read/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pick a player' })).toBeEnabled();
  expect(await page.evaluate(() => (window as unknown as { __policyViolations: string[] }).__policyViolations)).toEqual([]);
});

test('blocked storage and blocked audio cannot block the result', async ({ page }) => {
  await controlledRandom(page, 0);
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get: () => { throw new Error('Blocked'); } });
    Object.defineProperty(window, 'AudioContext', { value: class { constructor() { throw new Error('Blocked'); } } });
  });
  await ready(page); await page.getByRole('button', { name: 'Preferences' }).click();
  await page.getByLabel('Soft sound').check(); await page.getByRole('button', { name: 'Pick a player' }).click();
  await expect(announcement(page)).toContainText('Seat 1 goes first');
});

test('reduced motion is immediate and keyboard activation works', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); await controlledRandom(page, 2); await ready(page, '/methods/balloon/');
  await page.getByRole('button', { name: 'Pick a player' }).focus(); await page.keyboard.press('Enter');
  await expect(announcement(page)).toContainText('Seat 3 goes first'); await expect(page.locator('.balloon-field')).toHaveAttribute('data-settled', 'true');
  await expect(page.getByText(/Reduced motion/)).toHaveCount(0);
});

test('failed Balloon download still reveals the text result', async ({ page }) => {
  await controlledRandom(page, 1);
  await page.route('**/*BalloonRise*.js', route => route.abort());
  await ready(page, '/methods/balloon/');
  await page.getByRole('button', { name: 'Pick a player' }).click();
  await expect(announcement(page)).toContainText('Seat 2 goes first');
});

test('no Balloon code before use, no sound by default, and failed share has a clean fallback', async ({ page }) => {
  const assets: string[] = []; page.on('request', request => assets.push(request.url()));
  await page.addInitScript(() => {
    (window as unknown as { audioCalls: number }).audioCalls = 0;
    Object.defineProperty(window, 'AudioContext', { value: class { constructor() { (window as unknown as { audioCalls: number }).audioCalls++; throw new Error('UNEXPECTED_AUDIO'); } } });
    Object.defineProperty(navigator, 'share', { value: undefined });
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('Denied')) } });
  });
  await ready(page); await page.getByRole('button', { name: 'Pick a player' }).click(); await expect(announcement(page)).toContainText('goes first');
  expect(assets.some(url => url.includes('BalloonRise'))).toBe(false);
  expect(await page.evaluate(() => (window as unknown as { audioCalls: number }).audioCalls)).toBe(0);
  await page.getByRole('button', { name: 'Share', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Clean sharing link' })).toHaveValue(`${STATIC}/`);
});

test('slow hydration leaves a labeled disabled tool until it is ready', async ({ page }) => {
  await page.route('**/_astro/*.js', async route => { await new Promise(resolve => setTimeout(resolve, 1200)); await route.continue(); });
  await page.goto('/', { waitUntil: 'commit' });
  await expect(page.getByRole('button', { name: 'Getting ready' })).toBeDisabled();
  await expect(page.getByLabel('Name for player 1', { exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Pick a player' })).toBeEnabled();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter'); await expect(page.locator('main')).toBeFocused();
});

test('failed picker download offers a working reload without selecting anyone', async ({ page }) => {
  // Astro retries failed island imports with a query parameter; block that too.
  await page.route('**/_astro/Picker.*.js*', route => route.abort());
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Getting ready' })).toBeDisabled();
  await expect(page.locator('[data-picker-startup-error]')).toBeVisible({ timeout: 12000 });
  await expect(announcement(page)).toBeEmpty();
  await page.unroute('**/_astro/Picker.*.js*');
  await page.getByRole('link', { name: 'Reload this page', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Pick a player' })).toBeEnabled();
  await page.getByRole('button', { name: 'Pick a player' }).click();
  await expect(announcement(page)).toContainText('goes first');
  await expect(page.locator('[data-picker-startup-error]')).toBeHidden();
});

test('twelve long names remain readable on mobile Balloon and result states', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await controlledRandom(page, 10); await ready(page, '/methods/balloon/');
  await page.getByRole('button', { name: 'Paste a list' }).click();
  await page.getByLabel('Player names').fill(Array.from({ length: 12 }, (_, i) => `LongName${i}abcdefghijklmn`).join('\n'));
  await page.getByRole('button', { name: 'Pick a player' }).click(); await page.locator('.balloon-field').waitFor();
  await expect(page.locator('.balloon-player')).toHaveCount(12);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.locator('.picker')).toHaveAttribute('data-phase', 'result'); await expect(announcement(page)).toContainText('LongName10');
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([]);
});

test('names never enter requests or clean sharing', async ({ page }) => {
  const payloads: string[] = [];
  page.on('request', request => payloads.push(`${request.url()} ${request.postData() || ''} ${JSON.stringify(request.headers())}`));
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { configurable: true, value: async (data: unknown) => { (window as unknown as { shared: unknown }).shared = data; } });
  });
  await ready(page); await page.getByRole('button', { name: 'Paste a list' }).click();
  await page.getByLabel('Player names').fill('PRIVATE_ZEBRA_927\nPRIVATE_BADGER_819');
  await page.getByRole('button', { name: 'Pick a player' }).click(); await expect(announcement(page)).toContainText('goes first');
  await page.evaluate(() => history.replaceState(null, '', '/?unrelated=1#fragment'));
  await page.getByRole('button', { name: 'Share', exact: true }).click();
  expect(await page.evaluate(() => (window as unknown as { shared: unknown }).shared)).toEqual({ title: 'Who Goes First?', url: `${STATIC}/` });
  expect(payloads.join('\n')).not.toMatch(/PRIVATE_ZEBRA|PRIVATE_BADGER/);
  expect(payloads.every(payload => payload.startsWith(`${STATIC}/`))).toBe(true);
});

test('mobile and reflow have no horizontal overflow; core accessibility checks', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await ready(page);
  const button = await page.getByRole('button', { name: 'Pick a player' }).boundingBox();
  expect(button!.y + button!.height).toBeLessThan(844);
  await expect(page.locator('.picker')).toBeVisible();
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([]);
  await page.setViewportSize({ width: 320, height: 740 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.evaluate(() => { document.documentElement.style.zoom = '2'; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('static help and navigation remain usable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(`${STATIC}/`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Pick a player');
  await expect(page.locator('.noscript')).toBeVisible();
  await expect(page.locator('.noscript')).toContainText('Enable JavaScript to pick a player on your device.');
  await page.getByRole('link', { name: 'How it works', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('How the draw works');
  await page.getByRole('link', { name: 'Privacy', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Privacy');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await context.close();
});

test('reviewed catalog, local drafts, aliases, house prompts and real 404s', async ({ page, request }) => {
  await page.goto('/games/');
  await page.getByRole('searchbox').fill('Sushi Go');
  await expect(page.locator('.game-list a[href="/games/sushi-go-2014-en/"]:visible')).toBeVisible();
  await page.locator('.game-list a[href="/games/sushi-go-2014-en/"]:visible').click();
  await expect(page.locator('.rule-answer')).toContainText('no single player starts');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow');
  for (const path of ['/games/not-a-game/', '/dev/review/', '/research/games/azul-2018-en.json']) expect((await request.get(path)).status()).toBe(404);
  await page.goto(`${DEV}/dev/review/`);
  await expect(page.getByText('Development only · Not approved for publication')).toBeVisible();
  await page.getByRole('searchbox').fill('TTR');
  await expect(page.locator('.game-list li:visible')).toHaveCount(3);
  await page.getByRole('searchbox').fill('Azl'); await expect(page.locator('.game-list li:visible')).toHaveCount(1);
  await page.getByRole('searchbox').fill('unlisted game'); await expect(page.getByText('No matching rule yet.')).toBeVisible();
  await page.getByRole('button', { name: 'Choose a question' }).click();
  const before = await page.locator('[data-prompt]').textContent(); await page.getByRole('button', { name: 'Another question' }).click();
  await expect(page.locator('[data-prompt]')).not.toHaveText(before!);
  await expect(page.getByRole('link', { name: /Nobody fits/ })).toHaveAttribute('href', '/');
  const draft = await request.get(`${DEV}/dev/rules/azul-2018-en/`);
  expect(await draft.text()).toContain('The player whose visit to Portugal was most recent starts.');
  expect(await draft.text()).not.toContain('astro-island');
});
