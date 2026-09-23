export function cleanLink(href: string): string {
  const url = new URL(href);
  url.search = ''; url.hash = '';
  return url.toString();
}
export async function shareLink(url: string): Promise<'shared' | 'copied' | 'cancelled' | 'unavailable'> {
  const clean = cleanLink(url);
  try {
    if (navigator.share) { await navigator.share({ title: 'Who Goes First?', url: clean }); return 'shared'; }
    await navigator.clipboard.writeText(clean); return 'copied';
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled';
    return 'unavailable';
  }
}
