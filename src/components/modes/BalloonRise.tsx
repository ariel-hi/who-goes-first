import type { CSSProperties } from 'react';
import type { Outcome } from '../../lib/selection';
import { displayLabel } from '../../lib/roster';
import { playerColor, type RevealPlan } from '../../lib/reveal-plan';

// Original SVG artwork. This component has no randomness, timers or completion
// authority: the parent owns the deadline and the immutable outcome.
export default function BalloonRise({ outcome, plan, settled }: { outcome: Outcome; plan: RevealPlan; settled: boolean }) {
  return <div className="balloon-field" aria-label={settled ? 'Balloon result' : 'Balloons rising'} data-settled={settled} data-count={outcome.players.length}>
    {outcome.players.map(player => <div key={player.id} className={`balloon-player ${player.id === outcome.winnerId ? 'survivor' : 'pop'}`} style={{ '--balloon-color': playerColor(player), '--delay': `${plan[player.id]!.popAt ?? 0}ms` } as CSSProperties}>
      <svg aria-hidden="true" viewBox="0 0 90 130" width="62" height="90"><g className="balloon-shape"><path d="M45 8C3 8 4 65 45 86C86 65 87 8 45 8Z" fill="var(--balloon-color)" stroke="#202323" strokeWidth="1.3" /><path d="M27 23C21 27 19 34 20 41" fill="none" stroke="#fff" strokeOpacity=".65" strokeWidth="3" strokeLinecap="round"/><path d="m45 86-5 7h10Z" fill="var(--balloon-color)" stroke="#202323" strokeWidth="1.3"/><path d="M45 93c-9 14 9 17 0 30" fill="none" stroke="#53645d" strokeWidth="1.2"/></g><g className="pop-lines" fill="none" stroke="var(--balloon-color)" strokeWidth="2"><path d="m45 23 0-10m0 72v10M17 48H7m66 0h10M25 27l-7-7m47 47 7 7m-7-47 7-7M25 67l-7 7" /></g></svg>
      {player.id !== outcome.winnerId && <svg className="balloon-scraps" aria-hidden="true" viewBox="0 0 90 130" width="62" height="90"><g fill="var(--balloon-color)" stroke="#53645d" strokeWidth=".8"><path d="m20 112 13-6-3 10-8 1Z"/><path d="m44 116 7-10 6 11-8 4Z"/><path d="m66 110 9 2-4 7-9-3Z"/></g><path d="M32 119c12-5 11 8 25 1" fill="none" stroke="#53645d" strokeWidth="1.2"/></svg>}
      <bdi>{displayLabel(player, outcome.players)}</bdi>
    </div>)}
  </div>;
}
