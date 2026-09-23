# ThunderGryph and Sinister Fish — 2026-09-23

Twelve individually researched records were added for twelve inventory identities. There are now **363 researched records**, matching **342 of 1,320 inventory identities**, with **978 pending**. Exact editorial approvals total **111**; **96** portable criteria are eligible for the random mix. The full-compendium objective remains unfinished.

The owner's standing instruction in “Reload localhost” delegates source checking and editorial approval to Codex. Each addition was approved after inspecting its cited manual pages. This does not authorize public deployment. Existing records and approvals were preserved.

| Record | Inspected one-based PDF pages | Review decision |
|---|---|---|
| Tang Garden, English retail ©2019 | 1, 2, 3, 9, 10, 12 | Latest China visitor, with official random selection if nobody has visited. Engineer token, clockwise turns and separate solo variant preserved. Included in the mix. |
| Iwari, English retail ©2022 | 1, 3, 4, 5, 6, 7, 8 | Latest traveler. Optional reverse initial hand draft does not replace first gameplay turn. Shared third tribe in two-player play distinguished. Included in the mix. |
| Golems, English Matchbox base ©2022 | 1, 2 | Latest snowman builder in two-player play. Human acts before the Automa receives remaining cards in solo mode. Distinct from Golem. Included in the mix. |
| Space Lunch, English Matchbox base ©2022 | 1, 2 | Latest restaurant meal in two-player play. Human starts solo mode. Included in the mix. |
| Rebis, English Matchbox base ©2022 | 1, 2 | Latest unusually tasting drink; no alcohol requirement inferred. Clockwise and solo scope distinguished. Included in the mix. |
| Spirits of the Forest, English base ©2018 | 1, 3, 4, 8, 9, 11 | Latest forest hike, preserving the forest qualification. First-turn single-tile restriction and solo assignment order retained. Included in the mix. |
| Cat-a-comb, English Soda Pop base ©2023 | 1, 2 | Latest cat-comber places neutral cats; their opponent takes the first actual turn. Directory only: this opponent relationship does not generalize to larger groups. |
| Forgenesis, English Soda Pop base ©2023 | 1, 2 | Latest crafted item. The same person starts setup placement and actual gameplay after both placements. Included in the mix. |
| Tuned, English section of multilingual manual ©2022 | 1, 3, 4, 5, 24 | Latest concert attended. Rooster placement and alternating play distinguished from the older-Rooster story text. Included in the mix. |
| Villagers, English revised file ©2019 | 1, 4, 5, 8, 11, 12, 18, 22, 23, 27 | Longest residence in the same place selects the first drafter. Clockwise draft, sequential building, later card passing, two-player road update and Countess mode distinguished. Included in the mix. |
| Streets, English base ©2021 | 1, 5, 6, 15, 16, 24 | Most “hipster cred”; no metric invented. Clockwise play and solo human-before-Grifter sequence preserved. Included in the mix with explicit subjective interpretation. |
| Moon, English v1.0 ©2023 | 1, 4, 7, 8, 9, 18, 22, 23, 24, 33 | Loudest voice selects the first Construction turn after Production. Sequential turn order, hand passing, two-player starter retention and solo exception preserved. Included in the mix. |

All **60 listed PDF pages** were rendered, opened and visually inspected: 34 ThunderGryph pages and 26 Sinister Fish pages. Complete downloads and SHA-256 hashes are preserved in the intake files. The preparation script rechecked those hashes before creating drafts; editorial approval was a separate exact-revision step.

Publisher provenance:

- ThunderGryph's current product HTML supplied direct English PDF links. The general rulebooks index also linked Dropbox folders, but those folders were not needed for this batch. © dates came from inspected manuals, not hosting-directory years.
- Golems, Space Lunch, Rebis, Cat-a-comb and Forgenesis use two-page foldouts; both pages of each were inspected. Tuned's English section was distinguished from the remaining languages.
- The Iwari retail-named file contains setup for two through five players; its contents were not overridden with the product listing's different player-count display. Its separate solo supplement remains outside this record.
- Sinister Fish's actual product links supplied the three base manuals. Villagers' text extractor duplicated setup step 6 onto page 5, while the visible instruction is on page 4. The source reference uses the visually confirmed location.
- Moon's product page identifies English v1.0. Its pick-and-pass mechanism still uses sequential Construction turns; the earlier Production step is not misrepresented as an individual opening action. Rover comparisons resolve Flag Rewards, not the starter.

Evidence:

- `research/thundergryph-source-queue.json`, `research/source-files/thundergryph/discovery.json`, `research/source-files/thundergryph/intake.json`, and `research/thundergryph-reviewed-batch.json`
- `research/sinister-fish-source-queue.json`, `research/source-files/sinister-weird-city/discovery.json`, `research/source-files/sinister-fish/intake.json`, and `research/sinister-fish-reviewed-batch.json`
- Both publishers' `rendered/render-plan.json` files enumerate inspected pages.
- `artifacts/thundergryph-review/apply-review.ts` and `artifacts/sinister-fish-review/apply-review.ts`
- Original drafts in `research/games/`, approved exact copies in `src/content/games/`, and the separate revision-bound random-rule allowlist.

All twelve cited PDF URLs returned HTTP 200 at 09:09 UTC in a separate availability check. Availability is not itself factual approval. Private manuals, rendered evidence and the research inventory are excluded from static output.

Held, uncounted discovery leads: Fowers' Burgle Bros product did not yield a primary manual; Weird City Canopy and Leaf product HTML did not expose a direct rulebook in this pass. Secondary Leaf discussion and retailer/manual leads were not used to approve a rule. No answer was guessed from a listing or search snippet.

The final build, nine directory checks across three browsers, twelve live article checks, accessibility checks, and retained homepage inspection are recorded in `VERIFICATION.md`. The first live-article run encountered an execution context destroyed during navigation; the fresh retry passed, and the cause was not established. That failed attempt is not represented as a pass. No application UI source changed during this content batch, and no deployment occurred.
