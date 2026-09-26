# Local verification — updated 2026-09-26 UTC

## Identity, source navigation and picker checkpoint — 2026-09-26 UTC

The active directory lists **4,956 identities**: the original 1,368 plus 3,588 Wikidata leads. A separate hash-bound review records **52 identity decisions**, accepting 16 additional held identities and confirming seven existing classics; 29 decisions remain held. Qualified labels keep the two Dune, John Company and Summoner Wars editions distinct. Backgammon uses Q11411/BGG 2397 without transferring its rule to Tavli. The unchanged CC0 statement snapshot, saved claims and primary identity references remain separate from rule approval. This is not every board game worldwide.

The public catalog now has **864 approved edition records**, covering **858 identities**; **4,098 identities** still need primary-source research. Chess, Backgammon and Go were independently reviewed against FIDE, USBGF and the dated 2009 BGA rules. Fixed starting colors, handicap openings and tied opening dice remain explicit. The optional `tieBreakApplicable` field removes irrelevant tie sections from Chess and Go without changing existing portable revision fingerprints; the random mix remains **359** criteria. Research intake copies retain their draft history. See [the traditional-game review](research/coverage/traditional-games-progress.md).

Pending directory rows now open native disclosures with a local picker and a clearly labeled external game link; this also works without JavaScript. Empty search results offer recovery. Sourced PDF articles offer a link to the first cited page while retaining the complete rulebook link. The directory still uses **42 bounded shelves**, a small landing page and a lazy search index rather than generating thousands of empty answer pages.

Picker fixes prevent empty pasted rosters from crashing visual previews and preserve named players while a count is partially typed. Counts commit on blur/Enter, cancel on Escape, and draw correctly on the first pointer click or mobile tap. Unsupported remembered methods explain their player limit. Animated mobile draws scroll the scene into view once; tall scenes keep the single accessible winner announcement visible. Quick/Instant retain their existing placement, reduced motion uses an immediate scroll, and Coin shadows no longer jump in opacity at settlement. Saving publisher evidence is ignored by the dev watcher; actual record changes remain live.

The stable final source/content snapshot passed **`npm run verify`**: 95 Astro files with zero diagnostics, lint, **46 unit tests**, content validation, **929 preview pages** and **18,177 audited internal links**. Exact canonicals, unique metadata, structured data, sitemap parity, private-content exclusion, security headers and static budgets passed. **`npm run test:release`** passed the complete preview/production/fixture/disabled-mode matrix and missing-live-config rejection. No fixture was deployed. Evidence: ignored `artifacts/sep26-final-verify.log` and `artifacts/sep26-final-release.log`.

The full Chromium/Firefox/WebKit browser run passed **254 of 255 cases** in one run. The remaining WebKit secure-RNG test stalled in Playwright's first-click animation-frame stability wait: the picker remained ready/enabled, no draw occurred, and no page error was recorded. Its unchanged case then passed **three fresh isolated WebKit runs** (2.8–3.1 seconds each). All other cases passed in the original run; an uninterrupted 255/255 result is not claimed. Evidence: ignored `artifacts/sep26-final-browser.log`, `artifacts/sep26-rng-first-failure/`, `artifacts/sep26-rng-rerun.log` and the Playwright report.

Seven fresh desktop/320px/390px captures were opened and inspected: pending-game disclosures, a cited-page article, the three traditional-game articles and a twelve-player Coin result. No horizontal overflow or overlapping controls was observed. In the tall Coin result the winner announcement remained within y=21–38.6px and all twelve settled shadows had opacity 0.55; the entire tall graphic is still scrollable rather than fitting in one screen. Evidence: ignored `artifacts/{directory-pending-desktop,directory-pending-320,article-citation-320,traditional-chess-390,traditional-backgammon-390,traditional-go-390,coin-result-sticky-320}.png`.

Local artifact measurements: **958 files**, directory landing HTML **7,931 raw / 2,237 gzip bytes**, lazy search JSON **348,866 raw / 86,770 gzip bytes**, largest shelf HTML **114,373 raw / 6,692 gzip bytes**. The preview build took **4.16 seconds** on this shared host. These are local measurements, not field performance or SEO ranking claims. No new Lighthouse, physical-device or manual screen-reader result is claimed. No deployment occurred. The perpetual goal remains active; [the next source leads](research/coverage/next-source-leads-sep26.md) are discovery only.

## Scalable directory and motion checkpoint — 2026-09-26 UTC

The active directory now lists **4,940 game identities**, adding **3,572** unflagged, name-distinct Wikidata P2339 leads. The reproducible CC0 snapshot retains QID provenance, the exact query and a statement hash; its offline validator passed. Flagged and title-colliding leads remain held for review. All **861 approved rule records** still map to exactly one identity; **855 identities** have a researched edition and **4,085** need primary-source research. No new starting-rule prose was imported, and this is not proof of every board game worldwide.

