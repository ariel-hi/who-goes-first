# Indexing investigation — 17 October 2026

## Baselines and limits

This investigation compares the coverage cache at `c7aab94c` (updated 17 October 14:23:04 UTC), the complete inspection refresh at `a1375d8d`, and the older cache at `24e4aa42`. These are URL Inspection observations of Google's indexed data, not live fetch tests or a simultaneous site-wide indexing percentage. The old cache preferentially retained successful PASS observations; its apparent indexed total was not a reliable current baseline.

The full refresh inspected 1,505 URLs on 16 October, with 1,503 successful inspections and two failures. It recorded 781 fresh PASS observations, 326 crawled/currently-not-indexed observations and 396 unknown-to-Google observations. One failed URL retained an older PASS, so the raw cache had 782 PASS records. Comparing stored states with the older cache found 320 previously-PASS URLs now excluded (300 game rules and 20 other URLs). That establishes a real loss but does not date each exclusion or identify Google's reason.

The priority checks in that refresh ran at about 02:17:58 UTC, before the 02:31 UTC deployment and the subsequent manual indexing requests. They are a predeployment baseline, not evidence that the deployed changes failed. The 17 October checks are later observations, although indexing decisions can lag a successful crawl.

## What the latest observations show

At `c7aab94c`, the raw cache contains 775 PASS, 333 crawled/currently-not-indexed and 397 unknown observations. One unknown URL's latest attempt failed; excluding it leaves 1,504 recent successful observations: 775 PASS, 333 excluded and 396 unknown. Since the full refresh, seven additional stored PASS observations changed to excluded, with no excluded-to-PASS changes observed:

- Abyss (`abyss-bombyx-us-en`)
- Ancient Finds (`ancient-finds-simplyfun-en`)
- Call to Adventure (`call-to-adventure-brotherwise-en`)
- Caverna: Cave vs Cave (`caverna-cave-vs-cave-mayfair-en`)
- Decrypto (`decrypto-scorpion-masque-en`)
- Dice Hospital (`dice-hospital-alley-cat-en`)
- Digger's Garden Match (`digger-s-garden-match-simplyfun-en`)

Rummy, Sherlock and Coin Flip remained excluded in the 17 October priority checks. Their reported last crawls are respectively 16 October 02:32:20, 02:34:20 and 02:36:20 UTC, after the previous deployment. The 7 Wonders Duel article and the ways-to-pick guide remained PASS controls. A later live Search Console inspection by the coordinating agent confirmed Coin Flip remained nonindexed, self-canonical, with a successful smartphone Googlebot crawl at 15 October 19:36 Pacific (16 October 02:36 UTC). Successful crawling and indexing are different outcomes.

## Cohort comparison

Counts below use the 1,339 approved rule records and coverage at `c7aab94c`, before this change. Unknown observations are kept separate from exclusions. The other 166 sitemap URLs include directories, tools, guides and hubs.

| Cohort | PASS | Crawled, not indexed | Unknown | Latest attempt unavailable |
| --- | ---: | ---: | ---: | ---: |
| Game-rule articles | 755 | 307 | 277 | 0 |
| Other URLs | 20 | 26 | 119 | 1 |

Game-specific stored guidance was measured from the answer, official tie-break, house fallback, clarifications, interpretation and uncertainty, excluding shared templates and source boilerplate. PASS and excluded articles both had a median of 57 words (means 67.84 and 71.61). Restricting the count to the answer and clarifications gave medians 35 and 33 (means 41.39 and 41.98). These distributions do not support adding text to reach an arbitrary word count. Corrections should add useful, source-supported distinctions.

Related/similar article links were recomputed from the actual selection code at this baseline. Indexed articles had a median of two inbound article links; excluded articles had three (means 3.69 and 4.01). Both groups had five outgoing links at the median. There were 244 indexed and 92 excluded articles with no inbound article-to-article links, but the server-rendered `/games/` directory linked every approved article. Its alphabet sections are HTML, not a JavaScript-only discovery path. Catan and Wingspan are prominently linked from the home page yet were excluded. These observations do not establish that prominence is irrelevant, but they do not support treating all excluded pages as orphans.

Publisher and source cohorts are mixed. Bicycle had 18 PASS / 16 excluded / 4 unknown; SimplyFun 15 / 13 / 0; Allplay 6 / 7 / 1; Gamewright 78 / 28 / 23; Hasbro 26 / 5 / 5. The `cdn.1j1ju.com` primary-source cohort had 96 PASS / 44 excluded / 43 unknown. Both publisher-hosted and archived sources occur in indexed and excluded cohorts. These are descriptive samples, with differing sizes and content, not evidence of a publisher or source-host penalty.

