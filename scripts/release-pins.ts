import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { pinQueue } from '../src/lib/pinterest-pins';
import { releaseLedger } from './lib/pinterest-release';

const path = 'research/pinterest/released.txt';
mkdirSync('research/pinterest', { recursive: true });
let previous = '';
try { previous = readFileSync(path, 'utf8'); } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
const next = releaseLedger(previous, pinQueue(), new Date().toISOString().slice(0, 10));
if (next !== previous) writeFileSync(path, next);
console.log(next === previous ? 'No new Pins due.' : 'Updated the unique due-Pin ledger. A feed release is not proof of Pinterest publication.');
