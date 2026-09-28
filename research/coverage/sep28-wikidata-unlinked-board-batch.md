# Wikidata board-game items without external IDs — 2026-09-28

The official [Wikidata Query Service](https://query.wikidata.org/) returned **841** items directly typed as board games (`P31 = Q131436`) without `P2339`. The committed [snapshot](wikidata-unlinked-board-games.json) stores the complete query, UTC retrieval time, all QIDs, 598 available English labels, the raw-response SHA-256 and an order-independent statement SHA-256. It is CC0 discovery data. The importer writes fixed LF bytes and normalizes registry-input line endings for reproducible hashes across Windows and Linux; `--validate` needs no network request. The query does not include subclasses or the separately counted card, dice and tile classes.

The snapshot also records collisions against the runtime's documented identity sources: the original inventory, accepted English-label P2339 import, accepted native-title decisions, accepted publisher identities, their alternate search names and documented Wikidata items. At this checkpoint, 6 QIDs and 47 normalized titles match an enrolled identity. The two accepted identities below are included in those post-batch counts. A title match is a review flag; it is not an edition correspondence. Source-input hashes make this projection auditable after later registry updates.

## Bounded primary review

Ten leads were reviewed; the [decision file](wikidata-unlinked-board-review.json) binds them to the exact snapshot bytes and records source response hashes and locators. Two distinct physical products passed primary publisher review and entered the directory with **no starting-player rule attached**:

| QID | New directory identity | Primary product evidence |
| --- | --- | --- |
| Q137785419 | Above and Below | [Red Raven store](https://red-raven-board-games.myshopify.com/products/above-and-below) and [creator game page](https://www.redravengames.com/above-and-below/) |
| Q137756823 | Escape the Dark Castle (First Edition) | [Themeborne First Edition product](https://themeborne.com/products/escape-the-dark-castle) |

The second identity is expressly limited to Themeborne's First Edition physical base game. The generic Wikidata item supplies a discovery title and board-game class; it does not prove an edition mapping. Neither accepted identity claims a BGG number, publication year, translated title, other printing or starting-player answer. The complete publisher HTML and revisioned Wikidata entity responses were saved in ignored `artifacts/wikidata-unlinked-sep28/`; the committed identity records contain exact URLs, hashes, byte counts and response locators.

Eight leads remain held:

| Lead | Reason |
| --- | --- |
| Earth (Q124639487) | Already enrolled as `bgg-350184`; [Inside Up Games](https://insideupgames.com/product/earth-board-game/) corroborates the physical base product, not a new identity. |
| Codenames Duet (Q140619898) | Already enrolled as `bgg-224037`; [CGE](https://www.czechgames.com/games/codenames-duet-2017) confirms its standalone physical product. |
| CATAN Historical Scenarios I (Q5051420) | [CATAN](https://www.catan.com/explore-catan/ludography/1996-2000) says the base game is required. |
| 51st State (Q105972367) | Original, Master Set and Ultimate Edition are already enrolled. [Portal](https://en.portalgames.pl/buy-51st-state-master-set/) identifies Master Set as a rebalanced later product, so the unqualified item cannot add or merge an edition. |
| Agemonia (Q135739747) | The publisher product request returned a client challenge; its exact physical printing was not reviewable from the saved response. |
| Fallout: The Board Game (Q117455357) | The Fantasy Flight product request failed or redirected to a generic page; no complete focal product body was saved. |
| Checkers Plus (Q136868608) | The revisioned Wikidata item describes a digital game and includes platform data; no physical publisher product was verified. |
| Gods of Rome (Q140478682) | The revisioned Wikidata item describes a Gameloft video game; its direct board-game type appears mismatched to this directory. |

The other 831 snapshot items are unreviewed. Some have no English label; others may be variants, expansions, historical abstract games, digital products or physical games. No conclusion about them is inferred from their Wikidata class alone. No BoardGameGeek API, CSV, site page or scraping was used.

## Coverage and verification

The two accepted identities appear once each in the built `board-games/search.json`, with `ruleCount: 0` and exact publisher reference links. The built A and E browse pages each contain their respective title once. A full runtime-name and search-alias cross-check found **zero missed exact collisions** across 5,246 identities after rebasing onto the verified animation release. The review and source hashes are covered by a unit test; the importer independently validates QID uniqueness, ordering, counts and canonical statement hash. The combined `npm run verify` gate passed under pinned Node 22.23.2 (Astro diagnostics, lint, 235 unit tests, 1,323-page build and audits), as did `npm run test:release`. Focused browser coverage passed all 54 Chromium, Firefox and WebKit cases for directory startup, search journeys and the two new identities at 320 and 1280 pixels, including pending filters and publisher links. The production marker and live directory must be checked against the final release commit.
