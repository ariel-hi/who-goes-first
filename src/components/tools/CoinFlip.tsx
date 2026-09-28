import { useEffect, useRef, useState } from 'react';
import { flipCoin, type Side } from '../../lib/tools';

// The side is drawn before the animation starts; the spin only reveals it.
export default function CoinFlip() {
  const [side, setSide] = useState<Side | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [tally, setTally] = useState({ heads: 0, tails: 0 });
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const flip = () => {
    const next = flipCoin();
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setSpinning(!still); setSide(next);
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => { setSpinning(false); setTally(t => ({ ...t, [next]: t[next] + 1 })); }, still ? 0 : 1100);
  };
  const reset = () => {
    clearTimeout(timer.current);
    timer.current = undefined;
    setSpinning(false); setTally({ heads: 0, tails: 0 }); setSide(null);
  };
  const label = side && !spinning ? (side === 'heads' ? 'Heads' : 'Tails') : spinning ? 'Flipping…' : 'Ready';
  return (
    <div className="coin-tool">
      <div className="tool-coin-stage" aria-hidden="true">
        <span className={`tool-coin-shadow${spinning ? ' tool-coin-shadow-moving' : ''}`} />
        <span className={`tool-coin-flight${spinning ? ' tool-coin-flight-moving' : ''}`}>
          <span className={`tool-coin-disc${spinning ? ` tool-coin-spinning tool-coin-spin-${side}` : side === 'tails' ? ' tool-coin-show-tails' : ''}`}>
            {[-6, -4, -2, 0, 2, 4, 6].map(depth => <span className="tool-coin-rim" key={depth} style={{ transform: `translateZ(${depth}px)` }} />)}
            <span className="tool-coin-face tool-coin-heads-face"><span className="tool-coin-face-inner"><span className="tool-coin-ornament">✦</span><strong>H</strong><small>HEADS</small></span></span>
            <span className="tool-coin-face tool-coin-tails-face"><span className="tool-coin-face-inner"><span className="tool-coin-ornament">✦</span><strong>T</strong><small>TAILS</small></span></span>
          </span>
        </span>
      </div>
      <p className="tool-result" role="status" aria-live="polite">{label}</p>
      <button type="button" className="primary" onClick={flip} disabled={spinning}>{side ? 'Flip again' : 'Flip the coin'}</button>
      {tally.heads + tally.tails > 0 && <p className="small muted tool-tally">This session: {tally.heads} heads, {tally.tails} tails. <button type="button" className="text-button" onClick={reset}>Reset</button></p>}
    </div>
  );
}
