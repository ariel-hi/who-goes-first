import lighthouse from 'lighthouse';
import desktopConfig from 'lighthouse/core/config/desktop-config.js';
import { chromium } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import assert from 'node:assert/strict';
import { staticServer } from './lib/static-server';

// Only isolated production fixtures are audited. No public host is contacted.
const fixture = JSON.parse(readFileSync('artifacts/release-fixtures/latest.json', 'utf8')) as { populated: string; createdAt: string };
assert.ok(Date.now() - Date.parse(fixture.createdAt) < 60 * 60 * 1000, 'Run npm run test:release first to audit fresh output.');
const server = staticServer(fixture.populated);
await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
const address = server.address(); assert.ok(address && typeof address !== 'string');
const base = `http://127.0.0.1:${address.port}`;
const socket = createServer(); await new Promise<void>(resolve => socket.listen(0, '127.0.0.1', resolve));
const debugAddress = socket.address(); assert.ok(debugAddress && typeof debugAddress !== 'string');
await new Promise<void>(resolve => socket.close(() => resolve()));
const browser = await chromium.launch({ args: [`--remote-debugging-port=${debugAddress.port}`] });
mkdirSync('artifacts/lighthouse', { recursive: true });
const summaries: unknown[] = [];
const regressions: string[] = [];
let lighthouseVersion = '';
try {
  for (const [name, path, desktop] of [
    ['home-mobile-1', '/', false], ['home-mobile-2', '/', false], ['home-mobile-3', '/', false],
    ['home-desktop', '/', true], ['balloon-mobile', '/methods/balloon/', false], ['board-games-mobile', '/board-games/', false], ['rule-mobile', '/games/synthetic-fixture/', false],
  ] as const) {
    const result = await lighthouse(base + path, { port: debugAddress.port, output: ['json', 'html'], logLevel: 'error', onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'] }, desktop ? desktopConfig : undefined);
    assert.ok(result && !result.lhr.runtimeError, `${name}: Lighthouse did not complete`);
    const { lhr, report } = result;
    lighthouseVersion = lhr.lighthouseVersion;
    writeFileSync(`artifacts/lighthouse/${name}.json`, report[0]!);
    writeFileSync(`artifacts/lighthouse/${name}.html`, report[1]!);
    const scores = Object.fromEntries(Object.entries(lhr.categories).map(([key, value]) => [key, Math.round((value.score || 0) * 100)]));
    for (const category of ['accessibility', 'best-practices', 'seo']) if (scores[category] !== 100) regressions.push(`${name}: ${category} ${scores[category]}/100`);
    if ((scores.performance || 0) < 90) regressions.push(`${name}: performance ${scores.performance}/100`);
    const metrics = Object.fromEntries(['first-contentful-paint', 'largest-contentful-paint', 'total-blocking-time', 'cumulative-layout-shift', 'speed-index'].map(key => [key, lhr.audits[key]?.numericValue]));
    const summary = { name, scores, metrics, failedAudits: Object.entries(lhr.audits).filter(([, audit]) => audit.score !== null && audit.score < 1).map(([id, audit]) => ({ id, title: audit.title, score: audit.score })) };
    summaries.push(summary); console.log(JSON.stringify(summary));
  }
  writeFileSync('artifacts/lighthouse/summary.json', JSON.stringify({ measuredAt: new Date().toISOString(), lighthouseVersion, note: 'Local production fixture, simulated throttling. Not field data, public indexing, or a ranking guarantee.', results: summaries, regressions }, null, 2));
  assert.deepEqual(regressions, [], 'Lighthouse gate: SEO/accessibility/best practices must score 100; performance must score at least 90. See the saved reports.');
} finally {
  await browser.close();
  await new Promise<void>(resolve => server.close(() => resolve()));
}
