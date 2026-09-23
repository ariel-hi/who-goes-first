import { readRecords } from '../src/lib/content/catalog';
import { ruleSchema } from '../src/lib/content/schema';
import { parseArgs } from 'node:util';
const { values } = parseArgs({ options: { offset: { type: 'string', default: '0' }, limit: { type: 'string', default: '250' } } });
const offset = Number(values.offset), limit = Number(values.limit);
if (!Number.isSafeInteger(offset) || offset < 0 || !Number.isSafeInteger(limit) || limit < 1 || limit > 250) {
  throw new Error('Use --offset <nonnegative integer> and --limit <1–250>.');
}
const records = [...readRecords('src/content/games'), ...readRecords('research/games')].map(record => ruleSchema.parse(record));
const allUrls = [...new Set(records.flatMap(record => record.sources.map(source => source.url)))].sort();
const urls = allUrls.slice(offset, offset + limit);
const findings: { url: string; status: number | string }[] = new Array(urls.length);
// Three workers, 8-second deadline per URL, HEAD only, no retries, 3 redirects.
// A failure reports an issue; it never changes dates, approvals or source content.
async function check(initial: string) {
  let url = initial;
  let status: number | string = 'not checked';
  try {
    const deadline = AbortSignal.timeout(8000);
    for (let redirect = 0; redirect <= 3; redirect++) {
      const response = await fetch(url, { method: 'HEAD', redirect: 'manual', signal: deadline });
      status = response.status;
      if (response.status < 300 || response.status >= 400) break;
      const target = response.headers.get('location');
      if (!target || redirect === 3) { status = 'redirect limit'; break; }
      const next = new URL(target, url);
      if (next.protocol !== 'https:') { status = 'non-HTTPS redirect refused'; break; }
      url = next.href;
    }
  } catch { status = 'network error or deadline'; }
  return { url: initial, status };
}
let next = 0;
await Promise.all(Array.from({ length: Math.min(3, urls.length) }, async () => {
  while (next < urls.length) { const index = next++; findings[index] = await check(urls[index]!); }
}));
const remainingAfterBatch = Math.max(0, allUrls.length - offset - urls.length);
console.log(JSON.stringify({ checkedAt: new Date().toISOString(), totalSources: allUrls.length, offset,
  checked: findings.length, complete: findings.length === allUrls.length, remainingAfterBatch,
  nextCommand: remainingAfterBatch ? `npm run links:check -- --offset ${offset + urls.length} --limit ${limit}` : null,
  findings, note: 'Availability only. A HEAD failure can be server policy; verify manually. No editorial records were changed.' }, null, 2));
if (findings.some(result => typeof result.status !== 'number' || result.status >= 400)) process.exitCode = 1;
