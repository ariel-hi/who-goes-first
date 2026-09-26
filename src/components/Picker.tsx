import { Component, Suspense, lazy, useCallback, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';
import { displayLabel, parseNames, seats, graphemeCount, hasControls } from '../lib/roster';
import { select, type Outcome, type Player } from '../lib/selection';
import { pickerReducer } from '../lib/state';
import { clearPreferences, defaults, readPreferences, writePreferences, type Mode, type Preferences } from '../lib/preferences';
import { analytics } from '../lib/analytics';
import { cleanLink, shareLink } from '../lib/share';
import { playChime } from '../lib/sound';
import { presentations, primaryModes, revealDuration, supportsGroup } from '../lib/presentations';
import { createRevealPlan, playerColor, type RevealPlan } from '../lib/reveal-plan';
import ModeIcon from './ModeIcon';
import PlayerName from './PlayerName';
import RevealLoading from './RevealLoading';

const BalloonRise = lazy(() => import('./modes/BalloonRise'));
const TableReveals = lazy(() => import('./modes/TableReveals'));
class EffectBoundary extends Component<{ children: ReactNode; onFail: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFail(); }
  render() { return this.state.failed ? <p role="status" className="reveal-unavailable">Visual unavailable. The selected player is shown below.</p> : this.props.children; }
}

