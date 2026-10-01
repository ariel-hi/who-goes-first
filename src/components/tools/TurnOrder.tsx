import { useState } from 'react';
import { parseNames, shuffle } from '../../lib/tools';

export default function TurnOrder() {
  const [text, setText] = useState('');
  const [order, setOrder] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [draw, setDraw] = useState(0);
  const names = parseNames(text);
  const generate = () => {
    if (names.length < 2) { setOrder([]); setError('Add at least 2 names.'); return; }
    setError(''); setOrder(shuffle(names)); setDraw(value => value + 1);
  };
  return (
    <div className="team-tool">
      <label className="tool-label" htmlFor="order-names">Players <span className="muted">(one per line or separated by commas)</span></label>
      <textarea id="order-names" rows={6} value={text} onChange={event => { setText(event.target.value); setOrder([]); setError(''); }} placeholder={'Alex\nSam\nJordan\nRiley'} />
      <p className="small muted">{names.length} {names.length === 1 ? 'player' : 'players'}</p>
      <button type="button" className="primary" onClick={generate}>{order.length ? 'Shuffle again' : 'Make turn order'}</button>
      {error && <p className="error" role="alert">{error}</p>}
      {order.length > 0 && <div role="status" aria-live="polite"><ol className="turn-order-list" key={draw}>{order.map((name, i) => <li key={i}>{name}</li>)}</ol></div>}
    </div>
  );
}
