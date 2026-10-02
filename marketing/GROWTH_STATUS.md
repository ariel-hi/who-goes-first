# Growth launch status

## Automated acquisition configuration (2026-10-01 Pacific)

The owner asked Codex to take charge of automated distribution and improvements. Partnerships are secondary; no additional email batch is part of this change. `marketing/AUTOMATION.md` is the current operating procedure; older account-choice and credential blockers below are historical.

- GitHub repository secrets for the existing Bluesky handle and app password were confirmed on October 1. Earlier cloud runs 36883711277 and 36885091736 successfully published sourced rules. The new publisher mixes useful tools, sourced rules and hosting guides, caps originals at one per Pacific day, and uses a stable TID and commit guard to protect reruns. It checks live pages/images and verifies saved posts.
- Pinterest @whogoesfirst visibly published the five October 1 queued rules: CATAN, Ticket to Ride, UNO, Carcassonne and Monopoly. Example: [CATAN Pin](https://www.pinterest.com/pin/1093319247090590651/). Its analytics panel showed five impressions and zero outbound clicks for September 2–October 2 when checked October 1 Pacific. This is a small platform estimate, not evidence of acquired human visitors. Pin clicks and outbound clicks are different metrics.
- The existing queue has 114 dated campaigns through October 23 at five per UTC day. No published Pin IDs or dates were changed. The release ledger now removes duplicate lines, catches overdue items and leaves a repeated run unchanged.
- Search demand and consented acquisition reporting are configured for Mondays and Thursdays. The new improvement queue covers tools and guides as well as rules; small samples stay in watch.
- Three existing Codex routines were updated in place and confirmed ACTIVE: daily autonomous growth at 10am, community replies at 9am/5pm, and routine review at 11am/7pm. GitHub owns original social posts so the community routine does not duplicate them. Growth work now includes verified deployment and reviewed queue replenishment, with meaningful-change notifications.
- GitHub publishing and reporting run in the cloud. Interpretation, community replies and autonomous site edits need this computer and the desktop app running. Existing consent, clean Bluesky links and the October 15 discovery review are preserved.

## Overnight growth push (2026-09-30 → 2026-10-01 UTC)

The owner asked for an overnight push on visibility and discovery, which supersedes the earlier pause on new utility pages below.

- **196 new sourced starting rules** (catalog 1,143 → 1,339), focused on high-search classics and family games: Candy Land, Chutes and Ladders, Sorry! (Hasbro and Winning Moves classic editions), Trouble, The Game of Life (current, classic and Junior), Monopoly Junior/1980s/Ultimate Banking, Risk Junior/1959, Connect 4, Jenga, Stratego, Mouse Trap, Trivial Pursuit, Checkers, Othello, Dominoes, Mexican Train, Memory, 30+ Bicycle card games (Spades, Hearts, Euchre, Cribbage, Rummy, Gin, Go Fish, Crazy Eights, Bridge, Pinochle, Canasta, Presidents, LCR…), Phase 10, Skip-Bo, many UNO variants (No Mercy, Attack, Flip-family, Party, Teams, Giant), DOS, ~50 PlayMonster, ~20 Winning Moves and ~35 Gamewright titles. Sources are publisher PDFs/pages (Hasbro, Winning Moves, PlayMonster, Bicycle, Mattel, Gamewright, Catan, Cardinal, Ravensburger, ACF, World Othello Federation).
- **New tools (search entry points):** dice roller, random number generator, turn order generator, score keeper (`wgf:scores:v1`, noted in Privacy), turn timer, random letter generator (Scattergories) and draw-a-card. Linked from the tools hub, nav, sitemap, `llms.txt`, the Pinterest queue and every rule page; roll- and card-draw rules link the matching tool.
- **New theme hubs:** highest roll, dealer's left, silly contests (42), everyone plays at once (30).
- **Share images:** every tool, theme hub and publisher hub now has its own 1200×630 card instead of the generic image.
- **AI/search discovery:** `/llms.txt`, WebApplication structured data on tools, rule titles say "Official rule & rulebook" (Search Console showed rulebook-intent queries).
- **Search Console (owner account, Chrome `u/1`):** submitted the four child sitemaps and requested indexing for 10 key URLs. The daily upkeep job on Oct 1 counted 329 indexed of 438 inspected (75%).
- **Pinterest:** @whogoesfirst already auto-publishes `/pinterest.xml` to "Board Game Night Ideas"; the drip is now 3 pins/day from a ~120-item queue.
- **Bluesky (@whogoesfirst.fun, posted manually):** dice roller, silly-rules roundup, letter generator, Sorry! edition differences; followed back four board-game accounts.
- **Publisher outreach drafts** regenerated (102 publishers) in `PUBLISHER_OUTREACH.md`.

Still needs the owner: the `BLUESKY_APP_PASSWORD` secret (daily bot), Search Console **Full** permission for the service account (bot sitemap submission), and the browser CI suite that times out at 60 minutes (a fix task was offered).

## Priority after the 2026-09-27 site review

Keep the picker and reviewed starting rules as the primary journeys. Pause new utility categories and additional affiliate placements while search discovery and returning use remain unproven. Continue correcting sources and filling high-priority missing rules. Review the existing Search Console sitemap/indexing report, then use its impressions and clicks together with consented page visits to decide which journeys merit further work. Do not add search-query or player-level tracking to answer this question.

Last checked: 2026-09-28 UTC. This is an observation log, not a claim of traffic growth.

## Published and verified

- The picker, rule directory, original house prompts, choosing guide and printable game-night cards are public at `https://whogoesfirst.fun/`.
- Three original Pinterest assets and their curated `/pinterest.xml` feed are live. Destination links use fixed campaign labels.
- Picker, rule and printable-page sharing uses clean links. Optional measurement counts successful handoffs only after the expanded analytics consent.
- The printable page and its PDF responded anonymously with HTTP 200. The PDF matches the reviewed file and declares the page as its preferred canonical using a `Link` response header.
- The Briefcase and 20th Century publisher citations are repaired. The latter now points to a visually verified publisher booklet and identifies its October 2010 edition. Four Lookout citations that denied automated requests loaded as PDFs in Chrome; see the source-availability audit.
- The live printable page was checked in Chrome at a 320 × 568 viewport with its real analytics prompt open. Both consent buttons fit and could be reached. After “No thanks,” the prompt closed and the download action and sheet preview remained readable without horizontal clipping. No Google analytics consent was granted for this check; the temporary viewport was reset.

## Search discovery

Search Console accepted the printable page into a priority crawl queue on 2026-09-26 UTC. Its inspection before submission said the URL was unknown to Google. Submission is not indexing, ranking or a search visit. Do not repeatedly submit the same unchanged page.

The performance report still says it is processing data and to check again in a day or so. Treat clicks and impressions as unavailable, not zero.

On 2026-09-28, the Search Console Sitemaps UI showed **Couldn't fetch** for both submitted `/sitemap-index.xml` and `/sitemap.xml`, with no last-read date and zero discovered pages. The live flat sitemap, index, and four child sitemaps all returned HTTP 200, parsed as XML, and contained 1,280 total canonical URLs. Google's live URL Inspection for the index and flat sitemap reported a successful fetch; the index explicitly showed crawling allowed. Both existing sitemap URLs were resubmitted once through the Sitemaps UI. Submission succeeded, but the table still showed Couldn't fetch immediately afterward. This is unresolved until Search Console records a successful read. Do not repeat submissions or relax Cloudflare security without evidence of a continuing crawl failure. [Google's Sitemaps report guide](https://support.google.com/webmasters/answer/7451001?hl=en) distinguishes submission from a successful fetch.

### Discovery beyond Google

Cloudflare's domain Caching → Configuration page shows **Crawler Hints enabled** for `whogoesfirst.fun` on 2026-09-26 UTC. [Cloudflare documents that this feature supports IndexNow](https://developers.cloudflare.com/cache/advanced-configuration/crawler-hints/). No setting was changed and no new terms were accepted.

Live HTML responses showed `CF-Cache-Status: DYNAMIC`, while Cloudflare documents a cache-MISS trigger. This does not establish that any particular page was notified. An optional, explicit `search:notify` command checks selected live canonical pages and records an IndexNow receipt after a meaningful content release. After the 20th Century citation repair passed both exact-head CI runs and production deployment, a live preflight passed and that one corrected rule page was submitted on 2026-09-26 at 05:23:48 UTC. IndexNow returned HTTP 202: received with key validation pending, not indexing or traffic. No older-page batch was sent. The receipt stays local in the notification worktree's ignored ledger. See the release procedure and limits in `RUNBOOK.md`.

Two consecutive rule-page responses differed only in Cloudflare's encoded correction-email link. The repeat guard now hashes that decoded destination, so a changing encoding key alone does not count as new content. Never use hash variation to justify another notification of an unchanged page.

The live `/robots.txt` returned HTTP 200, allows all paths, and advertises the canonical sitemap. `/sitemap.xml` returned HTTP 200. Bing's exact `url:https://whogoesfirst.fun/` lookup returned no result during this check. This is an observed lack of a homepage result, not a diagnosis of a crawling failure or evidence about every catalog page.

Allow time for discovery and look for a meaningful change through the existing follow-up. If Bing remains absent, a verified Bing Webmaster Tools account can provide its own crawl diagnostics. Do not import Google properties or authorize a new account connection without the owner's approval. Native IndexNow support does not prove that a particular URL was submitted or indexed. The [IndexNow FAQ](https://www.indexnow.org/faq) recommends sitemaps for the full inventory and notifications for meaningful recent changes; it does not support repeated bulk submissions of unchanged pages as a substitute for discovery.

### Bing Webmaster Tools (2026-09-27)

`https://whogoesfirst.fun/` was imported from Search Console into Bing Webmaster Tools under the owner's Google sign-in (other Search Console properties were deliberately not imported). Bing listed `sitemap.xml` as Processing. Check its Site Explorer and URL Inspection for crawl or index issues before changing configuration.

## Measurement and economics

The Pages build command was changed to `npm run build` and the saved configuration was verified on 2026-09-26 UTC. The prior production log showed an automatic dependency install followed by a second `npm ci` in the custom command. Removing that duplicate follows [Cloudflare's Astro build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/). Preview deployment `db806029` succeeded in 53 seconds with one dependency install, and the following production deployment `397ce3ef` succeeded. These are observations from different builds, not a controlled speed comparison or evidence of a lower bill. Production and preview now have `NODE_VERSION=22.23.2` saved; the effective runtime still needs deployment-log confirmation.

The CI workflow retains its complete verification, release and browser job for pull requests, `main` pushes and manual dispatches. Removing the additional branch-push trigger avoids two full jobs for one proposed revision. Earlier exact-head push and pull request jobs each spent about 14 minutes in the browser step; no billed savings are established for this public repository.

Cloudflare's separate domain RUM option was disabled on 2026-09-26 UTC. The Pages project setting was already off, but the proxied domain still injected a Cloudflare Insights script. The domain now shows RUM disabled, and fresh Chrome and anonymous HTTP checks show the beacon removed. The existing CSP excludes that script; it was not added to the consented measurement scope. No visitor-performance improvement is claimed from the removal alone.

The public GitHub repository's About section now links directly to `https://whogoesfirst.fun/`, describes the free picker, sourced rules and printable cards, and has five relevant topics: board-games, tabletop-games, random-picker, astro and typescript. The saved homepage and topics were verified through GitHub's public repository API. This makes the existing project a usable referral entry point; no visitor or search-ranking lift is established by the metadata change alone. The README update puts visitor destinations before development instructions.

The GA4 home report for September 18–24 shows three active users, three direct sessions and zero key events. This small consented sample may include internal activity. It does not establish external acquisition, retention or paid return.

The live website stream (`G-XDVR78FJXY`) lists Page views as its only active enhanced measurement. This matches the site's privacy notice. Fixed consented sharing is implemented separately by the site. Automatic form, site-search, outbound-click, scroll, video and download collection should remain off under the present consent scope.

Use the existing quiet daily follow-up for delayed Search Console processing and meaningful traffic changes. No new monitor is needed. Keep paid acquisition on hold until real channel visits and useful engagement are observed.

## Next actions that need an account decision

The prepared Pinterest and Bluesky launches have not been posted. The available Pinterest profile belongs to Word King; the available Bluesky profile belongs to Edamame Makers. The owner has not yet selected those profiles or separate Who Goes First profiles. Existing account-choice questions remain pending. Do not treat silence as a publishing decision or create an account requiring new terms without the owner's action.

After the account decision, publish one prepared campaign, record the actual post/Pin URL, and compare platform outbound clicks with consented campaign sessions. Answer replies before expanding the campaign. The public assets, destinations and draft wording are in `OUTREACH.md`.
