# Smithsonian and NYPL CC0 identity pilot — 2026-09-28

This bounded pilot reviewed **50 Smithsonian search hits** and the **28 NYPL
item rows** selected below. It accepted **zero** new identities and **zero**
starting-player rules. The machine-readable [review file](sep28-museum-cc0-pilot.json)
records every selected record, source URL, decision, reason and exact-title
collision result. The project's comparison set was the 5,244 identities at
`c08f778e` plus the two accepted identities (`Above and Below` and `Escape the
Dark Castle (First Edition)`) in the separate `522165e2` worktree, totaling
the **5,246** reported for this task. That second commit has not been merged
into this worktree. The comparison script reconstructs the active inventory
from the discovery list, accepted Wikidata decisions, accepted native-title
decisions, and accepted publisher records, then adds those two sibling records.
The normalized-name check also includes publisher search aliases and all title
options attached to accepted native identities as a conservative alias guard.

## Smithsonian: 50 official API hits

The [Smithsonian Open Access API](https://www.si.edu/openaccess) was called with
this fixed first-window request, using its public demo key:

`https://api.si.edu/openaccess/api/v1.0/search?q=board%20game&rows=50&start=0&api_key=DEMO_KEY`

It reported **860** broad query matches and returned 50 records. The saved
response is ignored at `artifacts/coverage-research/smithsonian-board-game-50.json`
(180,503 bytes; SHA-256
`76cf4b22b44e6374cdf1fad240c024a95617818fb759513e9eca143181904ce7`).
The [Smithsonian data repository](https://github.com/Smithsonian/OpenAccess)
is CC0; individual images have their own media access flags. No images were
copied or used as identity evidence.

Of the 50, **28 were excluded** as books, articles, other publications, an
exhibition, or a jigsaw puzzle that the broad search matched. **22 were held**:

| Hold group | Records | Reason |
| --- | ---: | --- |
| Named physical game objects | 13 | Museum metadata gives a title, and sometimes a maker or date, but no inspected original box imprint, exact product identifier, or original publisher rulebook in these API records. Examples include [Pot Luck](https://api.si.edu/openaccess/api/v1.0/content/edanmdm:nmah_2045653?api_key=DEMO_KEY), [Intel “In The Chips”](https://api.si.edu/openaccess/api/v1.0/content/edanmdm:nmah_1344260?api_key=DEMO_KEY), [Columbus!](https://api.si.edu/openaccess/api/v1.0/content/edanmdm:nmah_1313939?api_key=DEMO_KEY), and [The Telephone Game](https://api.si.edu/openaccess/api/v1.0/content/edanmdm:nmah_1213645?api_key=DEMO_KEY). |
| Generic or variant-unclear objects | 7 | Titles such as “board game” and the two 1964–65 World's Fair objects cannot safely name a distinct retail product. Electric football lacks a specific edition. |
| Traditional/cultural boards | 2 | A gaming board or Pa-Tok board with counters documents a physical game object, but not a manufacturer-issued product identity. |

The 13 named objects include a [Trivial Pursuit Genius Edition](https://api.si.edu/openaccess/api/v1.0/content/edanmdm:nmah_748921?api_key=DEMO_KEY): the exact title is absent from the comparison pool, but the broader **Trivial Pursuit** identity is present, so edition correspondence must be established before a separate listing. The “Pot Luck” museum record has unusually helpful maker and print-run notes, yet those curatorial notes still do not supply an inspected publisher-authored artifact or starting-player rule. Exact normalized-title collisions were **zero**; that does not resolve franchise, reprint, or variant collisions.
All 13 named-object API rows lacked `online_media`, so there was no original box or manual image in this result window to inspect.

## NYPL: archived public-domain item data

The [official NYPL public-domain release](https://github.com/NYPL-publicdomain/data-and-utilities)
is CC0. Its two archived item CSV files contain **190,494** rows. The API for
current data requires an access token, so this pilot used the openly published
2015 snapshot without creating an account. Source files were downloaded from:

- `https://raw.githubusercontent.com/NYPL-publicdomain/data-and-utilities/master/items/pd_items_1.csv` — 75,643,444 bytes; SHA-256 `7b58984d467cc760eb5a772d6c3c89e431aee9b990a298f948b348151ccc074a`.
- `https://raw.githubusercontent.com/NYPL-publicdomain/data-and-utilities/master/items/pd_items_2.csv` — 71,470,967 bytes; SHA-256 `fc222e027322c66c50b83058a1930257b56821bc290ac4e3f8e0c469db08c9da`.
- `https://raw.githubusercontent.com/NYPL-publicdomain/data-and-utilities/master/collections/pd_collections.csv` — 628,632 bytes; SHA-256 `578c09d19393055cd8b40d8bd4f1754eabb65bd3ea3ecf3b038e6ea5358f490c`.

The deterministic screen selected item rows whose title or topical subject
contains “board game,” “card game,” “dice game,” or “tile game” (**25 rows**),
plus the three items in the one `Board games` genre collection (**3 rows**).
All 25 phrase hits were depictions or other nonproducts (images and sheet
music). The three held items are **one game collection**, not three games:
the [1811 *Road to the Temple of Honour and Fame* collection](https://digitalcollections.nypl.org/collections/9a304ec0-6281-0130-61d8-58d385a7bbd0)
catalogs a [board](https://digitalcollections.nypl.org/items/43b3ef90-6282-0130-a63f-58d385a7bbd0),
[rules booklet](https://digitalcollections.nypl.org/items/70355b00-74a7-0130-b7e9-58d385a7bbd0),
and [cover](https://digitalcollections.nypl.org/items/4e1055b0-74a7-0130-1d05-58d385a7bbd0).
The collection attributes the 1811 London issue to J. Harris. It is a strong
historical lead, but the original imprint and rule/version match have not been
read from the scans. The item title “Game board” is not the game title; using it
as a directory identity would be wrong. Exact normalized-title collisions were
zero, including the collection title.

## Decision and reproduction

No museum metadata was mislabeled as a `primary-publisher` source. The current
[`publisherIdentitySchema`](../../src/lib/content/identity-registry.ts)
requires a primary publisher source and a bound accepted revision. The
Smithsonian API records are primary *museum object* evidence; the NYPL
collection is a primary *holding* record with digitized original artifacts.
Publisher-authored imprints or rules need to be inspected before any of these
leads can be accepted under the present standard. No evidence here supports a
starting-player rule or transferring a rule between editions.

After downloading the four files to ignored `artifacts/coverage-research/`, run:

```powershell
python scripts/prepare-museum-cc0-pilot.py --validate
```

The script verifies all four source hashes, the exact Smithsonian 50-record
window, the NYPL 190,494-row scan, the 28 selected NYPL rows, the three-item
collection grouping, and the committed review decisions. It emits only compact
CC0 metadata and decision codes; raw source responses remain ignored. The
next useful pass is a museum *media-present* slice, where a readable original
box or instruction sheet might actually establish a publisher product. The
NYPL 2015 snapshot's yield does not justify bulk identity import.
