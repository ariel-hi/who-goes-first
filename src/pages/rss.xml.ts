import { rssFeed } from '../lib/rss';
export function GET() {
  return rssFeed();
}
