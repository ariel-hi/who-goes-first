# Discovery and repeat-use release — October 1, 2026

## Observed baseline

Read in the owner's existing Search Console URL-prefix property on October 1 (America/Los_Angeles). The Web report selected three months; the chart's available data covered September 24–29, 2026. It reported 448 impressions, 2 clicks, 0.4% CTR and average position 7.5. The top visible queries included “first player picker” (7 impressions), “who goes first” (2), and specific rulebook searches. These are small, delayed samples, not evidence of substantial acquisition or a site-wide ranking guarantee.

The saved October 1 indexing sample inspected 438 of 1,420 sitemap URLs: 329 indexed and 109 unknown. This sample does not establish full coverage. The older weekly GA4 report covers a different period and must not be combined with this search baseline.

## Changes and hypothesis

- Add eight edition-linked, sourced answers and existing theme collections below the homepage picker. Visitors and crawlers can reach useful rules without first entering a search. Counts and answers come from the approved catalog, with empty-catalog states preserved.
- Describe the tools hub's actual range: dice, scores, teams and timers as well as picking a player. Give each tool three relevant next steps and clean-link sharing, using the existing consent mechanism.
- Give Pinterest sharing the current page's artwork: curated portrait Pins when available, then its existing rule, theme, publisher or tool card. Existing feed GUIDs and release dates stay stable.
- Publish one original game-night checklist that works on a phone and prints cleanly. Link it from home, tools, the rule library and printable cards; include it in the sitemap and append one campaign to the existing Pinterest queue.
- Make the existing badge copyable and expose the existing new-rules RSS feed. These provide reusable referrals and a way to return.
- Allow large Google image previews only on production, indexable pages. Google documents this setting as one part of its image guidance; eligibility does not guarantee Discover distribution. [Google Discover guidance](https://developers.google.com/search/docs/appearance/google-discover).

Hypothesis: useful entry points, accurate previews and relevant internal paths will increase qualified organic visits, successful shares and repeat use. No traffic lift is claimed at release.

## Evaluation

Review after October 15, 2026, allowing for crawling and reporting delay. Use the existing weekly growth job and account reports; no extra scheduler or telemetry is introduced.

Compare Search Console clicks/impressions for the homepage, tools hub and checklist with their previous period. Inspect whether the checklist is indexed. Treat a newly indexed page separately from ranking improvement. Check consented GA4 organic/referral sessions and existing fixed share events as aggregate samples. Inspect the existing Pinterest campaign's outbound clicks when the appended checklist Pin is released; a live feed is not proof that Pinterest published it. Keep the current Pinterest cadence and do not repost unchanged items.

The first week of a new domain is too short to infer a stable trend. Record absent data as unavailable; do not treat consented Analytics totals as all human visitors or attribute increases to this release without supporting channel evidence.

## Measurement follow-up — October 2, 2026 UTC

The owner's existing GA4 session opened property `555898594` for September 28–30, matching the weekly baseline and its two UTC days of reporting lag. September 28 is a partial measurement-guard rollout day. The Events report showed 100% available data, all five event rows, 312 events and 55 total users:

| Event | Event count | Total users |
| --- | ---: | ---: |
| page_view | 140 | 55 |
| session_start | 60 | 55 |
| user_engagement | 59 | 19 |
| first_visit | 52 | 52 |
| affiliate_outbound | 1 | 1 |

Filtering the table to `share` returned zero events, zero users and no data rows: no recorded share events in this window, not proof that actual sharing was absent. The same dated Retention report showed 52 new users and three returning users, with 100% available data. Google's returning-user measure describes users with a previous session; it does not establish retention of picker users. [Events report definitions](https://support.google.com/analytics/answer/12926615?hl=en), [user metric definitions](https://support.google.com/analytics/answer/12253918?hl=en).

This small aggregate may include synthetic or bot visits, and analytics choices can suppress observations. It establishes neither human retention nor traffic lift. Completed picks and rule-to-picker actions remain unmeasured. Existing account access was restored without new grants; no report configuration or telemetry changed. Preserve the current hypothesis, scope and October 15 evaluation.

Evidence: [events report](../artifacts/growth/ga4-baseline-events-2026-10-02.txt) ([capture](../artifacts/growth/ga4-baseline-events-2026-10-02.jpg)), [share filter](../artifacts/growth/ga4-baseline-share-2026-10-02.txt) ([capture](../artifacts/growth/ga4-baseline-share-2026-10-02.jpg)), and [retention report](../artifacts/growth/ga4-baseline-retention-2026-10-02.txt) ([capture](../artifacts/growth/ga4-baseline-retention-2026-10-02.jpg)).
