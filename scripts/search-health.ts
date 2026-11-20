/**
 * Search health monitor. Runs after the weekly growth report and reads the Search Console data that the
 * automation already collects. It writes research/demand/search-health.md and search-health.json, and
 * prints `alerts=<n>` to GITHUB_OUTPUT so the workflow can open, update or close a GitHub issue.
 *
 * Alerts are reserved for things that need attention: a sharp impressions drop, core pages falling out of
 * the index after being indexed, or the data feeds themselves going stale.
 */
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { corePaths, indexedRuleEntries } from '../src/lib/indexing-policy';
import { evaluateSearchHealth, type HealthState } from './lib/search-health';

const read = <T>(path: string): T | undefined => existsSync(path) ? JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, '')) as T : undefined;
const statePath = 'research/demand/search-health.json';
const result = evaluateSearchHealth({
  now: new Date(),
  performance: read('research/demand/search-performance.json'),
  coverage: read('research/demand/indexing-coverage.json'),
  previous: read<HealthState>(statePath),
  corePaths: [...corePaths],
  indexedRules: indexedRuleEntries.length,
});
writeFileSync(statePath, `${JSON.stringify(result.state, null, 2)}\n`);
writeFileSync('research/demand/search-health.md', result.report);
console.log(result.report);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, result.report);
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `alerts=${result.alerts.length}\n`);
