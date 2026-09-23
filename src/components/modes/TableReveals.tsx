import type { CSSProperties } from 'react';
import type { Outcome } from '../../lib/selection';
import { displayLabel } from '../../lib/roster';
import { spinnerRotation } from '../../lib/presentations';
import { playerColor, type RevealPlan } from '../../lib/reveal-plan';

// The lower two blocks anchor the stack. Each of the six patterns sends the
// upper blocks to different places; small sampled drift distinguishes repeats.
const towerFalls: readonly (readonly (readonly [number, number, number])[])[] = [
  [[-8, 0, -18], [-20, 3, -36], [-29, 6, -55]],
  [[8, 0, 18], [20, 3, 36], [29, 6, 55]],
  [[-26, 4, -38], [2, 0, 9], [27, 5, 43]],
  [[9, 1, 11], [-12, 5, -20], [6, 8, 25]],
  [[-21, 2, -48], [18, 4, 32], [-5, 9, -14]],
  [[23, 3, 40], [-4, 8, -12], [-24, 2, -43]],
];

// Decorative SVG/CSS only. Selection, timing, skip and interruptions belong to
// the picker. These components cannot choose or change a winner.
export default function TableReveals({ outcome, plan, mode, settled }: { outcome: Outcome; plan: RevealPlan; mode: 'spinner' | 'cards' | 'tower' | 'straws' | 'dice' | 'race'; settled: boolean }) {
  const chosen = outcome.players.findIndex(p => p.id === outcome.winnerId);
  if (mode === 'spinner') {
    const count = outcome.players.length;
    const step = 360 / count;
    const point = (angle: number, radius = 117) => [140 + radius * Math.sin(angle * Math.PI / 180), 140 - radius * Math.cos(angle * Math.PI / 180)];
    return <div className="spinner-stage" aria-label={settled ? 'Spinner result' : 'Spinner turning'} data-settled={settled} data-winner-index={chosen}>
      <div className="spinner-disc"><svg viewBox="0 0 280 280" className="spinner-wheel" aria-hidden="true" style={{ '--turn': `${spinnerRotation(chosen, count)}deg` } as CSSProperties}>
        {outcome.players.map((player, i) => {
          const [x1, y1] = point(i * step - step / 2); const [x2, y2] = point(i * step + step / 2);
          const [tx, ty] = point(i * step, 82);
          return <g key={player.id}><path className={i === chosen ? 'spinner-winning-slice' : undefined} d={`M140 140L${x1} ${y1}A117 117 0 0 1 ${x2} ${y2}Z`} fill={playerColor(player)} stroke="#fffaf4" strokeWidth="2"/><text x={tx} y={ty} dy=".35em" textAnchor="middle" fill="#34342f" fontSize="17" fontFamily="Georgia">{i + 1}</text></g>;
        })}
        <circle cx="140" cy="140" r="17" fill="#fffaf4"/>
      </svg></div>
      <svg viewBox="0 0 24 32" className="spinner-pin" aria-hidden="true"><path d="M3 3Q12-1 21 3L12 29Z" fill="#61566f"/></svg>
      <ul className="spinner-legend" aria-label="Players in this draw">
        {outcome.players.map((player, i) => <li key={player.id} className={i === chosen ? 'reveal-chosen' : ''}>
          <span className="spinner-seat" aria-hidden="true" style={{ '--piece': playerColor(player) } as CSSProperties}>{i + 1}</span>
          <bdi>{displayLabel(player, outcome.players)}</bdi>
        </li>)}
      </ul>
    </div>;
  }
  if (mode === 'race') return <div className="marble-race" data-settled={settled} aria-label={settled ? 'Marble race result' : 'Marbles racing'}>
    {outcome.players.map((player, i) => {
      const race = plan[player.id]!.race;
      return <div className={`race-player ${i === chosen ? 'reveal-chosen' : ''}`} key={player.id} style={{ '--piece': playerColor(player), '--race-first': `${race.first}%`, '--race-second': `${race.second}%`, '--race-third': `${race.third}%`, '--race-fourth': `${race.fourth}%`, '--finish': i === chosen ? 'calc(100% + 16px)' : `${race.finish}%` } as CSSProperties}>
        <bdi><span className="player-color-dot" aria-hidden="true" />{displayLabel(player, outcome.players)}</bdi>
        <div className="race-lane" aria-hidden="true"><div className="marble-travel"><i className="marble" /></div></div>
      </div>;
    })}
    <span className="finish-line" aria-hidden="true" />
  </div>;
  const label = { cards: 'Cards', tower: 'Towers', straws: 'Matches', dice: 'Dice' }[mode];
  return <div className={`table-reveal ${mode}-reveal`} data-count={outcome.players.length} data-settled={settled} aria-label={label}>
    {outcome.players.map((player, i) => <div className={`reveal-player ${i === chosen ? 'reveal-chosen' : ''}`} data-fall-style={mode === 'tower' && i !== chosen ? plan[player.id]!.tower.style : undefined} key={player.id} style={{ '--piece': playerColor(player), '--flip-delay': `${plan[player.id]!.flipAt}ms`, '--flip-duration': `${plan[player.id]!.flipDuration}ms`, '--match-tilt': `${plan[player.id]!.matchTilt}deg` } as CSSProperties}>
      {mode === 'cards' && <div className="draw-card" aria-hidden="true"><div className="card-flipper"><div className="card-face card-back"><span className="card-back-mark">{i + 1}</span></div><div className="card-face card-front"><span>{i === chosen ? '✦' : '·'}</span><span className="card-number">{i + 1}</span></div></div></div>}
      {mode === 'tower' && <div className="block-stack" aria-hidden="true">{Array.from({ length: 5 }, (_, j) => {
        const tower = plan[player.id]!.tower;
        const [baseX, land, angle] = towerFalls[tower.style]![Math.max(0, j - 2)]!;
        const fallX = baseX + tower.drift;
        const fallY = j * 19 - 5 + land;
        const stagger = tower.style === 3 ? j - 2 : 4 - j;
        return <i key={j} style={{ '--block': j, '--fall-x': `${fallX}px`, '--fall-y': `${fallY}px`, '--fall-angle': `${angle}deg`, '--fall-mid-x': `${fallX * .5}px`, '--fall-mid-y': `${Math.max(-7, fallY * .2 - 12)}px`, '--fall-mid-angle': `${angle * .4}deg`, '--fall-delay': `${tower.fallAt + stagger * tower.stagger}ms`, '--fall-duration': `${tower.fallDuration}ms` } as CSSProperties}><span /></i>;
      })}</div>}
      {mode === 'straws' && <div className="match-draw" aria-hidden="true"><div className="matchstick"><span className="match-wood" /><span className="match-head" /></div><div className="match-cover"><span className="match-cover-strike" /></div></div>}
      {mode === 'dice' && <div className="dice-pair" aria-hidden="true">{[0, 1].map(die => <Die key={die} value={i === chosen ? 6 : 1 + (i * 3 + die * 2 + outcome.drawId) % (die ? 6 : 5)} />)}</div>}
      <bdi>{displayLabel(player, outcome.players)}</bdi>
    </div>)}
  </div>;
}

function Die({ value }: { value: number }) {
  const pips: Record<number, number[]> = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
  return <span className="die"><svg viewBox="0 0 36 36">{pips[value]!.map(pip => <circle key={pip} cx={9 + pip % 3 * 9} cy={9 + Math.floor(pip / 3) * 9} r="2.5" />)}</svg></span>;
}
