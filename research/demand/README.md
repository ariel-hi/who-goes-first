# Search demand research queue

`search-console.json` is rewritten every Monday by the Growth automation workflow (`scripts/growth-weekly.ts`). It ranks what people search for, so research effort goes where readers are.

- `missingRules` — board games with **no sourced rule yet**, ranked by Google impressions for starting-player queries that name them ("who goes first in …", "… first player"). Research these first, in order.
- `unmatchedQueries` — starting-player searches naming no game in the discovery index. Candidates for new inventory identities after checking the name.
- `lowClickPages` — published rule pages that appear in results but are rarely clicked. Check that the title and description state the answer clearly.

Demand only sets priority. It never substitutes for a primary source, and every rule still goes through the normal review in `CONTENT_REVIEW.md`. `weekly-report.md` is the latest human-readable summary.

## Search indexing diagnostics

The weekly job writes `indexing.json` from Search Console's Sitemaps and URL Inspection APIs. It checks the submitted sitemap list and six named URLs: the home page, two catalog hubs, and three established rule pages. Inspection describes Google's indexed version of each URL; it is **not** a live-page test or a site-wide indexed-page count. A missing inspection or API error is recorded as unavailable for that run instead of preserving stale data. Use the sample to investigate specific discovery, crawling, or exclusion problems before changing the public site.

## Country traffic for revenue planning

The weekly job also writes `country-traffic.json` for the same 30-day GA4 window as `traffic-metrics.json`. It requests `countryId`, `sessions`, and `screenPageViews` and records whether Google reports thresholding, an `(other)` row, or truncation. If the country request fails, the file says `unavailable` for the current window rather than retaining a stale prior snapshot.

The US/CA/GB/AU session subtotal is a **named subset** of Journey by Mediavine's Tier 1 examples, not a complete Tier 1 count or an eligibility decision. The US/CA/GB/AU/NZ view subtotal is a GA4 screen/page-view observation for comparison with Raptive's country criteria, not proof of qualifying website pageviews. Missing or suppressed country rows remain outside those subtotals. The report never estimates cash revenue or expenses from traffic.

## Traffic acquisition

The same weekly GA4 window also produces `acquisition.json`: session default channel group, session source/medium, sessions, and engaged sessions. This identifies which reported channels bring visits and whether those sessions engage. The job refuses incomplete or duplicate source rows, records Google's quality flags, and compares the row sum with the undimensioned total. GA4 dimension row sums can differ from deduplicated totals; when counts do not reconcile, the report shows their discrepancy and withholds percentage shares. If the query fails, the current window is marked unavailable rather than carrying forward an older attribution. GA4 sessions and engagement do not establish verified human visitors, campaign profit, or revenue.
