# Core-game editorial review — 2026-09-23 UTC

Thirteen existing research drafts completed source review under the owner's standing authorization. Their exact approved revisions are added to `src/content/games/`; original research copies remain unchanged. Cascadia and Splendor are included in the separate random-rule allowlist. No public deployment is authorized by this review.

The approved catalog increases from 179 to **192** records and the random mix from 143 to **145** criteria. Research coverage remains **417** records, covering **396 of 1,320** inventory identities, with **924** awaiting research. The full compendium remains unfinished.

| Game | Rendered PDF pages inspected again | Decision |
|---|---|---|
| 7 Wonders | 4, 8 | Simultaneous selection/play; learning-game suggestion supplies no named starter. Catalog only. |
| Cascadia | 2–5 | Wildlife observation or official random alternative. Components explicitly name bear, elk, salmon, hawk and fox; approved answer now names all five. Include in mix. |
| CATAN | 4, 12–13, 15 | Oldest for beginner setup; highest two-dice roll for variable setup, reverse second settlement placement, then the same starter opens regular play. Catalog only. |
| Codenames | 2, 4, 7–8 | Key triangles assign the starting team; its spymaster gives the first clue. The example color is not a universal rule. Catalog only. |
| Dixit | 1–2 | First player with a clue becomes storyteller. Eight voting dials and 2021 credits distinguish this refresh. Catalog only. |
| Dominion | 4, 16 | Random fresh game; previous untied winner goes last in a rematch. 2021 document revision, not URL's 2016 directory. Catalog only. |
| Kingdomino | 2–4 | Blind king placement is setup; the king on the lowest numbered domino determines the first regular turn. Catalog only. |
| Pandemic | 3, 8 | Largest individual City-card population in opening hands. Neither total population nor a player's residence. Catalog only. |
| Splendor | 1–2 | Youngest player receives marker and starts clockwise; smaller player counts preserve step 5. 2024 copyright. Include in mix. |
| The Crew: The Quest for Planet Nine | 8, 10, 22 | Four-rocket holder commands, selects first task and leads first trick, including task-free missions. Standard 3–5 players. Catalog only. |
| Tiny Towns | 2–4, 6–8 | Construction recency assigns first resource caller; placement/construction simultaneous. Approved answer clarifies this and uses visible 2019 copyright. Town Hall and solo differ. Catalog only. |
| UNO | 1 plus enlarged English panel | 112-card 2017 sheet, highest draw deals, dealer's left normally starts, all opening action-card exceptions checked. Catalog only. |
| Wingspan | Live official Rulepop, Settings and Setup → Player | Base game only, Standard 2–5 players, Human. Visible instruction requires random selection. Catalog only. |

All 35 listed PDF page renders were opened and inspected. Twelve freshly downloaded publisher PDFs matched the hashes of the previously cached source files. `research/source-files/core-games-review/intake.json` records their URLs, retrieval time and SHA-256 hashes. The original discovery provenance in each draft is preserved; the new queue uses the already established direct publisher URLs.

Wingspan's current official reference was opened in a fresh browser with expansions disabled. `wingspan-review.json` records its settings, selected Player view, retrieval time and HTML hash; `wingspan-player.txt` contains the visible setup text. Settings and the scrolled token instruction were visually inspected. An initial screenshot clipped the modal's last instruction; the helper was corrected to scroll to it and assert its exact visible text. A locator attempt matched hidden variant content incorrectly and timed out; the corrected visible-paragraph assertion passed at 12:18 UTC. These were research-helper issues, not failures of the local application.

`research/core-games-reviewed-batch.json` records the individual pool decisions. `artifacts/core-games-review/apply-review.ts` checks source hashes, preserves draft copies, refuses existing-file overwrites, records the real reviewer and owner-authorization date, and fingerprints each approved revision. The local source PDFs, HTML and renders are evidence only and must not be deployed. Application verification follows in `VERIFICATION.md`.
