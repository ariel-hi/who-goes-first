import type { Page } from '@playwright/test';

/** The picker shows four reveal methods until "More methods" is opened. */
export async function showAllMethods(page: Page) {
  const more = page.getByRole('button', { name: 'More methods' });
  await page.locator('input[name=presentation]').first().waitFor();
  if (await more.count()) await more.click();
}

// Servers the suite runs against; override the ports to avoid clashing with another checkout.
export const STATIC = `http://127.0.0.1:${process.env.STATIC_PORT || 4322}`;
export const DEV = `http://127.0.0.1:${process.env.DEV_PORT || 4321}`;
