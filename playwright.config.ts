import { defineConfig, devices } from '@playwright/test';
import { DEV, STATIC, devPort, staticPort } from './tests/browser/urls';
export default defineConfig({
  // The live-route checks add and remove temporary catalog records. Keep browser
  // cases serial so a directory read cannot race with fixture cleanup.
  testDir: './tests/browser', fullyParallel: false, workers: 1,
  timeout: 30000, expect: { timeout: 8000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: STATIC, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  webServer: [
    { command: 'npm run test:serve', env: { PORT: String(staticPort) }, url: STATIC, reuseExistingServer: false, timeout: 30000 },
    { command: `node ./node_modules/astro/bin/astro.mjs dev --host 127.0.0.1 --port ${devPort} --ignore-lock`, url: DEV, reuseExistingServer: false, timeout: 60000 },
  ],
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
