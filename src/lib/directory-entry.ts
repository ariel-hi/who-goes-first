/** Public directory projection, shared by static and native search consumers. */
export type DirectoryEntry = { name: string; id: string; ruleCount: number; slug?: string; terms?: string[]; href?: string; bggId?: string; reference?: { url: string; label: string } };
export function directoryEntryLinks(entry: DirectoryEntry) {
  const numeric = /^[1-9]\d*$/.test(entry.id);
  if (!Number.isSafeInteger(entry.ruleCount) || entry.ruleCount < 0) throw new Error('Invalid directory rule count');
  const answer = entry.ruleCount === 1 ? entry.slug && /^[a-z0-9-]+$/.test(entry.slug) ? `/games/${entry.slug}/` : undefined : `/board-games/${entry.id}/`;
  if (entry.ruleCount > 0 && (!answer || !numeric && entry.href !== answer)) throw new Error('Reviewed directory entry requires an internal answer link');
  if (numeric) return {
    href: entry.ruleCount === 1 ? `/games/${entry.slug}/` : entry.ruleCount > 1 ? `/board-games/${entry.id}/` : undefined,
    reference: { url: `https://boardgamegeek.com/boardgame/${entry.id}`, label: 'BoardGameGeek' }, numericId: entry.id,
  };
  return { href: entry.href, reference: entry.reference, numericId: entry.bggId };
}
