# Six native identities, four starting rules, and large-table Dice Roll — 2026-09-28

This release batch follows the live `e3c92c4` artwork checkpoint. It adds 19 publisher identities from [the SimplyFun review](sep28-simplyfun-19-identity-expansion.md) and six more accepted native-title identities. The directory projects **5,191** game identities; **1,103** have a reviewed starting rule and **4,088** remain pending. Four exact-edition rule records bring the approved rule count from **1,111 to 1,115**. The portable random-rule pool remains **394**: the two new instructions that simply say to choose randomly do not meet that pool's standalone-criterion policy.

## Native-title source decisions

The sealed local `artifacts/sep28-native-next12e-source-packet/` reviewed nine saved Wikidata P2339 leads against complete original-host responses. It accepts **In Extremis**, **Talat**, **Labor Chaos**, **Vejen**, **Quinque**, and **Борщ** as physical game identities. It holds Derby/Jägersro and Hochstapler for unresolved product scope, and 7 ate 9 Multi because its publisher page links a different numeric ID. The packet's `validate.py` passed; its seal SHA-256 is `35c1321f96536d85c8010be0d65c1d380c21ca3507cea2f34347b2f18f46f77c`.

That packet was bound to `c404916`. On this release branch, the five non-publisher catalog inputs still matched its exact baseline bytes after CRLF normalization. The publisher registry preserved all 35 baseline records and appended the separately reviewed 19 SimplyFun records. None of the six new native names collided with those appended products. The verified postimage changed only `wikidata-native-title-decisions.json`; the full content validator then accepted the merged registry at **5,191** identities. No starting rule or edition equivalence was inferred from these identity sources.

## Exact-edition rules

Four rules came from full original-publisher English manuals, retained with byte hashes, page renders, and source locators in the sealed local `artifacts/pending-rules-followup-sep28l/` packet. The source-packet seal is `e286192b7bc3146cf61620ed070cb21c82be3c1dffdf8b41d84de845338eb1c1`; the schema-valid draft addendum seal is `edd3ed0de319c090ca8ae7ec0d6cb33331f36a56b048370ed1e6875e7e012fec`. Each approved record cites its own manual and binds the PDF hash in its internal evidence.

| Game and edition | Reviewed opening instruction | Source |
| --- | --- | --- |
| Ticket to Ride: Nordic Countries, Days of Wonder standalone | Most experienced traveler, then clockwise | [English rulebook](https://cdn.svc.asmodee.net/staging-daysofwonder/uploads/2024/07/7208-T2RNC-Rules-EN.pdf), PDF p. 2 |
| Ethnos, CMON original 2017 edition | Random player for the First Age; later Ages differ | [Original rulebook](https://www.cmon.com/wp-content/uploads/2023/06/Rulebook_Ethnos.pdf), pp. 5–6 |
| Fort, Leder Games 2020 base | Random starting player and seating order | [Base rulebook](https://cdn.shopify.com/s/files/1/0106/0162/7706/files/Fort_Final_Rulebook_web_Oct_15_2020.pdf?v=1603136739), pp. 2 and 6 |
| Cacao, ABACUSSPIELE item 04151 base | Oldest player, then clockwise | [English rulebook](https://abacusspiele.de/wp-content/uploads/2021/01/Cacao_Regel_GB.pdf), p. 3 |

Project L stays on hold because its linked combined booklet and product page list different player-mat counts. Three apparent targets were already covered and were not duplicated.

## Dice Roll at large tables

Groups of 13–24 now render one painted face and one short 2D toss per die. Groups of 12 or fewer retain the original six-face 3D dice. At 24 players, the scene keeps 48 dice and every labeled result while reducing descendant elements **1,752 → 168** and SVG pip circles **1,008 → 0**. The synthetic Chromium 390 px / 4× CPU benchmark averaged **96 → 137 frames** in the three-second draw window over eight original and eight compact runs. Machine load varied between batches, so this is comparative local evidence rather than a device or field-performance prediction. The method and raw runs are in ignored `artifacts/dice-perf/`.

Twelve focused browser cases passed in Chromium, Firefox, and WebKit, including 24 players at 320 px with normal motion and 390 px with reduced motion. They checked all seats, locked winner, animation completion before announcement, decorative accessibility, and no horizontal overflow. Content validation, lint, Astro check, and the corrected 31 native-content unit cases passed on the merged branch. Full release gates and live verification are recorded at deployment.
