# Search recovery plan — November 2026

## What happened

- Search Console (property `https://whogoesfirst.fun/`, Web) shows impressions starting 24 September 2026, the day after roughly 1,350 templated rule pages launched. Daily impressions rose to about 300 (peaks around 1 and 10 October), then fell off a cliff on **12–13 October**. Since then the site has had 0–3 impressions a day.
- 28-day totals: 3,520 impressions / 32 clicks (14 Sep–11 Oct) versus 255 / 3 (12 Oct–8 Nov).
- Google's **September 2026 spam update** ran from 24 September to 8 October. The drop followed four to five days later.
- **Manual actions: none** (checked 12 November 2026). The demotion is algorithmic.
- The whole site was demoted, not only rule pages: `/coin-flip/`, `/tools/`, `/games/` and `/board-games/` moved to "Crawled – currently not indexed". Crawl Stats show no host problems, robots and canonicals are correct, and Googlebot gets fast HTTP 200s. This is a quality judgement, not a technical fault.
- Each rule page has about 35–57 words of game-specific guidance. The rest of the page is shared parts repeated across all 1,339 pages: tie fallback, affiliate box, share and embed blocks, similar-rule links. That pattern matches Google's "scaled content" signals.

## What this change does

1. **Only 148 rule pages stay indexable** (`src/lib/indexing-policy.ts`), chosen as:
   - the home page quick rules,
   - the curated popular-games list in `src/lib/pinterest-pins.ts`,
   - every rule page with at least 10 impressions in the pre-drop window.
   The list is static on purpose, so it does not change with daily metrics.
2. **All other rule pages stay live and linked but carry `noindex, follow`**, and leave the sitemaps. Visitors, social posts, embeds and Pinterest links keep working.
3. **Publisher hubs (`/publishers/…`) carry `noindex, follow`** and leave the sitemaps.
4. **Board-game chooser pages** stay indexable only when at least one of their editions is indexable.
5. **Sitemaps go from 1,505 URLs to 204.** IndexNow already skips noindex pages (`scripts/lib/publish-pages.ts`), and the daily indexing upkeep reads the sitemap, so both shrink automatically.

## After deploy (manual, in Search Console)

- Resubmit `https://whogoesfirst.fun/sitemap-index.xml` once, under Sitemaps.
- Request indexing for the highest-value pages only: `/`, `/coin-flip/`, `/random-number-generator/`, `/ways-to-pick-who-goes-first/`, `/choose-who-goes-first/`, `/card-draw/`, `/finger-chooser/`.
- Do **not** use the Removals tool for the noindexed pages. Let Google recrawl them.

## Next steps (not in this change)

- Deepen the kept pages with genuinely useful, game-specific detail: variants, setup order, common disputes. Do not pad word counts.
- Strengthen the tool pages (home picker, coin flip, number generator). They earned impressions before the drop and are the site's core purpose.
- Pause bulk rule publishing. Add new rule pages to the index list only when they have substantial guidance or proven demand.
- Expect recovery over weeks to months. It most often shows up at a core update. Track it in the weekly report: impressions on kept pages and the tool pages, and indexed counts from the daily upkeep.
