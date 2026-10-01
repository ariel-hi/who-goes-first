import { useState } from 'react';
import { DIE_SIDES, MAX_DICE, rollDice } from '../../lib/tools';

// Cells of a 3×3 grid that hold a pip, for each face of a six-sided die.
const pips: Record<number, number[]> = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };

export default function DiceRoller() {
  const [count, setCount] = useState(2);
  const [sides, setSides] = useState(6);
  const [rolls, setRolls] = useState<number[]>([]);
  const [draw, setDraw] = useState(0);
  const roll = () => { setRolls(rollDice(count, sides)); setDraw(value => value + 1); };
  const total = rolls.reduce((sum, value) => sum + value, 0);
  const shown = rolls.length ? rolls : Array.from({ length: count }, () => 0);
  return (
    <div className="dice-tool">
      <div className="tool-row">
        <label className="tool-label" htmlFor="dice-count">Dice</label>
        <select id="dice-count" value={count} onChange={event => { setCount(Number(event.target.value)); setRolls([]); }}>
          {Array.from({ length: MAX_DICE }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <label className="tool-label" htmlFor="dice-sides">Sides</label>
        <select id="dice-sides" value={sides} onChange={event => { setSides(Number(event.target.value)); setRolls([]); }}>
          {DIE_SIDES.map(n => <option key={n} value={n}>d{n}</option>)}
        </select>
      </div>
      <ul className="dice-tray" key={draw} aria-hidden="true">
        {shown.map((value, i) => <li key={i} className={`tool-die${value ? '' : ' tool-die-idle'}`} style={{ animationDelay: `${Math.min(i * 40, 300)}ms` }}>
          {sides === 6 && value ? <span className="tool-die-pips">{Array.from({ length: 9 }, (_, cell) => <i key={cell} className={pips[value]!.includes(cell) ? 'on' : ''} />)}</span> : <span>{value || '?'}</span>}
        </li>)}
      </ul>
      <p className="tool-result" role="status" aria-live="polite">{rolls.length ? (rolls.length > 1 ? `Total ${total} (${rolls.join(' + ')})` : `You rolled ${total}`) : `Ready to roll ${count}d${sides}`}</p>
      <button type="button" className="primary" onClick={roll}>{rolls.length ? 'Roll again' : 'Roll the dice'}</button>
    </div>
  );
}
