# Eagle-Gryphon, Ludonaute and 2F-Spiele — 2026-09-23

Ten individually written and reviewed edition records were added for nine inventory identities. There are now **341 researched records**, matching **321 of 1,320 identities**, with **999 pending**. Exact editorial approvals now total **89**, and **76** criteria are eligible for the random mix. The full-compendium goal remains unfinished.

The owner's 2026-09-22 instruction in the task “Reload localhost” delegates source review to Codex. It permits these documented revision approvals, not unverified bulk publication or public deployment. Earlier research and approvals were preserved.

| Record | Inspected one-based PDF pages | Review decision |
|---|---|---|
| Incan Gold, English ©2018 | 1, 2, 4 | Simultaneous decisions; Guide preferably knows the game. Directory only. |
| Incan Gold, English ©2024 | 1, 3, 4 | Simultaneous Explore/Exit cards; no stated personal Guide criterion. Separate edition record, same inventory identity. Directory only. |
| Mercado de Lisboa, English ©2020 Preview file | All six pages | Most recent market visit. Image-only PDF read visually; multiplayer and solo scope distinguished. Included in the mix. |
| Federation, English V8 public file, Explor8 ©2022 | 7, 20, 32; both pages of the Deluxe insert | Group agrees on a selection method. Reverse setup draft and clockwise Ambassador turns distinguished. Directory only. |
| On Mars, English ©2019, April 2020 production file | 7, 8, 22, 24 | Movie-viewing criterion selects first turn-order-space chooser; numbered spaces determine action order. First Colonists and solo differences retained. Directory only. |
| Bot Factory, English v21, ©2022 | 3, 4, 10, 11, 12 | Latest robot buyer, or official random alternative. First worker placement versus later left-to-right action order distinguished. Included in the mix. |
| Escape Plan, English 2022 v1 Preview | 2, 5, 6, 7, 8 | Initial thematic bank-robbery criterion starts City placement. Day-one Notoriety tie reverses order before Player Actions. Directory only. |
| Inventions: Evolution of Ideas, English ©2023 v10 file | 2, 4, 7, 10, 22, 23 | Latest inventor with three/four players; two-player order includes randomly positioned Chronos. Reverse preliminary setup preserved. Conditional full answer stays directory-only. |
| Nomads, English v1.2, ©2017 | 1, 3, 4, 8 | Latest storyteller or official random alternative. Unused-Adventurer setup and Lumarathon exception distinguished. Included in the mix. |
| Fearsome Floors / Finstere Flure, German ©2003/2017 | 3, 6, 7 | Resemblance to this game's monster in the basic game; final tile-placement position in advanced setup. English summary labeled. Component-dependent comparison stays directory-only. |

Eagle-Gryphon's public product pages link to public Google Drive folders. The actual English base manuals were selected from visible file identities; their public viewers supplied the download URLs. Ten PDFs were retrieved there, including Federation's Deluxe insert and On Mars' reference book as supporting files. This did not use a private Drive account or a connector. The eight citable rulebook viewers each returned HTTP 200 in the separate availability check; availability is not the source-content review itself.

The exact queues, source hashes, intake results and extraction leads are under:

- `research/eagle-gryphon-source-queue.json` and `research/source-files/eagle-gryphon/intake.json`
- `research/ludonaute-source-queue.json` and `research/source-files/ludonaute/intake.json`
- `research/2f-source-queue.json` and `research/source-files/2f/intake.json`

The reviewed wording is in the corresponding `*-reviewed-batch.json` files and `research/games/`. Approved copies are in `src/content/games/`; the explicit approval application is `artifacts/eagle-ludonaute-2f-review/apply-review.ts`. Every primary source hash was rechecked before exact revisions were approved. Downloaded manuals and rendered evidence remain private development artifacts and are excluded from the site build.

The English Rio Grande Fearsome Floors PDF provides a title/identity cross-check, but its alternative-selection sentence was not silently added to the German edition's answer. The older and refreshed Incan Gold manuals likewise remain distinct. Product dates and names containing “Preview” were not treated as proof of an unspecified final printing.

Further leads and limits:

- Eagle-Gryphon's three cached catalog pages contain 592 products, including expansions and accessories. Title matches are discovery leads, not base-game or edition verification. Wombat Rescue remains a lead on the third page. Rococo: Deluxe Edition needs a human identity match because the product title omits “Edition.”
- Several older Eagle-Gryphon product pages have no rulebook link: Defenders of the Realm, The Road to Canterbury, Oltre Mare, Morocco and Goldbräu. No answers were guessed from those pages.
- IELLO downloads and a bounded catalog attempt timed out. Lookout's direct PDF returned 403. These failures do not count as completed source review.
- The current Fresh Fish publisher page describes a substantial revision of the 1997 game. That newer edition was not counted as the older inventory identity without identity review.

Actual application verification and screenshot paths are in the latest `VERIFICATION.md` checkpoint. No public deployment occurred, and no owner-by-owner rule signoff is pending: the remaining source and editorial work belongs to this implementation task.
