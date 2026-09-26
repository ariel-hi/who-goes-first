# Prepared search and three discovery identities — 2026-09-26 UTC

The active directory now contains **4,984 identities**. It has **881 approved edition records** covering **875 identities**, with **4,109 identities** awaiting primary-source rule research. The portable pool remains 361 criteria and the public house pool 60 prompts. These counts do not establish all board games worldwide.

## Three independently reviewed identities

Ironwood 407343 and Beyond the Horizon 421310 have exact numeric BGG hrefs on their saved publishers' Super Meeple product pages. Wroth 414117 has an explicit Frosted announcement connecting Wroth, its Groll edition and Chip Theory Games; its numeric provenance remains Wikidata-only. No BGG destination was fetched. The complete previous holds, original P2339 statements, full entity/publisher contexts and age/year/mode conflicts remain preserved.

Root independently rehashed 19 Ironwood evidence files and 29 Wroth/Horizon files, compared full snapshot entities/current holds/publisher websites and reparsed original HTML. Only these three decisions, four new primary-source registrations and derived method/counts changed. See [Ironwood enrollment](sep26-ironwood-identity-progress.md) and [Wroth/Horizon enrollment](sep26-two-identity-progress.md).

The native snapshot remains **3,316,962 bytes**, SHA256`d13f929adfeb2a0b8a163497b5b45ff3627c7914e7381c86a74152fa575e31b0`. Accepted decisions now number **28**, holds **260**, reviewed 35 / unreviewed 253, reviewed holds 7. The exact CRLF decision file is **453,033 bytes**, SHA256`a68386a3d07f12cdbe0ad1697ac06a09823e981814236f12c9c1667812697174`. Existing Git attributes preserve these bytes. Root's combined structural check confirms only 407343/414117/421310 changed and all prior sources/other decisions remain equal to checkpoint `d50d749`.

These enrollments approve no rule. Actual compiled directory searches show each new name with “No checked starting rule yet.” No individual pending answer or inferred edition equivalence is published.

## Search work measured and reduced

The rules directory previously parsed 881 metadata records, normalized names/aliases/query repeatedly and moved every row for each input event. Names and aliases are now prepared once per page; the home lookup prepares its lazy index once per successful request. Query normalization occurs once per search. The ordinary `searchRank` interface remains responsive to changed records; prepared records are explicit snapshots. Exact/prefix/contained/edition/fuzzy ranking, accent folding, aliases and 100-character bounds are unchanged.

Only visible links need rank order. Hidden rows keep their positions; clearing restores original order from the end. Rows already in place are left connected. When a query newly hides more than half the catalog, the same list is temporarily detached, updated and restored in `finally` at its original sibling. The search input stays connected outside that list. This is a conservative measured heuristic, not an optimal threshold claim.

Four candidate implementations were measured before the final choice. Earlier variants removed parsing but regressed the broad-to-small transition. All measurements remain in distinct ignored folders; none was replaced by the final result. A bounded 350-sample Chromium experiment compared direct, detach, temporary-hide, append and replace interventions. Unconditional interventions regressed small searches, so the final implementation stages only large collapses. Ten additional CDP samples attributed most of the forced-read difference to style recalculation: CPU 4 direct 55.365 ms versus detached 2.447 ms; geometric layout was 0.789/0.624 ms. These counters do not identify a particular selector or prove an engine algorithm.

Final compiled output was measured with the same seven-query sequence, five repeats and CPU rates1/4: 70 samples per before/final run, all 881 nodes and result counts retained. Per-input JSON parsing fell from 881 calls to 0. The observer measured child changes inside the list: 1,762 before each query; 120 for final clear/broad search and 0 for the other queries. Detaching/restoring the list itself occurs at its parent and is outside that child-mutation count.

| Query | CPU 4 before: input + forced style/layout | Final | Results |
| --- | ---: | ---: | ---: |
| Clear | 40.3 ms | 36.8 ms | 881 |
| a | 44.5 ms | 5.9 ms | 843 |
| TTR | 15.2 ms | 7.4 ms | 3 |
| Azl | 11.6 ms | 1.7 ms | 1 |
| Civolution | 13.6 ms | 2.0 ms | 1 |
| Catan | 12.7 ms | 1.7 ms | 1 |
| Missing Unicode name | 16.6 ms | 2.4 ms | 0 |

