# Wikidata identity review — bounded batch

Reviewed on 2026-09-26 against the existing snapshot. This is identity research; no starting rule is approved by these files.

## Results

- 52 leads reviewed: 33 new flagged leads, all 12 unflagged original-name collisions, and 7 already-enrolled classics.
- 23 accepted identities: 16 newly eligible held leads and 7 existing classic confirmations.
- 29 leads remain held; no IDs are rejected from further research.

Decisions, reasons, snapshot flags, original collision IDs, item revisions and primary-source references are in `wikidata-identity-review.json`. Filtered CC0 item facts are in `wikidata-identity-facts.json`. The raw snapshot is unchanged.

## Newly eligible discovery identities

| BGG ID | Wikidata item | Qualified display name |
| --- | --- | --- |
| 3 | Q4994200 | Samurai (Reiner Knizia) |
| 121 | Q389078 | Dune (Avalon Hill, 1979) |
| 2397 | Q11411 | Backgammon |
| 12005 | Q1544528 | Around the World in 80 Days (Michael Rieneck, 2004) |
| 20551 | Q2279754 | Shogun (Dirk Henn, 2006) |
| 23033 | Q1749762 | Push (Steffen Mühlhäuser, 2001) |
| 58281 | Q101598916 | Summoner Wars (first edition, 2009) |
| 102680 | Q22662590 | Trajan (Stefan Feld, 2011) |
| 173090 | Q28842705 | The Game (Steffen Benndorf, 2015) |
| 174430 | Q36816341 | Gloomhaven (first edition, 2017) |
| 192457 | Q105846573 | Cry Havoc (Portal Games, 2016) |
| 211716 | Q122238495 | John Company (first edition, 2017) |
| 236191 | Q96359290 | London: Second Edition (2017) |
| 283355 | Q124838447 | Dune (Gale Force Nine, 2019) |
| 332686 | Q122238495 | John Company: Second Edition |
| 332800 | Q112957982 | Summoner Wars: Second Edition (2021) |

## Classic confirmations

Chess (171), Go (188), Shogi (2065), Checkers (2083), Mahjong (2093), Xiangqi (2393) and Cribbage (2398) were already enrolled by the unflagged import. Their identity review adds primary corroboration. Future rules must name the relevant variant, especially for Checkers and Mahjong.

Backgammon (2397) selects canonical item Q11411. Its secondary Tavli mapping Q968853 does not justify sharing a starting rule across variants. Ludo/Pachisi/Chopat (2136), tafl/fidchell (2932), and the ambiguous Liars Dice leads (45 and 184502) remain held.

## Edition distinctions

- John Company has explicit P2339 edition qualifiers: 211716 is edition 1; 332686 is edition 2. The designer/publisher independently distinguishes the editions.
- Dune has separate Wikidata items and primary designer history for the 1979 Avalon Hill and 2019 Gale Force Nine releases.
- Summoner Wars has separate 2009 and 2021 items. Plaid Hat explicitly identifies the second edition and says the editions are incompatible.
- Gloomhaven 174430 is the original 2017 game. Cephalofair separately describes the redesigned second edition; this review does not relabel original inventory 390478.
- London 236191 is explicitly Second Edition in Wikidata and Osprey sources. The older 65781 lead stays held pending primary evidence for its original publication.

## Held examples and limits

Cosmic Encounter, Twilight Imperium, Formula D and Santorini attach multiple unqualified IDs to one item. Item-wide publisher and publication-year statements do not bind an individual ID to an edition. They remain held.

The Cat in the Box 2022 item and Bezier Deluxe-edition article make it a strong lead, but the inspected source did not independently bind ID 345972. The older Piepmatz, Lotus, Pyramis, Paydirt, Liftoff, Speculation, Container and Bomb Squad collisions also stay held until primary identity evidence is available.

The Samurai 63 item contains numeric rating/shop-looking description text. That description was omitted from the saved audit and was not used as identity evidence.

No BoardGameGeek API, dump, bulk export or page content was fetched. Identifiers are Wikidata CC0 facts, with additional primary-source corroboration. The Pandasaurus publisher page links directly to The Game 173090; only that publisher hyperlink was inspected.

## Validation

Validated 52 unique decisions against the raw snapshot: every ID, QID, label, flag set and item set matches; every inspected item retains the reviewed P2339 value; every acceptance has a registered primary source; all 12 normalized original-name collisions are covered. Counts reconcile to 23 accept / 29 hold. SHA-256 comparison after Git checkout newline normalization and git diff both confirm that the raw snapshot is unchanged from commit 85150da.
