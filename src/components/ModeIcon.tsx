import type { Mode } from '../lib/preferences';
export default function ModeIcon({ mode }: { mode: Mode }) {
  return <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {mode === 'instant' && <path d="m18 3-11 15h8l-1 11 11-16h-8Z" />}
    {mode === 'quick' && <><circle cx="16" cy="16" r="10"/><path d="m12 16 3 3 6-7M6 5l-2-2m22 2 2-2"/></>}
    {mode === 'spinner' && <><circle cx="16" cy="17" r="11"/><path d="M16 6v11l9 6M16 17l-9 6M13 2h6l-3 5Z"/><circle cx="16" cy="17" r="2" fill="currentColor"/></>}
    {mode === 'cards' && <><rect x="5" y="4" width="18" height="24" rx="3" transform="rotate(-9 14 16)"/><rect x="10" y="4" width="17" height="24" rx="3" fill="var(--paper)" transform="rotate(8 18 16)"/><path d="m18 11 4 5-4 5-4-5Z"/></>}
    {mode === 'balloon' && <><path d="M16 3C3 3 4 18 16 23 28 18 29 3 16 3Zm0 20-2 3h4Z"/><path d="M16 26c-3 2 3 2 0 4M10 8l-1 3"/></>}
    {mode === 'tower' && <><rect x="6" y="23" width="20" height="5" rx="1"/><rect x="9" y="17" width="18" height="5" rx="1"/><rect x="5" y="11" width="19" height="5" rx="1"/><rect x="9" y="5" width="17" height="5" rx="1"/></>}
    {mode === 'straws' && <><path d="m9 11 1 17m11-17-1 10"/><ellipse cx="8.5" cy="7" rx="3" ry="4" transform="rotate(-4 8.5 7)" fill="currentColor"/><ellipse cx="21.5" cy="7" rx="3" ry="4" transform="rotate(4 21.5 7)" fill="currentColor"/></>}
    {mode === 'dice' && <><rect x="5" y="5" width="22" height="22" rx="5"/><g fill="currentColor" stroke="none"><circle cx="11" cy="11" r="1.6"/><circle cx="21" cy="11" r="1.6"/><circle cx="16" cy="16" r="1.6"/><circle cx="11" cy="21" r="1.6"/><circle cx="21" cy="21" r="1.6"/></g></>}
    {mode === 'coin' && <><circle cx="16" cy="16" r="12"/><circle cx="16" cy="16" r="9"/><path d="m16 10 1.5 4.5L22 16l-4.5 1.5L16 22l-1.5-4.5L10 16l4.5-1.5Z" fill="currentColor" stroke="none"/></>}
    {mode === 'shells' && <><path d="M4 22c0-10 5-17 12-17s12 7 12 17Z"/><path d="M16 5v17M9 8l3 14m11-14-3 14M5 17l7 5m15-5-7 5M3 22h26v5H3Z"/></>}
  </svg>;
}