Evidence: ignored `artifacts/sep26-search-work-before/`, `sep26-search-work-after/`, `sep26-visible-search-final/`, `sep26-search-prefix-final/`, `sep26-search-layout-experiment/`, `sep26-search-staged-final/` and `sep26-search-staged-comparison.json`. These are synthetic local synchronous work measurements, not physical-device, paint/interaction latency, field performance, SEO ranking, revenue or billing results.

## Mobile alphabet and browser coverage

A read-only 18-case page audit plus six keyboard/no-JavaScript contexts found the mobile alphabet clipped the outside focus ring at the scroll edge. The proposed -6 px inset still clipped F by 1 px. The final mobile-only -8 px inset keeps F and Z rings complete with 44 px targets; desktop captures remain identical. Original 74-file evidence and failed first proposal remain preserved. Root opened actual compiled Chromium F/Z captures in normal/reduced motion and the actual WebKit F capture; all show a complete ring.

The first final focused browser run passed **73 of 75 cases** across Chromium/Firefox/WebKit. Both WebKit failures were new tests assuming ordinary Tab reaches links. Ranking/count/clear-order assertions had passed before focus failed. Direct recorded WebKit checks show both Tab and Alt+Tab skip anchors to native summaries or body. Programmatic native anchor focus after establishing keyboard modality produces the full focus indicator and scrolling; Enter navigates to Azul normally. Chromium/Firefox retain actual sequential Tab assertions. Corrected WebKit tests verify native focus, indicator/ring geometry and keyboard activation; native sequential link traversal in this Windows WebKit runner is not claimed. Source/timeouts were not changed for this correction. See [verification](../../VERIFICATION.md) for final focused retry and post-test type/lint results.

Final app `npm run verify` passed: 107 checked files, zero diagnostics, lint, 112 unit tests, content validation, 946 pages and 18,418 internal links; canonicals, metadata, structured data, sitemap parity, private-content exclusion, headers and budgets passed. Three untracked growth source/test files account for three checked files and seven tests outside this checkpoint's owned changes. `npm run test:release` passed the full fixture/configuration matrix. Initial/intermediate verification/release results are retained separately; only final application logs are current. An uninterrupted full browser-suite pass is not asserted.

Final output has 975 files and 42 shelves. Directory landing 7,931 raw/2,232 gzip bytes; full lazy search 352,260/87,778; rule index 100,471/26,194; largest D1 shelf 114,345/6,659. Conservative gzip budgets: initial JS 110,629, Balloon 1,161, basic home 127,150 bytes. Final build 11.58 seconds on this host. All scoped servers/browsers are closed. No deployment occurred.

## Corrected keyboard gate

All **six corrected keyboard cases passed** across Chromium, Firefox and WebKit in **1.1 minutes**, with unchanged application code and time limits. The corrected tests preserve every rank/order/focus/geometry/activation assertion; only the WebKit setup uses native anchor focus because this runner skips anchors on Tab. Post-correction type checking passed **107 files** with zero errors, warnings or hints, and selected test lint passed. Logs are `artifacts/sep26-search-staged-keyboard-retry.log`, `sep26-search-staged-post-retry-check.log` and `sep26-search-staged-post-retry-lint.log`. The first run's two failures remain in the separate initial-results folder, with hashes in `artifacts/sep26-webkit-focus-trace-review/`. No uninterrupted 75/75 result is claimed.

## Next source review

Ignored `research/source-files/sep26-three-modern-rule-proposals/` preserves exact English Ironwood, English Wroth v1.0 ©2025 and French Super Meeple/Cranio Beyond the Horizon manuals. Six explicitly bounded GETs include the observed redirect/viewer chain; no guessed Dropbox variant or refreshed BGG data was used. Three schema-valid proposals remain needs-review, with null approval/publication fields. Full text, original hashes, imprint/setup/later-order/mode pages and 29 complete visually inspected page renders are available for independent root review. Bot, solo/cooperative and Government setup draft distinctions remain separate. This collection approves no rule or localized transfer.

Ignored `artifacts/sep26-next-native-triage.md` and companion JSON prepare five subsequent unreviewed identities: Northgard: Uncharted Lands, ImmunoWars, Townsfolk Tussle, Harrow County and Nanatoridori. They preserve exact native title language/claims and collision/edition limits; discovery searches locate primary leads only. All five remain held. The perpetual goal remains active.
