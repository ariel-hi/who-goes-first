import { existsSync, readFileSync, mkdirSync, appendFileSync } from 'node:fs';
import { notifyChangedPages, type SubmissionReceipt } from './lib/indexnow';
const args = process.argv.slice(2);
if (!args.length || args.includes('--help')) {
  console.log('Preview: npm run search:notify -- /path/ [/another/path/]\nSend after a verified production content release: npm run search:notify -- --send /path/\nOnly select meaningfully added or updated public pages. No automatic retries.');
} else {
  try {
    if (args.some(arg => arg.startsWith('--') && arg !== '--send' && arg !== '--dry-run') || (args.includes('--send') && args.includes('--dry-run'))) throw new Error('Use --send or --dry-run and explicit public paths.');
    const ledger = 'artifacts/indexnow/receipts.jsonl';
    const previous = existsSync(ledger) ? readFileSync(ledger, 'utf8').split('\n').filter(Boolean).flatMap(line => { const receipt = JSON.parse(line) as SubmissionReceipt; return receipt.status === 200 || receipt.status === 202 ? receipt.pages : []; }) : [];
    const report = await notifyChangedPages(args.filter(arg => !arg.startsWith('--')), readFileSync('public/indexnow-key.txt', 'utf8').trim(), args.includes('--send'), previous);
    if (report.status) { mkdirSync('artifacts/indexnow', { recursive: true }); appendFileSync(ledger, `${JSON.stringify(report)}\n`); }
    console.log(JSON.stringify(report, null, 2));
    console.log(report.status === 200 ? 'Received by IndexNow; indexing and traffic are unproven.' : report.status === 202 ? 'Received; IndexNow key validation is pending. Indexing and traffic are unproven.' : 'Dry run only. No notification was sent.');
  } catch (error) { console.error(error instanceof Error ? error.message : 'Search notification failed.'); process.exitCode = 1; }
}
