import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  // Three simultaneous engines plus the live preview exhaust this Windows host.
  testDir: './tests/browser', fullyParallel: true, workers: process.env.CI ? 3 : 1,
  timeout: 30000, expect: { timeout: 8000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: 'http://127.0.0.1:4322', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  webServer: [
    { command: 'npm run test:serve', port: 4322, reuseExistingServer: !process.env.CI, timeout: 30000 },
    { command: 'npm run dev -- --port 4321', port: 4321, reuseExistingServer: !process.env.CI, timeout: 60000 },
  ],
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
