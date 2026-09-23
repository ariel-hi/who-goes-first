import { Component, Suspense, lazy, useCallback, useEffect, useReducer, useRef, useState, type ReactNode } from 'react';
import { displayLabel, parseNames, seats, graphemeCount, hasControls } from '../lib/roster';
import { select, type Outcome, type Player } from '../lib/selection';
import { pickerReducer } from '../lib/state';
import { clearPreferences, defaults, readPreferences, writePreferences, type Mode, type Preferences } from '../lib/preferences';
import { analytics } from '../lib/analytics';
import { cleanLink, shareLink } from '../lib/share';
import { playChime } from '../lib/sound';
import { presentations, revealHints } from '../lib/presentations';
import { createRevealPlan, playerColor, type RevealPlan } from '../lib/reveal-plan';
import ModeIcon from './ModeIcon';
import PlayerName from './PlayerName';

const BalloonRise = lazy(() => import('./modes/BalloonRise'));
const TableReveals = lazy(() => import('./modes/TableReveals'));
class EffectBoundary extends Component<{ children: ReactNode; onFail: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFail(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export default function Picker({ initialMode = 'quick', balloonEnabled = true }: { initialMode?: Mode; balloonEnabled?: boolean }) {
  const [players, setPlayers] = useState<Player[]>(seats(4));
  const [text, setText] = useState('');
  const [inputMode, setInputMode] = useState<'seats' | 'names'>('seats');
  const [mode, setMode] = useState<Mode>(initialMode);
  const [prefs, setPrefs] = useState<Preferences>({ ...defaults, mode: initialMode });
  const [hydrated, setHydrated] = useState(false);
  const [systemReduced, setSystemReduced] = useState(false);
  const [warning, setWarning] = useState('');
  const [error, setError] = useState('');
  const [shareStatus, setShareStatus] = useState('');
  const [manualLink, setManualLink] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [revealPlan, setRevealPlan] = useState<RevealPlan | null>(null);
  const [state, dispatch] = useReducer(pickerReducer, { phase: 'ready', outcome: null });
  const draw = useRef(0);
  const locked = useRef<Outcome | null>(null);
  const completed = useRef<number | null>(null);
  const completionSent = useRef<number | null>(null);
  const lastStart = useRef(-Infinity);
  const eventMode = useRef<Mode>(initialMode);
  const readySent = useRef(false);
  const eligible = players.map((p, i) => ({ ...p, label: p.label.trim() || `Seat ${i + 1}` }));
  const checked = parseNames(eligible.map(p => p.label).join('\n'), eligible);
  const errors = checked.errors;
  const duplicate = new Set(eligible.map(p => p.label)).size !== eligible.length;
  const reduced = systemReduced || prefs.motion === 'reduce';
  const busy = state.phase === 'revealing';
  const effectiveMode = eligible.length > 12 ? 'instant' : mode;
  const winner = state.outcome?.players.find(p => p.id === state.outcome?.winnerId);

  useEffect(() => {
    try {
      const saved = readPreferences(window.localStorage);
      setPrefs(saved.value); setWarning(saved.warning);
      const restoredMode = initialMode !== 'quick' ? initialMode : saved.value.mode;
      setMode(restoredMode === 'balloon' && !balloonEnabled ? 'quick' : restoredMode);
      if (restoredMode === 'balloon' && !balloonEnabled) setWarning('Balloon Rise is temporarily unavailable. Quick is selected.');
      if (saved.value.remember && saved.value.roster) {
        setPlayers(saved.value.roster); setInputMode(saved.value.inputMode);
        setText(saved.value.roster.map(p => p.label).join('\n'));
      }
    } catch { setWarning('Local storage is unavailable. You can keep playing on this page.'); }
    setHydrated(true);
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setSystemReduced(media.matches);
    const changed = () => setSystemReduced(media.matches);
    media.addEventListener('change', changed);
    return () => media.removeEventListener('change', changed);
  }, [initialMode, balloonEnabled]);

  useEffect(() => {
    if (!hydrated) return;
    // Never save an invalid partial edit, and never retain an older group after
    // the current input becomes invalid. The text remains in memory for correction.
    const valid = players.length >= 2 && players.length <= 50 && players.every(p => graphemeCount(p.label.trim()) <= 24 && !hasControls(p.label));
    const next: Preferences = { ...prefs, mode, inputMode, roster: prefs.remember && valid ? players.map((p, i) => ({ ...p, label: p.label.trim() || `Seat ${i + 1}` })) : null };
    try {
      if (!writePreferences(window.localStorage, next)) setWarning('This browser could not save your changes. They will last only on this page.');
    } catch { setWarning('Local storage is unavailable. Changes will last only on this page.'); }
  }, [hydrated, players, text, inputMode, mode, prefs]);

  useEffect(() => {
    if (hydrated && !readySent.current && eligible.length >= 2 && errors.length === 0) {
      readySent.current = true;
      analytics.emit('picker_ready', { count: eligible.length <= 4 ? '2–4' : eligible.length <= 12 ? '5–12' : '13–50', input: inputMode });
    }
  }, [hydrated, eligible.length, errors.length, inputMode]);

  const finish = useCallback(() => {
    const outcome = locked.current;
    if (!outcome || completed.current === outcome.drawId) return;
    completed.current = outcome.drawId;
    dispatch({ type: 'FINISH', drawId: outcome.drawId });
  }, []);

  useEffect(() => {
    if (state.phase !== 'result' || completionSent.current === state.outcome.drawId) return;
    completionSent.current = state.outcome.drawId;
    analytics.emit('pick_completed', { mode: eventMode.current, duration: eventMode.current === 'instant' ? 'instant' : eventMode.current === 'quick' ? 'short' : 'long' });
  }, [state]);

  useEffect(() => {
    if (state.phase !== 'revealing') return;
    const timer = window.setTimeout(finish, reduced ? 0 : presentations.find(item => item.id === eventMode.current)!.duration);
    const interrupted = () => { if (document.hidden) finish(); };
    document.addEventListener('visibilitychange', interrupted);
    window.addEventListener('pagehide', finish);
    return () => { clearTimeout(timer); document.removeEventListener('visibilitychange', interrupted); window.removeEventListener('pagehide', finish); };
  }, [state.phase, finish, reduced]);

  function edited(nextPlayers: Player[], valid = true) {
    if (busy) return;
    locked.current = null; setPlayers(nextPlayers); setError('');
    dispatch({ type: 'EDIT', valid });
  }
  function editNames(value: string) {
    const next = parseNames(value, players);
    setText(value); edited(next.players, next.errors.length === 0);
  }
  function resizeGroup(count: number) {
    const next = players.slice(0, count);
    let id = Math.max(0, ...players.map(p => Number(p.id.replace('player-', ''))));
    while (next.length < count) next.push({ id: `player-${++id}`, label: `Seat ${next.length + 1}` });
    edited(next); setText(next.map(p => p.label).join('\n'));
  }
  function rename(id: string, label: string) {
    setInputMode('names');
    const next = players.map(p => p.id === id ? { ...p, label } : p);
    edited(next, next.every(p => graphemeCount(p.label.trim()) <= 24 && !hasControls(p.label)));
    setText(next.map(p => p.label).join('\n'));
  }
  function pick() {
    if (!hydrated || busy || errors.length || performance.now() - lastStart.current < 450) return;
    lastStart.current = performance.now();
    try {
      const outcome = select(eligible, ++draw.current);
      setRevealPlan(createRevealPlan(outcome));
      locked.current = outcome; eventMode.current = effectiveMode;
      setError(''); dispatch({ type: 'START', outcome });
      analytics.emit('pick_started', { mode: effectiveMode, policy: 'equal-chance' });
      if (prefs.sound && !document.hidden) void playChime();
      if (effectiveMode === 'instant' || reduced) finish();
    } catch {
      setError('Secure randomness is unavailable. No player was selected. Try again, or reload this page.');
      locked.current = null;
    }
  }
  function forget() {
    let cleared = false;
    try { cleared = clearPreferences(window.localStorage); } catch { /* explained below */ }
    setPrefs({ ...prefs, remember: false, roster: null });
    setText(''); setInputMode('seats'); setBulkOpen(false); edited(seats(4));
    setWarning(cleared ? 'This group has been forgotten.' : 'The group is cleared from this page. Storage is blocked; clear this site’s data in your browser to remove any older saved group.');
  }
  async function share() {
    const url = cleanLink(window.location.href);
    const result = await shareLink(url);
    setManualLink(result === 'unavailable' ? url : '');
    setShareStatus(result === 'copied' ? 'Link copied.' : result === 'shared' ? 'Link shared.' : result === 'cancelled' ? '' : 'Copy this link:');
    if (result === 'copied' || result === 'shared') analytics.emit('share_completed', { kind: 'tool' });
  }

  const animated = state.outcome !== null && !reduced && !['instant', 'quick'].includes(effectiveMode);
  const fullStage = animated;
  return <section className="picker" aria-label="Starting-player picker" data-phase={state.phase} data-count={eligible.length} data-large={eligible.length > 12}>
    {/* Firefox otherwise restores dynamic disabled states before hydration. */}
    <form autoComplete="off" onSubmit={event => event.preventDefault()}>
      <div className="picker-card">
        <fieldset disabled={busy || !hydrated}>
          <legend className="sr-only">Your players</legend>
          <div className="players-heading">
            <span className="field-label">{eligible.length} at the table</span>
            <div className="stepper">
              <button type="button" aria-label="Remove a player" disabled={players.length <= 2} onClick={() => resizeGroup(players.length - 1)}>−</button>
              <label className="sr-only" htmlFor="player-count">Player count</label>
              <select id="player-count" value={players.length} onChange={e => resizeGroup(Number(e.target.value))}>{Array.from({ length: 49 }, (_, i) => <option key={i + 2} value={i + 2}>{i + 2}</option>)}</select>
              <button type="button" aria-label="Add a player" disabled={players.length >= 50} onClick={() => resizeGroup(players.length + 1)}>+</button>
            </div>
          </div>
          <div className="roster-tools" style={{ visibility: busy ? 'hidden' : 'visible' }}>
            {fullStage ? <button type="button" className="text-button" onClick={() => edited(players)}>Edit players</button> : <span>Tap a name to edit.</span>}
            <button type="button" className="text-button" aria-expanded={bulkOpen && !fullStage} aria-controls={bulkOpen && !fullStage ? 'bulk-names' : undefined} onClick={() => { if (fullStage) edited(players); setText(players.map(p => p.label).join('\n')); setBulkOpen(fullStage || !bulkOpen); }}>{bulkOpen && !fullStage ? 'Done' : 'Paste a list'}</button>
          </div>
          {bulkOpen && !fullStage && <div className="name-editor" id="bulk-names">
            <label htmlFor="names">Player names <span className="muted small">One per line · up to 24 characters.</span></label>
            <textarea id="names" rows={Math.max(3, players.length)} value={text} onChange={e => { setInputMode('names'); editNames(e.target.value); }} spellCheck={false} aria-invalid={errors.length > 0} aria-describedby="input-errors" />
          </div>}
          <div id="input-errors" className="input-errors">{errors.map(message => <p key={message} className="error" role="alert">{message}</p>)}</div>
          {duplicate && <p className="small notice">Matching names are separate players, marked with # numbers.</p>}
          {!fullStage && <ul className={`roster ${eligible.length > 8 ? 'roster-compact' : ''} ${busy && effectiveMode === 'quick' && !reduced ? 'quick-reveal' : ''}`} aria-label="Players in this draw" style={{ '--players': Math.min(eligible.length, 6), '--mobile-players': Math.min(eligible.length, 4), '--tiny-players': Math.min(eligible.length, 3) } as React.CSSProperties}>
            {players.map((player, i) => <li key={player.id} className={state.phase === 'result' && winner?.id === player.id ? 'player winner' : 'player'} style={{ '--seat': i, '--piece': playerColor(player) } as React.CSSProperties}>
              <span className="seat-token" aria-hidden="true">{i + 1}</span>
              <PlayerName player={player} index={i} errors={errors.length > 0} onRename={rename} />
              {duplicate && <span className="duplicate-id">#{player.id.replace('player-', '')}</span>}
              {state.phase === 'result' && winner?.id === player.id && <span className="winner-dot" aria-label="Winner">✓</span>}
            </li>)}
          </ul>}
        </fieldset>
        {animated && state.outcome && revealPlan && <EffectBoundary key={state.outcome.drawId} onFail={finish}>
          <Suspense fallback={<div className="reveal-loading">One moment…</div>}>
            {effectiveMode === 'balloon' ? <BalloonRise outcome={state.outcome} plan={revealPlan} settled={!busy} /> : <TableReveals outcome={state.outcome} plan={revealPlan} settled={!busy} mode={effectiveMode as 'spinner' | 'cards' | 'tower' | 'straws' | 'dice' | 'race'} />}
          </Suspense>
        </EffectBoundary>}
        <div className={`result-area ${state.phase === 'result' ? 'has-result' : busy ? 'is-revealing' : 'is-ready'}`}>
          <div role="status" aria-live="polite" aria-atomic="true" className="winner-announcement">{state.phase === 'result' && winner && <p><bdi>{displayLabel(winner, state.outcome.players)}</bdi> goes first.</p>}</div>
          {busy && <p className="result-hint" aria-hidden="true">{revealHints[effectiveMode]}</p>}
        </div>
        <fieldset className="reveal-options" disabled={busy || !hydrated}>
          <legend className="sr-only">Choose your reveal</legend>
          <div className="segmented">
            {presentations.filter(option => balloonEnabled || option.id !== 'balloon').map(option => <label className={effectiveMode === option.id ? 'selected' : ''} key={option.id}>
              <input type="radio" name="presentation" value={option.id} checked={effectiveMode === option.id} disabled={eligible.length > 12 && option.id !== 'instant'} onChange={() => { setMode(option.id); if (state.phase === 'result') dispatch({ type: 'EDIT', valid: !errors.length }); }} />
              <ModeIcon mode={option.id} /><span>{option.label}</span>
            </label>)}
          </div>
        </fieldset>
        {(eligible.length > 12 || reduced) && <p className="mode-note small muted">{eligible.length > 12 ? '13+ players: Instant keeps everyone in the draw.' : 'Reduced motion · instant results'}</p>}
        {error && <p role="alert" className="error">{error}</p>}
        {busy ? <button type="button" className="primary" onClick={finish}>Show result now</button> : <button type="button" className="primary" disabled={!hydrated || errors.length > 0} onClick={pick}>{!hydrated ? 'Getting ready…' : state.phase === 'result' ? 'Pick again' : 'Pick a player'}</button>}
      </div>
      <div className="picker-utilities"><button type="button" className="text-button" onClick={() => setSettingsOpen(!settingsOpen)} aria-expanded={settingsOpen} aria-controls="picker-settings" disabled={busy || !hydrated}>Preferences</button><a href="/fairness/">Equal chances</a><button type="button" className="text-button" disabled={!hydrated} onClick={() => void share()}>Share</button></div>
      <div role="status" className="small muted share-status">{shareStatus}{manualLink && <input readOnly aria-label="Clean sharing link" value={manualLink} onFocus={e => e.target.select()} />}</div>
      {settingsOpen && <fieldset id="picker-settings" className="settings" disabled={busy}>
        <legend className="sr-only">Preferences</legend>
        <label className="check-row"><input type="checkbox" checked={prefs.remember} onChange={e => setPrefs({ ...prefs, remember: e.target.checked, roster: null })} /><span>Remember this group<small>Saved only on this device.</small></span></label>
        <label className="check-row"><input type="checkbox" checked={prefs.sound} onChange={e => setPrefs({ ...prefs, sound: e.target.checked })} /><span>Soft sound</span></label>
        <label className="check-row"><input type="checkbox" checked={prefs.motion === 'reduce'} onChange={e => setPrefs({ ...prefs, motion: e.target.checked ? 'reduce' : 'system' })} /><span>Reduce motion</span></label>
        <div className="settings-actions"><button type="button" className="text-button" onClick={forget}>Forget this group</button><button type="button" className="text-button" onClick={() => { setPrefs({ ...defaults }); setMode(initialMode); setWarning('Preferences reset. This group is no longer saved.'); }}>Reset settings</button></div>
      </fieldset>}
      {warning && <p className="small notice" role="status">{warning}</p>}
    </form>
  </section>;
}
