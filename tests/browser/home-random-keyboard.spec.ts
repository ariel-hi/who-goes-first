import { test, expect, type Page, type JSHandle } from '@playwright/test';

async function nativeArrival(page: Page) {
  const button = page.locator('[data-home-draw-rule]');
  await expect(button).toBeEnabled();
  // Backward native traversal reaches the desktop panel without focusing the
  // lookup first (lookup focus itself legitimately preloads the shared index).
  for (let presses = 0; presses < 80; presses++) {
    await page.keyboard.press('Shift+Tab');
    if (await button.evaluate(node => node === document.activeElement)) return button;
  }
  throw new Error('Native backward keyboard traversal did not reach Another rule');
}

async function indexGate(page: Page, fail = false) {
  let release!: () => void;
  let enter!: () => void;
  const held = new Promise<void>(resolve => { release = resolve; });
  const entered = new Promise<void>(resolve => { enter = resolve; });
  let requests = 0;
  await page.route('**/rule-index.json', async route => {
    requests++;
    if (requests === 1) {
      enter();
      await held;
      if (fail) { await route.abort('failed'); return; }
    }
    await route.continue();
  });
  return { release, entered, requests: () => requests };
}

async function sourceWrites(page: Page) {
  return page.locator('[data-home-rule-source]').evaluateHandle(element => {
    const state = { count: 0, observer: new MutationObserver(records => { state.count += records.length; }) };
    state.observer.observe(element, { attributes: true, attributeFilter: ['href'] });
    return state;
  });
}

async function focusGeometry(page: Page) {
  return page.locator('[data-home-draw-rule]').evaluate(button => {
    const rect = button.getBoundingClientRect();
    const css = getComputedStyle(button);
    return {
      active: document.activeElement === button, visible: button.matches(':focus-visible'),
      theme: document.documentElement.dataset.theme,
      width: rect.width, height: rect.height, left: rect.left, right: rect.right,
      top: rect.top, bottom: rect.bottom, outlineWidth: parseFloat(css.outlineWidth),
      outlineStyle: css.outlineStyle, overflow: document.documentElement.scrollWidth > innerWidth,
    };
  });
}

for (const colorScheme of ['light', 'dark'] as const) {
  test(`home random rule preserves native cold/repeated/warm keyboard focus in ${colorScheme}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.emulateMedia({ colorScheme, reducedMotion: 'no-preference' });
    const gate = await indexGate(page);
    let original: JSHandle<HTMLElement | SVGElement> | undefined;
    let writes: Awaited<ReturnType<typeof sourceWrites>> | undefined;
    try {
      await page.goto('/');
      if (colorScheme === 'dark') {
        await page.getByRole('button', { name: 'Switch to dark mode', exact: true }).click();
        // Start keyboard traversal in a fresh document with the natively saved
        // theme. Backward traversal from the header can leave Firefox content.
        await page.reload();
      }
      await expect(page.locator('html')).toHaveAttribute('data-theme', colorScheme);
      writes = await sourceWrites(page);
      const button = await nativeArrival(page);
      const source = page.locator('[data-home-rule-source]');
      const before = await source.getAttribute('href');
      original = await button.evaluateHandle(node => node);
      expect(gate.requests()).toBe(0);
      await page.keyboard.press('Enter');
      await gate.entered;
      await expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(await button.evaluate(node => node instanceof HTMLButtonElement && node.disabled)).toBe(false);
      await expect(button).toBeFocused();
      await page.keyboard.press('Enter');
      await page.keyboard.press('Enter');
      await expect(button).toBeFocused();
      expect(gate.requests()).toBe(1);
      await expect(source).toHaveAttribute('href', before!);
      const busy = await focusGeometry(page);
      expect(busy).toMatchObject({ active: true, visible: true, overflow: false, theme: colorScheme });
      expect(busy.height).toBeGreaterThanOrEqual(44);
      expect(busy.width).toBeGreaterThanOrEqual(44);
      expect(busy.outlineWidth).toBeGreaterThan(0);
      expect(busy.outlineStyle).not.toBe('none');
      await page.screenshot({ path: testInfo.outputPath('busy.png') });
      gate.release();
      await expect(source).not.toHaveAttribute('href', before!);
      await expect(button).not.toHaveAttribute('aria-disabled');
      await expect(button).toBeFocused();
      expect(await original.evaluate(node => node === document.querySelector('[data-home-draw-rule]'))).toBe(true);
      expect(await writes.evaluate(state => state.count)).toBe(1);
      const result = await focusGeometry(page);
      expect(result).toMatchObject({ active: true, visible: true, overflow: false, theme: colorScheme });
      await page.screenshot({ path: testInfo.outputPath('result.png') });
      await testInfo.attach('focus-geometry', { body: JSON.stringify({ busy, result }), contentType: 'application/json' });
      const cold = await source.getAttribute('href');
      await page.keyboard.press('Enter');
      await expect(source).not.toHaveAttribute('href', cold!);
      await expect(button).toBeFocused();
      expect(await writes.evaluate(state => state.count)).toBe(2);
      expect(gate.requests()).toBe(1);
    } finally {
      gate.release();
      await writes?.evaluate(state => state.observer.disconnect());
      await writes?.dispose();
      await original?.dispose();
    }
  });
}

test('home random-rule completion preserves an actual native keyboard destination', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const gate = await indexGate(page);
  let destination: JSHandle<Element | null> | undefined;
  try {
    await page.goto('/');
    const button = await nativeArrival(page);
    const before = await page.locator('[data-home-rule-source]').getAttribute('href');
    await page.keyboard.press('Enter');
    await gate.entered;
    await expect(button).toBeFocused();
    // Native Shift+Tab yields a real link in Chromium/Firefox and the lookup
    // input in default Windows WebKit. A BODY destination would not suffice.
    await page.keyboard.press('Shift+Tab');
    destination = await page.evaluateHandle(() => document.activeElement);
    expect(await destination.evaluate(node => node !== document.body && node?.matches('a,input,button,textarea,select') && node !== document.querySelector('[data-home-draw-rule]'))).toBe(true);
    gate.release();
    await expect(page.locator('[data-home-rule-source]')).not.toHaveAttribute('href', before!);
    await expect(button).not.toHaveAttribute('aria-disabled');
    expect(await destination.evaluate(node => node === document.activeElement && node?.isConnected)).toBe(true);
  } finally { gate.release(); await destination?.dispose(); }
});

test('home random rule preserves native keyboard retry after failed index fetch', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const gate = await indexGate(page, true);
  try {
    await page.goto('/');
    const button = await nativeArrival(page);
    const source = page.locator('[data-home-rule-source]');
    const before = await source.getAttribute('href');
    await page.keyboard.press('Enter');
    await gate.entered;
    await expect(button).toBeFocused();
    gate.release();
    await expect(page.locator('[data-home-rule-error]')).toBeVisible();
    await expect(button).not.toHaveAttribute('aria-disabled');
    await expect(button).toBeFocused();
    await expect(source).toHaveAttribute('href', before!);
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-home-rule-error]')).toBeHidden();
    await expect(source).not.toHaveAttribute('href', before!);
    await expect(button).toBeFocused();
    expect(gate.requests()).toBe(2);
  } finally { gate.release(); }
});
