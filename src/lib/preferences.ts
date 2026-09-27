import { z } from 'zod/mini';
import { graphemeCount, hasControls } from './roster';
// Avoid even Zod's caught eval-capability probe under the site's strict CSP.
// Preference records are tiny; the runtime parser needs no generated code.
z.config({ jitless: true });
export const modes = ['instant', 'quick', 'balloon', 'spinner', 'cards', 'tower', 'straws', 'dice', 'coin', 'shells'] as const;
export type Mode = typeof modes[number];
export const storageKey = 'wgf:preferences:v1';
const player = z.strictObject({
  id: z.string().check(z.regex(/^player-\d+$/)),
  label: z.string().check(z.minLength(1), z.maxLength(500), z.refine<string>(s => s.trim() === s && graphemeCount(s) <= 24 && !hasControls(s))),
});
const record = z.strictObject({
  version: z.literal(1), remember: z.boolean(), roster: z.nullable(z.array(player).check(z.minLength(2), z.maxLength(50))),
  inputMode: z.enum(['seats', 'names']), mode: z.catch(z.enum(modes), 'quick'),
  sound: z.boolean(), motion: z.enum(['system', 'reduce']),
});
const schema = record.check(z.refine<z.infer<typeof record>>(p => !p.roster || new Set(p.roster.map(x => x.id)).size === p.roster.length))
  .check(z.refine<z.infer<typeof record>>(p => p.remember || p.roster === null));
export type Preferences = z.infer<typeof schema>;
export const defaults: Preferences = { version: 1, remember: false, roster: null, inputMode: 'seats', mode: 'quick', sound: false, motion: 'system' };
export interface StoragePort { getItem(key: string): string | null; setItem(key: string, value: string): void; removeItem(key: string): void }
export function readPreferences(storage: StoragePort): { value: Preferences; warning: string } {
  try {
    const text = storage.getItem(storageKey);
    if (!text) return { value: { ...defaults }, warning: '' };
    if (text.length > 35000) throw new Error('Too large');
    const raw: unknown = JSON.parse(text);
    const value = schema.parse(raw);
    const changedMode = (raw as { mode: string }).mode !== value.mode;
    return { value, warning: changedMode ? 'Your saved reveal is unavailable. Quick is selected.' : '' };
  } catch {
    try { storage.removeItem(storageKey); } catch { /* memory-only is safe */ }
    return { value: { ...defaults }, warning: 'Saved settings could not be read. You can keep playing on this page.' };
  }
}
export function writePreferences(storage: StoragePort, value: Preferences): boolean {
  try { storage.setItem(storageKey, JSON.stringify(schema.parse(value))); return true; } catch { return false; }
}
export function clearPreferences(storage: StoragePort): boolean {
  try { storage.removeItem(storageKey); return true; } catch { return false; }
}
