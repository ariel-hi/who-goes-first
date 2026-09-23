import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const methods = [
  { path: 'spinner', label: 'Spinner', scene: '.spinner-stage' },
  { path: 'cards', label: 'Card Draw', scene: '.cards-reveal' },
  { path: 'balloon', label: 'Balloon Rise', scene: '.balloon-field' },
  { path: 'towers', label: 'Towers', scene: '.tower-reveal' },
  { path: 'straws', label: 'Shortest Match', scene: '.straws-reveal' },
  { path: 'dice', label: 'Dice Roll', scene: '.dice-reveal' },
  { path: 'race', label: 'Marble Race', scene: '.marble-race' },
];

async function openMethod(page: Page, path: string) {
  await page.addInitScript(() => {
    Object.defineProperty(crypto, 'getRandomValues', { configurable: true, value: (array: Uint32Array) => { array[0] = 1; return array; } });
    let seed = 3921;
    Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 2 ** 32; };
  });
  await page.goto(`/methods/${path}/`);
  await expect(page.getByRole('button', { name: 'Pick a player' })).toBeEnabled();
}

for (const method of methods) test(`${method.label} keeps the scene after completion, skip and replay`, async ({ page }) => {
  await openMethod(page, method.path);
  await page.getByRole('button', { name: 'Pick a player' }).click();
  const scene = page.locator(method.scene);
  await expect(scene).toBeVisible();
  await scene.evaluate(element => element.setAttribute('data-original-scene', 'yes'));
  await expect(page.locator('.winner-announcement')).toContainText('Seat 2 goes first');
  await expect(scene).toHaveAttribute('data-settled', 'true');
  await expect(scene).toHaveAttribute('data-original-scene', 'yes');
  await expect(page.locator('.roster')).toHaveCount(0);
  await page.getByRole('button', { name: 'Pick again' }).click();
  await expect(scene).not.toHaveAttribute('data-original-scene', 'yes');
  await expect(scene).toHaveAttribute('data-settled', 'false');
  await page.getByRole('button', { name: 'Show result now' }).click();
  await expect(scene).toHaveAttribute('data-settled', 'true');
  await expect(page.locator('.winner-announcement')).toContainText('Seat 2 goes first');
  await page.getByRole('button', { name: 'Edit players', exact: true }).click();
  await expect(scene).toHaveCount(0);
  await expect(page.getByLabel('Name for player 1', { exact: true })).toBeEditable();
});

test('spinner uses a compact named legend and restores editing without losing players', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 780 });
  await openMethod(page, 'spinner');
  await page.getByLabel('Player count', { exact: true }).selectOption('12');
  await page.getByLabel('Name for player 1', { exact: true }).fill('Magnificent Eucalyptus');
  await page.getByLabel('Name for player 2', { exact: true }).fill('王芳');
  await page.getByLabel('Name for player 3', { exact: true }).fill('王芳');
  const colors = await page.locator('.seat-token').evaluateAll(tokens => tokens.map(token => getComputedStyle(token).backgroundColor));
  await page.getByRole('button', { name: 'Pick a player', exact: true }).click();
  await page.getByRole('button', { name: 'Show result now', exact: true }).click();
  await expect(page.locator('.roster')).toHaveCount(0);
  await expect(page.locator('.spinner-legend li')).toHaveCount(12);
  await expect(page.locator('.spinner-legend li').nth(0)).toContainText('Magnificent Eucalyptus');
  await expect(page.locator('.spinner-legend li').nth(1)).toContainText('王芳 · #2');
  await expect(page.locator('.spinner-legend li').nth(2)).toContainText('王芳 · #3');
  await expect(page.locator('.winner-announcement')).toContainText('王芳 · #2 goes first');
  expect(await page.locator('.spinner-seat').evaluateAll(tokens => tokens.map(token => getComputedStyle(token).backgroundColor))).toEqual(colors);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze()).violations).toEqual([]);
  await page.getByRole('button', { name: 'Edit players', exact: true }).click();
  await expect(page.locator('.spinner-stage')).toHaveCount(0);
  await expect(page.getByLabel('Name for player 1', { exact: true })).toHaveValue('Magnificent Eucalyptus');
  await expect(page.getByLabel('Name for player 2', { exact: true })).toHaveValue('王芳');
});

