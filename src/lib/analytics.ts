import { modes, type Mode } from './preferences';
type Contexts = {
  picker_ready: { count: '2–4' | '5–12' | '13–50'; input: 'seats' | 'names' };
  pick_started: { mode: Mode; policy: 'equal-chance' };
  pick_completed: { mode: Mode; duration: 'instant' | 'short' | 'long' };
  share_completed: { kind: 'tool' | 'page' };
  rule_to_picker: { gameId: string };
  rule_source_opened: { gameId: string };
};
export interface AnalyticsPort { emit<K extends keyof Contexts>(event: K, context: Contexts[K]): void }
export function createAnalytics(sink?: (event: string, context: Record<string, string>) => void, publicGameIds: ReadonlySet<string> = new Set()): AnalyticsPort {
  return { emit(event, context) {
    if (!sink) return;
    const data = context as unknown as Record<string, unknown>;
    const allowlists: Record<string, Record<string, readonly string[]>> = {
      picker_ready: { count: ['2–4', '5–12', '13–50'], input: ['seats', 'names'] },
      pick_started: { mode: modes, policy: ['equal-chance'] },
      pick_completed: { mode: modes, duration: ['instant', 'short', 'long'] },
      share_completed: { kind: ['tool', 'page'] },
      rule_to_picker: { gameId: [...publicGameIds] }, rule_source_opened: { gameId: [...publicGameIds] },
    };
    const allowed = allowlists[event]; if (!allowed) return;
    const clean: Record<string, string> = {};
    for (const [key, values] of Object.entries(allowed)) { const value = data[key]; if (typeof value !== 'string' || !values.includes(value)) return; clean[key] = value; }
    try { sink(event, clean); } catch { /* telemetry must never affect a draw */ }
  } };
}
// No sink is configured. Enabling one requires owner approval and a privacy review.
export const analytics = createAnalytics();
