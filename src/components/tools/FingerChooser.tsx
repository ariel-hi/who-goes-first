import { useCallback, useEffect, useRef, useState } from 'react';
import { randomCollectionIndex } from '../../lib/selection';
import { shuffle } from '../../lib/tools';

type Finger = { x: number; y: number; color: string };
type Placed = Finger & { id: number; rank?: number };
type Phase = 'waiting' | 'counting' | 'done';
type Mode = 'first' | 'order';
const colors = ['#e4572e', '#2e86ab', '#f2a541', '#6a4c93', '#3bb273', '#e84393', '#17bebb', '#8d6a9f', '#c0ca33', '#ff7f11'];
const settleMs = 2000;

// Pointer events give one id per finger on touch screens. The draw uses the
// same secure source as the picker; timing and finger position never affect it.
export default function FingerChooser() {
  const area = useRef<HTMLDivElement>(null);
  const fingers = useRef(new Map<number, Finger>());
  const timer = useRef<number | undefined>(undefined);
  const [, setTick] = useState(0);
  const [phase, setPhase] = useState<Phase>('waiting');
  const [mode, setMode] = useState<Mode>('first');
  // Results are a snapshot so they stay readable after everyone lifts.
  const [result, setResult] = useState<Placed[]>([]);
  const [touchCapable, setTouchCapable] = useState(true);
  const phaseRef = useRef(phase); phaseRef.current = phase;
  const modeRef = useRef(mode); modeRef.current = mode;
  const render = () => setTick(tick => tick + 1);

  useEffect(() => {
    setTouchCapable(navigator.maxTouchPoints > 0 || matchMedia('(any-pointer: coarse)').matches);
    return () => clearTimeout(timer.current);
  }, []);

  const pick = useCallback(() => {
    const ids = [...fingers.current.keys()];
    if (ids.length < 2) { setPhase('waiting'); return; }
    const order = modeRef.current === 'first' ? [ids[randomCollectionIndex(ids.length)]!] : shuffle(ids);
    const ranks = new Map(order.map((id, index) => [id, index + 1]));
    setResult([...fingers.current.entries()].map(([id, finger]) => ({ ...finger, id, rank: ranks.get(id) })));
    setPhase('done');
    navigator.vibrate?.(60);
  }, []);

  const rearm = useCallback(() => {
    clearTimeout(timer.current);
    if (phaseRef.current === 'done') return;
    if (fingers.current.size >= 2) { setPhase('counting'); timer.current = window.setTimeout(pick, settleMs); }
    else setPhase('waiting');
  }, [pick]);

  const position = (event: React.PointerEvent) => {
    const box = area.current!.getBoundingClientRect();
    return { x: event.clientX - box.left, y: event.clientY - box.top };
  };
  const down = (event: React.PointerEvent) => {
    event.preventDefault();
    if (phaseRef.current === 'done') {
      if (fingers.current.size > 0) return;
      setResult([]); phaseRef.current = 'waiting'; setPhase('waiting');
    }
    const used = new Set([...fingers.current.values()].map(finger => finger.color));
    fingers.current.set(event.pointerId, { ...position(event), color: colors.find(color => !used.has(color)) ?? colors[fingers.current.size % colors.length]! });
    render(); rearm();
  };
  const move = (event: React.PointerEvent) => {
    const finger = fingers.current.get(event.pointerId);
    if (!finger) return;
    Object.assign(finger, position(event)); render();
  };
  const up = (event: React.PointerEvent) => {
    if (!fingers.current.delete(event.pointerId)) return;
    render(); rearm();
  };

  const count = fingers.current.size;
  const status = phase === 'done'
    ? (mode === 'first' ? 'Chosen! The highlighted finger goes first.' : 'Turn order is set.') + (count > 0 ? ' Lift your fingers to see it clearly.' : ' Touch the screen to play again.')
    : phase === 'counting' ? `${count} fingers. Hold still…`
    : count === 1 ? 'One finger down. Waiting for at least one more…'
    : 'Everyone put one finger on the screen and hold still.';

  return (
    <div className="finger-tool">
      {!touchCapable ? (
        <section className="finger-handoff" aria-labelledby="finger-handoff-title">
          <div className="finger-handoff-qr">
            <img src="/finger-chooser-qr.svg" width="160" height="160" alt="Scan to open the finger chooser on your phone" />
          </div>
          <div className="finger-handoff-copy">
            <h2 id="finger-handoff-title">Bring everyone to the screen</h2>
            <p>Scan with your phone camera, then place the phone in the middle of the table. Everyone can put a finger down to pick who starts or set the full turn order.</p>
            <a className="finger-handoff-address" href="https://whogoesfirst.fun/finger-chooser/">whogoesfirst.fun/finger-chooser</a>
          </div>
          <a className="primary finger-handoff-picker" href="/">Use the first-player picker on this computer <span aria-hidden="true">→</span></a>
        </section>
      ) : <>
      <div className="tool-options" role="group" aria-label="What to choose">
        <button type="button" aria-pressed={mode === 'first'} onClick={() => { setMode('first'); setResult([]); setPhase('waiting'); }} disabled={phase === 'counting' || count > 0}>First player</button>
        <button type="button" aria-pressed={mode === 'order'} onClick={() => { setMode('order'); setResult([]); setPhase('waiting'); }} disabled={phase === 'counting' || count > 0}>Full turn order</button>
      </div>
      <div
        ref={area}
        className={`finger-area finger-${phase}`}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onLostPointerCapture={up}
        onContextMenu={event => event.preventDefault()}
        aria-describedby="finger-status"
      >
        {count === 0 && <p className="finger-hint" aria-hidden="true">Touch here</p>}
        {phase === 'done' && mode === 'first' && result.filter(dot => dot.rank).map(dot => <span key="spot" className="finger-spot" style={{ left: dot.x, top: dot.y }} />)}
        {(phase === 'done' ? result : [...fingers.current.entries()].map(([id, finger]): Placed => ({ ...finger, id }))).map(({ id, x, y, color, rank }) => {
          const state = phase !== 'done' ? '' : mode === 'first' ? (rank ? ' finger-winner' : ' finger-out') : ' finger-ranked';
          return (
            <span key={id} className={`finger-dot${state}`} style={{ left: x, top: y, '--finger': color, '--i': (rank ?? 1) - 1 } as React.CSSProperties}>
              {phase === 'done' && mode === 'order' && rank && <b>{rank}</b>}
            </span>
          );
        })}
      </div>
      <p id="finger-status" className="tool-status" role="status" aria-live="polite">{status}</p>
      </>}
    </div>
  );
}
