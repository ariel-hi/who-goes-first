# Popular game publication batch 12

Baseline: `a745cde8e5ea50e22e7ecc9054910783d734c8ec`. Thirteen individual game commits precede the integration commit. Twelve popular-game sources were reviewed by Codex; the exact Shadow Cards package was separately reviewed and approved by the coordinating Codex task. This batch does not apply the original-edition follow-up or its two correspondence corrections.

## Published scope

| Game | Reviewed edition | Portable picker criterion |
|---|---|---|
| Earth | Inside Up English base game | No |
| Hanamikoji | EmperorS4 English edition | Yes |
| Tikal | Rio Grande English edition | Yes |
| Terraforming Mars: Ares Expedition | Stronghold English base game | No |
| Crokinole | NCA English competitive rules | No |
| Telestrations | The Op English second edition | No |
| Thurn and Taxis | Rio Grande English edition | No |
| Paladins of the West Kingdom | Garphill English base game | No |
| Innovation | Asmadi English fourth edition | No |
| Formula D | Asmodee English basic rules | No |
| Mice and Mystics | Plaid Hat English base game | No |
| Splendor Duel | Space Cowboys English edition | No |
| Shadow Cards | English summary of AMIGO German rules | No |

## Verification

- Content validation: 1,069 approved rules and matching drafts; 391 portable rules; 60 prompts.
- Type check: 174 files, zero errors/warnings/hints. Lint passed. All 180 unit tests passed.
- Production build: 1,242 pages and 32,926 internal links. Canonicals, unique metadata, structured data, sitemap parity, private-evidence exclusion and deployment headers passed.
- Every new article passed exact answer, edition, source-link and schema checks. All 19 compiled JavaScript/CSS assets are byte-identical to the released baseline.
- Release matrix passed, including empty preview/production, synthetic content, growth content, disabled mode and required environment rejection.
- All 144 focused browser cases passed across Chromium, Firefox and WebKit: real thirteen-game directory/article/share journeys, rule library/home lookup, existing directory/chooser/source/search and affected keyboard picker journeys.
- The 42 new-game browser cases passed again after making their expected canonical origin follow build configuration, preserving strict production checks while supporting CI's localhost preview. Final type checking and targeted test lint passed after this test-only adjustment.
- A separate copied publisher-registry fixture retained the real publisher identities and assignments, added only synthetic fixture identities, built successfully and passed 12 three-engine browser checks. Its output is never deployable.
- The dated hosted full-suite baseline at `c694327` covers unchanged application/animation code. The separate `a745cde` hosted run is not represented here as completed unless its own receipt proves that status.

## Preservation and coverage limits

All 2,112 previous public/research records remain semantically unchanged. Eight publisher identities, five public assignments and zero research assignments are unchanged. All native decisions and source evidence except Shadow Cards are preserved, including Mille Fiori's accepted identity and complete prior hold. Native totals are 53 accepted, 235 held, 65 reviewed and 223 unreviewed; 88 sources. Shadow Cards remains excluded from the portable pool. Only Hanamikoji and Tikal were added to that pool.

The directory contains 5,038 identities. Target refresh reports 387/1,062 title-matched leads and 382 directory-associated target entries; neither number claims a completed edition-by-edition audit. The new refresh explicitly labels title matches as research leads. Known original/later-edition gaps and the approved Citadels/Love Letter corrections remain queued separately.

One initial unit attempt hit the obsolete assertion that Shadow Cards remained unreviewed. That log is preserved; the assertion now reflects its independently approved native identity, with unrelated held entries still checked. No production code or test assertion was weakened to hide the failure.

The first focused browser run inherited the production build's environment in its local dev server, correctly returning404 for draft routes. The existing draft-directory test failed in each engine. Its logs/traces are preserved. The harness was corrected to run the dev server in preview mode while serving the unchanged production build; the complete focused suite was rerun without weakening assertions.

## Evidence

Local evidence: `artifacts/popular-12-preservation.json`, `artifacts/popular-12-assets.json`, `artifacts/popular-sep26-12-built-pages.json`, `artifacts/batch12-*.log`, and `artifacts/popular-12-fixture-*.log`. All 173 queued identity inputs and 175 PDF hashes matched the immutable source manifest before application.

Deployment verification is recorded separately after promotion in `artifacts/popular-sep26-12-live-check.json` and `artifacts/popular-12-live-browser.json`. Live checks require both full lookup indexes to equal the tested production build, every new article/source/canonical/schema to match, and actual directory/library/home/share browser journeys to pass.
