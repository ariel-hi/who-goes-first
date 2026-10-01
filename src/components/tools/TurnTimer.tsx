import { useEffect, useRef, useState } from 'react';

const PRESETS = [30, 60, 90, 120, 180];
const label = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

// A short beep from the Web Audio API; silently skipped where audio is unavailable.
function beep() {
  try {
    const context = new AudioContext();
    const tone = context.createOscillator();
    const gain = context.createGain();
    tone.frequency.value = 880; gain.gain.value = 0.15;
    tone.connect(gain).connect(context.destination);
    tone.start(); tone.stop(context.currentTime + 0.4);
    tone.onended = () => context.close();
  } catch { /* no audio */ }
}

export default function TurnTimer() {
  const [length, setLength] = useState(60);
  const [left, setLeft] = useState(60);
  const [running, setRunning] = useState(false);
  const end = useRef(0);
  useEffect(() => {
    if (!running) return;
    const tick = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((end.current - Date.now()) / 1000));
      setLeft(remaining);
      if (remaining === 0) { setRunning(false); beep(); navigator.vibrate?.(300); }
    }, 200);
    return () => clearInterval(tick);
  }, [running]);
  const start = () => { end.current = Date.now() + (left > 0 ? left : length) * 1000; if (left === 0) setLeft(length); setRunning(true); };
  const restart = () => { end.current = Date.now() + length * 1000; setLeft(length); setRunning(true); };
  const choose = (seconds: number) => { setRunning(false); setLength(seconds); setLeft(seconds); };
  return (
    <div className="timer-tool">
      <div className="tool-options" role="group" aria-label="Timer length">
        {PRESETS.map(n => <button key={n} type="button" aria-pressed={length === n} onClick={() => choose(n)}>{label(n)}</button>)}
      </div>
      <p className={`tool-result tool-big-number${left === 0 ? ' timer-done' : ''}`} role="timer" aria-live={left === 0 ? 'assertive' : 'off'}>{left === 0 ? 'Time!' : label(left)}</p>
      <div className="timer-bar" aria-hidden="true"><span style={{ width: `${(left / length) * 100}%` }} /></div>
      <button type="button" className="primary" onClick={running ? restart : start}>{running ? 'Next player: restart' : left === 0 || left === length ? 'Start' : 'Resume'}</button>
      {running && <button type="button" className="text-button" onClick={() => setRunning(false)}>Pause</button>}
    </div>
  );
}