export default function Picker({ initialMode = 'quick', balloonEnabled = true }: { initialMode?: Mode; balloonEnabled?: boolean }) {
  const [players, setPlayers] = useState<Player[]>(seats(4));
  const [countDraft, setCountDraft] = useState('4');
  const cancelCountCommit = useRef(false);
  const countInput = useRef<HTMLInputElement>(null);
  const heldCountCommit = useRef(false);
  const countPressCleanup = useRef<() => void>(() => {});
  const revealStage = useRef<HTMLDivElement>(null);
  const scrolledDraw = useRef<number | null>(null);
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
  const [moreModes, setMoreModes] = useState(false);
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
  const effectiveMode = supportsGroup(mode, eligible.length) ? mode : 'quick';
  const fallbackLimit = mode !== effectiveMode ? Math.max(...Array.from({ length: 50 }, (_, index) => index + 1).filter(count => supportsGroup(mode, count))) : null;
  const chosenMethod = presentations.find(option => option.id === mode)!;
  // Primary methods first, so opening "More methods" only appends and nothing shifts.
  const available = presentations.filter(option => (balloonEnabled || option.id !== 'balloon') && supportsGroup(option.id, eligible.length))
    .sort((a, b) => Number(!primaryModes.includes(a.id)) - Number(!primaryModes.includes(b.id)));
  // A short first row avoids a wall of choices; a saved or linked method stays visible.
  const showAllModes = moreModes || !primaryModes.includes(effectiveMode) || available.length <= primaryModes.length + 1;
  const winner = state.outcome?.players.find(p => p.id === state.outcome?.winnerId);
  const winnerLabel = winner && state.outcome ? displayLabel(winner, state.outcome.players) : '';

  useEffect(() => {
    setCountDraft(String(players.length));
  }, [players.length]);

  useEffect(() => () => countPressCleanup.current(), []);

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
    if (eventMode.current === 'balloon') {
      try {
        const balloon = document.querySelector<SVGElement>('.balloon-field .survivor>svg:first-child');
        if (balloon) balloon.style.setProperty('--balloon-land-from', getComputedStyle(balloon).transform);
      } catch { /* A decorative landing cannot delay the selected result. */ }
    }
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
    const timer = window.setTimeout(finish, reduced ? 0 : revealDuration(eventMode.current, revealPlan!));
    const interrupted = () => { if (document.hidden) finish(); };
    document.addEventListener('visibilitychange', interrupted);
    window.addEventListener('pagehide', finish);
    return () => { clearTimeout(timer); document.removeEventListener('visibilitychange', interrupted); window.removeEventListener('pagehide', finish); };
  }, [state.phase, finish, reduced, revealPlan]);

  useEffect(() => {
    const outcome = state.outcome;
    if (!outcome || ['quick', 'instant'].includes(eventMode.current) || scrolledDraw.current === outcome.drawId) return;
    scrolledDraw.current = outcome.drawId;
    const frame = requestAnimationFrame(() => {
      const stage = revealStage.current;
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      const margin = 16;
      const available = Math.max(0, Math.min(rect.bottom, innerHeight - margin) - Math.max(rect.top, margin));
      const needed = Math.min(rect.height, innerHeight - margin * 2);
      if (available >= needed * .9) return;
      const top = rect.height > innerHeight - margin * 2 || rect.top < margin
        ? rect.top - margin : rect.bottom - innerHeight + margin;
      window.scrollBy({ top, behavior: reduced ? 'auto' : 'smooth' });
    });
    return () => cancelAnimationFrame(frame);
  }, [state.outcome, reduced]);

  function edited(nextPlayers: Player[], valid = true) {
    if (busy) return;
    locked.current = null; lastStart.current = -Infinity; setPlayers(nextPlayers); setError('');
    dispatch({ type: 'EDIT', valid });
  }
  function editNames(value: string) {
    const next = parseNames(value, players);
    setText(value); edited(next.players, next.errors.length === 0);
  }
  function resizedPlayers(count: number) {
    const next = players.slice(0, count);
    let id = Math.max(0, ...players.map(p => Number(p.id.replace('player-', ''))));
    while (next.length < count) next.push({ id: `player-${++id}`, label: `Seat ${next.length + 1}` });
    return next;
  }
  function resizeGroup(count: number) {
    const next = resizedPlayers(count);
    edited(next); setText(next.map(p => p.label).join('\n'));
  }
  function typeCount(value: string) {
    if (!/^\d{0,2}$/.test(value)) return;
    setCountDraft(value);
  }
  function commitCount() {
    if (cancelCountCommit.current) {
      cancelCountCommit.current = false;
      setCountDraft(String(players.length));
      return;
    }
    const count = Number(countDraft);
    if (count >= 2 && count <= 50) {
      if (count !== players.length) resizeGroup(count);
      setCountDraft(String(count));
    } else setCountDraft(String(players.length));
  }
  function holdCountForPick(button: HTMLButtonElement) {
    if (document.activeElement !== countInput.current) return;
    countPressCleanup.current();
    heldCountCommit.current = true;
    const cleanup = () => {
      window.removeEventListener('click', clicked, true);
      window.removeEventListener('pointercancel', cancelled);
    };
    const cancelled = () => {
      cleanup();
      heldCountCommit.current = false;
      commitCount();
    };
    const clicked = (event: MouseEvent) => {
      cleanup();
      // Wait for the native click target, including delayed mobile taps. A
      // released press outside Pick commits the count without starting a draw.
      if (!button.contains(event.target as Node)) {
        heldCountCommit.current = false;
        commitCount();
      }
    };
    countPressCleanup.current = cleanup;
    window.addEventListener('click', clicked, true);
    window.addEventListener('pointercancel', cancelled);
  }
  function rename(id: string, label: string) {
    setInputMode('names');
    const next = players.map(p => p.id === id ? { ...p, label } : p);
    edited(next, next.every(p => graphemeCount(p.label.trim()) <= 24 && !hasControls(p.label)));
    setText(next.map(p => p.label).join('\n'));
  }
  function pick() {
    if (!hydrated || busy || errors.length || performance.now() - lastStart.current < 450) return;
    const countFocused = document.activeElement === countInput.current;
    const commitDraft = countFocused || heldCountCommit.current;
    const count = Number(countDraft);
    const drawPlayers = commitDraft && count >= 2 && count <= 50 ? resizedPlayers(count) : players;
    // Keep the button in place for the entire pointer press. The completed click
    // commits the count and draws from that same roster, even if the layout grows.
    heldCountCommit.current = false;
    countPressCleanup.current();
    if (countFocused) countInput.current?.blur();
    else if (commitDraft) commitCount();
    const drawEligible = drawPlayers.map((player, index) => ({ ...player, label: player.label.trim() || `Seat ${index + 1}` }));
    const drawingMode = supportsGroup(mode, drawEligible.length) ? mode : 'quick';
    lastStart.current = performance.now();
    try {
      const outcome = select(drawEligible, ++draw.current);
      setRevealPlan(createRevealPlan(outcome));
      locked.current = outcome; eventMode.current = drawingMode;
      setError(''); dispatch({ type: 'START', outcome });
      analytics.emit('pick_started', { mode: drawingMode, policy: 'equal-chance' });
      if (prefs.sound && !document.hidden) void playChime();
      if (drawingMode === 'instant' || reduced) finish();
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
    setShareStatus(result === 'copied' ? 'Link copied.' : result === 'unavailable' ? 'Copy this link:' : '');
    if (result === 'copied' || result === 'shared') analytics.emit('share_completed', { kind: 'tool' });
  }

  const visualMode = !['instant', 'quick'].includes(effectiveMode);
  const preview = visualMode && state.outcome === null && eligible.length >= 2 && errors.length === 0;
  // A deterministic plan supplies the pieces with layout values only. Preview
  // mode suppresses every winner marker and animation; no draw takes place.
  const previewScene = useMemo(() => {
    if (!preview) return null;
    const outcome: Outcome = { drawId: 0, players: eligible, winnerId: eligible[0]!.id, policy: 'equal-chance' };
    return { outcome, plan: createRevealPlan(outcome, () => .5) };
  }, [preview, players]);
  const scene = state.outcome && revealPlan ? { outcome: state.outcome, plan: revealPlan } : previewScene;
  return <section className="picker" aria-label="Starting-player picker" data-phase={state.phase} data-count={eligible.length} data-large={eligible.length > 12} data-reduced={reduced} data-visual={visualMode}>
    {/* Firefox otherwise restores dynamic disabled states before hydration. */}
    <form autoComplete="off" onSubmit={event => event.preventDefault()}>
      <div className="picker-card">
        <fieldset disabled={!hydrated} inert={busy}>
          <legend className="sr-only">Your players</legend>
          <div className="players-heading">
            <div className="roster-tools">
              <button type="button" className="text-button" aria-expanded={bulkOpen} aria-controls={bulkOpen ? 'bulk-names' : undefined} onClick={() => { if (state.phase === 'result') edited(players); setText(players.map(p => p.label).join('\n')); setBulkOpen(!bulkOpen); }}>{bulkOpen ? 'Done' : 'Paste a list'}</button>
            </div>
            <div className="stepper">
              <button type="button" aria-label="Remove a player" disabled={players.length <= 2} onClick={() => resizeGroup(players.length - 1)}>−</button>
              <label className="sr-only" htmlFor="player-count">Player count</label>
              <input ref={countInput} id="player-count" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2} value={countDraft} onChange={e => typeCount(e.target.value)} onBlur={() => { if (!heldCountCommit.current) commitCount(); }} onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur(); if (e.key === 'Escape') { cancelCountCommit.current = true; e.currentTarget.blur(); } }} />
              <button type="button" aria-label="Add a player" disabled={players.length >= 50} onClick={() => resizeGroup(players.length + 1)}>+</button>
            </div>
          </div>
          {bulkOpen && <div className="name-editor" id="bulk-names">
            <label htmlFor="names">Player names <span className="muted small">One per line · up to 24 characters.</span></label>
            <textarea id="names" rows={Math.max(3, players.length)} value={text} onChange={e => { setInputMode('names'); editNames(e.target.value); }} spellCheck={false} aria-invalid={errors.length > 0} aria-describedby="input-errors" />
          </div>}
          <div id="input-errors" className="input-errors">{errors.map(message => <p key={message} className="error" role="alert">{message}</p>)}</div>
          {duplicate && <p className="small notice">Matching names are separate players, marked with # numbers.</p>}
          <ul className={`roster ${eligible.length > 8 ? 'roster-compact' : ''} ${busy && effectiveMode === 'quick' && !reduced ? 'quick-reveal' : ''}`} aria-label="Players in this draw" style={{ '--players': Math.min(eligible.length, 6), '--mobile-players': Math.min(eligible.length, 4), '--tiny-players': Math.min(eligible.length, 3) } as React.CSSProperties}>
            {players.map((player, i) => <li key={player.id} className={state.phase === 'result' && winner?.id === player.id ? 'player winner' : 'player'} style={{ '--seat': i, '--piece': playerColor(player) } as React.CSSProperties}>
              <span className="seat-token" aria-hidden="true">{i + 1}</span>
              <PlayerName player={player} index={i} errors={errors.length > 0} onRename={rename} />
              {duplicate && <span className="duplicate-id">#{player.id.replace('player-', '')}</span>}
              {state.phase === 'result' && winner?.id === player.id && <span className="winner-dot" aria-label="Winner">✓</span>}
            </li>)}
          </ul>
        </fieldset>
        <div className={`result-area ${state.phase === 'result' ? 'has-result' : busy ? 'is-revealing' : 'is-ready'}`}>
          <div role="status" aria-live="polite" aria-atomic="true" className="winner-announcement" data-long={winnerLabel.length > 18}>{busy && <span className="sr-only">Revealing the selected player…</span>}{state.phase === 'result' && winner && <p><bdi>{winnerLabel}</bdi> goes first.</p>}</div>
          {busy && <div className="result-placeholder" data-long={winnerLabel.length > 18} aria-hidden="true"><p><bdi>{winnerLabel}</bdi> goes first.</p></div>}
        </div>
        <fieldset className="reveal-options" disabled={!hydrated} inert={busy}>
          <legend className="sr-only">Choose your reveal</legend>
          <div className="segmented">
            {available.filter(option => showAllModes || primaryModes.includes(option.id)).map(option => <label className={effectiveMode === option.id ? 'selected' : ''} key={option.id}>
              <input type="radio" name="presentation" value={option.id} checked={effectiveMode === option.id} onChange={() => { setMode(option.id); if (state.phase === 'result') { lastStart.current = -Infinity; dispatch({ type: 'EDIT', valid: !errors.length }); } }} />
              <ModeIcon mode={option.id} /><span>{option.label}</span>
            </label>)}
            {!showAllModes && <button type="button" className="more-modes" onClick={e => { const group = e.currentTarget.parentElement!; const shown = group.querySelectorAll('input').length; setMoreModes(true); requestAnimationFrame(() => group.querySelectorAll('input')[shown]?.focus()); }}><span aria-hidden="true">•••</span><span>More methods</span></button>}
          </div>
        </fieldset>
        {fallbackLimit !== null && <p className="small notice">{chosenMethod.label} fits up to {fallbackLimit} players. Quick is selected for your group of {eligible.length}.</p>}
        {error && <p role="alert" className="error">{error}</p>}
        {busy ? <button type="button" className="primary" disabled>Revealing…</button> : <button type="button" className="primary" disabled={!hydrated || errors.length > 0} onPointerDown={event => holdCountForPick(event.currentTarget)} onClick={pick}>{!hydrated ? 'Getting ready…' : state.phase === 'result' ? 'Pick again' : 'Pick a player'}</button>}
        {visualMode && scene && <div ref={revealStage} className="reveal-stage" aria-hidden="true"><EffectBoundary key={`${effectiveMode}-${Math.max(0, (state.outcome?.drawId ?? 1) - 1)}`} onFail={state.outcome ? finish : () => {}}>
          <Suspense fallback={<RevealLoading mode={effectiveMode} players={scene.outcome.players} />}>
            {effectiveMode === 'balloon' ? <BalloonRise outcome={scene.outcome} plan={scene.plan} settled={state.phase === 'result'} preview={preview} /> : <TableReveals outcome={scene.outcome} plan={scene.plan} settled={state.phase === 'result'} mode={effectiveMode as 'spinner' | 'cards' | 'tower' | 'straws' | 'dice' | 'coin' | 'shells'} preview={preview} />}
          </Suspense>
        </EffectBoundary></div>}
      </div>
      <div className="picker-utilities"><button type="button" className="text-button" onClick={() => setSettingsOpen(!settingsOpen)} aria-expanded={settingsOpen} aria-controls="picker-settings" disabled={!hydrated} inert={busy}>Preferences</button><a href="/fairness/">Equal chances</a><button type="button" className="text-button" disabled={!hydrated} onClick={() => void share()}>Share</button></div>
      <div role="status" className="small muted share-status">{shareStatus}{manualLink && <input readOnly aria-label="Clean sharing link" value={manualLink} onFocus={e => e.target.select()} />}</div>
      {settingsOpen && <fieldset id="picker-settings" className="settings" inert={busy}>
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
