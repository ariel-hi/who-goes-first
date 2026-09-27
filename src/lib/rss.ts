import { getCatalog } from './content/catalog';
import { ruleHeading } from './rule-copy';
import { siteSettings } from './site';

const escape = (text: string) => text.replace(/[&<>"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char]!);

/** Most recently approved or revised starting rules, newest first. Feed readers and search engines only; not linked from the UI. */
export function rssFeed(limit = 30): Response {
  const settings = siteSettings();
  const items = settings.production
    ? getCatalog()
      .filter(rule => rule.materiallyUpdatedAt)
      .toSorted((a, b) => b.materiallyUpdatedAt!.localeCompare(a.materiallyUpdatedAt!))
      .slice(0, limit)
      .map(rule => {
        const url = `${settings.url}/games/${rule.slug}/`;
        const pubDate = new Date(`${rule.materiallyUpdatedAt}T00:00:00Z`).toUTCString();
        return `<item><title>${escape(ruleHeading(rule.gameName))}</title><link>${url}</link><guid>${url}</guid><pubDate>${pubDate}</pubDate><description>${escape(rule.firstPlayerRule)}</description></item>`;
      }).join('')
    : '';
  const body = `<rss version="2.0"><channel><title>Who Goes First?</title><link>${settings.url}/</link><description>Recently added or revised starting rules, sourced from publisher rulebooks.</description><language>en-us</language>${items}</channel></rss>`;
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>${body}`, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
