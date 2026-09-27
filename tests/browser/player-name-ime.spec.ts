import { test, expect } from '@playwright/test';

test('player names keep composing Enter for the IME and blur only after composition', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Pick a player', exact: true })).toBeEnabled();
  const name = page.getByLabel('Name for player 1', { exact: true });
  await name.fill('王芳');
  await name.focus();

  const composing = await name.evaluate(element => {
    const field = element as HTMLTextAreaElement;
    field.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true, data: '王芳' }));
    const enter = new KeyboardEvent('keydown', {
      key: 'Enter', code: 'Enter', bubbles: true, cancelable: true, isComposing: true,
    });
    const uncanceled = field.dispatchEvent(enter);
    return { uncanceled, prevented: enter.defaultPrevented, focused: document.activeElement === field, value: field.value };
  });
  expect(composing).toEqual({ uncanceled: true, prevented: false, focused: true, value: '王芳' });
  await expect(name).toBeFocused();
  await expect(name).toHaveValue('王芳');

  const committed = await name.evaluate(element => {
    const field = element as HTMLTextAreaElement;
    field.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: '王芳' }));
    const enter = new KeyboardEvent('keydown', {
      key: 'Enter', code: 'Enter', bubbles: true, cancelable: true, isComposing: false,
    });
    const uncanceled = field.dispatchEvent(enter);
    return { uncanceled, prevented: enter.defaultPrevented, focused: document.activeElement === field, value: field.value };
  });
  expect(committed).toEqual({ uncanceled: false, prevented: true, focused: false, value: '王芳' });
  await expect(name).not.toBeFocused();
  await expect(name).toHaveValue('王芳');
});
