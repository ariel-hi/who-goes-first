# Navigation recovery and CrowD source intake — 2026-09-26

Current local scope remains **4,988 identities /887 approved editions /881 sourced identities /4,107 pending**, with **361 portable criteria /60 house prompts**. Native review remains **32 accepts /256 holds /42 reviewed /246 unreviewed**. This checkpoint changes navigation and prepares source proposals; it enrolls no identities or rules. Worldwide coverage and the perpetual improvement goal remain unfinished.

## Observed journeys and navigation changes

An independent frozen audit of `6696b8347f6c9bc49d5ce854bfbebc5fdc5e6265` retained44 visitor states plus two exact Back follow-ups and50 PNGs at320/1280. Native Azul search → article → uncached Back lost the query and expanded three results to887. The125-row A2 shelf offered Previous only below the entire list: mobile y9023.4375px, desktop y8670.078125px. Privacy had no return link at its reading endpoint. Ordinary measured baseline journeys had no overflow, errors or external requests.

The separate pagination follow-up retains12 PNGs and verifies the numeric first shelf, A1/A2 cross-letter destinations and the final Other shelf. One immediate numeric320 measurement reported330px width before a subsequent320px measurement and fitting screenshot. Preserve that negative; it does not establish sustained overflow or a font-download cause. A separate eight-context cold Chromium diagnostic found330px while no stylesheet had applied, with the unstyled alphabet extending to329.953125px; load/first-frame layout became320px. All24 actual PNGs were already styled. This supports a measured pre-stylesheet explanation in the new probe, without claiming the older sample's exact timing or a visible flash. Zero font requests occurred. No product fix was supported.

Changes:

- Public `/games/` opts into query-only `#q=` history using the shared fragment parser. Actual typing replaces the current entry while preserving its history state; reload, recognized hash changes and cached Back restore the field and original search rendering. Unicode and reserved punctuation remain encoded. Clearing restores the complete original order. Ordinary anchors remain separate, and blocked history writes leave search usable. Local research/review directories remain opted out.
- Multi-page alphabet shelves show the same server-calculated controls above and below their games. First/last and cross-letter semantics are preserved by a reusable server-rendered component. Single-page shelves retain their existing bottom controls.
- Privacy exposes an ordinary44px “Back to the picker” link at the reading endpoint. Its text now accurately explains URL fragments, bookmarks, copied addresses and browser history. Search fragments do not enter page requests. The implementation-policy date is26 September2026.

Selection, randomness, animation timings, catalog content, metadata policy and dependencies are unchanged.

## Final visual evidence

`artifacts/sep26-navigation-final-visual/` freezes **981 compiled files /10,830,691 bytes /952 HTML pages**, eleven relevant source copies and **four Chromium cases /26 states /52 full-page and viewport PNGs**. Native Azul typing → reload → article → uncached Back retains the exact query, count and ordered three Azul hrefs at both widths; clearing restores887 links and their original order. Typing/reload adds no history entries. Canonicals remain fragment-free; requests contain no search fragment.

No-JavaScript A2 top controls are44px tall, at y432.46875–476.46875 on mobile and437.421875–481.421875 on desktop,24px before the first row and inside the initial844px viewport. Top/bottom destinations match. Actual native links reach A1 → numeric and A2 → B; Other retains only its Z return. Privacy's44px return reaches the actual home heading “Pick a player”; the existing no-JavaScript picker notice remains honest. All26 measured states have no overflow, browser/HTTP errors or external requests. Root opened complete mobile Privacy and the mobile A2 top capture; the independent reviewer opened additional complete search/shelf captures.

Root independently rehashed baseline981 compiled /14 source /74 evidence members, the17 pagination-follow-up members, and final981 compiled /11 source /69 evidence members. Original baseline and child seals remain unchanged. Final report SHA-256 `80a84501ceba0ab587d81161669ef9d576d0534c7acfe743ef7e6ddab2bc2adb`; measurements `53dcd9e242e974504f746d9f46ab20b624caf77d268869da4a5cb7704c16842e`; compiled manifest `8c1b8d4c40c319082895bd136dd9c808c903ac80e20559303d916ad919962f7f`; source manifest `40d28dcb943e8f8e9bec59285f0aaebfefb2cda1764578168bc11c50c7ff1a8d`; evidence manifest `ea7534e49272a4147ad6c110c63d8d48db2ff85fc400028ce76579fa530babc6`.

## Verification and preserved corrections

**`npm run verify` passed**:116 checked files, zero errors/warnings/hints, lint, **122 unit tests /12 files**, content validation, **952 pages /19,066 internal links**, canonical/schema/metadata/sitemap parity, private-content exclusion, security/cache and static budgets. Build19.74s; conservative gzip **111,359 initial JavaScript /1,161 Balloon /128,180 basic home bytes**, increases of214/212 initial/home bytes from6696b83. No fonts, media, dependencies or styles were added. Seven unit tests and three checked files belong to pre-existing unrelated untracked growth work, excluded from the owned scope. Log: `artifacts/sep26-navigation-recovery-verify.log`.

