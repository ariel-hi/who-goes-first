// A search link, not a product link: a guessed product ID could send readers to
// an unrelated game that shares the name (Chomp, Vienna). Game name only, so no
// reader data enters the URL.
export function amazonSearchUrl(gameName: string, tag: string): string {
  const url = new URL('https://www.amazon.com/s');
  url.searchParams.set('k', `${gameName} board game`);
  url.searchParams.set('tag', tag);
  return url.href;
}
export const amazonDisclosure = 'As an Amazon Associate, Who Goes First? earns from qualifying purchases.';
