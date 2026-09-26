import { useEffect, useRef } from 'react';
import { graphemeCount, hasControls } from '../lib/roster';
import type { Player } from '../lib/selection';

export default function PlayerName({ player, index, errors, onRename }: { player: Player; index: number; errors: boolean; onRename: (id: string, value: string) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const field = ref.current;
    if (!field) return;
    let width = -1;
    const size = () => {
      if (field.clientWidth === width) return;
      width = field.clientWidth;
      field.style.height = '0px';
      const style = getComputedStyle(field);
      // scrollHeight includes padding, but a border-box height includes borders too.
      const borders = style.boxSizing === 'border-box' ? parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth) : 0;
      field.style.height = `${Math.max(44, Math.ceil(field.scrollHeight + borders))}px`;
    };
    size();
    // Defer the write outside ResizeObserver's delivery cycle. Changing the
    // field height also resizes its parent, which otherwise loops in WebKit.
    let frame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(size);
    });
    observer.observe(field.parentElement!);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [player.label]);
  return <><label className="sr-only" htmlFor={player.id}>Name for player {index + 1}</label><textarea ref={ref} id={player.id} className="player-name" rows={1} value={player.label} placeholder={`Seat ${index + 1}`} onChange={e => onRename(player.id, e.target.value.replace(/\r?\n/g, ' '))} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }} onFocus={e => e.currentTarget.select()} onBlur={() => { if (!player.label.trim()) onRename(player.id, `Seat ${index + 1}`); }} spellCheck={false} aria-invalid={graphemeCount(player.label.trim()) > 24 || hasControls(player.label)} aria-describedby={errors ? 'input-errors' : undefined} /></>;
}
