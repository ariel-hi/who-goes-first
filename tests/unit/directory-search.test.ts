import { describe, expect, test } from 'vitest';
import { boundedDirectoryQuery, directorySearchHref, readDirectorySearchFragment, readDirectorySearchState } from '../../src/lib/directory-search';

describe('directory search handoff', () => {
  test('preserves Unicode and punctuation while trimming the query', () => {
    const query = '四季 Étoile & 🧩';
    const href = directorySearchHref(`  ${query}  `);
    expect(href).toBe(`/board-games/#q=${encodeURIComponent(query)}`);
    expect(readDirectorySearchFragment(new URL(href, 'https://example.com').hash)).toEqual({ query, invalid: false });
    expect(new URL(href, 'https://example.com').search).toBe('');
  });

  test('bounds the handoff without splitting a Unicode character', () => {
    expect(boundedDirectoryQuery('x'.repeat(99) + '🧩')).toBe('x'.repeat(99));
    expect(boundedDirectoryQuery('🧩'.repeat(60))).toBe('🧩'.repeat(50));
    expect(boundedDirectoryQuery('  ' + 'x'.repeat(120) + '  ')).toHaveLength(100);
  });

  test.each(['#q=%E0%A4%A', '#q=%00', '#q=%ED%A0%80', `#q=${'x'.repeat(101)}`, `#q=${'%61'.repeat(500)}`])('rejects malformed or oversized fragment %s', hash => {
    expect(readDirectorySearchFragment(hash)).toEqual({ query: '', invalid: true });
  });

  test('keeps ordinary navigation usable for empty or invalid input', () => {
    expect(directorySearchHref('  ')).toBe('/board-games/');
    expect(directorySearchHref('\ud800')).toBe('/board-games/');
    expect(directorySearchHref('game\u0000')).toBe('/board-games/');
    expect(readDirectorySearchFragment('#main')).toEqual({ query: '', invalid: false });
    expect(readDirectorySearchFragment('#q=')).toEqual({ query: '', invalid: false });
  });

  test.each(['all', 'rules', 'pending'] as const)('round-trips %s without treating query punctuation as state', filter => {
    const query = '四季 + &filter=rules 🧩';
    const href = directorySearchHref(query, filter);
    const url = new URL(href, 'https://example.com');
    expect(url.search).toBe('');
    expect(readDirectorySearchState(url.hash)).toEqual({ query, filter, invalid: false });
    expect(readDirectorySearchFragment(url.hash)).toEqual({ query, invalid: false });
    expect(readDirectorySearchState('#q=A+B%20%26%20C')).toEqual({ query: 'A+B & C', filter: 'all', invalid: false });
  });

  test('empty and invalid saved searches cannot retain a hidden filter', () => {
    expect(directorySearchHref(' ', 'pending')).toBe('/board-games/');
    expect(readDirectorySearchState('#q=&filter=pending')).toEqual({ query: '', filter: 'all', invalid: false });
    expect(readDirectorySearchState('#q=%00&filter=rules')).toEqual({ query: '', filter: 'all', invalid: true });
    expect(readDirectorySearchState(`#q=${'x'.repeat(101)}&filter=pending`)).toEqual({ query: '', filter: 'all', invalid: true });
    expect(readDirectorySearchState(`#q=${'%61'.repeat(500)}&filter=pending`)).toEqual({ query: '', filter: 'all', invalid: true });
  });

  test('does not reinterpret an unknown suffix or an ordinary page anchor', () => {
    expect(readDirectorySearchState('#q=Game&filter=unknown')).toEqual({ query: 'Game&filter=unknown', filter: 'all', invalid: false });
    expect(readDirectorySearchState('#main')).toEqual({ query: '', filter: 'all', invalid: false });
  });
});
