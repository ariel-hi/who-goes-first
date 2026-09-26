import type { CSSProperties } from 'react';
import type { Mode } from '../lib/preferences';
import type { Player } from '../lib/selection';
import { displayLabel } from '../lib/roster';
import { playerColor } from '../lib/reveal-plan';

// Match the scene's existing CSS layout while its artwork chunk remains lazy.
// Loading classes are separate so they cannot satisfy real-scene selectors.
export default function RevealLoading({ mode, players }: { mode: Mode; players: readonly Player[] }) {
  if (mode === 'quick' || mode === 'instant') return null;
  if (mode === 'spinner') return <div className="reveal-loading spinner-loading">One moment…</div>;
  const balloon = mode === 'balloon';
  return <div className="reveal-loading reveal-layout-loading" data-loading-reveal={mode}>
    <div className={balloon ? 'loading-balloon' : 'loading-table'} data-method={mode} data-count={players.length} data-many={players.length > 6} aria-hidden="true">
      {players.map(player => <div key={player.id} className={balloon ? 'loading-balloon-player' : 'loading-player'} style={{ '--piece': playerColor(player) } as CSSProperties}>
        {balloon ? <svg viewBox="0 0 90 130" width="62" height="90" aria-hidden="true" /> : <div className="loading-piece" data-method={mode}>{mode === 'dice' && <><span className="loading-die" /><span className="loading-die" /></>}</div>}
        <bdi>{displayLabel(player, players)}</bdi>
      </div>)}
    </div>
    <span className="loading-message">One moment…</span>
  </div>;
}
