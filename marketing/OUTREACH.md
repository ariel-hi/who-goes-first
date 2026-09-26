# Audience and promotion

## Ready-to-use channels

The three original 1000 × 1500 images in `public/pins/` lead to specific, useful pages. Rebuild them with `node marketing/create-pins.mjs`. Their RSS feed is `/pinterest.xml`; it contains only these curated items, not the entire game catalog. The feed must be published on the claimed domain before it can be connected to a Pinterest business account. Use a public board such as “Board game night ideas.” Pinterest may create Pins after a feed is connected, so inspect the live feed and images first.

| Pin | Destination | Purpose |
| --- | --- | --- |
| `first-player-picker.png` | `/?utm_source=pinterest&utm_medium=organic_social&utm_campaign=first_player_picker` | Direct tool visit |
| `starting-rules.png` | `/games/?utm_source=pinterest&utm_medium=organic_social&utm_campaign=game_rules` | Rule search |
| `fun-questions.png` | `/house-rules/?utm_source=pinterest&utm_medium=organic_social&utm_campaign=house_questions` | Original questions |

Pinterest requires a claimed website to connect an RSS feed. A Pinterest business account can claim `whogoesfirst.fun` using a personalized HTML tag, an HTML file at the domain root, or a DNS TXT record. Do not add a guessed verification value. After claim, connect `https://whogoesfirst.fun/pinterest.xml` in Pinterest's bulk creation settings. The feed links and images must resolve on the claimed domain. See [Pinterest's claim instructions](https://help.pinterest.com/en/business/article/claim-your-website) and [RSS instructions](https://help.pinterest.com/en/business/article/auto-publish-pins-from-your-rss-feed).

## Bluesky drafts

Publish from the site's own account when available. Use one post at a time, with an accurate landing page and the corresponding image. Keep the link intact so consented visits can be attributed. Suggested posts:

1. “Game night stuck on who starts? We made a free first-player picker for 2–50 people. Add names or just use numbered seats; every entry gets the same chance.” `https://whogoesfirst.fun/?utm_source=bluesky&utm_medium=organic_social&utm_campaign=first_player_picker` — attach `first-player-picker.png` or let the link preview show the site's social card.
2. “A surprising number of games say who starts in the rulebook. Search our growing list by game and edition; each answer links to the publisher source.” `https://whogoesfirst.fun/games/?utm_source=bluesky&utm_medium=organic_social&utm_campaign=game_rules` — attach `starting-rules.png`.
3. “For a more playful start, draw an original house-rule question. If the table can't agree, use the fair picker to break the tie.” `https://whogoesfirst.fun/house-rules/?utm_source=bluesky&utm_medium=organic_social&utm_campaign=house_questions` — attach `fun-questions.png`.

Do not claim universal rule coverage, guaranteed search placement, certified randomness, or an official publisher relationship. The first two posts can work independently; space them so replies can be answered rather than publishing a batch without engagement.

## What to measure

In GA4, compare consented sessions and engaged visits for the fixed `pinterest / organic_social` and `bluesky / organic_social` campaigns. Also use Pinterest's outbound clicks and Bluesky's own engagement counts, since GA4 does not count visitors who decline analytics. Search Console can show clicks, queries, and indexing for the picker, guide, directory, and sourced rule pages. Review at least a week of data before changing copy or spending money; this site has no demonstrated paid acquisition return yet.

The tag receives only one of the fixed campaign source, medium, and name combinations after consent. It removes the rest of the query before loading analytics. No player data or search terms are included. Share links remain clean.

The recommended GA4 [`share` event](https://developers.google.com/analytics/devguides/collection/ga4/reference/events#share) counts a completed clean-link handoff after consent. Compare users who trigger `share` with consented active users for each acquisition campaign. A copied link or accepted browser sharing interface is a handoff signal, not proof of a social post or a new visitor. Track subsequent channel visits separately. The event uses only fixed labels (`method: link`, `content_type: tool`, `item_id: first_player_picker` for the picker); no roster, winner, reveal choice, or recipient is sent. Previous actions are discarded, and the expanded consent choice uses version 2 so earlier page-view consent is not reused.

## Economics decision gate

The current site is a new, free utility with no ads or affiliate links. Keep acquisition organic while the first few weeks of indexing and channel data settle. Record visits, engaged visits, and any real referral clicks before buying traffic. Paid impressions alone do not establish that people used the picker or found a rule.

Two future revenue paths are plausible, but neither should be turned on without a deliberate product and disclosure decision:

- **AdSense:** Google reviews the whole site and emphasizes original content and a usable experience. Test only after the main utility and content pages have stable traffic, and keep ads away from the Pick action. See [AdSense site readiness](https://support.google.com/adsense/answer/7299563) and [site review](https://support.google.com/adsense/answer/7584263).
- **Affiliate links:** A product recommendation is separate from a publisher's rulebook citation. If the site eventually recommends games or accessories for a commission, put a clear disclosure close to each paid link and keep rule answers editorially independent. The [FTC guidance](https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking) explains the disclosure standard. [Amazon Associates](https://affiliate-program.amazon.com/help/node/topic/G7MJTPEP9NC3YKMG) currently evaluates an application after three qualifying sales and can withdraw it if that threshold is not reached within 180 days, so apply only when the audience can plausibly use the links.

The static site currently has roughly 2,250 generated pages, well below [Cloudflare Pages' 20,000-file Free limit](https://developers.cloudflare.com/pages/platform/limits/). Keep an eye on build count and file count as the rule catalog grows. A paid hosting upgrade is not indicated by this build size alone.
