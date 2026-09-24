import type { CSSProperties } from 'react';
import type { Outcome } from '../../lib/selection';
import { displayLabel } from '../../lib/roster';
import { playerColor, type RevealPlan } from '../../lib/reveal-plan';

// Original SVG artwork. This component has no randomness, timers or completion
// authority: the parent owns the deadline and the immutable outcome.
export default function BalloonRise({ outcome, plan, settled, preview = false }: { outcome: Outcome; plan: RevealPlan; settled: boolean; preview?: boolean }) {
  const scraps = [
    { pieces: ['m15 108 15-9-3 13-9 3Z', 'm43 113 6-12 9 10-6 7Z', 'm64 107 12 5-5 8-10-4Z'], string: 'M32 119c12-5 11 8 25 1' },
    { pieces: ['M18 105 Q25 94 35 104 L30 120 Q21 118 18 105Z', 'M56 103 Q69 99 75 112 L64 120 Q58 113 56 103Z'], string: 'M47 119q-8-9-1-14' },
    { pieces: ['m14 107 8-6 4 10-8 3Z', 'm32 114 5-13 6 12-5 6Z', 'm52 103 11 1-7 10-7-5Z', 'm69 112 9 3-6 6-7-5Z'], string: 'M28 122q10-8 16 2' },
    { pieces: ['M17 108 Q28 96 38 105 L31 119 Q22 115 17 108Z', 'M47 105 Q54 98 63 106 L59 118 Q52 111 47 105Z', 'm69 109 8 4-6 8-7-6Z'], string: 'M38 120q7-11 17 2' },
  ];
  return <div className="balloon-field" aria-label={preview ? 'Balloon preview' : settled ? 'Balloon result' : 'Balloons rising'} data-settled={settled} data-preview={preview} data-count={outcome.players.length}>
    {outcome.players.map(player => <div key={player.id} className={`balloon-player ${preview ? '' : player.id === outcome.winnerId ? 'survivor' : 'pop'}`} data-pop-style={preview || player.id === outcome.winnerId ? undefined : plan[player.id]!.balloon.style} style={{ '--piece': playerColor(player), '--balloon-color': playerColor(player), '--delay': `${plan[player.id]!.popAt ?? 0}ms`, '--pop-x': `${plan[player.id]!.balloon.driftX}px`, '--pop-y': `${plan[player.id]!.balloon.driftY}px`, '--pop-turn': `${plan[player.id]!.balloon.turn}deg`, '--bob-delay': `${plan[player.id]!.balloon.bobDelay}ms`, '--bob-duration': `${plan[player.id]!.balloon.bobDuration}ms`, '--bob-x': `${plan[player.id]!.balloon.bobX}px`, '--bob-y': `${plan[player.id]!.balloon.bobY}px`, '--bob-turn': `${plan[player.id]!.balloon.bobTurn}deg` } as CSSProperties}>
      <svg aria-hidden="true" viewBox="0 0 90 130" width="62" height="90"><g className="balloon-shape"><path d="M45 8C3 8 4 65 45 86C86 65 87 8 45 8Z" fill="var(--balloon-color)" stroke="#202323" strokeWidth="1.3" /><path d="M27 23C21 27 19 34 20 41" fill="none" stroke="#fff" strokeOpacity=".65" strokeWidth="3" strokeLinecap="round"/><path d="m45 86-5 7h10Z" fill="var(--balloon-color)" stroke="#202323" strokeWidth="1.3"/><path d="M45 93c-9 14 9 17 0 30" fill="none" stroke="#53645d" strokeWidth="1.2"/></g><g className="pop-lines" fill="none" stroke="var(--balloon-color)" strokeWidth="2"><path d="m45 23 0-10m0 72v10M17 48H7m66 0h10M25 27l-7-7m47 47 7 7m-7-47 7-7M25 67l-7 7" /></g></svg>
      {!preview && player.id !== outcome.winnerId && <svg className="balloon-scraps" aria-hidden="true" viewBox="0 0 90 130" width="62" height="90"><g fill="var(--balloon-color)" stroke="#53645d" strokeWidth=".8">{scraps[plan[player.id]!.balloon.style]!.pieces.map((path, i) => <path d={path} key={i}/>)}</g><path d={scraps[plan[player.id]!.balloon.style]!.string} fill="none" stroke="#53645d" strokeWidth="1.2"/></svg>}
      <bdi>{displayLabel(player, outcome.players)}</bdi>
    </div>)}
  </div>;
}
