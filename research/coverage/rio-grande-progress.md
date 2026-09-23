# Rio Grande and Niagara research — 2026-09-23 UTC

Nine new inventory identities now have researched drafts: eight from Rio Grande Games' primary PDFs and Niagara from Zoch's linked manual. Each starting instruction was inspected on rendered pages, with the edition, one-based PDF location, retrieval hash and actual check date recorded. No content was approved or published.

| Game | PDF pages | Result and relevant context |
|---|---|---|
| Tobago | 2 (printed 2) | Most recent island visitor; clockwise turns |
| Hooky | 3 | Most recently in a classroom; random selection is also explicitly allowed |
| Beyond the Sun | 25–26 | Most recent space traveler; official random tie-break on appended setup sheet |
| Trans-Siberian Railroad | 2, 4, 5 | Recent Russia visitor starts opening auction, unless another method is agreed; last initial-auction buyer starts Phase 1 |
| Butterfly | 1 | Best real hedgehog impression; any method allowed if undecidable; right neighbor's setup placement is not the first turn |
| Hamburgum | 8 (printed 6) | Most recent church visitor |
| Chateau Roquefort | 1, panels 2 and 4 | Group chooses by any preferred method; visible 2022 copyright, despite the older URL directory |
| Zooloretto | 3 (printed 2) | Players agree on a starter in the publisher's Zooloretto2024 file |
| Niagara | 9–11 | Most afraid of water; simultaneous card choice precedes the starter's reveal |

`scripts/research-rio-grande.py` queried the publisher's public WordPress games catalog: 172 products across two pages, with nine exact normalized inventory matches. Eight linked manuals were retrieved; Niagara's Rio Grande page had no linked PDF. The separate Zoch product page linked the multilingual Niagara manual, whose English section was inspected. Beyond the Sun's current product link led to a 24-page main rulebook without setup; primary-source search found the publisher-hosted 26-page combined file. Both sides of its appended setup sheet were inspected.

Machine intake stays in ignored `research/source-files/rio-grande/`. The manually written inputs are `research/rio-grande-batch.json` and `research/zoch-niagara-batch.json`. `scripts/prepare-source-batch.py` checks the source hash and page bounds and refuses existing-file overwrites. An initial intake contained an unavailable-file record without `localFile`; the preparer now skips those records when finding the explicitly selected file. It also avoids a contradictory “no tie-break” note when the input supplies an official tie-break. No existing editorial approvals were modified.

At this batch's checkpoint there were 126 researched records, covering 112 of 1,320 inventory identities. The remaining 1,208 identities still required primary-source research. This is a historical batch checkpoint, not a claim of complete coverage.