**Release checks passed**, including preview-empty, production-empty, isolated synthetic content, Balloon disabled, and missing-domain/contact/hosting rejection. Fixtures were not deployed. Log: `artifacts/sep26-navigation-recovery-release.log`.

Browser results are preserved separately:

1. Selected123-case gate: **117 passed /6 failed /2.6m**. All105 pre-existing cases passed. All six new static journeys reached home, then incorrectly expected “Who goes first?” instead of the rendered “Pick a player”. Only the test heading was corrected.
2. Corrected18-case gate: **16 passed /2 failed /2.1m**. Firefox320 stalled at `document.fonts.ready` immediately after navigation, with a subsequent cleanup/context protocol failure at1280. Other engines passed.
3. Returning undefined from the same await: **16 passed /the same2 failures /1.9m**. That change did not solve the issue; its original trace and test snapshot remain preserved.
4. Independently probed Firefox with JavaScript disabled: font state was loaded, font set empty and zero font requests. Even a plain `Promise.resolve(...)` stayed pending through native bounding boxes, forced layout and successful screenshots; the JavaScript-enabled control resolved both promises. Native layout before the promise did not fix it. Root also read the original trace network: three requests, no fonts. This isolates a page-context promise harness issue, rather than missing fonts or an app navigation failure.
5. Test-only correction uses synchronous loaded-font state followed by actual native geometry and links. **All18 cases passed /1.6m**, across Chromium, Firefox and WebKit at320/1280, including no-JavaScript pagination/Privacy, search reload/native Back, Unicode/bookmarks, ordinary anchors and blocked history writes. No app changes were made between these retries. No uninterrupted123-case or full-suite pass is claimed.

Evidence prefixes: `artifacts/sep26-navigation-recovery-{browser,corrected-browser,font-corrected-browser,nojs-corrected-browser}*`. Three original test snapshots retain the heading, font-return and no-JavaScript-promise corrections. Final test-only check/lint passed116 files with zero diagnostics and use `sep26-navigation-recovery-nojs-final-{check,lint}.log`.

Separate sealed diagnostics: `artifacts/sep26-firefox-nojs-font-ready/` (five contexts/five PNGs; report SHA `adbf79fbb489fa72778513454c642c62d42be2c635e109d8a94bbf3d6b2687ae`, evidence manifest `0eb22b4e122b34760128814b376dd7e6fea604bbc411aaaefa40f3016666244c`) and `artifacts/sep26-numeric-cold-overflow-audit/` (eight contexts/24 PNGs; report `e76b455207b779b74975f28fb9a6380cd6671a6db50f99d47488030109a9ef92`, evidence manifest `1f7434e906ade0557620f49dfa31757a568f174acab376d29d52fa15b2945d56`). The Firefox diagnostic preserves exact installed Playwright1.63/Firefox1543 implementation copies/excerpts: pending promise reactions run inside the debuggee; screenshot preparation uses a separate utility context. This is consistent with the observed harness failure, not proof of an upstream engine bug. All diagnostic sessions are closed; root independently read the reports and rehashed their original evidence.

## Four identity proposals and two bounded holds

The new source bundles are ignored local research evidence, not published catalog content. Root and independent reviewers rehashed all **137 original members** across three bundles. Exact active discovery/native/override/catalog inputs remain unchanged against6696b83. Standing owner-delegated editorial authority applies; the proposals still require root's complete source review and guarded application.

### Native CrowD intake

`research/source-files/sep26-native-direct-crowd-four-intake/`: **57 files /10,515,821 bytes**; manifest SHA-256 `eb3e9c5989d1a7f280c7c732231f4e4df90c74f98cc45e2e5f4f6bc78aca9ede`; original proposal `37b2132bad360dd479e4f60203c1821a990a0d27dbb30bc980449e6de71d9796`. Exactly eight bounded GETs, all200, no redirects/retries, every body below5MB. The complete saved CrowD Q125680931/revision2439014095 entity supplies the official US/Russian domains. No new Wikidata, BGG destination/API or image request was made.

