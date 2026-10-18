import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { googleAccessToken } from './lib/google-api';
import { collectIndexingCheckpoint, indexingCheckpointMarkdown } from './lib/indexing-checkpoint';

let token = process.env.GOOGLE_ACCESS_TOKEN?.trim();
let authentication: 'available' | 'missing' | 'failed' = token ? 'available' : 'missing';
if (!token && process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim()) {
  try {
    token = await googleAccessToken(process.env.GOOGLE_SERVICE_ACCOUNT_JSON, ['https://www.googleapis.com/auth/webmasters.readonly'], AbortSignal.timeout(25000));
    authentication = token?.trim() ? 'available' : 'failed';
  } catch { authentication = 'failed'; }
}

const report = await collectIndexingCheckpoint(token, authentication);
const markdown = indexingCheckpointMarkdown(report);
const output = 'artifacts/indexing-checkpoint';
mkdirSync(output, { recursive: true });
writeFileSync(`${output}/report.json`, `${JSON.stringify(report, null, 2)}\n`);
writeFileSync(`${output}/report.md`, markdown);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown);
console.log(markdown);
// Exclusion is a recorded Google outcome, not a broken check. Missing evidence or
// live technical issues fail the job after writing the complete partial report.
if (report.technicalFailure) process.exitCode = 1;
