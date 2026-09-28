/** Original, deterministic title art for every directory entry. */
export function directoryArt(name: string) {
  let hash = 2166136261;
  for (const character of name.normalize('NFKC').toLowerCase()) {
    hash = Math.imul(hash ^ character.charCodeAt(0), 16777619) >>> 0;
  }
  const initial = Array.from(name.trim())[0]?.toLocaleUpperCase('en') ?? '?';
  return { initial, tone: hash % 5 };
}