- **Stars of Akarios /273910 /Q139694932**: literal English/Russian product identity, physical campaign components and exact numeric BoardGameGeek anchor with readable anchor text support the proposal. Saved age/year versus localized printing/arrival and marketing-version differences remain attributed and unresolved.
- **Aqua Garden /322421 /Q138314204**: literal Russian base product, aquarium/card/wood component context and exact numeric empty-image anchor distinguish the base game from six expansions/bundles. The primary anchor is numeric evidence, not an inspected English title or title artwork. Saved age/duration versus primary age/duration and future arrival remain separate.
- **Harrow County /360899 /Q139709846**: literal English HTML title, Russian base product and physical factions/hex board/cube tree support the proposal. The empty-image numeric anchor remains separate. Deluxe/Fae modes, age/player-count/year and future arrival differences are retained.
- **Octex /41829 /Q141175044** stays held: the complete saved entity is a human Slovenian musician, with music identifiers and an official musician domain. The contradictory P2339 remains preserved; that musician host was not requested. This is a bounded misassociation finding, not proof that no game named Octex exists.

Complete previous holds, native selected-title/P2339 provenance and false rule/transfer approval flags remain in the proposals. Unresolved creator/manufacturer QIDs are not repaired. Independent review: `artifacts/sep26-crowd-four-independent-review/`. Its historical intake HEAD is preserved; any later application must bind the then-current HEAD and unchanged actual inputs.

### Garden supplemental intake

`research/source-files/sep26-crowd-garden-primary-discovery-intake/`: **31 files /4,487,886 bytes**; manifest `6431fd6b51745bb15db661554fb6fd23591f8eecda42de8de079834c31786fdb`; Dino proposal `0c53375cbc512053d97562eeae16cf8263ac727243d115e6d32a1bd3f9e85cc9`. Root copied six exact parent collection/domain members, saved the actual4988/887 runtime baseline, and fetched exactly two observed named product anchors under a separate four-GET bound. Both200, no redirects/retries, below5MB; no new Wikidata or BGG request.

**Dino Garden /447999 /Q137886341 revision2547513599** is already in the saved native pool. Root's initial primary-only assumption was corrected before the proposal. Its complete native `mul`/Russian title, nondeprecated P2339 and own P123 → preserved CrowD entity correspond to literal Russian “Зоосад. Дино” and physical dinosaur park components. The proposal is semantic identity corroboration with **Wikidata-only numeric authority**: neither inspected product contains a numeric BGG anchor; the collection has an empty positional447999 image anchor without an inspected title binding. Saved age versus primary age and future November2026 pre-order remain separate; creator/manufacturer/series QIDs stay unresolved.

Independent review supports Dino after a precision correction **in the later application clone only**: omit original `primaryNumericHrefObserved:false`; use `primaryProductNumericHrefObserved:false` and `primaryNumericTitleBindingEstablished:false`, separately preserving the exact unbound collection href. The original sealed proposal must not be rewritten. Independent memo: `artifacts/sep26-dino-sky-independent-review/`.

**Sky /447998** remains a publisher-only lead, absent from both saved pools and the active inventory. Literal primary Russian “Зоосад. Небо” identifies a physical bird game, but an empty positional447998 image/chart anchor and a sky-garden slug do not establish the exact numeric/name association. No English display title or new primary registry is inferred. Root read both complete product texts and the complete Dino entity. The initial preparation helper's Cyrillic stdout failure occurred after files were written; six outputs were verified before retrieval, and the mutation helper was not rerun. That failed log is preserved.

### Manual source holds

`research/source-files/sep26-crowd-three-manual-source-intake/`: **49 files /5,937,355 bytes**, manifest `f30eff72fc4a2460cf0389cbc3b390b6df017f978b1ed49aa3b0cfc9139a9fe3`; held assessments `d95a7aecd5d60cf46a03926147ef6c8913649c3b83535ce6e1e3b7ce54cca77d`. A local scan of nine complete bodies/1,741 anchors found observed Yandex folders for Harrow and the shared Aqua/Dino series. No direct PDF was exposed. This intake made **zero new GETs**, verified88 parent members and retained41 byte-exact copies. Manual edition/language/imprint/page references remain unknown; all rule approvals stay false/null. A later bounded public-viewer discovery can follow the observed folders. The hold is not a global absence claim.

## Exact scope and continuation

Root rehash logs: `artifacts/sep26-navigation-source-rehash.log`, `sep26-navigation-final-rehash.log`. Read-only scope: `artifacts/sep26-navigation-recovery-scope.ts` and its log verify actual runtime counts, immutable native snapshot/decision hashes and byte-identical tracked discovery/native/override/rule files against6696b83. The staged scope contains exactly eleven owned navigation/test/documentation files. Five unrelated untracked marketing/growth files remain untouched and unstaged.

Next: root reviews and applies the three CrowD plus Dino proposals, preserving both original seals and complete prior holds; Octex and Sky remain bounded holds unless further evidence resolves them. Then continue observed-folder manual discovery and supported UX/motion work. This checkpoint claims no worldwide completion, deployment, physical-device/manual screen-reader result, field performance, ranking, revenue or billing improvement.
