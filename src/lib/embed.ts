import type { PublicRule } from './content/schema';
import { ruleHeading } from './rule-copy';

const escape = (text: string) => text.replace(/[&<>"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char]!);

/** Plain HTML with a normal link: no script or iframe, so it works on any blog, forum or CMS. */
export function embedSnippet(rule: Pick<PublicRule, 'slug' | 'gameName' | 'firstPlayerRule' | 'editionLabel'>, origin: string): string {
  const url = `${origin}/games/${rule.slug}/`;
  return `<blockquote class="whogoesfirst-rule" cite="${url}">\n  <p><strong>${escape(ruleHeading(rule.gameName))}</strong> ${escape(rule.firstPlayerRule)}</p>\n  <p>— <a href="${url}">Official starting rule on Who Goes First?</a> (${escape(rule.editionLabel)})</p>\n</blockquote>`;
}

export const badgeSnippet = (origin: string) => `<a href="${origin}/" title="Pick who goes first">\n  <img src="${origin}/badge.svg" alt="Who goes first? Pick a player" width="220" height="48">\n</a>`;
