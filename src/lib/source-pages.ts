/** Recognize direct PDFs and reviewed Google PDF exports, never viewer pages. */
export function isPdfSource(sourceUrl: string, citedPages: readonly number[] = []): boolean {
  try {
    const url = new URL(sourceUrl);
    if (url.protocol !== 'https:' || url.username || url.password || /\p{Cc}/u.test(sourceUrl)) return false;
    // Dropbox sharing URLs can end in .pdf while serving an HTML viewer.
    // A filename alone cannot establish a supported PDF page fragment there.
    if (['dropbox.com', 'www.dropbox.com'].includes(url.hostname)) return false;
    if (/\.pdf$/i.test(url.pathname)) return true;
    // These export/download forms lack a .pdf suffix. Reviewed PDF page
    // metadata is required; a Google download URL alone does not imply a PDF.
    if (!citedPages.some(page => Number.isSafeInteger(page) && page > 0)) return false;
    const singleParam = (name: string, value: string) => url.searchParams.getAll(name).length === 1 && url.searchParams.get(name) === value;
    if (url.host === 'docs.google.com' && /^\/document\/d\/[\w-]+\/export$/.test(url.pathname)) return singleParam('format', 'pdf');
    const driveDownload = url.host === 'drive.usercontent.google.com' && url.pathname === '/download'
      || url.host === 'drive.google.com' && url.pathname === '/uc';
    return driveDownload && singleParam('export', 'download') && url.searchParams.getAll('id').length === 1 && /^[\w-]+$/.test(url.searchParams.get('id') ?? '');
  } catch {
    return false;
  }
}

export function pdfPageHref(sourceUrl: string, page: number): string | null {
  // A publisher's fragment may select a named destination or viewer options.
  // Preserve it, including an explicit empty fragment, rather than replacing it.
  if (!isPdfSource(sourceUrl, [page]) || sourceUrl.includes('#') || !Number.isSafeInteger(page) || page < 1) return null;
  // Append to the original string so query values and their encoding stay intact.
  return `${sourceUrl}#page=${page}`;
}

export function citedPdfPages(sourceUrl: string, pages: readonly number[]): { page: number; href: string }[] {
  return [...new Set(pages)].flatMap(page => {
    const href = pdfPageHref(sourceUrl, page);
    return href ? [{ page, href }] : [];
  });
}
