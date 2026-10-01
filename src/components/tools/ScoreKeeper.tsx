import { useEffect, useState } from 'react';

type Player = { id: number; name: string; score: number };
const STORAGE_KEY = 'wgf:scores:v1';
const STEPS = [1, 5, 10];
const starter = (): Player[] => [1, 2].map(n => ({ id: n, name: `Player ${n}`, score: 0 }));

function load(): Player[] {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    if (Array.isArray(saved) && saved.every(p => typeof p?.name === 'string' && Number.isFinite(p?.score))) return saved.map((p, i) => ({ id: i + 1, name: p.name, score: p.score }));
  } catch { /* storage blocked or corrupt: start fresh */ }
  return starter();
}

// Scores stay on this device; nothing is sent anywhere.
export default function ScoreKeeper() {
  const [players, setPlayers] = useState<Player[]>(starter);
  const [step, setStep] = useState(1);
  const [ready, setReady] = useState(false);
  useEffect(() => { setPlayers(load()); setReady(true); }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(players.map(({ name, score }) => ({ name, score })))); } catch { /* keep working in memory */ }
  }, [players, ready]);
  const update = (id: number, change: Partial<Player>) => setPlayers(list => list.map(p => (p.id === id ? { ...p, ...change } : p)));
  const bump = (id: number, delta: number) => setPlayers(list => list.map(p => (p.id === id ? { ...p, score: p.score + delta } : p)));
  const add = () => setPlayers(list => [...list, { id: Math.max(0, ...list.map(p => p.id)) + 1, name: `Player ${list.length + 1}`, score: 0 }]);
  const leader = Math.max(...players.map(p => p.score));
  return (
    <div className="score-tool">
      <div className="tool-options" role="group" aria-label="Points per tap">
        {STEPS.map(n => <button key={n} type="button" aria-pressed={step === n} onClick={() => setStep(n)}>±{n}</button>)}
      </div>
      <ul className="score-list">
        {players.map(p => <li key={p.id} className={players.length > 1 && p.score === leader && leader !== 0 ? 'score-leader' : undefined}>
          <input className="score-name" aria-label="Player name" value={p.name} maxLength={40} onChange={event => update(p.id, { name: event.target.value })} />
          <button type="button" className="score-step" aria-label={`Subtract ${step} from ${p.name}`} onClick={() => bump(p.id, -step)}>−</button>
          <output className="score-value" aria-live="polite">{p.score}</output>
          <button type="button" className="score-step" aria-label={`Add ${step} to ${p.name}`} onClick={() => bump(p.id, step)}>+</button>
          {players.length > 1 && <button type="button" className="text-button score-remove" aria-label={`Remove ${p.name}`} onClick={() => setPlayers(list => list.filter(x => x.id !== p.id))}>×</button>}
        </li>)}
      </ul>
      <div className="tool-row">
        {players.length < 20 && <button type="button" className="text-button" onClick={add}>+ Add player</button>}
        <button type="button" className="text-button" onClick={() => setPlayers(list => list.map(p => ({ ...p, score: 0 })))}>Reset scores</button>
      </div>
    </div>
  );
}
