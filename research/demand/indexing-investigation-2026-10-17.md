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

## October 20: crawl evidence and content follow-up

Search Console's authenticated Crawl Stats report, updated through October 18, reports 4.16K requests, 99% HTTP 200, 132 ms average response time, and no host problems in the last 90 days. Its one DNS-error example is `/ads.txt` on September 24 at 8:57 p.m.; its one unreachable-page example is `/games/squeaky-gateongames-en/` on October 1 at 10:29 a.m. (times as displayed; no timezone shown). There is also one robots-unavailable request without a retained URL example. The response breakdown contains no HTTP 403, HTTP 429, or server-error category. This report has sampling/coverage limits and does not replace request-level hosting logs.

Independent live checks on October 20 found no DNS, TLS, redirect, XML, or compression defect. Google and Cloudflare DNS resolvers agreed; both IPv4 addresses served the sitemap index. Identity, gzip, and Brotli responses decoded to the same content. All six XML files returned 200 and passed strict UTF-8 parsing and the official sitemap schemas; the flat file exactly matches the four children, with 1,505 unique canonical URLs. Local IPv6 requests failed with `ENETUNREACH` for both this site and independent control hosts, so IPv6 remains a test limitation rather than a reproduced site failure. Cloudflare blocks Python's default urllib user agent with error 1010 while the audit and Googlebot user agents return 200; this is not evidence that verified Google crawlers are blocked and does not justify disabling security.

The October 10–13 Git history contains a social-campaign ordering change and removal of an opacity animation from the picker result. It contains no change to content, article templates, canonicals, robots, sitemaps, header generation, or build configuration. Of the initial 320 previously indexed URLs later observed excluded, 272 retained the same crawl timestamp and 302 had last crawls before October 13. Since the October 16 full refresh, 41 further PASS-to-excluded changes retain identical crawl timestamps, all before October 13. These observations do not support a universal failed recrawl of a new release as the explanation; observation dates are not exclusion dates.

The Sitemaps UI still reports “Couldn't fetch” for all six submissions. [Google's troubleshooting documentation](https://support.google.com/webmasters/answer/7451001) lists low crawl demand as one possible explanation as well as actual access failures. Low demand or Google's content selection remains a hypothesis, not a confirmed root cause. The current Cloudflare session is signed out and explicitly requires agreement to displayed terms before continuing; authenticated crawler/security logs remain unavailable pending that action-time confirmation. No speculative XML rewrite, security weakening, mass noindex change, or repeat unchanged indexing request is supported by these observations.

The source audit did establish a narrow editorial defect on Kemps, Nerts, and War: their publisher rules describe simultaneous play, yet the shared optional sections offered a first-player tie-break and picker suggestion. The three records now explicitly disable those inapplicable sections using existing flags and refreshed exact approval fingerprints. War's actual equal-rank card procedure remains in its clarifications. The browser regression checks those distinctions and retains Wingspan as a positive control for relevant picker guidance. This corrects misleading content; it does not establish the cause of the wider indexing loss.

## Monitoring follow-up — 20 October

At `c7e232bb`, the daily coverage cache still held the Burgundy reissue's 16 October 02:37:50 UTC inspection and 29 September crawl. The [scheduled checkpoint on 19 October](https://github.com/ariel-hi/who-goes-first/issues/27#issuecomment-6277001072) supplied newer evidence at 20:48:55 UTC: still excluded, but successfully crawled on 17 October at 18:27:36 UTC, after the source correction deployed. That checkpoint saves its own report and does not update the daily cache. Burgundy was also missing from the shared named inspection sample, so its daily record depended on the ordinary rotation and the weekly sample omitted it.

The exact existing reissue URL is now included in `indexingSamplePaths`, which feeds both the weekly named inspections and the daily bounded priority queue. All previous priorities remain. The daily 150-URL budget and oldest-attempt rotation are unchanged; this closes a monitoring gap without treating an older cached crawl as the latest evidence or claiming an indexing improvement.

## Content and duplication follow-up — 20 October

Fresh authenticated URL Inspection reads on October 20 still report **Crawled - currently not indexed** for all three priority pages. Each has a successful smartphone Googlebot fetch, crawling and indexing allowed, and the inspected URL as Google's selected canonical. The displayed last crawls are CATAN: October 17 at 11:25:35 a.m. Pacific; Wingspan: October 10 at 9:17:40 p.m. Pacific; Burgundy: October 17 at 11:27:36 a.m. Pacific. CATAN and Burgundy have no referring sitemap detected; Wingspan shows a temporary sitemap-processing error. All three have a referring internal page. These observations do not identify a duplicate canonical or prove a content-quality cause. Wingspan's recorded crawl still predates the October 17 improvements. Inspection evidence is retained locally under `artifacts/indexing-content-oct20/`.

The source review rechecked the actual rules and edition distinctions rather than increasing word counts. CATAN has no duplicate base-game article; CATAN Junior is a different game. Wingspan has one article for standard multiplayer and no same-game/source duplicate. Burgundy's original and reissue have distinct manuals and an actual starting-rule difference: the reissue explicitly gives the highest roll, while the original's cited setup merely says to roll to determine the starter. The October 17 correction already replaced the reissue's incorrectly reused original manual. No further redirect or canonical consolidation is justified by this review.

CATAN's existing answer was accurate. Two clarifications now distinguish beginner starting resources from the white-star settlement from variable-setup resources at the second settlement, and explain that regular turns return to clockwise order after reversed second placement. The fresh publisher PDF has the same SHA-256 as the previously reviewed copy; complete pages 4, 12, 13 and 15 were visually reviewed. These changes address concrete setup ambiguities for readers without changing the official opening rule or presenting the optional tie fallback as official.

Burgundy's opening answer was also accurate. Its revised details make the one-time setup roll distinct from subsequent bridge order, explain the white die's goods-placement purpose, and specify a ship's one-space advance onto the top of an occupied bridge space. They also give the team game's A1/B1/A2/B2 first-round exception from page 13. The fresh publisher PDF is unchanged (SHA-256 `46b59905e23e6b6d799abedb68db0f5400ff5876d25591cb1ebe50b469987242`), with complete pages 1, 3, 4, 5, 13, 14 and 16 visually reviewed. The original edition remains untouched.

Wingspan's fresh Rulepop HTML is byte-identical to the October 17 source reviewed in the selected standard-human-multiplayer mode (SHA-256 `3a73b87dbb08360f5c15d812567bf8f742a595b6db9e95d41ccb8e40c15efccf`). Its random opening selection, clockwise turns and token pass after rounds 1–3 are accurate and already sufficient for the first-player question. No change or artificial update date was made. A generic shared layout alone does not establish duplication; no template rewrite or added filler is supported by this review.

Cloudflare access was subsequently restored with the owner's confirmation. Authenticated samples for October 12–14 showed 116 verified Googlebot requests, all unmitigated; the two security events in that interval were unrelated WordPress-backup probes. The live Google sitemap-index test on October 20 at 10:13:29 a.m. Pacific succeeded. These samples do not expose every request's HTTP response or establish that sitemap processing has recovered. The earlier signed-out statement describes an interim access limitation, now resolved. There is still no supported crawler-blocking defect that warrants weakening security or rewriting valid XML. Detailed evidence remains local under `artifacts/indexing-technical-oct20/`.

The applicable [Google content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) emphasizes useful, accurate, clearly sourced information. The [coverage documentation](https://support.google.com/webmasters/answer/7440203) does not assign a single root cause to this exclusion state. Deployment checks can establish that corrections are live and crawlable; only a later indexing observation can establish recovery.
