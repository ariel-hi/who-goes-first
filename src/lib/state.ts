import type { Outcome } from './selection';
export type PickerState =
  | { phase: 'editing' | 'ready'; outcome: null }
  | { phase: 'revealing' | 'result'; outcome: Outcome };
export type Action = { type: 'EDIT'; valid: boolean } | { type: 'START'; outcome: Outcome } | { type: 'FINISH'; drawId: number };
export function pickerReducer(state: PickerState, action: Action): PickerState {
  if (action.type === 'EDIT') return state.phase === 'revealing' ? state : { phase: action.valid ? 'ready' : 'editing', outcome: null };
  if (action.type === 'START') return state.phase === 'editing' || state.phase === 'revealing' ? state : { phase: 'revealing', outcome: action.outcome };
  if (action.type === 'FINISH' && state.phase === 'revealing' && state.outcome.drawId === action.drawId) return { phase: 'result', outcome: state.outcome };
  return state;
}
