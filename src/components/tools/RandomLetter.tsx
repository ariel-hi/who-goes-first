import { useState } from 'react';
import { randomCollectionIndex } from '../../lib/selection';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const HARD = new Set(['Q', 'U', 'V', 'X', 'Y', 'Z']);

export default function RandomLetter() {
  const [skipHard, setSkipHard] = useState(true);
  const [noRepeats, setNoRepeats] = useState(true);
  const [letter, setLetter] = useState<string | null>(null);
  const [used, setUsed] = useState<string[]>([]);
  const pool = ALPHABET.filter(l => !(skipHard && HARD.has(l)) && !(noRepeats && used.includes(l)));
  const draw = () => {
    if (!pool.length) return;
    const next = pool[randomCollectionIndex(pool.length)]!;
    setLetter(next); setUsed(list => [...list, next]);
  };
  return (
    <div className="letter-tool">
      <p className="tool-result tool-big-number" role="status" aria-live="polite">{letter ?? '?'}</p>
      <button type="button" className="primary" onClick={draw} disabled={!pool.length}>{pool.length ? (letter ? 'Next letter' : 'Pick a letter') : 'All letters used'}</button>
      <div className="tool-row">
        <label><input type="checkbox" checked={skipHard} onChange={event => setSkipHard(event.target.checked)} /> Skip Q, U, V, X, Y, Z</label>
        <label><input type="checkbox" checked={noRepeats} onChange={event => setNoRepeats(event.target.checked)} /> No repeats</label>
      </div>
      {used.length > 0 && <p className="small muted tool-tally">Used: {used.join(' ')} <button type="button" className="text-button" onClick={() => { setUsed([]); setLetter(null); }}>Reset</button></p>}
    </div>
  );
}
