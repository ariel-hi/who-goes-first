import type { Page } from '@playwright/test';
export { DEV, STATIC } from './urls';

/** The picker shows four reveal methods until "More methods" is opened. */
export async function showAllMethods(page: Page) {
  const more = page.getByRole('button', { name: 'More methods' });
  await page.locator('input[name=presentation]').first().waitFor();
  if (await more.count()) await more.click();
}