Publication-date metadata also does not isolate one affected batch: 23 September had 263 PASS / 100 excluded / 140 unknown; 24 September 151 / 60 / 73; 25 September 82 / 27 / 20; 26 September 95 / 33 / 30; 27 September 8 / 2 / 3; 28 September 29 / 25 / 2; 1 October 127 / 60 / 9. These are catalog metadata dates, not independently verified release dates or exclusion dates.

## Concrete edition/source correction: Burgundy

The original and reissued Burgundy articles cited the same archived PDF and SHA-256, despite representing different editions. The original article accurately identified that 12-page manual as the original English rules with a 2011 imprint. The reissue article incorrectly called it a 2019 manual and referred to an unsupported first-player tile. The original article was PASS; the reissue article was excluded. This is a verified editorial defect, not proof that it caused exclusion.

The [official Ravensburger item 26925 page](https://www.ravensburger.us/en-US/pdp/26925) identifies the reissued game with expansions and links its Instructions download directly to the [publisher's English manual](https://product-files.ravensburger.cloud/manuals/664462.pdf). That 16-page PDF has code 238798-A and a 2011/2020 imprint, so the corrected public label is **alea reissued English edition (2020 rulebook printing)**. The existing 2019 URL and separate legacy identity 271320 remain; no redirect or removal of the original identity 84876 is justified.

The corrected answer identifies the highest die result as the official opening criterion, uses the white die and bridge stack, and distinguishes the initial worker allocation from later bridge-based turns. It scopes the answer to the standard base game, with separate team/solo setup acknowledged. Equal initial rolls have no specified tie procedure in the cited setup; rerolling tied highest results is explicitly a house fallback. The separately indexed original article is unchanged.

Source custody: ignored `research/source-files/indexing-oct17-burgundy/ravensburger-26925-en.pdf`, SHA-256 `46b59905e23e6b6d799abedb68db0f5400ff5876d25591cb1ebe50b469987242`. Both `/root/indexing_recovery` and `/root` visually inspected complete rendered pages 1, 3, 4, 5, 13, 14 and 16. Page 3 establishes the highest-roll criterion and initial bridge stack; page 4 the first actual turn; page 5 ships and later order; pages 13–14 separate modes; page 16 the imprint. The manual/screenshots remain local evidence and are not redistributed in the site.

Across all 1,339 articles, only two normalized game-name plus identical primary-source URL groups were found: this Burgundy pair and Rebirth Ireland/Scotland. Rebirth is a valid shared-manual case: Ireland cites page 6 step 12, Scotland page 2 step 10, with different map-specific setup. Shared secondary comparison sources for Spin Circus UK/US, Ticket to Ride: Europe anniversary/refreshed editions and Valley of the Kings original/premium editions likewise do not justify consolidation; their primary sources and documented instructions differ. The 26 repeated-name groups (53 articles: 27 PASS / 12 excluded / 14 unknown) also include unrelated games with the same title. There is no basis for blanket edition redirects.

## Sitemap evidence and actions ruled out

The coordinating agent inspected Search Console on 17 October. Its Sitemaps UI showed six entries marked “Couldn't fetch” and zero pages; the sitemap-index detail showed last read 12 October. However, a live test of the exact `https://whogoesfirst.fun/sitemap-index.xml` at **08:33:41 Pacific** returned “URL is available to Google”, crawl allowed, successful page fetch and indexing allowed. Screenshot: ignored `artifacts/google-sitemap-live-test.jpg`. These different interfaces report different observations; a successful live test does not mean the Sitemaps report has cleared.

The deployment investigator also fetched all six public XML documents and validated them against official sitemap XSDs. Historical commit `7b055627` documents the same sitemap-fetch error on 27 September, before the 13 October impression drop. This does not establish the root cause of the stale fetch report. It supplies no evidence that rewriting valid XML or weakening security would fix indexing. A separate live test of the largest child sitemap, `/sitemaps/rules.xml`, at **08:39:34 Pacific** likewise returned “URL is available to Google”, crawl allowed, successful page fetch and indexing allowed. Both tests used Google's smartphone Inspection Tool; they confirm live fetchability, not successful sitemap processing or indexing.

## Priorities and verification

1. Correct the verified Burgundy source/edition defect, preserving distinct pages and honest printing labels. Validate the exact approved record and review its deployed HTML.
2. Improve source navigation and substantive edition-specific guidance only where the source audit finds a concrete gap. Generic tie/picker sections on simultaneous-play or dealer-led records are candidates for individual applicability review, not safe targets for blanket suppression.
3. Continue the bounded daily inspection rotation, keeping recent observations, historical records and failures separate. Compare the same priority URLs and controls after Google recrawls; do not repeatedly dispatch a full refresh or resubmit unchanged sitemaps.

This note records an investigation and local candidate correction. Deployment and postdeployment checks are recorded by the coordinating task. No observed metric establishes an algorithmic cause or guarantees reindexing.