test('all towers build identically and fallen blocks remain visible', async ({ page }) => {
  await openMethod(page, 'towers');
  await page.getByRole('button', { name: 'Pick a player' }).click();
  await expect(page.locator('.block-stack')).toHaveCount(4);
  const builds = await page.locator('.tower-reveal').evaluate(scene => {
    for (const animation of scene.getAnimations({ subtree: true })) { animation.pause(); animation.currentTime = 150; }
    return [...scene.querySelectorAll('.block-stack')].map(stack => [...stack.querySelectorAll('i')].map(block => {
      const parent = getComputedStyle(block); const face = getComputedStyle(block.firstElementChild!);
      return [parent.animationName, parent.opacity, parent.transform, face.transform];
    }));
  });
  for (const build of builds) expect(build).toEqual(builds[0]);
  await page.getByRole('button', { name: 'Show result now' }).click();
  const rubble = page.locator('.reveal-player:not(.reveal-chosen) .block-stack i:nth-child(n+3) span');
  await expect(rubble).toHaveCount(9);
  expect(await rubble.evaluateAll(blocks => blocks.every(block => getComputedStyle(block).opacity === '1' && getComputedStyle(block).transform !== 'none'))).toBe(true);
  const fallen = await page.locator('.tower-reveal .reveal-player:not(.reveal-chosen)').evaluateAll(players => players.map(player => ({
    style: player.getAttribute('data-fall-style'),
    topBlock: getComputedStyle(player.querySelector('.block-stack i:nth-child(5) span')!).transform,
  })));
  expect(new Set(fallen.map(player => player.style)).size).toBe(3);
  expect(new Set(fallen.map(player => player.topBlock)).size).toBe(3);
  await expect(page.locator('.reveal-chosen .block-stack')).toBeVisible();
});

test('skipped balloons leave scraps and one intact balloon', async ({ page }) => {
  await openMethod(page, 'balloon');
  await page.getByRole('button', { name: 'Pick a player' }).click();
  await page.getByRole('button', { name: 'Show result now' }).click();
  await expect(page.locator('.balloon-scraps')).toHaveCount(3);
  expect(await page.locator('.balloon-scraps').evaluateAll(scraps => scraps.every(scrap => getComputedStyle(scrap).opacity === '1'))).toBe(true);
  expect(await page.locator('.pop .balloon-shape').evaluateAll(shapes => shapes.every(shape => getComputedStyle(shape).opacity === '0'))).toBe(true);
  await expect(page.locator('.survivor .balloon-shape')).toBeVisible();
});

test('fairness links open the same picker heading with the requested method selected', async ({ page }) => {
  for (const method of methods) {
    await page.goto('/fairness/');
    await page.locator(`.prose a[href="/methods/${method.path}/"]`).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Who goes first?');
    await expect(page.getByRole('radio', { name: method.label, exact: true })).toBeChecked();
    await expect(page.locator('body')).not.toContainText(/[↗→]/);
  }
});

test('new methods fit twelve players on a narrow screen and support reduced motion', async ({ page }) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 320, height: 740 });
  for (const method of methods.slice(4)) {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await openMethod(page, method.path);
    await page.getByLabel('Player count', { exact: true }).selectOption('12');
    await page.getByRole('button', { name: 'Pick a player' }).click();
    await page.getByRole('button', { name: 'Show result now' }).click();
    await expect(page.locator(method.scene)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([]);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.getByRole('button', { name: 'Pick again' }).click();
    await expect(page.locator('.winner-announcement')).toContainText('Seat 2 goes first');
    await expect(page.locator(method.scene)).toHaveCount(0);
  }
});

test('twelve colors stay distinct and consistent between roster and reveals', async ({ page }) => {
  test.setTimeout(90000);
  for (const method of methods.filter(m => m.path !== 'spinner')) {
    await openMethod(page, method.path);
    await page.getByLabel('Player count', { exact: true }).selectOption('12');
    const colors = await page.locator('.seat-token').evaluateAll(tokens => tokens.map(token => getComputedStyle(token).backgroundColor));
    expect(new Set(colors).size).toBe(12);
    await page.getByRole('button', { name: 'Pick a player' }).click();
    await expect(page.locator(method.scene)).toBeVisible();
    const pieces = method.path === 'balloon' ? '.balloon-shape>path:first-child' : method.path === 'race' ? '.marble' : method.path === 'straws' ? '.match-head' : method.path === 'cards' ? '.card-back' : method.path === 'towers' ? '.block-stack i:first-child span' : '.die:first-child';
    const revealedColors = await page.locator(pieces).evaluateAll(pieces => pieces.map(piece => {
      const style = getComputedStyle(piece);
      return piece.tagName === 'path' ? style.fill : style.backgroundColor;
    }));
    expect(revealedColors).toEqual(colors);
  }
});

test('balloon timings persist through skip and change on a new pick', async ({ page }) => {
  await openMethod(page, 'balloon');
  await page.getByLabel('Player count', { exact: true }).selectOption('12');
  await page.getByRole('button', { name: 'Pick a player' }).click();
  await expect(page.locator('.balloon-player')).toHaveCount(12);
  const delays = () => page.locator('.balloon-player.pop').evaluateAll(players => players.map(player => (player as HTMLElement).style.getPropertyValue('--delay')));
  const before = await delays();
  await page.getByRole('button', { name: 'Show result now' }).click();
  expect(await delays()).toEqual(before);
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Pick again' }).click();
  expect(await delays()).not.toEqual(before);
});

