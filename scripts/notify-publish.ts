import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { assertPublishedCandidate, changedPublishedPages, latestAcknowledgedPages, publishedDigestAlgorithm, publishedPages, unacknowledgedPublishedPages } from './lib/publish-pages';
import { notifyChangedPages, type SubmissionReceipt } from './lib/indexnow';

const [before, after, mode] = process.argv.slice(2);
if (!before || !after || (mode && mode !== '--send')) throw new Error('Usage: notify-publish.ts BEFORE_BUILD AFTER_BUILD [--send]');
const snapshot = 'artifacts/indexnow/published-pages.json';
const baseline = existsSync(snapshot) ? new Map(JSON.parse(readFileSync(snapshot, 'utf8')) as [string, string][]) : publishedPages(before);
const current = publishedPages(after);
const validateCandidate = (url: string, html: string) => assertPublishedCandidate(current, url, html);
const urls = changedPublishedPages(baseline, current);
const ledger = 'artifacts/indexnow/receipts.jsonl';
const previous = existsSync(ledger) ? readFileSync(ledger, 'utf8').trim().split('\n').filter(Boolean).flatMap(line => {
  const receipt = JSON.parse(line) as SubmissionReceipt;
  return receipt.status ? receipt.pages : [];
}) : [];
const key = readFileSync('public/indexnow-key.txt', 'utf8').trim();
console.log(`${urls.length} new or materially changed indexable pages.`);
for (let offset = 0; offset < urls.length; offset += 20) {
  const batch = urls.slice(offset, offset + 20);
  // Preflight each page; skip an acknowledged identical live page on a rerun.
  const plan = await notifyChangedPages(batch, key, false, [], fetch, validateCandidate);
  const fresh = unacknowledgedPublishedPages(plan.pages, previous, current);
  if (!fresh.length) continue;
  if (mode !== '--send') { console.log(JSON.stringify({ urls: fresh, sent: false })); continue; }
  const receipt = await notifyChangedPages(fresh, key, true, latestAcknowledgedPages(previous), fetch, validateCandidate);
  // Record editorial acknowledgments only after live validation and accepted POST.
  receipt.pages = receipt.pages.map(page => ({ ...page, editorialDigest: current.get(page.url)!, editorialDigestAlgorithm: publishedDigestAlgorithm }));
  mkdirSync('artifacts/indexnow', { recursive: true });
  appendFileSync(ledger, `${JSON.stringify(receipt)}\n`);
  previous.push(...receipt.pages);
  console.log(`IndexNow HTTP ${receipt.status}: ${fresh.length} URLs received. Indexing is not guaranteed.`);
}
// The first run starts from the verified production baseline, not the historical catalog.
// Later releases compare with the last acknowledged snapshot, including all
// commits in a push and meaningful changes from a superseded deployment.
if (mode === '--send') {
  mkdirSync('artifacts/indexnow', { recursive: true });
  writeFileSync(snapshot, `${JSON.stringify([...current])}\n`);
}
