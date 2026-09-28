import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { flipCoin, type Side } from '../../lib/tools';

const FLIP_DURATION = 1800;
const initialMotion = { start: 0, end: 0, startTilt: -5, endTilt: -5 };

// The side is drawn before the animation starts; the spin only reveals it.
export default function CoinFlip() {
  const [side, setSide] = useState<Side | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [motion, setMotion] = useState(initialMotion);
  const [tally, setTally] = useState({ heads: 0, tails: 0 });
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const flip = () => {
    const next = flipCoin();
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const start = side === 'tails' ? 180 : 0;
    const direction = Math.random() < .5 ? -1 : 1;
    const revolutions = Math.random() < .5 ? 2 : 3;
    const changedFace = next !== (side ?? 'heads');
    setMotion({ start, end: start + direction * (revolutions * 360 + (changedFace ? 180 : 0)), startTilt: motion.endTilt, endTilt: Math.round(Math.random() * 12 - 6) });
    setSpinning(!still); setSide(next);
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => { setSpinning(false); setTally(t => ({ ...t, [next]: t[next] + 1 })); }, still ? 0 : FLIP_DURATION);
  };
  const reset = () => {
    clearTimeout(timer.current);
    timer.current = undefined;
    setSpinning(false); setTally({ heads: 0, tails: 0 }); setSide(null);
    setMotion(initialMotion);
  };
  const label = side && !spinning ? (side === 'heads' ? 'Heads' : 'Tails') : spinning ? 'Flipping…' : 'Ready';
  return (
    <div className="coin-tool">
      <div className="tool-coin-stage" aria-hidden="true">
        <span className={`tool-coin-shadow${spinning ? ' tool-coin-shadow-moving' : ''}`} />
        <span className={`tool-coin-flight${spinning ? ' tool-coin-flight-moving' : ''}`}>
          <span className={`tool-coin-disc${spinning ? ' tool-coin-spinning' : ''}`} style={{ '--coin-start': `${motion.start}deg`, '--coin-end': `${motion.end}deg`, '--coin-start-tilt': `${motion.startTilt}deg`, '--coin-tilt': `${motion.endTilt}deg`, '--coin-rest': side === 'tails' ? '180deg' : '0deg' } as CSSProperties}>
            <span className="tool-coin-body">
              {[-7, -3, 0, 3, 7].map(depth => <span className="tool-coin-rim" key={depth} style={{ transform: `translateZ(${depth}px)` }} />)}
              <span className="tool-coin-face tool-coin-heads-face"><span className="tool-coin-face-inner"><svg className="tool-coin-crown" viewBox="0 0 64 64" fill="none"><path d="M12 23 19 43h26l7-20-13 10-7-17-7 17Z" fill="currentColor" opacity=".8"/><path d="M16 48h32M19 43h26M12 23l13 10 7-17 7 17 13-10-7 20H19Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/><circle cx="12" cy="22" r="2" fill="currentColor"/><circle cx="32" cy="15" r="2" fill="currentColor"/><circle cx="52" cy="22" r="2" fill="currentColor"/></svg><small>HEADS</small></span></span>
              <span className="tool-coin-face tool-coin-tails-face"><span className="tool-coin-face-inner"><strong>T</strong><small>TAILS</small></span></span>
            </span>
          </span>
        </span>
      </div>
      <p className="tool-result" role="status" aria-live="polite">{label}</p>
      <button type="button" className="primary" onClick={flip} disabled={spinning}>{side ? 'Flip again' : 'Flip the coin'}</button>
      {tally.heads + tally.tails > 0 && <p className="small muted tool-tally">This session: {tally.heads} heads, {tally.tails} tails. <button type="button" className="text-button" onClick={reset}>Reset</button></p>}
    </div>
  );
}
