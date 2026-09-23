# Art games and mini-game editorial review — 2026-09-23 UTC

Art Decko and Art Robbery add two newly researched identities. Existing For Sale, Schotten Totten and Time Bomb Evolution drafts completed editorial review. Five exact revisions enter the approved catalog; four enter the separate random mix. Original drafts are preserved. The owner delegated factual review on 2026-09-22; this does not authorize public deployment.

Totals after content validation: **419 researched records**, **398 of 1,320 inventory identities**, **922 pending**, **197 approved catalog records**, **149 portable mix criteria**. The full compendium remains unfinished.

| Game | Inspected PDF pages | Review decision |
|---|---|---|
| Art Decko | 1, 6, 8, 20 | Group's best artist; official permission to choose another method if unresolved. Copyright 2020. Portable. |
| Art Robbery | 1–2, complete sheet | Latest museum visit opens; Guard Dog holder starts later raids. Undated English sheet. Portable opening criterion. |
| For Sale | 3, 4, 6, 8, 12 | Random initial choice; later auction winner and simultaneous selling are distinct. German ©2023 edition. Catalog only. |
| Schotten Totten | 5, 6, 10, 16 | Latest trip to Scotland or nearby. Clanfehde alternates starters. German ©2024 v1.0. Portable. |
| Time Bomb Evolution | 9–12 | Latest London visit; subsequent turns follow cutter transfers. German ©2016–2020 base rules. Portable. |

All 19 listed rendered pages were opened and inspected. Art Decko and Art Robbery were newly downloaded from publisher domains. The other three use existing publisher/distributor PDF caches; their hashes were checked again before approval. `research/source-files/art-mini-review/intake.json` references the original intakes and does not claim these were fresh downloads. Its render plan covers 15 pages; Art Decko's four inspected images are in its own source folder. The approval helper refuses overwrites, checks hashes and page bounds, and records exact content and mix fingerprints.

The new Art Decko PDF was discovered through a retailer's direct link to Rio Grande's domain. The guessed publisher product page returned 404 and was not used as evidence. Helvetiq's product page identifies Art Robbery and provides its English rules. The new entries map to inventory identities 260316 and 341935 respectively. The three mini-games were already researched and do not increase identity coverage.

IELLO's queued local downloads timed out. The web reader returned text for the English For Sale, Schotten Totten and Time Bomb Evolution manuals, but its screenshot responses provided no inspectable image payload through this tool session. Those responses are not recorded as visual checks or local PDFs. The English text corroborated the existing answers; publication uses the actual German source files inspected here. Oceanos yielded no extracted text, several other files timed out, and Popcorn exceeded the web-reader size limit. None of those inaccessible sources supplied a new answer. Tussie Mussie's current Button Shy page lacked a rule download; a 2018 design-contest PDF lead was not substituted for retail rules. Arboretum's inspected retailer listing had an empty rulebook field.

Verification uncovered a build-audit false positive: an approved For Sale answer shared its complete wording with a different unapproved draft. The audit now validates actual approved revisions and game routes independently of generated-page existence, allows shared approved answer text, and retains private-evidence and draft-only-content checks. Five focused regression tests exercise this behavior. Actual build, browser and release results are recorded in `VERIFICATION.md` after they finish.

Research PDFs and images remain local evidence; only generated `dist/` files are eligible for a later authorized deployment.
