# Mixed publishers and Mindclash — 2026-09-23

Ten individually researched edition records were added for nine inventory identities. There are now **351 researched records**, matching **330 of 1,320 inventory identities**, with **990 pending**. Exact editorial approvals total **99**, and **85** portable criteria are eligible for the random mix. The entire-compendium objective remains unfinished.

The owner's standing instruction in “Reload localhost” delegates source checking and editorial approval to Codex. Each addition was approved only after inspecting its cited manual pages. This does not authorize public deployment. Existing research and approvals were preserved.

| Record | Inspected one-based PDF pages | Review decision |
|---|---|---|
| Rococo: Deluxe Edition, English v25, ©2021 | 4, 6, 7, 17, 20 | Latest needle-and-thread user starts the action phase. Simultaneous Employee choice, later Queen Favor and solo exceptions distinguished. Included in the mix. |
| Harmonies, English ©2024 | 1, 2, 3, 6 | Latest magnificent landscape seen. Multiplayer and solo scope distinguished. Included in the mix. |
| Meadow, English first edition ©2021 | 5, 6, 7, 15, 16 | Latest bee sting. Reverse initial hand draft, clockwise play, later round transfer and solo Rover start distinguished. Included in the mix. |
| PARKS, original English edition v1.2 | 1–6 | Latest hike. Camera placement, clockwise player turns, later Trail End reservation and solo scope distinguished. Included in the mix; not labeled as the second edition. |
| Anachrony: Essential Edition, English 2021 | 1, 6, 10, 11, 20, 26, 27 | Standard setup uses latest déjà vu. The optional Starting Asset Draft instead uses lowest card total and its own tie-break. Standard answer included in the mix; variant clearly separated. |
| Astra, English ©2022 | 1, 4, 6, 11, 16 | Latest shooting star seen. First-player token remains with its holder; two-player Dream is separate. Included in the mix. |
| Trickerion: Legends of Illusion, revised English retail ©2019 | 1, 9, 10, 11, 12, 23 | Top-hat criterion starts Magician selection only. Opening Initiative Order is separately randomized and determines the first action. Two-player positions and later Fame ordering retained. Directory only. |
| Septima, English version 20230324 | 1, 6, 7, 12, 14, 20 | Latest mixed-drink maker, without assuming alcohol. Simultaneous card selection precedes clockwise resolution. Reverse setup, seasonal transfer and solo start distinguished. Included in the mix. |
| Perseverance: Castaway Chronicles – Episode 1, English ©2021 | 1, 5, 16 | Latest boat ride in standalone multiplayer. Reverse initial Settlement/Influence placement distinguished. Included in the mix; no campaign or solo claim. |
| Perseverance: Castaway Chronicles – Episode 2, English ©2021 | 1, 6, 18 | Latest nature adventure in standalone multiplayer. Reverse initial Settlement/Camp placement distinguished. Included in the mix; no campaign or solo claim. |

All 50 listed PDF pages were rendered, opened and visually inspected. Several PDFs use two-page spreads; the records also identify the printed-page locations. Complete PDF downloads and their SHA-256 hashes are preserved in the intake files. Preparation rechecked the source hashes before writing drafts; approval was a separate explicit step tied to each exact revision.

Source provenance and decisions:

- Eagle-Gryphon's Rococo Deluxe product page links a public Drive folder. Its actual English Deluxe manual was retrieved through the public viewer/download, resolving the earlier title-matching lead. No private Drive account was used.
- Harmonies uses a primary Libellud/Asmodee CDN manual. The URL was discovered through a secondary lead; the inspected publisher-hosted PDF supplies the factual evidence. We do not claim its resource-page download anchor was read.
- Meadow uses Rebel's base-game manual, not the similarly named Adventure Book supplement. PARKS uses Keymaster's linked original v1.2 manual, not the separately observed second-edition file.
- The five Mindclash game pages were read and their English manual links followed. Septima's complete PDF is 113,488,684 bytes. The initial 70 MB attempt failed; a bounded 120 MB retry succeeded before inspection. The first failure remains in `intake-first-pass.json` and does not count as a passed retrieval.
- Mindclash's [product-line explanation](https://mindclashgames.com/news/the-new-product-line-up/) corroborates that Anachrony Essential Edition repackages the core game. Its optional drafting rule is not substituted for the standard main answer.
- The Perseverance covers identify two standalone episodes in the same box. Two explicit coverage overrides associate the distinct episode answers with inventory identity 256997, counting that identity once. The reviewed ©2021 files are not described as the current product's second edition.
- Trickerion illustrates why a thematic setup criterion cannot automatically enter the random mix: choosing a Magician first does not make that person the first actor.

Evidence and exact wording:

- `research/mixed-publisher-sep23-source-queue.json`, `research/source-files/mixed-publisher-sep23/intake.json` and `research/mixed-publisher-sep23-reviewed-batch.json`
- `research/mindclash-source-queue.json`, `research/source-files/mindclash/discovery.json`, `research/source-files/mindclash/intake.json` and `research/mindclash-reviewed-batch.json`
- `artifacts/mixed-publisher-sep23-review/apply-review.ts` and `artifacts/mindclash-review/apply-review.ts`
- Individual drafts in `research/games/`, approved exact copies in `src/content/games/`, and identity decisions in `research/coverage/identity-overrides.json`

All ten citation URLs returned HTTP 200 in separate availability checks. Two are public document viewers (Rococo and Septima); their separately downloaded PDFs were inspected. Availability is not itself editorial verification. Private manuals and rendered evidence are excluded from the static website.

Unfinished leads remain uncounted: Wombat Rescue and Deep Sea Adventure product pages yielded no manual in this pass; PARKS second edition was observed but not reviewed. No rule was guessed from a product listing or search snippet.

The final build, directory browser matrix, ten live article checks, accessibility checks and retained homepage inspection are recorded in `VERIFICATION.md`. Source work and editorial review remain implementation responsibilities; the owner is not being asked to verify each rule. No public deployment occurred.