The directory landing page now links to **42 static letter pages**, each with at most 180 identities. Search loads its local JSON index only after input. Single-edition games link to their sourced answer; six multi-edition choosers remain separate pages. **1,362 legacy identity URLs** receive generated 301 redirects to a sourced answer or the corresponding letter page. The build audit verifies every identity appears exactly once, all internal links work, and sitemap/indexable-page parity is exact. The Cloudflare artifact gate checks the [20,000-file Free plan limit](https://developers.cloudflare.com/pages/platform/limits/) and the [2,000 static redirect limit](https://developers.cloudflare.com/pages/configuration/redirects/).

The directory HTML shrank from **383,575 to 7,802 bytes** before compression (98% smaller). Removing redundant fields reduced the lazy search payload from **757,580 to 347,428 bytes**; normalized search keys are computed once on the device. Astro builds after route optimization measured **4.12–11.34 seconds** on this shared host. The final preview contains **926 pages** and **14,039 audited internal links**, compared with 2,246 pages at the prior checkpoint. These are local build measurements, not field performance or SEO ranking claims.

Motion fixes give long winner names their own space at narrow widths, fade dice placeholders with an actual keyframe, hide decorative duplicate rosters from assistive technology and announce reveal progress. The balloon survivor captures its final transform and lands over 320ms; a Chromium frame sample preserved x=-0.724/y=-7.161 at the result boundary, then eased to y=-5.408 after 50ms. Reduced-motion settings disable this landing. Desktop and 320px directory captures plus the long-name mobile result capture were opened and inspected without visible clipping or overlapping controls.

The final `npm run verify` passed: 94 Astro files with zero diagnostics, lint, **45 unit tests**, content validation, and static/SEO/budget audits. **12 focused browser tests passed** across Chromium, Firefox and WebKit for public browsing/search, complete development inventory, narrow long-name results and dice placeholder/accessibility behavior. The release matrix passed after the directory architecture changes; later landing/copy changes passed verification and the focused browser run. The smaller search payload passed a subsequent final verification and its public-search browser rerun. No new Lighthouse run, physical-device check, manual screen-reader check or full browser-suite pass is claimed. No deployment occurred. The perpetual improvement goal remains active.

## Board directory and motion checkpoint — 2026-09-25 UTC

The directory now contains 1,368 distinct BGG identities. All 861 approved rule records link to exactly one identity; 855 identities have a sourced edition and 513 still need primary-source research. The 35 newly enrolled approved rules include explicit mappings for lookalike titles and editions. Gamewright's Big Top is correctly linked to Barnyard Buddies (BGG 486), rather than the unrelated BGG 7048 or Allplay's Big Top (369899).

Directory search now matches known aliases and punctuation variants, with alphabetical jumps and source-status filters. The in-app Reduce motion setting stops the winner's continuing glow while preserving the selected result. Desktop and 390px mobile directory screenshots were opened and checked; the mobile page had no horizontal overflow.

On this checkout, `npm run verify` passed Astro check, lint, all 44 unit tests, content validation, and the 2,246-page preview build. Static and SEO audits passed for 26,535 internal links. Nine focused browser checks passed across Chromium, Firefox and WebKit. The complete release matrix passed. Fresh production-fixture Lighthouse runs scored 100 in accessibility, best practices and SEO for every tested template; performance was 99–100 on three mobile home runs and 100 on desktop home, Balloon, the board directory and the synthetic rule page. The full directory's mobile CLS was 0. These are local lab results, not field performance or a ranking claim. No deployment occurred in this checkpoint.

## Fudacoma and Blue Orange approval checkpoint — 2026-09-24 UTC

The directly publisher-hosted English manuals for 10 Tricks Later and 12 Gangsters were reopened after both cached files and their page renders had been inspected. The first game is approved for the public catalog and portable mix; the second is approved for the directory only because it assigns a Boss role before simultaneous card play. The Artipia-branded 13 Ghosts mirror remains a local draft. See `research/coverage/fudacoma-blue-orange-artipia-progress.md`.

The catalog has **242** approved rules and **177** random-mix criteria; development research has **433 records** for **411 of 1,320 inventory identities**, leaving **909** pending. `npm run verify` passed Astro check, lint, 40 unit tests, content validation, and a **259-page** preview build. SEO/static audits passed for **2,815 internal links**. `npm run test:release` passed all five matrix cases. Nine focused browser checks passed across Chromium, Firefox and WebKit, covering every researched page, full-inventory search and reviewed-pool filtering. Evidence: ignored `artifacts/fudacoma-blue-orange-verify.log`, `artifacts/fudacoma-blue-orange-release.log` and `artifacts/fudacoma-blue-orange-browser.log`. The prior full **207/207** browser suite was run before these two content-only approvals; the nine focused tests verify the affected content paths afterward. No public deployment occurred.

## Allplay expansion and research checkpoint — 2026-09-24 00:16 UTC

Nine additional Allplay draft revisions received source-backed editorial approval after their cached publisher PDF hashes and rendered rule pages were rechecked. The exact catalog has **240 approved rules**, and the portable random mix has **176** separately fingerprinted criteria. Through the Desert, Habitats, Pollen, Switchbacks and Pies enter the mix; Roll to the Top: Journeys, QE, Big Top and Basketboss remain directory-only. See `research/coverage/allplay-review-progress.md` for each source and decision.

On this shared checkout, `npm run verify` passed Astro check (75 files, zero diagnostics), lint, 40 unit tests, content validation, and the **257-page** preview build. Static/SEO audits passed for **2,795 internal links**. `npm run test:release` passed the preview-empty, production-empty, synthetic approved content, disabled mode and missing-live-config cases. The complete browser suite passed **207/207 in one run** across Chromium, Firefox and WebKit (ignored logs: `artifacts/allplay-round2-verify.log`, `artifacts/allplay-round2-browser.log`). The browser run ended before three new research drafts were added; `npm run content:validate`, `npm run content:coverage` and a second complete `npm run verify` passed afterward on the **433-draft** snapshot (`artifacts/allplay-round2-final-verify.log`). The added drafts are development-only and do not change the 240 public articles or random mix.

The new Fudacoma, Blue Orange and Artipia drafts raise researched coverage to **411 of 1,320 identities**, with **909** pending. The Artipia draft is held for source provenance and variant comparison. The owner's visual-design decision remains deferred; canonical domain and maintained contact remain undecided. The picker/reveal edits from another task remain uncommitted. No public deployment occurred.

## Allplay editorial checkpoint — 2026-09-23 23:55 UTC

Three existing Allplay drafts received source-backed editorial approval: High Society, Panda Panda and River Valley Glassworks. Publisher PDFs were opened; cached PDF hashes and relevant page renders were rechecked. High Society's random alternative was moved out of the tie-break field. The exact approved catalog has **231 rules** and the portable random mix has **171**; discovery coverage remains **408 of 1,320 identities**, with 912 still needing primary-source research. See `research/coverage/allplay-review-progress.md`.

On the shared worktree, `npm run verify` passed Astro check (75 files, zero diagnostics), lint, 40 unit tests, content validation (231 approved rules, 60 approved prompts), and the 248-page preview build. SEO and static audits passed for 2,696 internal links. `npm run test:release` passed preview, empty production, synthetic approved content, disabled mode, and rejection of missing live configuration.

The 207-case browser run passed **205 cases** across Chromium, Firefox and WebKit. WebKit's 60-draw house-prompt case exceeded its 30-second test limit while reaching the final development-page check; its longer `test.slow()` rerun passed. The coin reveal test sampled opacity before the settled style appeared; its polling CSS assertion rerun passed. Both affected WebKit cases passed together after those test-only changes. The full 207-case suite was not repeated after those changes. The picker and reveal code remains concurrently edited and uncommitted. No deployment occurred.

## Current checkpoint — 2026-09-23 23:28 UTC

The shared picker design settled on **245 preview pages**, with Paper Planes removed from public navigation and output. A coherent isolated copy passed `npm run verify` (75 Astro files, zero diagnostics; lint; 40 unit tests; 228 approved rules and 60 prompts; 245 pages and 2,664 audited internal links). Its complete browser suite passed **207/207** in one uninterrupted run across Chromium, Firefox and WebKit. The earlier interrupted isolated runs used a snapshot assembled during concurrent edits or retained hardcoded main-workspace ports; those failures are not counted as product passes. Evidence: ignored `artifacts/current-settled-verify.log` and `artifacts/current-ports-fixed-browser.log` in the attached isolated worktree.

Five subsequent edits varied Spinner's cosmetic clockwise/counterclockwise turns and updated its unit tests. On the updated isolated copy, `npm run verify` passed again with the same content/page/link totals; 12 focused Spinner, preview and winner-highlight cases passed across all three engines. The full 207-case suite was **not** repeated after those five edits. All 17 shared edited files matched this final isolated copy after the focused run, normalizing test localhost ports and line endings. `git diff --check` passed. The other task's picker files remain uncommitted; this checkpoint does not stage them. Evidence: ignored `artifacts/current-spinner-verify.log` and `artifacts/current-spinner-browser.log`.

The final isolated release matrix passed preview, empty production, synthetic approved content, Balloon disabled, and rejection of missing production configuration. The real approved catalog then passed a fixture-only production rehearsal with a fake domain, contact and hosting sentence: **245 pages**, 228 game articles, 60 prompts, exact sitemap/canonicals and 2,664 internal links; production indexing, privacy, headers and private-content exclusion passed. No fixture was deployed. Evidence: ignored `artifacts/current-final-release-matrix.log`, `artifacts/final-production-rehearsal.log`, and `artifacts/final-production-rehearsal/`.

Fresh Lighthouse 13.5.0 audits of the final release fixture passed every gate. The three simulated mobile home performance scores were **99, 100, 100**; desktop home, Balloon and synthetic rule were **100**. Accessibility, best practices and SEO scored **100** in every run. Measured CLS was zero in these runs. This is local lab evidence, not field Core Web Vitals, physical-device testing or a ranking guarantee. Eight current 390px home/Coin/Flower/Shell ready/result captures had visible winners and no horizontal overflow; the home ready, Coin result and Flower result captures were opened and visually inspected. Evidence: ignored `artifacts/current-final-lighthouse.log`, `artifacts/lighthouse/summary.json`, and `artifacts/current-mobile-{home,coin,flowers,shells}-{ready,result}.png` in the isolated worktree.

The owner deferred visual approval. The canonical domain and maintained contact remain undecided. Actual host logging/privacy wording, physical iOS/Android and screen-reader checks, preview access, exact public configuration, deployment, hosted smoke tests and rollback remain open. Temporary isolated servers were stopped. The approved partial catalog remains the launch scope; the full 1,320-identity research inventory is unfinished.

## Previous checkpoint — 2026-09-23 22:43 UTC

On a fixed isolated copy of the then-current picker, the production release matrix passed preview, empty production, synthetic approved content, Balloon disabled, and rejection of missing production settings. The complete browser suite passed **213/213** in one uninterrupted run across Chromium, Firefox and WebKit, including the visible optional-module fallback. Evidence: ignored `artifacts/current-release-matrix.log` and `artifacts/current-full-browser.log` in the isolated worktree. The first automatic Playwright web-server launch exited early; the successful run used verified isolated servers on ports 4333/4334.

Fresh Lighthouse 13.5.0 audits of that release fixture passed all gates: home mobile (three runs) and desktop scored 100 in performance, accessibility, best practices and SEO; the Balloon method scored 95/100/100/100; the synthetic rule page scored 100/100/100/100. Balloon's measured CLS was 0.140, and the audit identified the reveal choices shifting when its preview stage appeared after hydration. A one-line change now renders the initial method preview from the server. On the modified isolated fixture, Lighthouse passed again: home mobile 99/100/100 across three runs, desktop 100, Balloon **99** with CLS **0.063**, synthetic rule 100; accessibility, best practices and SEO were 100 in every run. The modified fixture passed the release matrix and nine targeted hydration, preview and narrow-screen browser checks across all three engines. The one-line change was copied to the shared source. The complete 213-case suite was run **before** this final layout change, so it is not claimed for the later source. Evidence: ignored `artifacts/{current,ssr-preview}-lighthouse.log`, `artifacts/ssr-preview-release.log`, and `artifacts/ssr-preview-browser.log` in the isolated worktree. These are local simulated lab measurements, not field Core Web Vitals.

The modified isolated copy also passed a real-catalog production rehearsal using visibly fictional fixture-only domain, contact and hosting text in ignored output. It built 246 pages, included 228 approved game rules and 60 prompts, and passed production SEO, sitemap, privacy, security-header and private-content audits for 2,675 internal links. No fixture was deployed. Evidence: `artifacts/current-production-rehearsal.log` and `artifacts/current-production-rehearsal/` in the isolated worktree.

During the subsequent shared-worktree `npm run verify`, another editor changed `src/lib/reveal-plan.ts` while its existing unit test still referred to `plane`; Astro check reported that type error. Eleven shared files then differed from the isolated passing snapshot. The editor's uncommitted changes and three untracked coin screenshots were left intact. The shared tree therefore needs another verification after those edits settle. The owner chose to decide on visual approval later; the canonical domain and maintained contact remain undecided. Physical-device, screen-reader, host and public-deployment checks remain open.

## Previous checkpoint — 2026-09-23 22:17 UTC

The latest 16 shared picker/reveal/style/test edits were copied into the attached isolated worktree (with only localhost test ports changed there). All 16 still matched the shared worktree after verification, ignoring line endings and those port substitutions. The exact isolated snapshot passed `npm run verify`: 75 Astro files with zero diagnostics, lint, 40 unit tests, content validation (228 approved game rules, 60 approved prompts), and a 246-page preview build/audit with 2,675 internal links. The conservative basic-home gzip estimate is 132,204 bytes. Evidence: ignored `artifacts/current-fallback-verify.log` in the isolated worktree.

A focused 180-case picker/reveal run across Chromium, Firefox and WebKit initially passed 179/180. WebKit reproducibly kept the optional TableReveals module unavailable in the same browser context after a deliberately aborted download, including on the next page. The selected player remained correct, but the stage disappeared silently. The error boundary now displays “Visual unavailable. The selected player is shown below.” The combined test was split: the failure case asserts the visible fallback and correct winner; an independent case asserts the reduced-motion visual. All six affected cases passed across the three engines after this change. The other 178 cases passed on the preceding snapshot, before this one-line fallback change and test split; a post-change full 180-case run is not claimed. Evidence: ignored `artifacts/latest-picker-browser.log` and `artifacts/current-fallback-browser.log` in the isolated worktree.

Eight fresh 390px captures cover the home and Flower Pots, Paper Planes and Shell Game ready/result states. They show visible controls, winner text and settled pieces without horizontal overflow. Four representative captures were opened and inspected. Evidence: ignored `artifacts/current-mobile-{home,flowers,planes,shells}-{ready,result}.png` in the isolated worktree. This remains browser emulation, not physical-device testing or owner visual approval. Temporary isolated servers on ports 4333/4334 were stopped. No deployment occurred.

## Previous checkpoint — 2026-09-23 22:02 UTC

The then-current shared worktree passed an uninterrupted `npm run verify`: 75 Astro files with zero diagnostics, lint, 39 unit tests, content validation (228 approved game rules and 60 approved prompts), and a 246-page preview build/audit with 2,675 internal links. The live development picker also passed `npm run test:dev-release` in fresh browser contexts before and after the release matrix. That regression took unusually long but exited successfully. Evidence: ignored `artifacts/current-exact-verify.log` and `artifacts/current-dev-release-regression.log` in the main workspace.

The full browser suite on the shared ports passed 166 of 207 tests, with the failures caused by missing Playwright trace files, refused shared-server connections, and a disappearing shared `dist/_headers`; it is not a product pass. I copied the site into the attached isolated worktree, rebuilt it, used ports 4333/4334 and separate test artifacts, and ran all 210 current browser cases across Chromium, Firefox and WebKit. Its first run passed 207/210: Vite rejected the junctioned React dependency with HTTP 403 on all three development hydration cases. After allowing the linked dependency path in the **isolated dev config only**, those cases passed 3/3. One uninterrupted full rerun then passed **210/210** in 10.2 minutes. Temporary isolated servers were stopped afterward. Evidence: ignored `artifacts/full-browser-{build,isolated-final}.log` and `artifacts/dev-hydration-rerun.log` in the isolated worktree.

The isolated browser tests changed only hardcoded localhost ports and the worktree's Vite filesystem allowance needed for its `node_modules` junction. A comparison of 921 tracked source/public/research paths, ignoring line-ending differences, found five shared picker/style source files had changed again during the full run. The green suite therefore proves the isolated source snapshot, **not the later shared worktree or a public release**. The five differing files are `src/components/Picker.tsx`, `src/components/modes/TableReveals.tsx`, `src/lib/presentations.ts`, `src/lib/reveal-plan.ts`, and `src/styles/table.css`. Physical-device, screen-reader, visual-owner approval and hosted checks remain open. No deployment occurred.

## Previous checkpoint — 2026-09-23 20:33 UTC

An isolated production rehearsal used the real approved catalog with fixture-only domain, contact and hosting disclosures in ignored output. `npm run build` passed content validation, generated 246 pages, and passed SEO and production artifact audits for 2,675 internal links, canonicals, indexing, headers and private-content exclusion. The output has 228 game article directories and 228 corresponding sitemap entries, includes the house-rules route, renders `index, follow` on the homepage and the fixture Privacy/contact wording, and contains neither development nor research routes. The build report confirms 60 approved house prompts. No fixture output was deployed or copied to the public workspace.

Evidence: `artifacts/production-rehearsal.log` and `artifacts/production-rehearsal/` in the attached isolated worktree. The real canonical domain, maintained contact, actual host policy and final picker state remain outstanding, so this is not the exact approved release.

## Previous checkpoint — 2026-09-23 20:29 UTC

The link checker now supports `--approved-only`, so launch checks can target the reviewed public catalog without conflating draft-source failures. Its batch completion flag also reports correctly when the final batch starts at a nonzero offset. Two approved-only batches checked all **284 distinct source URLs**: 250 plus 34, with 284 unique URLs and 284 HTTP 200 HEAD responses at 20:26–20:27 UTC. The check changed no record, approval, or verification date. Availability does not prove a rule's factual accuracy, and a future host can change its response.

`npx eslint scripts/check-links.ts` passed; `npm run check` reported 75 Astro files with zero errors, warnings, or hints. Evidence: ignored `artifacts/approved-links-check.json` and `artifacts/approved-links-check-tail.json` in the main workspace. The concurrent picker edits remain uncommitted, and no public deployment occurred.

The current lockfile's npm advisory check returned zero reported vulnerabilities for 238 production dependencies (`npm audit --omit=dev`) and for all 633 dependencies (`npm audit`) at 20:30 UTC. Evidence: ignored `artifacts/npm-audit-{prod,all}.json`. This is an advisory snapshot, not a guarantee that the site has no security issues.

## Previous checkpoint — 2026-09-23 20:22 UTC

The Shell Game-specific browser test now waits for natural completion instead of trying to click “Show result now” after that control can disappear. The generic Shell Game test still exercises skip and replay. The previously failing WebKit case passed in an isolated rerun.

A fresh isolated snapshot of the concurrent mode edits passed the complete `npm run verify` sequence: 75 Astro files with zero diagnostics, lint, 39 unit tests, content validation, and a 246-page preview build with 2,675 audited internal links. `npm run test:release` also passed preview, empty production, synthetic populated production, disabled Balloon, and rejection of missing domain/contact/hosting settings. Focused Flower Pots, Paper Planes, and Shell Game tests passed 12/12 in Firefox and WebKit on a separate static server, including narrow 12-player layouts, reduced motion, replay, skip, plane finish and shell reveal. The same focused set had passed 6/6 in Chromium on the earlier shared build.

The shared picker files changed again after this snapshot and remain uncommitted. This evidence therefore does not claim final-release verification. I visually opened the fresh 375px Card Draw and Flower Pots captures and a mobile Flower Pots result crop; the cards, flowers, labels, method choices and action button fit without visible clipping. The owner has not yet approved the visual treatment, and physical-device and screen-reader checks remain open.

Evidence: ignored files `artifacts/latest-snapshot-{verify,release,new-modes-browser}.log` and `artifacts/shells-webkit-rerun.log` in the attached isolated worktree, plus `.preview-375-{cards,flowers}.png` and `.preview-mobile-final.png` in the main workspace. No public deployment occurred.

## Previous checkpoint — 2026-09-23 20:14 UTC

The shared worktree's concurrent mode additions reached a clean Astro type check (75 files, zero diagnostics), lint, 39/39 unit tests on an unchanged rerun with a 20-second per-test timeout, and a preview build/audit of 246 pages and 2,675 internal links. The combined `npm run verify` run did not pass uninterrupted: two catalog-heavy tests exceeded the default 5-second timeout while the machine was busy, then passed on rerun. The new modes remained uncommitted and continued changing after the snapshot, so these checks are evidence for that snapshot, not a final release.

The regular `npm test` command now uses that 20-second limit to avoid failing the content scans solely because this shared Windows host is busy. Tests remain bounded; no assertion or application behavior was changed by this adjustment.

Focused Flower Pots, Paper Planes, and Shell Game checks passed 6/6 in Chromium on the shared build. A Firefox/WebKit run against the shared port passed 8/12; two cases lost the shared server connection and two timed out. A copied, isolated snapshot on port 4333 then passed 11/12 Firefox/WebKit cases, including narrow 12-player layouts, axe checks, reduced motion, replay and skip. The sole remaining failure was the Shell Game-specific WebKit test waiting for “Show result now” after the reveal had completed and the button had disappeared; the failure screenshot showed the winner and pearl correctly, and the generic Shell Game skip/replay checks passed in both engines. This is a test timing issue, and the exact final mode edits still need a clean browser run after they settle.

Evidence: ignored local logs `artifacts/current-worktree-{verify,build,new-modes-browser,new-modes-cross-browser}.log` in the main workspace and `artifacts/new-modes-isolated-{build,cross-browser}.log` in the attached isolated worktree. No public deployment occurred.

## Previous checkpoint — 2026-09-23 19:51 UTC

The first local Git baseline is `86a452c` on `build/who-goes-first`. The owner's launch decision is an approved partial catalog; the canonical domain and maintained contact remain undecided. No public deployment has occurred. This checkpoint adds a production build gate for contact and host/logging disclosures, and renders those disclosures on Privacy only in production. The actual host and policy must be checked by the owner before release.

The gate was verified against an isolated worktree copied from `86a452c`, with only the seven release-gate files copied from the shared workspace. Astro check passed for 75 files with zero diagnostics; lint passed; all 39 unit tests passed on rerun; the static preview build and audits passed for 242 pages and 2,631 internal links; and the release matrix passed preview, empty production, synthetic populated production, Balloon disabled, and rejected missing domain/contact/host/logging configuration. The production fixture Privacy page contained the configured host/logging sentence and omitted the local-only notice. The first combined verification run had one existing coverage test exceed its 5-second limit under machine load; its unchanged rerun passed in 1.43 seconds. The individual gates therefore passed, but a single uninterrupted combined run is not claimed.

Public catalog copy now explicitly says the reviewed editions are those available so far, explains that more games are being checked, and describes an empty search as a missing reviewed rule. Those three page/component files were copied into the same isolated worktree after the release-gate verification. A fresh preview build and artifact audit passed for 242 pages and 2,631 links; generated catalog and article HTML contain the new wording.

The shared worktree is also receiving concurrent picker/mode edits. Its type check at this checkpoint found a new mode union mismatch in `src/components/Picker.tsx`; those edits were not included in the isolated verification or first commit. Browser visual approval, physical device and screen-reader checks, actual host disclosure, final release verification, and public smoke/rollback remain open in `LAUNCH_CHECKLIST.md`.

## Previous checkpoint — 2026-09-23 13:51 UTC

The running homepage passed another all-method retention check at 13:42 UTC: all seven animated scenes remain mounted beside the winner, replay creates a fresh scene, and skip settles the current scene. The 12-player spinner fits at 320px with long and duplicate names. All nine freshly captured homepage screenshots were opened and inspected. Presentation code did not change in this content pass.

Five new researched records and six existing drafts complete source review. Current totals: **430 researched records**, **408 of 1,320 inventory identities**, **912 pending**, **228 approved catalog entries**, **168 portable random-mix criteria**. Six original prompts remain local drafts. The full compendium remains unfinished.

| Check | Actual result |
|---|---|
| `npm run verify` | Passed at 13:45 UTC: 72 Astro files, zero errors/warnings/hints, lint, 38 unit tests in five files, content validation, static build and artifact audits |
| Static audit | 242 pages and 3,053 internal links; exact canonicals, unique metadata, structured data, sitemap, headers and private-content exclusion passed |
| Size audit | Initial JavaScript 102,742 gzip bytes; Balloon 766 bytes; basic home 126,427 bytes |
| Source review | 39 listed source-page renders opened and inspected: 25 from five newly retrieved manuals, 14 from six existing cached manuals; each PDF hash checked before approval |
| Source availability | Eleven citation URLs returned HTTP 200 at 13:47 UTC: eight HTML file viewers and three direct PDFs. The full PDFs were separately retrieved and inspected; a viewer response is not represented as a PDF response |
| Live articles | All eleven returned 200 on development and static servers; exact answers, editions, source links, clarifications and fallbacks matched; zero horizontal overflow at 320px |
| Accessibility and runtime | Zero axe WCAG 2 A/AA and 2.2 AA violations on each reviewed article; no page, console or HTTP errors in the live check |
| Directory and random mix | 430 local records, 228 approved entries and 168 allowlisted choices; public/development pool parity, all eleven inclusion/exclusion decisions, draw and skip passed |
| Search and identity coverage | Unaccented Cat Cafe finds Cat Café; both Trismegistus editions remain distinct; original Ancient World 147253 remains pending despite the second-edition answer; zero/one/1,320 inventory counts passed |
| Browser tests | Nine selected tests passed in 3.2 minutes across Chromium, Firefox and WebKit: every researched page, full inventory search and reviewed-pool filtering |
| Retained homepage scenes | Seven methods passed same-scene completion, replay and skip at 320px; 12-player spinner passed long/duplicate names; no runtime errors |
| Visual inspection | All 24 fresh screenshots opened and inspected: eleven mobile articles, four desktop article/search/coverage views, and nine retained-home views; no clipping found |

Source corrections include Ceylon's ascending-tile-order variant setup, removal of official alternatives from tie-break fields, and an identity override for The Ancient World second edition. The original research copies remain preserved. No public deployment occurred.

Evidence: `artifacts/alley-red-raven-verify.log`, `artifacts/alley-red-raven-live-check.json`, `artifacts/source-availability-alley-red-raven.json`, `artifacts/alley-red-raven-browser.log`, `artifacts/alley-red-raven-browser/.last-run.json`, `artifacts/main-area-retained-home-live-check.json`, and `research/coverage/alley-red-raven-board-dice-ludonova-progress.md`.

Fresh screenshots are in `artifacts/screenshots/`. Home examples: `retained-main-area-spinner-desktop.png`, `retained-main-area-card-draw-320.png`, and `retained-main-area-balloon-rise-320.png`. Content examples: `reviewed-chocolate-factory-desktop.png`, `dev-cat-cafe-accent-search.png`, `dev-trismegistus-edition-search.png`, and `dev-ancient-world-original-pending.png`. The live-check report lists every article screenshot.

The isolated release/dev-cache regression last passed at 12:47 UTC; it was not repeated for these content-only changes. No new Lighthouse measurement or complete browser-suite run is claimed. Remaining factual research is implementation work under standing authorization. Owner launch actions remain in `LAUNCH_CHECKLIST.md`.

## Previous checkpoint — 2026-09-23 13:29 UTC

Fresh checks of the running homepage confirm that all seven animated presentations keep the same scene visible alongside the winner. Replay creates a new scene, skip settles it, and the 12-player spinner fits at 320px with long and duplicate names. All nine new homepage screenshots were opened and inspected. No presentation code changed in this content pass.

Hardback, Burgle Bros., Burgle Bros 2, Clank! and Isle of Trains add five researched identities and approved records. Five existing R&R Games drafts also complete editorial review. Current totals: **425 researched records**, **404 of 1,320 inventory identities**, **916 pending**, **217 approved catalog entries**, **161 portable random-mix criteria**. Six original prompts remain local drafts. The full compendium remains unfinished.

| Check | Actual result |
|---|---|
| `npm run verify` | Passed after both batches, at 13:25 UTC: 72 Astro files with zero diagnostics, lint, 38 unit tests in five files, content validation, static build and artifact audits |
| Static audit | 231 pages and 2,916 internal links; exact canonicals, unique metadata, structured data, sitemap, headers and private-content exclusion passed |
| Size audit | Initial JavaScript 102,742 gzip bytes; Balloon 766 bytes; basic home 126,014 bytes |
| Source review | 40 listed source-page renders opened and inspected: 30 for five newly downloaded manuals and ten for five existing R&R caches; source hashes checked before approval |
| Source availability | All ten cited PDF URLs returned HTTP 200 and application/pdf; five checked at 13:17 UTC, five at 13:25 UTC |
| Live articles | All ten returned 200 on development and static servers; exact answers, editions, source links, clarifications and fallbacks matched; no horizontal overflow at 320px |
| Accessibility and runtime | Zero axe WCAG 2 A/AA and 2.2 AA violations on each newly approved article; no page, console or HTTP errors in either batch check |
| Directory and random mix | Latest live check found 425 local records, 217 approved entries and 161 allowlisted choices; public/development pool parity, inclusion/exclusion, draw and skip passed |
| Search and coverage | Clank and Hanabi searches passed; Burgle Bros. and Isle of Trains resolve to approved editions; Blueprints stays pending; zero/one/1,320 coverage counts passed |
| Browser tests | Nine selected tests passed in 1.2 minutes after each batch, across Chromium, Firefox and WebKit; latest run covers every researched page, full inventory search and reviewed-pool filtering |
| Retained homepage scenes | All seven passed completion, same-scene retention, replay and skip at 320px; 12-player spinner passed long-name and duplicate-name checks; no runtime errors |
| Visual inspection | All 23 new screenshots opened and inspected: fourteen article/search screenshots and nine retained-home screenshots; no clipping found |

Evidence: `artifacts/{skellig-direwolf,rnr}-live-check.json`, `artifacts/source-availability-{skellig-direwolf,rnr}.json`, `artifacts/{skellig-direwolf,rnr}-browser/.last-run.json`, `artifacts/main-area-retained-home-live-check.json`, `research/coverage/skellig-direwolf-trains-progress.md`, and `research/coverage/rnr-review-progress.md`.

New retained-view screenshots under `artifacts/screenshots/`: `retained-main-area-{spinner-desktop,spinner-320,spinner-12-320,card-draw-320,balloon-rise-320,towers-320,shortest-match-320,dice-roll-320,marble-race-320}.png`. Article/search examples include `reviewed-clank-desktop.png`, `reviewed-hanabi-desktop.png`, `dev-clank-alias-search.png`, and `dev-hanabi-search.png`; each batch report lists its mobile screenshots.

The isolated release/dev-cache regression last passed at 12:47 UTC; it was not repeated for these content-only changes. No new Lighthouse measurement or complete browser-suite run is claimed. No public deployment occurred. Remaining factual research is implementation work under standing authorization; owner launch actions remain in `LAUNCH_CHECKLIST.md`.

## Previous checkpoint — 2026-09-23 13:07 UTC

The seven animated presentations remain visible alongside the winner. Their application code did not change in this content pass. The 12:04 checkpoint records the actual all-method completion, skip, replay, editing and 12-player checks. The retained spinner, card and balloon screenshots were reopened and inspected in this pass.

Age of Dirt adds one researched inventory identity; nine existing CGE drafts complete editorial review. Totals: **420 researched records**, **399 of 1,320 inventory identities**, **921 pending**, **207 approved catalog entries**, and **153 portable random-mix criteria**. Six original prompts remain local drafts. The full compendium is unfinished.

| Check | Actual result |
|---|---|
| `npm run verify` | Passed at 13:00 UTC: 72 Astro files with zero diagnostics, lint, 38 unit tests in five files, content validation, static build and artifact audits |
| Static audit | 221 pages and 2,788 internal links; metadata, canonicals, structured data, sitemap, headers and private-content exclusion passed |
| Size audit | Initial JavaScript 102,742 gzip bytes; Balloon 766 bytes; basic home 125,489 bytes |
| Source review | All 27 listed source-page renders opened and inspected; nine existing CGE PDF caches and one fresh publisher-linked WizKids PDF, with source hashes checked |
| Source availability | All ten cited PDF URLs returned HTTP 200 and PDF content types at 13:01 UTC |
| Live articles | All ten returned 200 on development and static servers; exact answers, editions, links, clarifications and fallback behavior matched; no horizontal overflow at 320px |
| Accessibility and runtime | Zero axe WCAG 2 A/AA and 2.2 AA violations on each newly approved article; no reported page, console or HTTP errors in the successful run |
| Directory and random mix | 420 local records, 207 approved entries and 153 allowlisted choices; pool parity on both servers, four additions included, six role/phase cases excluded; draw/skip and SETI alias search passed |
| Coverage | Age of Dirt and SETI resolve to researched editions; Blueprints remains pending; zero/one/1,320 result counts passed |
| Browser tests | Nine selected tests passed in 1.1 minutes across Chromium, Firefox and WebKit, covering every researched page, full inventory search and reviewed-pool filtering |
| Visual inspection | All seven new screenshots opened and inspected: five mobile articles, desktop SETI and SETI directory search; no clipping found. Three retained-home examples were also reopened |

The first live-check run was interrupted by Playwright's “Execution context was destroyed, most likely because of a navigation” error while evaluating the page. The cause was not confirmed. The complete, unmodified rerun passed at 13:02 UTC. No application change was made to obtain that rerun.

Evidence: `artifacts/cge-wizkids-live-check.json`, `artifacts/source-availability-cge-wizkids.json`, `artifacts/cge-wizkids-browser/.last-run.json`, and `research/coverage/cge-wizkids-progress.md`. The isolated release/dev-cache regression last passed at 12:47 UTC in the preceding checkpoint; it was not repeated after this content-only batch. No new Lighthouse measurement or full unchanged-presentation suite was run.

New screenshots in `artifacts/screenshots/`: `reviewed-{alchemists-cge-en,dungeon-petz-cge-en,goblins-inc-cge-en,tzolkin-cge-en,age-of-dirt-wizkids-en-2019}-mobile.png`, `reviewed-seti-desktop.png`, and `dev-seti-alias-search.png`. Earlier retained-view examples remain `retained-rio-grande-zoch-spinner-desktop.png`, `retained-rio-grande-zoch-card-draw-320.png`, and `retained-rio-grande-zoch-balloon-rise-320.png`; these were inspected again, not newly captured.

No public deployment occurred. Remaining factual research is implementation work under standing authorization. Owner launch actions remain in `LAUNCH_CHECKLIST.md`.

## Previous checkpoint — 2026-09-23 12:51 UTC

The seven animated presentations still remain visible alongside the winner. Their application code is unchanged in this pass; the 12:04 checkpoint records the all-method checks. The release regression exercised the live Instant picker before and after isolated release builds.

Art Decko and Art Robbery add two researched identities. Those games plus the existing For Sale, Schotten Totten and Time Bomb Evolution drafts completed editorial review. Totals: **419 researched records**, **398 of 1,320 inventory identities**, **922 pending**, **197 approved catalog entries**, and **149 portable random-mix criteria**. Six original prompts remain local drafts. The full compendium is unfinished.

| Check | Actual result |
|---|---|
| `npm run verify` | Corrected rerun passed at 12:45 UTC: 72 Astro files with zero diagnostics, lint, 38 unit tests, content validation, static build and artifact audits |
| Static audit | 211 pages and 2,661 internal links; metadata, canonicals, structured data, sitemap, headers and private-content exclusion passed |
| Size audit | Initial JavaScript 102,742 gzip bytes; Balloon 766 bytes; basic home 125,195 bytes |
| Source review | All 19 listed source-page renders opened and inspected; two new publisher downloads and three previously cached publisher/distributor manuals, with hashes checked |
| Live articles | All five returned 200 from development and static servers; exact answers, editions, source links and clarifications matched; no horizontal overflow at 320px |
| Accessibility and runtime | Zero axe WCAG 2 A/AA and 2.2 AA violations on each new article; no page, console or HTTP errors |
| Directory and random mix | 419 local records, 197 approved records and 149 allowlisted choices on both servers; four additions included, For Sale excluded; draw/skip, Art Decko search and coverage checks passed |
| Browser tests | Nine selected tests passed in 1.2 minutes across Chromium, Firefox and WebKit, covering every researched page, full inventory search and reviewed-pool filtering |
| Release regression | `npm run test:dev-release` passed: preview-empty, production-empty, 41-game production fixtures and Balloon-disabled builds/audits; invalid production origin rejected; fresh dev picker worked before and after builds |
| Visual inspection | All seven new screenshots opened and inspected: five mobile articles, desktop Art Decko and Art Decko directory search; no clipping or overflow found |

The first verification run failed after building because the private-content audit treated the approved For Sale answer as a leak: an unrelated unapproved draft has identical wording. The corrected guard verifies approved revisions directly, authorizes game routes from approved records rather than generated-file existence, allows exact shared approved answer text, and continues rejecting private evidence and draft-only text. Five added regression tests cover these cases. The corrected verification and release matrix both passed.

Evidence: `artifacts/art-mini-live-check.json`, `artifacts/art-mini-browser/.last-run.json`, `artifacts/release-fixtures/latest.json` (12:47 UTC), and `research/coverage/art-mini-progress.md`. Release fixtures are synthetic test outputs, not deployment artifacts. No new Lighthouse measurement or full unchanged-presentation suite was run in this pass.

New screenshots in `artifacts/screenshots/`: `reviewed-{art-decko-rio-grande-en-2020,art-robbery-helvetiq-en,for-sale-spiel-das-de-summary,schotten-totten-pegasus-de-summary,time-bomb-evolution-iello-de-summary}-mobile.png`, `reviewed-art-decko-desktop.png`, and `dev-art-decko-search.png`. Retained-view examples remain `retained-rio-grande-zoch-spinner-desktop.png`, `retained-rio-grande-zoch-card-draw-320.png`, and `retained-rio-grande-zoch-balloon-rise-320.png`.

No public deployment occurred. Remaining factual research is implementation work under standing authorization. Owner launch actions remain in `LAUNCH_CHECKLIST.md`.

## Previous checkpoint — 2026-09-23 12:26 UTC

All seven animated presentations still remain visible alongside the winner announcement: Spinner, Card Draw, Balloon Rise, Towers, Shortest Match, Dice Roll and Marble Race. Their implementation is unchanged in this pass; the preceding checkpoint records the actual all-method, replay, skip and 12-player checks. The retained balloon and card screenshots were reopened during this pass.

Thirteen existing core-game drafts completed editorial review, including CATAN, Wingspan, UNO, Pandemic and 7 Wonders. Cascadia now names the five animals used by its sighting criterion. Tiny Towns now explicitly distinguishes the resource caller from everyone's simultaneous placement. Totals: **417 researched records**, **396 of 1,320 inventory identities**, **924 pending**, **192 approved catalog entries**, **145 portable random-mix criteria**. Six original prompts remain local drafts. The full compendium is unfinished.

| Check | Actual result |
|---|---|
| `npm run verify` | Passed at 12:21 UTC: 70 Astro files with zero diagnostics, lint, 33 unit tests, content validation, static build and artifact audits |
| Static audit | 206 pages and 2,598 internal links; canonicals, metadata, structured data, sitemap, headers and private-content exclusion passed |
| Size audit | Initial JavaScript 102,742 gzip bytes; Balloon 766 bytes; basic home 124,837 bytes |
| Source review | Twelve fresh publisher PDF downloads, 35 rendered pages inspected, plus an enlarged UNO English panel; Wingspan's live base-game, Standard/Human Player setup inspected in a fresh browser |
| Live articles | All 13 returned 200 on development and static servers; exact answers, editions, source links, clarifications and fallback behavior matched; no horizontal overflow at 320px |
| Accessibility and runtime | Zero axe WCAG 2 A/AA and 2.2 AA violations on each new article; no page, console or HTTP errors |
| Directory and random mix | 417 local records, 192 approved records, 145 allowlisted choices on both servers; two additions included, eleven excluded; draw/skip and The Settlers of Catan alias search passed |
| Coverage | Cascadia and Tiny Towns resolve to reviewed editions; Blueprints remains pending; zero/one/1,320 result counts passed |
| Browser rerun | Nine selected tests passed across Chromium, Firefox and WebKit, covering every researched page, full inventory search, edition identity and reviewed-pool filtering |
| Follow-up checks | Lint and content coverage passed after correcting the affected test expectations |
| Visual inspection | All six new screenshots opened: four mobile articles, desktop Wingspan and CATAN alias search. No clipping or horizontal overflow found |

The first browser run had six failures and three passes: the same two stale expectations failed in each engine. One still expected the newly approved UNO page to return 404; the other located Tiny Towns by its old edition label. Tests now choose a remaining unapproved draft for the exclusion check and locate the Tiny Towns edition by its stable route. The rerun passed all nine. The live-check helper also initially searched for CATAN's ID in an inventory that does not include it; that check was corrected to use the observed Cascadia and Tiny Towns identities and rerun successfully.

Evidence: `artifacts/core-games-live-check.json`, `artifacts/core-games-browser/.last-run.json` (initial failures), `artifacts/core-games-browser-rerun/.last-run.json` (passed rerun), and `research/coverage/core-games-review-progress.md`. Publisher downloads and browser source evidence are cached under `research/source-files/core-games-review/`. This pass did not rerun the entire release matrix, unchanged presentation tests or Lighthouse.

New screenshots in `artifacts/screenshots/`: `reviewed-{cascadia-base-en,catan-2020-en,tiny-towns-base-en,uno-10020-sn70-en}-mobile.png`, `reviewed-wingspan-desktop.png`, and `dev-catan-alias-search.png`. Retained-view examples remain `retained-rio-grande-zoch-spinner-desktop.png`, `retained-rio-grande-zoch-card-draw-320.png`, and `retained-rio-grande-zoch-balloon-rise-320.png`.

No public deployment occurred. The remaining factual research is implementation work under standing authorization. Original-prompt approval, domain/hosting authorization, contact/privacy configuration, physical-device/native-share/screen-reader checks and the authorized release process remain in `LAUNCH_CHECKLIST.md`.

## Previous checkpoint — 2026-09-23 12:04 UTC

All seven animated presentations remain visible with the winner: Spinner, Card Draw, Balloon Rise, Towers, Shortest Match, Dice Roll and Marble Race. Fresh homepage checks verified the same DOM scene survives completion, replay creates a new scene, and skipping settles it. The existing behavior required no further UI changes in this pass.

Fourteen previously researched Rio Grande and Zoch drafts completed editorial review. Totals: **417 researched records**, **396 of 1,320 inventory identities**, **924 pending**, **179 approved catalog entries**, and **143 portable random-mix criteria**. Six original prompts remain local drafts. Approval increased; research coverage did not. The full compendium is unfinished.

| Check | Actual result |
|---|---|
| `npm run verify` | Passed at 12:01 UTC: 70 Astro files with zero diagnostics, lint, 33 unit tests, content validation, static build and artifact audits |
| Static build audit | 193 pages and 2,437 internal links; canonicals, unique metadata, structured data, sitemap, headers and private-content exclusion passed |
| Size audit | Initial JavaScript 102,742 gzip bytes; Balloon 766 bytes; basic home 124,707 bytes |
| Source review | Re-inspected 20 rendered pages from 14 cached publisher PDFs; checked setup and gameplay context, edition scope, alternatives, and source-file hashes before approving each exact revision |
| Source availability | All 14 cited URLs returned HTTP 200 with PDF content types at 11:58 UTC |
| Live articles | All 14 returned 200 from development and static servers; exact answers, source URLs, clarifications, fallback behavior and editions matched; no horizontal overflow at 320px |
| Accessibility and errors | Zero axe WCAG 2 A/AA and 2.2 AA violations on each newly approved article; no reported page, console or HTTP errors |
| Directory and random mix | 417 local records, 179 approved records; all 143 choices matched the allowlist on both servers. Six additions included and eight excluded. Draw/skip and Trans Siberian Railroad alias search passed |
| Coverage | Beyond the Sun and Beasty Bar resolve to reviewed editions; Blueprints remains pending. Zero/one/1,320 result counts passed |
| Browser checks | 33 selected tests passed across Chromium, Firefox and WebKit: all researched pages, full inventory, search and pool filtering, all seven retained scenes, completion/skip/replay/editing, and the compact 12-player spinner |
| Fresh homepage checks | All seven methods passed at 320px on the running development homepage. The 12-player spinner handled long names and duplicate Unicode names without horizontal overflow; desktop spinner also captured |
| Visual inspection | All 14 new screenshots opened and inspected: nine homepage views and five article/directory views. No clipping or horizontal overflow found |

Evidence: `artifacts/rio-grande-zoch-live-check.json`, `artifacts/source-availability-rio-grande-zoch.json`, `artifacts/rio-grande-zoch-retained-home-live-check.json`, `artifacts/rio-grande-zoch-browser/.last-run.json`, and `research/coverage/rio-grande-zoch-review-progress.md`. The direct Playwright CLI preserved the selected-test filter. This was not a rerun of the entire release matrix or a new Lighthouse measurement.

Current screenshots in `artifacts/screenshots/`: `retained-rio-grande-zoch-{spinner-320,spinner-12-320,spinner-desktop,card-draw-320,balloon-rise-320,towers-320,shortest-match-320,dice-roll-320,marble-race-320}.png`; `reviewed-{beyond-the-sun-rio-grande-en,trans-siberian-railroad-rio-grande-en,butterfly-rio-grande-en}-mobile.png`; `reviewed-niagara-desktop.png`; and `dev-trans-siberian-railroad-alias-search.png`.

Physical-device checks, native sharing and a real screen reader remain launch checks. No public deployment occurred.

## Previous checkpoint — 2026-09-23 11:49 UTC

The finished spinner, cards and balloons remain visible with the winner. No application UI code changed in this content pass. The most recent dedicated retained-scene checks remain the successful 11:10 UTC checks documented below.

Six entries were added: Dale of Merchants, Dawn of Peacemakers, The Liberation of Rietburg, Zombie Dice, Dino Hunt Dice and The Stars are Right. Totals: **417 researched records**, **396 of 1,320 inventory identities**, **924 pending**, **165 approved catalog entries**, and **137 portable random-mix criteria**. Six original prompts remain local drafts. The full compendium is unfinished.

| Check | Actual result |
|---|---|
| `npm run verify` | Passed at 11:46 UTC: 70 Astro files with zero diagnostics, lint, 33 unit tests, content validation, static build and artifact audits |
| Static build audit | 179 pages and 2,261 internal links; canonicals, unique metadata, structured data, sitemap, headers and private-content exclusion passed |
| Size audit | Initial JavaScript 102,742 gzip bytes; Balloon 766 bytes; basic home 124,410 bytes |
| Source review | Six complete publisher-hosted or publisher-linked PDF files retrieved; all 22 listed renders inspected. Dawn's file is explicitly a shortened campaign excerpt. Its publisher FAQ/errata was read separately |
| Source availability | All six cited URLs returned HTTP 200 with PDF content types at 11:47 UTC |
| Live articles | All six returned 200 from development and static servers; exact answers, source URLs, clarifications, fallback behavior and editions matched; no horizontal overflow at 320px |
| Accessibility and errors | Zero axe WCAG 2 A/AA and 2.2 AA violations on each new article; no reported page, console or HTTP errors |
| Directory and random mix | 417 local records, 165 approved records; all 137 live choices matched the allowlist on both servers. Three additions included and three previous-game-dependent entries excluded. Draw/skip and Rietburg alias search passed |
| Coverage | Dale of Merchants and The Stars are Right resolve to their correct researched editions; Blueprints remains pending. Zero/one/1,320 result counts passed |
| Browser checks | Nine affected directory checks passed in **1.4 minutes** across Chromium, Firefox and WebKit, including every researched article, discovery search and reviewed-pool filtering |
| Visual inspection | Five new article/directory screenshots captured at 11:47 UTC, opened and inspected; no clipping or overflow found |

Evidence: `artifacts/snowdale-rietburg-sjgames-live-check.json`, `artifacts/source-availability-snowdale-rietburg-sjgames.json`, `artifacts/snowdale-rietburg-sjgames-browser/.last-run.json`, and `research/coverage/snowdale-rietburg-sjgames-progress.md`. The direct Playwright CLI preserved the three-test filter. Unchanged homepage and full-release matrices were not rerun during this content-only pass.

Current content screenshots in `artifacts/screenshots/`: `reviewed-dale-of-merchants-snowdale-en-6-mobile.png`, `reviewed-dawn-of-peacemakers-snowdale-en-campaign-1-1-mobile.png`, `reviewed-liberation-of-rietburg-kosmos-en-2020-mobile.png`, `reviewed-zombie-dice-desktop.png`, and `dev-liberation-of-rietburg-alias-search.png`. Latest homepage screenshots remain `retained-underdog-thunderworks-{spinner-320,spinner-12-320,spinner-desktop,card-draw-320,balloon-rise-320}.png`.

Physical-device checks, native sharing and a real screen reader remain launch checks. No public deployment occurred.

## Previous checkpoint — 2026-09-23 11:36 UTC

The finished spinner, cards and balloons still remain visible with the winner. This pass added content and review helpers; no application UI code changed. The most recent dedicated retained-scene checks are the successful 11:10 UTC checks in the previous checkpoint.

Seven entries were added: Dinosaur Island, Canvas, Adventure Games: Monochrome Inc., The Dungeon, The Gloom City File, The Grand Hotel Abaddon, and The Volcanic Island. Totals: **411 researched records**, **390 of 1,320 inventory identities**, **930 pending**, **159 approved catalog entries**, and **134 portable random-mix criteria**. Six original prompts remain local drafts. The full compendium is unfinished.

| Check | Actual result |
|---|---|
| `npm run verify` | Passed at 11:32 UTC: 70 Astro files with zero diagnostics, lint, 33 unit tests, content validation, static build and artifact audits |
| Static build audit | 173 pages, 2,184 internal links; exact canonicals, unique metadata, structured data, sitemap, headers and private-content exclusion passed |
| Size audit | Initial JavaScript 102,742 gzip bytes; Balloon 766 bytes; basic home 124,147 bytes |
| Source review | Seven complete publisher-hosted or publisher-linked PDFs retrieved; all 32 listed rendered pages inspected for setup, opening actions, relevant modes and edition evidence |
| Source availability | All seven cited URLs returned HTTP 200 at 11:33 UTC; five direct PDFs and two document-viewer HTML pages. Complete PDFs were retrieved separately for editorial review |
| Live articles | All seven returned 200 from development and static servers; exact answers, source URLs, clarifications, house fallbacks and editions matched; no horizontal overflow at 320px |
| Accessibility and errors | Zero axe WCAG 2 A/AA and 2.2 AA violations on each new article; no reported page, console or HTTP errors |
| Directory and random mix | 411 local records, 159 approved records; all 134 live choices matched the reviewed allowlist on both servers. All seven additions included. Draw/skip and Grand Hotel Abaddon alias search passed |
| Coverage | Dinosaur Island and Canvas resolve to their correct researched editions. Terra remains pending. Zero/one/1,320 result counts passed |
| Browser checks | Nine affected directory checks passed in **1.1 minutes** across Chromium, Firefox and WebKit, including every researched article, discovery search and reviewed-pool filtering |
| Visual inspection | Five new article/directory screenshots captured at 11:32 UTC, opened and inspected. No clipping or overflow found |

The direct Playwright CLI preserved the three-test filter and output directory; its nine results are in `artifacts/canvas-dinosaur-adventures-browser/.last-run.json`. Passing unchanged homepage and full-release checks were not rerun during this content-only pass.

Dinosaur Island preserves its official theme-park fallback and keeps later-round score ties separate. Canvas retains its original ©2021 edition and Vincent variant. The five Adventure Games entries preserve distinct initial criteria and copyright/publication codes; no rule was inferred from another title in the series.

Evidence: `artifacts/canvas-dinosaur-adventures-live-check.json`, `artifacts/source-availability-canvas-dinosaur-adventures.json`, and `research/coverage/canvas-dinosaur-adventures-progress.md`.

Current content screenshots are in `artifacts/screenshots/`: `reviewed-dinosaur-island-pandasaurus-en-rulebook-2-mobile.png`, `reviewed-canvas-r2i-en-2021-mobile.png`, `reviewed-adventure-games-hotel-abaddon-kosmos-en-2021-mobile.png`, `reviewed-gloom-city-desktop.png`, and `dev-grand-hotel-abaddon-alias-search.png`. The latest homepage screenshots remain `retained-underdog-thunderworks-{spinner-320,spinner-12-320,spinner-desktop,card-draw-320,balloon-rise-320}.png`.

Physical devices, native sharing and a real screen reader remain launch checks. No public deployment occurred.

## Previous checkpoint — 2026-09-23 11:13 UTC

The finished spinner, cards and balloons remain visible with the winner. Fresh running-homepage checks confirmed the same DOM scene survives completion, while replay creates a new scene and skipping settles it correctly. This pass added content and review helpers; no application UI code changed.

Seven entries were added: Trekking the National Parks: Second Edition, Trekking the World, FlipToons, Dawn of Ulos, Azul: Master Chocolatier, Azul: Stained Glass of Sintra, and Beez. Totals: **404 researched records**, **383 of 1,320 inventory identities**, **937 pending**, **152 approved catalog entries**, and **127 portable random-mix criteria**. Six original prompts remain local drafts. The full compendium is unfinished.

| Check | Actual result |
|---|---|
| `npm run verify` | Passed at 11:09 UTC: 70 Astro files with zero diagnostics, lint, 33 unit tests, content validation, static build and artifact audits |
| Static build audit | 166 pages, 2,093 internal links; exact canonicals, unique metadata, structured data, sitemap, headers and private-content exclusion passed |
| Size audit | Initial JavaScript 102,742 gzip bytes; Balloon 766 bytes; basic home 123,683 bytes |
| Source review | Seven complete publisher-hosted or publisher-linked PDFs retrieved; all 35 listed rendered pages inspected for setup, opening actions, relevant modes and edition evidence |
| Source availability | All seven cited URLs returned HTTP 200 with PDF content types at 11:09 UTC |
| Live articles | All seven returned 200 from development and static servers; exact answers, source URLs, clarifications, house fallbacks and editions matched; no horizontal overflow at 320px |
| Accessibility and errors | Zero axe WCAG 2 A/AA and 2.2 AA violations on each new article; no reported page, console or HTTP errors |
| Directory and random mix | 404 local records, 152 approved records; all 127 live choices matched the reviewed allowlist on both servers. Six additions included; FlipToons excluded. Draw/skip and Azul Sintra alias search passed |
| Coverage | Both Trekking identities resolve to the correct researched editions. Terra remains pending. Zero/one/1,320 result counts passed |
| Browser checks | Nine affected directory checks passed in **1.1 minutes** across Chromium, Firefox and WebKit, including every researched article, discovery search and reviewed-pool filtering |
| Retained presentations | Spinner, Card Draw and Balloon Rise passed same-scene completion, replay and skip checks. The 12-player spinner handled long names and duplicate Unicode names at 320px without horizontal overflow |
| Visual inspection | Ten new screenshots captured at 11:10 UTC and opened: five content/directory views plus five homepage views. No clipping or overflow found |

The direct Playwright CLI preserved the three-test filter and output directory; its nine results are in `artifacts/underdog-thunderworks-browser/.last-run.json`. No second directory matrix was run. The standalone homepage check used Chromium; it is not a claim that physical devices or screen readers were tested.

FlipToons distinguishes its simultaneous opening from later Market priority. Beez preserves counterclockwise setup and clockwise play. Trekking editions remain separate from newer manuals; Next Move copyright years come from the PDFs rather than their hosting paths. Endgame ties are not presented as starting-player tie-breaks.

Evidence: `artifacts/underdog-thunderworks-live-check.json`, `artifacts/source-availability-underdog-thunderworks.json`, `artifacts/underdog-thunderworks-retained-home-live-check.json`, and `research/coverage/underdog-thunderworks-progress.md`.

Current screenshots are in `artifacts/screenshots/`: `reviewed-fliptoons-thunderworks-en-2025-mobile.png`, `reviewed-azul-sintra-next-move-en-2024-mobile.png`, `reviewed-beez-next-move-en-2020-mobile.png`, `reviewed-trekking-national-parks-second-edition-desktop.png`, `dev-azul-sintra-alias-search.png`, and `retained-underdog-thunderworks-{spinner-320,spinner-12-320,spinner-desktop,card-draw-320,balloon-rise-320}.png`.

Earlier full development and isolated release matrices, fault injection and Lighthouse measurements below were not rerun during this content-only pass. Physical devices, native sharing and a real screen reader remain launch checks. No public deployment occurred.

## Previous checkpoint — 2026-09-23 10:53 UTC

Finished spinner, balloons, cards and other animated views remain alongside the winner. This pass added content and review helpers; no application UI code changed.

Six entries were added: Lotus, Terror Below, Oceans, Paint the Roses, Nature, and Goblin Vaults. Totals: **397 researched records**, **376 of 1,320 inventory identities**, **944 pending**, **145 approved catalog entries**, and **121 portable random-mix criteria**. Six original prompts remain local drafts. The full compendium is unfinished.

| Check | Actual result |
|---|---|
| `npm run verify` | Passed at 10:49 UTC: 70 Astro files with zero diagnostics, lint, 33 unit tests, content validation, static build and artifact audits |
| Static build audit | 159 pages, 2,002 internal links; exact canonicals, unique metadata, structured data, sitemap, headers and private-content exclusion passed |
| Size audit | Initial JavaScript 102,742 gzip bytes; Balloon 766 bytes; basic home 123,379 bytes |
| Source review | Six complete publisher-hosted or publisher-linked PDFs retrieved; all 36 listed rendered pages inspected for setup, opening actions, relevant modes and edition evidence |
| Source availability | All six cited URLs returned HTTP 200 with PDF content types at 10:50 UTC |
| Live articles | All six returned 200 from development and static servers; exact answers, source URLs, clarifications, house fallbacks and edition labels matched; no horizontal overflow at 320px |
| Accessibility and errors | Zero axe WCAG 2 A/AA and 2.2 AA violations on each new article; no reported page, console or HTTP errors |
| Directory and random mix | 397 local records, 145 approved records; all 121 live choices matched the reviewed allowlist on both servers. Five new criteria included and Terror Below excluded. Draw/skip and Nature alias search passed |
| Coverage | Nature identity 330152 has its researched entry; Terra 153507 remains pending. Zero/one/1,320 result counts passed |
| Browser checks | Nine affected directory checks passed in **1.1 minutes** across Chromium, Firefox and WebKit, including every researched article, the full discovery inventory and reviewed-pool filtering |
| Visual inspection | Five new content/directory screenshots captured at 10:50 UTC, opened and inspected; no clipping or overflow found |

The browser command used the direct Playwright CLI so the three-test filter and artifact output directory were honored. Its nine actual results are preserved in `artifacts/renegade-northstar-thunderworks-browser/.last-run.json`. No second browser matrix was run.

The new entries preserve Nature's simultaneous Quick Play variant, Goblin Vaults' first human bidder after Glavrun's two-player reveal, Terror Below's reverse setup placement, and Lotus's ©2024 credits despite its filename. Printed page references distinguish unnumbered credits and Nature's PDF spreads. Missing initial-start tie-breaks are not inferred from endgame rules.

Evidence: `artifacts/renegade-northstar-thunderworks-live-check.json`, `artifacts/source-availability-renegade-northstar-thunderworks.json`, and `research/coverage/renegade-northstar-thunderworks-progress.md`.

Current screenshots in `artifacts/screenshots/`: `reviewed-oceans-north-star-en-mobile.png`, `reviewed-nature-northstar-en-core-mobile.png`, `reviewed-goblin-vaults-thunderworks-en-2022-mobile.png`, `reviewed-paint-the-roses-desktop.png`, and `dev-nature-core-alias-search.png`.

The 09:30 UTC retained-scene report and homepage screenshots remain the latest specific retention evidence. The earlier 24-check development matrix, isolated release matrix, fault injection and Lighthouse results below were not rerun during this content-only pass. Physical devices, native sharing and a real screen reader remain launch checks. No public deployment occurred.

## Previous checkpoint — 2026-09-23 10:33 UTC

The finished spinner, balloons, cards and other animated views remain alongside the winner. This content pass preserved that behavior and made no application UI changes.

Seven Capstone and Atlas entries were added: Boonlake, Curious Cargo, Terra Mystica, Joan of Arc: Orléans Draw & Write, Gloom, Once Upon a Time, and Seismic. Current totals: **391 researched records**, **370 of 1,320 inventory identities**, **950 pending**, **139 approved catalog entries**, and **116 portable random-mix criteria**. Six original prompts remain local drafts. The full compendium is unfinished.

| Check | Actual result |
|---|---|
| `npm run verify` | Passed at 10:28 UTC: 70 Astro files with zero diagnostics, lint, 33 unit tests, content validation, static build and artifact audits |
| Static build audit | 153 pages, 1,924 internal links; exact canonicals, unique metadata, structured data, sitemap, headers and private-content exclusion passed |
| Size audit | Initial JavaScript 102,742 gzip bytes; Balloon 766 bytes; basic home 123,104 bytes |
| Source review | Seven complete publisher-linked PDFs retrieved; all 25 listed rendered pages inspected for setup, opening actions, relevant modes and edition evidence |
| Source availability | All seven cited URLs returned HTTP 200 and PDF content types at 10:28 UTC |
| Live article inspection | All seven returned 200 from development and static servers; exact answers, source links, clarifications, applicable fallbacks/tie-breaks and editions matched; no horizontal overflow at 320px |
| Article accessibility | Zero axe WCAG 2 A/AA and 2.2 AA violations on each of the seven pages; no reported page, console or HTTP errors |
| Directory and random mix | 391 local records, 139 approved records; all 116 live choices exactly matched the reviewed allowlist on both development and static pages. Four additions included and three excluded as reviewed. Draw/skip, OUAT alias search and zero/one/1,320 coverage labels passed |
| Identity separation | Terra Mystica (120677) is researched; unrelated Terra (153507) remains pending |
| Browser matrix | All 24 checks in the development-preview file passed in **2.8 minutes** across Chromium, Firefox and WebKit. This included all nine reveal modes, saved names/preferences, every researched article, RNG failure recovery, search, private-route exclusion and live content updates |
| Visual inspection | Five content/directory screenshots captured at 10:32 UTC, opened and inspected. The 09:30 UTC homepage screenshots remain the latest retained-scene captures |
| Final helper/document check | Type checking, lint, content validation and coverage passed again at 10:33 UTC. The live helper was rerun at 10:32 after tightening its no-house-fallback assertion |

The attempted npm filter flags were not forwarded on this host, so the browser run covered the entire development-preview file rather than the intended nine-check subset. The actual 24-test result is recorded above. Its final status was copied from `test-results/.last-run.json` to `artifacts/capstone-atlas-browser/.last-run.json`; no second browser matrix was run.

Curious Cargo's initial priority does not guarantee the first Trucking action. Joan of Arc's official random selection is not labeled a house fallback. Gloom's owner tie-break applies only when all players had equally miserable days. Once Upon a Time requires a Story Card and therefore stays out of the portable mix. No held source was replaced with a guessed rule. Documentation inspection caught and corrected an overbroad count replacement in the historical UNO edition label; the update helper now matches count phrases rather than bare numbers.

Evidence: `artifacts/capstone-atlas-live-check.json`, `artifacts/capstone-atlas-browser/.last-run.json`, `artifacts/source-availability-capstone-atlas.json`, and `research/coverage/capstone-atlas-progress.md`.

Current content screenshots under `artifacts/screenshots/`: `reviewed-curious-cargo-capstone-en-mobile.png`, `reviewed-joan-of-arc-orleans-capstone-en-2022-mobile.png`, `reviewed-gloom-atlas-en-second-edition-mobile.png`, `reviewed-terra-mystica-desktop.png`, and `dev-ouat-alias-search.png`.

The retained-scene checks and five homepage screenshots from 09:30 UTC below remain the latest specific scene-retention evidence. The isolated release matrix, other fault-injection checks, Lighthouse measurements and physical-device limitations documented below were not rerun in this content-only pass. No public deployment occurred.

## Previous checkpoint — 2026-09-23 10:11 UTC

The finished spinner, balloons, cards and other animated views remain alongside the winner. This content pass preserved that behavior and made no application UI changes.

Five Osprey and Genius Games entries were added: The King Is Dead: Second Edition, Village Green, Cytosis, Periodic and Subatomic. Current totals: **384 researched records**, **363 of 1,320 inventory identities**, **957 pending**, **132 approved catalog entries**, and **112 portable random-mix criteria**. Six original prompts remain local drafts. The full compendium is unfinished.

| Check | Actual result |
|---|---|
| `npm run verify` | Passed at 10:07 UTC: 70 Astro files with zero diagnostics, lint, 33 unit tests, content validation, static build and artifact audits |
| Static build audit | 146 pages, 1,834 internal links; exact canonicals, unique metadata, structured data, sitemap, headers and private-content exclusion passed |
| Size audit | Initial JavaScript 102,742 gzip bytes; Balloon 766 bytes; basic home 122,877 bytes |
| Source review | Five complete publisher or publisher-linked PDFs retrieved; all 28 listed rendered pages inspected for setup, opening actions, relevant modes and edition evidence |
| Source availability | All five cited URLs returned HTTP 200 at 10:09 UTC. Two are Drive viewers; their separately retrieved PDFs supplied the rule evidence |
| Live article inspection | All five returned 200 from development and static servers at 10:09 UTC. Exact answers, source links, clarifications, house fallbacks and editions matched; no horizontal overflow at 320px |
| Article accessibility | Zero axe WCAG 2 A/AA and 2.2 AA violations on each of the five pages; no reported page, console or HTTP errors |
| Directory and random mix | 384 local records; all 112 live choices exactly matched the reviewed allowlist, including all five additions. Draw/skip, Cytosis alias search and zero/one/1,320 coverage labels passed |
| Browser matrix | Nine affected directory checks passed in **1.0 minute** across Chromium, Firefox and WebKit |
| Visual inspection | Four current content/directory screenshots opened and inspected. The existing 09:30 UTC Spinner, Card Draw and Balloon Rise screenshots were reopened; they were not newly captured |
| Final helper/document check | Type checking, lint and content validation passed again at 10:11 UTC after adding the inspection helper and documentation |

Edition limitations are explicit: Subatomic's publisher page says second edition, while its PDF does not identify its own printing. Cytosis' foreword does identify its second edition. Periodic preserves the non-monotonic starting Energy allocation. No source failure was replaced with a guessed rule. A documentation count replacement briefly changed the README's loopback address; inspection caught it, the address was restored to `127.0.0.1`, and the helper was constrained to avoid dotted addresses.

Evidence: `artifacts/osprey-genius-live-check.json`, `artifacts/osprey-genius-browser/.last-run.json`, `artifacts/source-availability-osprey-genius.json`, and `research/coverage/osprey-genius-progress.md`.

Current screenshots under `artifacts/screenshots/`: `reviewed-periodic-genius-en-mobile.png`, `reviewed-subatomic-genius-en-publisher-download-mobile.png`, `reviewed-king-is-dead-second-edition-desktop.png`, and `dev-cytosis-alias-search.png`.

The retained-scene checks and five homepage screenshots from 09:30 UTC below remain the latest homepage evidence. The isolated release matrix, failed-decoration checks and Lighthouse were not rerun for this content-only pass. Physical devices, native sharing and a real screen reader remain launch checks. No public deployment or external account change occurred. See `LAUNCH_CHECKLIST.md` for owner actions.

## Earlier checkpoint — 2026-09-23 09:54 UTC

The finished spinner, balloons, cards and other animated scenes remain alongside the winner. That implemented behavior was preserved; this pass changed editorial content and inspection helpers, not the application UI.

Ten more official Dized references add Big Monster, Blood Rage, Champions of Midgard, Coup, Flamme Rouge, New York Slice, Schrödinger's Cats, The Grimm Forest, Volcano (Fiesta Caldera), and boop. Current totals: **379 researched records**, **358 of 1,320 inventory identities**, **962 pending**, **127 approved catalog entries**, and **107 portable random-mix criteria**. Six original prompts remain local drafts. The full compendium is unfinished.

| Check | Actual result |
|---|---|
| `npm run verify` | Passed again at 09:51 UTC after the editorial correction: 70 Astro files with zero diagnostics, lint, 33 unit tests, content validation, static build and artifact audits |
| Static build audit | 141 pages, 1,769 internal links; exact canonicals, unique metadata, structured data, sitemap, headers and private-content exclusion passed |
| Size audit | Initial JavaScript 102,742 gzip bytes; Balloon 766 bytes; basic home 122,547 bytes |
| Source review | Ten publisher-maintained indexes and all 72 selected rule-section bodies for those games read in full; HTML snapshots and hashes preserved. No PDF or physical-edition inspection claimed |
| Source availability | All 44 cited URLs returned HTTP 200 in a separate HEAD check at 09:50 UTC |
| Final live articles | All ten returned 200 from development and static servers at 09:52 UTC. Exact answers, source links, clarifications, interpretations, editions and official tie text matched; no horizontal overflow at 320px |
| Article accessibility | Zero axe WCAG 2 A/AA and 2.2 AA violations on each of the ten pages; no reported page, console or HTTP errors |
| Directory and random mix | 379 local records; all 107 live choices exactly matched the reviewed allowlist. Six additions are eligible and four stay directory-only. Draw/skip, alternate-spelling search, zero/one/1,320 coverage labels and the rejected Balloon Pop identity passed |
| Final browser matrix | Nine affected directory checks passed in **54.6 seconds** across Chromium, Firefox and WebKit after the correction |
| Visual inspection | Five representative screenshots inspected; the corrected Volcano mobile view and regenerated random-rule/search view inspected again |
| Final helper/document check | Type checking, lint and content validation passed again at 09:54 UTC |

Visual inspection found that four official random alternatives were repeated under a House rule heading. Those duplicates were removed from Champions of Midgard, Coup, Volcano and boop. while preserving the official alternatives in their main answers. The four exact catalog revisions and three existing pool revisions were re-reviewed. Build and affected live/browser checks were rerun after the fix. Earlier passes before the fix are not substituted for final results.

Evidence: `artifacts/dized-followup-live-check.json`, `artifacts/dized-followup-browser/.last-run.json`, `artifacts/source-availability-dized-followup.json`, and `research/coverage/dized-followup-progress.md`.

Representative screenshots in `artifacts/screenshots/`: `reviewed-big-monster-explor8-en-dized-mobile.png`, `reviewed-volcano-fiesta-caldera-looney-en-dized-mobile.png`, `reviewed-flamme-rouge-desktop.png`, `dev-schrodingers-cats-alias-search.png`, and `dev-balloon-pop-held-identity.png`.

The retained-scene checks and five homepage screenshots from 09:30 UTC below remain the latest homepage evidence; they were not rerun for this content-only pass. The isolated release matrix, failed-decoration checks and Lighthouse were also not rerun. Physical devices, native sharing and a real screen reader remain launch checks. No public deployment or external account change occurred. See `LAUNCH_CHECKLIST.md` for the owner actions.

## Earlier checkpoint — 2026-09-23 09:33 UTC

All seven animated methods retain their finished scene alongside the winner. This behavior is already implemented; the current pass rechecked it without changing application UI code. A new six-game batch adds Tiny Epic Dinosaurs, Kingdoms, Quest, Vikings, Western and Zombies using official English Dized references.

Current totals: **369 researched records**, **348 of 1,320 inventory identities**, **972 pending**, **117 approved catalog entries**, **101 portable random-mix criteria**. Six original prompt drafts remain local-only. The full compendium is unfinished; source research and editorial review remain implementation work under the owner's standing delegation.

| Check | Actual result |
|---|---|
| `npm run verify` | Passed at 09:29 UTC: 70 Astro files with zero diagnostics, lint, 33 unit tests, content validation, static build and artifact audits |
| Static build audit | 131 pages, 1,644 internal links; canonicals, metadata, structured data, sitemap, indexing, headers and private-content exclusion passed |
| Size audit | Initial JavaScript 102,742 gzip bytes; Balloon 766 bytes; basic home 122,123 bytes |
| Source review | Six publisher-maintained indexes and all 52 selected English rule-section bodies read; HTML snapshots and hashes preserved. No PDF-page inspection is claimed for these HTML references |
| Source availability | All 28 cited section URLs returned HTTP 200 at 09:31 UTC in a separate HEAD check |
| Live article inspection | Six new articles returned 200 from development and static servers; exact answers, clarifications and source links matched. No horizontal overflow at 320px; zero axe WCAG 2 A/AA and 2.2 AA violations on each |
| Directory and random mix | All 369 researched entries available; live choices exactly matched the 101 reviewed eligible revisions. Five additions are portable; Zombies remains directory-only with role interpretation labeled. Draw/skip, TEDino alias and zero/one/1,320 inventory counts passed |
| Browser matrix | **36 checks passed in 2.6 minutes** across Chromium, Firefox and WebKit: nine directory/coverage checks plus 27 retained-scene, compact Spinner and twelve-player/reduced-motion checks |
| Fresh homepage inspection | Spinner, Card Draw and Balloon Rise retained the same DOM scene through normal completion, replaced it on a new draw and settled on skip. Twelve-player long/duplicate-name Spinner and desktop views passed; no page, console or HTTP errors |
| Visual inspection | All nine current content/directory/coverage screenshots and five current homepage screenshots opened and inspected |
| Final helper check | Type checking, lint and content validation passed again at 09:33 UTC after the inspection helpers and content documentation were added |

Evidence: `artifacts/gamelyn-dized-live-check.json`, `artifacts/gamelyn-dized-retained-home-live-check.json`, `artifacts/gamelyn-dized-browser/.last-run.json`, `artifacts/source-availability-gamelyn-dized.json`, and `research/coverage/gamelyn-dized-progress.md`.

Current screenshots under `artifacts/screenshots/`: `retained-gamelyn-dized-spinner-320.png`, `retained-gamelyn-dized-card-draw-320.png`, `retained-gamelyn-dized-balloon-rise-320.png`, `retained-gamelyn-dized-spinner-desktop.png`, `retained-gamelyn-dized-spinner-12-320.png`; the content report enumerates all nine additional views.

The initial preparation command stalled with the default tsx cache. Only those task-owned processes were stopped; preparation and checks succeeded with the per-command environment setting `TSX_DISABLE_CACHE=1`. No shared cache or server was removed. The first live article check failed with an execution context destroyed during navigation. Its fresh retry passed; the cause was not established, and the first attempt is not counted as a pass. An inspection-helper preparation command also collided with PowerShell's read-only HOME variable; the helper was corrected using a task-specific variable before execution and passed lint.

The isolated release matrix, failed-decoration tests and Lighthouse were not rerun in this content-only pass; their earlier results below are historical. Physical devices, native sharing and a real screen reader still need launch checks. No deployment or external account change occurred. See `LAUNCH_CHECKLIST.md` for the owner actions.

## Earlier checkpoint — 2026-09-23 09:14 UTC

The finished spinner, cards, balloons and other animated scenes remain visible alongside the winner. Fresh checks of Spinner, Card Draw and Balloon Rise passed normal completion, replay and skip. Desktop and twelve-player narrow-screen Spinner screenshots were also inspected. No application UI source changed during this content pass.

Twelve more exact source-reviewed records were added: Tang Garden, Iwari, Golems, Space Lunch, Rebis, Spirits of the Forest, Cat-a-comb, Forgenesis, Tuned, Villagers, Streets and Moon. The catalog now has **111 approved entries** and **96 portable random-mix criteria**. The local directory contains **363 researched records**, covering **342 of 1,320 inventory identities**, with **978 still pending**. Six original prompts remain drafts. The full compendium remains unfinished; source research and editorial review are implementation work under the owner's standing authorization.

| Check | Actual result |
|---|---|
| `npm run verify` | Passed at 09:08 UTC: 70 Astro files with zero diagnostics, lint, 33 unit tests, content validation, static build and artifact audits |
| Static build audit | 125 pages and 1,566 internal links; canonicals, metadata, structured data, sitemap, indexing, headers and private-content exclusion passed |
| Size audit | Initial JavaScript 102,742 gzip bytes; optional Balloon 766 bytes; basic home 121,817 bytes |
| Coverage | `npm run content:coverage` passed with 363 records, 342 matched identities and 978 pending |
| Source review | Twelve complete publisher PDFs retrieved and hash-recorded; all 60 listed rendered pages opened and inspected. Editions, setup/action distinctions and relevant variants recorded |
| Source availability | All twelve cited PDFs returned HTTP 200 at 09:09 UTC |
| Directory browser matrix | Nine checks passed in 53.9 seconds across Chromium, Firefox and WebKit: all 363 detail links, searchable inventory and random-mix eligibility |
| Fresh live article checks | All twelve new articles returned 200 from development and static servers, matched reviewed answers, clarifications and sources, and fit at 320px. Alias search and zero/one/many inventory labels passed |
| Article accessibility | All twelve new articles had zero axe violations for WCAG 2 A/AA and 2.2 AA tags. The successful fresh inspection reported no runtime, console or HTTP errors |
| Random mix | All 96 live choices matched the explicit reviewed allowlist. Eleven additions are eligible; Cat-a-comb is directory-only because the setup chooser's opponent starts. Draw and skip passed |
| Fresh retained homepage checks | At 09:11 UTC, Spinner, Card Draw and Balloon Rise kept the same scene through normal completion and supported replay/skip at 320px. Twelve long/duplicate names and desktop Spinner passed; no page, console or HTTP errors |
| Visual inspection | Fifteen new content/directory/coverage screenshots and five current homepage screenshots opened and inspected |
| Final helper/doc check | Type checking, lint and content validation passed again at 09:14 UTC after adding the inspection helpers and updating documentation |

Evidence: `artifacts/thundergryph-sinister-live-check.json`, `artifacts/source-availability-thundergryph-sinister.json`, `artifacts/compendium-thundergryph-sinister-browser/.last-run.json`, and `artifacts/thundergryph-sinister-retained-home-live-check.json`. Source decisions and cited pages are in `research/coverage/thundergryph-sinister-progress.md`.

Current homepage screenshots under `artifacts/screenshots/`: `retained-thundergryph-sinister-spinner-320.png`, `retained-thundergryph-sinister-card-draw-320.png`, `retained-thundergryph-sinister-balloon-rise-320.png`, `retained-thundergryph-sinister-spinner-desktop.png`, and `retained-thundergryph-sinister-spinner-12-320.png`. The content report lists all fifteen content screenshots, including `reviewed-cat-a-comb-desktop.png`, `dev-cat-a-comb-alias-search.png`, `dev-thundergryph-sinister-coverage.png`, and the twelve mobile article views.

The first live-article check failed with an execution context destroyed during navigation. Its fresh retry passed; the cause was not established, and the failed attempt does not count as a pass. No application code was changed to hide or bypass the error.

The earlier 08:17 checkpoint's 30 retained-scene checks across three engines and isolated release matrix remain historical evidence; they were not rerun for this content-only addition. This pass reran the affected directory matrix and current homepage checks. Lighthouse, physical devices and a real screen reader were not rerun. No public deployment or external account change occurred. Remaining launch actions are in `LAUNCH_CHECKLIST.md`.

## Earlier checkpoint — 2026-09-23 08:46 UTC

The finished spinner, balloons, cards and other animated scenes remain visible alongside the winner. Fresh checks of Spinner, Card Draw and Balloon Rise passed normal completion, replay and skip; desktop and twelve-player narrow-screen Spinner views were also inspected. No application UI source changed during this content pass.

Ten more exact source-reviewed records were added: Rococo Deluxe, Harmonies, Meadow, PARKS, Anachrony Essential Edition, Astra, Trickerion, Septima, and both standalone Perseverance episodes. The catalog has **99 approved entries** and **85 portable random-mix criteria**. The local directory has **351 researched records**, covering **330 of 1,320 inventory identities**, with **990 still pending**. Six original prompts remain drafts. The entire compendium is unfinished; remaining source research and editorial review are implementation work under the owner's standing authorization.

| Check | Actual result |
|---|---|
| `npm run verify` | Final pass at 08:41 UTC: 70 Astro files with zero diagnostics, lint, 33 unit tests, content validation, static build and artifact audits |
| Static build audit | 113 pages and 1,410 internal links; canonicals, metadata, structured data, sitemap, indexing, headers and private-content exclusion passed |
| Size audit | Initial JavaScript 102,742 gzip bytes; optional Balloon 766 bytes; basic home 121,159 bytes |
| Coverage | `npm run content:coverage` passed with 351 records, 330 matched identities and 990 pending. Perseverance's two episode answers count as one combined-box inventory identity |
| Source review | Ten complete primary or publisher-linked PDFs retrieved and hash-recorded; all 50 listed rendered pages opened and inspected. Edition, language, setup/action distinctions and exceptions recorded |
| Source availability | All ten cited URLs returned HTTP 200: four checked at 08:32 UTC and six at 08:42 UTC. Rococo and Septima use public viewers with separately inspected PDF downloads |
| Directory browser matrix | Final nine checks passed in 51.4 seconds across Chromium, Firefox and WebKit: all 351 detail links, searchable inventory and random-mix eligibility |
| Fresh live article checks | All ten new records returned 200 from development and static servers, matched reviewed answers and sources, and fit at 320px. Alias search and zero/one/many inventory labels passed |
| Article accessibility | All ten new articles had zero axe violations for WCAG 2 A/AA and 2.2 AA tags. Fresh content checks reported no runtime, console or HTTP errors |
| Random mix | All 85 live choices exactly matched the reviewed allowlist. Nine additions are eligible; Trickerion is directory-only because Magician selection differs from first action. Draw and skip passed |
| Fresh retained homepage checks | At 08:46 UTC, Spinner, Card Draw and Balloon Rise kept the same scene on normal completion and supported replay/skip at 320px. Twelve long/duplicate names and desktop Spinner passed; no page, console or HTTP errors |
| Visual inspection | Sixteen new content/directory/coverage screenshots and five current homepage screenshots opened and inspected |

Evidence: `artifacts/mixed-publisher-sep23-live-check.json`, `artifacts/mindclash-live-check.json`, `artifacts/source-availability-mixed-publisher-sep23.json`, `artifacts/source-availability-mindclash.json`, `artifacts/compendium-mindclash-browser/.last-run.json` and `artifacts/mindclash-retained-home-live-check.json`. Source decisions and cited pages are in `research/coverage/mixed-mindclash-progress.md`.

Current homepage screenshots under `artifacts/screenshots/`: `retained-mindclash-spinner-320.png`, `retained-mindclash-card-draw-320.png`, `retained-mindclash-balloon-rise-320.png`, `retained-mindclash-spinner-desktop.png` and `retained-mindclash-spinner-12-320.png`. The two live-content JSON reports list all sixteen content screenshot paths, including `reviewed-trickerion-desktop.png`, `dev-mindclash-coverage.png` and the ten new mobile article views.

Septima's first download exceeded the 70 MB bound. A complete 113,488,684-byte download succeeded under the 120 MB retry bound before source review; the failed attempt was preserved and not counted as a pass. No rule was approved from retrieval snippets alone.

The earlier 08:17 checkpoint's 30 retained-scene checks across three engines and isolated release matrix remain historical evidence; they were not rerun for this content-only addition. This pass reran the affected directory matrix and current homepage checks. Lighthouse, physical devices and a real screen reader were not rerun. No public deployment or external account change occurred. Remaining launch actions are in `LAUNCH_CHECKLIST.md`.

## Earlier checkpoint — 2026-09-23 08:17 UTC

All seven animated methods keep their finished scene visible with the winner announcement. Spinner now uses a compact two-column player legend instead of repeating the editable roster. The legend retains names, duplicate suffixes and stable colors; Edit players restores the inputs. A wheel viewport contains the rotated SVG bounds, fixing a reproduced one-pixel horizontal overflow at 320px with twelve players.

Ten more primary-source edition records were added and reviewed: two Incan Gold editions, Mercado de Lisboa, Federation, On Mars, Bot Factory, Escape Plan, Inventions: Evolution of Ideas, Nomads and Fearsome Floors. Exact editorial approvals total **89**, with **76 portable criteria** in the separate random mix. There are **341 researched edition records**, covering **321 of 1,320 inventory identities**; **999 identities remain pending**. Six original prompts remain drafts. The full compendium is unfinished; its research and editorial review remain implementation work under the owner's standing authorization. No deployment occurred.

| Check | Actual result |
|---|---|
| `npm run verify` | Final pass at 08:14 UTC: 70 Astro files with zero diagnostics, lint, 33 unit tests, content validation, static build and artifact audits |
| Build audit | 103 pages and 1,280 internal links; exact canonicals, unique metadata, structured data, sitemap parity, indexing, headers and private-content exclusion passed |
| Size audit | Initial JavaScript 102,742 gzip bytes; optional Balloon 766 bytes; basic home 120,574 bytes |
| Coverage | `npm run content:coverage` passed with 341 records, 321 matched identities and 999 pending. Separate editions and approved copies do not inflate identity counts |
| Source review | Ten primary manuals retrieved completely and hash-recorded; cited pages visually inspected. Mercado's image-only manual was read on all six pages. Edition, language, setup-versus-action order, alternatives and solo exceptions are recorded |
| Source availability | All ten cited URLs returned HTTP 200 at 07:58 UTC. Eight are public document viewers; their separate linked PDF downloads were inspected. Two are direct PDFs |
| Directory browser matrix | Nine checks passed in 49.8 seconds across Chromium, Firefox and WebKit: all 341 detail URLs, search, inventory and random-mix eligibility |
| Fresh content inspection | All ten new records returned 200 from development and static servers, matched their reviewed answers and sources, and fit at 320px. Alias search and zero/one/many coverage labels passed |
| Random mix | All 76 live choices exactly matched the reviewed allowlist. Mercado, Bot Factory and Nomads were included; the other seven new edition records were excluded. Draw and skip worked |
| Retained-scene regression matrix | Final **30 checks passed in 1.8 minutes** across Chromium, Firefox and WebKit after rebuilding the SVG fix. All seven methods preserve the same scene on completion, replace it on replay, settle on skip and restore editing. Download failure, reduced motion and narrow-screen layouts passed |
| Spinner regression | Twelve names, long text, duplicate Chinese names, stable colors, winner announcement and edit restoration passed in all three engines. No horizontal overflow at 320px and zero axe violations for WCAG 2 A/AA and 2.2 AA tags |
| Fresh homepage inspection | At 08:16 UTC, Spinner, Card Draw and Balloon Rise retained the same scene on normal completion and supported replay/skip at 320px. Additional desktop and twelve-player Spinner views passed. No page, console or HTTP errors |
| Article accessibility | Incan Gold 2024 and On Mars each had zero axe violations for WCAG 2 A/AA and 2.2 AA tags; the content inspection reported no runtime or HTTP errors |
| Release verification | `npm run test:dev-release` passed at 08:17 UTC: isolated empty preview, empty production, populated synthetic content, disabled mode and invalid-domain rejection, plus working fresh development-picker contexts before and after builds |
| Visual inspection | Seven new content/directory/coverage screenshots and five final homepage screenshots opened and inspected. No synthetic fixtures remained in the real content directories |

Evidence: `artifacts/eagle-ludonaute-2f-live-check.json`, `artifacts/source-availability-eagle-ludonaute-2f.json`, `artifacts/compendium-eagle-ludonaute-2f-browser/.last-run.json`, `artifacts/retained-compact-spinner-final-browser/.last-run.json`, `artifacts/eagle-retained-home-live-check.json` and `artifacts/release-fixtures/latest.json` (08:17:05 UTC). Source decisions and page locations are in `research/coverage/eagle-ludonaute-2f-progress.md`.

Final homepage screenshots in `artifacts/screenshots/`: `retained-eagle-spinner-320.png`, `retained-eagle-card-draw-320.png`, `retained-eagle-balloon-rise-320.png`, `retained-compact-spinner-desktop.png` and `retained-compact-spinner-12-320.png`. New content screenshots: `reviewed-incan-gold-mobile.png`, `reviewed-on-mars-mobile.png`, `reviewed-inventions-evolution-of-ideas-mobile.png`, `reviewed-nomads-mobile.png`, `reviewed-mercado-de-lisboa-desktop.png`, `dev-fearsome-floors-alias-search.png` and `dev-eagle-ludonaute-2f-coverage.png`.

Failures were not counted as passes. The first new-content browser inspection encountered interrupted navigation; its fresh retry passed, and the cause was not established. The new twelve-player Spinner test initially failed in all three engines because the rotated SVG made the 320px document 321px wide. DOM measurements confirmed the cause. An immediate post-fix retry still used the old static build and failed; after rebuilding, all 30 affected tests passed. The development DOM independently measured 320px after the fix. Earlier passing scene checks predated the compact legend and are not substituted for this final regression run.

Lighthouse, physical devices and a real screen reader were not rerun. No public deployment or external account change occurred. Remaining launch actions are in `LAUNCH_CHECKLIST.md`.

## Earlier checkpoint — 2026-09-23 07:29 UTC

Ten more primary-source records were added and reviewed: Renature, Corrosion, Savannah Park, Caldera Park, Trio, Chabyrinthe, Kawaii, Kinoko, Potion Explosion and Dragon Castle. The owner's standing authorization permits honest assistant editorial approval after source review. The catalog now has **79 approved entries** and **73 portable random-mix criteria**. Corrosion's optional example and the two Park games' shared-action chooser roles remain directory-only.

The complete local directory has **331 researched edition records**, covering **312 of 1,320 inventory identities**; **1,008 identities remain pending**. Six original prompts remain drafts. The compendium is unfinished. Research and editorial review remain implementation work, not a request for the owner to check each rule. No deployment occurred.

| Check | Actual result |
|---|---|
| `npm run verify` | Passed at 07:22 UTC: 70 Astro files, zero diagnostics; lint; 33 unit tests; content validation; static build and artifact audits |
| Build audit | 93 pages, 1,154 internal links; unique metadata, exact canonicals, structured data, sitemap parity, indexing, headers and private-content exclusion passed |
| Size audit | Initial JavaScript 102,672 gzip bytes; optional Balloon 766 bytes; basic home 120,125 bytes |
| Source review | Ten complete publisher or publisher-linked PDFs retrieved and hash-recorded; relevant pages visually inspected. Edition/language, starting versus later-round instructions, optional examples and solo context checked |
| Source availability | Ten citation URLs returned HTTP 200 at 07:24 UTC. Eight are direct PDFs; two are Dropbox document viewers whose separate linked PDF downloads were inspected |
| Development browser suite | All 24 checks passed in 2.7 minutes across Chromium, Firefox and WebKit. Includes all nine picker methods, names/preferences, all 331 detail URLs, search, house-rule skip, RNG errors, random-pool eligibility, coverage and live draft/approved updates |
| Fresh live content inspection | All ten new answers, qualifications and source links matched reviewed records; all ten returned 200 from development and static servers and fit at 320px |
| Random mix | All 73 live choices exactly matched the explicit reviewed allowlist; seven additions present, three directory-only additions absent; draw and skip worked |
| Accessibility and runtime | Caldera Park and Kawaii each had zero axe violations for WCAG 2 A/AA and 2.2 AA tags. No page, console or HTTP errors in the fresh inspection |
| Release verification | `npm run test:dev-release` passed at 07:27 UTC: full isolated empty/populated/disabled/invalid-domain matrix plus fresh development-picker contexts before and after builds |
| Screenshot fix and recheck | Corrected the coverage filter's “1 identities found” to “1 identity found.” A fresh check confirmed 0, 1 and 1,320 result labels, and recaptured the corrected page. Type check and lint passed again at 07:28 UTC |
| Visual inspection | Seven new website screenshots opened and inspected. The existing retained Spinner and Balloon result screenshots were also reopened |

Evidence: `artifacts/compendium-park-cocktail-guild-helvetiq-browser/.last-run.json`, `artifacts/source-availability-park-cocktail-guild-helvetiq.json`, `artifacts/park-cocktail-guild-helvetiq-live-check.json` (final fresh pass at 07:28:31 UTC), and `artifacts/release-fixtures/latest.json` (07:27:26 UTC). The browser command ran the complete development-preview suite, 24 checks, rather than only the intended filtered subset. No synthetic fixture files remained in the real content directories after the run.

New screenshots in `artifacts/screenshots/`: `reviewed-corrosion-mobile.png`, `reviewed-caldera-park-mobile.png`, `reviewed-kinoko-mobile.png`, `reviewed-potion-explosion-mobile.png`, `reviewed-trio-desktop.png`, `dev-potion-explosion-search.png`, and `dev-park-cocktail-guild-helvetiq-coverage.png`. The final coverage screenshot was reopened after the wording fix.

The first Potion Explosion download exceeded a 25 MB cap; a complete retry under a 60 MB cap succeeded before review. An initial local rendering command failed on Windows' default text encoding; explicitly reading UTF-8 resolved it. Neither failed attempt counted as verification. Available disk space recovered to roughly 2.3 GB by the final check without any cleanup in this pass.

The retained seven-method result behavior is preserved; its scene-specific regression evidence is in the previous checkpoint. This content pass reran all methods through the live development suite, but did not repeat the separate retained-scene matrix. Lighthouse, physical devices and a real screen reader were not rerun. The singular-label fix is development-only and excluded from static builds; type/lint and the live zero/one/many checks were rerun after it. Remaining launch actions are in `LAUNCH_CHECKLIST.md`.

## Earlier checkpoint — 2026-09-23 07:04 UTC

The current homepage keeps all seven animated scenes visible alongside the winner announcement. Fresh 320px browser checks exercised normal completion, replay, skip and reduced motion after the newer picker-first layout changes. Eight Ravensburger records were added and reviewed against rendered publisher pages.

The owner's newer instruction in **Reload localhost**, read directly from that task, authorizes Codex to conduct editorial review and approve exact revisions. Existing approved work was preserved. The catalog now has **69 reviewed entries**, with **66 portable criteria** in its separate random mix. The complete local research directory has **321 edition records**: **302 of 1,320 inventory identities** researched and **1,018 still pending**. Six original prompts remain drafts. The full-compendium objective is unfinished; remaining source work and editorial review are implementation work, not a request for the owner to read every rule.

| Check | Actual result |
|---|---|
| `npm run verify` | Final pass at 07:02 UTC: 70 Astro files with zero diagnostics; lint; 33 unit tests; content validation; build and artifact audits |
| Static build audit | 83 pages and 1,024 internal links; unique metadata, exact canonicals, structured data, sitemap, indexing, CSP and private-evidence exclusion passed |
| Size audit | Initial JavaScript 102,672 gzip bytes; optional Balloon 766 bytes; basic home 119,665 bytes |
| Coverage | 321 researched editions, 302 matched inventory identities and 1,018 pending; approved copies do not double-count research |
| Source checks | Eight cited PDFs retrieved, hash-recorded and inspected on relevant rendered pages. All eight source URLs returned HTTP 200 at 06:50 UTC; availability alone is not editorial review |
| Directory browser matrix | Final 15 checks passed in 42.3 seconds across Chromium, Firefox and WebKit: all 321 detail links, search, random-mix eligibility, inventory filtering, draft and approved-record live updates |
| Approved-route regression | Initially reproduced new catalog links returning 404. Local development now resolves approved records per request. Added/edited/deleted synthetic records return the correct content/status without restarting; private evidence stays out of HTML |
| Fresh content inspection | All eight reviewed answers, sources, official alternatives and clarifications checked in Chromium; all eight fit at 320px and exist in the static build. Random draw/skip and Labyrinth alias work. Zero page/console/HTTP errors; Horrified has zero axe violations |
| Current retained result views | All seven home methods retained the same scene through completion, kept the winner stable, supported replay/skip, and respected reduced motion. No horizontal overflow or runtime errors at 320px |
| Release matrix | Passed after restoring the disabled-Balloon notice: empty preview, empty production, populated synthetic production, disabled mode and invalid-domain rejection |
| `npm run test:dev-release` | Passed at 07:03 UTC: complete isolated release matrix plus fresh development-picker contexts before and after the builds |
| Disabled Balloon browser check | The actual disabled fixture shows the notice, hides Balloon, preselects Quick and produces a winner. 320px fits; zero axe violations and zero page/HTTP errors |
| Screenshots | Fifteen new captures opened and visually inspected: seven directory/article/coverage screens, seven current finished scenes and the disabled-Balloon fallback |

Evidence: `artifacts/compendium-ravensburger-final-browser/.last-run.json`, `artifacts/source-availability-ravensburger.json`, `artifacts/ravensburger-live-check.json`, `artifacts/retained-current-methods-live-check.json`, `artifacts/disabled-balloon-live-check.json`, and `artifacts/release-fixtures/latest.json`.

Screenshots under `artifacts/screenshots/`: `dev-ravensburger-alias-search.png`, `reviewed-alien-fate-mobile.png`, `reviewed-hocus-pocus-mobile.png`, `reviewed-chronicles-of-light-desktop.png`, `reviewed-star-wars-villainous-desktop.png`, `reviewed-horrified-mobile.png`, `dev-ravensburger-coverage.png`, `retained-current-{spinner,card-draw,balloon-rise,towers,shortest-match,dice-roll,marble-race}-320.png`, and `disabled-balloon-fallback-mobile.png`.

Failures were not counted as passes. The first reviewed-route matrix exposed cached paths; an initial hook comparison then missed Astro's project-relative component path, which the synthetic regression caught. Both were fixed before the final passing matrix. The first release run exposed a missing disabled-mode notice. A later retry hit actual disk exhaustion. The notice and its metadata were fixed; the full matrix and live fallback now pass. The one-off content inspection initially counted the coverage row's external discovery link as another edition; its selector was corrected to require the reviewed `/games/` link.

The drive filled twice. Only regeneratable source-page PNG copies and obsolete generated release-fixture files were removed, preserving original PDFs, evidence hashes, real project content and website screenshots. Cleanup manifests record 273,822,625 and 54,654,171 bytes removed respectively. Available space was approximately 788 MB at the final check. This is an environment constraint for further large downloads, not a source-verification shortcut.

Lighthouse, physical devices and a real screen reader were not rerun. The prior 24 cross-browser retained-scene checks remain historical evidence; this pass added the current seven-method live inspection. Nothing was publicly deployed or configured in external accounts. Remaining launch actions are listed in `LAUNCH_CHECKLIST.md`.

## Earlier checkpoint — 2026-09-23 06:32 UTC

The requested finished spinner, balloons, cards and other animated views remain implemented and verified. This content pass preserved that frontend work. Fifteen additional rule drafts were added after inspecting rendered primary-source pages: seven Repos, seven Pandasaurus, and Gutenberg from Portal's distribution manual.

The directory has **313 researched rule drafts**, six original prompt drafts and **zero approvals**. Coverage is **294 of 1,320 inventory identities**, with **1,026 pending**. The complete-compendium objective remains unfinished; neither discovery identities nor retrieved files count as completed rules. Details and held leads are in `research/coverage/repos-pandasaurus-portal-progress.md`.

| Check | Actual result |
|---|---|
| `npm run verify` | Passed at 06:26 UTC: 67 Astro files with zero diagnostics; lint; 30 unit tests; all 313 draft records validated; production build and audits |
| Static build audit | 14 pages and 130 internal links; metadata, canonicals, sitemap, indexing, CSP, private-content exclusion and size audits passed |
| Size audit | Initial JavaScript 102,672 gzip bytes; optional Balloon 766 bytes; basic home 116,053 bytes |
| Coverage | `npm run content:coverage` passed: 294 researched inventory identities and 1,026 pending; 313 edition records overall |
| Source retrieval | All fifteen new manuals retrieved completely, parsed, hash-recorded and inspected on cited rendered pages. The older Neuroshima Hex! lead returned 404 and remains uncounted |
| Source-link availability | All fifteen cited URLs returned HTTP 200 at 06:26 UTC. Availability is separate from source inspection and publication approval |
| Python regression checks | Four offline retrieval tests passed: partial reads, missing Content-Length, incomplete responses and byte-limit enforcement |
| Affected browser checks | Nine passed in 3.4 minutes across Chromium, Firefox and WebKit: all 313 draft detail URLs, source-page structure, search, full random pool and inventory filtering |
| Fresh live inspection | Chromium checked every new answer, clarification, source link and official alternative. All fifteen IDs are in the 313-rule random pool. Draw/skip respond and Rampage finds Terror in Meeple City |
| Mobile and accessibility | All fifteen new detail pages fit at 320px. Gutenberg returned zero axe violations against WCAG 2 A/AA and 2.2 AA tags. The browser matrix's representative article also passed its axe assertion |
| Runtime errors | No page, console or HTTP errors in the fresh live inspection |
| Screenshots | Seven new screenshots captured, opened and visually inspected. Previously verified spinner and balloon completion screenshots were also reopened |

Evidence: `artifacts/compendium-repos-pandasaurus-portal-browser/.last-run.json`, `artifacts/source-availability-repos-pandasaurus-portal.json`, and `artifacts/repos-pandasaurus-portal-live-check.json`.

New screenshots under `artifacts/screenshots/`: `dev-repos-alias-search.png`, `dev-stupefy-desktop.png`, `dev-city-of-horror-mobile.png`, `dev-unrest-mobile.png`, `dev-fox-experiment-desktop.png`, `dev-gutenberg-mobile.png`, and `dev-repos-pandasaurus-portal-coverage.png`.

The retained-view checks were not repeated for this content-only pass: their preceding 24 passing Chromium/Firefox/WebKit checks and seven-method fresh home inspection remain recorded below and in `artifacts/retained-all-methods-live-check.json`. Full release matrices, Lighthouse, physical devices and a real screen reader were not rerun. No content approval, public deployment, external service configuration or account change occurred.


## Earlier retained-view checkpoint — 2026-09-23 06:06 UTC

The requested retained result views are implemented locally. Spinner, Card Draw, Balloon Rise, Towers, Shortest Match, Dice Roll and Marble Race keep the same scene mounted when the winner is announced. A new pick replaces it, skipping settles it, and editing players restores the inputs. Reduced motion continues to show the result immediately without a decorative scene. Existing frontend work was preserved.

Nine Days of Wonder edition records were added after inspecting their rendered source pages. The local directory now has **298 researched rule drafts**, six original prompt drafts and **zero approvals**. Coverage is **279 of 1,320 inventory identities**, with **1,041 still pending**. The full-compendium objective is unfinished. See `research/coverage/days-of-wonder-progress.md` for the two Ticket to Ride: Europe editions, Warcraft team order, official alternatives and source limitations.

| Check | Actual result |
|---|---|
| `npm run verify` | Passed at 05:55 UTC: 67 Astro files, zero diagnostics; lint; 30 unit tests; content validation; build and artifact audits. This preceded the nine content additions |
| Final content/build check | `npm run build` passed at 06:00 UTC with all 298 drafts. All approvals remain null. `npm run lint` passed again after the search-test update |
| Build audit | 14 static pages, 131 internal links; metadata, sitemap, indexing, CSP, private-content exclusion and size audits passed. Initial JavaScript 102,672 gzip bytes; optional Balloon 766 bytes; basic home 115,637 bytes |
| Retained-view browser checks | 24 passed in 3.7 minutes across Chromium, Firefox and WebKit. All seven methods retain their scene through completion, support skip/replay and restore editing. The additional method test checks twelve players, 320px layout, reduced motion and axe |
| Directory and live-picker browser checks | 12 passed in 3.8 minutes across the same three engines. All 298 draft detail URLs, search, full random-rule pool, inventory filtering, all nine picker methods, name persistence and original house-rule skip |
| Search regression adjustment | `TTR` now matches the original game plus two Europe editions. The existing test now checks all three and opens the refreshed edition explicitly, including its actual starting instruction |
| Source availability | All ten distinct cited URLs returned HTTP 200 at 06:01 UTC. Availability is separate from editorial inspection and approval |
| Fresh directory inspection | Chromium verified all nine new answers, their source links and clarifications, two Europe search results, random draw/skip, both Europe coverage links, and 279 researched/1,041 pending counts. All nine articles fit at 320px; no page, console or HTTP errors |
| Accessibility | Zero axe violations on the Warcraft article against WCAG 2 A/AA and 2.2 AA tags; representative directory and new-method checks also passed their axe assertions |
| Fresh home inspection | Chromium checked all seven animated methods on the live home page at 320px. The same DOM scene remains after normal completion; the winner text stays stable; replay creates a new scene; skip settles it; reduced motion gives immediate results. No horizontal overflow, page errors or console errors |
| Screenshots | Six directory/article/coverage captures and seven finished home scenes captured, opened and visually inspected |

Evidence: `artifacts/retained-all-methods-browser/.last-run.json`, `artifacts/compendium-days-of-wonder-browser/.last-run.json`, `artifacts/source-availability-days-of-wonder.json`, `artifacts/days-of-wonder-live-check.json`, and `artifacts/retained-all-methods-live-check.json`.

Screenshots are under `artifacts/screenshots/`: `retained-all-{spinner,card-draw,balloon-rise,towers,shortest-match,dice-roll,marble-race}-320.png`, `dev-days-of-wonder-edition-search.png`, `dev-europe-refreshed-desktop.png`, `dev-europe-15th-desktop.png`, `dev-cleopatra-mobile.png`, `dev-warcraft-mobile.png`, and `dev-days-of-wonder-coverage.png`.

The full release matrices, Lighthouse, physical devices and a real screen reader were not rerun in this pass. Earlier evidence retains its original scope. Seven Repos publisher PDFs are cached for further review; retrieval has not been counted as researched rules. Nothing was publicly approved or deployed.

## Earlier implementation context

The application was implemented and exercised locally on Windows. There has been no public deployment, external account configuration, real human content approval, analytics activation, or ad integration. Both supplied briefs were read completely before implementation. No pre-existing project code was present.

## Earlier compendium checkpoint — 2026-09-23 05:45 UTC

The local directory contains **289 researched rule records**, six original prompt drafts and zero human approvals. This pass added nine records from Renegade/its creators, Wizards of the Coast and Z-Man. Coverage is **271 of 1,320 discovery identities**, with **1,049 still pending**. The complete-compendium objective remains unfinished. See `research/coverage/renegade-zman-progress.md` for edition distinctions and held sources.

All nine starting passages and cited mode context were inspected on rendered primary-source pages. The records distinguish initial criteria from later-round rules, official alternatives from house fallbacks, and solo hero order from multiplayer starts. The shared clarification heading was changed from “Before the first turn” to “Rule details” because some paragraphs describe later rounds or solo play.

| Check | Actual result |
|---|---|
| `npm run verify` | Passed at 05:32 UTC after the heading change: 67 Astro files with zero diagnostics, lint, 30 unit tests, content validation, build and artifact audits |
| Content and coverage | 289 rule drafts, six prompt drafts, zero approvals; 271 researched inventory identities and 1,049 pending |
| Build audit | 14 static pages, 131 internal links; private-content exclusion, metadata, indexing, CSP and size checks passed |
| Affected browser checks | Nine passed in 4.7 minutes across Chromium, Firefox and WebKit using a separate output folder: all 289 draft detail URLs, search, full random-draw eligibility and coverage filtering |
| Source availability | All nine cited URLs returned HTTP 200 at 05:28 UTC; `artifacts/source-availability-renegade-zman.json`. Availability is not editorial approval |
| Fresh directory inspection | Chromium checked an Instant pick, all 289 directory entries, random draw and skip, all nine new answers and selected edition/fallback/solo distinctions. No page, console or HTTP errors; checked articles fit at 320px |
| Accessibility | Jabba's Palace article: zero axe violations against WCAG 2 A/AA and 2.2 AA tags. The affected browser tests also check their representative article |
| Retained picker scenes | Existing workspace implementation preserved. Fresh Chromium checked Spinner, Card Draw, Balloon Rise and Towers on the live home page: the same scene survives completion beside the winner, replay replaces it, skip settles it, and reduced motion gives an immediate result. All four fit horizontally at 320px; no page or console errors |
| Screenshots | Eight directory/article/coverage captures inspected; five affected article captures reopened after the heading change. Four additional retained-scene captures opened and inspected |

The first post-heading browser rerun collided with another run's shared `test-results` trace files (ENOENT) and had two WebKit timeouts while both runs were active. The successful rerun used `--output=artifacts/compendium-renegade-zman-browser --reporter=list`; assertions were not weakened. The separate live checks also corrected two inspection assumptions: Waterdeep uses “to the left,” and a short numeric inventory search can match several IDs. The scene check was paced past the intentional rapid-repeat guard before moving between methods.

Evidence: `artifacts/renegade-zman-live-check.json`, `artifacts/retained-scenes-live-check.json`, and `artifacts/compendium-renegade-zman-browser/.last-run.json`. Screenshots are under `artifacts/screenshots/`: `dev-renegade-zman-directory.png`, `dev-jabbas-palace-desktop.png`, `dev-bargain-quest-desktop.png`, `dev-junk-orbit-mobile.png`, `dev-amazonas-mobile.png`, `dev-rapid-response-mobile.png`, `dev-wrath-lich-king-mobile.png`, `dev-renegade-zman-coverage.png`, and `retained-{spinner,card-draw,balloon-rise,towers}-320.png`.

The checked build includes the existing nine-method picker work: initial JavaScript is 102,672 gzip bytes, optional Balloon 766 bytes and basic home 115,637 bytes. This pass did not rerun the full picker/release matrices or Lighthouse. Their historical results retain their original scope. Seven further Days of Wonder PDFs are cached for continued research, with no drafts or approvals inferred from retrieval. Nothing was publicly approved or deployed.

## Earlier compendium checkpoint — 2026-09-23 04:59 UTC

The local directory has **280 researched rule records**, six original prompt drafts and zero human approvals. This pass added 24 records: seven from Looney Labs and seventeen from Pegasus-hosted publisher/distributor manuals. Coverage is **262 of 1,320 discovery identities**, with **1,058 still pending**. Sixteen researched games are outside the inventory; Spin Circus and Valley of the Kings each have two edition records. The complete-compendium objective remains unfinished.

All 24 opening passages were inspected on rendered source pages. The records preserve character difficulty, official alternatives, edition languages, solo play and setup roles. Source-link review corrected Memo Mission from an initially selected German source to the available English manual; the publisher's labels were correct. A live assertion found that Everdell's translation explanation was only in internal review notes; it is now visible under Our interpretation, and the live check was rerun successfully. See `research/coverage/looney-pegasus-progress.md`.

| Check | Actual result |
|---|---|
| `npm run verify` | Rerun after the final wording change and passed at 04:58 UTC: 64 Astro files with zero diagnostics, lint, 27 unit tests, content validation, production build and artifact audits |
| Content validation | 280 rule drafts, six prompt drafts, zero approvals |
| `npm run content:coverage` | 262 researched inventory identities; 1,058 pending |
| Build audit | 11 static pages, 98 internal links; private-content exclusion, metadata, indexing, CSP and size checks passed |
| Source retrieval regression checks | Four offline Python unittest cases passed: partial reads, missing Content-Length, incomplete responses and the size limit. No network used by these fixtures |
| Affected browser checks | Nine passed in 2.1 minutes across Chromium, Firefox and WebKit: all 280 draft detail URLs, search, full random-draw eligibility and coverage filtering |
| Source availability | All 24 final cited URLs returned HTTP 200 at 04:56 UTC; `artifacts/source-availability-looney-pegasus.json`. This checks availability, not editorial approval |
| Fresh live browser inspection | Chromium checked an Instant pick, all 280 directory entries, random-rule draw and skip, source links and selected edition/fallback/solo distinctions. Coverage was 262/1,058, with Munchkins & Mazes still pending. No page, console or HTTP errors; checked mobile articles fit at 320px |
| Accessibility | Memo Mission detail page: zero axe violations against WCAG 2 A/AA and 2.2 AA tags. The affected browser tests also check their representative article |
| Screenshots | Eight captured and all eight opened; no clipping observed. Assertions and timestamps are in `artifacts/looney-pegasus-live-check.json` |

Current screenshots under `artifacts/screenshots/`: `dev-looney-pegasus-directory.png`, `dev-chrono-trek-desktop.png`, `dev-memo-mission-desktop.png`, `dev-revive-mobile.png`, `dev-nanofictionary-mobile.png`, `dev-first-rat-mobile.png`, `dev-everdell-mobile.png`, and `dev-looney-pegasus-coverage.png`.

The PDF cache now reads until EOF within its configured bound and rejects mismatched response lengths before saving. This recovered two initially incomplete Looney Labs downloads. Run its focused tests with the Python runtime containing pypdf: `python -m unittest discover -s tests/research -v`.

Full picker/release matrices and Lighthouse were not rerun for this content batch; historical results retain their original scope. Initial JavaScript remains 101,199 gzip bytes, optional Balloon 681 bytes and basic home 112,726 bytes. No picker presentation behavior changed. Keeping the finished spinner, balloons, cards and towers visible remains queued after compendium work. Nothing was publicly approved or deployed.

## Earlier compendium checkpoint — 2026-09-23 04:31 UTC

The local directory has **256 researched rule records**, six original prompt drafts and zero human approvals. This session added twenty records: eight from dV Giochi, five from Hutter Trade's publisher/distributor downloads and seven from ABACUSSPIELE. Coverage is **238 of 1,320 discovery identities**, with **1,082 still pending**. Sixteen researched games are outside the inventory; Spin Circus and Valley of the Kings each have two edition records. The complete-compendium objective remains unfinished.

All twenty starting passages were inspected on rendered source pages. The latest seven retain STOP's rules-reader/dealer and interruption instructions, the separate Plus edition of Mamma Mia!, 7Seas' printed versus PDF page positions, and Leo's longest-hair starter versus shortest-hair clock keeper. Tajuto is explicitly an English summary of German rules. See `research/coverage/dv-hutter-progress.md` and `research/coverage/abacus-progress.md`.

| Check | Actual result |
|---|---|
| `npm run verify` | Rerun after the final additions and passed at 04:29 UTC: 64 Astro files with zero diagnostics, lint, 27 unit tests, content validation, production build and artifact audits |
| Content validation | 256 rule drafts, six prompt drafts, zero approvals |
| `npm run content:coverage` | 238 researched inventory identities; 1,082 pending |
| Build audit | 11 static pages, 98 internal links; private-content exclusion, metadata, indexing, CSP and size checks passed |
| Affected browser checks | Rerun after the final additions: nine passed in 1.7 minutes across Chromium, Firefox and WebKit, covering all 256 detail URLs, search, full random-draw eligibility and inventory filtering |
| Source availability | All 20 newly cited URLs returned HTTP 200 to bounded HEAD requests at 04:29 UTC; `artifacts/source-availability-dv-hutter-abacus.json`. Availability is not editorial approval |
| Fresh live browser inspection | Chromium verified an Instant pick, all 256 directory entries, random-rule draw and skip, the earlier batch's role/edition distinctions, all seven ABACUSSPIELE answers, and 238/1,082 coverage. Terra remains pending. No page, console or HTTP errors; checked articles fit at 320px without horizontal overflow |
| Accessibility | Minute Realms detail page: zero axe violations against WCAG 2 A/AA and 2.2 AA tags. The affected browser tests also check their representative article |
| Screenshots | Ten captured and opened; no clipping observed. Assertions and timestamps are in `artifacts/dv-hutter-abacus-live-check.json` |

Current screenshots under `artifacts/screenshots/`: `dev-game-directory-overview.png`, `dev-minute-realms-desktop.png`, `dev-say-anything-desktop.png`, `dev-wonder-book-mobile.png`, `dev-spyfall-mobile.png`, `dev-saltfjord-mobile.png`, `dev-leo-mobile.png`, `dev-stop-mobile.png`, `dev-mamma-mia-plus-desktop.png`, and `dev-coverage-desktop.png`.

Full picker/release matrices and Lighthouse were not rerun for this content batch; historical results retain their original scope. Initial JavaScript remains 101,199 gzip bytes, optional Balloon 681 bytes and basic home 112,726 bytes. No picker presentation behavior changed. Keeping the finished spinner, balloons, cards and towers visible remains queued after compendium work. Nothing was publicly approved or deployed.

## Earlier compendium checkpoint — 2026-09-23 04:20 UTC

The local directory has **249 researched rule records**, six original prompt drafts and zero human approvals. Thirteen records were added from dV Giochi and Hutter Trade's publisher/distributor downloads. Coverage is **231 of 1,320 discovery identities**, with **1,089 still pending**. Sixteen researched games are outside the inventory; Spin Circus and Valley of the Kings each have two edition records. The complete-compendium objective remains unfinished.

All thirteen starting passages were inspected on rendered source pages, including image-only manuals. Records preserve opening judge, reader and dealer roles, official alternatives, source languages and relevant advanced/solo context. Terra remains pending because the inspected Italian and German files do not prescribe the initial person. See `research/coverage/dv-hutter-progress.md`.

| Check | Actual result |
|---|---|
| `npm run verify` | Passed at 04:18 UTC: 64 Astro files with zero diagnostics, lint, 27 unit tests, content validation, production build and artifact audits |
| Content validation | 249 rule drafts, six prompt drafts, zero approvals |
| `npm run content:coverage` | 231 researched inventory identities; 1,089 pending |
| Build audit | 11 static pages, 98 internal links; private-content exclusion, metadata, indexing, CSP and size checks passed |
| Affected browser checks | Nine passed in 1.7 minutes across Chromium, Firefox and WebKit: all 249 detail URLs, search, full random-draw eligibility and inventory filtering |
| Source availability | All 13 newly cited URLs returned HTTP 200 to bounded HEAD requests at 04:18 UTC; `artifacts/source-availability-dv-hutter.json`. This is availability, not editorial approval |
| Fresh live browser inspection | Chromium verified an Instant pick, directory navigation, random-rule draw and skip, Minute Realms' official fallback, Say Anything's judge, For Sale's edition, Wonder Book's reader/turn order, Spyfall's dealer uncertainty, Saltfjord's variants and Terra's pending coverage. No page, console or HTTP errors; checked mobile articles had no horizontal overflow at 320px |
| Accessibility | Minute Realms detail page: zero axe violations against WCAG 2 A/AA and 2.2 AA tags. The affected browser tests also check their representative article |
| Screenshots | Seven captured and opened; no clipping observed. Assertions and timestamps are in `artifacts/dv-hutter-live-check.json` |

Current screenshots under `artifacts/screenshots/`: `dev-game-directory-overview.png`, `dev-minute-realms-desktop.png`, `dev-say-anything-desktop.png`, `dev-wonder-book-mobile.png`, `dev-spyfall-mobile.png`, `dev-saltfjord-mobile.png`, and `dev-coverage-desktop.png`.

Full picker/release matrices and Lighthouse were not rerun for this content batch; historical results retain their original scope. Initial JavaScript remains 101,199 gzip bytes, optional Balloon 681 bytes and basic home 112,726 bytes. No picker presentation behavior changed. Keeping the finished spinner, balloons, cards and towers visible remains queued after compendium work. Nothing was publicly approved or deployed.

## Earlier compendium checkpoint — 2026-09-23 03:56 UTC

The local directory has **236 researched rule records**, six original prompt drafts and zero human approvals. Fifteen records were added from Fantasy Flight Games, Queen Games and Schmidt Spiele. Coverage is **218 of 1,320 discovery identities**, with **1,102 still pending**. Sixteen researched games are outside the inventory; Spin Circus and Valley of the Kings each have two edition records. The complete-compendium objective remains unfinished.

All fifteen starting passages were inspected on rendered publisher pages. Black Gold retains its official random alternative; Quacks distinguishes the round starter from simultaneous ingredient draws. German Schmidt manuals are labeled as English summaries. Vienna is identified as Stefan Feld City Collection 5 and mapped only to inventory identity 368974; the older game 171492 remains pending. See `research/coverage/ffg-queen-schmidt-progress.md`.

| Check | Actual result |
|---|---|
| `npm run verify` | Passed: 64 Astro files with zero diagnostics, lint, 27 unit tests, content validation, production build and artifact audits |
| Content validation | 236 rule drafts, six prompt drafts, zero approvals; rerun after the final wording correction |
| `npm run content:coverage` | 218 researched inventory identities; 1,102 pending |
| Build audit | 11 static pages, 98 internal links; private-content exclusion, metadata, indexing, CSP and size checks passed |
| Affected browser checks | Nine passed in 35.1 seconds across Chromium, Firefox and WebKit: all 236 detail URLs, search, full random-draw eligibility and inventory filtering |
| Source availability | All 15 newly cited URLs returned HTTP 200 to bounded HEAD requests at 03:53 UTC; `artifacts/source-availability-ffg-queen-schmidt.json`. This is availability, not editorial approval |
| Fresh live browser inspection | Chromium verified an Instant pick, directory navigation, random-rule draw and skip, the two separate Quacks games, simultaneous brewing, Black Gold's official alternative, Vienna's setup and identity mapping, and Tempel's fallback. No page, console or HTTP errors; no horizontal overflow at 320px |
| Accessibility | Black Gold detail page: zero axe violations against WCAG 2 A/AA and 2.2 AA tags. The affected browser tests also check their representative article |
| Screenshots | Seven captured and opened. A forward reference in Tempel's clarification was made self-contained, then the live checks and captures were rerun. The updated mobile screenshot was reopened; no clipping observed |

Current screenshots under `artifacts/screenshots/`: `dev-game-directory-overview.png`, `dev-quacks-games.png`, `dev-quacks-desktop.png`, `dev-black-gold-desktop.png`, `dev-vienna-mobile.png`, `dev-tempel-mobile.png`, and `dev-coverage-desktop.png`. Capture assertions and timestamps are in `artifacts/ffg-queen-schmidt-live-check.json`.

Full picker/release matrices and Lighthouse were not rerun for this content batch; historical results retain their original scope. Initial JavaScript remains 101,199 gzip bytes, optional Balloon 681 bytes and basic home 112,726 bytes. The final correction changed only private draft copy and did not affect production output. No picker presentation behavior changed. Keeping the finished spinner, balloons, cards and towers visible remains queued after compendium work. Nothing was publicly approved or deployed.

## Earlier compendium checkpoint — 2026-09-23 03:35 UTC

The local directory has **221 researched rule records**, six original prompt drafts and zero human approvals. Seventeen records were added from Gigamic, Sorry We Are French, Funnyfox and HABA. Coverage is **203 of 1,320 discovery identities**, with **1,117 still pending**. Sixteen researched games are outside the inventory; Spin Circus and Valley of the Kings each have two edition records. The complete-compendium objective remains unfinished.

All new starting passages were inspected on rendered publisher pages. IKI preserves the two-player Sun/Moon override and distinguishes the first position choice from action order. Akropolis cites its solo supplement separately. Animal Upon Animal uses the 29-animal base manual; a misleading hub link to the 13-animal mini game was excluded. Hiroba is clearly labeled as an English summary of French rules. See `research/coverage/gigamic-haba-progress.md`.

| Check | Actual result |
|---|---|
| `npm run verify` | Passed: 64 Astro files with zero diagnostics, lint, 27 unit tests, content validation, production build and artifact audits |
| Content validation | 221 rule drafts, six prompt drafts, zero approvals |
| `npm run content:coverage` | 203 researched inventory identities; 1,117 pending |
| Build audit | 11 static pages, 98 internal links; private-content exclusion, metadata, indexing, CSP and size checks passed |
| Affected browser checks | Nine passed in 35.0 seconds across Chromium, Firefox and WebKit: all 221 detail URLs, search, full random-draw eligibility and inventory filtering |
| Source availability | All 18 newly cited URLs returned HTTP 200 to bounded HEAD requests at 03:33 UTC; `artifacts/source-availability-gigamic-haba.json`. This is availability, not editorial approval |
| Fresh live browser inspection | Chromium verified an Instant pick, directory navigation, random-rule draw and skip, separate base/Christmas Animal Upon Animal answers, Akropolis solo source, First Orchard fallback, IKI variants and Hiroba language labeling. No page, console or HTTP errors; no horizontal overflow at 320px |
| Accessibility | Akropolis detail page: zero axe violations against WCAG 2 A/AA and 2.2 AA tags. Existing affected tests also run their article accessibility check |
| Screenshots | Seven captured and opened; readable content with no clipping observed. Assertions and timestamp are in `artifacts/gigamic-haba-live-check.json` |

Current screenshots under `artifacts/screenshots/`: `dev-game-directory-overview.png`, `dev-animal-upon-animal-editions.png`, `dev-akropolis-desktop.png`, `dev-first-orchard-desktop.png`, `dev-iki-mobile.png`, `dev-hiroba-mobile.png`, and `dev-coverage-desktop.png`.

Full picker/release matrices and Lighthouse were not rerun for this content batch; historical results retain their original scope. Initial JavaScript remains 101,199 gzip bytes, optional Balloon 681 bytes and basic home 112,726 bytes. No picker presentation behavior changed. Keeping the finished spinner, balloons, cards and towers visible remains queued after compendium work. Nothing was publicly approved or deployed.

## Earlier compendium checkpoint — 2026-09-23 03:12 UTC

The local directory has **204 researched rule records**, six original prompt drafts and zero human approvals. Twenty records were added from Czech Games Edition, R&R Games, Board&Dice and Ludonova. Coverage is **186 of 1,320 discovery identities**, with **1,134 still pending**. Sixteen researched games are outside the inventory; Spin Circus and Valley of the Kings each have two edition records. The complete-compendium objective remains unfinished.

All new starting instructions were inspected on rendered publisher pages. The records preserve planning versus action order, simultaneous roles, multiplayer variants, solo setup, official alternatives and actual PDF/printed page numbers. Original Trismegistus and its revised New Edition have different instructions and separate entries. A coverage override keeps the revised game from satisfying the original inventory identity. See `research/coverage/cge-rnr-board-dice-ludonova-progress.md`.

The first verification attempt mistakenly included downloaded publisher JavaScript from the ignored source cache, producing diagnostics and 1,054 lint errors. TypeScript and ESLint now exclude only `research/source-files/`; application code, research scripts and tests remain checked. The full verification was rerun successfully. An initial ad hoc accessibility capture also used Playwright's implicit context, which axe rejected; it was rerun using an explicit browser context and completed successfully.

| Check after the fixes | Actual result |
|---|---|
| `npm run verify` | Passed: 64 Astro files with zero diagnostics, lint, all 27 unit tests, content validation, production build and artifact audits |
| Content validation | 204 rule drafts, six prompt drafts, zero approvals; all 20 additions separately checked for null approval fields |
| `npm run content:coverage` | 186 researched inventory identities; 1,134 pending |
| Build audit | 11 static pages, 98 internal links; private-content exclusion, metadata, indexing, CSP and size checks passed |
| Affected browser checks | Nine passed in 34.3 seconds across Chromium, Firefox and WebKit: all 204 detail URLs, search, full random-draw eligibility and inventory filtering |
| Source availability | All 20 cited URLs returned HTTP 200 to bounded HEAD requests at 03:07 UTC; `artifacts/source-availability-cge-rnr-board-dice-ludonova.json`. Availability is not editorial approval |
| Fresh live browser inspection | Chromium verified an Instant pick, directory navigation, random rule/skip, both Trismegistus records, Dungeon Petz priority, Ceylon's variant, Last Will's two-player rule and Watson & Holmes' recorded-introduction alternative. No page, console or HTTP errors; no horizontal overflow at 320px |
| Accessibility | Ceylon's rendered page had zero axe violations for the requested WCAG 2 A/AA and 2.2 AA tags |
| Screenshots | Seven captured and opened, with readable content and no clipping observed. Capture assertions and timestamp are in `artifacts/cge-rnr-board-dice-ludonova-live-check.json` |
| Research helper | Syntax parsing and rejection of both invalid size bounds passed; actual larger publisher PDFs were retrieved within an explicit 100 MB limit |

Current screenshots under `artifacts/screenshots/`: `dev-game-directory-overview.png`, `dev-trismegistus-editions.png`, `dev-dungeon-petz-desktop.png`, `dev-ceylon-desktop.png`, `dev-last-will-mobile.png`, `dev-watson-holmes-mobile.png`, and `dev-coverage-desktop.png`.

Full picker/release matrices and Lighthouse were not rerun for this content batch; historical results retain their original scope. Initial JavaScript remains 101,199 gzip bytes, optional Balloon 681 bytes and basic home 112,726 bytes. No picker presentation behavior changed. Keeping the finished spinner, balloons, cards and towers visible remains queued after compendium work. Nothing was publicly approved or deployed.

## Earlier compendium checkpoint — 2026-09-23 02:38 UTC

The local directory has **184 researched rule records**, six original prompt drafts and zero human approvals. Eight entries were added from AMIGO and Brain Games: 3 Chapters, Abluxxen, Armadillo, No Thanks!, Snack Rabbits, Tulpenfieber, ICECOOL and TEAM3 Green. Coverage is **167 of 1,320 discovery identities**, with **1,153 still pending**. Fifteen researched games are outside the inventory; Spin Circus and Valley of the Kings each have two edition records. The complete-compendium objective remains unfinished.

All new starting instructions were inspected on rendered publisher pages. ICECOOL's English source replaces a temporary German-only draft, with the German manual retained as corroboration, so matching instructions are represented once. The answer distinguishes the first catcher from the first player to flick. 3 Chapters keeps its two-player instruction separate from its three-to-six-player criterion; TEAM3 separates role assignment from simultaneous team play. Evidence and pending IELLO downloads are documented in `research/coverage/amigo-brain-games-progress.md`.

| Check | Actual result |
|---|---|
| `npm run verify` | Passed: 64 Astro files with zero diagnostics, lint, all 27 unit tests, content validation, production build and artifact audits |
| Content validation | 184 rule drafts, six prompt drafts, zero approvals |
| `npm run content:coverage` | 167 researched inventory identities; 1,153 pending |
| Build audit | 11 static pages, 98 internal links; private-content exclusion, metadata, indexing, CSP and size checks passed |
| Affected browser checks | Nine passed in 33.9 seconds across Chromium, Firefox and WebKit: all 184 detail URLs, search, full random-draw eligibility and inventory filtering |
| Source availability | All nine cited URLs returned HTTP 200 to bounded HEAD requests at 02:35 UTC; `artifacts/source-availability-amigo-brain.json`. Availability is not editorial approval |
| Fresh live browser inspection | Chromium verified an Instant pick, directory navigation, random rule, Linko alias, ICECOOL's two sources and 3 Chapters/TEAM3 variant text. No page, console or HTTP errors; no horizontal overflow at 320px |
| Screenshots | Five captured and opened, with readable content and no clipping observed. Capture assertions and timestamp are in `artifacts/amigo-brain-live-check.json` |

Current screenshots under `artifacts/screenshots/`: `dev-game-directory-overview.png`, `dev-icecool-desktop.png`, `dev-three-chapters-mobile.png`, `dev-team3-mobile.png`, and `dev-coverage-desktop.png`.

Full picker/release matrices and Lighthouse were not rerun for this content batch; historical results retain their original scope. Initial JavaScript remains 101,199 gzip bytes, optional Balloon 681 bytes and basic home 112,726 bytes. No picker presentation behavior changed. Keeping the finished spinner, balloons, cards and towers visible remains queued after compendium work. Nothing was publicly approved or deployed.

## Earlier compendium checkpoint — 2026-09-23 02:17 UTC

The local directory has **176 researched rule records**, six original prompt drafts and zero human approvals. Sixteen answers were added from Allplay and publisher partners. Corrected coverage is **159 of 1,320 discovery identities**, with **1,161 still pending**. Fifteen researched games are outside the inventory; Spin Circus and Valley of the Kings each have two edition records. The full-compendium objective remains unfinished.

All 16 new starting instructions were read on rendered source pages. Roll Camera!'s direct publisher download is byte-identical to the inspected Allplay-hosted PDF. Provenance, the pending Bacon draft manual and the unavailable Power Vacuum download are documented in `research/coverage/allplay-partners-progress.md`.

The batch exposed another identity collision: Gamewright's Big Top recognition game had been counted as the inventory's Allplay circus auction game. An explicit identity override now separates them. The Allplay title received its own sourced answer; both games remain searchable. Unit and browser regressions cover the correction. Earlier coverage checkpoints included that false match.

| Check | Actual result |
|---|---|
| `npm run verify` | Passed: 64 Astro files with zero diagnostics, lint, 27 unit tests, content validation, production build and artifact audits |
| Content validation | 176 rule drafts, six prompt drafts, zero approvals |
| `npm run content:coverage` | 159 researched inventory identities; 1,161 pending |
| Build audit | 11 static pages, 98 internal links; private-content exclusion, metadata, indexing, CSP and size checks passed |
| Affected browser checks | Nine passed in 38.8 seconds across Chromium, Firefox and WebKit: all 176 detail URLs, search, full random-draw eligibility and coverage filtering, including Big Top separation |
| New source availability | All 16 cited URLs returned HTTP 200 to bounded HEAD requests at 02:16 UTC; `artifacts/source-availability-allplay-partners.json`. This is availability, not editorial approval |
| Fresh live browser inspection | Chromium exercised an Instant pick, navigation, random rule, two Big Top results, Burano's conditional fallback, Roll Camera!'s primary-source link and a simultaneous-play answer at 320px. No page, console or HTTP errors or horizontal overflow |
| Screenshots | Six captured and opened; readable content with no clipping observed. Capture assertions and timestamp are in `artifacts/allplay-partners-live-check.json` |

Current screenshots under `artifacts/screenshots/`: `dev-game-directory-overview.png`, `dev-big-top-distinct-games.png`, `dev-burano-desktop.png`, `dev-roll-camera-desktop.png`, `dev-roll-to-top-mobile.png` and `dev-coverage-desktop.png`.

Full picker/release matrices and Lighthouse were not rerun for this content batch; the historical results below retain their original scope. Initial JavaScript remains 101,199 gzip bytes, optional Balloon 681 bytes and basic home 112,726 bytes. No presentation behavior changed: retaining the finished spinner, balloons, cards and towers remains queued after compendium work. Nothing was publicly approved or deployed.

## Earlier compendium checkpoint — 2026-09-23 01:59 UTC

The directory has **160 researched rule records**, six original prompt drafts and zero human approvals. This batch added eight Thames & Kosmos entries, twenty AEG edition entries and one Allplay entry. Corrected coverage is **144 of 1,320 inventory identities**, with **1,176 still pending**. Fourteen researched games are outside the inventory; Spin Circus and Valley of the Kings each have two edition records. The full-compendium objective remains unfinished.

All 29 new starting instructions were inspected on rendered publisher PDF pages. Official fallbacks, edition differences, drafting/setup roles and simultaneous play remain explicit. Primary evidence is recorded in each draft; batch notes are in `research/coverage/thames-kosmos-progress.md` and `aeg-allplay-progress.md`.

Two defects were fixed during this work. Name normalization had falsely treated Gamewright's Chomp! as the inventory's unrelated Allplay dinosaur Chomp. Validated identity overrides now keep them separate, with unit and browser regression coverage; the Allplay game also has its own newly researched answer. Screenshot inspection then revealed that the article's “If there's a tie” heading mischaracterized official fallbacks for nobody qualifying. Records with a supplied official fallback now use “Official tie-break or fallback.”

| Check after the final fixes | Actual result |
|---|---|
| `npm run verify` | Passed: 64 Astro files with zero diagnostics, lint, all 27 unit tests, content validation, build and artifact audits |
| Content validation | 160 rule drafts, six prompt drafts, zero approvals |
| `npm run content:coverage` | 144 researched inventory identities; 1,176 pending |
| Build and SEO audits | 11 static pages, 98 internal links, private-content exclusion, canonicals, indexing, headers and size checks passed |
| Affected browser rerun | Nine passed in 28.5 seconds across Chromium, Firefox and WebKit: all 160 detail URLs, search, full random-draw eligibility, coverage filtering, Chomp identity separation and official-fallback heading |
| New source availability | All 29 unique new cited URLs returned HTTP 200 to HEAD requests at 01:53 UTC; `artifacts/source-availability-thames-aeg-allplay.json`. Availability is not editorial approval |
| Live browser inspection | Fresh Chromium exercised the Instant picker, directory navigation, random rule, separate Chomp games, separate Valley editions, Targi fallback and a long rule at 320px. No page, console or HTTP errors; no horizontal overflow |
| Screenshots | Six captured and opened. Three affected captures were refreshed and reopened after the heading/coverage wording fix; no clipping observed |
| Python research helpers | Cache-queue and draft-preparer scripts passed syntax parsing |

The earlier nine browser checks passed in 36.4 seconds before the heading correction; the final rerun above supersedes that result. Full picker/release matrices and Lighthouse were not rerun for this batch; their historical results remain below. Conservative gzip budgets remain initial JavaScript 101,199 bytes, optional Balloon 681 bytes, basic home 112,726 bytes.

Current screenshots are under `artifacts/screenshots/`: `dev-game-directory-overview.png`, `dev-chomp-distinct-games.png`, `dev-valley-editions.png`, `dev-targi-desktop.png`, `dev-smash-up-mobile.png`, and `dev-coverage-desktop.png`.

Remaining research includes Anno 1800 (publisher download returned HTML), Zoo Vadis (no direct manual link found in inspected publisher product pages), and the rest of the pending inventory. Missing sources were not replaced by guessed answers. The owner's request to retain the finished spinner/balloons/cards/towers view remains queued after the compendium work in `IMPLEMENTATION.md`; no main-picker presentation behavior was changed. No public deployment or publication occurred.

The older coverage numbers below are historical outputs from name matching and included the false Chomp identity match. Current counts above apply the correction.

## Earlier compendium checkpoint — 2026-09-23 01:26 UTC

The directory now has **131 researched rule records**, six original prompt drafts and zero human approvals. This turn added eight Rio Grande and six Zoch records. They cover 117 of the 1,320 inventory identities; **1,203 identities remain without researched answers**. Thirteen researched games are outside the inventory, and Spin Circus has two edition records. The full-compendium task remains unfinished.

All 14 new starting instructions were read on rendered publisher PDF pages. The records retain official alternatives and tie-breaks, distinguish initial auctions or setup roles from ordinary turns, and identify the actual language and file edition. Source evidence and batch notes are in `research/coverage/rio-grande-progress.md` and `zoch-progress.md`. No public publication or deployment occurred.

| Check after this batch | Actual result |
|---|---|
| `npm run content:validate` | Passed: 131 rule drafts, six prompt drafts, zero approvals |
| `npm run content:coverage` | 117 researched inventory identities; 1,203 pending |
| `npm run build` | Passed after all 131 records: 11 pages, 98 internal links, private-content exclusion, SEO/CSP/indexing and size audits |
| Affected browser tests | Nine passed in 27.4 seconds across Chromium, Firefox and WebKit: all current detail URLs, search, coverage filtering and full-collection random selection |
| New source availability | All 14 new cited URLs returned HTTP 200 to HEAD requests at 01:25 UTC; report: `artifacts/source-availability-rio-zoch.json` |
| Live screenshots | Four captured and opened: directory overview, Beyond the Sun desktop, Niagara mobile and coverage desktop; no clipping or horizontal overflow observed |
| Focused live assertions | Directory contains 131 entries; official random tie-break and simultaneous-card clarification render; mobile fits its width; no page, console or HTTP errors |

The earlier nine affected checks also passed at the intermediate 126-record checkpoint. The final 131-record rerun above supersedes that result. Type/lint/unit, broader picker/release and Lighthouse checks were not rerun for these data and research-script additions; their actual earlier results remain below. Build budgets are unchanged: initial JavaScript 101,199 bytes, optional Balloon chunk 681 bytes, basic home total 112,726 bytes.

The preparer's initial Rio Grande run failed safely on an intake result without a local PDF. It now ignores such unavailable-file entries when matching an explicit source. Its generated uncertainty notes now respect supplied official tie-breaks. The final generated drafts passed schema validation. The Zoch intake initially missed PDFs with abbreviated labels; it now caches linked PDFs for manual source identification. Reference sheets, print-and-play adaptations and the phone-stand template were not counted as new rules.

The owner's latest presentation request is recorded, still unchecked, in `IMPLEMENTATION.md`: after compendium work, keep the finished spinner, balloons, cards or towers visible alongside the winner until the next draw or relevant edit. No presentation behavior was changed in this batch.

Current screenshot files: `artifacts/screenshots/dev-game-directory-overview.png`, `dev-beyond-the-sun-desktop.png`, `dev-niagara-mobile.png`, and `dev-coverage-desktop.png`.

## Earlier compendium expansion — 2026-09-23 UTC (117-record checkpoint)

The local directory contains **117 sourced edition records** (up from 18): 86 new Gamewright entries and 13 new Blue Orange entries. All are searchable, usable in random-rule draws, and individually linked to publisher evidence. There are six original house prompts and zero human approvals. The full compendium remains incomplete: 103 of 1,320 inventory identities have a researched edition; 1,217 still need primary-source research. Thirteen researched games are outside the inventory and one game has two edition records. This remaining research is implementation work, not solely an owner launch action.

The user's clarification said the proposed existing-tab browser issue was not their concern. Work continued on missing rules. Actual expanded-catalog tests nevertheless caught newly added detail URLs returning 404: Astro had cached the development route list. The local-only detail route now resolves the current record for each request and explicitly disables prerendering in the injected route configuration. Add/edit/remove tests pass without a restart. Unknown and removed slugs return real 404 responses; production still excludes all development routes.

| Check on this expansion | Actual result |
|---|---|
| `npm run verify` | Passed after the final 117-record batch: 64 files with zero diagnostics, lint, all 26 unit tests, content validation and build audits |
| Static artifact audit | 11 pages, 98 internal links, metadata/CSP/indexing/size checks passed; no research data, source files or draft routes emitted |
| Live browser suite | 21 tests passed in 1.5 minutes across Chromium, Firefox and WebKit after the routing fix, with 104 records |
| Final catalog browser rerun | Nine affected checks passed with all 117 records, including every detail URL, separate US/UK Spin Circus results, final-index random selection beyond the 50-player limit, and live draft add/edit/remove |
| Final coverage filter rerun | Three checks passed after making the assertion accommodate progress toward a complete inventory |
| Source availability | All 117 unique cited URLs returned HTTP 200 at 2026-09-23 00:59 UTC; this proves availability only, not approval |
| Screenshot capture | Twelve fresh live-dev captures completed; picks, 117-rule count, edition navigation, source answers, prompt skip, coverage search and above-fold actions asserted; no page, console or HTTP errors |
| Visual inspection | The fresh directory overview, edition-search desktop view, mobile edition answer and coverage desktop view were opened and inspected; no clipping or overflow found |

The first expanded browser run failed eight checks on the stale detail routes. The first attempted fix needed an explicit `prerender: false` on the injected route; a page export alone did not configure that route. Lint then caught that redundant export outside `pages/`, which was removed. An intermediate WebKit run was interrupted while the source was being hot-reloaded and showed a reset roster; the stable final rerun passed without changing timeouts or weakening assertions. The new Blue Orange preparation initially emitted numeric printed-page labels; validation rejected them, and they were converted to the required strings before the successful final checks.

The link checker previously stopped silently after 30 sources. It now reports complete counts and checks bounded batches of up to 250 URLs with three workers, eight-second deadlines, three redirects and no retries. Its JSON report is `artifacts/source-availability.json`; it never changes content, source-check dates or approval metadata.

Publisher research is documented in `research/coverage/gamewright-progress.md` and `blue-orange-progress.md`. Starting instructions were checked against actual manuals, including image-only pages. Edition differences, cooperative/competitive distinctions, simultaneous play and role assignment remain explicit. The Lost Seas entry honestly identifies the inspected French manual and its English summary. Boochie and Hit or Miss remain unresolved leads. No research was represented as a complete import or human approval.

Fresh screenshots: `artifacts/screenshots/dev-game-directory-overview.png`, `dev-editions-desktop.png`, `dev-edition-mobile.png`, `dev-coverage-desktop.png`, plus the other eight `screenshots:dev` captures. Existing method/reflow screenshots and the broader release/Lighthouse checks below are historical; they were not rerun for this data expansion. Conservative gzip budgets remain initial JavaScript 101,199 bytes, optional Balloon 681 bytes, basic home total 112,726 bytes.

## Earlier refinement — 2026-09-22 (historical checkpoint)

The homepage now contains the picker and two directory links. The tool has soft plum/pastel styling, names edited directly on each player piece, a growing roster without an inner scrollbar, and six methods: Quick, Instant, Spinner, Card Draw, Balloon Rise and Towers. Larger groups retain an above-roster primary action. Guidance and SEO copy live on supporting pages. Game-rule selection supports a random draw, skipping the current rule and opening its source page.

**The full compendium is not complete.** There are 18 researched rule drafts and six original prompt drafts, all unapproved. A separate development-only inventory contains 1,320 discovered game identities, five of which currently match a researched edition; 1,315 still need primary-source research. The other researched rules fall outside that inventory. The inventory is searchable at `/dev/coverage/`, but names are never counted as completed rules. No exhaustive coverage claim or public publication was made.

| Current check | Actual result |
|---|---|
| Type check | 64 files; zero errors, warnings or hints, rerun after final application changes |
| Lint | Passed |
| Unit tests | 26 passed across two files; includes collection draws beyond the player cap and spinner geometry for every winner at 2–12 players |
| Content validation and build | Passed; 18 draft rules, six draft prompts, zero approvals; 11 static pages and 98 internal links audited |
| Full browser run | 90 passed in 7.1 minutes: 30 scenarios in each of Chromium, Firefox and WebKit, including the real dev URL, all methods, privacy, blocked dependencies/storage/randomness, source navigation and the complete discovery inventory |
| Affected browser reruns | 33 passed after final method layout/label fixes; six more passed after balancing four seats at 320px |
| Release and cache-isolation regression | Passed: preview, empty production, 41 synthetic game pages plus a synthetic prompt, disabled Balloon and invalid-domain rejection; fresh dev browsers worked before and after these builds |
| Lighthouse | Six fresh local production-fixture reports passed: performance 99–100; accessibility, best practices and SEO 100. This is simulated lab evidence, not field measurements or public indexing |
| Source availability | All 18 referenced endpoints returned HTTP 200 at 2026-09-22 23:55 UTC; this is link availability, not new factual review or approval |
| Runtime screenshots | 18 deterministic review screenshots, nine live-dev screenshots and eight controlled method screenshots captured; winner/reflow assertions passed, with no unexpected page errors. A final 320px capture also asserted its primary action was above the fold |

Initial refinement testing had five failures: an early click could reach the random-rule button before its handler loaded; WebKit detected a ResizeObserver delivery loop; and three runs stalled or were interrupted during development. Controls now stay disabled until initialized, name-height writes run outside the observer delivery cycle, and the complete stable rerun passed. Assertions were not weakened and the configured browser timeouts were not raised.

Screenshot review then found upside-down spinner numerals, an uneven four-player mobile reveal grid, and an isolated fourth seat at 320px. Counter-rotation and balanced grids fixed those issues; affected checks passed afterward. The screenshot helper's first RNG injection failed because a transpiler helper was unavailable inside the page; explicit script source and an asserted random-word fixture fixed the helper before its final captures. No production override was added.

The larger release fixture exposed duplicate meta descriptions when different games share the same rule. Descriptions now include game and edition. Inert JSON-LD blocks no longer consume executable-script CSP hashes, keeping the header bounded as the catalog grows. Both changes passed the expanded release matrix without relaxing its metadata or security assertions.

Current conservative gzip accounting: initial JavaScript 101,199 bytes; optional Balloon chunk 681 bytes; basic home total 112,726 bytes. The JavaScript number conservatively includes non-home and optional assets except Balloon/house prompts.

Representative inspected captures: `artifacts/screenshots/dev-mobile-ready.png`, `dev-desktop-ready.png`, `dev-game-directory.png`, `dev-coverage-mobile.png`, `reflow-320.png`, `mobile-balloon-long-names.png`, and the eight files matching `artifacts/screenshots/refinement/mobile-*-controlled.png` / `mobile-*-result.png`. The 50-player mobile capture at `artifacts/screenshots/refinement/mobile-50.png` confirms ordinary page growth with the primary action above the roster. These are desktop browser emulations, not physical-device testing.

The following sections preserve earlier implementation and repair evidence; their counts are historical.

## Repair after the reported broken preview

The owner's failure was reproduced on `http://127.0.0.1:4321/`: the optimized Zod dependency returned HTTP 504 (`Outdated Optimize Dep`), React did not hydrate, and the picker stayed on “Getting ready.” Earlier successful picker tests had exercised the static build on 4322; they did not establish that this development picker worked. Release fixtures shared `node_modules/.vite` with the live project. Watcher exclusions alone did not fix that cache collision.

Astro/Vite caches now live inside each project, with separate Vite directories for dev and build. A regression script opens fresh browsers before and after the complete isolated release matrix. New browser coverage also exercises the actual dev address, all reveals, names, remembered groups, navigation, and all 15 draft pages. Firefox additionally restored dynamic disabled button states on reload; the picker form now disables that browser autocomplete behavior while preserving explicit application storage.

Local navigation now reaches `/dev/games/` and `/dev/house-rules/`. The directory contains all 15 named candidates from the plan, including 12 newly researched entries. The review queue still has zero human approvals. These pages and draft facts are excluded from static builds. This is not a complete database of every board game.

The independent picker startup message provides a reload link after a failed island download. Its first test accidentally blocked only the original URL; Astro successfully retried with a query parameter. The corrected test also blocks retry URLs. A separate directory assertion incorrectly assumed an ampersand must be serialized as an entity; it now accepts either valid HTML representation. Local browser workers were reduced to one after concurrent desktop engines and PDF work exhausted the host's test time budget.

## Earlier repair checks (historical)

| Check | Actual result |
|---|---|
| `npm run check` | 54 files; zero errors, warnings, or hints after the preview repair |
| `npm run lint` | Passed |
| `npm test` | 24 tests passed across two files |
| `npm run content:validate` | Passed: zero approved games, zero approved prompts, 15 rule drafts, six prompt drafts |
| `npm run build` | Eight static pages and 72 internal links audited; artifact, metadata, structured data, indexing, canonical, privacy, CSP, and size checks passed |
| `npm run test:browser` | Final full run: 66 passed in 3.5 minutes, all 22 scenarios in Chromium, Firefox and WebKit; includes the actual dev picker, all 15 draft routes and persistent-download-failure recovery |
| `npm run test:dev-release` | Passed with the expanded catalog: fresh dev browsers could pick before and after the full release matrix, while the browser suite also ran |
| Release matrix (included above) | Preview, empty production, isolated synthetic approved-content production, disabled Balloon, and invalid production-domain rejection passed |
| `npm run screenshots:dev` | Seven fresh live-dev screenshots captured and visually inspected; working picks/navigation/prompts, 15-game count and above-fold primary actions asserted; no page, console or HTTP errors |
| `npm run screenshots` (earlier build) | 18 screenshots captured; deterministic winners asserted; no unexpected page errors |
| `npm run audit:lighthouse` | Earlier visual/CSP build: six reports passed; SEO/accessibility/best practices 100, performance 99–100. Not rerun after the preview repair |
| `npm run links:check` | All 15 referenced source endpoints returned HTTP 200 on 2026-09-22 at 21:23 UTC; availability is not factual approval |
| `npm audit` | Zero reported vulnerabilities across production and development dependencies on 2026-09-22 |

The design/SEO pass reran type checking, lint, unit tests, content validation, build, and artifact audits. The added no-JavaScript cases initially exposed a test locator issue and a missed heading edit. Those were corrected. A later interrupted development request revealed that release fixtures were restarting the preview server. After excluding generated artifacts from its watcher, all six affected no-JavaScript/editorial cases passed while the release matrix ran concurrently. Lighthouse then exposed Zod's caught eval-capability probe under CSP; disabling JIT eliminated the need for that probe without weakening the policy. After this fix, the complete 57-case browser suite passed in 2.0 minutes, including a new CSP-violation assertion. The release matrix uses an isolated ignored copy and visibly synthetic fixtures; it does not approve or modify real content.

Latest conservative gzip accounting: initial JavaScript **99,047 bytes**, optional Balloon chunk **681 bytes**, basic home total **108,708 bytes**. These are static transfer estimates, not real-user Core Web Vitals or mobile network measurements.

## Lighthouse lab results

Lighthouse 13.5.0 audited the earlier isolated production configuration on 2026-09-22 after the CSP fix, before the later development-preview repair. The server applied the generated deployment headers and gzip compression. Reports use simulated mobile throttling, plus one desktop run. The following scores describe that earlier build.

| Page / run | Performance | Accessibility | Best practices | SEO |
|---|---:|---:|---:|---:|
| Home, mobile 1 | 99 | 100 | 100 | 100 |
| Home, mobile 2 | 99 | 100 | 100 | 100 |
| Home, mobile 3 | 100 | 100 | 100 | 100 |
| Home, desktop | 100 | 100 | 100 | 100 |
| Balloon, mobile | 100 | 100 | 100 | 100 |
| Synthetic approved-rule template, mobile | 100 | 100 | 100 | 100 |

Across the three mobile home runs, LCP was 1.52–1.64 seconds, total blocking time 36–105 ms, and CLS 0.0074. Median mobile performance was 99. These are local lab observations, not field INP/Core Web Vitals, public search indexing, physical-phone certification, or guaranteed rankings. The rule fixture proves the template's behavior without approving real editorial content. Unscored diagnostics still identify the expected framework JavaScript and a render-blocking stylesheet; the initial-transfer budget passes.

Machine-readable results are in `artifacts/lighthouse/summary.json`; individual JSON/HTML reports sit alongside it. The audit saves reports and fails if SEO, accessibility, or best practices is below 100, or performance below 90. The original diagnostic run scored best practices 96 because Zod probed `eval`; the final reports above followed the non-evaluating parser fix, with the original strict security policy retained.

## What was exercised in the running application

Browser checks use the built static output at `http://127.0.0.1:4322/`, including the generated CSP and security headers. New checks also use the actual dev picker at `http://127.0.0.1:4321/` and its draft directory, articles, review queue and house-rule experience. The testing server returns actual 404 responses for unpublished, research, and development paths. In-app-browser automation could not initialize on this host; live interaction was verified with Playwright against the same address, not through the user's existing tab.

- Every presentation reveals the same preselected winner. Rapid activation, repeat winners, skip, viewport changes, hidden-tab interruption, optional chunk failure, and blocked secure randomness were exercised. An unavailable RNG produces an error and no fallback winner.
- Two, twelve, thirteen, fifty, and fifty-one entries; duplicate names; Unicode; blank lines; long names; and literal HTML input were checked. No excess player is silently removed. Animated presentations yield to Instant beyond twelve entries.
- Remember/reload/forget, corrupt or blocked storage, reduced motion, blocked audio, and muted defaults were exercised. Names were absent from intercepted request URLs, headers, and bodies. Native-share payload stubs and clipboard failure produced clean links without participant data or results.
- Slow hydration keeps the tool labeled and disabled until ready. Keyboard pick and skip-link navigation passed in all three engines. Axe reported no violations in the tested WCAG A/AA scenarios. Mobile 390px, 320px reflow, 200% CSS zoom, and twelve long balloon labels had no horizontal overflow.
- Search exact/alias/typo behavior, empty states, draft rule HTML, source display, house-prompt skip, and the random tie-break escape were exercised. The release fixture verified approved rule answers are static HTML without a React island, and private evidence/reviewer details stay out of output.
- Preview noindex headers, empty preview sitemap, production canonicals/indexing, empty-catalog exclusions, populated-catalog sitemap entries, and the Balloon disable switch were checked in built artifacts.
- Static help disclosures and navigation through Fairness and Privacy worked with JavaScript disabled in all three engines. The HTML audit checks exact canonical paths, unique titles/descriptions, matching social/structured metadata, internal links/fragments, and an exact sitemap-to-indexable-page match.

## Separate skeptical review and fixes

After implementation, a separate review pass inspected fairness, privacy, publication boundaries, accessibility, failure recovery, and indexing against the brief. No subagent or external reviewer was used.

The selection code rejects the incomplete uint32 bucket, freezes a roster snapshot, and chooses once before presentation. Presentations contain no RNG. Tests cover every eligible index and rejection boundaries; these are algorithm checks, not a statistical certification of browser cryptography.

Public templates receive explicit field projections from the approved directories. Research and development routes are excluded from static output. Approval hashes become stale after substantive changes. The validator can enforce completeness and revision equality but cannot authenticate a human identity; repository access and human review remain the trust boundary. Telemetry reconstructs allowlisted fields and has no configured sink.

Defects found and corrected included insufficient contrast in two muted text colors, an offscreen skip link leaking into full-page captures, excessive idle space pushing the mobile action down, loading-state ambiguity, and Windows WebKit skipping the skip link during Tab navigation. The skip link now has explicit keyboard focus behavior. A failed optional Balloon import retains the text result. The static test server's initial asset-path handling and screenshot harness serialization were also corrected. A final one-player grammar issue was fixed. Affected checks were rerun, followed by the full browser suite.

The ordinary four-seat action fits above the fold at 390×844 and 1366×768. Larger groups and expanded editing/preferences intentionally scroll. At 320px, content reflows without horizontal scrolling; the primary action can be below the fold.

## Screenshots inspected

All files are in `artifacts/screenshots/`. The capture script controls randomness only inside the test browser; there is no production seed or winner override.

The latest preview-repair captures use real browser randomness and are reproducible with `npm run screenshots:dev`: `dev-desktop-ready.png`, `dev-mobile-ready.png`, `dev-mobile-result.png`, `dev-game-directory.png`, `dev-mobile-uno.png`, `dev-mobile-simultaneous.png`, and `dev-house-rules.png`. All seven were opened and visually inspected. The default primary action fits at 1366×768 and 390×844; named result states intentionally scroll. The earlier captures below remain available as historical evidence.

- `desktop-ready.png`, `desktop-result.png`, `laptop-ready.png`
- `mobile-ready.png`, `mobile-named-result.png`, `mobile-invalid-input.png`
- `desktop-balloon-controlled.png`, `desktop-balloon-result.png`, `mobile-balloon-long-names.png`
- `desktop-preferences.png`, `desktop-rng-failure.png`, `reflow-320.png`
- `mobile-empty-search.png`, `mobile-draft-rule.png`, `desktop-review-queue.png`
- `mobile-help.png`, `desktop-about.png`, `desktop-viewport.png`

Desktop/mobile layouts, result and error states, controlled Balloon frames, the long-name grid, reflow, and editorial preview captures were visually inspected. Publisher PDF pages were separately downloaded, read, rendered, and visually inspected for the initial three records and the eleven new PDF-based records; Wingspan uses the publisher-linked official online reference, checked in standard base-game configuration. See `CONTENT_REVIEW.md` for source locations and review scope. Original social art was rendered from the project's SVG to `public/social.png`.

The 2026-09-22 visual review checked the new serif headings, warm paper palette, flatter surfaces, readable seat counters, below-tool disclosures, and long rule headings. The ordinary action remains above the fold at the tested phone/laptop sizes. The social image was redrawn to match; no external font or image request was added. See `DESIGN_AND_SEO.md` for the decisions and primary search guidance.

## Explicit limits and launch handoff

Physical iOS/Android hardware, a real native share sheet, and a real screen reader have not been tested. Desktop WebKit is not an iPhone test. Automated accessibility checks and CSS zoom are useful checks, not accessibility certification. There has been no public-host smoke test, deployed CSP inspection, real-user performance measurement, or hosted rollback demonstration.

The owner still needs to approve the visual treatment; review exact content revisions or choose a picker-only launch; select and authorize the domain and hosting destination; supply contact details and actual host privacy information; perform device/assistive-technology checks; and authorize deployment followed by public smoke/rollback checks. `LAUNCH_CHECKLIST.md`, `CONTENT_REVIEW.md`, and `RUNBOOK.md` provide the concrete steps. None of these unavailable approvals blocked completion of the local implementation.
