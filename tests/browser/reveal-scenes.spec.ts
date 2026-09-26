import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { showAllMethods } from './helpers';

const methods = [
  { path: 'spinner', label: 'Spinner', scene: '.spinner-stage' },
  { path: 'cards', label: 'Card Draw', scene: '.cards-reveal' },
  { path: 'balloon', label: 'Balloon Rise', scene: '.balloon-field' },
  { path: 'towers', label: 'Towers', scene: '.tower-reveal' },
  { path: 'straws', label: 'Shortest Match', scene: '.straws-reveal' },
  { path: 'dice', label: 'Dice Roll', scene: '.dice-reveal' },
  { path: 'coin', label: 'Coin Flip', scene: '.coin-reveal' },
  { path: 'shells', label: 'Shell Game', scene: '.shells-reveal' },
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

test('dice placeholders fade before the final pips and the scene is decorative to assistive tech', async ({ page }) => {
  await openMethod(page, 'dice');
  await page.getByRole('button', { name: 'Pick a player' }).click();
  await expect(page.locator('.dice-reveal')).toBeVisible();
  await expect(page.locator('.reveal-stage')).toHaveAttribute('aria-hidden', 'true');
  const animation = await page.locator('.die').first().evaluate(element => getComputedStyle(element, '::after').animationName);
  expect(animation).toBe('hide-placeholder');
  await expect(page.locator('.winner-announcement')).toContainText('Seat 2 goes first');
  const opacity = await page.locator('.die').first().evaluate(element => getComputedStyle(element, '::after').opacity);
  expect(opacity).toBe('0');
});

for (const method of methods) test(`${method.label} keeps the scene after completion and replay`, async ({ page }) => {
  await openMethod(page, method.path);
  await page.getByRole('button', { name: 'Pick a player' }).click();
  const scene = page.locator(method.scene);
  await expect(scene).toBeVisible();
  await scene.evaluate(element => element.setAttribute('data-original-scene', 'yes'));
  await expect(page.locator('.winner-announcement')).toContainText('Seat 2 goes first');
  await expect(scene).toHaveAttribute('data-settled', 'true');
  await expect(scene).toHaveAttribute('data-original-scene', 'yes');
  expect(await scene.evaluate(element => element.getAnimations({ subtree: true }).filter(animation => animation.effect?.getTiming().iterations === Infinity).every(animation => animation instanceof CSSAnimation && animation.animationName.endsWith('glimmer')))).toBe(true);
  await expect(page.locator('.roster')).toBeVisible();
  await page.getByRole('button', { name: 'Pick again' }).click();
  await expect(scene).not.toHaveAttribute('data-original-scene', 'yes');
  await expect(scene).toHaveAttribute('data-settled', 'false');
  await expect(page.locator('.picker')).toHaveAttribute('data-phase', 'result');
  await expect(scene).toHaveAttribute('data-settled', 'true');
  await expect(page.locator('.winner-announcement')).toContainText('Seat 2 goes first');
  await page.getByLabel('Name for player 1', { exact: true }).fill('Edited player');
  await expect(scene).toHaveAttribute('data-preview', 'true');
  await expect(page.getByLabel('Name for player 1', { exact: true })).toHaveValue('Edited player');
});

test('spinner keeps named seats in the roster without a duplicate list', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 780 });
  await openMethod(page, 'spinner');
  await page.getByLabel('Player count', { exact: true }).fill('12');
  await page.getByLabel('Name for player 1', { exact: true }).fill('Magnificent Eucalyptus');
  await page.getByLabel('Name for player 2', { exact: true }).fill('王芳');
  await page.getByLabel('Name for player 3', { exact: true }).fill('王芳');
  const colors = await page.locator('.seat-token').evaluateAll(tokens => tokens.map(token => getComputedStyle(token).backgroundColor));
  await page.getByRole('button', { name: 'Pick a player', exact: true }).click();
  await expect(page.locator('.picker')).toHaveAttribute('data-phase', 'result', { timeout: 15000 });
  await expect(page.locator('.roster')).toBeVisible();
  await expect(page.locator('.spinner-legend')).toHaveCount(0);
  await expect(page.locator('.roster')).toContainText('Magnificent Eucalyptus');
  await expect(page.locator('.roster')).toContainText('王芳');
  await expect(page.locator('.winner-announcement')).toContainText('王芳 · #2 goes first');
  expect(await page.locator('.seat-token').evaluateAll(tokens => tokens.map(token => getComputedStyle(token).backgroundColor))).toEqual(colors);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze()).violations).toEqual([]);
  await page.getByLabel('Name for player 1', { exact: true }).fill('New name');
  await expect(page.locator('.spinner-stage')).toHaveAttribute('data-preview', 'true');
  await expect(page.getByLabel('Name for player 1', { exact: true })).toHaveValue('New name');
  await expect(page.getByLabel('Name for player 2', { exact: true })).toHaveValue('王芳');
});

