export const DIRECTORY_QUERY_LIMIT = 100;
const invalidQuery = /[\p{Cc}\p{Surrogate}]/u;

/** Match the search input's UTF-16 limit without splitting a Unicode character. */
export function boundedDirectoryQuery(value: string): string {
  let query = '';
  for (const character of value.trim()) {
    if (query.length + character.length > DIRECTORY_QUERY_LIMIT) break;
    query += character;
  }
  return invalidQuery.test(query) ? '' : query;
}

export type DirectoryFilter = 'all' | 'rules' | 'pending';

export function directorySearchHref(value: string, filter: DirectoryFilter = 'all'): string {
  const query = boundedDirectoryQuery(value);
  return query ? `/board-games/#q=${encodeURIComponent(query)}${filter === 'all' ? '' : `&filter=${filter}`}` : '/board-games/';
}

export function readDirectorySearchState(hash: string): { query: string; filter: DirectoryFilter; invalid: boolean } {
  const empty = { query: '', filter: 'all' as const, invalid: false };
  if (!hash.startsWith('#q=')) return empty;
  if (hash.length > DIRECTORY_QUERY_LIMIT * 12 + '#q=&filter=pending'.length) return { ...empty, invalid: true };
  // Only a literal final suffix is state. Query punctuation is percent-encoded
  // by our links, while older links keep their literal + and & characters.
  const suffix = hash.match(/&filter=(all|rules|pending)$/);
  const encoded = suffix ? hash.slice(3, suffix.index) : hash.slice(3);
  const filter = (suffix?.[1] ?? 'all') as DirectoryFilter;
  // Reject oversized encoded input before decoding it. A Unicode code point
  // needs at most twelve percent-encoded characters.
  if (encoded.length > DIRECTORY_QUERY_LIMIT * 12) return { ...empty, invalid: true };
  try {
    const query = decodeURIComponent(encoded).trim();
    if (query.length > DIRECTORY_QUERY_LIMIT || invalidQuery.test(query)) return { ...empty, invalid: true };
    return { query, filter: query ? filter : 'all', invalid: false };
  } catch {
    return { ...empty, invalid: true };
  }
}

export function readDirectorySearchFragment(hash: string): { query: string; invalid: boolean } {
  const { query, invalid } = readDirectorySearchState(hash);
  return { query, invalid };
}
