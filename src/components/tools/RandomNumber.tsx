import { useState } from 'react';
import { randomInteger } from '../../lib/tools';

export default function RandomNumber() {
  const [min, setMin] = useState('1');
  const [max, setMax] = useState('10');
  const [result, setResult] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [error, setError] = useState('');
  const generate = () => {
    try {
      const value = randomInteger(Number(min), Number(max));
      setError(''); setResult(value); setHistory(list => [value, ...list].slice(0, 10));
    } catch (problem) { setResult(null); setError(problem instanceof Error ? problem.message : 'Check the range.'); }
  };
  return (
    <div className="number-tool">
      <div className="tool-row">
        <label className="tool-label" htmlFor="number-min">From</label>
        <input id="number-min" className="tool-number" type="number" inputMode="numeric" value={min} onChange={event => setMin(event.target.value)} />
        <label className="tool-label" htmlFor="number-max">to</label>
        <input id="number-max" className="tool-number" type="number" inputMode="numeric" value={max} onChange={event => setMax(event.target.value)} />
      </div>
      <p className="tool-result tool-big-number" role="status" aria-live="polite">{result ?? '–'}</p>
      <button type="button" className="primary" onClick={generate}>{result === null ? 'Generate' : 'Generate again'}</button>
      {error && <p className="error" role="alert">{error}</p>}
      {history.length > 1 && <p className="small muted tool-tally">Recent: {history.join(', ')}</p>}
    </div>
  );
}
