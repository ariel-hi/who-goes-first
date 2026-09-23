import { chromium, expect } from '@playwright/test';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

// A real development island must survive builds that share node_modules.
// Production-only browser tests cannot detect an invalidated Vite cache.
const browser = await chromium.launch();
async function check() {
  const context = await browser.newContext();
  try {
    const page = await context.newPage();
    const failures: string[] = [];
    page.on('response', response => { if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`); });
    page.on('pageerror', error => failures.push(error.message));
    await page.goto('http://127.0.0.1:4321/');
    await expect(page.getByRole('button', { name: 'Pick a player' })).toBeEnabled();
    await page.getByRole('radio', { name: /^Instant/ }).check();
    await page.getByRole('button', { name: 'Pick a player' }).click();
    await expect(page.locator('.winner-announcement')).toContainText('goes first.');
    expect(failures).toEqual([]);
  } finally { await context.close(); }
}
try {
  await check();
  const child = spawn(process.execPath, [resolve('node_modules/tsx/dist/cli.mjs'), 'scripts/test-release.ts'], { stdio: 'inherit' });
  await new Promise<void>((resolveRun, reject) => {
    child.on('error', reject);
    child.on('exit', code => code === 0 ? resolveRun() : reject(new Error(`Release matrix failed: ${code}`)));
  });
  await check();
  console.log('Development picker works in fresh browser contexts before and after the complete release matrix.');
} finally { await browser.close(); }
