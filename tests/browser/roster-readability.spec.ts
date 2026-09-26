import { test, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

const names = ['Magnificent Eucalyptus', 'Alexandra Montgomery', 'ABCDEFGHIJKLMNOPQRSTUVWX', '👨‍👩‍👧‍👦'.repeat(24), '春夏秋冬'.repeat(6), '王芳', '王芳', 'Nathaniel Hawthorne', 'Louisa May Alcott', 'André François Dupont', 'Christopher Robin', 'Elizabeth Bennet'];
for (const width of [320, 390, 1280]) for (const count of [4, 12, 50]) {
  if (count === 50 && width !== 320) continue;
  test(`${count} complete editable names remain readable at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 844 });
    const roster = Array.from({ length: count }, (_, index) => ({ id: `player-${index + 1}`, label: names[index % names.length]! }));
    await page.addInitScript(players => {
      localStorage.setItem('wgf:preferences:v1', JSON.stringify({ version: 1, remember: true, roster: players, inputMode: 'names', mode: 'quick', sound: false, motion: 'system' }));
    }, roster);
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Pick a player', exact: true })).toBeEnabled();
    await expect(page.locator('.picker')).toHaveAttribute('data-count', String(count));
    const fields = page.locator('textarea.player-name');
    await expect(fields).toHaveCount(count);
    expect(await fields.evaluateAll(elements => elements.map(element => (element as HTMLTextAreaElement).value))).toEqual(roster.map(player => player.label));
    const measure = () => fields.evaluateAll(elements => elements.map(element => {
      const field = element as HTMLTextAreaElement;
      const rect = field.getBoundingClientRect();
      const style = getComputedStyle(field);
      const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
      const textWidth = field.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      const context = document.createElement('canvas').getContext('2d')!;
      context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      const longestWordWidth = Math.max(...field.value.split(/\s+/).map(word => context.measureText(word).width));
      return { width: rect.width, height: rect.height, fontSize: parseFloat(style.fontSize), lineHeight: parseFloat(style.lineHeight), textHeight: field.clientHeight - padding, textWidth, longestWordWidth, scrollHeight: field.scrollHeight, clientHeight: field.clientHeight };
    }));
    await expect.poll(async () => (await measure()).every(field => field.width >= 44 && field.height >= 44 && field.scrollHeight <= field.clientHeight + 2)).toBe(true);
    const measured = await measure();
    // Familiar words fit intact; 320px four-player names may use two whole-word lines.
    for (const field of measured.slice(0, 2)) expect(field.longestWordWidth).toBeLessThanOrEqual(field.textWidth);
    if (count > 8 || width === 390) for (const field of measured.slice(0, 2)) expect(field.height).toBeLessThanOrEqual(44.5);
    const bounds = await page.locator('.roster').evaluate(element => ({ overflow: getComputedStyle(element).overflowY, scrollHeight: element.scrollHeight, clientHeight: element.clientHeight, pageWidth: document.documentElement.scrollWidth, viewport: innerWidth }));
    expect(bounds.overflow).toBe('visible');
    expect(bounds.scrollHeight).toBeLessThanOrEqual(bounds.clientHeight);
    expect(bounds.pageWidth).toBeLessThanOrEqual(bounds.viewport);
    if (count > 4) await expect(page.locator('.duplicate-id')).toHaveCount(count);
    const first = fields.first();
    await first.focus();
    expect(await first.evaluate(element => { const field = element as HTMLTextAreaElement; return [field.selectionStart, field.selectionEnd]; })).toEqual([0, names[0]!.length]);
    // A pointer may place the caret after focus selection (native WebKit behavior).
    // Check the standard edit shortcut after a real click in every engine.
    await first.click();
    await first.press('ControlOrMeta+A');
    expect(await first.evaluate(element => { const field = element as HTMLTextAreaElement; return [field.selectionStart, field.selectionEnd]; })).toEqual([0, names[0]!.length]);
    await page.keyboard.type('Edited legal name');
    await first.press('Enter');
    await expect(first).toHaveValue('Edited legal name');
    await expect(first).not.toBeFocused();
    expect((await fields.evaluateAll(elements => elements.map(element => (element as HTMLTextAreaElement).value))).slice(1)).toEqual(roster.slice(1).map(player => player.label));
    await first.fill(names[0]!); await first.press('Enter');
    await expect.poll(async () => (await measure()).every(field => field.scrollHeight <= field.clientHeight + 2)).toBe(true);
    const path = testInfo.outputPath('roster-readability.json');
    await writeFile(path, JSON.stringify({ width, count, measured, bounds, nativeEditAndBlur: true }, null, 2), 'utf8');
    await testInfo.attach('roster-readability', { path, contentType: 'application/json' });
  });
}
