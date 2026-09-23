# Capstone and Atlas — 2026-09-23

Seven more inventory identities have source-checked, approved records: Boonlake, Curious Cargo, Terra Mystica, Joan of Arc: Orléans Draw & Write, Gloom, Once Upon a Time: The Storytelling Card Game, and Seismic. Current totals: **391 researched records**, **370 of 1,320 inventory identities**, **950 pending**, **139 approved catalog entries**, and **116 portable random-mix criteria**. The full compendium remains unfinished.

All seven complete publisher-linked PDFs were retrieved and hash-recorded. All **25 listed rendered pages** were opened and inspected alongside the relevant extracted text. This review checks starting instructions, relevant modes and edition evidence; it does not claim an exhaustive audit of every rule in these games.

| Game | Reviewed PDF pages | Decision |
|---|---|---|
| Boonlake | 3, 4, 15, 24 | Latest trip to a place with fewer than 100 inhabitants chooses the multiplayer starter. Keep 6/7/8/8 starting coins separate from solo, where the Wise Eminence starts. ©2021. Portable criterion. |
| Curious Cargo | 2, 4, 5, 6, 12 | Latest truck rider has the top initial Forklift. Construction may be simultaneous, and changes on the track can alter who starts Trucking. The track stacking rule is not a tie-break for the initial recency criterion. Directory only. |
| Terra Mystica | 5, 6, 8, 9, 14, 20 | Latest planting-bed digger receives the token and takes the first Action after Income. Setup placement and Bonus-card choice have distinct sequences. First passer starts the next round. Portable criterion; no printing inferred from the filename. |
| Joan of Arc: Orléans Draw & Write | 1, 2, 8, 9, 12 | Random bag holder chooses the first Follower. Extra actions vary by player count. Bag rotates after the round. Human begins in solo. ©2022 credits and the January 2023 filename remain distinct. Directory only: official random choice. |
| Gloom | 1, 2 | Worst day selects the first player. Owner fallback applies when everyone had equally miserable days, not every partial tie. Second edition, ©2004–2014. Portable criterion. |
| Once Upon a Time | 1, 2 | Draw/discard a Story Card; whoever looks most like it starts the story. Do not narrow this to Character cards. Most cards left chooses the next game's Storyteller. Third-edition publisher download, ©1993–2012. Directory only: requires its Story Deck. |
| Seismic | 1 | Seated closest to a solid doorframe starts clockwise turns. Tallest-player tie-break concerns endgame scoring only. No printing inferred. Portable criterion. |

Approvals identify Codex under the owner's 2026-09-22 editorial delegation. The separate pool review includes four exact revisions and excludes the other three. Random alternatives invented by this site are clearly labeled house rules. Joan of Arc's official random selection is not duplicated as a house fallback. No public deployment occurred.

Discovery also rejected substring/title mismatches in the Capstone catalog: EPOS is not Gentes, Pirates of Maracaibo is not Maracaibo, Renature is not Nature, and original Orléans is not the draw-and-write game. The Ares archive request returned 403. This pass found no usable manual link in the inspected Mad Science University or Stir Fry Eighteen product pages; that is not evidence that no manual exists elsewhere. These held leads are not counted and do not block research on other titles.

Evidence:

- `research/capstone-atlas-source-queue.json` and `research/source-files/capstone-atlas/intake.json`
- Cached PDFs, `render-plan.json`, `renders.json` and 25 page PNGs under the ignored source-files directory
- `research/capstone-atlas-reviewed-batch.json`, with individual wording, uncertainties and random-pool decisions
- `artifacts/capstone-atlas-review/prepare.ts` and `apply-review.ts`, preserving drafts and refusing catalog overwrites
- `artifacts/source-availability-capstone-atlas.json`: all seven cited URLs returned HTTP 200 and PDF content types at 10:28 UTC
- `artifacts/capstone-atlas-live-check.json`: seven article checks on development and static servers, 320px layout, axe, exact copy and sources, pool parity, draw/skip, alias search and identity separation

The retained winner scenes are preserved; no application UI code changed in this content pass. See `VERIFICATION.md` for actual check results and screenshots.