test('choosing an icon shows still pieces before picking anyone', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.reveal-stage')).toHaveCount(0);
  await showAllMethods(page);
  for (const method of methods) {
    await page.getByRole('radio', { name: method.label, exact: true }).check();
    const scene = page.locator(`.reveal-stage ${method.scene}`);
    await expect(scene).toBeVisible();
    await expect(scene).toHaveAttribute('data-preview', 'true');
    await expect(scene.locator('.reveal-player,.balloon-player')).toHaveCount(method.path === 'spinner' ? 0 : 4);
    if (method.path === 'spinner') await expect(scene.locator('.spinner-wheel g')).toHaveCount(4);
    await expect(scene.locator('.reveal-chosen,.survivor,.pop')).toHaveCount(0);
    expect(await scene.evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0);
    await expect(page.locator('.winner-announcement')).toBeEmpty();
  }
  await page.getByRole('radio', { name: 'Card Draw', exact: true }).check();
  await expect(page.locator('.reveal-stage .card-back').first()).toBeVisible();
  const stage = page.locator('.reveal-stage');
  const position = (selector: string) => page.locator(selector).evaluate(element => ({ top: element.getBoundingClientRect().top + scrollY, height: element.getBoundingClientRect().height }));
  const beforeStage = await position('.reveal-stage');
  const beforeOptions = await position('.reveal-options');
  const beforeButton = await position('.picker-card > .primary');
  for (const mode of ['Balloon Rise', 'Spinner', 'Shell Game', 'Card Draw']) {
    await page.getByRole('radio', { name: mode, exact: true }).check();
    expect((await position('.reveal-options')).top).toBeCloseTo(beforeOptions.top, 0);
    expect((await position('.picker-card > .primary')).top).toBeCloseTo(beforeButton.top, 0);
  }
  await page.locator('.cards-reveal').evaluate(element => element.setAttribute('data-original-preview', 'yes'));
  await page.getByRole('button', { name: 'Pick a player' }).click();
  await expect(stage).toHaveCount(1);
  await expect(page.locator('.cards-reveal')).toHaveAttribute('data-preview', 'false');
  await expect(page.locator('.cards-reveal')).toHaveAttribute('data-original-preview', 'yes');
  const afterStage = await position('.reveal-stage');
  const afterOptions = await position('.reveal-options');
  const afterButton = await position('.picker-card > .primary');
  expect(afterStage.top).toBeCloseTo(beforeStage.top, 0);
  expect(afterStage.height).toBeCloseTo(beforeStage.height, 0);
  expect(afterOptions.top).toBeCloseTo(beforeOptions.top, 0);
  expect(afterButton.top).toBeCloseTo(beforeButton.top, 0);
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
  await expect(page.locator('.picker')).toHaveAttribute('data-phase', 'result');
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

test('popped balloons leave scraps and one intact balloon', async ({ page }) => {
  await openMethod(page, 'balloon');
  await page.getByRole('button', { name: 'Pick a player' }).click();
  await expect(page.locator('.picker')).toHaveAttribute('data-phase', 'result');
  await expect(page.locator('.balloon-scraps')).toHaveCount(3);
  expect(await page.locator('.balloon-scraps').evaluateAll(scraps => scraps.every(scrap => getComputedStyle(scrap).opacity === '1'))).toBe(true);
  expect(await page.locator('.pop .balloon-shape').evaluateAll(shapes => shapes.every(shape => getComputedStyle(shape).opacity === '0'))).toBe(true);
  await expect(page.locator('.survivor .balloon-shape')).toBeVisible();
});

test('every balloon floats before the first pop, including the eventual survivor', async ({ page }) => {
  await openMethod(page, 'balloon');
  await page.getByRole('button', { name: 'Pick a player' }).click();
  const motion = await page.locator('.balloon-player').evaluateAll(players => players.map(player => ({
    float: getComputedStyle(player.querySelector('svg')!).animationName,
    shape: getComputedStyle(player.querySelector('.balloon-shape')!).transform,
  })));
  expect(motion.every(piece => piece.float === 'balloon-float' && piece.shape === 'none')).toBe(true);
  await expect(page.locator('.picker')).toHaveAttribute('data-phase', 'result');
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
  test.setTimeout(90000);
  await page.setViewportSize({ width: 320, height: 740 });
  for (const method of methods.filter(item => item.path === 'shells')) {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await openMethod(page, method.path);
    await page.getByLabel('Player count', { exact: true }).fill('12');
    await page.getByRole('button', { name: 'Pick a player' }).click();
    await expect(page.locator('.picker')).toHaveAttribute('data-phase', 'result');
    await expect(page.locator(method.scene)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([]);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.getByRole('button', { name: 'Pick again' }).click();
    await expect(page.locator('.winner-announcement')).toContainText('Seat 2 goes first');
    await expect(page.locator(method.scene)).toHaveAttribute('data-settled', 'true');
  }
});

test('twelve colors stay distinct and consistent between roster and reveals', async ({ page }) => {
  test.setTimeout(120000);
  for (const method of methods.filter(m => m.path !== 'spinner')) {
    await openMethod(page, method.path);
    await page.getByLabel('Player count', { exact: true }).fill('12');
    const colors = await page.locator('.seat-token').evaluateAll(tokens => tokens.map(token => getComputedStyle(token).backgroundColor));
    expect(new Set(colors).size).toBe(12);
    await page.getByRole('button', { name: 'Pick a player' }).click();
    await expect(page.locator(method.scene)).toBeVisible();
    const pieces = method.path === 'balloon' ? '.balloon-shape>path:first-child' : method.path === 'shells' ? '.shell-lid path:first-child' : method.path === 'straws' ? '.match-head' : method.path === 'cards' ? '.card-back' : method.path === 'towers' ? '.block-stack i:first-child span' : method.path === 'coin' ? '.coin-tails' : '.die:first-child';
    const revealedColors = await page.locator(pieces).evaluateAll(pieces => pieces.map(piece => {
      const style = getComputedStyle(piece);
      return piece.tagName === 'path' ? style.fill : style.backgroundColor;
    }));
    expect(revealedColors).toEqual(colors);
  }
});

test('balloon timings persist through completion and change on a new pick', async ({ page }) => {
  await openMethod(page, 'balloon');
  await page.getByLabel('Player count', { exact: true }).fill('12');
  await page.getByRole('button', { name: 'Pick a player' }).click();
  await expect(page.locator('.balloon-player')).toHaveCount(12);
  expect(new Set(await page.locator('.balloon-player.pop').evaluateAll(players => players.map(player => player.getAttribute('data-pop-style')))).size).toBe(4);
  const delays = () => page.locator('.balloon-player.pop').evaluateAll(players => players.map(player => (player as HTMLElement).style.getPropertyValue('--delay')));
  const before = await delays();
  await expect(page.locator('.picker')).toHaveAttribute('data-phase', 'result');
  expect(await delays()).toEqual(before);
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Pick again' }).click();
  expect(await delays()).not.toEqual(before);
});

test('cards perform overlapping three-dimensional flips and retain their faces', async ({ page }) => {
  await openMethod(page, 'cards');
  await page.getByLabel('Player count', { exact: true }).fill('12');
  await page.getByRole('button', { name: 'Pick a player' }).click();
  await expect(page.locator('.card-flipper')).toHaveCount(12);
  const timings = await page.locator('.card-flipper').evaluateAll(cards => cards.map(card => {
    const style = getComputedStyle(card);
    return { delay: parseFloat(style.animationDelay), duration: parseFloat(style.animationDuration), animation: style.animationName, depth: style.transformStyle };
  }));
  expect(new Set(timings.map(t => t.delay)).size).toBeGreaterThan(6);
  expect(Math.max(...timings.map(t => t.delay))).toBeLessThan(Math.min(...timings.map(t => t.delay + t.duration)));
  expect(timings.every(t => t.animation === 'flip-card' && t.depth === 'preserve-3d')).toBe(true);
  await expect(page.locator('.picker')).toHaveAttribute('data-phase', 'result');
  await expect(page.locator('.cards-reveal')).toHaveAttribute('data-settled', 'true');
  await expect.poll(() => page.locator('.card-flipper').evaluateAll(cards => cards.every(card => {
    const matrix = new DOMMatrixReadOnly(getComputedStyle(card).transform);
    return Math.abs(matrix.m11 + 1) < .001;
  }))).toBe(true);
  await expect(page.locator('.card-front')).toHaveCount(12);
  await expect(page.locator('.cards-reveal .card-result')).toHaveCount(12);
  await expect(page.locator('.cards-reveal .reveal-chosen .card-result')).toHaveText('GO');
  await expect(page.locator('.cards-reveal .reveal-player:not(.reveal-chosen) .card-result')).toHaveText(Array(11).fill('—'));
  await expect(page.locator('.cards-reveal .card-front svg')).toHaveCount(0);
  await expect(page.locator('.cards-reveal .reveal-chosen .card-front')).toHaveCSS('animation-name', 'none');
});

test('coins toss together and settle with one crown face up', async ({ page }) => {
  await openMethod(page, 'coin');
  await page.getByLabel('Player count', { exact: true }).fill('12');
  await page.getByRole('button', { name: 'Pick a player' }).click();
  await expect(page.locator('.coin')).toHaveCount(12);
  const starts = await page.locator('.coin').evaluateAll(coins => coins.map(coin => {
    const style = getComputedStyle(coin);
    return { name: style.animationName, delay: style.animationDelay, depth: style.transformStyle };
  }));
  expect(starts.every(coin => coin.name === 'coin-flip' && coin.depth === 'preserve-3d')).toBe(true);
  expect(new Set(starts.map(coin => coin.delay)).size).toBeGreaterThan(6);
  await expect(page.locator('.picker')).toHaveAttribute('data-phase', 'result');
  const faces = await page.locator('.coin-reveal .reveal-player').evaluateAll(players => players.map(player => ({
    chosen: player.classList.contains('reveal-chosen'),
    facing: new DOMMatrixReadOnly(getComputedStyle(player.querySelector('.coin')!).transform).m22,
  })));
  expect(faces.filter(face => face.chosen)).toHaveLength(1);
  expect(faces.find(face => face.chosen)!.facing).toBeLessThan(-.98);
  expect(faces.filter(face => !face.chosen).every(face => face.facing > .98)).toBe(true);
  await expect(page.locator('.coin-heads')).toHaveCount(12);
  await expect(page.locator('.coin-crown-up')).toHaveCount(0);
});

test('shells stay lifted and only one reveals a pearl', async ({ page }) => {
  test.setTimeout(60000);
  await openMethod(page, 'shells');
  await page.getByRole('button', { name: 'Pick a player' }).click();
  await expect(page.locator('.shell-lid')).toHaveCount(4);
  await expect(page.locator('.shell-pearl')).toHaveCSS('opacity', '1');
  await expect(page.locator('.shell-pearl')).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.shells-reveal')).toHaveAttribute('data-settled', 'true');
  expect(await page.locator('.shell-pearl').evaluate(pearl => ({ opacity: getComputedStyle(pearl).opacity, animation: getComputedStyle(pearl).animationName }))).toEqual({ opacity: '1', animation: 'piece-glimmer' });
  await expect(page.locator('.shell-pearl')).toHaveCount(1);
  await expect(page.locator('.reveal-chosen .shell-pearl')).toBeVisible();
  expect(await page.locator('.shell-lid').evaluateAll(lids => lids.every(lid => getComputedStyle(lid).transform !== 'none'))).toBe(true);
});

test('removed reveals are absent from the picker and their old pages return 404', async ({ page, request }) => {
  await page.goto('/');
  for (const [name, path] of [['Paper Planes', 'planes'], ['Marble Race', 'race'], ['Flower Pots', 'flowers']]) {
    await expect(page.getByRole('radio', { name })).toHaveCount(0);
    expect((await request.get(`/methods/${path}/`)).status()).toBe(404);
  }
});

test('other settled methods glow around their winning piece', async ({ page }) => {
  test.setTimeout(120000);
  for (const method of methods.filter(method => method.path !== 'cards')) {
    await openMethod(page, method.path);
    await page.getByRole('button', { name: 'Pick a player' }).click();
    await expect(page.locator('.picker')).toHaveAttribute('data-phase', 'result');
    const selector = {
      spinner: '.spinner-winning-slice',
      balloon: '.survivor>svg:first-child',
      towers: '.reveal-chosen .block-stack',
      straws: '.reveal-chosen .match-draw',
      dice: '.reveal-chosen .dice-pair',
      coin: '.reveal-chosen .coin-toss',
      shells: '.reveal-chosen .shell-pearl',
    }[method.path]!;
    expect(await page.locator(selector).evaluate(piece => {
      const style = getComputedStyle(piece);
      return (style.boxShadow !== 'none' || style.filter !== 'none') && style.animationName.includes('glimmer');
    })).toBe(true);
  }
});

test('Quick and Instant glow around the selected seat', async ({ page }) => {
  await page.goto('/'); await showAllMethods(page);
  for (const mode of ['Quick', 'Instant']) {
    await page.getByRole('radio', { name: mode, exact: true }).check();
    await page.getByRole('button', { name: 'Pick a player' }).click();
    await expect(page.locator('.player.winner .seat-token')).toBeVisible();
    expect(await page.locator('.player.winner .seat-token').evaluate(seat => {
      const style = getComputedStyle(seat);
      return style.boxShadow !== 'none' && style.animationName === 'seat-glimmer';
    })).toBe(true);
  }
});