test('cards perform overlapping three-dimensional flips and retain their faces after skip', async ({ page }) => {
  await openMethod(page, 'cards');
  await page.getByLabel('Player count', { exact: true }).selectOption('12');
  await page.getByRole('button', { name: 'Pick a player' }).click();
  await expect(page.locator('.card-flipper')).toHaveCount(12);
  const timings = await page.locator('.card-flipper').evaluateAll(cards => cards.map(card => {
    const style = getComputedStyle(card);
    return { delay: parseFloat(style.animationDelay), duration: parseFloat(style.animationDuration), animation: style.animationName, depth: style.transformStyle };
  }));
  expect(new Set(timings.map(t => t.delay)).size).toBeGreaterThan(6);
  expect(Math.max(...timings.map(t => t.delay))).toBeLessThan(Math.min(...timings.map(t => t.delay + t.duration)));
  expect(timings.every(t => t.animation === 'flip-card' && t.depth === 'preserve-3d')).toBe(true);
  await page.getByRole('button', { name: 'Show result now' }).click();
  await expect(page.locator('.cards-reveal')).toHaveAttribute('data-settled', 'true');
  await expect.poll(() => page.locator('.card-flipper').evaluateAll(cards => cards.every(card => {
    const matrix = new DOMMatrixReadOnly(getComputedStyle(card).transform);
    return Math.abs(matrix.m11 + 1) < .001;
  }))).toBe(true);
  await expect(page.locator('.card-front')).toHaveCount(12);
  const glows = await page.locator('.cards-reveal .reveal-player').evaluateAll(players => players.map(player => ({
    chosen: player.classList.contains('reveal-chosen'),
    glow: getComputedStyle(player.querySelector('.card-front')!).boxShadow,
  })));
  expect(glows.find(card => card.chosen)!.glow).not.toBe('none');
});

test('every settled method glows around its winning piece', async ({ page }) => {
  for (const method of methods) {
    await openMethod(page, method.path);
    await page.getByRole('button', { name: 'Pick a player' }).click();
    await page.getByRole('button', { name: 'Show result now' }).click();
    const selector = {
      spinner: '.spinner-legend .reveal-chosen .spinner-seat',
      cards: '.reveal-chosen .card-front',
      balloon: '.survivor>svg:first-child',
      towers: '.reveal-chosen .block-stack',
      straws: '.reveal-chosen .match-draw',
      dice: '.reveal-chosen .dice-pair',
      race: '.reveal-chosen .marble',
    }[method.path]!;
    expect(await page.locator(selector).evaluate(piece => {
      const style = getComputedStyle(piece);
      return style.boxShadow !== 'none' || style.filter !== 'none';
    })).toBe(true);
  }
});

test('Quick and Instant glow around the selected seat', async ({ page }) => {
  await page.goto('/');
  for (const mode of ['Quick', 'Instant']) {
    await page.getByRole('radio', { name: mode, exact: true }).check();
    await page.getByRole('button', { name: 'Pick a player' }).click();
    await expect(page.locator('.player.winner .seat-token')).toBeVisible();
    expect(await page.locator('.player.winner .seat-token').evaluate(seat => getComputedStyle(seat).boxShadow)).not.toBe('none');
  }
});

test('race has a single aligned finish line and a scattered result on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await openMethod(page, 'race');
  await page.getByLabel('Player count', { exact: true }).selectOption('12');
  await page.getByRole('button', { name: 'Pick a player' }).click();
  await page.getByRole('button', { name: 'Show result now' }).click();
  await expect(page.locator('.finish-line')).toHaveCount(1);
  const course = await page.locator('.marble-race').evaluate(race => {
    const finish = race.querySelector('.finish-line')!.getBoundingClientRect();
    const lanes = [...race.querySelectorAll('.race-lane')].map(lane => lane.getBoundingClientRect().left);
    const marbles = [...race.querySelectorAll('.race-player')].map(player => ({ chosen: player.classList.contains('reveal-chosen'), right: player.querySelector('.marble')!.getBoundingClientRect().right }));
    return { finish: finish.left, lanes, marbles };
  });
  expect(new Set(course.lanes).size).toBe(1);
  for (const marble of course.marbles) {
    if (marble.chosen) expect(marble.right).toBeGreaterThan(course.finish);
    else expect(marble.right).toBeLessThan(course.finish);
  }
  expect(new Set(course.marbles.map(m => Math.round(m.right))).size).toBeGreaterThan(6);
});
