# Audience and promotion

Updated October 1, 2026 (Pacific). The existing Who Goes First Pinterest and Bluesky accounts are active. [AUTOMATION.md](AUTOMATION.md) controls cadence and authorization; [GROWTH_PLAYBOOK.md](GROWTH_PLAYBOOK.md) connects search, distribution, community, host resources and partnerships to measurable outcomes. Personalized, source-verified next-wave outreach is in [VERIFIED_OUTREACH.md](VERIFIED_OUTREACH.md); completed email history stays in [OUTREACH_LOG.md](OUTREACH_LOG.md).

## Ready-to-use channels

Pinterest @whogoesfirst already uses the claimed-domain RSS connection to the public “Board Game Night Ideas” board. The current `/pinterest.xml` feed includes the three original curated campaigns below and released entries from the reviewed rule/tool queue in `src/lib/pinterest-pins.ts`. GitHub releases five queued Pins per UTC day; a feed release is not proof of publication. Inspect the actual profile and retain its real Pin URLs. Keep existing GUIDs/dates stable and use the replenishment rule in `AUTOMATION.md`.

The three original 1000 × 1500 images in `public/pins/` still lead to specific, useful pages. Rebuild those originals with `node marketing/create-pins.mjs`. The feed is curated and does not dump the whole game catalog.

