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

for (const width of [390, 1280]) test(`Dice Roll can show its locked result early at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 844 });
  await openMethod(page, 'dice');
  const button = page.locator('.picker-card > .primary');
  await button.click();
  await expect(page.locator('.picker')).toHaveAttribute('data-phase', 'revealing');
  await expect(button).toHaveText('Show result now');
  await button.click();
  await expect(page.locator('.picker')).toHaveAttribute('data-phase', 'result');
  await expect(page.locator('.winner-announcement')).toHaveText('Seat 2 goes first.');
  await expect(page.locator('.dice-reveal')).toHaveAttribute('data-settled', 'true');
  await expect(page.locator('.dice-reveal .reveal-chosen')).toHaveCount(1);
  await expect(button).toHaveText('Pick again');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('dice show pips while rolling without a loading ring and stay decorative to assistive tech', async ({ page }) => {
  await openMethod(page, 'dice');
  await page.getByRole('button', { name: 'Pick a player' }).click();
  await expect(page.locator('.dice-reveal')).toBeVisible();
  await expect(page.locator('.reveal-stage')).toHaveAttribute('aria-hidden', 'true');
  const rolling = await page.locator('.die').first().evaluate(element => ({
    ring: getComputedStyle(element, '::after').content,
    pips: getComputedStyle(element.querySelector('svg')!).opacity,
  }));
  expect(rolling).toEqual({ ring: 'none', pips: '1' });
  await expect(page.locator('.winner-announcement')).toContainText('Seat 2 goes first');
  expect(await page.locator('.die').first().evaluate(element => getComputedStyle(element, '::after').content)).toBe('none');
});

test('dice leave more room when the group reaches five players', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openMethod(page, 'dice');
  const size = () => page.locator('.dice-reveal .die').first().evaluate(element => element.getBoundingClientRect().width);
  expect(await size()).toBe(38);
  await page.getByLabel('Player count', { exact: true }).fill('5');
  await page.getByLabel('Player count', { exact: true }).blur();
  await expect(page.locator('.dice-reveal')).toHaveAttribute('data-five', 'true');
  expect(await size()).toBe(36);
  await page.getByLabel('Player count', { exact: true }).fill('12');
  await page.getByLabel('Player count', { exact: true }).blur();
  expect(await size()).toBe(30);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

for (const [width, motion] of [[320, 'no-preference'], [390, 'reduce']] as const) test(`24-player dice keep every result readable at ${width}px with ${motion} motion`, async ({ page }) => {
  await page.setViewportSize({ width, height: 844 });
  await page.emulateMedia({ reducedMotion: motion });
  await page.addInitScript(() => Object.defineProperty(crypto, 'getRandomValues', { configurable: true, value: (array: Uint32Array) => { array[0] = 23; return array; } }));
  await page.goto('/methods/dice/');
  await expect(page.getByRole('button', { name: 'Pick a player' })).toBeEnabled();
  const count = page.getByLabel('Player count', { exact: true });
  await count.fill('24');
  await count.blur();
  await page.getByRole('button', { name: 'Pick a player' }).click();
  const scene = page.locator('.dice-reveal');
  await expect(scene.locator('.reveal-player')).toHaveCount(24);
  await expect(scene.locator('.die-flat')).toHaveCount(48);
  await expect(scene.locator('.die-cube')).toHaveCount(0);
  await expect(scene.locator('.reveal-player bdi')).toHaveText(Array.from({ length: 24 }, (_, i) => `Seat ${i + 1}`));
  expect(await scene.locator('.die-flat-face').evaluateAll(faces => faces.every(face => getComputedStyle(face, '::before').backgroundImage.includes('radial-gradient')))).toBe(true);
  await expect(page.locator('.reveal-stage')).toHaveAttribute('aria-hidden', 'true');
  if (motion === 'no-preference') {
    await expect.poll(() => scene.locator('.die-flat').evaluateAll(dice => dice.every(die => die.getAnimations().every(animation => animation.playState === 'finished')))).toBe(true);
    await expect(page.locator('.picker')).toHaveAttribute('data-phase', 'revealing');
  }
  await expect(scene).toHaveAttribute('data-settled', 'true');
  await expect(page.locator('.winner-announcement')).toContainText('Seat 24 goes first');
  await expect(scene.locator('.reveal-chosen')).toHaveCount(1);
  await expect(scene.locator('.reveal-chosen .die-flat')).toHaveCount(2);
  // The chosen pair is the single highest total, and every pair shows its total.
  const totals = await scene.locator('.reveal-player').evaluateAll(players => players.map(player => ({ chosen: player.classList.contains('reveal-chosen'), sum: [...player.querySelectorAll('.die-flat')].reduce((total, die) => total + Number(die.getAttribute('data-value')), 0), shown: Number(player.querySelector('.dice-total')?.textContent) })));
  expect(totals.every(total => total.sum === total.shown)).toBe(true);
  const best = totals.find(total => total.chosen)!.sum;
  expect(totals.filter(total => !total.chosen).every(total => total.sum < best)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  if (motion === 'reduce') expect(await page.locator('.picker').evaluate(picker => picker.getAnimations({ subtree: true }).length)).toBe(0);
});

for (const method of methods) test(`${method.label} keeps the scene after completion and replay`, async ({ page }) => {
  test.setTimeout(60000);
  await openMethod(page, method.path);
  await page.getByRole('button', { name: 'Pick a player' }).click();
  const scene = page.locator(method.scene);
  await expect(scene).toBeVisible();
  await scene.evaluate(element => element.setAttribute('data-original-scene', 'yes'));
  await expect(page.locator('.winner-announcement')).toContainText('Seat 2 goes first');
  await expect(scene).toHaveAttribute('data-settled', 'true');
  await expect(scene).toHaveAttribute('data-original-scene', 'yes');
  expect(await scene.evaluate((element, allowBalloonSheen) => element.getAnimations({ subtree: true })
    .filter(animation => animation instanceof CSSAnimation && ['piece-glimmer', 'filter-glimmer', 'shell-glimmer', 'surface-shimmer', 'balloon-shimmer', 'spinner-shimmer'].includes(animation.animationName))
    .every(animation => {
      if (!(animation instanceof CSSAnimation)) return false;
      const effect = animation.effect;
      if (!(effect instanceof KeyframeEffect) || effect.getTiming().duration !== 2400 || effect.getTiming().iterations !== 1) return false;
      const target = effect.target;
      const frames = effect.getKeyframes();
      if (!(target instanceof Element) || frames.length < 2) return false;
      // Settled objects keep their geometry: only light color/opacity varies.
      // Firefox retains color-mix(...rgb(...)...) in native keyframes, while
      // Chromium/WebKit resolve it. Strip only supported complete color values.
      const stripColors = (value: string) => value.replace(/(?:rgba?|color(?:-mix)?|oklch|oklab|lab|lch)\((?:[^()]|\([^()]*\))*\)/g, '').replace(/\s+/g, ' ').replace(/\s*,\s*/g, ', ').trim();
      const onlyProperty = (property: string) => frames.every(frame => Object.keys(frame).every(key => ['offset', 'computedOffset', 'easing', 'composite', property].includes(key)));
      if (animation.animationName === 'piece-glimmer') {
        return target.matches('.table-reveal[data-settled="true"] .reveal-chosen :is(.card-front,.shell-pearl)') && !effect.pseudoElement
          && onlyProperty('boxShadow') && frames.every(frame => typeof frame.boxShadow === 'string' && stripColors(frame.boxShadow) === '0px 0px 0px 1.5px, 0px 0px 8px 2px');
      }
      if (animation.animationName === 'filter-glimmer') {
        return target.matches('.spinner-stage[data-settled="true"] .spinner-winning-slice,.table-reveal[data-settled="true"] .reveal-chosen :is(.block-stack,.match-draw,.dice-pair,.coin-toss,.shell-scene),.balloon-field[data-settled="true"] .survivor>svg:first-child') && !effect.pseudoElement
          && onlyProperty('filter') && frames.every(frame => typeof frame.filter === 'string' && stripColors(frame.filter).replace(/\( /g, '(').replace(/ \)/g, ')') === 'drop-shadow(0px 0px 1px) drop-shadow(0px 0px 5px)');
      }
      if (animation.animationName === 'shell-glimmer') {
        return target.matches('.shells-reveal[data-settled="true"] .reveal-chosen .shell-sheen') && !effect.pseudoElement
          && onlyProperty('opacity') && frames.every(frame => typeof frame.opacity === 'string' && Number(frame.opacity) >= .27 && Number(frame.opacity) <= .65);
      }
      if (animation.animationName === 'surface-shimmer') {
        if (!(target instanceof HTMLElement)) return false;
        const dieFace = target.matches('.dice-reveal[data-settled="true"] .reveal-chosen .die-face') && effect.pseudoElement === '::after';
        const otherSurface = target.matches('.table-reveal[data-settled="true"] .reveal-chosen :is(.card-front,.block-stack i>span,.match-wood,.match-head,.coin-face,.shell-pearl)') && effect.pseudoElement === '::before';
        if (!dieFace && !otherSurface) return false;
        return frames.every(frame => {
          if (!Object.keys(frame).every(key => ['offset', 'computedOffset', 'easing', 'composite', 'backgroundPosition', 'backgroundPositionX', 'backgroundPositionY'].includes(key))) return false;
          if (typeof frame.backgroundPosition === 'string') return /^(?:100%|0(?:%|px)?) 0(?:%|px)?$/.test(frame.backgroundPosition);
          return typeof frame.backgroundPositionX === 'string' && /^(?:100%|0(?:%|px)?)$/.test(frame.backgroundPositionX)
            && typeof frame.backgroundPositionY === 'string' && /^0(?:%|px)?$/.test(frame.backgroundPositionY);
        });
      }
      const balloon = allowBalloonSheen && animation.animationName === 'balloon-shimmer';
      const spinner = animation.animationName === 'spinner-shimmer';
      if (!balloon && !spinner || !(target instanceof SVGRectElement)) return false;
      if (!target.matches(balloon ? '.balloon-field[data-settled="true"] .survivor .balloon-shape .balloon-sheen' : '.spinner-stage[data-settled="true"] .spinner-sheen')) return false;
      const clip = target.parentElement?.getAttribute('clip-path')?.match(/^url\(#(.+)\)$/)?.[1];
      if (!clip || !document.getElementById(clip)?.matches('clipPath')) return false;
      const outline = element.querySelector(balloon ? '.survivor .balloon-shape>path:first-child' : '.spinner-winning-slice');
      if (!outline || document.getElementById(clip)?.querySelector('path')?.getAttribute('d') !== outline.getAttribute('d')) return false;
      // Only the contained horizontal sheen moves during the final flourish.
      return onlyProperty('transform') && frames.every(frame => {
        if (typeof frame.transform !== 'string') return false;
        const matrix = new DOMMatrix(frame.transform);
        return matrix.is2D && matrix.a === 1 && matrix.b === 0 && matrix.c === 0 && matrix.d === 1 && matrix.f === 0 && matrix.e >= 0 && matrix.e <= (balloon ? 180 : 560);
      });
    }), method.path === 'balloon')).toBe(true);
  expect(await scene.evaluate(element => element.getAnimations({ subtree: true }).some(animation => animation instanceof CSSAnimation && ['piece-glimmer', 'filter-glimmer', 'shell-glimmer', 'surface-shimmer', 'balloon-shimmer', 'spinner-shimmer'].includes(animation.animationName)))).toBe(true);
  expect(await scene.evaluate(element => element.getAnimations({ subtree: true }).every(animation => animation.effect?.getTiming().iterations !== Infinity))).toBe(true);
  await expect.poll(() => scene.evaluate(element => element.getAnimations({ subtree: true }).filter(animation => animation.playState === 'running').length), { timeout: 5000 }).toBe(0);
  if (method.path !== 'spinner' && method.path !== 'balloon') {
    const surfaces = ({ cards: '.card-front', towers: '.block-stack i>span', straws: '.match-wood,.match-head', dice: '.die-face', coin: '.coin-face', shells: '.shell-pearl' } as Record<string, string>)[method.path]!;
    const pseudo = method.path === 'dice' ? '::after' : '::before';
    const reflections = await scene.locator(`.reveal-chosen :is(${surfaces})`).evaluateAll((elements, pseudo) => elements.map(element => getComputedStyle(element, pseudo).animationName), pseudo);
    expect(reflections.length).toBeGreaterThan(0);
    expect(reflections.every(name => name === 'surface-shimmer')).toBe(true);
    expect(await scene.locator(`.reveal-player:not(.reveal-chosen) :is(${surfaces})`).evaluateAll((elements, pseudo) => elements.every(element => getComputedStyle(element, pseudo).animationName === 'none'), pseudo)).toBe(true);
  }
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

for (const mode of ['Quick', 'Instant']) test(`${mode} reflects light only on the winning seat and stops with reduced motion`, async ({ page }) => {
  await page.goto('/');
  await showAllMethods(page);
  await page.getByRole('radio', { name: mode, exact: true }).check();
  await page.getByRole('button', { name: 'Pick a player', exact: true }).click();
  await expect(page.locator('.picker')).toHaveAttribute('data-phase', 'result');
  await expect(page.locator('.player.winner')).toHaveCount(1);
  expect(await page.locator('.player.winner .seat-token').evaluate(element => getComputedStyle(element, '::after').animationName)).toBe('surface-shimmer');
  expect(await page.locator('.player.winner .seat-token').evaluate(element => element.getAnimations({ subtree: true }).every(animation => animation.effect?.getTiming().iterations === 1 && animation.effect?.getTiming().duration === 2400))).toBe(true);
  await expect.poll(() => page.locator('.player.winner .seat-token').evaluate(element => element.getAnimations({ subtree: true }).filter(animation => animation.playState === 'running').length), { timeout: 5000 }).toBe(0);
  expect(await page.locator('.player:not(.winner) .seat-token').evaluateAll(elements => elements.every(element => getComputedStyle(element, '::after').animationName === 'none'))).toBe(true);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await page.locator('.picker').evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0);
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
  const position = (selector: string) => page.locator(selector).evaluate(element => {
    const rect = element.getBoundingClientRect();
    const transform = getComputedStyle(element).transform;
    // Compare flow geometry while the primary's hover/press lift animates.
    // The interaction-motion tests separately check its visual transform.
    const lift = transform === 'none' ? 0 : new DOMMatrixReadOnly(transform).m42;
    return { top: rect.top + scrollY - lift, height: rect.height };
  });
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
    await page.locator(`.fairness-methods a[href="/methods/${method.path}/"]`).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(method.label);
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

test('large table reveals keep all twelve pieces in a compact narrow scene', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const method of methods.filter(item => ['towers', 'straws', 'shells'].includes(item.path))) {
    await openMethod(page, method.path);
    await page.getByLabel('Player count', { exact: true }).fill('12');
    await page.getByLabel('Player count', { exact: true }).blur();
    await page.getByRole('button', { name: 'Pick a player' }).click();
    const scene = page.locator(`.picker .reveal-stage ${method.scene}`);
    await expect(scene).toHaveAttribute('data-settled', 'true');
    await expect(scene.locator('.reveal-player')).toHaveCount(12);
    await expect(scene.locator('.reveal-chosen')).toHaveCount(1);
    expect((await scene.boundingBox())!.height).toBeLessThan(650);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await scene.evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0);
  }
});

test('twelve colors stay distinct and consistent between roster and reveals', async ({ page }) => {
  test.setTimeout(120000);
  for (const method of methods.filter(m => m.path !== 'spinner')) {
    await openMethod(page, method.path);
    await page.getByLabel('Player count', { exact: true }).fill('12');
    await page.getByLabel('Player count', { exact: true }).blur();
    const colors = await page.locator('.seat-token').evaluateAll(tokens => tokens.map(token => getComputedStyle(token).backgroundColor));
    expect(new Set(colors).size).toBe(12);
    await page.getByRole('button', { name: 'Pick a player' }).click();
    await expect(page.locator(method.scene)).toBeVisible();
    const pieces = method.path === 'balloon' ? '.balloon-shape>path:first-child' : method.path === 'shells' ? '.shell-lid path:first-child' : method.path === 'straws' ? '.match-head' : method.path === 'cards' ? '.card-back' : method.path === 'towers' ? '.block-stack i:first-child span' : method.path === 'coin' ? '.coin-tails' : '.die:first-child .die-face-front';
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

test('cards turn one at a time in three dimensions, the final two together, and retain their faces', async ({ page }) => {
  await openMethod(page, 'cards');
  await page.getByLabel('Player count', { exact: true }).fill('12');
  await page.getByRole('button', { name: 'Pick a player' }).click();
  await expect(page.locator('.card-flipper')).toHaveCount(12);
  const timings = await page.locator('.card-flipper').evaluateAll(cards => cards.map(card => {
    const style = getComputedStyle(card);
    return { delay: parseFloat(style.animationDelay), duration: parseFloat(style.animationDuration), animation: style.animationName, depth: style.transformStyle };
  }));
  expect(new Set(timings.map(t => t.delay)).size).toBeGreaterThan(6);
  const chosenDelay = await page.locator('.cards-reveal .reveal-chosen .card-flipper').evaluate(card => parseFloat(getComputedStyle(card).animationDelay));
  // Only one other card turns alongside the chosen card at the end.
  expect(timings.filter(t => t.delay > chosenDelay - .05)).toHaveLength(2);
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
  await expect(page.locator('.cards-reveal .reveal-player:not(.reveal-chosen) .card-result')).toHaveText(Array(11).fill('·'));
  await expect(page.locator('.cards-reveal .card-front svg')).toHaveCount(0);
  await expect(page.locator('.cards-reveal .reveal-chosen .card-front')).toHaveCSS('animation-name', 'piece-glimmer');
  expect(await page.locator('.cards-reveal .reveal-chosen .card-front').evaluate(element => getComputedStyle(element, '::before').animationName)).toBe('surface-shimmer');
  expect(await page.locator('.cards-reveal .reveal-player:not(.reveal-chosen) .card-front').evaluateAll(elements => elements.every(element => getComputedStyle(element).animationName === 'none'))).toBe(true);
});

test('coins land one at a time, the final two together, and settle with one GO face up', async ({ page }) => {
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
  await expect(page.locator('.coin-reveal .reveal-chosen .coin-heads')).toHaveText('GO');
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
    await page.getByRole('button', { name: /^Pick (a player|again)$/ }).click();
    await expect(page.locator('.picker')).toHaveAttribute('data-phase', 'result');
    await expect(page.locator('.player.winner .seat-token')).toBeVisible();
    expect(await page.locator('.player.winner .seat-token').evaluate(seat => {
      const style = getComputedStyle(seat);
      return style.boxShadow !== 'none' && style.animationName === 'seat-glimmer';
    })).toBe(true);
  }
});
