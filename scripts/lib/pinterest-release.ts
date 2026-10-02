import type { QueuedPin } from '../../src/lib/pinterest-pins';

/** Catch up due items once, retaining the original date and stable Pin ID. */
export function releaseLedger(previous: string, pins: Pick<QueuedPin, 'date' | 'id'>[], today: string): string {
  const lines = new Set(previous.split(/\r?\n/).map(line => line.trim()).filter(Boolean));
  for (const pin of pins) if (pin.date <= today) lines.add(`${pin.date} ${pin.id}`);
  return [...lines].join('\n') + (lines.size ? '\n' : '');
}