The production picker, rule directory and house-question pages also offer a plain **Save on Pinterest** link. It opens Pinterest's Save interface with the matching original image, a fixed description and a clean canonical destination. A visitor chooses a board and confirms on Pinterest. The link does not load Pinterest scripts, replay private player state, or report that a Pin was saved. Previews do not expose this action. This visitor action is separate from the owner's account launch below. A live preview of the documented link format loaded the correct image and description on 2026-09-26 UTC; no Pin was saved during verification. See [Pinterest's Save button documentation](https://developers.pinterest.com/docs/web-features/buttons/).

| Pin | Destination | Purpose |
| --- | --- | --- |
| `first-player-picker.png` | `/?utm_source=pinterest&utm_medium=organic_social&utm_campaign=first_player_picker` | Direct tool visit |
| `starting-rules.png` | `/games/?utm_source=pinterest&utm_medium=organic_social&utm_campaign=game_rules` | Rule search |
| `fun-questions.png` | `/house-rules/?utm_source=pinterest&utm_medium=organic_social&utm_campaign=house_questions` | Original questions |

The existing claim and RSS connection are established. For recovery, Pinterest supports a personalized HTML tag, root HTML file or DNS TXT record; do not add a guessed verification value or create a replacement connection without evidence of a failure. The feed links and images must resolve on the claimed domain. See [Pinterest's claim instructions](https://help.pinterest.com/en/business/article/claim-your-website) and [RSS instructions](https://help.pinterest.com/en/business/article/auto-publish-pins-from-your-rss-feed).

## Printable table cards

The public `/printable-game-night/` page offers a one-page PDF with two cut-out QR cards for clubs, cafés and casual hosts. The code points to the clean picker URL, `https://whogoesfirst.fun/`, and includes no roster, saved result or campaign identifier. Print in portrait on US Letter, or fit to A4. The page explains how to test the code, includes a sheet preview and links back to the picker and sourced rules.

Hosts can download and print without analytics consent or a signup. The page’s optional Share button uses the existing consented `share` event and fixed `site_page` label. A share handoff or a printed card does not prove an acquired visitor; clean QR visits cannot be separated from other direct visits. Keep channel claims limited to observed evidence.

The PDF response declares the printable page as its preferred canonical using an absolute `Link` HTTP header. This points search engines toward the page with the download and printing instructions; it is a preference, not a guarantee of indexing or ranking. See [Google’s canonical-header guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls).

## Bluesky drafts

The production picker, rule directory and populated house-question page also offer **Share on Bluesky** beside Pinterest. Their draft text uses the public page title and canonical link. These links share a public page, never a roster, selected question, search query or result.

Production rule pages and the printable-card page offer a plain **Share on Bluesky** action beside their existing sharing control. It opens an editable draft with the public title and clean canonical link; the visitor still confirms publication. No Bluesky script or new analytics event is loaded. Previews and draft rules do not expose this action. This visitor workflow does not choose the owner's launch account. See [Bluesky's action intent documentation](https://bsky.network/docs/intent-links/).

The existing @whogoesfirst.fun account is active. GitHub owns one original per Pacific day; the twice-daily community routine handles relevant replies and notifications. Keep every Bluesky destination clean, with no UTM query. The examples below are a copy reference for reviewed campaigns, not permission to publish extra originals alongside the scheduled post:

1. “Game night stuck on who starts? We made a free first-player picker for 2–50 people. Add names or just use numbered seats; every entry gets the same chance.” `https://whogoesfirst.fun/` — attach `first-player-picker.png` or let the link preview show the site's social card.
2. “A surprising number of games say who starts in the rulebook. Search our growing list by game and edition; each answer identifies its cited rulebook.” `https://whogoesfirst.fun/games/` — attach `starting-rules.png`.
3. “For a more playful start, draw an original house-rule question. If the table can't agree, use the fair picker to break the tie.” `https://whogoesfirst.fun/house-rules/` — attach `fun-questions.png`.

Do not claim universal rule coverage, guaranteed search placement, certified randomness, or an official publisher relationship. Answer actual replies before expanding effort; do not duplicate the daily original through a desktop routine.

## Returning visitors

The production picker offers home-screen shortcut metadata with the site's original dice mark in 180, 192 and 512 pixel PNG icons. Its manifest launches the clean homepage in a browser. Only the homepage links that manifest, so saving an individual rule page keeps ordinary page-bookmark behavior. About explains how to bookmark the picker or look for **Add to Home Screen** in a phone browser's share/menu options, and says an internet connection is needed to reopen it.

Rebuild the icons with `node marketing/create-home-icons.mjs`. This adds no install prompt, service worker, notifications or new analytics event. A manifest is browser metadata, not evidence that someone saved or reopened the site. Physical iOS and Android installation remain outside the desktop release checks. See [Apple's home-screen icon guidance](https://developer.apple.com/videos/play/wwdc2022/10048/) and the [web app manifest reference](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest).

## What to measure

In GA4, compare consented sessions and engaged visits for supported fixed `pinterest / organic_social` campaigns. Bluesky links are clean, so inspect available referral/landing-page samples alongside its actual post engagement; do not promise per-post campaign attribution. Also use Pinterest's outbound clicks, since GA4 does not count visitors who decline analytics. Search Console can show clicks, queries, and indexing for the picker, guide, directory, and sourced rule pages. Review at least a week of data before changing copy or spending money; this site has no demonstrated paid acquisition return yet.

The tag receives only approved editorial campaign source, medium and name combinations after consent, and removes the rest of the query before loading analytics. The October 1 review found the newer Pinterest queue labels missing from the four-label legacy allowlist; release `ab1736b0` repairs both loaders with a finite set derived from reviewed queue entries. Its live deployment was verified with all 19 approved campaign labels. Use post-release observations for those newer campaigns; older visits may lack attribution. No publisher UTMs, player data or search terms are added. Share links remain clean.

The recommended GA4 [`share` event](https://developers.google.com/analytics/devguides/collection/ga4/reference/events#share) counts a completed clean-link handoff after consent. The picker has “Share” and sourced rule pages have “Share this rule.” Compare users who trigger `share` with consented active users for each acquisition campaign. A copied link or accepted browser sharing interface is a handoff signal, not proof of a social post or a new visitor. Track subsequent channel visits separately. The event uses only fixed labels (`method: link`, `content_type: tool`, `item_id: first_player_picker` for the picker; `content_type: page`, `item_id: site_page` for a rule page); no roster, winner, reveal choice, or recipient is sent. Previous actions are discarded, and the current consent key is version 3; earlier allowances are not reused for the expanded scope.

## Economics decision gate

Keep acquisition organic while the first few weeks of indexing and channel data settle. Check current live configuration and `GROWTH.md` for monetization state; older launch notes do not establish which settings are active. Record visits, engaged visits, and any real referral clicks before buying traffic. Paid impressions alone do not establish that people used the picker or found a rule.

Ad and affiliate settings require a deliberate product and disclosure decision; this outreach review does not change them:

- **AdSense:** Google reviews the whole site and emphasizes original content and a usable experience. Test only after the main utility and content pages have stable traffic, and keep ads away from the Pick action. See [AdSense site readiness](https://support.google.com/adsense/answer/7299563) and [site review](https://support.google.com/adsense/answer/7584263).
- **Affiliate links:** A product recommendation is separate from a publisher's rulebook citation. If the site eventually recommends games or accessories for a commission, put a clear disclosure close to each paid link and keep rule answers editorially independent. The [FTC guidance](https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking) explains the disclosure standard. [Amazon Associates](https://affiliate-program.amazon.com/help/node/topic/G7MJTPEP9NC3YKMG) currently evaluates an application after three qualifying sales and can withdraw it if that threshold is not reached within 180 days, so apply only when the audience can plausibly use the links.

Check actual build/file counts against [Cloudflare Pages' limits](https://developers.cloudflare.com/pages/platform/limits/) as the rule catalog grows. An old catalog-size estimate alone is not a reason to upgrade hosting.
