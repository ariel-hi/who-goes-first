import { useEffect, useRef, useState } from 'react';
import { flipCoin, type Side } from '../../lib/tools';

// The side is drawn before the animation starts; the spin only reveals it.
export default function CoinFlip() {
  const [side, setSide] = useState<Side | null>(null);
  const [flips, setFlips] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [tally, setTally] = useState({ heads: 0, tails: 0 });
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const flip = () => {
    const next = flipCoin();
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setSpinning(!still); setSide(next); setFlips(count => count + 1);
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => { setSpinning(false); setTally(t => ({ ...t, [next]: t[next] + 1 })); }, still ? 0 : 1100);
  };
  const label = side && !spinning ? (side === 'heads' ? 'Heads' : 'Tails') : spinning ? 'Flipping…' : 'Ready';
  return (
    <div className="coin-tool">
      <div className={`coin${spinning ? ' coin-spinning' : ''}${side === 'tails' ? ' coin-tails' : ''}`} key={flips} aria-hidden="true">
        <span className="coin-face coin-heads-face">H</span><span className="coin-face coin-tails-face">T</span>
      </div>
      <p className="tool-result" role="status" aria-live="polite">{label}</p>
      <button type="button" className="primary" onClick={flip} disabled={spinning}>{flips ? 'Flip again' : 'Flip the coin'}</button>
      {tally.heads + tally.tails > 0 && <p className="small muted tool-tally">This session: {tally.heads} heads, {tally.tails} tails. <button type="button" className="text-button" onClick={() => { setTally({ heads: 0, tails: 0 }); setSide(null); setFlips(0); }}>Reset</button></p>}
    </div>
  );
}
