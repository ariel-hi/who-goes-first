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
export default function TableReveals({ outcome, plan, mode, settled, preview = false }: { outcome: Outcome; plan: RevealPlan; mode: 'spinner' | 'cards' | 'tower' | 'straws' | 'dice' | 'coin' | 'shells'; settled: boolean; preview?: boolean }) {
  const chosen = preview ? -1 : outcome.players.findIndex(p => p.id === outcome.winnerId);
  if (mode === 'spinner') {
    const count = outcome.players.length;
    const step = 360 / count;
    const point = (angle: number, radius = 117) => [140 + radius * Math.sin(angle * Math.PI / 180), 140 - radius * Math.cos(angle * Math.PI / 180)];
    const slicePath = (i: number) => {
      const [x1, y1] = point(i * step - step / 2); const [x2, y2] = point(i * step + step / 2);
      return `M140 140L${x1} ${y1}A117 117 0 0 1 ${x2} ${y2}Z`;
    };
    return <div className="spinner-stage" role="img" aria-label={preview ? 'Spinner preview' : settled ? 'Spinner result' : 'Spinner turning'} data-settled={settled} data-preview={preview} data-winner-index={preview ? undefined : chosen} style={preview ? undefined : { '--piece': playerColor(outcome.players[chosen]!) } as CSSProperties}>
      <div className="spinner-disc"><svg viewBox="0 0 280 280" className="spinner-wheel" aria-hidden="true" style={{ '--turn': preview ? '0deg' : `${spinnerRotation(chosen, count, plan[outcome.winnerId]!.spinnerTurns, plan[outcome.winnerId]!.spinnerOffset)}deg` } as CSSProperties}>
        {outcome.players.map((player, i) => {
          const [tx, ty] = point(i * step, 82);
          return <g key={player.id}><path d={slicePath(i)} fill={playerColor(player)} stroke="#fffaf4" strokeWidth="2"/><text x={tx} y={ty} dy=".35em" textAnchor="middle" fill="#34342f" fontSize="17" fontFamily="Georgia">{i + 1}</text></g>;
        })}
        {chosen >= 0 && <path className="spinner-winning-slice" d={slicePath(chosen)} fill="none" stroke="none" pointerEvents="none"/>}
        <circle cx="140" cy="140" r="17" fill="#fffaf4"/>
      </svg></div>
      <svg viewBox="0 0 24 32" className="spinner-pin" aria-hidden="true"><path d="M3 3Q12-1 21 3L12 29Z" fill="#61566f"/></svg>
    </div>;
  }
  const label = { cards: 'Cards', tower: 'Towers', straws: 'Matches', dice: 'Dice', coin: 'Coins', shells: 'Shells' }[mode];
  return <div className={`table-reveal ${mode}-reveal`} data-count={outcome.players.length} data-many={outcome.players.length > 6} data-settled={settled} data-preview={preview} aria-label={preview ? `${label} preview` : label}>
    {outcome.players.map((player, i) => <div className={`reveal-player ${i === chosen ? 'reveal-chosen' : ''}`} data-fall-style={mode === 'tower' && i !== chosen ? plan[player.id]!.tower.style : undefined} key={player.id} style={{ '--piece': playerColor(player), '--flip-delay': `${plan[player.id]!.flipAt}ms`, '--flip-duration': `${plan[player.id]!.flipDuration}ms`, '--deal-delay': `${Math.round(plan[player.id]!.flipAt * .34)}ms`, '--match-tilt': `${plan[player.id]!.matchTilt}deg`, '--match-delay': `${plan[player.id]!.matchAt}ms`, '--dice-delay': `${plan[player.id]!.diceAt}ms`, '--coin-delay': `${plan[player.id]!.coin.delay}ms`, '--coin-duration': `${plan[player.id]!.coin.duration}ms`, '--coin-apex': `-${plan[player.id]!.coin.lift}px`, '--coin-tilt': `${plan[player.id]!.coin.tilt}deg`, '--coin-turn': `${plan[player.id]!.coin.turn + (i === chosen ? Math.sign(plan[player.id]!.coin.turn) * 180 : 0)}deg`, '--coin-drift': `${plan[player.id]!.coin.drift}px`, '--shell-delay': `${plan[player.id]!.shell.delay}ms`, '--shell-tilt': `${plan[player.id]!.shell.tilt}deg` } as CSSProperties}>
      {mode === 'cards' && <div className="draw-card" aria-hidden="true"><div className="card-flipper"><div className="card-face card-back"><span className="card-back-mark">{i + 1}</span></div><div className="card-face card-front"><span className="card-number">{i + 1}</span><span className="card-result">{i === chosen ? 'GO' : '—'}</span></div></div></div>}
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
      {mode === 'coin' && <div className="coin-toss" aria-hidden="true"><span className="coin-shadow"/><span className="coin-flight"><span className="coin"><span className="coin-body">{[-7, -3, 0, 3, 7].map(depth => <span className="coin-edge" key={depth} style={{ '--depth': `${depth}px` } as CSSProperties}/>)}<span className="coin-face coin-tails"><span className="coin-number">{i + 1}</span></span><span className="coin-face coin-heads"><CrownEmblem /></span></span></span></span></div>}
      {mode === 'shells' && <ShellArt winner={i === chosen} />}
      <bdi>{displayLabel(player, outcome.players)}</bdi>
    </div>)}
  </div>;
}

