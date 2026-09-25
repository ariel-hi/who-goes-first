import { defineConfig, devices } from '@playwright/test';
const staticPort = Number(process.env.STATIC_PORT || 4322);
const devPort = Number(process.env.DEV_PORT || 4321);
export default defineConfig({
  // The live-route checks add and remove temporary catalog records. Keep browser
  // cases serial so a directory read cannot race with fixture cleanup.
  testDir: './tests/browser', fullyParallel: false, workers: 1,
  timeout: 30000, expect: { timeout: 8000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: `http://127.0.0.1:${staticPort}`, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  webServer: [
    { command: 'npm run test:serve', env: { PORT: String(staticPort) }, port: staticPort, reuseExistingServer: !process.env.CI, timeout: 30000 },
    { command: `npm run dev -- --port ${devPort}`, port: devPort, reuseExistingServer: !process.env.CI, timeout: 60000 },
  ],
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
