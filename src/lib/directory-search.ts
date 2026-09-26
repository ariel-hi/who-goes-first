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

export function directorySearchHref(value: string): string {
  const query = boundedDirectoryQuery(value);
  return query ? `/board-games/#q=${encodeURIComponent(query)}` : '/board-games/';
}

export function readDirectorySearchFragment(hash: string): { query: string; invalid: boolean } {
  if (!hash.startsWith('#q=')) return { query: '', invalid: false };
  // Reject oversized encoded input before decoding it. A Unicode code point
  // needs at most twelve percent-encoded characters.
  if (hash.length > DIRECTORY_QUERY_LIMIT * 12 + 3) return { query: '', invalid: true };
  try {
    const query = decodeURIComponent(hash.slice(3)).trim();
    if (query.length > DIRECTORY_QUERY_LIMIT || invalidQuery.test(query)) return { query: '', invalid: true };
    return { query, invalid: false };
  } catch {
    return { query: '', invalid: true };
  }
}