function CrownEmblem() {
  return <svg viewBox="0 0 64 64" className="crown-emblem" fill="none" aria-hidden="true">
    <path d="M12 23 19 43h26l7-20-13 10-7-17-7 17Z" fill="currentColor" opacity=".8"/>
    <path d="M16 48h32M19 43h26M12 23l13 10 7-17 7 17 13-10-7 20H19Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
    <circle cx="12" cy="22" r="2" fill="currentColor"/><circle cx="32" cy="15" r="2" fill="currentColor"/><circle cx="52" cy="22" r="2" fill="currentColor"/>
  </svg>;
}

function ShellArt({ winner }: { winner: boolean }) {
  return <div className="shell-scene" aria-hidden="true">
    <span className="shell-shadow"/>
    <svg className="shell-bed" viewBox="0 0 110 112" aria-hidden="true">
      <path d="M14 70Q30 49 55 49T96 70C94 88 79 101 55 101S16 88 14 70Z" fill="var(--piece)" stroke="#806a73" strokeWidth="1.5"/>
      <path className="shell-bowl" d="M17 70Q32 55 55 55T93 70C79 80 67 84 55 84S31 80 17 70Z"/>
      <path className="shell-bowl-light" d="M22 69Q37 58 55 58T88 69C76 77 66 80 55 80S34 77 22 69Z" opacity=".85"/>
      <path d="M55 58v23M41 60l7 20M29 64l14 14M69 60l-7 20M81 64 67 78" fill="none" stroke="#fffdf9" strokeOpacity=".68" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M20 82Q55 106 90 82" fill="none" stroke="#fffdf9" strokeOpacity=".7" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
    {winner && <span className="shell-pearl"/>}
    <span className="shell-wobble"><svg className="shell-lid" viewBox="0 0 100 88">
      <path className="shell-fan" d="M7 69 C6 53 12 39 21 32 C19 22 29 14 39 17 C45 7 55 7 61 17 C71 14 81 22 79 32 C88 40 94 54 93 69 Q74 80 50 75 Q26 80 7 69Z" fill="var(--piece)" stroke="#806a73" strokeWidth="1.5"/>
      <path className="shell-sheen" d="M12 66 C14 47 24 33 38 22 C31 37 27 55 26 73Z" fill="#fffdf9" opacity=".27"/>
      <path d="M50 74 Q45 45 39 17 M50 74 Q54 44 61 17 M50 74 Q35 46 21 32 M50 74 Q66 45 79 32 M50 74 Q26 60 10 58 M50 74 Q75 57 91 58" fill="none" stroke="#fffdf9" strokeOpacity=".8" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 69 Q50 80 88 69" fill="none" stroke="#6d5964" strokeOpacity=".5" strokeWidth="2"/>
    </svg></span>
  </div>;
}

function Die({ value }: { value: number }) {
  const pips: Record<number, number[]> = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
  return <span className="die"><svg viewBox="0 0 36 36">{pips[value]!.map(pip => <circle key={pip} cx={9 + pip % 3 * 9} cy={9 + Math.floor(pip / 3) * 9} r="2.5" />)}</svg></span>;
}
