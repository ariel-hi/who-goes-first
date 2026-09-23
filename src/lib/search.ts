export type Searchable = { gameName: string; aliases: string[]; editionLabel: string };
export const normalizeSearch = (value: string) => value.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().trim();
function near(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1 || a.length < 3) return false;
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) row[j] = Math.min(row[j - 1]! + 1, previous[j]! + 1, previous[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1));
    previous = row;
  }
  return previous[b.length]! <= 1;
}
export function searchRank(record: Searchable, query: string): number {
  const q = normalizeSearch(query).slice(0, 100);
  if (!q) return 1;
  const titles = [record.gameName, ...record.aliases].map(normalizeSearch);
  if (titles.some(t => t === q)) return 0;
  if (titles.some(t => t.startsWith(q))) return 1;
  if (titles.some(t => t.includes(q)) || normalizeSearch(record.editionLabel).includes(q)) return 2;
  if (titles.some(t => near(q, t))) return 3;
  return Infinity;
}
