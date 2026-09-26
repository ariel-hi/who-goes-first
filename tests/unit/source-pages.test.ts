import { describe, expect, test } from 'vitest';
import { citedPdfPages, isPdfSource, pdfPageHref } from '../../src/lib/source-pages';

describe('cited PDF page links', () => {
  test('preserves query bytes and encoded fragment characters', () => {
    const source = 'https://publisher.example/rules.PDF?v=17&name=Rules%20%26%20Setup&token=a%23b';
    const href = pdfPageHref(source, 3)!;
    expect(href).toBe(`${source}#page=3`);
    expect(new URL(href).search).toBe(new URL(source).search);
    expect(new URL(href).hash).toBe('#page=3');
  });

  test.each(['#page=9', '#nameddest=setup', '#toolbar=0&view=Fit', '#', '#%70age=9'])('never replaces a publisher fragment %s', fragment => {
    const source = `https://publisher.example/rules.pdf?v=17${fragment}`;
    expect(isPdfSource(source)).toBe(true);
    expect(pdfPageHref(source, 3)).toBeNull();
    expect(citedPdfPages(source, [3, 4])).toEqual([]);
  });

  test.each([
    'https://publisher.example/rules',
    'https://publisher.example/rules?file=book.pdf',
    'https://publisher.example/book.pdf/contents',
    'https://publisher.example/book.pdf.html',
    'https://drive.google.com/file/d/example/view',
    'http://publisher.example/book.pdf',
    'https://user:password@publisher.example/book.pdf',
    'javascript:book.pdf',
    'not a URL',
  ])('does not invent shortcuts for unsupported or unsafe source %s', source => {
    expect(isPdfSource(source)).toBe(false);
    expect(citedPdfPages(source, [1, 2])).toEqual([]);
  });

  test('uses each distinct cited page once and preserves its approved order', () => {
    const pages = Object.freeze([5, 8, 15, 19, 1, 8]);
    expect(citedPdfPages('https://publisher.example/rules.pdf', pages)).toEqual([
      { page: 5, href: 'https://publisher.example/rules.pdf#page=5' },
      { page: 8, href: 'https://publisher.example/rules.pdf#page=8' },
      { page: 15, href: 'https://publisher.example/rules.pdf#page=15' },
      { page: 19, href: 'https://publisher.example/rules.pdf#page=19' },
      { page: 1, href: 'https://publisher.example/rules.pdf#page=1' },
    ]);
    expect(pages).toEqual([5, 8, 15, 19, 1, 8]);
  });

  test.each([0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])('rejects invalid page %s', page => {
    expect(pdfPageHref('https://publisher.example/rules.pdf', page)).toBeNull();
  });

  test('handles independently cited documents without carrying pages between them', () => {
    expect(citedPdfPages('https://publisher.example/main.pdf', [1])).toEqual([{ page: 1, href: 'https://publisher.example/main.pdf#page=1' }]);
    expect(citedPdfPages('https://publisher.example/team.pdf', [2, 4, 4])).toEqual([
      { page: 2, href: 'https://publisher.example/team.pdf#page=2' },
      { page: 4, href: 'https://publisher.example/team.pdf#page=4' },
    ]);
    expect(citedPdfPages('https://publisher.example/team.pdf', [])).toEqual([]);
  });

  test.each([
    'https://drive.usercontent.google.com/download?id=14EfqsIbeFudnJltnWzlNq3hKV3uuoxwW&export=download&confirm=t',
    'https://docs.google.com/document/d/17SKgAs0-sOVsJ03L0mYUAiabDA3JsLKqkCtT7zXqsj8/export?format=pdf',
    'https://drive.google.com/uc?export=download&id=1ujQziJLbT6wjLUUrwtOk-G6VWaGsT0Cl',
  ])('uses reviewed pages for a Google PDF export without rewriting its query: %s', source => {
    expect(isPdfSource(source)).toBe(false);
    expect(isPdfSource(source, [24])).toBe(true);
    expect(citedPdfPages(source, [24, 8, 24])).toEqual([
      { page: 24, href: `${source}#page=24` },
      { page: 8, href: `${source}#page=8` },
    ]);
    expect(new URL(pdfPageHref(source, 24)!).search).toBe(new URL(source).search);
    expect(citedPdfPages(`${source}#nameddest=setup`, [24])).toEqual([]);
    expect(citedPdfPages(`${source}#`, [24])).toEqual([]);
    expect(isPdfSource(source, [0, NaN])).toBe(false);
    expect(citedPdfPages(source, [])).toEqual([]);
  });

  test.each([
    'https://docs.google.com/document/d/example/edit?format=pdf',
    'https://docs.google.com/document/d/example/export?format=html',
    'https://docs.google.com/document/d/example/export?format=pdf&format=html',
    'https://docs.google.com.evil.example/document/d/example/export?format=pdf',
    'https://drive.google.com/file/d/example/view?export=download',
    'https://drive.google.com/open?id=example',
    'https://drive.usercontent.google.com/download?id=example',
    'https://drive.usercontent.google.com/download?export=download',
    'https://drive.usercontent.google.com/download?id=example&export=view',
    'https://drive.usercontent.google.com/download?id=example&export=download&export=view',
    'https://drive.usercontent.google.com/download?id=example&id=other&export=download',
    'https://drive.usercontent.google.com.evil.example/download?id=example&export=download',
    'https://publisher.example/download?id=example&export=download',
    'https://publisher.example/ru\nles.pdf',
  ])('does not mistake a viewer, ambiguous export, or another host for a Google PDF: %s', source => {
    expect(isPdfSource(source, [1])).toBe(false);
    expect(citedPdfPages(source, [1])).toEqual([]);
  });
});
